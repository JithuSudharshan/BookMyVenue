import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Info, Clock, CheckCircle } from 'lucide-react';
import { vendorApi } from '../../api/vendor-api/vendorApi';

const VendorLockOverlay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [location.pathname]); // Re-fetch or re-evaluate on path change if needed, but fetchStatus is quick

  const fetchStatus = async () => {
    try {
      const res = await vendorApi.getOnboardingStatus();
      setStatusData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !statusData || statusData.onboardingStatus === 'approved') {
    return null;
  }

  const { onboardingStatus, adminRemarks } = statusData;

  // IMPORTANT EXCEPTION: If the status is requested, under_review, or rejected, 
  // do NOT show the lock modal on the application status page!
  if (
    (onboardingStatus === 'requested' || onboardingStatus === 'under_review' || onboardingStatus === 'rejected') && 
    location.pathname === '/vendor/application-status'
  ) {
    return null;
  }

  let icon, title, description, buttonText, buttonAction, colorTheme, remarksBox;

  switch (onboardingStatus) {
    case 'incomplete':
      icon = (
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner mx-auto">
          <AlertCircle className="w-10 h-10 text-amber-600" />
        </div>
      );
      title = "Welcome to BookMyVenue!";
      description = "We're thrilled to have you here. To unlock your full vendor portal, please take a few moments to complete your business profile.";
      buttonText = "Complete Profile";
      buttonAction = () => navigate('/vendor/onboarding');
      colorTheme = "amber";
      break;
    case 'under_review':
      icon = (
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-inner mx-auto">
          <Info className="w-10 h-10 text-blue-600" />
        </div>
      );
      title = "Application Under Review";
      description = "Thank you for submitting your details. Our team is currently reviewing your profile and will get back to you shortly.";
      buttonText = "View Application Status";
      buttonAction = () => navigate('/vendor/application-status');
      colorTheme = "blue";
      break;
    case 'requested':
      icon = (
        <div className="w-20 h-20 bg-brand-subtle rounded-full flex items-center justify-center mb-6 shadow-inner mx-auto">
          <CheckCircle className="w-10 h-10 text-brand-dark" />
        </div>
      );
      title = "Application Submitted";
      description = "Thank you! Your vendor application has been successfully submitted and is waiting for our team to begin the review process.";
      buttonText = "View Application Status";
      buttonAction = () => navigate('/vendor/application-status');
      colorTheme = "primary";
      break;
    case 'rejected':
      icon = (
        <div className="w-20 h-20 bg-surface-variant rounded-full flex items-center justify-center mb-6 shadow-inner mx-auto">
          <AlertCircle className="w-10 h-10 text-on-surface-variant" />
        </div>
      );
      title = "Application Update";
      description = "Thank you for your interest in BookMyVenue. Unfortunately, we cannot approve your application at this time. Please check your application status for details.";
      if (adminRemarks) {
        remarksBox = (
          <div className="bg-red-50 rounded-xl p-4 ring-1 ring-red-500/20 text-sm text-red-800 text-left mb-8">
            <span className="font-semibold block mb-1 text-red-900">Admin Feedback:</span>
            {adminRemarks}
          </div>
        );
      }
      buttonText = "View Application Status";
      buttonAction = () => navigate('/vendor/application-status');
      colorTheme = "error";
      break;
    default:
      return null;
  }

  return (
    <div className="absolute inset-0 bg-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface/90 border border-outline-variant p-10 rounded-[32px] shadow-2xl max-w-md w-full text-center">
        {icon}
        <h3 className="font-headline-md text-headline-md text-on-surface mb-3 tracking-tight">{title}</h3>
        <p className={`font-body-lg text-body-lg text-on-surface-variant leading-relaxed ${remarksBox ? 'mb-4' : 'mb-8'}`}>
          {description}
        </p>
        
        {remarksBox}
        
        {buttonText && (
          <button
            onClick={buttonAction}
            className={`w-full py-4 px-6 rounded-2xl font-label-lg font-bold shadow-sm transition-transform active:scale-[0.98] ${
              colorTheme === 'amber' ? 'bg-amber-500 text-white hover:bg-amber-600' :
              colorTheme === 'error' ? 'bg-error text-on-error hover:bg-error/90' :
              'bg-primary text-on-primary hover:bg-primary/90'
            }`}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default VendorLockOverlay;
