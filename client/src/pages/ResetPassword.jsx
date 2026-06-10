import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, EyeOff, Eye, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/auth-api/authApi';
import AuthLayout from '../layouts/AuthLayout';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="password">New Password *</label>
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
                  if (!/[A-Z]/.test(value)) return 'Needs an uppercase letter';
                  if (!/[a-z]/.test(value)) return 'Needs a lowercase letter';
                  if (!/[0-9]/.test(value)) return 'Needs a number';
                  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) return 'Needs a special character';
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
          {errors.password && <p className="text-error font-label-sm mt-1">{errors.password.message}</p>}
          
          <PasswordStrengthMeter 
            password={passwordValue} 
          />
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-base">
          <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="confirmPassword">Confirm New Password *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              {...register('confirmPassword', { 
                required: 'Please confirm your new password',
                validate: (val) => val === watch('password') || "Passwords do not match"
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

        {/* Submit Action */}
        <div className="pt-stack-sm">
          <button 
            type="submit" 
            disabled={loading || !isValid}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary-container bg-primary-container hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
