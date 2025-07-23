// Utility to create sample guide PDF content
export const createSampleGuideContent = (templateId: string, templateTitle: string): string => {
  return `
# ${templateTitle} - User Guide

## Template Information
- **Template ID**: ${templateId}
- **Title**: ${templateTitle}
- **Generated**: ${new Date().toLocaleDateString()}

## Overview
This is a sample guide for the ${templateTitle} template. In a real implementation, this would be a comprehensive PDF guide with:

## Table of Contents
1. Introduction
2. System Requirements
3. Installation Instructions
4. Quick Start Guide
5. Detailed Tutorials
6. Troubleshooting
7. Advanced Features
8. Best Practices
9. Sample Datasets
10. Support & Resources

## 1. Introduction
Welcome to the ${templateTitle} template! This guide will walk you through everything you need to know to get started with this geospatial project template.

## 2. System Requirements
- Operating System: Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+
- RAM: Minimum 8GB, Recommended 16GB
- Storage: 10GB free space
- Software dependencies: Listed in requirements.txt

## 3. Installation Instructions
1. Download and extract the template files
2. Install required software dependencies
3. Set up the development environment
4. Verify installation with test data

## 4. Quick Start Guide
Follow these steps to get up and running quickly:
1. Open the main project file
2. Load the sample dataset
3. Run the initial analysis
4. View the results

## 5. Detailed Tutorials
Step-by-step tutorials covering:
- Data preparation
- Analysis workflows
- Customization options
- Export and sharing

## 6. Troubleshooting
Common issues and solutions:
- Installation problems
- Data loading errors
- Performance optimization
- Compatibility issues

## 7. Advanced Features
For experienced users:
- Custom scripting
- Automation workflows
- Integration with other tools
- Advanced analysis techniques

## 8. Best Practices
Recommended approaches for:
- Data organization
- Project structure
- Version control
- Documentation

## 9. Sample Datasets
Information about included datasets:
- Data sources and licensing
- Quality and limitations
- Usage recommendations
- How to add your own data

## 10. Support & Resources
- Online documentation: https://haritahive.com/docs
- Community forum: https://haritahive.com/community
- Video tutorials: https://haritahive.com/tutorials
- Email support: support@haritahive.com

---

© 2024 HaritaHive. All rights reserved.
`;
};

export const downloadSampleGuide = (templateId: string, templateTitle: string) => {
  const content = createSampleGuideContent(templateId, templateTitle);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${templateTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_guide.txt`;
  link.target = '_blank';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};