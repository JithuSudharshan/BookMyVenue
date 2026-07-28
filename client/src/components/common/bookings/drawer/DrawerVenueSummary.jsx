import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const DrawerVenueSummary = ({ booking, isCustomerPortal }) => {
  if (!booking) return null;
  
  const venue = booking.venue || {};
  const image = venue.primaryImage || (venue.images && venue.images[0]?.url) || null;
  
  const canViewDirections = booking.accessPolicy?.permissions?.canViewDirections;

  return (
    <section className="bg-white border border-gray-100/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden h-full flex flex-col">
      {/* Image banner - slightly shorter */}
      <div className="h-24 bg-gray-50 overflow-hidden relative">
        {image ? (
          <img src={image} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPin className="w-8 h-8 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-4 right-4">
          <h4 className="font-bold text-white text-lg leading-tight truncate drop-shadow-md">{venue.name || 'Unknown Venue'}</h4>
        </div>
      </div>
      
      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-center">
        {venue.location?.city ? (
          <div className="flex items-start gap-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100/50">
            <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm flex-shrink-0">
               <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {venue.location.address || venue.location.city}
              </p>
              {(venue.location.state || venue.location.zipCode) && (
                <p className="text-xs text-gray-500 mt-0.5">
                   {venue.location.city}, {venue.location.state} {venue.location.zipCode}
                </p>
              )}
              
              {isCustomerPortal && canViewDirections && venue.location?.googleMapLink && (
                <a 
                  href={venue.location.googleMapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors uppercase tracking-wider"
                >
                  <Navigation className="w-3 h-3" /> Get Directions
                </a>
              )}
            </div>
          </div>
        ) : (
           <p className="text-sm text-gray-500 italic">No location provided.</p>
        )}
      </div>
    </section>
  );
};

export default DrawerVenueSummary;
