import React from 'react';
import { Building2 } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <main className="flex w-full min-h-screen flex-col lg:flex-row">
      {/* Left Side: Hero Image & Branding (Fixed Padding Issue) */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-brand-dark overflow-hidden flex-col justify-end">
        {/* Background Image - Now completely fills the screen without padding */}
        <img 
          alt="Premium Event Space" 
          className="absolute inset-0 w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop" 
        />
        {/* Red Gradient Overlay for Brand Identity & Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Brand Content */}
        <div className="relative z-10 max-w-xl text-on-primary p-margin-desktop">
          <div className="flex items-center space-x-2 mb-stack-lg">
            <Building2 className="text-4xl w-10 h-10" />
            <span className="font-headline-sm text-headline-sm tracking-tight font-bold">BookMyVenue</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl mb-stack-md text-white">Find and Book the Perfect Venue</h1>
          <p className="font-body-lg text-body-lg text-primary-fixed-dim">Join thousands of premium event planners and vendors in securing the world's most prestigious spaces.</p>
        </div>
      </section>

      {/* Right Side: Auth Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-container-lowest">
        <div className="w-full max-w-md">
          {/* Mobile Logo (Visible only on smaller screens) */}
          <div className="flex items-center space-x-2 mb-stack-lg lg:hidden text-primary">
            <Building2 className="text-3xl w-8 h-8" />
            <span className="font-headline-sm text-headline-sm tracking-tight font-bold">BookMyVenue</span>
          </div>
          
          {/* Form Header */}
          <div className="mb-stack-lg">
            <h2 className="font-headline-lg-mobile lg:font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mb-base">{title}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
          </div>

          {/* Dynamic Form Content */}
          {children}

        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
