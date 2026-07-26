import React, { useState, useEffect, useContext } from 'react';
import { vendorApi } from '../../api/vendor-api/vendorApi';
import { AuthContext } from '../../store/AuthContext';
import VendorProfileView from '../../components/vendor/Profile/VendorProfileView';
import AvatarUpload from '../../components/common/ProfileUi/AvatarUpload';
import BaseProfilePage from '../../components/common/ProfileUi/BaseProfilePage';
import { toast } from 'sonner';
import { formatMemberSince } from '../../utils/dateFormatter';
import '../../components/common/ProfileUi/Profile.css';

function VendorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updateUser } = useContext(AuthContext);

  const fetchVendorDetails = async () => {
    try {
      const response = await vendorApi.getProfile();
      if (response && response.vendor) {
        setProfile(response.vendor);
      } else {
        setProfile(response); // Fallback depending on API response structure
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load vendor details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const handleAvatarSuccess = (imgUrl) => {
    setProfile((prev) => ({
      ...prev,
      profileImage: imgUrl
    }));
    updateUser({ profile: { profileImage: imgUrl } });
  };

  // Profile completion calculation based on Vendor model
  const completionFields = [
    profile?.fullName, profile?.phone, profile?.email, profile?.profileImage,
    profile?.address?.line1, profile?.address?.city, profile?.address?.state, profile?.address?.pincode,
    profile?.identity?.documentNumber
  ];
  const filled = completionFields.filter(Boolean).length;
  const pct = Math.round((filled / completionFields.length) * 100);
  
  const location = [profile?.address?.city, profile?.address?.state].filter(Boolean).join(', ');

  const getVerificationBadge = () => {
    switch (profile?.onboardingStatus) {
      case 'approved':
        return (
          <span key="status" className="pf-badge bg-green-100 text-green-700">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Verified
          </span>
        );
      case 'under_review':
        return <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Under Review</div>;
      case 'requested':
        return <div className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full">Submitted</div>;
      case 'rejected':
        return (
          <span key="status" className="pf-badge bg-gray-100 text-gray-700">
            Rejected
          </span>
        );
      default:
        return (
          <span key="status" className="pf-badge bg-amber-100 text-amber-700">
            Incomplete
          </span>
        );
    }
  };

  return (
    <div className="dl-main-content">
      <BaseProfilePage
        loading={loading}
        loadingMessage="Loading business profile…"
        error={!profile}
        errorMessage="Could not load business details. Please try reloading."
        onRetry={() => { setLoading(true); fetchVendorDetails(); }}
        pageTitle="Vendor Profile"
        pageSubtitle="Manage your business credentials and verification documents."
        avatarComponent={
          <AvatarUpload
            profileImage={profile?.profileImage}
            firstName={profile?.firstName}
            lastName={profile?.lastName}
            onUploadSuccess={handleAvatarSuccess}
            uploadApiFn={async (file) => { const res = await vendorApi.updateAvatar(file); return { profileImage: res.vendor?.profileImage || res.url }; }}
            deleteApiFn={async () => vendorApi.deleteAvatar()}
          />
        }
        heroTitle={profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`}
        heroSubtitle={profile?.email}
        badges={[
          getVerificationBadge(),
          profile?.createdAt ? (
            <span key="member-since" className="pf-badge pf-badge-since">
              Since {formatMemberSince(profile.createdAt)}
            </span>
          ) : null
        ].filter(Boolean)}
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
            (!profile?.address || !profile.address.city) && 'Add address',
            (!profile?.identity || !profile.identity.documentNumber) && 'Verify Identity'
          ].filter(Boolean).join(' · ')
        }
        accountStatus={
          profile?.status 
            ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1)
            : 'Active'
        }
      >
        <VendorProfileView
          profile={profile}
          onSaveProfile={(updated) => setProfile(updated)}
        />
      </BaseProfilePage>
    </div>
  );
}

export default VendorProfilePage;


