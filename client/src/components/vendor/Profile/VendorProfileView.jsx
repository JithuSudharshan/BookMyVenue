import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorPersonalInfoSchema, vendorAddressSchema, vendorIdentitySchema } from '../../../validations/vendorProfile.validation';
import ProfilePanel from '../../common/ProfileUi/ProfilePanel';
import InfoRow from '../../common/ProfileUi/InfoRow';
import FormField from '../../common/ProfileUi/FormField';
import { vendorApi } from '../../../api/vendor-api/vendorApi';

/* ── Inline edit: Personal Info ── */
function VendorPersonalInfoForm({ profile, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(vendorPersonalInfoSchema),
    defaultValues: {
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      alternatePhone: profile.alternatePhone || '',
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Mock saving for now if the API doesn't exist, but we assume it does via updateProfile
      const response = await vendorApi.updateProfile({ personalInfo: data });
      if (response.success) {
        onSave(response.vendor || response.data);
      } else {
        throw new Error(response.message || 'Failed to update');
      }
    } catch (err) {
      setError('root.serverError', { type: 'manual', message: err.message || 'Failed to save.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.serverError && <div className="pf-form-error-banner">{errors.root.serverError.message}</div>}
      <div className="pf-form-panel-body pf-two-col" style={{ padding: '16px 22px' }}>
        <FormField label="Full Name" id="ed-fullName" required placeholder="e.g. John Doe" disabled={isSubmitting} error={errors.fullName} {...register('fullName')} />
        <FormField label="Gender" id="ed-gender" type="text" placeholder="male / female / other" disabled={isSubmitting} error={errors.gender} {...register('gender')} />
        <FormField label="Phone Number" id="ed-phone" type="tel" required placeholder="e.g. 9876543210" disabled={isSubmitting} error={errors.phone} {...register('phone')} />
        <FormField label="Alternate Phone" id="ed-altPhone" type="tel" placeholder="e.g. 9876543211" disabled={isSubmitting} error={errors.alternatePhone} {...register('alternatePhone')} />
        <FormField label="Date of Birth" id="ed-dob" type="date" disabled={isSubmitting} error={errors.dateOfBirth} {...register('dateOfBirth')} />
      </div>
      <div className="pf-form-action-bar" style={{ padding: '0 22px 16px' }}>
        <button type="button" className="pf-cancel-btn" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="pf-edit-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

/* ── Inline edit: Address ── */
function VendorAddressForm({ profile, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(vendorAddressSchema),
    defaultValues: {
      line1: profile.address?.line1 || '',
      line2: profile.address?.line2 || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      pincode: profile.address?.pincode || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await vendorApi.updateProfile({ address: { ...data, country: 'India' } });
      if (response.success) {
        onSave(response.vendor || response.data);
      } else {
        throw new Error(response.message || 'Failed to update');
      }
    } catch (err) {
      setError('root.serverError', { type: 'manual', message: err.message || 'Failed to save.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.serverError && <div className="pf-form-error-banner">{errors.root.serverError.message}</div>}
      <div className="pf-form-panel-body pf-one-col" style={{ padding: '16px 22px' }}>
        <FormField label="Address Line 1" id="ed-line1" required placeholder="e.g. 123 Main St" disabled={isSubmitting} error={errors.line1} {...register('line1')} />
        <FormField label="Address Line 2" id="ed-line2" placeholder="Apartment, suite, etc." disabled={isSubmitting} error={errors.line2} {...register('line2')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="City" id="ed-city" required placeholder="e.g. Kochi" disabled={isSubmitting} error={errors.city} {...register('city')} />
          <FormField label="State" id="ed-state" required placeholder="e.g. Kerala" disabled={isSubmitting} error={errors.state} {...register('state')} />
          <FormField label="PIN Code" id="ed-pincode" required placeholder="e.g. 682001" disabled={isSubmitting} error={errors.pincode} {...register('pincode')} />
        </div>
      </div>
      <div className="pf-form-action-bar" style={{ padding: '0 22px 16px' }}>
        <button type="button" className="pf-cancel-btn" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="pf-edit-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

/* ── Inline edit: Identity ── */
function VendorIdentityForm({ profile, onSave, onCancel }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(vendorIdentitySchema),
    defaultValues: {
      roleInBusiness: profile.roleInBusiness || '',
      documentType: profile.identity?.documentType || '',
      documentNumber: profile.identity?.documentNumber || '',
    },
  });

  const selectedFile = watch('documentFile');
  const hasNewFile = selectedFile && selectedFile.length > 0;

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('roleInBusiness', data.roleInBusiness);
      formData.append('documentType', data.documentType);
      formData.append('documentNumber', data.documentNumber);
      if (data.documentFile && data.documentFile[0]) {
        formData.append('identityDocument', data.documentFile[0]);
      }

      const response = await vendorApi.updateIdentity(formData);
      if (response.success) {
        onSave(response.vendor || response.data);
      } else {
        throw new Error(response.message || 'Failed to update');
      }
    } catch (err) {
      setError('root.serverError', { type: 'manual', message: err.message || 'Failed to save.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.serverError && <div className="pf-form-error-banner">{errors.root.serverError.message}</div>}
      <div className="pf-form-panel-body pf-two-col" style={{ padding: '16px 22px' }}>
        <div className="pf-input-group">
          <label className="pf-label">Role In Business</label>
          <select className={`pf-input${errors.roleInBusiness ? ' error' : ''}`} disabled={isSubmitting} {...register('roleInBusiness')}>
            <option value="">Select Role</option>
            <option value="owner">Owner</option>
            <option value="co-owner">Co-owner</option>
            <option value="partner">Partner</option>
            <option value="manager">Manager</option>
            <option value="authorized_representative">Authorized Representative</option>
          </select>
          {errors.roleInBusiness && <p className="pf-error-msg">{errors.roleInBusiness.message}</p>}
        </div>

        <div className="pf-input-group">
          <label className="pf-label">Document Type</label>
          <select className={`pf-input${errors.documentType ? ' error' : ''}`} disabled={isSubmitting} {...register('documentType')}>
            <option value="">Select Type</option>
            <option value="aadhar">Aadhar</option>
            <option value="pan">PAN</option>
            <option value="driving_license">Driving License</option>
            <option value="passport">Passport</option>
            <option value="voter_id">Voter ID</option>
          </select>
          {errors.documentType && <p className="pf-error-msg">{errors.documentType.message}</p>}
        </div>

        <div className="pf-full-col">
          <FormField label="Document Number" id="ed-docNumber" required disabled={isSubmitting} error={errors.documentNumber} {...register('documentNumber')} />
        </div>

        {/* ── Replace Document File ── */}
        <div className="pf-full-col pf-input-group">
          <label className="pf-label">
            Replace Document File
            <span style={{ fontWeight: 400, color: 'var(--pf-muted, #888)', marginLeft: 6 }}>(optional — JPG, PNG or PDF, max 10MB)</span>
          </label>
          {profile.identity?.documentUrl && !hasNewFile && (
            <p style={{ fontSize: '0.78rem', color: 'var(--pf-muted, #888)', marginBottom: 6 }}>
              Current file:&nbsp;
              <a href={profile.identity.documentUrl} target="_blank" rel="noreferrer"
                style={{ color: 'var(--pf-red)', fontWeight: 600, textDecoration: 'none' }}>
                View existing document ↗
              </a>
            </p>
          )}
          {hasNewFile && (
            <p style={{ fontSize: '0.78rem', color: '#059669', marginBottom: 6 }}>
              ✓ New file selected: {selectedFile[0]?.name}
            </p>
          )}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            disabled={isSubmitting}
            className="pf-input"
            style={{ padding: '6px 10px', cursor: 'pointer' }}
            {...register('documentFile')}
          />
          {errors.documentFile && <p className="pf-error-msg">{errors.documentFile.message}</p>}
        </div>
      </div>
      <div className="pf-form-action-bar" style={{ padding: '0 22px 16px' }}>
        <button type="button" className="pf-cancel-btn" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="pf-edit-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

function VendorProfileView({ profile, onSaveProfile }) {
  const [editingSection, setEditingSection] = useState(null);
  
  // Can only edit if not under_review (or allowed explicitly)
  const canEdit = profile.onboardingStatus !== 'under_review';

  return (
    <div className="pf-animate">
      <div className="pf-panels">
        {/* ── Personal & Contact Panel ── */}
        <ProfilePanel
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
          title="Personal & Contact Info"
          onEdit={() => setEditingSection('personal')}
          isEditing={editingSection === 'personal'}
          showEditButton={canEdit}
        >
          {editingSection === 'personal' ? (
            <VendorPersonalInfoForm
              profile={profile}
              onSave={(data) => { onSaveProfile(data); setEditingSection(null); }}
              onCancel={() => setEditingSection(null)}
            />
          ) : (
            <div className="pf-panel-body">
              <div className="pf-info-list" style={{ padding: 0 }}>
                <InfoRow label="Full Name" value={profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Phone" value={profile.phone} />
                <InfoRow label="Alternate Phone" value={profile.alternatePhone} />
                <InfoRow label="Gender" value={profile.gender} />
                <InfoRow label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : ''} />
              </div>
            </div>
          )}
        </ProfilePanel>

        {/* ── Business Address Panel ── */}
        <ProfilePanel
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          }
          title="Business Address"
          onEdit={() => setEditingSection('address')}
          isEditing={editingSection === 'address'}
          showEditButton={canEdit}
        >
          {editingSection === 'address' ? (
            <VendorAddressForm
              profile={profile}
              onSave={(data) => { onSaveProfile(data); setEditingSection(null); }}
              onCancel={() => setEditingSection(null)}
            />
          ) : (
            <div className="pf-panel-body">
              <div className="pf-info-list" style={{ padding: 0 }}>
                <InfoRow label="Line 1" value={profile.address?.line1} />
                <InfoRow label="Line 2" value={profile.address?.line2} />
                <InfoRow label="City" value={profile.address?.city} />
                <InfoRow label="State" value={profile.address?.state} />
                <InfoRow label="PIN Code" value={profile.address?.pincode} />
                <InfoRow label="Country" value={profile.address?.country} />
              </div>
            </div>
          )}
        </ProfilePanel>

        {/* ── Verification & Identity Panel ── */}
        <ProfilePanel
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          }
          title="Verification & Identity"
          onEdit={() => setEditingSection('identity')}
          isEditing={editingSection === 'identity'}
          showEditButton={profile.onboardingStatus === 'incomplete' || profile.onboardingStatus === 'under_review'}
        >
          {editingSection === 'identity' ? (
            <VendorIdentityForm
              profile={profile}
              onSave={(data) => { onSaveProfile(data); setEditingSection(null); }}
              onCancel={() => setEditingSection(null)}
            />
          ) : (
            <div className="pf-panel-body">
              <div className="pf-info-list" style={{ padding: 0 }}>
                <InfoRow label="Role in Business" value={profile.roleInBusiness} />
                <InfoRow label="Document Type" value={profile.identity?.documentType?.toUpperCase()} />
                <InfoRow label="Document Number" value={profile.identity?.documentNumber} />
                <InfoRow label="Document File" value={
                  profile.identity?.documentUrl ? (
                    <a href={profile.identity.documentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--pf-red)', textDecoration: 'none', fontWeight: 600 }}>
                      View Document
                    </a>
                  ) : 'Not Uploaded'
                } />
              </div>
            </div>
          )}
        </ProfilePanel>

      </div>
    </div>
  );
}

export default VendorProfileView;
