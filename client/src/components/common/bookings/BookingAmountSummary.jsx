import React from 'react';

const formatCurrency = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const BookingAmountSummary = ({ pricing }) => {
  if (!pricing) return null;

  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">Total</p>
        <p className="font-semibold text-gray-900 text-sm">
          ₹{formatCurrency(pricing.totalAmount)}
        </p>
      </div>
      
      {pricing.remainingAmount > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Balance Due</p>
          <p className="font-semibold text-amber-600 text-sm">
            ₹{formatCurrency(pricing.remainingAmount)}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingAmountSummary;
