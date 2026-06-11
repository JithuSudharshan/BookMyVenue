import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye, User, Phone, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth-api/authApi';
import AuthLayout from '../../layouts/AuthLayout';
import PasswordStrengthMeter from '../PasswordStrengthMeter';

const SignupForm = ({ title, subtitle, buttonText, apiCall }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom states for async validation
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [phoneAvailable, setPhoneAvailable] = useState(null);

  const navigate = useNavigate();

  const { register, handleSubmit, watch, setError, clearErrors, setValue, formState: { errors, isValid } } = useForm({
    mode: 'onTouched'
  });

  const passwordValue = watch('password', '');
  const firstNameValue = watch('firstName', '');
  const lastNameValue = watch('lastName', '');
  const emailValue = watch('email', '');

  // Async Validation Checkers
  const checkEmailUniqueness = async (e) => {
    const email = e.target.value.trim();
    if (!email || errors.email) return;
    
    try {
      const res = await authApi.checkEmail(email);
      if (!res.available) {
        setError('email', { type: 'manual', message: 'This email is already registered.' });
        setEmailAvailable(false);
      } else {
        clearErrors('email');
        setEmailAvailable(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkPhoneUniqueness = async (e) => {
    const phone = e.target.value.replace(/[\s-]/g, '');
    if (!phone || errors.phone || phone.length !== 10) return;
    
    try {
      const res = await authApi.checkPhone(phone);
      if (!res.available) {
        setError('phone', { type: 'manual', message: 'This phone number is already registered.' });
        setPhoneAvailable(false);
      } else {
        clearErrors('phone');
        setPhoneAvailable(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const res = await apiCall({
        firstName: data.firstName ? data.firstName.trim() : '',
        lastName: data.lastName ? data.lastName.trim() : '',
        email: data.email.trim().toLowerCase(),
        phone: data.phone.replace(/[\s-]/g, ''),
        password: data.password
      });
      // Start 60s cooldown for resend email
      localStorage.setItem(`resendTimer_${data.email.trim().toLowerCase()}`, Date.now().toString());
      navigate('/verify-email/pending', { state: { email: data.email } });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
        
        {apiError && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg font-body-sm mb-4">
            {apiError}
          </div>
        )}

        <div className="flex gap-4">
          {/* First Name Input */}
          <div className="space-y-base w-1/2">
            <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="firstName">First Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                <User className="w-5 h-5" />
              </div>
              <input 
                {...register('firstName', { 
                  required: 'First name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                  maxLength: { value: 50, message: 'Maximum 50 characters' },
                  pattern: { value: /^[a-zA-Z\s'-]+$/, message: 'Only alphabets allowed' }
                })}
                id="firstName" 
                type="text" 
                placeholder="John" 
                className={`block w-full pl-10 pr-3 py-3 border ${errors.firstName ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface placeholder:text-secondary-fixed-dim focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.firstName && <p className="text-error font-label-sm mt-1">{errors.firstName.message}</p>}
          </div>

          {/* Last Name Input */}
          <div className="space-y-base w-1/2">
            <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="lastName">Last Name</label>
            <div className="relative">
              <input 
                {...register('lastName', { 
                  maxLength: { value: 50, message: 'Maximum 50 characters' },
                  pattern: { value: /^[a-zA-Z\s'-]*$/, message: 'Only alphabets allowed' }
                })}
                id="lastName" 
                type="text" 
                placeholder="Doe (Optional)" 
                className={`block w-full px-3 py-3 border ${errors.lastName ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface placeholder:text-secondary-fixed-dim focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.lastName && <p className="text-error font-label-sm mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-base">
          <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="email">Email *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, message: 'Invalid email format' },
                validate: value => !value.includes(' ') || 'Email cannot contain spaces'
              })}
              onBlur={(e) => {
                register('email').onBlur(e);
                checkEmailUniqueness(e);
              }}
              id="email" 
              type="email" 
              placeholder="user@example.com" 
              className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-error focus:ring-error' : emailAvailable ? 'border-success focus:ring-success' : 'border-outline-variant focus:ring-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.email && <p className="text-error font-label-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone Input */}
        <div className="space-y-base">
          <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="phone">Phone Number *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Phone className="w-5 h-5" />
            </div>
            <input 
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Must be exactly 10 digits starting with 6,7,8,9' }
              })}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setValue('phone', val, { shouldValidate: true });
              }}
              onBlur={(e) => {
                register('phone').onBlur(e);
                checkPhoneUniqueness(e);
              }}
              id="phone" 
              type="tel" 
              placeholder="9876543210" 
              className={`block w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-error focus:ring-error' : phoneAvailable ? 'border-success focus:ring-success' : 'border-outline-variant focus:ring-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.phone && <p className="text-error font-label-sm mt-1">{errors.phone.message}</p>}
        </div>

        {/* Password Input */}
        <div className="space-y-base">
          <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="password">Password *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                maxLength: { value: 128, message: 'Maximum 128 characters' },
                validate: value => {
                  if (value.length < 8) return false;
                  if (!/[A-Z]/.test(value)) return false;
                  if (!/[a-z]/.test(value)) return false;
                  if (!/[0-9]/.test(value)) return false;
                  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) return false;
                  const lowerVal = value.toLowerCase();
                  if (emailValue && lowerVal.includes(emailValue.split('@')[0].toLowerCase())) return false;
                  if (firstNameValue && lowerVal.includes(firstNameValue.toLowerCase())) return false;
                  if (lastNameValue && lowerVal.includes(lastNameValue.toLowerCase())) return false;
                  return true;
                }
              })}
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2`}
            />
            <button 
              type="button" 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {/* Note: Specific error messages are removed here because the PasswordStrengthMeter provides exact visual feedback */}
          
          <PasswordStrengthMeter 
            password={passwordValue} 
            firstName={firstNameValue} 
            lastName={lastNameValue} 
            email={emailValue} 
          />
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-base">
          <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="confirmPassword">Confirm Password *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === passwordValue || 'Passwords do not match'
              })}
              id="confirmPassword" 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2`}
            />
            <button 
              type="button" 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary focus:outline-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-error font-label-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading || !isValid}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm font-label-lg text-label-lg text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-stack-lg"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Processing...
            </>
          ) : (
            buttonText
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignupForm;
