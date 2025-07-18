import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X, Sparkles } from "lucide-react";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  careerObjective: string;
  professionalSummary: string;
  yearsOfExperience: string;
  preferredJobRoles: string[];
  github: string;
  website: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onSave: (data: PersonalInfo) => void;
  onAISuggestion?: () => void;
}

const jobRoleOptions = [
  "GIS Analyst",
  "Geospatial Developer", 
  "Remote Sensing Specialist",
  "Spatial Data Scientist",
  "GIS Technician",
  "Cartographer",
  "Geospatial Researcher",
  "Location Intelligence Analyst",
  "Drone/UAV Specialist",
  "Earth Observation Scientist"
];

export const PersonalInfoForm = ({ data, onSave, onAISuggestion }: PersonalInfoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PersonalInfo>(data);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
  };

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addJobRole = (role: string) => {
    if (!formData.preferredJobRoles.includes(role)) {
      setFormData(prev => ({
        ...prev,
        preferredJobRoles: [...prev.preferredJobRoles, role]
      }));
    }
  };

  const removeJobRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      preferredJobRoles: prev.preferredJobRoles.filter(r => r !== role)
    }));
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Personal Information & Professional Summary</CardTitle>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg">{data.name}</h3>
              <p className="text-muted-foreground">{data.email}</p>
              <p className="text-muted-foreground">{data.phone}</p>
              <p className="text-muted-foreground">{data.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-medium">{data.yearsOfExperience} years</p>
              <p className="text-sm text-muted-foreground mt-2">Preferred Roles</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.preferredJobRoles.map(role => (
                  <span key={role} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {data.careerObjective && (
            <div>
              <h4 className="font-semibold mb-2">Career Objective</h4>
              <p className="text-muted-foreground">{data.careerObjective}</p>
            </div>
          )}
          {data.professionalSummary && (
            <div>
              <h4 className="font-semibold mb-2">Professional Summary</h4>
              <p className="text-muted-foreground">{data.professionalSummary}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Edit Personal Information</CardTitle>
          <div className="flex gap-2">
            {onAISuggestion && (
              <Button variant="outline" onClick={onAISuggestion} size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Suggestions
              </Button>
            )}
            <Button variant="outline" onClick={handleCancel} size="sm">
              <X className="h-4 w-4" />
            </Button>
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="City, State, Country"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => updateField('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub Profile</Label>
            <Input
              id="github"
              value={formData.github}
              onChange={(e) => updateField('github', e.target.value)}
              placeholder="https://github.com/yourusername"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="experience">Years of Experience</Label>
          <Select value={formData.yearsOfExperience} onValueChange={(value) => updateField('yearsOfExperience', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">0-1 years (Entry Level)</SelectItem>
              <SelectItem value="2-3">2-3 years</SelectItem>
              <SelectItem value="4-6">4-6 years</SelectItem>
              <SelectItem value="7-10">7-10 years</SelectItem>
              <SelectItem value="10+">10+ years (Senior)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Preferred Job Roles</Label>
          <Select onValueChange={addJobRole}>
            <SelectTrigger>
              <SelectValue placeholder="Add a job role" />
            </SelectTrigger>
            <SelectContent>
              {jobRoleOptions.filter(role => !formData.preferredJobRoles.includes(role)).map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.preferredJobRoles.map(role => (
              <span 
                key={role} 
                className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
                onClick={() => removeJobRole(role)}
              >
                {role} <X className="h-3 w-3" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="objective">Career Objective</Label>
          <Textarea
            id="objective"
            value={formData.careerObjective}
            onChange={(e) => updateField('careerObjective', e.target.value)}
            placeholder="Brief statement about your career goals and what you're looking for..."
            className="min-h-[60px]"
          />
        </div>

        <div>
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            value={formData.professionalSummary}
            onChange={(e) => updateField('professionalSummary', e.target.value)}
            placeholder="Highlight your key achievements, skills, and experience in geospatial technology..."
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};