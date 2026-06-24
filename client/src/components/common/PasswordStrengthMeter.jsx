import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrengthMeter = ({ password = '', firstName = '', lastName = '', email = '' }) => {
  const requirements = [
    { id: 'length', text: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', text: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'lower', text: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'number', text: 'One number', met: /[0-9]/.test(password) },
    { id: 'special', text: 'One special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password) },
    { id: 'personal', text: 'No personal info (name/email)', met: (() => {
        if (!password) return false;
        const p = password.toLowerCase();
        if (email && p.includes(email.split('@')[0].toLowerCase())) return false;
        if (firstName && p.includes(firstName.toLowerCase())) return false;
        if (lastName && p.includes(lastName.toLowerCase())) return false;
        return true;
    })() }
  ];

  const strengthScore = requirements.filter(r => r.met).length;
  
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-error';
  if (strengthScore === 6) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-success';
  } else if (strengthScore >= 4) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-warning';
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-on-surface-variant">Password Strength</span>
        <span className={`text-xs font-bold ${
            strengthLabel === 'Strong' ? 'text-success' : 
            strengthLabel === 'Fair' ? 'text-warning' : 'text-error'
        }`}>{strengthLabel}</span>
      </div>
      
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div 
            key={level} 
            className={`flex-1 rounded-full transition-colors duration-300 ${
              level <= strengthScore ? strengthColor : 'bg-surface-variant'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-3">
        {requirements.map(req => (
          <div key={req.id} className="flex items-center gap-1.5">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <X className="w-3.5 h-3.5 text-on-surface-variant/50" />
            )}
            <span className={`text-xs ${req.met ? 'text-on-surface-variant' : 'text-on-surface-variant/50'}`}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
