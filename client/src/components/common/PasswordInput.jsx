import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import InputField from './InputField';

const PasswordInput = ({ 
  id = 'password', 
  label = 'Password', 
  placeholder = '••••••••', 
  error, 
  register, 
  registerOptions,
  showErrorText = true // Added flag since SignupForm handles errors visually with strength meter
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  const rightElement = (
    <button 
      type="button" 
      className="text-on-surface-variant hover:text-primary focus:outline-none transition-colors"
      onClick={toggleVisibility}
      tabIndex="-1" // Prevent tab focusing on the eye icon
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  return (
    <InputField 
      id={id}
      label={label}
      type={showPassword ? 'text' : 'password'}
      placeholder={placeholder}
      icon={Lock}
      error={showErrorText ? error : (error ? { message: '' } : undefined)} // Clear message if visual error is turned off but still want red border
      register={register}
      registerOptions={registerOptions}
      rightElement={rightElement}
    />
  );
};

export default PasswordInput;
