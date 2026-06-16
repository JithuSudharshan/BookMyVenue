import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    // Placeholder for actual API call
    console.log('Reset link sent to:', data.email);
    setSubmitted(true);
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
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
                type="text" 
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary-container bg-primary-container hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
            >
              Send Reset Link
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-success/10 text-success p-6 rounded-lg text-center space-y-4">
          <p className="font-body-md">We've sent a password reset link to your email.</p>
          <p className="font-body-sm opacity-80">Please check your spam folder if you don't see it within a few minutes.</p>
        </div>
      )}

      {/* Back to Login */}
      <div className="mt-stack-lg flex justify-center">
        <Link to="/login" className="flex items-center text-primary hover:text-primary-container transition-colors font-semibold font-label-sm text-label-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
