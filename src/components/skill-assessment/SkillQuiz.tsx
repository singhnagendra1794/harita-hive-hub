import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { QuizQuestion, QuizCategory, QuizResult } from '@/types/skill-assessment';
import { quizQuestions } from '@/data/quizQuestions';

interface SkillQuizProps {
  category: QuizCategory;
  onComplete: (result: QuizResult) => void;
  onBack: () => void;
}

export const SkillQuiz: React.FC<SkillQuizProps> = ({ category, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isComplete, setIsComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  
  const categoryQuestions = quizQuestions[category] || [];
  const shuffledQuestions = React.useMemo(() => 
    [...categoryQuestions].sort(() => Math.random() - 0.5).slice(0, 12),
    [categoryQuestions]
  );
  
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / shuffledQuestions.length) * 100;

  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
  }, [timeLeft, isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: selectedAnswer
      }));
      
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
      } else {
        handleQuizComplete();
      }
    }
  };

  const handleQuizComplete = () => {
    setIsComplete(true);
    
    // Calculate score
    let correctCount = 0;
    shuffledQuestions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / shuffledQuestions.length) * 100);
    let level: 'Beginner' | 'Intermediate' | 'Advanced';
    
    if (score >= 80) level = 'Advanced';
    else if (score >= 60) level = 'Intermediate';
    else level = 'Beginner';
    
    const result: QuizResult = {
      category,
      score,
      level,
      correctAnswers: correctCount,
      totalQuestions: shuffledQuestions.length,
      timeSpent: 600 - timeLeft,
      completedAt: new Date().toISOString()
    };
    
    onComplete(result);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(600);
    setIsComplete(false);
    setSelectedAnswer('');
  };

  if (isComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle>Quiz Complete!</CardTitle>
          <CardDescription>
            You've finished the {category} assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your results are being processed...
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetake} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={onBack}>
                View Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p>No questions available for this category.</p>
          <Button onClick={onBack} className="mt-4">Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">{category}</Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <Progress value={progress} className="w-full" />
        <CardDescription>
          Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          
          {currentQuestion.type === 'visual' && currentQuestion.imageUrl && (
            <div className="mb-6">
              <img 
                src={currentQuestion.imageUrl} 
                alt="Question visual"
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          )}
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedAnswer === option
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswer === option
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedAnswer === option && (
                      <div className="w-full h-full rounded-full bg-background scale-50" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            onClick={onBack} 
            variant="outline"
          >
            Back to Categories
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!selectedAnswer}
          >
            {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};