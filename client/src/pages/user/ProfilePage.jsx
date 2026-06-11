import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadAvatar, deleteAvatar } from '../../api/user-api/profileApi';
import ProfileView from '../../components/user/Profile/ProfileView';
import ProfileEdit from '../../components/user/Profile/ProfileEdit';
import AvatarUpload from '../../components/user/Profile/AvatarUpload';
import ToastContainer from '../../components/common/ToastContainer';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { useToast } from '../../hooks/useToast';
import { formatMemberSince } from '../../utils/dateFormatter';
import '../../components/user/Profile/Profile.css';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSaveProfile = async (formData) => {
    const response = await updateProfile(formData);
    if (response.success) {
      setProfile(response.data);
      setIsEditing(false);
      addToast('Profile saved successfully!', 'success');
    }
  };

  const handleAvatarSuccess = (base64Image) => {
    setProfile((prev) => ({
      ...prev,
      profileImage: base64Image,
    }));
  };

  if (loading) {
    return <LoadingState message="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <ErrorState
        message="Could not load profile details. Please try reloading."
        onRetry={() => {
          setLoading(true);
          fetchProfileDetails();
        }}
      />
    );
  }

  return (
    <div className="profile-page-wrapper">
      <ToastContainer toasts={toasts} />

      <header className="profile-page-header">
        <h1 className="headline-lg">My Profile</h1>
        <p className="body-md text-muted">Manage your personal information, address cards, and profile photos.</p>
      </header>

      <div className="profile-page-grid">
        <aside className="profile-sidebar">
          <div className="sidebar-card">
            <AvatarUpload
              profileImage={profile.profileImage}
              firstName={profile.firstName}
              lastName={profile.lastName}
              onUploadSuccess={handleAvatarSuccess}
              onToast={addToast}
              uploadApiFn={uploadAvatar}
              deleteApiFn={deleteAvatar}
            />
            
            <div className="user-intro-details">
              <h2 className="headline-md user-fullname">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="body-sm text-muted date-joined">
                Member since {formatMemberSince(profile.createdAt)}
              </p>
            </div>
          </div>
        </aside>

        <main className="profile-main-panel">
          {isEditing ? (
            <ProfileEdit
              profile={profile}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileView
              profile={profile}
              onEditClick={() => setIsEditing(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
