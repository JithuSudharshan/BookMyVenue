import React, { useState } from 'react';
import {
  MapPin,
  Users,
  IndianRupee,
  CheckCircle,
  ChevronLeft,
  Calendar,
  ShieldCheck,
  CreditCard,
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
            <h1 className="font-headline-lg text-on-surface mb-2">{venue.name}</h1>
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
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-label-sm text-on-surface-variant mb-1">Buffer Time</p>
              <p className="font-title-md text-on-surface">{venue.bufferTime || 0} hrs</p>
            </div>
          </div>

          <div>
            <h2 className="font-headline-sm text-on-surface mb-3">About this venue</h2>
            <p className="font-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
              {venue.description || 'No description provided.'}
            </p>
          </div>

          <hr className="border-outline-variant" />

          <div>
            <h2 className="font-headline-sm text-on-surface mb-5">Amenities</h2>
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
          <div>
            <h2 className="font-headline-sm text-on-surface mb-5">Venue Rules & Policies</h2>
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant space-y-4">
              <div className="flex items-start gap-4">
                <CreditCard className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-title-md text-on-surface">Advance Payment</h4>
                  <p className="font-body-md text-on-surface-variant">
                    {venue.advancePaymentPercentage ? `${venue.advancePaymentPercentage}% advance required to secure booking.` : 'Full payment required.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-title-md text-on-surface">Cancellation Policy</h4>
                  <p className="font-body-md text-on-surface-variant">
                    {venue.cancellationPolicy || 'Standard cancellation policy applies.'}
                  </p>
                </div>
              </div>
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
