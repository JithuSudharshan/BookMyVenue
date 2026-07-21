import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, UserCircle2, Store, ArrowRight, Loader2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { authApi } from '../api/auth-api/authApi';
import { AuthContext } from '../store/AuthContext';
import { toast } from 'sonner';

const SignupSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const googleToken = searchParams.get('google_token');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSelection = async (role) => {
    if (googleToken) {
      // User is completing Google Signup
      setLoading(true);
      try {
        await authApi.completeGoogleSignup(googleToken, role);
        login(); // Context login to load user and set state
        toast.success('Account created successfully!');
        
        if (role === 'admin') navigate('/admin/dashboard', { replace: true });
        else if (role === 'vendor') navigate('/vendor/dashboard', { replace: true });
        else navigate('/', { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to complete Google Sign-Up.');
        setLoading(false);
      }
    } else {
      // Normal flow
      if (role === 'user') navigate('/customer-signup');
      else if (role === 'vendor') navigate('/vendor-signup');
    }
  };

  return (
    <AuthLayout 
      title="Join BookMyVenue" 
      subtitle={googleToken ? "You're almost there! Choose your account type to finish Google Sign-In." : "How would you like to use our platform?"}
    >
      <div className="space-y-6 mt-4">

        {/* Customer Selection Card */}
        <button 
          onClick={() => handleSelection('user')}
          disabled={loading}
          className="w-full text-left bg-surface-container-low border border-outline-variant hover:border-primary hover:shadow-md transition-all p-6 rounded-xl group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="flex items-start">
            <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <UserCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">I am a Customer</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">I want to find, book, and manage premium venues for my upcoming events.</p>
            </div>
            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity self-center flex items-center">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
            </div>
          </div>
        </button>

        {/* Vendor Selection Card */}
        <button 
          onClick={() => handleSelection('vendor')}
          disabled={loading}
          className="w-full text-left bg-surface-container-low border border-outline-variant hover:border-primary hover:shadow-md transition-all p-6 rounded-xl group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="flex items-start">
            <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <Store className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">I am a Vendor</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">I own or manage a venue and want to list it for customers to book.</p>
            </div>
            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity self-center flex items-center">
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
            </div>
          </div>
        </button>

      </div>

      {/* Footer Login Link */}
      <p className="mt-stack-lg text-center font-body-sm text-body-sm text-on-surface-variant">
          Already have an account? 
          <Link to="/login" className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors font-semibold ml-1">
              Login
          </Link>
      </p>
    </AuthLayout>
  );
};

export default SignupSelection;
