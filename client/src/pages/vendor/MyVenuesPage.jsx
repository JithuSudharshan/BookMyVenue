import React, { useState, useEffect } from 'react';
import { vendorVenueApi } from '../../api/vendor-api/venueApi';
import VenueCard from '../../components/vendor/Venues/VenueCard';
import { Search, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const MyVenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await vendorVenueApi.getMyVenues();
      setVenues(res.venues || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-2">My Venues</h1>
          <p className="font-body-md text-on-surface-variant">
            {venues.length} venue{venues.length !== 1 ? 's' : ''} listed under your account.
          </p>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 w-full sm:w-64 bg-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-sm shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-[32px] p-16 text-center shadow-sm">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Building2 className="w-12 h-12 text-outline" />
          </div>
          <h3 className="font-headline-sm text-on-surface mb-3">No venues found</h3>
          <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms.'
              : 'No venues are listed under your account yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyVenuesPage;
