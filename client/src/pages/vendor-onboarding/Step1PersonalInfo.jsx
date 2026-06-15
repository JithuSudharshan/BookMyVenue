import React, { useContext } from 'react';
import { AuthContext } from '../../store/AuthContext';
import { Camera, Loader2 } from 'lucide-react';
import { useStep1Form } from '../../hooks/vendor-onboarding/useStep1Form';

const Step1PersonalInfo = ({ onNext }) => {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    loading,
    previewImage,
    handleImageChange,
  } = useStep1Form(user, onNext);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="font-headline-sm mb-1">Personal & Contact Info</h2>
          <p className="text-on-surface-variant font-body-sm">Let's start with your basic identity and communication details.</p>
        </div>

        {/* Profile Image Uploader */}
        <div className="flex flex-col items-center sm:items-start mb-6">
          <label className="block text-sm font-label-md text-on-surface mb-2">Profile Image *</label>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-surface-container border-2 border-dashed border-outline flex items-center justify-center overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-outline-variant" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">Full Name *</label>
            <input
              type="text"
              {...register('fullName')}
              className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.fullName ? 'border-error' : 'border-outline-variant'}`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">Email Address *</label>
            <input
              type="email"
              {...register('email')}
              disabled
              className={`w-full px-4 py-2 rounded-xl border bg-surface-container text-on-surface-variant cursor-not-allowed ${errors.email ? 'border-error' : 'border-outline-variant'}`}
            />
            {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">Primary Contact Number *</label>
            <input
              type="tel"
              {...register('phone')}
              className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.phone ? 'border-error' : 'border-outline-variant'}`}
              placeholder="+91 9876543210"
            />
            {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">Alternate Contact Number *</label>
            <input
              type="tel"
              {...register('alternatePhone')}
              className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.alternatePhone ? 'border-error' : 'border-outline-variant'}`}
              placeholder="+91 9876543211"
            />
            {errors.alternatePhone && <p className="text-error text-xs mt-1">{errors.alternatePhone.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">Date of Birth *</label>
            <input
              type="date"
              {...register('dateOfBirth')}
              className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.dateOfBirth ? 'border-error' : 'border-outline-variant'}`}
            />
            {errors.dateOfBirth && <p className="text-error text-xs mt-1">{errors.dateOfBirth.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">Gender *</label>
            <select
              {...register('gender')}
              className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none ${errors.gender ? 'border-error' : 'border-outline-variant'}`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="text-error text-xs mt-1">{errors.gender.message}</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-outline-variant flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-white rounded-xl font-label-lg hover:bg-primary/90 transition shadow-sm disabled:opacity-70 flex items-center space-x-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Next Step →</span>
        </button>
      </div>
    </form>
  );
};

export default Step1PersonalInfo;
