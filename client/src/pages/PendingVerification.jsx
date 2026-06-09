import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import AuthLayout from '../layouts/AuthLayout';

const PendingVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email';
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Initialize timer from localStorage
  useEffect(() => {
    if (email === 'your email') return;
    
    const lastSent = localStorage.getItem(`resendTimer_${email}`);
    if (lastSent) {
      const elapsed = Date.now() - parseInt(lastSent, 10);
      const remaining = Math.max(0, Math.ceil((60000 - elapsed) / 1000));
      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        localStorage.removeItem(`resendTimer_${email}`);
      }
    }
  }, [email]);

  // Handle countdown interval
  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  const handleResend = async () => {
    if (email === 'your email') {
      setError('Email address not found. Please try logging in or signing up again.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await axios.post('http://localhost:5001/api/auth/resend-verification', { email });
      setMessage('Verification link resent! Please check your inbox.');
      
      // Start 60s cooldown
      localStorage.setItem(`resendTimer_${email}`, Date.now().toString());
      setTimeLeft(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Check Your Email" 
      subtitle="We need to verify your identity to secure your account."
    >
      <div className="text-center space-y-6 mt-8">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <Mail className="w-10 h-10" />
        </div>
        
        <p className="font-body-lg text-on-surface-variant">
          We've sent a verification link to:
          <br />
          <strong className="text-on-surface font-semibold">{email}</strong>
        </p>
        
        <p className="font-body-sm text-secondary-fixed-dim">
          Click the link in the email to activate your account. The link expires in 15 minutes.
        </p>

        {message && (
          <div className="bg-success-container text-success p-3 rounded-lg font-body-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg font-body-sm">
            {error}
          </div>
        )}

        <div className="pt-6 space-y-4">
          <button 
            onClick={handleResend}
            disabled={loading || timeLeft > 0}
            className="w-full flex justify-center items-center py-3 px-4 border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface bg-surface hover:bg-surface-container-high focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : null}
            {loading ? 'Resending...' : timeLeft > 0 ? `Resend Email (${timeLeft}s)` : 'Resend Email'}
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex justify-center items-center py-3 px-4 text-primary hover:text-brand-dark transition-colors font-label-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default PendingVerification;
