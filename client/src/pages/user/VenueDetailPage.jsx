import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenueById } from '../../api/user-api/userApi';
import { AuthContext } from '../../store/AuthContext';
import { Clock3 } from 'lucide-react';
import { toast } from 'sonner';
import BaseVenueDetailPage from '../../components/common/VenueUi/BaseVenueDetailPage';

const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const fetchVenue = async () => {
    try {
      setLoading(true);
      const data = await getVenueById(id);
      setVenue(data);
    } catch (error) {
      toast.error('Failed to load venue details');
      navigate('/venues');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toast.info('Booking feature coming soon!');
  };

  const bookingSidebar = venue ? (
    <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-md">
      <h3 className="font-title-md text-on-surface mb-2">Book this venue</h3>
      <p className="text-on-surface-variant font-body-sm mb-5">
        Check availability and secure your date.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
           <div className="flex items-center gap-2 text-on-surface-variant">
              <Clock3 className="w-4 h-4 text-primary" />
              <span className="font-label-sm">Starting from</span>
           </div>
           <span className="font-title-md text-primary">₹{venue.price?.toLocaleString('en-IN')}</span>
        </div>
        
        <button
          onClick={handleBooking}
          className="w-full flex items-center justify-center py-3 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-sm"
        >
          Book This Venue
        </button>
      </div>
    </div>
  ) : null;

  return (
    <BaseVenueDetailPage 
      venue={venue} 
      loading={loading} 
      backLabel="Venues" 
      onBack={() => navigate('/venues')}
      sidebarSlot={bookingSidebar}
    />
  );
};

export default VenueDetailPage;
