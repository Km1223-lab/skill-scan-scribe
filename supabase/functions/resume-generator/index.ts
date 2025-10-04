import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schemas
const personalInfoSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  location: z.string().trim().max(100).optional(),
  linkedin: z.string().trim().max(255).optional()
})

const experienceSchema = z.object({
  position: z.string().trim().max(100),
  company: z.string().trim().max(100),
  startDate: z.string().trim().max(50),
  endDate: z.string().trim().max(50).optional(),
  description: z.string().trim().max(2000).optional()
})

const educationSchema = z.object({
  degree: z.string().trim().max(100),
  institution: z.string().trim().max(100),
  year: z.string().trim().max(50)
})

const resumeSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string().trim().max(2000).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(z.string().trim().max(50)).optional(),
  userId: z.string().uuid().optional()
})

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

    const body = await req.json()
    
    // Get user ID or IP for rate limiting
    const identifier = body.userId || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    
    // Check rate limit: 10 requests per hour
    const rateLimitCheck = await checkRateLimit(supabase, identifier, 'resume-generator', 10, 60)
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

    // Validate input
    const validation = resumeSchema.safeParse(body)
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

    const { personalInfo, summary, experience, education, skills, userId } = validation.data

    // Generate resume title
    const resumeTitle = `${personalInfo.name} - Resume - ${new Date().toLocaleDateString()}`

    // Store resume in database
    const { data, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: userId || null,
        title: resumeTitle,
        personal_info: personalInfo,
        summary: summary || '',
        experience: experience || [],
        education: education || [],
        skills: skills || [],
        template_name: 'ats-optimized'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save resume' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate ATS-optimized resume content
    const resumeContent = generateResumeHTML({
      personalInfo,
      summary,
      experience: experience || [],
      education: education || [],
      skills: skills || []
    })

    // Generate download URL
    const downloadUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/download-resume?id=${data.id}`

    return new Response(
      JSON.stringify({ 
        success: true,
        resumeId: data.id,
        downloadUrl,
        previewContent: resumeContent,
        message: 'Resume generated successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in resume-generator:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateResumeHTML(data: any, isPublic: boolean = false): string {
  const { personalInfo, summary, experience, education, skills } = data
  
  // Filter sensitive information for public resumes
  const safePersonalInfo = isPublic ? {
    name: personalInfo.name,
    location: personalInfo.location,
    linkedin: personalInfo.linkedin
  } : personalInfo;
  
  // Build contact info array, excluding sensitive data for public resumes
  const contactParts = [];
  if (!isPublic && personalInfo.email) contactParts.push(personalInfo.email);
  if (!isPublic && personalInfo.phone) contactParts.push(personalInfo.phone);
  if (safePersonalInfo.location) contactParts.push(safePersonalInfo.location);
  if (safePersonalInfo.linkedin) contactParts.push(safePersonalInfo.linkedin);
  
  const contactInfo = contactParts.join(' | ');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${safePersonalInfo.name} - Resume</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .contact { font-size: 14px; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
        .experience-item { margin-bottom: 20px; }
        .job-title { font-weight: bold; font-size: 16px; }
        .company { font-style: italic; color: #666; }
        .duration { float: right; color: #666; font-size: 14px; }
        .description { margin-top: 8px; }
        .education-item { margin-bottom: 15px; }
        .degree { font-weight: bold; }
        .institution { color: #666; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #f0f0f0; padding: 5px 12px; border-radius: 15px; font-size: 14px; }
        @media print { body { margin: 0; padding: 15px; } }
        ${isPublic ? '.privacy-notice { background: #f9f9f9; padding: 10px; margin-bottom: 20px; border-left: 4px solid #007acc; font-size: 12px; color: #666; }' : ''}
      </style>
    </head>
    <body>
      ${isPublic ? '<div class="privacy-notice">📋 Public Resume View - Contact information has been filtered for privacy protection.</div>' : ''}
      <div class="header">
        <div class="name">${safePersonalInfo.name}</div>
        ${contactInfo ? `<div class="contact">${contactInfo}</div>` : ''}
      </div>

      ${summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p>${summary}</p>
        </div>
      ` : ''}

      ${experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Work Experience</div>
          ${experience.map((exp: any) => `
            <div class="experience-item">
              <div class="job-title">${exp.position}</div>
              <div class="company">${exp.company}</div>
              <div class="duration">${exp.startDate} - ${exp.endDate || 'Present'}</div>
              <div style="clear: both;"></div>
              ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map((edu: any) => `
            <div class="education-item">
              <div class="degree">${edu.degree}</div>
              <div class="institution">${edu.institution} - ${edu.year}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-list">
            ${skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </body>
    </html>
  `
}