import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, IndianRupee, CheckCircle2, Clock3, XCircle } from 'lucide-react';

const VenueCard = ({ venue }) => {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (venue.approvalStatus) {
      case 'Approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-success/10 text-success font-label-sm border border-success/20 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-error-container text-on-error-container font-label-sm border border-error/20 shadow-sm">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-label-sm border border-amber-200 shadow-sm">
            <Clock3 className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => navigate(`/vendor/venues/${venue._id}`)}
      className="group bg-surface border border-outline-variant rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
        {venue.images && venue.images.length > 0 ? (
          <img
            src={venue.images[0]}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-body-sm">
            No Image
          </div>
        )}
        <div className="absolute top-4 left-4 z-10">{getStatusBadge()}</div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-headline-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {venue.name}
        </h3>

        <div className="flex items-center text-on-surface-variant mb-4 font-body-sm">
          <MapPin className="w-4 h-4 mr-1 text-primary flex-shrink-0" />
          <span className="line-clamp-1">{venue.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <div className="flex items-center space-x-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-label-md text-on-surface">{venue.capacity || 0} pax</span>
          </div>
          <div className="flex items-center space-x-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="font-label-md text-on-surface">₹{venue.pricing?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
