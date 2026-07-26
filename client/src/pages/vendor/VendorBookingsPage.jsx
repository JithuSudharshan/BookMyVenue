import React, { useState } from 'react';
import { Calendar, Search, Filter, ChevronDown, Download, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';

const VendorBookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const bookings = [];
 
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
            <Clock className="w-3.5 h-3.5 mr-1" /> Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">Bookings</h1>
          <p className="text-on-surface-variant text-sm md:text-base">Manage all your venue reservations and requests.</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-16 text-center">
        <Calendar className="w-24 h-24 text-outline-variant mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-on-surface mb-2">No Bookings Yet</h2>
        <p className="text-on-surface-variant mb-6">Once customers start booking your venue, you'll see all your reservations listed here.</p>
      </div>

    </div>
  );
};

export default VendorBookingsPage;
