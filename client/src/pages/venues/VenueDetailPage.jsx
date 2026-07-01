import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicVenueApi } from '../../api/vendor-api/venueApi';
import {
  MapPin,
  Users,
  IndianRupee,
  CheckCircle,
  ChevronLeft,
  Calendar,
  Pencil,
  Trash2,
  BarChart3,
  CheckCircle2,
  Clock3,
  XCircle,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const fetchVenue = async () => {
    try {
      setLoading(true);
      const res = await publicVenueApi.getVenueById(id);
      setVenue(res.venue);
    } catch (error) {
      toast.error('Failed to load venue details');
      navigate('/vendor/venues');
    } finally {
      setLoading(false);
    }
  };

  const getApprovalBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success font-label-sm border border-success/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-container text-on-error-container font-label-sm border border-error/20">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 font-label-sm border border-amber-200">
            <Clock3 className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
    }
  };

  const getVenueStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-label-sm border border-emerald-200">
            <Activity className="w-3.5 h-3.5" /> Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-variant text-on-surface-variant font-label-sm border border-outline-variant">
            <Activity className="w-3.5 h-3.5" /> Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-container text-on-error-container font-label-sm border border-error/20">
            <Activity className="w-3.5 h-3.5" /> Closed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 mb-6 text-on-surface-variant font-body-sm">
        <button
          onClick={() => navigate('/vendor/venues')}
          className="flex items-center gap-1.5 hover:text-primary transition-colors font-label-md"
        >
          <ChevronLeft className="w-4 h-4" />
          My Venues
        </button>
        <span>/</span>
        <span className="text-on-surface font-label-md truncate">{venue.name}</span>
      </div>

      {/* Page Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-2">{venue.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center text-on-surface-variant font-body-md">
              <MapPin className="w-4 h-4 mr-1 text-primary" />
              {venue.location}
            </div>
            {getApprovalBadge(venue.approvalStatus)}
            {getVenueStatusBadge(venue.venueStatus)}
          </div>
        </div>

        {/* Vendor Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => toast.info('Edit venue — coming soon!')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-all"
          >
            <Pencil className="w-4 h-4" />
            Edit Venue
          </button>
          <button
            onClick={() => toast.info('Manage bookings — coming soon!')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Manage Bookings
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {/* Main big image */}
        <div className="md:col-span-3 aspect-video md:h-[440px] rounded-3xl overflow-hidden shadow-md relative group">
          {venue.images && venue.images.length > 0 ? (
            <img
              src={venue.images[selectedImage]}
              alt="Venue view"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-body-lg rounded-3xl border border-outline-variant">
              No Images Available
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {venue.images && venue.images.length > 1 && (
          <div className="flex overflow-x-auto md:flex-col gap-4 pb-2 md:pb-0 md:h-[440px] md:overflow-y-auto pr-1">
            {venue.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-32 md:w-full aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Left / Main Info ── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant text-center shadow-sm">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-label-sm text-on-surface-variant mb-1">Capacity</p>
              <p className="font-title-md text-on-surface">{venue.capacity ?? '—'} pax</p>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant text-center shadow-sm">
              <IndianRupee className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-label-sm text-on-surface-variant mb-1">Base Price</p>
              <p className="font-title-md text-on-surface">₹{venue.pricing?.toLocaleString()}</p>
            </div>
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant text-center shadow-sm">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-label-sm text-on-surface-variant mb-1">Buffer Time</p>
              <p className="font-title-md text-on-surface">{venue.bufferTime || 0} hrs</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-headline-sm text-on-surface mb-3">About this venue</h2>
            <p className="font-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
              {venue.description || 'No description provided.'}
            </p>
          </div>

          <hr className="border-outline-variant" />

          {/* Amenities */}
          <div>
            <h2 className="font-headline-sm text-on-surface mb-5">Amenities</h2>
            {venue.amenities && venue.amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {venue.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center text-on-surface font-body-md">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant font-body-md">No amenities listed.</p>
            )}
          </div>
        </div>

        {/* ── Right / Vendor Status Widget ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">

            {/* Status Card */}
            <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-md">
              <h3 className="font-title-md text-on-surface mb-5">Venue Status</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-on-surface-variant">Approval</span>
                  {getApprovalBadge(venue.approvalStatus)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-on-surface-variant">Listing</span>
                  {getVenueStatusBadge(venue.venueStatus)}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-md">
              <h3 className="font-title-md text-on-surface mb-5">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => toast.info('Edit venue — coming soon!')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-all text-left"
                >
                  <Pencil className="w-4 h-4 text-primary" />
                  Edit Venue Details
                </button>
                <button
                  onClick={() => toast.info('Manage bookings — coming soon!')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-all text-left"
                >
                  <BarChart3 className="w-4 h-4 text-primary" />
                  View Bookings
                </button>
                <button
                  onClick={() => toast.warning('Delete venue — coming soon!')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-error/30 text-error font-label-md hover:bg-error-container/50 transition-all text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Venue
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;
