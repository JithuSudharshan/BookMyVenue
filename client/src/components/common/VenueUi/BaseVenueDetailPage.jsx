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
import VenueHostCard from '../../user/VenueHostCard';
import { getAmenityIcon } from '../../../utils/amenityUtils';

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

      {/* Gallery Section - Now At Top */}
      <div className="mb-8">
        <VenueImageMosaic images={venue.images || []} />
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          
          {/* Page Header (Title & Quick Info) moved below gallery */}
          <div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-1">{venue.name}</h1>
                {customBadgesSlot}
              </div>
              {headerActionsSlot && (
                <div className="flex flex-wrap items-center gap-3">
                  {headerActionsSlot}
                </div>
              )}
            </div>

            {/* Quick Info Strip */}
            <div className="flex flex-wrap items-center text-gray-900 font-medium text-lg gap-2">
              <span className="capitalize">{venue.bookingModel || 'Daily'} Booking Venue</span>
              <span className="text-gray-400">•</span>
              <span>Up to {venue.capacity ?? '—'} guests</span>
              <span className="text-gray-400">•</span>
              <span>₹{venue.price?.toLocaleString('en-IN')} Base Price</span>
            </div>
            
            <div className="flex items-center text-gray-600 mt-2 font-body-md">
              <MapPin className="w-4 h-4 mr-1" />
              {typeof venue.location === 'object' && venue.location !== null
                ? [venue.location.city, venue.location.state].filter(Boolean).join(', ')
                : venue.location}
            </div>
          </div>

          <hr className="border-gray-200" />
          <div className="pt-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About this venue</h2>
            <p className="font-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
              {venue.description || 'No description provided.'}
            </p>
          </div>

          {venue.amenities && venue.amenities.length > 0 && (
            <>
              <hr className="border-gray-200" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">What this place offers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                  {venue.amenities.map((amenity, idx) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div key={idx} className="flex items-center text-gray-900 font-body-md">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0 text-gray-700">
                          <Icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <span className="font-medium text-gray-800">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {venue.vendorId && typeof venue.vendorId === 'object' && (
            <>
              <hr className="border-gray-200" />
              <VenueHostCard vendor={venue.vendorId} />
            </>
          )}

          <hr className="border-gray-200" />

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Things to know</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Payment Policy */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Payment Policy</h3>
                <ul className="space-y-2 text-gray-600 font-body-md">
                  <li>
                    {venue.bookingModel === 'hourly' 
                      ? "100% advance required to secure booking." 
                      : "30% advance required to secure booking."}
                  </li>
                </ul>
              </div>

              {/* Venue Rules */}
              {venue.rules && venue.rules.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Venue Rules</h3>
                  <ul className="space-y-2 text-gray-600 font-body-md list-disc list-inside">
                    {venue.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
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
