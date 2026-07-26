import React from 'react';
import { ShieldAlert } from 'lucide-react';

const VenueHostCard = ({ vendor }) => {
  if (!vendor) return null;

  const firstName = vendor.name ? vendor.name.split(' ')[0] : 'Host';
  const joinYear = vendor.createdAt ? new Date(vendor.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet your host</h2>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Card */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col items-center w-full md:w-[350px] flex-shrink-0">
          <div className="relative mb-4">
            {vendor.profileImage ? (
              <img src={vendor.profileImage} alt={firstName} className="w-28 h-28 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white">
              <ShieldAlert size={16} />
            </div>
          </div>
          
          <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{firstName}</h3>
          
          <div className="flex mt-4 w-full justify-center">
            <div className="text-center px-4">
              <p className="font-bold text-lg text-gray-900">Verified</p>
              <p className="text-xs text-gray-500 font-medium">Partner</p>
            </div>
          </div>
        </div>
        
        {/* Right Info */}
        <div className="flex-1 space-y-6 pt-2">
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-1">{firstName} is a Verified Host</h4>
            <p className="text-gray-600 leading-relaxed">
              Verified hosts are experienced, highly rated partners who are committed to providing great experiences for guests.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-1">Host details</h4>
            <p className="text-gray-600">Hosting since {joinYear}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200 mt-6 flex items-start gap-4">
            <ShieldAlert className="text-primary flex-shrink-0 mt-0.5" size={24} />
            <p className="text-sm text-gray-500 leading-relaxed">
              To help protect your payment, always use BookMyVenue to send money and communicate with hosts. Never transfer money directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueHostCard;
