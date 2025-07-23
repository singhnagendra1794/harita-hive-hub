import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Download, 
  Mail, 
  RefreshCw, 
  BookOpen, 
  Code, 
  Briefcase,
  Clock,
  Target
} from 'lucide-react';

interface WeeklyPlan {
  id: string;
  generatedAt: string;
  week: string;
  careerGoal: string;
  weeklyTime: string;
  days: Array<{
    day: string;
    theme: string;
    tasks: Array<{
      type: 'study' | 'build' | 'apply';
      task: string;
      duration?: string;
      icon: React.ReactNode;
    }>;
  }>;
}

interface WeeklyPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: WeeklyPlan | null;
  onRegeneratePlan: () => void;
  onDownloadPDF: () => void;
  onEmailPlan: () => void;
  onAddToCalendar: () => void;
  isGenerating: boolean;
}

const getTaskTypeColor = (type: string) => {
  switch (type) {
    case 'study': return 'bg-blue-100 text-blue-700';
    case 'build': return 'bg-green-100 text-green-700';
    case 'apply': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getTaskIcon = (type: string) => {
  switch (type) {
    case 'study': return <BookOpen className="h-4 w-4" />;
    case 'build': return <Code className="h-4 w-4" />;
    case 'apply': return <Briefcase className="h-4 w-4" />;
    default: return <Target className="h-4 w-4" />;
  }
};

export const WeeklyPlanModal: React.FC<WeeklyPlanModalProps> = ({
  open,
  onOpenChange,
  plan,
  onRegeneratePlan,
  onDownloadPDF,
  onEmailPlan,
  onAddToCalendar,
  isGenerating
}) => {
  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Personalized Weekly Study Plan
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRegeneratePlan}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Overview */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.week}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{plan.careerGoal.replace('-', ' ')}</Badge>
                    <Badge variant="outline">{plan.weeklyTime.replace('-', ' ')}</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Generated: {new Date(plan.generatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={onDownloadPDF} className="flex-1 min-w-fit">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={onEmailPlan} variant="outline" className="flex-1 min-w-fit">
              <Mail className="h-4 w-4 mr-2" />
              Email Plan
            </Button>
            <Button onClick={onAddToCalendar} variant="outline" className="flex-1 min-w-fit">
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          </div>

          {/* Study Framework Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Study → Build → Apply Framework</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Study</div>
                    <div className="text-muted-foreground">Learn concepts</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Code className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Build</div>
                    <div className="text-muted-foreground">Practice skills</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Briefcase className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Apply</div>
                    <div className="text-muted-foreground">Real-world use</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plan.days.map((day, index) => (
              <Card key={day.day} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{day.day}</CardTitle>
                  <div className="text-xs text-muted-foreground">{day.theme}</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day.tasks.map((task, taskIndex) => (
                    <div 
                      key={taskIndex} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted"
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getTaskTypeColor(task.type)}`}>
                        {getTaskIcon(task.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium capitalize mb-1 ${task.type === 'study' ? 'text-blue-600' : task.type === 'build' ? 'text-green-600' : 'text-purple-600'}`}>
                          {task.type}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {task.task}
                        </div>
                        {task.duration && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips */}
          <Card className="bg-muted/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">📚 Study Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set specific times for each activity to build routine</li>
                <li>• Track your progress daily to stay motivated</li>
                <li>• Join the HaritaHive community for support and networking</li>
                <li>• Adjust the plan based on your learning pace</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};