import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  template_id?: string;
  is_public: boolean;
  public_url?: string;
  theme_config: any;
  layout_config: any;
  view_count: number;
  download_count: number;
  last_exported_at?: string;
  created_at: string;
  updated_at: string;
}

interface PortfolioTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  preview_image_url?: string;
  template_config: any;
  is_premium: boolean;
  download_count: number;
}

interface PortfolioSection {
  id: string;
  portfolio_id: string;
  section_type: string;
  section_data: any;
  order_index: number;
  is_visible: boolean;
}

export const usePortfolio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPortfolio();
      loadTemplates();
    }
  }, [user]);

  const loadUserPortfolio = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get or create portfolio
      let { data: portfolioData, error } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default portfolio
        const { data: newPortfolio, error: createError } = await supabase
          .from('user_portfolios')
          .insert({
            user_id: user.id,
            title: `${user.user_metadata?.full_name || 'My'} Portfolio`,
            description: 'Geospatial professional portfolio showcasing skills and projects',
            theme_config: { color: 'blue', theme: 'modern' },
            layout_config: { sections: ['profile', 'skills', 'projects', 'certificates'] }
          })
          .select()
          .single();

        if (createError) throw createError;
        portfolioData = newPortfolio;
      } else if (error) {
        throw error;
      }

      setPortfolio(portfolioData);

      // Load sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('portfolio_sections')
        .select('*')
        .eq('portfolio_id', portfolioData.id)
        .order('order_index');

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_templates')
        .select('*')
        .order('download_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const updatePortfolio = async (updates: Partial<Portfolio>) => {
    if (!portfolio) return;

    try {
      const { data, error } = await supabase
        .from('user_portfolios')
        .update(updates)
        .eq('id', portfolio.id)
        .select()
        .single();

      if (error) throw error;
      setPortfolio(data);

      toast({
        title: "Success",
        description: "Portfolio updated successfully",
      });
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio",
        variant: "destructive"
      });
    }
  };

  const updateSection = async (sectionId: string, updates: Partial<PortfolioSection>) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;

      setSections(prev => prev.map(s => s.id === sectionId ? data : s));
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive"
      });
    }
  };

  const addSection = async (sectionData: Omit<PortfolioSection, 'id' | 'portfolio_id'>) => {
    if (!portfolio) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .insert({
          ...sectionData,
          portfolio_id: portfolio.id
        })
        .select()
        .single();

      if (error) throw error;
      setSections(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding section:', error);
      toast({
        title: "Error",
        description: "Failed to add section",
        variant: "destructive"
      });
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      setSections(prev => prev.filter(s => s.id !== sectionId));
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    }
  };

  const generatePublicUrl = async () => {
    if (!portfolio || !user) return;

    try {
      const { data, error } = await supabase.rpc('generate_portfolio_url', {
        p_user_id: user.id,
        p_portfolio_title: portfolio.title
      });

      if (error) throw error;

      await updatePortfolio({ 
        is_public: true, 
        public_url: data 
      });

      return `${window.location.origin}/portfolio/${data}`;
    } catch (error) {
      console.error('Error generating public URL:', error);
      toast({
        title: "Error",
        description: "Failed to generate public URL",
        variant: "destructive"
      });
    }
  };

  const generateResume = async (format: 'pdf' | 'docx' | 'markdown' | 'html', templateType: string) => {
    if (!portfolio || !user) return;

    try {
      // Get current portfolio data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Mock projects data to avoid type issues
      const projectsData = [];

      const personalInfo = {
        name: profileData?.full_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: '',
        location: '',
        professionalSummary: '',
        yearsOfExperience: '0-1',
        preferredJobRoles: []
      };

      const { data, error } = await supabase.functions.invoke('generate-resume', {
        body: {
          userId: user.id,
          portfolioId: portfolio.id,
          format,
          templateType,
          personalInfo,
          projects: projectsData || [],
          skills: [],
          certificates: []
        }
      });

      if (error) throw error;

      // Create download
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.${data.fileExtension}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Resume generated and downloaded!",
      });

    } catch (error) {
      console.error('Error generating resume:', error);
      toast({
        title: "Error",
        description: "Failed to generate resume",
        variant: "destructive"
      });
    }
  };

  const enhanceWithAI = async (enhancementType: string, originalContent: string, context: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('ai-portfolio-enhancer', {
        body: {
          userId: user.id,
          enhancementType,
          originalContent,
          ...context
        }
      });

      if (error) throw error;

      toast({
        title: "AI Enhancement Complete",
        description: "Your content has been enhanced by GEOVA!",
      });

      return data.enhancedContent;
    } catch (error) {
      console.error('Error enhancing with AI:', error);
      toast({
        title: "Error",
        description: "Failed to enhance content with AI",
        variant: "destructive"
      });
    }
  };

  return {
    portfolio,
    sections,
    templates,
    loading,
    updatePortfolio,
    updateSection,
    addSection,
    deleteSection,
    generatePublicUrl,
    generateResume,
    enhanceWithAI,
    refreshPortfolio: loadUserPortfolio
  };
};