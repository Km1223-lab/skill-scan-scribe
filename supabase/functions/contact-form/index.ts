import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
  service: z.string().trim().max(100, "Service must be less than 100 characters").optional(),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be less than 5000 characters")
})

// HTML escape function to prevent XSS in emails
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Rate limiting function
async function checkRateLimit(supabase: any, identifier: string, endpoint: string, limit: number, windowMinutes: number): Promise<{ allowed: boolean; retryAfter?: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
  
  const { data: existing, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Rate limit check error:', error)
    return { allowed: true } // Fail open on errors
  }

  if (!existing) {
    // First request in window
    await supabase.from('rate_limits').insert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString()
    })
    return { allowed: true }
  }

  if (existing.request_count >= limit) {
    const retryAfter = Math.ceil((new Date(existing.window_start).getTime() + windowMinutes * 60 * 1000 - Date.now()) / 1000)
    return { allowed: false, retryAfter }
  }

  // Increment counter
  await supabase
    .from('rate_limits')
    .update({ request_count: existing.request_count + 1 })
    .eq('id', existing.id)

  return { allowed: true }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    
    // Check rate limit: 5 requests per hour
    const rateLimitCheck = await checkRateLimit(supabase, ip, 'contact-form', 5, 60)
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': rateLimitCheck.retryAfter?.toString() || '3600'
          } 
        }
      )
    }

    const body = await req.json()

    // Validate input
    const validation = contactFormSchema.safeParse(body)
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: validation.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { name, email, phone, service, message } = validation.data

    // Store contact message in database
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        service: service || null,
        message,
        status: 'unread'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store message' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email notification using Resend with sanitized content
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const emailData = {
        from: 'KG Designs <noreply@kgdesigns.co.ke>',
        to: ['mrkg848@gmail.com'],
        subject: `New Contact Form Submission from ${escapeHtml(name)}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
          <p><strong>Service:</strong> ${escapeHtml(service || 'Not specified')}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message)}</p>
          <hr>
          <p>This message was sent through the KG Designs contact form.</p>
        `
      }

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        })

        if (!emailResponse.ok) {
          console.error('Email sending failed:', await emailResponse.text())
        }
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact form submitted successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in contact-form:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})