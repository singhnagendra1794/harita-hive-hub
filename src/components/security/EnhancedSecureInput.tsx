import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordSecurity, PasswordValidationResult } from '@/lib/passwordSecurity';
import { validateInput } from '@/lib/security';

interface ValidationRule {
  required?: boolean;
  type?: 'email' | 'url' | 'password';
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => string | null;
}

interface EnhancedSecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  validation?: ValidationRule;
  sanitize?: boolean;
  onSecureChange?: (value: string, isValid: boolean, validationResult?: PasswordValidationResult) => void;
  showPasswordStrength?: boolean;
}

export const EnhancedSecureInput: React.FC<EnhancedSecureInputProps> = ({
  label,
  type = 'text',
  value = '',
  validation,
  sanitize = true,
  onSecureChange,
  showPasswordStrength = false,
  className = '',
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string>(String(value));
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const validateField = async (val: string) => {
    const newErrors: string[] = [];
    let validationResult: PasswordValidationResult | undefined;

    if (!validation) {
      setErrors([]);
      setIsValid(true);
      setPasswordStrength(null);
      return;
    }

    // Required validation
    if (validation.required && !val.trim()) {
      newErrors.push(`${label || 'Field'} is required`);
    }

    // Type validation
    if (val && validation.type) {
      switch (validation.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            newErrors.push('Please enter a valid email address');
          }
          break;
        case 'url':
          try {
            new URL(val);
          } catch {
            newErrors.push('Please enter a valid URL');
          }
          break;
        case 'password':
          if (showPasswordStrength) {
            setIsValidating(true);
            try {
              validationResult = await PasswordSecurity.validatePassword(val);
              setPasswordStrength(validationResult);
              if (!validationResult.isValid) {
                newErrors.push(...validationResult.errors);
              }
            } catch (error) {
              console.error('Password validation error:', error);
              newErrors.push('Password validation failed');
            } finally {
              setIsValidating(false);
            }
          }
          break;
      }
    }

    // Length validation
    if (validation.maxLength && val.length > validation.maxLength) {
      newErrors.push(`Maximum length is ${validation.maxLength} characters`);
    }

    // Pattern validation
    if (val && validation.pattern && !validation.pattern.test(val)) {
      newErrors.push('Invalid format');
    }

    // Custom validation
    if (val && validation.customValidator) {
      const customError = validation.customValidator(val);
      if (customError) {
        newErrors.push(customError);
      }
    }

    // Security validation using existing security lib
    if (val) {
      const securityCheck = validateInput(val, {
        value: { required: true, type: 'string', maxLength: validation.maxLength || 1000 }
      });
      if (!securityCheck.isValid) {
        newErrors.push(...securityCheck.errors);
      }
    }

    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
    
    if (onSecureChange) {
      onSecureChange(val, newErrors.length === 0, validationResult);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Sanitize input if enabled
    if (sanitize && type !== 'password') {
      // Basic XSS protection
      newValue = newValue.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      newValue = newValue.replace(/javascript:/gi, '');
      newValue = newValue.replace(/on\w+\s*=/gi, '');
    }

    setInputValue(newValue);
    validateField(newValue);
  };

  // Sync with external value changes
  useEffect(() => {
    if (String(value) !== inputValue) {
      setInputValue(String(value));
      validateField(String(value));
    }
  }, [value]);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const strengthColor = passwordStrength ? PasswordSecurity.getStrengthDescription(passwordStrength.score).color : '';

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id || props.name} className="text-sm font-medium">
          {label}
          {validation?.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          {...props}
          type={inputType}
          value={inputValue}
          onChange={handleChange}
          className={`
            ${className}
            ${!isValid ? 'border-destructive focus:border-destructive' : ''}
            ${type === 'password' ? 'pr-10' : ''}
          `}
        />
        
        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      {showPasswordStrength && passwordStrength && type === 'password' && inputValue && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Password strength:</span>
            <span className={strengthColor}>
              {PasswordSecurity.getStrengthDescription(passwordStrength.score).text}
            </span>
          </div>
          <Progress 
            value={passwordStrength.score} 
            className="h-2"
          />
          {isValidating && (
            <div className="text-xs text-muted-foreground">
              Checking password security...
            </div>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isValid && inputValue && type === 'password' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Password meets security requirements
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};