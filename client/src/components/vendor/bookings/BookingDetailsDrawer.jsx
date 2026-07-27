import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarDays, Clock, Users, MapPin, CheckCircle2, User, Phone, Mail, FileText, Activity } from 'lucide-react';

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
  
  if (type === 'booking') {
    if (normalizedStatus === 'confirmed') styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (normalizedStatus === 'pending') styles = "bg-amber-50 text-amber-700 border-amber-200";
    if (normalizedStatus === 'completed') styles = "bg-blue-50 text-blue-700 border-blue-200";
    if (normalizedStatus === 'cancelled') styles = "bg-red-50 text-red-700 border-red-200";
  } else if (type === 'payment') {
    if (normalizedStatus === 'completed') styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (normalizedStatus === 'partial') styles = "bg-amber-50 text-amber-700 border-amber-200";
    if (normalizedStatus === 'pending') styles = "bg-gray-50 text-gray-700 border-gray-200";
    if (normalizedStatus === 'refunded') styles = "bg-blue-50 text-blue-700 border-blue-200";
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg border ${styles}`}>
      {status}
    </span>
  );
};

const BookingDetailsDrawer = ({ isOpen, onClose, booking }) => {
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

  const venue = booking.venueId || {};
  const customer = booking.userId || {};
  const pricing = booking.pricing || {};
  
  const isAdvancePayment = pricing.paymentPolicy === 'advance_payment';
  const showContact = !isAdvancePayment || booking.paymentStatus === 'completed';

  const dateDisplay = booking.bookingMode === 'hourly'
    ? formatDate(booking.date)
    : `${formatDate(booking.startDate)}${booking.startDate !== booking.endDate ? ` → ${formatDate(booking.endDate)}` : ''}`;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">#{booking.bookingNumber}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
          
          {/* Status Section */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Booking Status</p>
              <StatusBadge status={booking.bookingStatus} type="booking" />
            </div>
            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Payment Status</p>
              <StatusBadge status={booking.paymentStatus} type="payment" />
            </div>
          </div>

          {/* Venue & Booking Info */}
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <MapPin className="w-4 h-4 text-primary" /> Venue Information
            </h3>
            
            <div className="font-medium text-gray-900">{venue.name || 'Unknown Venue'}</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Date</p>
                <p className="text-sm font-medium text-gray-900">{dateDisplay}</p>
              </div>
              {booking.bookingMode === 'hourly' && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time</p>
                  <p className="text-sm font-medium text-gray-900">{booking.fromTime} – {booking.toTime}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Guests</p>
                <p className="text-sm font-medium text-gray-900">{booking.guestCount} People</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Mode</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{booking.bookingMode}</p>
              </div>
            </div>
          </section>

          {/* Customer Info */}
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <User className="w-4 h-4 text-primary" /> Customer Information
            </h3>
            
            {showContact ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm font-medium text-gray-900">{customer.email || 'N/A'}</p>
                  </div>
                </div>
                {/* Note: In MVP we don't fetch full profile, only email from User model. Phone might not be available unless populated from Customer profile. */}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p>Customer contact information is hidden for advance payments and will become available after the remaining balance is paid.</p>
              </div>
            )}
          </section>

          {/* Payment Summary */}
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <FileText className="w-4 h-4 text-primary" /> Payment Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Total Amount</span>
                <span className="font-medium text-gray-900">₹{formatCurrency(pricing.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Amount Paid</span>
                <span className="font-medium text-emerald-600">
                  ₹{formatCurrency(pricing.totalAmount - (pricing.remainingAmount || 0))}
                </span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="font-medium text-gray-900">Balance Due</span>
                <span className={`font-bold ${pricing.remainingAmount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                  ₹{formatCurrency(pricing.remainingAmount)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-500 mb-1">Policy</p>
              <p className="text-sm font-medium text-gray-900">
                {isAdvancePayment ? `Advance Payment (${pricing.policyMetadata?.advancePercentage || 50}%)` : 'Full Payment'}
              </p>
            </div>
          </section>

          {/* Timeline */}
          {booking.timeline && booking.timeline.length > 0 && (
            <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                <Clock className="w-4 h-4 text-primary" /> Timeline
              </h3>
              
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                {booking.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-5">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-white" />
                    <p className="text-sm font-medium text-gray-900 capitalize">{event.status}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.timestamp)} at {formatTime(event.timestamp)}</p>
                    {event.note && <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded-lg">{event.note}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </>,
    document.body
  );
};

export default BookingDetailsDrawer;
