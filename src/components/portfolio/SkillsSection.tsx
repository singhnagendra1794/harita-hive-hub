import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Target } from "lucide-react";

interface SkillsSectionProps {
  skills: any[];
  onSave: (skills: any[]) => void;
  autoDetectedSkills: any[];
}

const skillLevels = {
  beginner: { label: 'Beginner', progress: 25 },
  intermediate: { label: 'Intermediate', progress: 50 },
  advanced: { label: 'Advanced', progress: 75 },
  expert: { label: 'Expert', progress: 100 }
};

export const SkillsSection = ({ skills, onSave }: SkillsSectionProps) => {
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skills & Expertise</h2>
          <p className="text-muted-foreground">Showcase your technical skills and proficiency levels</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{skills.length}</div>
              <div className="text-sm text-muted-foreground">Total Skills</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {skills.filter(s => s.level === 'expert' || s.level === 'advanced').length}
              </div>
              <div className="text-sm text-muted-foreground">Advanced+ Skills</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Certifications</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {(categorySkills as any[]).map((skill) => {
                  const levelInfo = skillLevels[skill.level as keyof typeof skillLevels];
                  return (
                    <div key={skill.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{skill.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {levelInfo?.label || 'Unknown'}
                        </Badge>
                      </div>
                      <Progress value={levelInfo?.progress || 0} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {skills.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No skills added yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start building your portfolio by adding your technical skills
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};