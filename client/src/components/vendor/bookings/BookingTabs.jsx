import React from 'react';

const TABS = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Today', value: 'today' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'All', value: 'all' },
];

const BookingTabs = ({ activeTab, onChange }) => (
  <div className="flex gap-1 bg-gray-100/70 p-1 rounded-xl w-fit mb-6 overflow-x-auto">
    {TABS.map(({ label, value }) => (
      <button
        key={value}
        onClick={() => onChange(value)}
        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
          activeTab === value
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default BookingTabs;
