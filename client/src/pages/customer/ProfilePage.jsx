import React, { useState, useEffect } from 'react';
import { getProfile, updatePersonalInfo, updateAddress, uploadAvatar, deleteAvatar } from '../../api/user-api/profileApi';
import ProfileView from '../../components/user/Profile/ProfileView';
import AvatarUpload from '../../components/user/Profile/AvatarUpload';
import { useToast } from '../../hooks/useToast';
import { formatMemberSince } from '../../utils/dateFormatter';
import '../../components/user/Profile/Profile.css';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null); // null | 'personal' | 'address'
  const { toasts, addToast } = useToast();

  const fetchProfileDetails = async () => {
    try {
      const response = await getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const handleSavePersonal = async (formData) => {
    const response = await updatePersonalInfo(formData);
    if (response.success) {
      setProfile(response.data);
      setEditingSection(null);
      addToast('Personal information updated!', 'success');
    }
  };

  const handleSaveAddress = async (formData) => {
    const response = await updateAddress(formData);
    if (response.success) {
      setProfile(response.data);
      setEditingSection(null);
      addToast('Address updated!', 'success');
    }
  };

  const handleAvatarSuccess = (imgUrl) => {
    setProfile((prev) => ({ ...prev, profileImage: imgUrl }));
  };

  if (loading) {
    return (
      <div className="pf-scope">
        <div className="pf-state-center">
          <div className="pf-loader" />
          <p className="pf-state-msg">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pf-scope">
        <div className="pf-state-center">
          <p className="pf-state-title">Something went wrong</p>
          <p className="pf-state-msg">Could not load profile details. Please try reloading.</p>
          <button
            className="pf-edit-primary"
            onClick={() => { setLoading(true); fetchProfileDetails(); }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Profile completion calculation
  const completionFields = [
    profile.firstName, profile.lastName, profile.phone,
    profile.email, profile.profileImage,
    profile.street, profile.city, profile.state,
  ];
  const filled = completionFields.filter(Boolean).length;
  const pct = Math.round((filled / completionFields.length) * 100);
  const location = [profile.city, profile.state].filter(Boolean).join(', ');

  return (
    <div className="pf-scope">
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="pf-toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`pf-toast ${t.type}`}>
              {t.type === 'success' ? '✓' : '✕'} {t.message}
            </div>
          ))}
        </div>
      )}

      <div className="pf-page">
        {/* Page Header */}
        <div className="pf-page-header">
          <div>
            <h1 className="pf-page-title">My Profile</h1>
            <p className="pf-page-subtitle">Manage your personal information and address.</p>
          </div>
        </div>

        {/* Hero card */}
        <div className="pf-hero">
          {/* Avatar */}
          <div className="pf-hero-avatar-wrap">
            <AvatarUpload
              profileImage={profile.profileImage}
              firstName={profile.firstName}
              lastName={profile.lastName}
              onUploadSuccess={handleAvatarSuccess}
              onToast={addToast}
              uploadApiFn={uploadAvatar}
              deleteApiFn={deleteAvatar}
            />
          </div>

          {/* Info */}
          <div className="pf-hero-info">
            <div className="pf-hero-name-row">
              <h2 className="pf-hero-name">
                {profile.firstName} {profile.lastName}
              </h2>
              {profile.createdAt && (
                <span className="pf-badge pf-badge-since">
                  Since {formatMemberSince(profile.createdAt)}
                </span>
              )}
            </div>

            {profile.email && (
              <div className="pf-hero-contact-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span className="pf-hero-contact-text">{profile.email}</span>
              </div>
            )}

            <div className="pf-hero-chips">
              {profile.phone && (
                <span className="pf-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.19.92z"/>
                  </svg>
                  {profile.phone}
                </span>
              )}
              {location && (
                <span className="pf-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {location}
                </span>
              )}
            </div>

            {/* Profile completion bar (hide when 100%) */}
            {pct < 100 && (
              <div className="pf-completion">
                <div className="pf-completion-header">
                  <span className="pf-completion-label">Profile completeness</span>
                  <span className="pf-completion-pct" style={{ color: 'var(--pf-red)' }}>
                    {pct}%
                  </span>
                </div>
                <div className="pf-completion-track">
                  <div
                    className="pf-completion-fill"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, var(--pf-red), #ff6b6b)',
                    }}
                  />
                </div>
                <p className="pf-completion-hint">
                  {!profile.phone && 'Add phone · '}
                  {!profile.profileImage && 'Add photo · '}
                  {!profile.city && 'Add address'}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Section-level view/edit */}
        <ProfileView
          profile={profile}
          editingSection={editingSection}
          onEditPersonal={() => setEditingSection('personal')}
          onEditAddress={() => setEditingSection('address')}
          onSavePersonal={handleSavePersonal}
          onSaveAddress={handleSaveAddress}
          onCancelEdit={() => setEditingSection(null)}
        />
      </div>
    </div>
  );
}

export default ProfilePage;
