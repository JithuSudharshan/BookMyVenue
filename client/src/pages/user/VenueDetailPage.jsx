import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenueById, getPublicAvailability } from '../../api/user-api/userApi';
import { AuthContext } from '../../store/AuthContext';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import BaseVenueDetailPage from '../../components/common/VenueUi/BaseVenueDetailPage';
import BookingWidget from '../../components/user/booking/BookingWidget';
import { BookingProvider } from '../../store/BookingContext';
import { addToWishlist, removeFromWishlist, getWishlist } from '../../api/user-api/wishlistApi';

const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Slot states
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    fetchVenue();
    if (user) {
      checkWishlistStatus();
    }
  }, [id, user]);

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
      const data = await getPublicAvailability(id, { year: y, month: m });
      setOverrides(data || []);
    } catch (error) {
      console.error('Failed to fetch slots', error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const data = await getWishlist(1, 100); // fetch all to check
      if (data && data.wishlist) {
        setIsWishlisted(data.wishlist.some(v => v.venueId === id || (v.venueId && v.venueId._id === id)));
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.info('Please log in to add to wishlist.');
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(id);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const bookingSidebar = venue ? (
    <BookingProvider>
      <BookingWidget
        venue={venue}
        overrides={overrides}
        year={year}
        month={month}
        onMonthChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
      />
    </BookingProvider>
  ) : null;

  const wishlistButton = (
    <button
      onClick={handleWishlistToggle}
      disabled={wishlistLoading}
      className={`p-3 rounded-full border transition-all flex items-center justify-center ${
        isWishlisted 
          ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
    </button>
  );

  return (
    <div className="bg-white min-h-screen">
      <BaseVenueDetailPage 
        venue={venue} 
        loading={loading} 
        backLabel="Venues" 
        onBack={() => navigate('/venues')}
        sidebarSlot={bookingSidebar}
        headerActionsSlot={wishlistButton}
      />
    </div>
  );
};

export default VenueDetailPage;

