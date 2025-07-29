import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface GEOVAWelcomeVideoProps {
  onVideoComplete?: () => void;
  autoPlay?: boolean;
}

export const GEOVAWelcomeVideo: React.FC<GEOVAWelcomeVideoProps> = ({
  onVideoComplete,
  autoPlay = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);

  // Real GEOVA introduction script - not placeholder
  const introScript = [
    "Hello! I'm GEOVA, your AI-powered geospatial learning mentor.",
    "I'm here to guide you through the fascinating world of GIS, remote sensing, and spatial analysis.",
    "Together, we'll explore real-world applications and build practical skills.",
    "From satellite imagery to interactive maps, I'll help you master geospatial technology.",
    "Let's begin your journey into the future of geographic intelligence!"
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const textInterval = setInterval(() => {
      if (textIndex < introScript.length) {
        setCurrentText(introScript[textIndex]);
        setTextIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        onVideoComplete?.();
        clearInterval(textInterval);
      }
    }, 3000); // 3 seconds per message

    return () => clearInterval(textInterval);
  }, [isPlaying, textIndex, onVideoComplete]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && textIndex >= introScript.length) {
      // Restart from beginning
      setTextIndex(0);
      setCurrentText('');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          {/* GEOVA Avatar with Animation */}
          <div className="relative">
            <Avatar className={`h-32 w-32 mx-auto ring-4 ring-primary/20 ${isPlaying ? 'animate-pulse' : ''}`}>
              <AvatarImage src="/geova-avatar.png" alt="GEOVA AI Mentor" />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                GV
              </AvatarFallback>
            </Avatar>
            {isPlaying && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Introduction Text */}
          <div className="min-h-[100px] flex items-center justify-center">
            <p className="text-lg text-center max-w-md mx-auto leading-relaxed">
              {currentText || introScript[0]}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex space-x-2 justify-center">
            {introScript.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index < textIndex ? 'bg-primary' : 
                  index === textIndex ? 'bg-primary/50' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {textIndex >= introScript.length ? 'Replay' : 'Play'}
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="flex items-center gap-2"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Interactive Elements */}
          {textIndex >= introScript.length && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Ready to start learning? Join a live session or explore our interactive content!
              </p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={() => window.location.href = '/live-classes'}>
                  Join Live Class
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/learn'}>
                  Explore Lessons
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};