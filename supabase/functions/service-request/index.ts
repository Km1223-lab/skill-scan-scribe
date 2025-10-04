import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const serviceRequestSchema = z.object({
  clientName: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  clientEmail: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  clientPhone: z.string().trim().min(1, "Phone is required").max(20, "Phone must be less than 20 characters"),
  serviceCategory: z.string().trim().min(1, "Service category is required").max(50, "Category must be less than 50 characters"),
  serviceType: z.string().trim().min(1, "Service type is required").max(50, "Service type must be less than 50 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  urgency: z.enum(['normal', 'urgent']).optional().default('normal')
})

// HTML escape function
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

  if (error && error.code !== 'PGRST116') {
    console.error('Rate limit check error:', error)
    return { allowed: true }
  }

  if (!existing) {
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
    
    // Check rate limit: 3 requests per hour
    const rateLimitCheck = await checkRateLimit(supabase, ip, 'service-request', 3, 60)
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
    const validation = serviceRequestSchema.safeParse(body)
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

    const { clientName, clientEmail, clientPhone, serviceCategory, serviceType, description, urgency } = validation.data

    // Define service pricing and duration estimates
    const serviceInfo: Record<string, Record<string, { cost: number; days: number }>> = {
      'e-citizen': {
        'birth-certificate': { cost: 500, days: 5 },
        'national-id': { cost: 300, days: 7 },
        'passport': { cost: 1000, days: 14 },
        'business-registration': { cost: 2000, days: 3 },
        'police-clearance': { cost: 800, days: 10 },
        'marriage-certificate': { cost: 600, days: 5 }
      },
      'visa': {
        'tourist': { cost: 5000, days: 21 },
        'business': { cost: 7000, days: 21 },
        'student': { cost: 10000, days: 30 },
        'work-permit': { cost: 15000, days: 45 },
        'transit': { cost: 3000, days: 14 },
        'family': { cost: 8000, days: 30 }
      },
      'design': {
        'logo': { cost: 3000, days: 5 },
        'business-cards': { cost: 1500, days: 3 },
        'flyers': { cost: 2000, days: 4 },
        'social-media': { cost: 1000, days: 2 },
        'brochures': { cost: 5000, days: 7 },
        'website-graphics': { cost: 2500, days: 5 }
      },
      'branding': {
        'brand-strategy': { cost: 15000, days: 14 },
        'brand-identity': { cost: 10000, days: 10 },
        'market-research': { cost: 8000, days: 7 },
        'consultation': { cost: 5000, days: 2 },
        'brand-guidelines': { cost: 7000, days: 5 },
        'marketing-strategy': { cost: 12000, days: 10 }
      }
    }

    // Get estimated cost and completion date
    const service = serviceInfo[serviceCategory]?.[serviceType]
    const estimatedCost = service?.cost || null
    const estimatedDays = service?.days || 7
    const estimatedCompletionDate = new Date()
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays)

    // Store service request in database
    const { data, error: dbError } = await supabase
      .from('service_requests')
      .insert({
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        service_category: serviceCategory,
        service_type: serviceType,
        description,
        priority: urgency === 'urgent' ? 'high' : 'normal',
        estimated_cost: estimatedCost,
        estimated_completion_date: estimatedCompletionDate.toISOString().split('T')[0]
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to create service request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send confirmation emails with sanitized content
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const clientEmailData = {
        from: 'KG Designs <noreply@kgdesigns.co.ke>',
        to: [clientEmail],
        subject: 'Service Request Confirmation - KG Designs',
        html: `
          <h2>Service Request Confirmation</h2>
          <p>Dear ${escapeHtml(clientName)},</p>
          <p>Thank you for choosing KG Designs. We have received your service request and will begin processing immediately.</p>
          
          <h3>Request Details:</h3>
          <p><strong>Service:</strong> ${escapeHtml(serviceCategory.toUpperCase())} - ${escapeHtml(serviceType)}</p>
          <p><strong>Description:</strong> ${escapeHtml(description)}</p>
          <p><strong>Request ID:</strong> ${data.id}</p>
          ${estimatedCost ? `<p><strong>Estimated Cost:</strong> KSh ${estimatedCost.toLocaleString()}</p>` : ''}
          <p><strong>Estimated Completion:</strong> ${estimatedCompletionDate.toLocaleDateString()}</p>
          
          <h3>Next Steps:</h3>
          <p>Our team will contact you within 2 hours to discuss the details and any required documents.</p>
          
          <p>For any inquiries about your request, please contact us at:</p>
          <p>📞 +254748166300</p>
          <p>📧 mrkg848@gmail.com</p>
          
          <p>Best regards,<br>KG Designs Team</p>
        `
      }

      const adminEmailData = {
        from: 'KG Designs <noreply@kgdesigns.co.ke>',
        to: ['mrkg848@gmail.com'],
        subject: `New Service Request: ${escapeHtml(serviceCategory)} - ${escapeHtml(serviceType)}`,
        html: `
          <h2>New Service Request</h2>
          <p><strong>Client:</strong> ${escapeHtml(clientName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(clientEmail)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(clientPhone)}</p>
          <p><strong>Service:</strong> ${escapeHtml(serviceCategory.toUpperCase())} - ${escapeHtml(serviceType)}</p>
          <p><strong>Priority:</strong> ${urgency === 'urgent' ? 'HIGH' : 'NORMAL'}</p>
          
          <h3>Description:</h3>
          <p>${escapeHtml(description)}</p>
          
          <h3>Estimates:</h3>
          ${estimatedCost ? `<p><strong>Cost:</strong> KSh ${estimatedCost.toLocaleString()}</p>` : ''}
          <p><strong>Completion Date:</strong> ${estimatedCompletionDate.toLocaleDateString()}</p>
          
          <p><strong>Request ID:</strong> ${data.id}</p>
        `
      }

      try {
        await Promise.all([
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientEmailData),
          }),
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminEmailData),
          })
        ])
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        requestId: data.id,
        estimatedCost,
        estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
        message: 'Service request created successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in service-request:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})