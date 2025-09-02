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
    // Use service role key to bypass RLS for controlled public access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the share token from URL parameters
    const url = new URL(req.url);
    const shareToken = url.searchParams.get('token');

    if (!shareToken) {
      return new Response(
        JSON.stringify({ error: 'Share token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use the secure function to get filtered resume data
    const { data, error } = await supabase.rpc('get_public_resume_by_token', {
      token_param: shareToken
    });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve resume' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Resume not found or not public' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const resumeData = data[0];

    // Log the access for security monitoring (without logging sensitive data)
    console.log(`Public resume accessed: ${resumeData.id}, token: ${shareToken}, timestamp: ${new Date().toISOString()}`);

    // Generate HTML content with filtered data
    const resumeHTML = generateSecureResumeHTML(resumeData);

    // Return filtered resume data
    return new Response(
      JSON.stringify({
        success: true,
        resume: resumeData,
        html: resumeHTML,
        message: 'Public resume retrieved successfully'
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

function generateSecureResumeHTML(data: any): string {
  const { personal_info, summary, experience, education, skills, title } = data
  
  // Ensure we only display filtered personal info (no email/phone)
  const safePersonalInfo = {
    name: personal_info?.name || 'Name Hidden',
    location: personal_info?.location || '',
    linkedin: personal_info?.linkedin || ''
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title || `${safePersonalInfo.name} - Resume`}</title>
      <meta name="robots" content="noindex, nofollow">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; max-width: 800px; margin: 0 auto; }
        .security-notice { background: #f0f8ff; border: 1px solid #0066cc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .security-notice p { margin: 0; color: #0066cc; font-size: 14px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .contact { font-size: 14px; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
        .experience-item { margin-bottom: 20px; }
        .job-title { font-weight: bold; font-size: 16px; }
        .company { font-style: italic; color: #666; }
        .duration { float: right; color: #666; font-size: 14px; }
        .description { margin-top: 8px; white-space: pre-line; }
        .education-item { margin-bottom: 15px; }
        .degree { font-weight: bold; }
        .institution { color: #666; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #f0f0f0; padding: 5px 12px; border-radius: 15px; font-size: 14px; }
        @media print { body { margin: 0; padding: 15px; } .security-notice { display: none; } }
      </style>
    </head>
    <body>
      <div class="security-notice">
        <p><strong>🔒 Privacy Protected:</strong> Contact details have been filtered from this public resume view for security reasons.</p>
      </div>
      
      <div class="header">
        <div class="name">${safePersonalInfo.name}</div>
        <div class="contact">
          ${safePersonalInfo.location ? `${safePersonalInfo.location}` : ''}
          ${safePersonalInfo.linkedin ? ` | ${safePersonalInfo.linkedin}` : ''}
        </div>
      </div>

      ${summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p>${summary}</p>
        </div>
      ` : ''}

      ${experience && experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Work Experience</div>
          ${experience.map((exp: any) => `
            <div class="experience-item">
              <div class="job-title">${exp.position || 'Position not specified'}</div>
              <div class="company">${exp.company || 'Company not specified'}</div>
              <div class="duration">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
              <div style="clear: both;"></div>
              ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${education && education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map((edu: any) => `
            <div class="education-item">
              <div class="degree">${edu.degree || 'Degree not specified'}</div>
              <div class="institution">${edu.institution || 'Institution not specified'} - ${edu.year || 'Year not specified'}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${skills && skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-list">
            ${skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666; font-size: 12px;">
        <p>This is a privacy-protected public resume view. Personal contact information has been filtered for security.</p>
      </div>
    </body>
    </html>
  `
}