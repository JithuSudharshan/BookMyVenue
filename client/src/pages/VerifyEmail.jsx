import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { AuthContext } from '../store/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  const hasRun = React.useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/auth/verify-email/${token}`);
        setStatus('success');
        setUserData(res.data);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be expired or already used.');
      }
    };

    if (token && !hasRun.current) {
      hasRun.current = true;
      verifyToken();
    }
  }, [token]);

  const handleContinue = () => {
    if (userData) {
      // Auto-login since the backend provided an auth token
      login(userData);
      
      // Explicitly route to the correct dashboard since this page is not under PublicRoute
      const role = userData.user?.role;
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'vendor') {
        navigate('/vendor-dashboard');
      } else {
        navigate('/home');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <AuthLayout 
      title={status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified Successfully' : 'Verification Failed'} 
      subtitle={status === 'loading' ? 'Please wait while we verify your account.' : ''}
    >
      <div className="text-center space-y-6 mt-8 flex flex-col items-center">
        
        {status === 'loading' && (
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="font-body-lg text-on-surface-variant">
              Your account has been activated. You are ready to explore premium venues!
            </p>
            <div className="pt-6 w-full">
              <button 
                onClick={handleContinue}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary-container bg-primary-container hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
              >
                Go to Home
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center text-error mb-2">
              <XCircle className="w-10 h-10" />
            </div>
            <p className="font-body-lg text-on-surface-variant">
              {message}
            </p>
            <div className="pt-6 w-full">
              <button 
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary-container bg-primary-container hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
              >
                Return to Login
              </button>
            </div>
          </>
        )}
        
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
