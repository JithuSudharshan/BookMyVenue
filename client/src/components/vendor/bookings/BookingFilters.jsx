import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const BookingFilters = ({ filters, venues, onChange }) => {
  const { search, venueId, bookingMode } = filters;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search booking ID..."
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
        />
      </div>

      {/* Venue */}
      {venues && venues.length > 0 && (
        <div className="relative">
          <select
            value={venueId}
            onChange={(e) => onChange({ venueId: e.target.value })}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition cursor-pointer text-gray-700"
          >
            <option value="">All Venues</option>
            {venues.map((v) => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Booking Type */}
      <div className="relative">
        <select
          value={bookingMode}
          onChange={(e) => onChange({ bookingMode: e.target.value })}
          className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition cursor-pointer text-gray-700"
        >
          <option value="">All Types</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export default BookingFilters;
