import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ImageIcon } from 'lucide-react';

const TopPerformersWidget = ({ venues = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white shadow-[0_8px_30px_rgb(220,0,22,0.04)] h-full flex flex-col">
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h3 className="font-headline-sm text-on-surface">Top Performing Venues</h3>
        <TrendingUp className="w-5 h-5 text-on-surface-variant" />
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {venues.length > 0 ? venues.map((venue) => (
          <div 
            key={venue.id} 
            onClick={() => navigate(`/vendor/venues/${venue.id}`)}
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-surface-variant/30 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-surface-variant/50 overflow-hidden shrink-0 flex items-center justify-center ring-1 ring-outline-variant/30">
              {venue.image?.url ? (
                <img src={venue.image.url} alt={venue.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-on-surface-variant/50" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-label-lg text-on-surface truncate group-hover:text-primary transition-colors">
                {venue.name}
              </h4>
              <p className="font-body-sm text-on-surface-variant mt-0.5">
                {venue.totalBookings} Bookings
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-label-lg text-on-surface">₹{venue.revenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 justify-end text-xs text-amber-500 font-medium mt-0.5">
                <span>★ {(Math.floor(Math.random() * (50 - 40 + 1) + 40) / 10).toFixed(1)}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <p className="font-body-md text-on-surface-variant">No performance data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPerformersWidget;
