import React, { useState } from 'react';
import {
  MapPin,
  Users,
  IndianRupee,
  CheckCircle,
  ChevronLeft,
  Calendar,
} from 'lucide-react';

const BaseVenueDetailPage = ({
  venue,
  loading,
  backUrl,
  backLabel = 'Venues',
  onBack,
  headerActionsSlot = null,
  sidebarSlot = null,
  customBadgesSlot = null,
  reviewsSlot = null,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="md:col-span-3 aspect-video md:h-[440px] rounded-3xl overflow-hidden shadow-md relative group">
          {venue.images && venue.images.length > 0 ? (
            <img
              src={venue.images[selectedImage]?.url || venue.images[selectedImage]}
              alt="Venue view"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-body-lg rounded-3xl border border-outline-variant">
              No Images Available
            </div>
          )}
        </div>

        {venue.images && venue.images.length > 1 && (
          <div className="flex overflow-x-auto md:flex-col gap-4 pb-2 md:pb-0 md:h-[440px] md:overflow-y-auto pr-1">
            {venue.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-32 md:w-full aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img?.url || img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
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

          {reviewsSlot && (
            <>
              <hr className="border-outline-variant" />
              {reviewsSlot}
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">
            {sidebarSlot}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseVenueDetailPage;
