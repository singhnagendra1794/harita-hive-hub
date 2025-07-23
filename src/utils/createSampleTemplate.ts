// Utility to create downloadable sample template files for demonstration
export const createSampleTemplateFile = (templateId: string, templateTitle: string): Blob => {
  const content = `
# ${templateTitle}
# HaritaHive Project Template

## Template ID: ${templateId}

This is a sample template file for demonstration purposes.
In a real implementation, this would be a complete ZIP file containing:

- Project files and source code
- Sample datasets
- Documentation and guides  
- Setup instructions
- Video tutorials

## What to do next:

1. This template demonstrates the download functionality
2. Replace with actual ZIP files in production
3. Upload real template files to Supabase Storage
4. Update the download URLs in the template data

## Template Structure:

/project-files/
  - Main project files
  - Configuration files
  
/data/
  - Sample datasets
  - Test data files
  
/docs/
  - User guide (PDF)
  - API documentation
  - Tutorial videos
  
/scripts/
  - Setup scripts
  - Processing scripts
  - Automation tools

## Support:

For questions and support, visit: https://haritahive.com/support

Generated on: ${new Date().toISOString()}
Template: ${templateTitle}
`;

  return new Blob([content], { type: 'text/plain' });
};

export const downloadSampleTemplate = (templateId: string, templateTitle: string) => {
  const blob = createSampleTemplateFile(templateId, templateTitle);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${templateTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.txt`;
  link.target = '_blank';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};