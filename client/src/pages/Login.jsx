import React, { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { authApi } from '../api/auth-api/authApi';
import AuthLayout from '../layouts/AuthLayout';
import { AuthContext } from '../store/AuthContext';
import { toast } from 'sonner';

import InputField from '../components/common/InputField';
import PasswordInput from '../components/common/PasswordInput';
import SubmitButton from '../components/common/SubmitButton';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      toast.error(errorParam);
    }
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login({
        email: data.email.trim().toLowerCase(),
        password: data.password
      });
      login();
      toast.success('Logged in successfully!');
      
      const role = res.role;
      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend OAuth initialization endpoint without a specific role
    window.location.href = 'http://localhost:5002/api/auth/google';
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Please enter your details to sign in to your account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-md">

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
        <div className="pt-stack-sm space-y-4">
          <SubmitButton text="Login" loadingText="Signing in..." loading={loading} />
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink-0 mx-4 text-on-surface-variant font-label-sm">or</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center py-3 px-4 border border-outline-variant rounded-lg shadow-sm bg-surface hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            <span className="font-label-md text-on-surface font-semibold">Continue with Google</span>
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
