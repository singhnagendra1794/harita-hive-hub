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
          <h2 className="text-2xl font-bold">Professional Portfolio Preview</h2>
          <p className="text-muted-foreground">ATS-optimized professional format</p>
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

      {/* Preview Frame - Professional Design */}
      <Card className="overflow-hidden shadow-xl border-2">
        <div className="bg-gradient-to-br from-background via-muted/30 to-background p-8">
          <div className="max-w-5xl mx-auto bg-background rounded-xl shadow-2xl overflow-hidden border border-border/50">
            
            {/* Professional Header Section */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5"></div>
              <div className="relative border-b-4 border-primary/20 bg-gradient-to-r from-background to-muted/30 px-12 py-10">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {personalInfo.name}
                  </h1>
                  <div className="flex items-center gap-3 text-lg text-muted-foreground font-medium">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <span>{personalInfo.preferredJobRoles[0] || 'Geospatial Professional'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
                    <span className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      {personalInfo.email}
                    </span>
                    {personalInfo.phone && (
                      <span className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        {personalInfo.phone}
                      </span>
                    )}
                    {personalInfo.location && (
                      <span className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        {personalInfo.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Sections - Professional Spacing */}
            <div className="px-12 py-10 space-y-10">
              
              {/* Professional Summary */}
              {personalInfo.professionalSummary && (
                <section className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h2 className="text-2xl font-bold tracking-tight">Professional Summary</h2>
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-base pl-7 font-light">
                    {personalInfo.professionalSummary}
                  </p>
                </section>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <section className="space-y-5 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h2 className="text-2xl font-bold tracking-tight">Technical Expertise</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-7">
                    {Object.entries(groupSkillsByCategory(skills)).map(([category, categorySkills]) => (
                      <div key={category} className="space-y-3">
                        <h3 className="font-semibold text-base text-primary capitalize flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                          {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(categorySkills as any[]).slice(0, 8).map(skill => (
                            <Badge 
                              key={skill.name} 
                              variant="secondary" 
                              className="text-xs font-medium px-3 py-1 hover:bg-primary/10 transition-colors"
                            >
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
                <section className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h2 className="text-2xl font-bold tracking-tight">Professional Projects</h2>
                  </div>
                  <div className="grid gap-7 pl-7">
                    {projects.slice(0, 4).map((project, index) => (
                      <div 
                        key={project.id || index} 
                        className="relative group pl-6 border-l-2 border-primary/30 hover:border-primary transition-all duration-300"
                      >
                        <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <span>{new Date(project.completedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            {project.duration && (
                              <>
                                <span>•</span>
                                <span>{project.duration}</span>
                              </>
                            )}
                          </div>
                          <p className="text-foreground/70 leading-relaxed text-sm">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {project.technologies.slice(0, 6).map((tech: string) => (
                              <Badge 
                                key={tech} 
                                variant="outline" 
                                className="text-xs font-medium border-primary/30 hover:bg-primary/5 transition-colors"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certificates Section */}
              {certificates.length > 0 && (
                <section className="space-y-5 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h2 className="text-2xl font-bold tracking-tight">Professional Certifications</h2>
                  </div>
                  <div className="grid gap-4 pl-7">
                    {certificates.map((cert: any) => (
                      <div 
                        key={cert.id} 
                        className="flex justify-between items-start p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 group"
                      >
                        <div className="space-y-1">
                          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground font-medium">{cert.issuer}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 font-semibold">
                          {new Date(cert.date).getFullYear()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Professional Footer */}
            <div className="relative overflow-hidden border-t border-border/50">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5"></div>
              <div className="relative px-12 py-8 text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Portfolio created with Harita Hive Professional Portfolio Builder
                </p>
                <p className="text-xs text-muted-foreground/70">
                  ATS-Optimized • Professional Design • Industry Standards
                </p>
              </div>
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