import React from 'react';
import { Loader2 } from 'lucide-react';

const SubmitButton = ({ 
  text, 
  loadingText = 'Processing...', 
  loading = false, 
  disabled = false,
  className = ''
}) => {
  return (
    <button 
      type="submit" 
      disabled={loading || disabled}
      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary-container bg-primary-container hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {loading ? loadingText : text}
    </button>
  );
};

export default SubmitButton;
