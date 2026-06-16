import React, { useState, useEffect } from 'react';
import { getVendorProfile, uploadVendorAvatar } from '../../api/vendor-api/mockVendorProfileApi';
import VendorProfileView from '../../components/vendor/Profile/VendorProfileView';
import AvatarUpload from '../../components/user/Profile/AvatarUpload';
import ToastContainer from '../../components/common/ToastContainer';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { useToast } from '../../hooks/useToast';
import { formatMemberSince } from '../../utils/dateFormatter';
import '../../components/user/Profile/Profile.css';

function VendorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast } = useToast();

  const fetchVendorDetails = async () => {
    try {
      const response = await getVendorProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load vendor details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const handleAvatarSuccess = (base64Image) => {
    setProfile((prev) => ({
      ...prev,
      profileImage: base64Image
    }));
  };

  if (loading) {
    return <LoadingState message="Loading business profile..." />;
  }

  if (!profile) {
    return (
      <ErrorState
        message="Could not load business details. Please try reloading."
        onRetry={() => {
          setLoading(true);
          fetchVendorDetails();
        }}
      />
    );
  }

  return (
    <div className="profile-theme-scope">
      <div className="profile-page-wrapper">
        <ToastContainer toasts={toasts} />

        <header className="profile-page-header">
          <h1 className="headline-lg">Vendor Control Center</h1>
          <p className="body-md text-muted">Manage your business credentials, document approvals, venues, and wallet balances.</p>
        </header>

        <div className="profile-page-grid">
          <aside className="profile-sidebar">
            <div className="sidebar-card">
              <AvatarUpload
                profileImage={profile.profileImage}
                businessName={profile.businessName}
                onUploadSuccess={handleAvatarSuccess}
                onToast={addToast}
                uploadApiFn={uploadVendorAvatar}
                instructions="Drag and drop or click to change business logo. Max size 2MB (PNG, JPG, WEBP)."
              />
              
              <div className="user-intro-details">
                <h2 className="headline-md user-fullname" style={{ fontSize: '18px' }}>
                  {profile.businessName}
                </h2>
                
                {profile.verificationStatus === 'Verified' && (
                  <span className="vendor-verification-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    Verified Vendor
                  </span>
                )}
                
                <p className="body-sm text-muted date-joined">Partner since {formatMemberSince(profile.createdAt)}</p>
              </div>
            </div>
          </aside>

          <main className="profile-main-panel">
            <VendorProfileView profile={profile} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default VendorProfilePage;
