import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import DrawerHeader from './drawer/DrawerHeader';
import DrawerQuickOverview from './drawer/DrawerQuickOverview';
import DrawerVenueSummary from './drawer/DrawerVenueSummary';
import DrawerPaymentSummary from './drawer/DrawerPaymentSummary';
import DrawerInfoGrid from './drawer/DrawerInfoGrid';
import DrawerTimeline from './drawer/DrawerTimeline';

const BaseBookingDetailsDrawer = ({ 
  isOpen, 
  onClose, 
  booking, 
  roleSpecificInformation,
  actionSlot,
  isCustomerPortal
}) => {
  
  // Prevent scrolling on body when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer - Increased max width for more breathable layout */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[840px] bg-[#f8fafc] shadow-2xl z-[200] flex flex-col transform transition-transform duration-300 ease-in-out">
        
        <DrawerHeader booking={booking} onClose={onClose} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Row 1: Quick Overview Strip */}
          <DrawerQuickOverview booking={booking} />

          {/* Row 2: Split Layout (Venue Hero | Payment Summary) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DrawerVenueSummary booking={booking} isCustomerPortal={isCustomerPortal} />
            <DrawerPaymentSummary pricing={booking.pricing} paymentStatus={booking.paymentStatus} />
          </div>
          
          {/* Row 3: Split Layout (Booking Info Grid | Timeline) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <DrawerInfoGrid booking={booking} />
             <DrawerTimeline booking={booking} />
          </div>

          {/* Row 4: Role Specific Information (Customer/Vendor modules) */}
          {roleSpecificInformation && (
            <div className="pt-2">
              {roleSpecificInformation}
            </div>
          )}
        </div>
        
        {/* Sticky Action Bar */}
        {actionSlot && (
          <div className="flex-shrink-0 border-t border-gray-200/60 bg-white/95 backdrop-blur-sm px-6 py-4 flex items-center justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {actionSlot}
          </div>
        )}
        
      </div>
    </>,
    document.body
  );
};

export default BaseBookingDetailsDrawer;
