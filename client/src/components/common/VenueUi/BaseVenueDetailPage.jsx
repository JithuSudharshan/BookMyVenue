import React, { useState } from 'react';
import {
  MapPin,
  Users,
  IndianRupee,
  CheckCircle,
  ChevronLeft,
  Info
} from 'lucide-react';
import VenueImageMosaic from './VenueImageMosaic';

const BaseVenueDetailPage = ({
  venue,
  loading,
  backUrl,
  backLabel = 'Venues',
  onBack,
  headerActionsSlot = null,
  sidebarSlot = null,
  customBadgesSlot = null,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 hover:text-primary transition-colors font-label-md"
          >
            <ChevronLeft className="w-4 h-4" />
            {backLabel}
          </button>
          <span>/</span>
          <span className="text-on-surface font-label-md truncate">{venue.name}</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">{venue.name}</h1>
            {customBadgesSlot}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center text-on-surface-variant font-body-md">
              <MapPin className="w-4 h-4 mr-1 text-primary" />
              {typeof venue.location === 'object' && venue.location !== null
                ? [venue.location.city, venue.location.state].filter(Boolean).join(', ')
                : venue.location}
            </div>
          </div>
        </div>
        {headerActionsSlot && (
          <div className="flex flex-wrap items-center gap-3">
            {headerActionsSlot}
          </div>
        )}
      </div>

      {/* Gallery Section */}
      <div className="mb-10">
        <VenueImageMosaic images={venue.images || []} />
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant text-center shadow-sm">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-label-sm text-on-surface-variant mb-1">Capacity</p>
              <p className="font-title-md text-on-surface">{venue.capacity ?? '—'} pax</p>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant text-center shadow-sm">
              <IndianRupee className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-label-sm text-on-surface-variant mb-1">Base Price</p>
              <p className="font-title-md text-on-surface">₹{venue.price?.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant text-center shadow-sm">
              <Info className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-label-sm text-on-surface-variant mb-1">Booking Type</p>
              <p className="font-title-md text-on-surface capitalize">{venue.bookingModel || 'daily'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About this venue</h2>
            <p className="font-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
              {venue.description || 'No description provided.'}
            </p>
          </div>

          <hr className="border-outline-variant" />

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Amenities</h2>
            {venue.amenities && venue.amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {venue.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center text-on-surface font-body-md">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant font-body-md">No amenities listed.</p>
            )}
          </div>
          {venue.vendorId && typeof venue.vendorId === 'object' && (
            <>
              <hr className="border-outline-variant" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">Hosted by {venue.vendorId.name || 'Vendor'}</h2>
                <div className="flex items-center gap-4">
                  {venue.vendorId.profileImage ? (
                    <img src={venue.vendorId.profileImage} alt="Vendor" className="w-16 h-16 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {venue.vendorId.name ? venue.vendorId.name.charAt(0).toUpperCase() : 'V'}
                    </div>
                  )}
                  <div>
                    <p className="font-title-lg text-gray-900">{venue.vendorId.name}</p>
                    <p className="text-gray-500 font-body-md">{venue.vendorId.email}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <hr className="border-outline-variant" />

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Venue Rules & Policies</h2>
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant space-y-4">
              {venue.rules && venue.rules.length > 0 ? (
                <ul className="space-y-3">
                  {venue.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-on-surface-variant font-body-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-on-surface-variant font-body-md">No specific rules listed by the vendor.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-5">
            {sidebarSlot}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseVenueDetailPage;
