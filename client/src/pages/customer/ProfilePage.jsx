import React, { useState, useEffect, useContext } from 'react';
import { getProfile, updatePersonalInfo, updateAddress, uploadAvatar, deleteAvatar } from '../../api/user-api/profileApi';
import { AuthContext } from '../../store/AuthContext';
import ProfileView from '../../components/user/Profile/ProfileView';
import AvatarUpload from '../../components/user/Profile/AvatarUpload';
import BaseProfilePage from '../../components/common/ProfileUi/BaseProfilePage';
import { useToast } from '../../hooks/useToast';
import { formatMemberSince } from '../../utils/dateFormatter';
import '../../components/user/Profile/Profile.css';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null); // null | 'personal' | 'address'
  const { toasts, addToast } = useToast();
  const { updateUser } = useContext(AuthContext);

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
      updateUser({ profile: { firstName: response.data.firstName, lastName: response.data.lastName } });
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
    updateUser({ profile: { profileImage: imgUrl } });
  };

  // Profile completion calculation
  const completionFields = [
    profile?.firstName, profile?.lastName, profile?.phone,
    profile?.email, profile?.profileImage,
    profile?.street, profile?.city, profile?.state,
  ];
  const filled = completionFields.filter(Boolean).length;
  const pct = Math.round((filled / completionFields.length) * 100);
  const location = [profile?.city, profile?.state].filter(Boolean).join(', ');

  return (
    <BaseProfilePage
      loading={loading}
      loadingMessage="Loading your profile…"
      error={!profile}
      errorMessage="Could not load profile details. Please try reloading."
      onRetry={() => { setLoading(true); fetchProfileDetails(); }}
      toasts={toasts}
      pageTitle="My Profile"
      pageSubtitle="Manage your personal information and address."
      avatarComponent={
        <AvatarUpload
          profileImage={profile?.profileImage}
          firstName={profile?.firstName}
          lastName={profile?.lastName}
          onUploadSuccess={handleAvatarSuccess}
          onToast={addToast}
          uploadApiFn={uploadAvatar}
          deleteApiFn={deleteAvatar}
        />
      }
      heroTitle={`${profile?.firstName} ${profile?.lastName}`}
      heroSubtitle={profile?.email}
      badges={profile?.createdAt ? [
        <span key="member-since" className="pf-badge pf-badge-since">
          Since {formatMemberSince(profile.createdAt)}
        </span>
      ] : []}
      chips={[
        ...(profile?.phone ? [
          <React.Fragment key="phone">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.19.92z"/>
            </svg>
            {profile.phone}
          </React.Fragment>
        ] : []),
        ...(location ? [
          <React.Fragment key="location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {location}
          </React.Fragment>
        ] : [])
      ]}
      completionPct={pct}
      completionHints={
        [
          !profile?.phone && 'Add phone',
          !profile?.profileImage && 'Add photo',
          !profile?.city && 'Add address'
        ].filter(Boolean).join(' · ')
      }
      accountStatus={profile?.status}
    >
      <ProfileView
        profile={profile}
        editingSection={editingSection}
        onEditPersonal={() => setEditingSection('personal')}
        onEditAddress={() => setEditingSection('address')}
        onSavePersonal={handleSavePersonal}
        onSaveAddress={handleSaveAddress}
        onCancelEdit={() => setEditingSection(null)}
      />
    </BaseProfilePage>
  );
}

export default ProfilePage;
