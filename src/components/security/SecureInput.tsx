import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sanitizeInput } from '@/lib/security';
import { validateInput } from '@/lib/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  validation?: {
    required?: boolean;
    type?: string;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
  };
  sanitize?: boolean;
  onSecureChange?: (value: string, isValid: boolean) => void;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  label,
  validation = {},
  sanitize = true,
  onSecureChange,
  value,
  onChange,
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  // Validate input
  const validateField = (val: string) => {
    const validationErrors: string[] = [];

    // Required field check
    if (validation.required && !val.trim()) {
      validationErrors.push('This field is required');
    }

    // Type validation
    if (val && validation.type) {
      if (validation.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        validationErrors.push('Please enter a valid email address');
      }
      if (validation.type === 'url' && !/^https?:\/\/.+\..+/.test(val)) {
        validationErrors.push('Please enter a valid URL');
      }
    }

    // Length validation
    if (val && validation.maxLength && val.length > validation.maxLength) {
      validationErrors.push(`Maximum ${validation.maxLength} characters allowed`);
    }

    // Pattern validation
    if (val && validation.pattern && !validation.pattern.test(val)) {
      validationErrors.push('Invalid format');
    }

    // Custom validation
    if (val && validation.customValidator) {
      const customError = validation.customValidator(val);
      if (customError) {
        validationErrors.push(customError);
      }
    }

    // Check for potential XSS
    if (val !== sanitizeInput(val)) {
      validationErrors.push('Input contains potentially harmful content');
    }

    setErrors(validationErrors);
    const fieldIsValid = validationErrors.length === 0;
    setIsValid(fieldIsValid);
    
    if (onSecureChange) {
      onSecureChange(val, fieldIsValid);
    }

    return fieldIsValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Sanitize input if enabled
    if (sanitize) {
      newValue = sanitizeInput(newValue);
    }
    
    setInputValue(newValue);
    validateField(newValue);
    
    // Call original onChange if provided
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: newValue }
      };
      onChange(syntheticEvent);
    }
  };

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value.toString());
      validateField(value.toString());
    }
  }, [value]);

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className={errors.length > 0 ? 'text-destructive' : ''}>
          {label}
          {validation.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Input
        {...props}
        value={inputValue}
        onChange={handleChange}
        className={`${className || ''} ${errors.length > 0 ? 'border-destructive' : ''}`}
        aria-invalid={errors.length > 0}
        aria-describedby={errors.length > 0 ? `${props.id}-error` : undefined}
      />
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription id={`${props.id}-error`}>
            {errors.join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};