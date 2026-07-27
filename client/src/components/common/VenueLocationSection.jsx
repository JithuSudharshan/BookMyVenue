import React from 'react';
import { MapPin, Home } from 'lucide-react';

const VenueLocationSection = ({ location, venueName }) => {
  const isObjectLocation = typeof location === 'object' && location !== null;

  // Build neighborhood query (city, state, pincode) to preview area without exact street address
  const areaParts = isObjectLocation
    ? [location.city, location.state, location.pincode].filter(Boolean)
    : [location].filter(Boolean);

  const areaQueryText = areaParts.length > 0 ? areaParts.join(', ') : 'India';
  const displayLocation = isObjectLocation
    ? [location.city, location.state].filter(Boolean).join(', ')
    : (location || 'Location available upon booking');

  // Standard Google Maps iframe embed URL at zoom level 13 for neighborhood overview
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(areaQueryText)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-headline-sm text-on-surface mb-1.5">Where you&apos;ll be</h2>
        {displayLocation && (
          <div className="flex items-center text-on-surface-variant font-body-md">
            <MapPin className="w-4 h-4 mr-1.5 text-primary flex-shrink-0" />
            <span>{displayLocation}</span>
          </div>
        )}
      </div>

      {/* Interactive Area Map Preview */}
      <div className="w-full h-[320px] md:h-[380px] rounded-3xl overflow-hidden border border-outline-variant shadow-sm bg-surface-variant relative mb-5">
        <iframe
          title={`Map preview for ${venueName || 'Venue'}`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen={false}
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Prominent Airbnb-style Center House Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 bg-[#222222] text-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/50 transform -translate-y-1">
            <Home className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueLocationSection;
