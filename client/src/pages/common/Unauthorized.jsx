import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-container-lowest p-6 text-center">
      <FiShield className="text-error w-20 h-20 mb-6" />
      <h1 className="text-4xl font-bold text-on-surface mb-4">Access Denied</h1>
      <p className="text-on-surface-variant mb-8 max-w-md">
        You do not have the required permissions to view this page. If you believe this is an error, please contact support.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="border-2 border-outline text-on-surface font-bold py-3 px-8 rounded-full hover:bg-surface-container transition-colors"
        >
          Go Back
        </button>
        <Link 
          to="/" 
          className="bg-primary text-on-primary font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
