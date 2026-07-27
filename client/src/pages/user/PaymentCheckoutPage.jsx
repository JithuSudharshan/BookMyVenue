import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, CreditCard, MapPin, CheckCircle2, Info, Clock, CalendarDays, Users } from 'lucide-react';
import { AuthContext } from '../../store/AuthContext';
import { useContext } from 'react';

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('en-IN').format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateDisplay = (date, startDate, endDate) => {
  if (date) return formatDate(date);
  if (startDate && endDate) {
    if (startDate === endDate) return formatDate(startDate);
    return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  }
  return '';
};

const PaymentCheckoutPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, failed, cancelled, expired, completed

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (paymentStatus !== 'completed' && paymentStatus !== 'expired') {
        setPaymentStatus('expired');
      }
      return;
    }
    if (paymentStatus === 'expired' || paymentStatus === 'completed') return;

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  const fetchSession = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/session/${sessionId}`);
      if (response.data.alreadyConfirmed) {
        toast.info('Booking is already confirmed!');
        navigate('/customer/bookings');
        return;
      }
      setSession(response.data.data.session);
      setTimeLeft(response.data.data.remainingSeconds);
    } catch (error) {
      toast.error('Failed to load session or session expired.');
      navigate('/venues');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order
      const orderResponse = await axiosInstance.post('/bookings/payment/order', { sessionId });
      if (orderResponse.data.alreadyConfirmed) {
        toast.info('Booking is already confirmed!');
        navigate('/customer/bookings');
        return;
      }
      const order = orderResponse.data.data;

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy', 
        amount: order.amount,
        currency: order.currency,
        name: "BookMyVenue",
        description: "Venue Booking Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify on Backend
            const verifyResponse = await axiosInstance.post('/bookings/payment/verify', {
              sessionId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              setPaymentStatus('completed');
              toast.success('Booking confirmed successfully!');
              navigate('/customer/bookings');
            }
          } catch (error) {
            setPaymentStatus('failed');
            toast.error(error.response?.data?.message || 'Payment verification failed.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus('cancelled');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#4F46E5"
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        setPaymentStatus('failed');
        toast.error(response.error.description || 'Payment failed. Please try again.');
        setIsProcessing(false);
      });

      rzp.open();

    } catch (error) {
      setPaymentStatus('failed');
      toast.error(error.response?.data?.message || 'Could not initialize payment gateway.');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const { pricing, venueId } = session;
  const payableAmount = pricing.paymentPolicy === 'advance_payment' 
    ? pricing.advanceAmount 
    : pricing.totalAmount;
    
  const primaryImage = venueId?.images?.find(img => img.isPrimary)?.url || venueId?.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=Venue';
  const refId = session.sessionId ? session.sessionId.split('-')[0].toUpperCase() : 'N/A';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Ref ID: {refId}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm ${paymentStatus === 'expired' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'}`}>
            <Clock className="w-4 h-4" />
            {paymentStatus === 'expired' ? 'Session Expired' : `Time remaining: ${formatTime(timeLeft)}`}
          </div>
        </div>

        {paymentStatus === 'cancelled' && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900">Payment Cancelled</h4>
              <p className="text-sm text-orange-800 mt-1">
                Your payment was cancelled. Your reservation is still held—please retry the payment before the timer expires.
              </p>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Payment Failed</h4>
              <p className="text-sm text-red-800 mt-1">
                Your payment could not be completed. Your reservation is still held. Please try another payment method before the timer expires.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            {/* Venue Info */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <img 
                src={primaryImage} 
                alt={venueId?.name || 'Venue'} 
                className="w-24 h-24 object-cover rounded-xl shadow-sm"
              />
              <div className="flex flex-col justify-center">
                <h2 className="text-xl font-bold text-gray-800">{venueId?.name}</h2>
                <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{venueId?.location?.address}, {venueId?.location?.city}</span>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Booking Summary
              </h3>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CalendarDays className="w-5 h-5"/></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</p>
                    <p className="font-semibold text-gray-800">{formatDateDisplay(session.date, session.startDate, session.endDate)}</p>
                  </div>
                </div>
                {session.bookingMode === 'hourly' && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Clock className="w-5 h-5"/></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Time</p>
                      <p className="font-semibold text-gray-800">{session.fromTime} - {session.toTime}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users className="w-5 h-5"/></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Guests</p>
                    <p className="font-semibold text-gray-800">{session.guestCount} People</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Policy</h3>
                {pricing.paymentPolicy === 'advance_payment' ? (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Advance Payment Required</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        You are paying a {pricing.policyMetadata?.advancePercentage || 50}% advance to secure this booking. The remaining balance must be paid later to complete the reservation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Full Payment Required</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Full payment is required now to confirm and secure this booking completely.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Cancellation Policy</h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-600">
                  <p>Free cancellation up to 48 hours prior to the booking start time. Cancellations made within 48 hours will incur a 50% cancellation fee.</p>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">What happens after payment?</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Instant Confirmation</p>
                    <p className="text-xs text-gray-500 mt-0.5">Your venue slot will be immediately secured upon successful payment.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Venue Contact Details</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pricing.paymentPolicy === 'advance_payment' 
                        ? 'Host contact details will remain hidden and will only become available after the full remaining balance is paid.' 
                        : 'Host contact information will be provided immediately on the confirmation page.'}
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Booking Management</p>
                    <p className="text-xs text-gray-500 mt-0.5">You can view and manage this booking anytime from your Booking History profile.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {paymentStatus === 'expired' ? (
            <div className="lg:col-span-2">
              <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center sticky top-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Reservation Expired</h3>
                <p className="text-sm text-red-700 mb-6">
                  The time limit for this reservation has ended, and your slot has been released.
                </p>
                <button
                  onClick={() => navigate('/venues')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow transition"
                >
                  Start New Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Price Breakdown</h3>
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Price</span>
                    <span className="font-medium text-gray-800">₹{formatCurrency(pricing.baseAmount)}</span>
                  </div>
                  {pricing.walletDeduction > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Wallet Applied</span>
                      <span className="font-medium">- ₹{formatCurrency(pricing.walletDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 text-gray-800">
                    <span>Total Amount</span>
                    <span>₹{formatCurrency(pricing.totalAmount)}</span>
                  </div>
                  {pricing.paymentPolicy === 'advance_payment' && (
                    <div className="flex justify-between text-blue-600 pt-1">
                      <span>Advance Payable ({pricing.policyMetadata?.advancePercentage || 50}%)</span>
                      <span className="font-medium">₹{formatCurrency(pricing.advanceAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Amount to Pay Now</span>
                    <span className="text-2xl font-bold text-primary">₹{formatCurrency(payableAmount)}</span>
                  </div>
                </div>

                <div className="mb-6 flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    id="terms"
                    className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    disabled={isProcessing}
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
                    I have read and agree to the <span className="text-primary hover:underline">Terms & Conditions</span> and the <span className="text-primary hover:underline">Cancellation Policy</span>.
                  </label>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !isTermsAccepted}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {paymentStatus === 'failed' || paymentStatus === 'cancelled' ? 'Retry Payment' : `Pay ₹${formatCurrency(payableAmount)}`}
                    </>
                  )}
                </button>
                
                <div className="flex flex-col items-center justify-center gap-1 mt-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-gray-700">Secured by Razorpay</span>
                  </div>
                  <span>100% secure & encrypted payments</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;
