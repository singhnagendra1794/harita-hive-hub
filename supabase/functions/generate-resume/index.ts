import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { 
      userId, 
      portfolioId,
      format, 
      templateType,
      personalInfo,
      projects,
      skills,
      certificates 
    } = await req.json();

    console.log('Resume generation request:', { userId, format, templateType });

    // Generate HTML content based on template type
    const htmlContent = generateResumeHTML({
      personalInfo,
      projects,
      skills,
      certificates,
      templateType
    });

    let fileContent: string | Uint8Array;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'html':
        fileContent = htmlContent;
        mimeType = 'text/html';
        fileExtension = 'html';
        break;
      
      case 'markdown':
        fileContent = generateMarkdown({ personalInfo, projects, skills, certificates });
        mimeType = 'text/markdown';
        fileExtension = 'md';
        break;
      
      case 'pdf':
        // For now, return HTML that can be printed to PDF
        fileContent = generatePrintableHTML({ personalInfo, projects, skills, certificates, templateType });
        mimeType = 'text/html';
        fileExtension = 'html';
        break;
      
      default:
        throw new Error('Unsupported format');
    }

    // Store generation record
    const { data: resumeRecord, error: dbError } = await supabase
      .from('resume_generations')
      .insert({
        user_id: userId,
        portfolio_id: portfolioId,
        format,
        template_type: templateType,
        generation_status: 'completed',
        file_size: new Blob([fileContent]).size
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    console.log('Resume generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      content: fileContent,
      mimeType,
      fileExtension,
      resumeId: resumeRecord?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-resume function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateResumeHTML(data: any): string {
  const { personalInfo, projects, skills, certificates, templateType } = data;
  
  const themeColors = {
    geoai: '#3B82F6', // blue
    'remote-sensing': '#10B981', // green
    planning: '#8B5CF6', // purple
    analyst: '#14B8A6', // teal
    developer: '#F59E0B', // orange
    consultant: '#1E40AF' // navy
  };

  const color = themeColors[templateType as keyof typeof themeColors] || '#3B82F6';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo.name} - Resume</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; }
        .header { background: ${color}; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header .contact { margin-top: 10px; font-size: 0.9em; }
        .section { margin: 30px 0; }
        .section-title { border-bottom: 2px solid ${color}; padding-bottom: 5px; margin-bottom: 15px; font-size: 1.3em; font-weight: bold; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .skill-category { margin-bottom: 15px; }
        .skill-category h4 { margin: 0 0 5px 0; color: ${color}; }
        .skills { display: flex; flex-wrap: wrap; gap: 5px; }
        .skill { background: #f0f0f0; padding: 3px 8px; border-radius: 12px; font-size: 0.85em; }
        .project { margin-bottom: 20px; border-left: 3px solid ${color}; padding-left: 15px; }
        .project h4 { margin: 0 0 5px 0; color: ${color}; }
        .project-meta { font-size: 0.85em; color: #666; margin-bottom: 8px; }
        .technologies { margin-top: 8px; }
        .tech-tag { background: ${color}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em; margin-right: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${personalInfo.name}</h1>
            <div class="contact">
                ${personalInfo.email} • ${personalInfo.phone} • ${personalInfo.location}
                ${personalInfo.linkedin ? ` • LinkedIn: ${personalInfo.linkedin}` : ''}
                ${personalInfo.github ? ` • GitHub: ${personalInfo.github}` : ''}
            </div>
        </div>

        ${personalInfo.professionalSummary ? `
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <p>${personalInfo.professionalSummary}</p>
        </div>
        ` : ''}

        <div class="section">
            <div class="section-title">Technical Skills</div>
            <div class="skills-grid">
                ${Object.entries(groupSkillsByCategory(skills)).map(([category, categorySkills]) => `
                <div class="skill-category">
                    <h4>${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                    <div class="skills">
                        ${(categorySkills as any[]).map(skill => `<span class="skill">${skill.name} (${skill.level})</span>`).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Projects & Experience</div>
            ${projects.slice(0, 6).map((project: any) => `
            <div class="project">
                <h4>${project.title}</h4>
                <div class="project-meta">${new Date(project.completedDate).toLocaleDateString()} ${project.duration ? `• ${project.duration}` : ''}</div>
                <p>${project.description}</p>
                <div class="technologies">
                    ${project.technologies.map((tech: string) => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
            `).join('')}
        </div>

        ${certificates.length > 0 ? `
        <div class="section">
            <div class="section-title">Certifications</div>
            ${certificates.map((cert: any) => `
            <div style="margin-bottom: 10px;">
                <strong>${cert.name}</strong> - ${cert.issuer} (${new Date(cert.date).getFullYear()})
            </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
}

function generateMarkdown(data: any): string {
  const { personalInfo, projects, skills, certificates } = data;
  
  let markdown = `# ${personalInfo.name}\n\n`;
  markdown += `**Contact:** ${personalInfo.email} • ${personalInfo.phone} • ${personalInfo.location}\n`;
  if (personalInfo.linkedin) markdown += `**LinkedIn:** ${personalInfo.linkedin}\n`;
  if (personalInfo.github) markdown += `**GitHub:** ${personalInfo.github}\n\n`;
  
  if (personalInfo.professionalSummary) {
    markdown += `## Professional Summary\n\n${personalInfo.professionalSummary}\n\n`;
  }
  
  markdown += `## Technical Skills\n\n`;
  Object.entries(groupSkillsByCategory(skills)).forEach(([category, categorySkills]) => {
    markdown += `**${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:** `;
    markdown += (categorySkills as any[]).map(skill => `${skill.name} (${skill.level})`).join(', ') + '\n\n';
  });
  
  markdown += `## Projects & Experience\n\n`;
  projects.slice(0, 6).forEach((project: any) => {
    markdown += `### ${project.title}\n`;
    markdown += `*${new Date(project.completedDate).toLocaleDateString()}${project.duration ? ` • ${project.duration}` : ''}*\n\n`;
    markdown += `${project.description}\n\n`;
    markdown += `**Technologies:** ${project.technologies.join(', ')}\n\n`;
  });
  
  if (certificates.length > 0) {
    markdown += `## Certifications\n\n`;
    certificates.forEach((cert: any) => {
      markdown += `- **${cert.name}** - ${cert.issuer} (${new Date(cert.date).getFullYear()})\n`;
    });
  }
  
  return markdown;
}

function generatePrintableHTML(data: any): string {
  const html = generateResumeHTML(data);
  return html.replace('<style>', '<style>@media print { body { margin: 0; } } @page { size: A4; margin: 0.5in; }');
}

function groupSkillsByCategory(skills: any[]) {
  return skills.reduce((groups, skill) => {
    const category = skill.category || 'other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(skill);
    return groups;
  }, {});
}