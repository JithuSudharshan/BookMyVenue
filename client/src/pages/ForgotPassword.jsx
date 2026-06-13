import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, MailCheck, RefreshCw } from 'lucide-react';
import { authApi } from '../api/auth-api/authApi';
import AuthLayout from '../layouts/AuthLayout';
import { toast } from 'sonner';

import InputField from '../components/common/InputField';
import SubmitButton from '../components/common/SubmitButton';

const ForgotPassword = () => {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [loading, setLoading] = useState(false);
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
    try {
      await authApi.forgotPassword(email);
      setSubmittedEmail(email);
      setResendTimer(60); // 60 seconds cooldown
      toast.success('Reset link sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link. Please try again.');
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
          <InputField 
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            error={errors.email}
            register={register}
            registerOptions={{ 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
            }}
          />

          {/* Submit Action */}
          <div className="pt-stack-sm">
            <SubmitButton text="Send Reset Link" loadingText="Sending..." loading={loading} />
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
