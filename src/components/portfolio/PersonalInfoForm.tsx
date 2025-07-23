import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, Plus, X } from "lucide-react";

interface PersonalInfoFormProps {
  data: any;
  onSave: (data: any) => void;
  onAISuggestion: () => void;
}

export const PersonalInfoForm = ({ data, onSave, onAISuggestion }: PersonalInfoFormProps) => {
  const [formData, setFormData] = useState(data || {
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    professionalSummary: '',
    yearsOfExperience: '0-1',
    preferredJobRoles: []
  });
  
  const [newJobRole, setNewJobRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddJobRole = () => {
    if (newJobRole.trim() && !formData.preferredJobRoles.includes(newJobRole.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredJobRoles: [...prev.preferredJobRoles, newJobRole.trim()]
      }));
      setNewJobRole('');
    }
  };

  const handleRemoveJobRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      preferredJobRoles: prev.preferredJobRoles.filter((r: string) => r !== role)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Personal Information
          <Button variant="outline" size="sm" onClick={onAISuggestion}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Enhance
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={formData.professionalSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, professionalSummary: e.target.value }))}
              placeholder="Brief overview of your professional background and expertise..."
              className="min-h-[100px]"
            />
          </div>
          
          <Button type="submit" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Personal Information
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};