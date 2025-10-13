import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  BookOpen, 
  Target, 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle,
  Trophy,
  Briefcase,
  Users,
  Folder,
  Star,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';

interface ComprehensiveRoadmapDisplayProps {
  roadmap: any;
}

export const ComprehensiveRoadmapDisplay = ({ roadmap }: ComprehensiveRoadmapDisplayProps) => {
  const [activeMonth, setActiveMonth] = useState(1);
  const [activeWeek, setActiveWeek] = useState(1);

  const exportRoadmap = () => {
    const dataStr = JSON.stringify(roadmap, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `career-roadmap-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{roadmap.roadmapTitle}</CardTitle>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline" className="text-sm">
                  <Target className="h-3 w-3 mr-1" />
                  {roadmap.targetRole}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {roadmap.estimatedTimeToGoal}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Current: {roadmap.currentLevel}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportRoadmap}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{roadmap.learningApproach}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="roadmap">
            <Calendar className="h-4 w-4 mr-2" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Star className="h-4 w-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Briefcase className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Folder className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Monthly Roadmap */}
        <TabsContent value="roadmap" className="space-y-6">
          {/* Month Selector */}
          <div className="flex gap-2 flex-wrap">
            {roadmap.months?.map((month: any) => (
              <Button
                key={month.month}
                variant={activeMonth === month.month ? "default" : "outline"}
                onClick={() => setActiveMonth(month.month)}
                className="flex items-center gap-2"
              >
                Month {month.month}
                {month.monthTitle && <span className="text-xs opacity-70">• {month.monthTitle}</span>}
              </Button>
            ))}
          </div>

          {/* Active Month Display */}
          {roadmap.months?.filter((m: any) => m.month === activeMonth).map((month: any) => (
            <div key={month.month} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Month {month.month}: {month.monthTitle}
                  </CardTitle>
                  <p className="text-muted-foreground">{month.focus}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Objectives:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {month.objectives?.map((obj: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground">{obj}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Weeks */}
              <Accordion type="single" collapsible className="space-y-4">
                {month.weeks?.map((week: any) => (
                  <AccordionItem key={week.week} value={`week-${week.week}`} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4 text-left">
                        <Badge>Week {week.week}</Badge>
                        <div>
                          <div className="font-semibold">{week.weekTheme}</div>
                          <div className="text-sm text-muted-foreground">{week.weekObjective}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {/* Daily Schedule */}
                      <div className="space-y-4 mt-4">
                        {week.days && Object.entries(week.days).map(([day, schedule]: [string, any]) => (
                          <Card key={day} className="bg-muted/30">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                {day}
                                {schedule.focus && <span className="text-sm font-normal text-muted-foreground">• {schedule.focus}</span>}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Morning */}
                              {schedule.morning && (
                                <div className="space-y-2">
                                  <h5 className="font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Morning ({schedule.morning.duration})
                                  </h5>
                                  <p className="text-sm">{schedule.morning.activity}</p>
                                  {schedule.morning.resources && schedule.morning.resources.length > 0 && (
                                    <div className="space-y-2 ml-4">
                                      {schedule.morning.resources.map((resource: any, idx: number) => (
                                        <a
                                          key={idx}
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          {resource.title}
                                          <Badge variant="outline" className="text-xs">{resource.platform}</Badge>
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                  {schedule.morning.deliverable && (
                                    <p className="text-xs text-muted-foreground ml-4">✓ {schedule.morning.deliverable}</p>
                                  )}
                                </div>
                              )}

                              {/* Afternoon */}
                              {schedule.afternoon && (
                                <div className="space-y-2">
                                  <h5 className="font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Afternoon ({schedule.afternoon.duration})
                                  </h5>
                                  <p className="text-sm">{schedule.afternoon.activity}</p>
                                  {schedule.afternoon.tasks && (
                                    <ul className="text-sm list-disc list-inside ml-4">
                                      {schedule.afternoon.tasks.map((task: string, idx: number) => (
                                        <li key={idx}>{task}</li>
                                      ))}
                                    </ul>
                                  )}
                                  {schedule.afternoon.tools && (
                                    <div className="flex gap-2 ml-4">
                                      {schedule.afternoon.tools.map((tool: string, idx: number) => (
                                        <Badge key={idx} variant="secondary">{tool}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Evening */}
                              {schedule.evening && (
                                <div className="space-y-2">
                                  <h5 className="font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Evening ({schedule.evening.duration})
                                  </h5>
                                  <p className="text-sm">{schedule.evening.activity}</p>
                                </div>
                              )}

                              {/* Weekend Project */}
                              {schedule.project && (
                                <div className="space-y-2 border-t pt-4">
                                  <h5 className="font-semibold flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-yellow-600" />
                                    Weekend Project
                                  </h5>
                                  <p className="text-sm font-medium">{schedule.project}</p>
                                  <p className="text-sm text-muted-foreground">{schedule.description}</p>
                                  {schedule.steps && (
                                    <ol className="text-sm list-decimal list-inside ml-4 space-y-1">
                                      {schedule.steps.map((step: string, idx: number) => (
                                        <li key={idx}>{step}</li>
                                      ))}
                                    </ol>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Week Milestones */}
                      {week.milestones && week.milestones.length > 0 && (
                        <Card className="mt-4 bg-green-50 dark:bg-green-950/20">
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-green-600" />
                              Week Milestones
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {week.milestones.map((milestone: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                  <span className="text-sm">{milestone}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Monthly Project */}
              {month.monthlyProject && (
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Month {month.month} Capstone Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{month.monthlyProject.title}</h4>
                      <p className="text-muted-foreground">{month.monthlyProject.description}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {month.monthlyProject.skills?.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          {roadmap.skillsToAcquire?.map((skill: any, idx: number) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {skill.skill}
                      <Badge variant={
                        skill.priority === 'high' ? 'destructive' :
                        skill.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {skill.priority} priority
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {skill.currentLevel} → {skill.targetLevel}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Learning Resources:</h5>
                  <div className="space-y-2">
                    {skill.resources?.map((resource: any, ridx: number) => (
                      <a
                        key={ridx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline p-2 rounded hover:bg-muted/50"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="flex-1">{resource.title}</span>
                        <Badge variant="outline">{resource.platform}</Badge>
                        <span className="text-xs text-muted-foreground">{resource.estimatedTime}</span>
                      </a>
                    ))}
                  </div>
                </div>
                {skill.practiceProjects && (
                  <div>
                    <h5 className="font-semibold mb-2">Practice Projects:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {skill.practiceProjects.map((project: string, pidx: number) => (
                        <li key={pidx} className="text-sm text-muted-foreground">{project}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          {roadmap.toolsToMaster?.map((tool: any, idx: number) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>{tool.tool}</CardTitle>
                <p className="text-sm text-muted-foreground">{tool.purpose}</p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {tool.learningPath && Object.entries(tool.learningPath).map(([level, content]: [string, any]) => (
                    <AccordionItem key={level} value={level}>
                      <AccordionTrigger className="capitalize">{level} Level</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2">Topics:</h5>
                          <div className="flex gap-2 flex-wrap">
                            {content.topics?.map((topic: string, tidx: number) => (
                              <Badge key={tidx} variant="outline">{topic}</Badge>
                            ))}
                          </div>
                        </div>
                        {content.resources && content.resources.length > 0 && (
                          <div>
                            <h5 className="font-semibold mb-2">Resources:</h5>
                            <div className="space-y-2">
                              {content.resources.map((resource: any, ridx: number) => (
                                <a
                                  key={ridx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {resource.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {roadmap.projectMilestones?.map((project: any, idx: number) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">Month {project.month}</Badge>
                    <CardTitle>{project.project}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{project.description}</p>
                <div>
                  <h5 className="font-semibold mb-2">Technologies:</h5>
                  <div className="flex gap-2 flex-wrap">
                    {project.technologies?.map((tech: string, tidx: number) => (
                      <Badge key={tidx} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Implementation Steps:</h5>
                  <ol className="list-decimal list-inside space-y-1">
                    {project.steps?.map((step: string, sidx: number) => (
                      <li key={sidx} className="text-sm text-muted-foreground">{step}</li>
                    ))}
                  </ol>
                </div>
                {project.portfolio && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Portfolio Showcase:</h5>
                    <p className="text-sm">{project.portfolio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          {/* Platform Recommendations */}
          {roadmap.platformRecommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recommended Learning Platforms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(roadmap.platformRecommendations).map(([platform, items]: [string, any]) => (
                  <div key={platform}>
                    <h5 className="font-semibold capitalize mb-2">{platform}:</h5>
                    <ul className="space-y-1">
                      {items.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {roadmap.certificationTargets && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Certification Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmap.certificationTargets.map((cert: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-primary pl-4">
                    <h5 className="font-semibold">{cert.name}</h5>
                    <p className="text-sm text-muted-foreground">{cert.provider}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{cert.difficulty}</Badge>
                      <Badge variant="outline">{cert.cost}</Badge>
                      <Badge variant="outline">{cert.preparationTime}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Career Progression */}
          {roadmap.careerProgression && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Career Progression
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Position</p>
                  <p className="font-semibold">{roadmap.careerProgression.currentPosition}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">6-Month Goal</p>
                  <p className="font-semibold">{roadmap.careerProgression.sixMonthGoal}</p>
                </div>
                {roadmap.careerProgression.salaryRange && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Salary Range</p>
                    <p className="font-semibold">{roadmap.careerProgression.salaryRange}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
