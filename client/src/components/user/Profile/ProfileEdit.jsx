import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../../validations/profile.validation.js';
import FormInput from '../../common/FormInput';

function ProfileEdit({ profile, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      addressStreet: profile.addressStreet || '',
      addressCity: profile.addressCity || '',
      addressDistrict: profile.addressDistrict || '',
      addressState: profile.addressState || '',
      addressZipCode: profile.addressZipCode || '',
    }
  });

  const onSubmit = async (data) => {
    try {
      await onSave({
        ...data,
        addressCountry: 'India'
      });
    } catch (err) {
      setError('root.serverError', {
        type: 'manual',
        message: err.message || 'Failed to save profile details.'
      });
    }
  };

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.serverError && (
        <div className="form-alert error-alert">
          <span>{errors.root.serverError.message}</span>
        </div>
      )}

      <div className="form-section-card">
        <h3 className="headline-sm section-title">Personal Details</h3>
        <div className="input-grid double-column">
          <FormInput
            label="First Name"
            id="firstName"
            placeholder="e.g. Aarav"
            disabled={isSubmitting}
            required
            error={errors.firstName}
            {...register('firstName')}
          />

          <FormInput
            label="Last Name"
            id="lastName"
            placeholder="e.g. Sharma"
            disabled={isSubmitting}
            required
            error={errors.lastName}
            {...register('lastName')}
          />
        </div>

        <div className="input-grid single-column" style={{ marginTop: 'var(--spacing-stack-md)' }}>
          <FormInput
            label="Phone Number"
            id="phone"
            type="tel"
            placeholder="e.g. 9876543210"
            disabled={isSubmitting}
            required
            error={errors.phone}
            {...register('phone')}
          />
        </div>
      </div>

      <div className="form-section-card" style={{ marginTop: 'var(--spacing-stack-lg)' }}>
        <h3 className="headline-sm section-title">Address Information</h3>
        <div className="input-grid single-column">
          <FormInput
            label="Street Address"
            id="addressStreet"
            placeholder="e.g. X/241, Marine Drive"
            disabled={isSubmitting}
            required
            error={errors.addressStreet}
            {...register('addressStreet')}
          />
        </div>

        <div className="input-grid double-column" style={{ marginTop: 'var(--spacing-stack-md)' }}>
          <FormInput
            label="City"
            id="addressCity"
            placeholder="Kochi"
            disabled={isSubmitting}
            required
            error={errors.addressCity}
            {...register('addressCity')}
          />

          <FormInput
            label="District"
            id="addressDistrict"
            placeholder="Ernakulam"
            disabled={isSubmitting}
            required
            error={errors.addressDistrict}
            {...register('addressDistrict')}
          />
        </div>

        <div className="input-grid double-column" style={{ marginTop: 'var(--spacing-stack-md)' }}>
          <FormInput
            label="State"
            id="addressState"
            placeholder="Kerala"
            disabled={isSubmitting}
            required
            error={errors.addressState}
            {...register('addressState')}
          />

          <FormInput
            label="PIN Code"
            id="addressZipCode"
            placeholder="682001"
            disabled={isSubmitting}
            required
            error={errors.addressZipCode}
            {...register('addressZipCode')}
          />
        </div>
      </div>


      <div className="form-action-row">
        <button
          type="button"
          className="secondary-btn cancel-trigger"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cta-button save-trigger"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}

export default ProfileEdit;
