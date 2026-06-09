import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, UserCircle2, Store, ArrowRight } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

const SignupSelection = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout 
      title="Join BookMyVenue" 
      subtitle="How would you like to use our platform?"
    >
      <div className="space-y-6 mt-4">
        
        {/* Customer Selection Card */}
        <button 
          onClick={() => navigate('/customer-signup')}
          className="w-full text-left bg-surface-container-low border border-outline-variant hover:border-primary hover:shadow-md transition-all p-6 rounded-xl group relative overflow-hidden"
        >
          <div className="flex items-start">
            <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <UserCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">I am a Customer</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">I want to find, book, and manage premium venues for my upcoming events.</p>
            </div>
            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity self-center">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </button>

        {/* Vendor Selection Card */}
        <button 
          onClick={() => navigate('/vendor-signup')}
          className="w-full text-left bg-surface-container-low border border-outline-variant hover:border-primary hover:shadow-md transition-all p-6 rounded-xl group relative overflow-hidden"
        >
          <div className="flex items-start">
            <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <Store className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">I am a Vendor</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">I own or manage a venue and want to list it for customers to book.</p>
            </div>
            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity self-center">
              <ArrowRight className="w-6 h-6" />
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
