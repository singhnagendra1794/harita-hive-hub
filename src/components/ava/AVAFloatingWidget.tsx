import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { AVAChatInterface } from './AVAChatInterface';
import { useAuth } from '@/contexts/AuthContext';

interface AVAFloatingWidgetProps {
  contextType?: string;
  position?: 'bottom-right' | 'bottom-left';
  initialMessage?: string;
}

export const AVAFloatingWidget: React.FC<AVAFloatingWidgetProps> = ({
  contextType = 'general',
  position = 'bottom-right',
  initialMessage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const { user } = useAuth();

  // Don't show widget if user is not authenticated
  if (!user) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  const toggleWidget = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
    setHasNewMessage(false);
  };

  const closeWidget = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Show notification pulse effect
  useEffect(() => {
    if (initialMessage && !isOpen) {
      setHasNewMessage(true);
    }
  }, [initialMessage, isOpen]);

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Floating Chat Window */}
      {isOpen && !isMinimized && (
        <div className="mb-4 w-96 max-w-[calc(100vw-2rem)]">
          <div className="bg-background border rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-primary/5">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium text-sm">AVA Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    Context: {contextType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeWidget}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Chat Interface */}
            <AVAChatInterface 
              contextType={contextType}
              initialMessage={initialMessage}
              compact
            />
          </div>
        </div>
      )}

      {/* Minimized Header */}
      {isOpen && isMinimized && (
        <div className="mb-4">
          <Button
            onClick={() => setIsMinimized(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          >
            <Brain className="h-4 w-4 mr-2" />
            AVA Assistant
            <Maximize2 className="h-3 w-3 ml-2" />
          </Button>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={toggleWidget}
        className={`
          relative h-14 w-14 rounded-full shadow-lg transition-all duration-200
          ${isOpen ? 'bg-muted hover:bg-muted/80' : 'bg-primary hover:bg-primary/90'}
          ${hasNewMessage ? 'animate-pulse' : ''}
        `}
      >
        {isOpen ? (
          <MessageSquare className="h-6 w-6" />
        ) : (
          <Brain className="h-6 w-6" />
        )}
        
        {/* Notification Badge */}
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="h-2 w-2 bg-white rounded-full animate-ping" />
          </div>
        )}
        
        {/* Context Badge */}
        {contextType !== 'general' && !isOpen && (
          <Badge 
            variant="secondary" 
            className="absolute -bottom-1 left-0 right-0 mx-1 text-xs py-0 px-1 h-4"
          >
            {contextType}
          </Badge>
        )}
      </Button>

      {/* Welcome Tooltip */}
      {!isOpen && hasNewMessage && (
        <div className="absolute bottom-16 right-0 bg-background border rounded-lg shadow-lg p-3 w-64 animate-in slide-in-from-bottom-2">
          <p className="text-sm font-medium mb-1">👋 AVA is ready to help!</p>
          <p className="text-xs text-muted-foreground">
            Ask me about GIS workflows, tools, or spatial analysis.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setHasNewMessage(false)}
            className="absolute top-1 right-1 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};