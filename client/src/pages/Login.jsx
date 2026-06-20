import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { authApi } from '../api/auth-api/authApi';
import AuthLayout from '../layouts/AuthLayout';
import { AuthContext } from '../store/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
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
      login(res);
      
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
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email format'
                }
              })}
              id="email" 
              type="text" 
              placeholder="Enter your email" 
              className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary focus:border-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface placeholder:text-secondary-fixed-dim focus:outline-none focus:ring-2 transition-shadow`}
            />
          </div>
          {errors.email && <p className="text-error font-label-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Input */}
        <div className="space-y-base">
          <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="password">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              {...register('password', { required: 'Password is required' })}
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-error focus:ring-error focus:border-error' : 'border-outline-variant focus:ring-primary focus:border-primary'} rounded-lg bg-surface font-body-md text-body-md text-on-surface placeholder:text-secondary-fixed-dim focus:outline-none focus:ring-2 transition-shadow`}
            />
            {/* Visibility Toggle */}
            <button 
              type="button" 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-error font-label-sm mt-1">{errors.password.message}</p>}
        </div>

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
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary-container bg-primary-container hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
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
