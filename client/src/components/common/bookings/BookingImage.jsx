import React from 'react';
import { MapPin } from 'lucide-react';

const BookingImage = ({ imageUrl, venueName }) => {
  return imageUrl ? (
    <div className="hidden sm:block w-28 flex-shrink-0">
      <img 
        src={imageUrl} 
        alt={venueName || 'Venue'} 
        className="w-full h-full object-cover" 
      />
    </div>
  ) : (
    <div className="hidden sm:flex w-28 flex-shrink-0 items-center justify-center bg-gray-50">
      <MapPin className="w-6 h-6 text-gray-300" />
    </div>
  );
};

export default BookingImage;
