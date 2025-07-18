import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "programming" | "gis" | "analysis" | "tools" | "cloud" | "remote-sensing";
  source: "auto" | "custom";
}

interface SkillsSectionProps {
  skills: Skill[];
  onSave: (skills: Skill[]) => void;
  autoDetectedSkills?: Skill[]; // From courses, challenges, etc.
}

const skillLevels = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-blue-100 text-blue-800" },
  { value: "advanced", label: "Advanced", color: "bg-purple-100 text-purple-800" },
  { value: "expert", label: "Expert", color: "bg-red-100 text-red-800" }
];

const skillCategories = [
  { value: "programming", label: "Programming Languages" },
  { value: "gis", label: "GIS Software" },
  { value: "analysis", label: "Spatial Analysis" },
  { value: "tools", label: "Development Tools" },
  { value: "cloud", label: "Cloud Platforms" },
  { value: "remote-sensing", label: "Remote Sensing" }
];

const suggestedSkills = {
  programming: ["Python", "JavaScript", "R", "SQL", "Java", "C++", "C#", "Go", "Julia"],
  gis: ["QGIS", "ArcGIS Pro", "ArcMap", "GRASS GIS", "PostGIS", "SpatiaLite", "FME"],
  analysis: ["Google Earth Engine", "GDAL", "GeoPandas", "Rasterio", "Shapely", "Fiona", "PyQGIS"],
  tools: ["Git", "Docker", "Kubernetes", "Jenkins", "VS Code", "Jupyter", "Apache Spark"],
  cloud: ["AWS", "Azure", "Google Cloud", "Heroku", "DigitalOcean", "Oracle Cloud"],
  "remote-sensing": ["ENVI", "ERDAS Imagine", "eCognition", "SNAP", "Orfeo ToolBox", "SAGA GIS"]
};

export const SkillsSection = ({ skills, onSave, autoDetectedSkills = [] }: SkillsSectionProps) => {
  const [localSkills, setLocalSkills] = useState(skills.filter(s => s.source === "custom"));
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const allSkills = [...autoDetectedSkills, ...localSkills];

  const handleAddSkill = (skill: Skill) => {
    const newSkills = [...localSkills, { ...skill, source: "custom" as const }];
    setLocalSkills(newSkills);
    onSave([...autoDetectedSkills, ...newSkills]);
    setIsAddingSkill(false);
  };

  const handleUpdateSkill = (skillName: string, updates: Partial<Skill>) => {
    const newSkills = localSkills.map(s => 
      s.name === skillName ? { ...s, ...updates } : s
    );
    setLocalSkills(newSkills);
    onSave([...autoDetectedSkills, ...newSkills]);
  };

  const handleDeleteSkill = (skillName: string) => {
    const newSkills = localSkills.filter(s => s.name !== skillName);
    setLocalSkills(newSkills);
    onSave([...autoDetectedSkills, ...newSkills]);
  };

  const getSkillLevelColor = (level: string) => {
    return skillLevels.find(l => l.value === level)?.color || "bg-gray-100 text-gray-800";
  };

  const groupSkillsByCategory = (skills: Skill[]) => {
    return skills.reduce((groups, skill) => {
      const category = skill.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
      return groups;
    }, {} as Record<string, Skill[]>);
  };

  const filteredSuggestions = (category: keyof typeof suggestedSkills) => {
    return suggestedSkills[category].filter(skill => 
      !allSkills.some(s => s.name.toLowerCase() === skill.toLowerCase()) &&
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Skills & Expertise</h2>
          <p className="text-muted-foreground">Showcase your technical skills and proficiency levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onSave([...autoDetectedSkills, ...localSkills])}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Auto-detected
          </Button>
          <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Skill</DialogTitle>
              </DialogHeader>
              <SkillForm 
                onSave={handleAddSkill}
                onCancel={() => setIsAddingSkill(false)}
                existingSkills={allSkills.map(s => s.name)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Auto-detected Skills */}
      {autoDetectedSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Badge variant="secondary">Auto-detected</Badge>
            From Harita Hive Activity
          </h3>
          {Object.entries(groupSkillsByCategory(autoDetectedSkills)).map(([category, categorySkills]) => (
            <Card key={category} className="mb-4">
              <CardHeader>
                <CardTitle className="text-base capitalize">
                  {skillCategories.find(c => c.value === category)?.label || category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <Badge 
                      key={skill.name} 
                      className={getSkillLevelColor(skill.level)}
                      variant="secondary"
                    >
                      {skill.name} • {skill.level}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Skills */}
      {localSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Custom Skills</h3>
          {Object.entries(groupSkillsByCategory(localSkills)).map(([category, categorySkills]) => (
            <Card key={category} className="mb-4">
              <CardHeader>
                <CardTitle className="text-base capitalize">
                  {skillCategories.find(c => c.value === category)?.label || category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-1">
                      <Badge 
                        className={`${getSkillLevelColor(skill.level)} cursor-pointer`}
                        variant="secondary"
                      >
                        {skill.name} • {skill.level}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteSkill(skill.name)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Skill Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Add - Common Geospatial Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {Object.entries(suggestedSkills).map(([category, skills]) => {
            const filtered = filteredSuggestions(category as keyof typeof suggestedSkills);
            if (filtered.length === 0) return null;

            return (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-medium mb-2 capitalize">
                  {skillCategories.find(c => c.value === category)?.label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filtered.slice(0, 8).map(skill => (
                    <Button
                      key={skill}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSkill({
                        name: skill,
                        level: "intermediate",
                        category: category as any,
                        source: "custom"
                      })}
                    >
                      + {skill}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

const SkillForm = ({ 
  onSave, 
  onCancel, 
  existingSkills 
}: { 
  onSave: (skill: Skill) => void; 
  onCancel: () => void;
  existingSkills: string[];
}) => {
  const [formData, setFormData] = useState({
    name: "",
    level: "intermediate" as const,
    category: "programming" as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingSkills.includes(formData.name)) {
      alert("This skill already exists!");
      return;
    }
    onSave({ ...formData, source: "custom" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="skillName">Skill Name *</Label>
        <Input
          id="skillName"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter skill name"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {skillCategories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="level">Proficiency Level</Label>
        <Select 
          value={formData.level} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {skillLevels.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Skill
        </Button>
      </div>
    </form>
  );
};