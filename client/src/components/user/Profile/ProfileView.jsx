import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema, addressSchema } from '../../../validations/profileValidation.js';
import FormField from '../../common/profileUi/FormField';
import InfoRow from '../../common/profileUi/InfoRow';
import ProfilePanel from '../../common/profileUi/ProfilePanel';

/* ── Inline edit: Personal Info ── */
function PersonalInfoForm({ profile, onSave, onCancel }) {
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: profile.firstName || '',
      lastName:  profile.lastName  || '',
      phone:     profile.phone     || '',
    },
  });

  React.useEffect(() => {
    reset({
      firstName: profile.firstName || '',
      lastName:  profile.lastName  || '',
      phone:     profile.phone     || '',
    });
  }, [profile, reset]);

  const onSubmit = async (data) => {
    try {
      await onSave(data);
    } catch (err) {
      setError('root.serverError', {
        type: 'manual',
        message: err.message || 'Failed to save.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.serverError && (
        <div className="pf-form-error-banner">{errors.root.serverError.message}</div>
      )}
      <div className="pf-form-panel-body pf-two-col" style={{ padding: '16px 22px' }}>
        <FormField label="First Name" id="ed-firstName" required
          placeholder="e.g. Aarav" disabled={isSubmitting}
          error={errors.firstName} {...register('firstName')} />
        <FormField label="Last Name" id="ed-lastName" required
          placeholder="e.g. Sharma" disabled={isSubmitting}
          error={errors.lastName} {...register('lastName')} />
        <div className="pf-full-col">
          <FormField label="Phone Number" id="ed-phone" type="tel" required
            placeholder="e.g. 9876543210" disabled={isSubmitting}
            error={errors.phone} {...register('phone')} />
        </div>
      </div>
      <div className="pf-form-action-bar" style={{ padding: '0 22px 16px' }}>
        <button type="button" className="pf-cancel-btn" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="pf-edit-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

/* ── Inline edit: Address ── */
function AddressForm({ profile, onSave, onCancel }) {
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(addressSchema),
    mode: 'onChange',
    defaultValues: {
      street:   profile.street   || '',
      city:     profile.city     || '',
      district: profile.district || '',
      state:    profile.state    || '',
      pinCode:  profile.pinCode  || '',
    },
  });

  React.useEffect(() => {
    reset({
      street:   profile.street   || '',
      city:     profile.city     || '',
      district: profile.district || '',
      state:    profile.state    || '',
      pinCode:  profile.pinCode  || '',
    });
  }, [profile, reset]);

  const onSubmit = async (data) => {
    try {
      await onSave({ ...data, country: 'India' });
    } catch (err) {
      setError('root.serverError', {
        type: 'manual',
        message: err.message || 'Failed to save.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.serverError && (
        <div className="pf-form-error-banner">{errors.root.serverError.message}</div>
      )}
      <div className="pf-form-panel-body pf-one-col" style={{ padding: '16px 22px' }}>
        <FormField label="Street Address" id="ed-street"
          placeholder="e.g. 123 Main St, Apartment 4B" disabled={isSubmitting}
          error={errors.street} {...register('street')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="City" id="ed-city" placeholder="e.g. Kochi"
            disabled={isSubmitting} error={errors.city} {...register('city')} />
          <FormField label="District" id="ed-district" placeholder="e.g. Ernakulam"
            disabled={isSubmitting} error={errors.district} {...register('district')} />
          <FormField label="State" id="ed-state" placeholder="e.g. Kerala"
            disabled={isSubmitting} error={errors.state} {...register('state')} />
          <FormField label="PIN Code" id="ed-pinCode" placeholder="e.g. 682001"
            disabled={isSubmitting} error={errors.pinCode} {...register('pinCode')} />
        </div>
      </div>
      <div className="pf-form-action-bar" style={{ padding: '0 22px 16px' }}>
        <button type="button" className="pf-cancel-btn" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="pf-edit-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

/* ── Main ProfileView ── */
function ProfileView({
  profile,
  editingSection,
  onEditPersonal,
  onEditAddress,
  onSavePersonal,
  onSaveAddress,
  onCancelEdit,
}) {
  const { firstName, lastName, email, phone, street, city, district, state, pinCode } = profile;
  const hasAddress = street || city || district || state || pinCode;

  return (
    <div className="pf-animate">
      <div className="pf-panels">
        {/* ── Personal Information Panel ── */}
        <ProfilePanel
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
          title="Personal Information"
          onEdit={onEditPersonal}
          isEditing={editingSection === 'personal'}
        >
          {editingSection === 'personal' ? (
            <PersonalInfoForm
              profile={profile}
              onSave={onSavePersonal}
              onCancel={onCancelEdit}
            />
          ) : (
            <div className="pf-panel-body">
              <div className="pf-info-list" style={{ padding: 0 }}>
                <InfoRow label="First Name"    value={firstName} />
                <InfoRow label="Last Name"     value={lastName}  />
                <InfoRow label="Phone Number"  value={phone}     />
                <InfoRow label="Account Email" value={email}     />
              </div>
            </div>
          )}
        </ProfilePanel>

        {/* ── Address Panel ── */}
        <ProfilePanel
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          }
          title="Primary Address"
          onEdit={onEditAddress}
          isEditing={editingSection === 'address'}
          showEditButton={hasAddress}
        >
          {editingSection === 'address' ? (
            <AddressForm
              profile={profile}
              onSave={onSaveAddress}
              onCancel={onCancelEdit}
            />
          ) : (
            <div className="pf-panel-body">
              <div className="pf-info-list" style={{ padding: 0 }}>
                {hasAddress ? (
                  <>
                    <InfoRow label="Street Address" value={street}   />
                    <InfoRow label="City"           value={city}     />
                    <InfoRow label="District"       value={district} />
                    <InfoRow label="State"          value={state}    />
                    <InfoRow label="PIN Code"       value={pinCode}  />
                  </>
                ) : (
                  <div className="pf-empty-address">
                    <div className="pf-empty-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <p className="pf-empty-text">No address added yet. Complete your profile setup.</p>
                    <button className="pf-edit-btn" onClick={onEditAddress}>Add Address</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </ProfilePanel>
      </div>
    </div>
  );
}

export default ProfileView;
