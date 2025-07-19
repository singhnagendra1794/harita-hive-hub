export type QuizCategory = 
  | 'GIS Basics' 
  | 'Remote Sensing' 
  | 'Python' 
  | 'SQL' 
  | 'QGIS' 
  | 'GeoAI';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: 'multiple-choice' | 'visual';
  imageUrl?: string;
  explanation?: string;
}

export interface QuizResult {
  category: QuizCategory;
  score: number;
  level: SkillLevel;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
}

export interface SkillRecommendation {
  skill: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  courses: CourseRecommendation[];
  priority: 'High' | 'Medium' | 'Low';
}

export interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: SkillLevel;
  url: string;
}

export interface AssessmentReport {
  overallScore: number;
  results: QuizResult[];
  recommendations: SkillRecommendation[];
  strengths: string[];
  weaknesses: string[];
  generatedAt: string;
}