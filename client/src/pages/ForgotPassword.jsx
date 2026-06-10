import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, MailCheck, RefreshCw } from 'lucide-react';
import { authApi } from '../api/auth-api/authApi';
import AuthLayout from '../layouts/AuthLayout';

const ForgotPassword = () => {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Handle the countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const onSubmit = async (data) => {
    await sendResetLink(data.email.trim().toLowerCase());
  };

  const sendResetLink = async (email) => {
    setLoading(true);
    setApiError('');
    try {
      await authApi.forgotPassword(email);
      setSubmittedEmail(email);
      setResendTimer(60); // 60 seconds cooldown
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (resendTimer === 0 && submittedEmail) {
      sendResetLink(submittedEmail);
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      {!submittedEmail ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md mt-6">
          {apiError && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg font-body-sm mb-4">
              {apiError}
            </div>
          )}
          {/* Email Input */}
          <div className="space-y-base">
            <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="email">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                })}
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.email && <p className="text-error font-label-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Submit Action */}
          <div className="pt-stack-sm">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary-container bg-primary-container hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mb-2">
            <MailCheck className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-title-lg text-on-surface">Check your email</h3>
            <p className="font-body-md text-on-surface-variant">
              We've sent a password reset link to <span className="font-semibold text-primary">{submittedEmail}</span>.
            </p>
            <p className="font-body-sm opacity-80 text-on-surface-variant pt-2">
              Please check your spam folder if you don't see it within a few minutes.
            </p>
          </div>

          {apiError && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg font-body-sm w-full">
              {apiError}
            </div>
          )}

          <button 
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
            className="flex items-center justify-center gap-2 font-label-md text-label-md text-primary hover:text-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed pt-4 focus:outline-none"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'}`} />
            )}
            {resendTimer > 0 ? `Resend email in ${resendTimer}s` : 'Click to resend'}
          </button>
        </div>
      )}

      {/* Back to Login */}
      <div className="mt-8 pt-6 flex justify-center w-full border-t border-outline-variant/20">
        <Link to="/login" className="flex items-center text-on-surface-variant hover:text-primary transition-colors font-semibold font-label-sm text-label-sm group">
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
