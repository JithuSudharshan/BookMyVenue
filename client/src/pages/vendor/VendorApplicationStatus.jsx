import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendor-api/vendorApi';
import { 
  FileText, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { VendorPersonalEdit, VendorBusinessEdit, VendorIdentityEdit } from '../../components/vendor/status/VendorStatusEditForms';

// Reusable semantic data row
const DataRow = ({ label, value, isLast = false, colSpan = false }) => (
  <div className={`py-4 ${!isLast ? 'border-b border-outline-variant/30' : ''} ${colSpan ? 'md:col-span-2' : ''} flex flex-col gap-1`}>
    <dt className="text-sm font-medium text-on-surface-variant/80">{label}</dt>
    <dd className="text-base text-on-surface">{value || <span className="text-on-surface-variant/40 italic">Not provided</span>}</dd>
  </div>
);

function VendorApplicationStatus() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null); // 'personal', 'business', 'identity', or null
  const { addToast } = useToast();

  useEffect(() => {
    fetchVendorDetails();
  }, [editingSection]); // Refetch when editing stops to get updated data

  const fetchVendorDetails = async () => {
    try {
      const response = await vendorApi.getProfile();
      if (response && response.vendor) {
        setProfile(response.vendor);
      } else {
        setProfile(response);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load vendor details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-outline-variant/30"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-on-surface-variant" />
        </div>
        <h2 className="text-xl font-semibold text-on-surface mb-2">Application Not Found</h2>
        <p className="text-on-surface-variant max-w-md">We couldn't retrieve your application status at this time. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background pb-16">
      <main className="max-w-4xl mx-auto pt-8 px-4 md:px-8">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Application Status</h1>
          <p className="text-lg text-on-surface-variant">Review your submitted details and track your approval progress.</p>
        </div>

        {/* Status Banners */}
        {profile.onboardingStatus === 'requested' && (
          <div className="relative overflow-hidden bg-brand-subtle/30 ring-1 ring-primary/20 rounded-2xl mb-10 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-sm">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="bg-white ring-1 ring-primary/20 p-3 rounded-full flex-shrink-0 shadow-sm z-10">
              <CheckCircle2 className="w-8 h-8 text-primary" strokeWidth={2.5} />
            </div>
            <div className="flex-1 z-10">
              <h2 className="text-xl font-semibold text-on-surface mb-1">Application Submitted</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Your application has been successfully submitted and is in the queue. Our team will begin reviewing it shortly.
              </p>
            </div>
          </div>
        )}

        {profile.onboardingStatus === 'under_review' && (
          <div className="relative overflow-hidden bg-blue-50/50 ring-1 ring-blue-500/20 rounded-2xl mb-10 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-sm">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
            <div className="bg-white ring-1 ring-blue-500/20 p-3 rounded-full flex-shrink-0 shadow-sm z-10">
              <Clock className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 z-10">
              <h2 className="text-xl font-semibold text-on-surface mb-1">Under Review</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Thank you for submitting your details. Our team is currently reviewing your profile and will get back to you shortly.
              </p>
            </div>
          </div>
        )}

        {profile.onboardingStatus === 'changes_requested' && (
          <div className="relative overflow-hidden bg-blue-50/50 ring-1 ring-blue-500/20 rounded-2xl mb-10 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-sm">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
            <div className="bg-white ring-1 ring-blue-500/20 p-3 rounded-full flex-shrink-0 shadow-sm z-10">
              <Clock className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 z-10">
              <h2 className="text-xl font-semibold text-on-surface mb-1">Updates Submitted</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Your updated application has been successfully resubmitted. Our team is currently reviewing your changes and will get back to you shortly.
              </p>
            </div>
          </div>
        )}

        {profile.onboardingStatus === 'rejected' && (
          <div className="relative overflow-hidden bg-red-50/50 ring-1 ring-red-500/20 rounded-2xl mb-10 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-sm">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
            <div className="bg-white ring-1 ring-red-500/20 p-3 rounded-full flex-shrink-0 shadow-sm z-10">
              <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 z-10">
              <h2 className="text-xl font-semibold text-on-surface mb-1">Action Required</h2>
              <p className="text-on-surface-variant leading-relaxed mb-3">
                Unfortunately, we cannot approve your application at this time. Please review the feedback below, make the necessary edits to your profile, and resubmit your application.
              </p>
              {profile.adminRemarks && (
                <div className="bg-white/60 rounded-xl p-4 ring-1 ring-red-500/10 text-sm text-red-800">
                  <span className="font-semibold block mb-1 text-red-900">Admin Feedback:</span>
                  {profile.adminRemarks}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Sections */}
        <div className="space-y-8">
          
          {/* Personal Info */}
          <section className="bg-surface ring-1 ring-outline-variant/40 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.05)]">
            <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-surface-variant/50 p-2 rounded-lg ring-1 ring-outline-variant/20">
                  <User className="w-5 h-5 text-on-surface" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface">Personal Information</h3>
              </div>
              {(profile.onboardingStatus === 'requested' || profile.onboardingStatus === 'rejected') && editingSection !== 'personal' && (
                <button onClick={() => setEditingSection('personal')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
            
            {editingSection === 'personal' ? (
              <VendorPersonalEdit 
                profile={profile} 
                onCancel={() => setEditingSection(null)} 
                onSuccess={() => setEditingSection(null)} 
              />
            ) : (
              <div className="px-6 py-2">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                  <DataRow label="Full Name" value={profile.fullName} />
                  <DataRow label="Email Address" value={profile.email} />
                  <DataRow label="Phone Number" value={profile.phone} />
                  <DataRow label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} isLast={true} />
                  <DataRow label="Gender" value={profile.gender ? <span className="capitalize">{profile.gender}</span> : null} isLast={true} />
                </dl>
              </div>
            )}
          </section>

          {/* Business & Address */}
          <section className="bg-surface ring-1 ring-outline-variant/40 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.05)]">
            <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-surface-variant/50 p-2 rounded-lg ring-1 ring-outline-variant/20">
                  <MapPin className="w-5 h-5 text-on-surface" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface">Business Details</h3>
              </div>
              {(profile.onboardingStatus === 'requested' || profile.onboardingStatus === 'rejected') && editingSection !== 'business' && (
                <button onClick={() => setEditingSection('business')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
            
            {editingSection === 'business' ? (
              <VendorBusinessEdit 
                profile={profile} 
                onCancel={() => setEditingSection(null)} 
                onSuccess={() => setEditingSection(null)} 
              />
            ) : (
              <div className="px-6 py-2">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                  <DataRow colSpan label="Address Line 1" value={profile.address?.line1} />
                  <DataRow colSpan label="Address Line 2" value={profile.address?.line2} />
                  <DataRow label="City" value={profile.address?.city} />
                  <DataRow label="State / Province" value={profile.address?.state} />
                  <DataRow label="Country" value={profile.address?.country} isLast={true} />
                  <DataRow label="Postal Code" value={profile.address?.pincode} isLast={true} />
                </dl>
              </div>
            )}
          </section>

          {/* Identity Document */}
          <section className="bg-surface ring-1 ring-outline-variant/40 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.05)]">
            <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-surface-variant/50 p-2 rounded-lg ring-1 ring-outline-variant/20">
                  <ShieldCheck className="w-5 h-5 text-on-surface" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface">Identity Verification</h3>
              </div>
              {(profile.onboardingStatus === 'requested' || profile.onboardingStatus === 'rejected') && editingSection !== 'identity' && (
                <button onClick={() => setEditingSection('identity')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
            
            {editingSection === 'identity' ? (
              <VendorIdentityEdit 
                profile={profile} 
                onCancel={() => setEditingSection(null)} 
                onSuccess={() => setEditingSection(null)} 
              />
            ) : (
              <div className="px-6 py-2 pb-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mb-6">
                  <DataRow colSpan label="Role in Business" value={profile.roleInBusiness ? <span className="capitalize">{profile.roleInBusiness.replace('_', ' ')}</span> : null} />
                  <DataRow label="Document Type" value={profile.identity?.documentType ? <span className="capitalize">{profile.identity.documentType.replace('_', ' ')}</span> : null} isLast={true} />
                  <DataRow label="Document Number" value={profile.identity?.documentNumber} isLast={true} />
                </dl>
                
                {profile.identity?.documentUrl && (
                  <div className="mt-2">
                    <dt className="text-sm font-medium text-on-surface-variant/80 mb-3">Uploaded Document</dt>
                    <dd>
                      <a 
                        href={profile.identity.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 bg-surface-container-lowest ring-1 ring-outline-variant/40 rounded-xl hover:ring-primary/40 hover:bg-primary/5 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-surface-variant/30 p-3 rounded-lg text-on-surface group-hover:text-primary transition-colors">
                            <FileText className="w-6 h-6" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Identity_Document.pdf</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">Click to view securely</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-on-surface-variant/50 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                      </a>
                    </dd>
                  </div>
                )}
              </div>
            )}
          </section>

        </div>

        {/* Resubmit Application Button (Only shown when rejected) */}
        {profile.onboardingStatus === 'rejected' && (
          <div className="max-w-4xl mx-auto mt-10 pt-6 border-t border-outline-variant/30 flex justify-end">
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  await vendorApi.submitForReview();
                  addToast('Application resubmitted successfully!', 'success');
                  fetchVendorDetails();
                } catch (err) {
                  addToast('Failed to resubmit application', 'error');
                  setLoading(false);
                }
              }}
              className="px-6 py-3 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 shadow-sm transition-all"
            >
              Resubmit Application
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default VendorApplicationStatus;
