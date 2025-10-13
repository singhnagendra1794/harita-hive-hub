import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, X, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmployerJobPostingFormProps {
  onSuccess?: () => void;
}

const EmployerJobPostingForm: React.FC<EmployerJobPostingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('INR');
  const [employmentType, setEmploymentType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [isIndiaFocused, setIsIndiaFocused] = useState(true);
  const [verificationConfirmed, setVerificationConfirmed] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const resetForm = () => {
    setCompanyName('');
    setCompanyEmail('');
    setCompanyWebsite('');
    setJobTitle('');
    setJobDescription('');
    setSkills([]);
    setLocation('');
    setSalaryMin('');
    setSalaryMax('');
    setSalaryCurrency('INR');
    setEmploymentType('');
    setExperienceLevel('');
    setApplicationUrl('');
    setIsRemote(false);
    setIsIndiaFocused(true);
    setVerificationConfirmed(false);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationConfirmed) {
      toast({
        title: "Verification Required",
        description: "Please confirm that you are authorized to post this job.",
        variant: "destructive",
      });
      return;
    }

    if (skills.length === 0) {
      toast({
        title: "Skills Required",
        description: "Please add at least one required skill.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-employer-job', {
        body: {
          company_name: companyName,
          company_email: companyEmail,
          company_website: companyWebsite || null,
          job_title: jobTitle,
          job_description: jobDescription,
          required_skills: skills,
          location: location,
          salary_min: salaryMin ? parseInt(salaryMin) : null,
          salary_max: salaryMax ? parseInt(salaryMax) : null,
          salary_currency: salaryCurrency,
          employment_type: employmentType,
          experience_level: experienceLevel,
          application_url: applicationUrl || null,
          is_remote: isRemote,
          is_india_focused: isIndiaFocused,
          verification_confirmed: verificationConfirmed
        }
      });

      if (error) throw error;

      setSubmitted(true);
      
      toast({
        title: "Job Posted Successfully! 🎉",
        description: "Your job posting will be reviewed within 24 hours and published on the platform.",
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 3000);

    } catch (error: any) {
      console.error('Error submitting job:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit job posting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Post a Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Briefcase className="h-6 w-6" />
            Post a Geospatial Job
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to post a job on Harita Hive Talent Pool. Your listing will be reviewed within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold">Submission Successful!</h3>
            <p className="text-muted-foreground">
              Your job posting has been submitted for review. We'll notify you once it's approved and live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Company Information</h3>
              
              <div>
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Esri India, SatSure Analytics"
                  required
                />
              </div>

              <div>
                <Label htmlFor="company-email">Company Email *</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="hr@company.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="company-website">Company Website (Optional)</Label>
                <Input
                  id="company-website"
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://www.company.com"
                />
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Job Details</h3>
              
              <div>
                <Label htmlFor="job-title">Job Title *</Label>
                <Input
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior GIS Analyst - Remote Sensing"
                  required
                />
              </div>

              <div>
                <Label htmlFor="job-description">Job Description *</Label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Bangalore, India or Remote"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-remote"
                    checked={isRemote}
                    onCheckedChange={(checked) => setIsRemote(checked as boolean)}
                  />
                  <Label htmlFor="is-remote" className="cursor-pointer">Remote Work Allowed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-india"
                    checked={isIndiaFocused}
                    onCheckedChange={(checked) => setIsIndiaFocused(checked as boolean)}
                  />
                  <Label htmlFor="is-india" className="cursor-pointer">India-Focused Role</Label>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Required Skills *</h3>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="e.g., QGIS, Python, PostGIS"
                />
                <Button type="button" onClick={handleAddSkill} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Employment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employment-type">Employment Type *</Label>
                <Select value={employmentType} onValueChange={setEmploymentType} required>
                  <SelectTrigger id="employment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience-level">Experience Level *</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel} required>
                  <SelectTrigger id="experience-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Salary Range (Optional)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salary-min">Min</Label>
                  <Input
                    id="salary-min"
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="500000"
                  />
                </div>
                <div>
                  <Label htmlFor="salary-max">Max</Label>
                  <Input
                    id="salary-max"
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="1200000"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Application URL */}
            <div>
              <Label htmlFor="application-url">Application URL (Optional)</Label>
              <Input
                id="application-url"
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://company.com/careers/apply or leave blank to use Harita Hive"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to use Harita Hive's application system
              </p>
            </div>

            {/* Verification */}
            <div className="flex items-start space-x-2 p-4 border rounded-lg">
              <Checkbox
                id="verification"
                checked={verificationConfirmed}
                onCheckedChange={(checked) => setVerificationConfirmed(checked as boolean)}
                required
              />
              <Label htmlFor="verification" className="cursor-pointer text-sm leading-relaxed">
                I confirm this job is genuine and I am authorized to post it on behalf of my organization. I understand that false information may result in removal from the platform.
              </Label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Job Posting'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployerJobPostingForm;
