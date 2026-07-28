import React from 'react';
import { Phone, Mail, Lock, Info, MapPin } from 'lucide-react';

const CustomerDrawerInfo = ({ booking }) => {
  if (!booking) return null;
  
  const accessPolicy = booking.accessPolicy;
  const vendor = booking.vendor || {};
  
  if (!accessPolicy) return null;

  const { permissions, status } = accessPolicy;

  return (
    <section className="bg-white border border-gray-100/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-xl p-5 mb-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        Vendor Contact
      </h3>
      
      {permissions.canViewVendorContact ? (
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
            {vendor.profileImage ? (
              <img src={vendor.profileImage} alt={vendor.displayName} className="w-full h-full object-cover" />
            ) : (
              vendor.displayName?.charAt(0) || 'V'
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-sm font-bold text-gray-900">{vendor.displayName || 'Venue Manager'}</p>
            </div>
            
            <div className="text-sm text-gray-700 bg-gray-50/50 rounded-lg p-3 border border-gray-100/50 space-y-2">
              {vendor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> {vendor.phone}
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" /> {vendor.email}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-amber-50/40 border border-amber-100/60 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-white rounded-full flex-shrink-0 border border-amber-100 shadow-sm mt-0.5">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Contact details locked</p>
              
              {!status.isWithinCoordinationWindow ? (
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                  Contact details will automatically become available <span className="font-bold text-gray-800">{status.coordinationWindowDays} days</span> before your event to help coordinate with the venue.
                </p>
              ) : (
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                  You are within the coordination window, but full payment is required to unlock contact details.
                </p>
              )}
            </div>
          </div>
          
          {!status.paymentSatisfied && !status.isWithinCoordinationWindow && (
            <div className="bg-blue-50/40 border border-blue-100/60 rounded-xl p-3 flex items-start gap-2.5">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Complete the remaining payment before the due date to ensure uninterrupted access when the coordination window begins.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CustomerDrawerInfo;
