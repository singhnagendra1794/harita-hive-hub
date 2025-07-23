import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, Download, Share } from "lucide-react";

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  theme_config: any;
  view_count: number;
  download_count: number;
  is_public: boolean;
  public_url?: string;
}

interface PortfolioSection {
  id: string;
  section_type: string;
  section_data: any;
  order_index: number;
  is_visible: boolean;
}

interface PortfolioPreviewProps {
  portfolio: Portfolio | null;
  sections: PortfolioSection[];
  data: {
    personalInfo: any;
    projects: any[];
    skills: any[];
    certificates: any[];
  };
}

export const PortfolioPreview = ({ portfolio, sections, data }: PortfolioPreviewProps) => {
  const { personalInfo, projects, skills, certificates } = data;
  const themeColor = portfolio?.theme_config?.color || 'blue';
  
  const colorClasses = {
    blue: 'from-blue-600 to-blue-400',
    green: 'from-green-600 to-green-400',
    purple: 'from-purple-600 to-purple-400',
    teal: 'from-teal-600 to-teal-400',
    orange: 'from-orange-600 to-orange-400',
    indigo: 'from-indigo-600 to-indigo-400'
  };

  const gradientClass = colorClasses[themeColor as keyof typeof colorClasses] || colorClasses.blue;

  const groupSkillsByCategory = (skills: any[]) => {
    return skills.reduce((groups, skill) => {
      const category = skill.category || 'other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(skill);
      return groups;
    }, {});
  };

  if (!portfolio) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading portfolio preview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Preview</h2>
          <p className="text-muted-foreground">See how your portfolio will look to visitors</p>
        </div>
        <div className="flex gap-2">
          {portfolio.public_url && (
            <Button variant="outline" asChild>
              <a href={`/portfolio/${portfolio.public_url}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </a>
            </Button>
          )}
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share Preview
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-background to-muted/50 p-6">
          <div className="max-w-4xl mx-auto bg-background rounded-lg shadow-lg overflow-hidden">
            
            {/* Header Section */}
            <div className={`bg-gradient-to-r ${gradientClass} text-white p-8`}>
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">{personalInfo.name}</h1>
                <p className="text-xl opacity-90 mb-4">
                  {personalInfo.preferredJobRoles[0] || 'Geospatial Professional'}
                </p>
                <div className="flex justify-center gap-4 text-sm opacity-80">
                  <span>{personalInfo.email}</span>
                  {personalInfo.phone && <span>•</span>}
                  {personalInfo.phone && <span>{personalInfo.phone}</span>}
                  {personalInfo.location && <span>•</span>}
                  {personalInfo.location && <span>{personalInfo.location}</span>}
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="p-8 space-y-8">
              
              {/* Professional Summary */}
              {personalInfo.professionalSummary && (
                <section>
                  <h2 className="text-xl font-semibold border-b-2 border-primary/20 pb-2 mb-4">
                    Professional Summary
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {personalInfo.professionalSummary}
                  </p>
                </section>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold border-b-2 border-primary/20 pb-2 mb-4">
                    Technical Skills
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(groupSkillsByCategory(skills)).map(([category, categorySkills]) => (
                      <div key={category}>
                        <h3 className="font-medium text-primary capitalize mb-2">
                          {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(categorySkills as any[]).slice(0, 6).map(skill => (
                            <Badge key={skill.name} variant="secondary" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects Section */}
              {projects.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold border-b-2 border-primary/20 pb-2 mb-4">
                    Featured Projects
                  </h2>
                  <div className="grid gap-6">
                    {projects.slice(0, 3).map((project, index) => (
                      <div key={project.id || index} className="border-l-4 border-primary pl-4">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(project.completedDate).toLocaleDateString()}
                          {project.duration && ` • ${project.duration}`}
                        </p>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 5).map((tech: string) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certificates Section */}
              {certificates.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold border-b-2 border-primary/20 pb-2 mb-4">
                    Certifications
                  </h2>
                  <div className="grid gap-3">
                    {certificates.map((cert: any) => (
                      <div key={cert.id} className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        </div>
                        <Badge variant="outline">
                          {new Date(cert.date).getFullYear()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="bg-muted/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Generated with Harita Hive Portfolio Builder
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{portfolio.view_count}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{portfolio.download_count}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{skills.length}</div>
              <div className="text-sm text-muted-foreground">Skills</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};