import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, EyeOff, Eye, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/auth-api/authApi';
import AuthLayout from '../layouts/AuthLayout';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';

import PasswordInput from '../components/common/PasswordInput';
import SubmitButton from '../components/common/SubmitButton';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    mode: 'onTouched'
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Password Reset Successful"
        subtitle="Your password has been successfully updated."
      >
        <div className="text-center space-y-6 mt-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="font-body-lg text-on-surface-variant">
            You can now log in using your new password.
          </p>
          <div className="pt-6 w-full">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary-container bg-primary-container hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Your new password must be different from previous used passwords."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md mt-6">

        {apiError && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg font-body-sm mb-4">
            {apiError}
          </div>
        )}

        {/* Password Input */}
        <div className="space-y-base">
          <PasswordInput
            id="password"
            label="New Password *"
            error={errors.password}
            showErrorText={false} // Using strength meter visual
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
                return true;
              }
            }}
          />

          <PasswordStrengthMeter
            password={passwordValue}
          />
        </div>

        {/* Confirm Password Input */}
        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password *"
          error={errors.confirmPassword}
          register={register}
          registerOptions={{
            required: 'Please confirm your new password',
            validate: (val) => val === watch('password') || "Passwords do not match"
          }}
        />

        {/* Submit Action */}
        <div className="pt-stack-sm">
          <SubmitButton
            text="Update Password"
            loadingText="Updating Password..."
            loading={loading}
            disabled={!isValid}
          />
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
