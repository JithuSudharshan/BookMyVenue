import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema, addressSchema } from '../../../validations/profile.validation.js';

const FormField = React.forwardRef(({ label, id, required, error, ...rest }, ref) => {
  return (
    <div className="pf-input-group">
      <label htmlFor={id} className="pf-label">
        {label}{required && <span className="pf-required"> *</span>}
      </label>
      <input ref={ref} id={id} className={`pf-input${error ? ' error' : ''}`} {...rest} />
      {error && <p className="pf-error-msg">{error.message}</p>}
    </div>
  );
});

/* ── Display row ── */
function InfoRow({ label, value }) {
  return (
    <div className="pf-info-row">
      <span className="pf-info-label">{label}</span>
      <span className={`pf-info-value${!value ? ' empty' : ''}`}>
        {value || <span className="pf-info-dash">—</span>}
      </span>
    </div>
  );
}

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

/* ── Edit button (reusable) ── */
function EditButton({ onClick, label = 'Edit' }) {
  return (
    <button className="pf-edit-btn" onClick={onClick} aria-label={label}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      {label}
    </button>
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
        <div className="pf-panel">
          <div className="pf-panel-head">
            <div className="pf-panel-title-row">
              <div className="pf-panel-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="pf-panel-title">Personal Information</h3>
            </div>
            {editingSection !== 'personal' && (
              <EditButton onClick={onEditPersonal} label="Edit" />
            )}
          </div>

          {editingSection === 'personal' ? (
            <PersonalInfoForm
              profile={profile}
              onSave={onSavePersonal}
              onCancel={onCancelEdit}
            />
          ) : (
            <div className="pf-info-list">
              <InfoRow label="First Name"    value={firstName} />
              <InfoRow label="Last Name"     value={lastName}  />
              <InfoRow label="Phone Number"  value={phone}     />
              <InfoRow label="Account Email" value={email}     />
            </div>
          )}
        </div>

        {/* ── Address Panel ── */}
        <div className="pf-panel">
          <div className="pf-panel-head">
            <div className="pf-panel-title-row">
              <div className="pf-panel-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="pf-panel-title">Primary Address</h3>
            </div>
            {editingSection !== 'address' && hasAddress && (
              <EditButton onClick={onEditAddress} label="Edit" />
            )}
          </div>

          {editingSection === 'address' ? (
            <AddressForm
              profile={profile}
              onSave={onSaveAddress}
              onCancel={onCancelEdit}
            />
          ) : (
            <div className="pf-info-list">
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
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
