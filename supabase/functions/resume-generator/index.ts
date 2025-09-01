import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { 
      personalInfo, 
      summary, 
      experience, 
      education, 
      skills, 
      userId = null 
    } = await req.json()

    // Validate required fields
    if (!personalInfo || !personalInfo.name || !personalInfo.email) {
      return new Response(
        JSON.stringify({ error: 'Missing required personal information' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate resume title
    const resumeTitle = `${personalInfo.name} - Resume - ${new Date().toLocaleDateString()}`

    // Store resume in database
    const { data, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
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

    // Generate PDF using a simple HTML to PDF conversion
    // For now, we'll return the HTML content and download URL
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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateResumeHTML(data: any): string {
  const { personalInfo, summary, experience, education, skills } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${personalInfo.name} - Resume</title>
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
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${personalInfo.name}</div>
        <div class="contact">
          ${personalInfo.email} | ${personalInfo.phone || ''} | ${personalInfo.location || ''}
          ${personalInfo.linkedin ? ` | ${personalInfo.linkedin}` : ''}
        </div>
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