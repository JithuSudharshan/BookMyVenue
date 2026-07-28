import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarDays, Clock, Users, MapPin, Phone, Mail, FileText, Lock, Download, XCircle, CheckCircle } from 'lucide-react';

const formatCurrency = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
};

const StatusBadge = ({ status, type }) => {
  if (!status) return null;
  const normalizedStatus = status.toLowerCase();
  
  let styles = "bg-gray-100 text-gray-700 border-gray-200";
  let label = status.replace(/_/g, ' ');
  
  if (type === 'booking') {
    if (normalizedStatus === 'confirmed') styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (normalizedStatus === 'pending') styles = "bg-amber-50 text-amber-700 border-amber-200";
    if (normalizedStatus === 'completed') styles = "bg-blue-50 text-blue-700 border-blue-200";
    if (normalizedStatus === 'cancelled') styles = "bg-red-50 text-red-700 border-red-200";
  } else if (type === 'payment') {
    if (normalizedStatus === 'completed') styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (normalizedStatus === 'partial') {
      styles = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Advance Paid";
    }
    if (normalizedStatus === 'pending') styles = "bg-gray-50 text-gray-700 border-gray-200";
    if (normalizedStatus === 'refunded') styles = "bg-blue-50 text-blue-700 border-blue-200";
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${styles}`}>
      {label}
    </span>
  );
};

const MetaCard = ({ label, value }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col items-start justify-center">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
    <div className="text-sm font-medium text-gray-900">{value}</div>
  </div>
);

const BookingDetailsDrawer = ({ isOpen, onClose, booking, onCancelBooking }) => {
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

  const venue = booking.venue || {};
  const customer = booking.customer || {};
  const pricing = booking.pricing || {};
  
  const isAdvancePayment = pricing.paymentPolicy === 'advance_payment';

  // Format Booking Duration
  let durationText = '';
  if (booking.bookingMode === 'hourly') {
    durationText = `${booking.fromTime || ''} – ${booking.toTime || ''}`;
  } else {
    durationText = `${formatDate(booking.startDate)}`;
    if (booking.startDate !== booking.endDate) {
      durationText += ` → ${formatDate(booking.endDate)}`;
    }
  }

  const amountPaid = pricing.totalAmount - (pricing.remainingAmount || 0);
  const progressPercent = pricing.totalAmount ? Math.round((amountPaid / pricing.totalAmount) * 100) : 0;
  
  const showContact = customer.phone || customer.email;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[760px] bg-white shadow-2xl z-[200] flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg md:text-xl font-bold font-mono text-gray-900">
                #{booking.bookingNumber}
              </h2>
              <StatusBadge status={booking.bookingStatus} type="booking" />
              <StatusBadge status={booking.paymentStatus} type="payment" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Created on {formatDate(booking.createdAt)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/30">
          
          {/* Status Section (4 Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetaCard label="Booking Status" value={<StatusBadge status={booking.bookingStatus} type="booking" />} />
            <MetaCard label="Payment Status" value={<StatusBadge status={booking.paymentStatus} type="payment" />} />
            <MetaCard label="Booking Type" value={<span className="capitalize px-2 py-0.5 bg-gray-100 rounded-md text-xs">{booking.bookingMode}</span>} />
            <MetaCard label="Guests" value={`${booking.guestCount} Guests`} />
          </div>

          {/* Two-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left Column (Venue + Customer) */}
            <div className="space-y-4">
              
              {/* Venue Card */}
              <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                {/* Image banner */}
                <div className="h-28 bg-gray-100 overflow-hidden">
                  {venue.primaryImage ? (
                    <img src={venue.primaryImage} alt={venue.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <MapPin className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 text-base">{venue.name || 'Unknown Venue'}</h4>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {booking.bookingMode === 'hourly' ? formatDate(booking.date) : durationText}</span>
                    {booking.bookingMode === 'hourly' && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {durationText}</span>}
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {booking.guestCount} Guests</span>
                  </div>
                  {venue.location?.city && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {venue.location.city}
                    </p>
                  )}
                </div>
              </section>

              {/* Customer Card */}
              <section className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Customer Details
                </h3>
                
                {showContact ? (
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
                      {customer.profileImage ? (
                        <img src={customer.profileImage} alt={customer.fullName} className="w-full h-full object-cover" />
                      ) : (
                        customer.fullName?.charAt(0) || 'C'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{customer.fullName || 'Unknown Customer'}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">Ref: {booking.bookingNumber}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2 text-sm text-gray-700 bg-gray-50/40 rounded-lg p-3 border border-gray-50">
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {customer.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
                    <div className="p-2 bg-amber-100/50 rounded-full flex-shrink-0">
                      <Lock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Locked until full payment</p>
                      <p className="text-xs text-amber-700 mt-1">Contact details will unlock automatically once the customer completes their balance payment.</p>
                    </div>
                  </div>
                )}
              </section>
              
            </div>

            {/* Right Column (Payment + Timeline) */}
            <div className="space-y-4">
              
              {/* Payment Summary */}
              <section className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Payment Summary
                </h3>
                
                <div className="mb-5">
                  <div className="flex justify-between items-end mb-2">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex-1 mr-4">
                      <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="font-bold text-emerald-600 text-sm leading-none flex-shrink-0">{progressPercent}% Paid</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm bg-gray-50/40 p-4 rounded-lg border border-gray-50">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Total Amount</span>
                    <span className="font-medium text-gray-900">₹{formatCurrency(pricing.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Amount Paid</span>
                    <span className="font-medium text-emerald-600">
                      ₹{formatCurrency(amountPaid)}
                    </span>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-medium text-gray-900">Balance Remaining</span>
                    <span className="font-bold text-amber-600 text-base">
                      ₹{formatCurrency(pricing.remainingAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  {pricing.balanceDueDate && pricing.remainingAmount > 0 && (
                    <div>
                      <p className="text-gray-500 mb-0.5">Balance Due Date</p>
                      <p className="font-medium text-gray-900">{formatDate(pricing.balanceDueDate)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 mb-0.5">Payment Policy</p>
                    <p className="font-medium text-gray-900">
                      {isAdvancePayment ? `Advance Payment (${pricing.policyMetadata?.advancePercentage || 50}%)` : 'Full Payment'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Timeline */}
              {booking.timeline && booking.timeline.length > 0 && (
                <section className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                    Timeline
                  </h3>
                  
                  <div className="relative border-l-2 border-gray-100 ml-2 space-y-4">
                    {booking.timeline.map((event, idx) => (
                      <div key={idx} className="relative pl-4">
                        <div className="absolute -left-[5px] top-[5px] w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium text-gray-800 capitalize">
                            {event.status.replace(/_/g, ' ')}
                          </p>
                          <p className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                            {formatDate(event.timestamp)} · {formatTime(event.timestamp)}
                          </p>
                        </div>
                        {event.note && <p className="text-xs text-gray-500 italic mt-0.5">{event.note}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
            </div>
          </div>
        </div>
        
        {/* Sticky Action Bar */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-5 py-3 flex items-center gap-3">
          <button disabled className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 bg-gray-50 rounded-xl border border-gray-100 cursor-not-allowed hover:bg-gray-100 transition-colors">
            <Phone className="w-3.5 h-3.5" /> Contact
          </button>
          <button disabled className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 bg-gray-50 rounded-xl border border-gray-100 cursor-not-allowed hover:bg-gray-100 transition-colors">
            <Download className="w-3.5 h-3.5" /> Invoice
          </button>
          
          {['pending', 'confirmed'].includes(booking.bookingStatus?.toLowerCase()) ? (
            <button 
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer"
              onClick={() => onCancelBooking && onCancelBooking(booking._id)}
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </button>
          ) : (
            <button disabled className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400/50 bg-red-50/50 rounded-xl border border-red-50 cursor-not-allowed transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </button>
          )}

          <button disabled className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 bg-gray-50 rounded-xl border border-gray-100 cursor-not-allowed hover:bg-gray-100 transition-colors">
            <CheckCircle className="w-3.5 h-3.5" /> Mark Done
          </button>
        </div>
        
      </div>
    </>,
    document.body
  );
};

export default BookingDetailsDrawer;
