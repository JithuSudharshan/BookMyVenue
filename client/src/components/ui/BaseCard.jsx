import React from 'react';

const BaseCard = ({ children, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default BaseCard;
