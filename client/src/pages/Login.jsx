import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { authApi } from '../api/auth-api/authApi';
import AuthLayout from '../layouts/AuthLayout';
import { AuthContext } from '../store/AuthContext';

import InputField from '../components/common/InputField';
import PasswordInput from '../components/common/PasswordInput';
import SubmitButton from '../components/common/SubmitButton';

const Login = () => {
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const res = await authApi.login({
        email: data.email.trim().toLowerCase(),
        password: data.password
      });
      login();
      
      const role = res.role;
      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/home');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Please enter your details to sign in to your account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">
        
        {apiError && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg font-body-sm mb-4">
            {apiError}
          </div>
        )}

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
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email format'
            }
          }}
        />

        <PasswordInput 
          id="password"
          label="Password"
          error={errors.password}
          register={register}
          registerOptions={{ required: 'Password is required' }}
        />

        {/* Form Utilities */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <input 
              id="remember-me" 
              type="checkbox" 
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block font-body-sm text-body-sm text-on-surface-variant cursor-pointer">
                Remember me
            </label>
          </div>
          <div className="font-label-sm text-label-sm">
            <Link to="/forgot-password" className="text-primary hover:text-primary-container transition-colors font-semibold">
                Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-stack-sm">
          <SubmitButton text="Login" loadingText="Signing in..." loading={loading} />
        </div>
      </form>

      {/* Footer Sign Up Link */}
      <p className="mt-stack-lg text-center font-body-sm text-body-sm text-on-surface-variant">
          New to BookMyVenue? 
          <Link to="/signup" className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors font-semibold ml-1">
              Sign Up
          </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
