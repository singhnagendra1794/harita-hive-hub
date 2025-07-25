import React from 'react';
import { PasswordSecurity } from '@/lib/passwordSecurity';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showErrors?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showErrors = true
}) => {
  const validation = PasswordSecurity.validatePassword(password);
  const strength = PasswordSecurity.getStrengthDescription(validation.score);
  const isLikelyLeaked = PasswordSecurity.isLikelyLeaked(password);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Password Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Password Strength</span>
          <span className={`text-sm font-medium ${strength.color}`}>
            {strength.text}
          </span>
        </div>
        <Progress value={validation.score} className="h-2" />
      </div>

      {/* Leaked Password Warning */}
      {isLikelyLeaked && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This password appears to be commonly used or leaked. Please choose a different password.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Status */}
      {validation.isValid && !isLikelyLeaked && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your password meets all security requirements.
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {showErrors && validation.errors.length > 0 && (
        <div className="space-y-1">
          <span className="text-sm font-medium text-destructive">
            Password Requirements:
          </span>
          <ul className="text-sm text-muted-foreground space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-destructive rounded-full flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};