import React from 'react';
import { Loader2, Briefcase } from 'lucide-react';
import { useStep2Form } from '../../hooks/vendor-onboarding/useStep2Form';

const Step2AddressRole = ({ onNext, onBack }) => {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    loading,
    selectedRole,
    handleRoleSelect,
  } = useStep2Form(onNext);

  const roles = [
    { id: 'owner', label: 'Owner', desc: 'Sole proprietor or majority owner' },
    { id: 'co-owner', label: 'Co-owner', desc: 'Joint owner of the business' },
    { id: 'partner', label: 'Partner', desc: 'Business partner' },
    { id: 'manager', label: 'Manager', desc: 'Operations or general manager' },
    { id: 'authorized_representative', label: 'Auth. Rep', desc: 'Legally authorized representative' },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="font-headline-sm mb-1">Address & Role</h2>
          <p className="text-on-surface-variant font-body-sm">Your business address and your authority level.</p>
        </div>

        <div>
          <h3 className="font-label-lg mb-3 flex items-center text-on-surface">
            <Briefcase className="w-4 h-4 mr-2" />
            Your Role in Business *
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {roles.map((role) => (
              <div 
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`cursor-pointer p-3 rounded-xl border transition-all ${
                  selectedRole === role.id 
                    ? 'border-primary bg-primary-container text-on-primary-container ring-1 ring-primary' 
                    : 'border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <div className="font-label-md font-bold">{role.label}</div>
                <div className="text-xs mt-1 opacity-80">{role.desc}</div>
              </div>
            ))}
          </div>
          {errors.roleInBusiness && <p className="text-error text-xs mt-1">{errors.roleInBusiness.message}</p>}
        </div>

        <div className="pt-4 border-t border-outline-variant">
          <h3 className="font-label-lg mb-3 text-on-surface">Business/Personal Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-label-md text-on-surface">Address Line 1 *</label>
              <input
                type="text"
                {...register('address.line1')}
                className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.address?.line1 ? 'border-error' : 'border-outline-variant'}`}
                placeholder="Street address, building name"
              />
              {errors.address?.line1 && <p className="text-error text-xs mt-1">{errors.address.line1.message}</p>}
            </div>
            
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-label-md text-on-surface">Address Line 2</label>
              <input
                type="text"
                {...register('address.line2')}
                className="w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Apartment, suite, unit etc. (optional)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-label-md text-on-surface">City *</label>
              <input
                type="text"
                {...register('address.city')}
                className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.address?.city ? 'border-error' : 'border-outline-variant'}`}
              />
              {errors.address?.city && <p className="text-error text-xs mt-1">{errors.address.city.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-label-md text-on-surface">State *</label>
              <input
                type="text"
                {...register('address.state')}
                className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.address?.state ? 'border-error' : 'border-outline-variant'}`}
              />
              {errors.address?.state && <p className="text-error text-xs mt-1">{errors.address.state.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-label-md text-on-surface">Pincode *</label>
              <input
                type="text"
                {...register('address.pincode')}
                className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.address?.pincode ? 'border-error' : 'border-outline-variant'}`}
              />
              {errors.address?.pincode && <p className="text-error text-xs mt-1">{errors.address.pincode.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-label-md text-on-surface">Country *</label>
              <input
                type="text"
                {...register('address.country')}
                className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${errors.address?.country ? 'border-error' : 'border-outline-variant'}`}
              />
              {errors.address?.country && <p className="text-error text-xs mt-1">{errors.address.country.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-outline-variant flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-surface border border-outline-variant text-on-surface rounded-xl font-label-lg hover:bg-surface-container-low transition shadow-sm"
        >
          ← Back
        </button>
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

export default Step2AddressRole;
