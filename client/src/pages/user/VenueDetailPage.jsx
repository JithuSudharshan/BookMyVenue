import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenueById, getPublicSlotOverview } from '../../api/user-api/userApi';
import { AuthContext } from '../../store/AuthContext';
import { toast } from 'sonner';
import BaseVenueDetailPage from '../../components/common/VenueUi/BaseVenueDetailPage';
import VenueAvailabilitySidebar from '../../components/user/VenueAvailabilitySidebar';

const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Slot states
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    fetchVenue();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchSlots(year, month);
    }
  }, [id, year, month]);

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

  const fetchSlots = async (y, m) => {
    try {
      const data = await getPublicSlotOverview(id, y, m);
      setOverrides(data || []);
    } catch (error) {
      console.error('Failed to fetch slots', error);
    }
  };

  const bookingSidebar = venue ? (
    <VenueAvailabilitySidebar
      venue={venue}
      overrides={overrides}
      year={year}
      month={month}
      onMonthChange={(y, m) => {
        setYear(y);
        setMonth(m);
      }}
    />
  ) : null;

  return (
    <div className="bg-white min-h-screen">
      <BaseVenueDetailPage 
        venue={venue} 
        loading={loading} 
        backLabel="Venues" 
        onBack={() => navigate('/venues')}
        sidebarSlot={bookingSidebar}
      />
    </div>
  );
};

export default VenueDetailPage;

