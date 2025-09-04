import { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export function Captcha({ onVerify, className = '' }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setIsValid(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const valid = userInput.toLowerCase() === captchaText.toLowerCase() && userInput.length > 0;
    setIsValid(valid);
    onVerify(valid);
  }, [userInput, captchaText, onVerify]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="captcha">Verification Code</Label>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center bg-muted border rounded px-3 py-2 font-mono text-lg font-semibold tracking-wider min-w-[120px] select-none">
          {captchaText}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateCaptcha}
          className="p-2"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <Input
        id="captcha"
        type="text"
        placeholder="Enter the code above"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className={isValid ? 'border-green-500' : userInput ? 'border-destructive' : ''}
      />
      {userInput && !isValid && (
        <p className="text-sm text-destructive">Verification code does not match</p>
      )}
      {isValid && (
        <p className="text-sm text-green-600">Verification successful</p>
      )}
    </div>
  );
}