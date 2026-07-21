import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-container-lowest p-6 text-center">
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-on-surface mb-6">Page Not Found</h2>
      <p className="text-on-surface-variant mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="bg-primary text-on-primary font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
