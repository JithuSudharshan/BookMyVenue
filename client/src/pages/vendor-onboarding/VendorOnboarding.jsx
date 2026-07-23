import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApi } from '../../api/vendor-api/vendorApi';
import { toast } from 'sonner';
import { Building2, CheckCircle2 } from 'lucide-react';
import Step1PersonalInfo from './Step1PersonalInfo';
import Step2AddressRole from './Step2AddressRole';
import Step3IdentityVerify from './Step3IdentityVerify';

const VendorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await vendorApi.getOnboardingStatus();
      if (res.onboardingStatus === 'approved') {
        navigate('/vendor-dashboard');
        return;
      }
      
      // Determine starting step
      if (res.onboardingStep) {
        // If step 3 is completed and status is under_review or requested, stay on 3 to let them review
        if (['under_review', 'requested', 'approved'].includes(res.onboardingStatus)) {
          setCurrentStep(3);
        } else {
          setCurrentStep(Math.min(res.onboardingStep + 1, 3));
        }
      }
    } catch (err) {
      toast.error('Failed to load profile status.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmitFinal = async () => {
    setSubmitting(true);
    try {
      await vendorApi.submitForReview();
      toast.success('Application submitted successfully!');
      navigate('/vendor/application-status');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">Loading...</div>;



  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-primary">
          <Building2 className="w-8 h-8" />
          <span className="font-headline-sm font-bold tracking-tight">Vendor Setup</span>
        </div>
        <div className="text-on-surface-variant font-label-md">
          Step {currentStep} of 3
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 overflow-hidden relative">
        
        {/* Progress Tracker */}
        <div className="w-full max-w-2xl mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container -translate-y-1/2 rounded-full overflow-hidden">
             <div 
               className="h-full bg-primary transition-all duration-500 ease-out" 
               style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
             />
          </div>
          <div className="flex justify-between relative z-10">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-label-lg transition-colors duration-300 ${
                  currentStep === step ? 'bg-primary text-white shadow-md ring-4 ring-primary-container' : 
                  currentStep > step ? 'bg-primary/20 text-primary' : 'bg-surface border-2 border-outline-variant text-outline'
                }`}
              >
                {currentStep > step ? <CheckCircle2 className="w-6 h-6" /> : step}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1 text-sm font-label-sm text-on-surface-variant">
            <span>Personal Info</span>
            <span>Address & Role</span>
            <span>Identity</span>
          </div>
        </div>

        {/* Wizard Container */}
        <div className="w-full max-w-2xl bg-surface rounded-3xl shadow-md border border-outline-variant overflow-hidden relative min-h-[500px]">
          <div className="p-6 sm:p-10 h-full flex flex-col">
             {currentStep === 1 && <Step1PersonalInfo onNext={handleNext} />}
             {currentStep === 2 && <Step2AddressRole onNext={handleNext} onBack={handleBack} />}
             {currentStep === 3 && <Step3IdentityVerify onBack={handleBack} onSubmit={handleSubmitFinal} submitting={submitting} />}
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default VendorOnboarding;

