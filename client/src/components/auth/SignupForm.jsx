import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye, User, Phone, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth-api/authApi';
import AuthLayout from '../../layouts/AuthLayout';
import PasswordStrengthMeter from '../common/PasswordStrengthMeter';

import InputField from '../common/InputField';
import PasswordInput from '../common/PasswordInput';
import SubmitButton from '../common/SubmitButton';

const SignupForm = ({ title, subtitle, buttonText, apiCall, googleRole }) => {
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
          <div className="w-1/2">
            <InputField
              id="firstName"
              label="First Name *"
              placeholder="John"
              icon={User}
              error={errors.firstName}
              register={register}
              registerOptions={{
                required: 'First name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
                maxLength: { value: 50, message: 'Maximum 50 characters' },
                pattern: { value: /^[a-zA-Z\s'-]+$/, message: 'Only alphabets allowed' }
              }}
            />
          </div>
          <div className="w-1/2">
            <InputField
              id="lastName"
              label="Last Name"
              placeholder="Doe (Optional)"
              error={errors.lastName}
              register={register}
              registerOptions={{
                maxLength: { value: 50, message: 'Maximum 50 characters' },
                pattern: { value: /^[a-zA-Z\s'-]*$/, message: 'Only alphabets allowed' }
              }}
            />
          </div>
        </div>

        <InputField
          id="email"
          label="Email *"
          type="email"
          placeholder="user@example.com"
          icon={Mail}
          error={errors.email}
          success={emailAvailable}
          register={register}
          registerOptions={{
            required: 'Email is required',
            pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, message: 'Invalid email format' },
            validate: value => !value.includes(' ') || 'Email cannot contain spaces'
          }}
          onBlur={checkEmailUniqueness}
        />

        <InputField
          id="phone"
          label="Phone Number *"
          type="tel"
          placeholder="9876543210"
          icon={Phone}
          error={errors.phone}
          success={phoneAvailable}
          register={register}
          registerOptions={{
            required: 'Phone number is required',
            pattern: { value: /^[6-9]\d{9}$/, message: 'Must be exactly 10 digits starting with 6,7,8,9' }
          }}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setValue('phone', val, { shouldValidate: true });
          }}
          onBlur={checkPhoneUniqueness}
        />

        <div className="space-y-base">
          <PasswordInput
            id="password"
            label="Password *"
            error={errors.password}
            showErrorText={false} // Using strength meter
            register={register}
            registerOptions={{
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
            }}
          />

          <PasswordStrengthMeter
            password={passwordValue}
            firstName={firstNameValue}
            lastName={lastNameValue}
            email={emailValue}
          />
        </div>

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password *"
          error={errors.confirmPassword}
          register={register}
          registerOptions={{
            required: 'Please confirm your password',
            validate: value => value === passwordValue || 'Passwords do not match'
          }}
        />

        <div className="pt-stack-lg space-y-4">
          <SubmitButton
            text={buttonText}
            loadingText="Processing..."
            loading={loading}
            disabled={!isValid}
          />

          {googleRole && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-outline-variant"></div>
                <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm">or</span>
                <div className="flex-grow border-t border-outline-variant"></div>
              </div>

              <button
                type="button"
                onClick={() => { window.location.href = `http://localhost:5001/api/auth/google?role=${googleRole}`; }}
                className="w-full flex justify-center items-center py-3 px-4 border border-outline-variant rounded-lg shadow-sm bg-surface hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                <span className="font-label-md text-on-surface font-semibold">Sign up with Google</span>
              </button>
            </>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupForm;
