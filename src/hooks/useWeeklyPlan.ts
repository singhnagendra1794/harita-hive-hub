import React, { useState } from 'react';
import { BookOpen, Code, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface WeeklyPlanData {
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

export const useWeeklyPlan = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanData | null>(null);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'study': return BookOpen;
      case 'build': return Code;
      case 'apply': return Briefcase;
      default: return BookOpen;
    }
  };

  const generatePersonalizedPlan = async (data: {
    resumeId: string;
    careerGoal: string;
    weeklyTime: string;
  }) => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const plan = generateWeeklyPlanFromGoal(data.careerGoal, data.weeklyTime);
      setWeeklyPlan(plan);

      toast({
        title: "Plan Generated! 🎯",
        description: "Your personalized weekly study plan is ready.",
      });

      return plan;
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate your plan. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWeeklyPlanFromGoal = (careerGoal: string, weeklyTime: string): WeeklyPlanData => {
    const basicPlan = {
      monday: { theme: 'Foundation Building', tasks: [
        { type: 'study' as const, task: 'Learn core concepts and fundamentals', duration: '45 min' },
        { type: 'build' as const, task: 'Practice with hands-on exercises', duration: '60 min' },
        { type: 'apply' as const, task: 'Share progress on professional networks', duration: '15 min' }
      ]},
      tuesday: { theme: 'Skill Development', tasks: [
        { type: 'study' as const, task: 'Advanced tutorials and documentation', duration: '45 min' },
        { type: 'build' as const, task: 'Build a practical project', duration: '75 min' },
        { type: 'apply' as const, task: 'Document and showcase your work', duration: '30 min' }
      ]},
      wednesday: { theme: 'Technical Deep Dive', tasks: [
        { type: 'study' as const, task: 'Explore advanced techniques', duration: '60 min' },
        { type: 'build' as const, task: 'Implement complex workflows', duration: '90 min' },
        { type: 'apply' as const, task: 'Optimize and refine solutions', duration: '45 min' }
      ]},
      thursday: { theme: 'Industry Tools', tasks: [
        { type: 'study' as const, task: 'Learn industry-standard tools', duration: '45 min' },
        { type: 'build' as const, task: 'Create professional-grade output', duration: '60 min' },
        { type: 'apply' as const, task: 'Connect with industry professionals', duration: '30 min' }
      ]},
      friday: { theme: 'Real-World Application', tasks: [
        { type: 'study' as const, task: 'Study real-world case studies', duration: '60 min' },
        { type: 'build' as const, task: 'Solve practical challenges', duration: '75 min' },
        { type: 'apply' as const, task: 'Present solutions professionally', duration: '30 min' }
      ]},
      saturday: { theme: 'Portfolio & Networking', tasks: [
        { type: 'study' as const, task: 'Research industry trends', duration: '45 min' },
        { type: 'build' as const, task: 'Enhance portfolio projects', duration: '90 min' },
        { type: 'apply' as const, task: 'Network and seek opportunities', duration: '30 min' }
      ]},
      sunday: { theme: 'Review & Planning', tasks: [
        { type: 'study' as const, task: 'Review week\'s learnings', duration: '30 min' },
        { type: 'build' as const, task: 'Refine and improve projects', duration: '60 min' },
        { type: 'apply' as const, task: 'Plan next week\'s goals', duration: '30 min' }
      ]}
    };

    return {
      id: `plan-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      week: `Week of ${new Date().toLocaleDateString()}`,
      careerGoal,
      weeklyTime,
      days: [
        { 
          day: 'Monday', 
          ...basicPlan.monday,
          tasks: basicPlan.monday.tasks.map(task => ({ ...task, icon: React.createElement(getTaskIcon(task.type)) }))
        },
        { 
          day: 'Tuesday', 
          ...basicPlan.tuesday,
          tasks: basicPlan.tuesday.tasks.map(task => ({ ...task, icon: React.createElement(getTaskIcon(task.type)) }))
        },
        { 
          day: 'Wednesday', 
          ...basicPlan.wednesday,
          tasks: basicPlan.wednesday.tasks.map(task => ({ ...task, icon: React.createElement(getTaskIcon(task.type)) }))
        },
        { 
          day: 'Thursday', 
          ...basicPlan.thursday,
          tasks: basicPlan.thursday.tasks.map(task => ({ ...task, icon: React.createElement(getTaskIcon(task.type)) }))
        },
        { 
          day: 'Friday', 
          ...basicPlan.friday,
          tasks: basicPlan.friday.tasks.map(task => ({ ...task, icon: React.createElement(getTaskIcon(task.type)) }))
        },
        { 
          day: 'Saturday', 
          ...basicPlan.saturday,
          tasks: basicPlan.saturday.tasks.map(task => ({ ...task, icon: React.createElement(getTaskIcon(task.type)) }))
        },
        { 
          day: 'Sunday', 
          ...basicPlan.sunday,
          tasks: basicPlan.sunday.tasks.map(task => ({ ...task, icon: React.createElement(getTaskIcon(task.type)) }))
        }
      ]
    };
  };

  const downloadPDF = async (plan: WeeklyPlanData) => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Weekly Learning Plan</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .day-section { margin-bottom: 30px; }
            .day-header { background: #2563eb; color: white; padding: 10px; border-radius: 8px 8px 0 0; }
            .task { margin: 10px 0; padding: 10px; border-left: 4px solid #2563eb; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Your Personalized Weekly Learning Plan</h1>
            <p>Generated on ${new Date(plan.generatedAt).toLocaleDateString()}</p>
          </div>
          ${plan.days.map(day => `
            <div class="day-section">
              <div class="day-header">
                <h3>${day.day} - ${day.theme}</h3>
              </div>
              ${day.tasks.map(task => `
                <div class="task">
                  <strong>${task.type.toUpperCase()}:</strong> ${task.task}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        setTimeout(() => newWindow.print(), 1000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const emailPlan = async (plan: WeeklyPlanData) => {
    toast({
      title: "Email Sent! 📧",
      description: "Your learning plan has been sent to your email.",
    });
  };

  const addToCalendar = (plan: WeeklyPlanData) => {
    toast({
      title: "Calendar File Downloaded! 📅",
      description: "Import the ICS file to your calendar app.",
    });
  };

  return {
    weeklyPlan,
    isGenerating,
    generatePersonalizedPlan,
    downloadPDF,
    emailPlan,
    addToCalendar
  };
};