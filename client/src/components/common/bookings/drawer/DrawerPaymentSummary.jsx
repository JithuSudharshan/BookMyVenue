import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const formatCurrency = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const DrawerPaymentSummary = ({ pricing, paymentStatus }) => {
  if (!pricing) return null;
  
  const isAdvancePayment = pricing.paymentPolicy === 'advance_payment';
  const amountPaid = pricing.totalAmount - (pricing.remainingAmount || 0);
  const progressPercent = pricing.totalAmount ? Math.round((amountPaid / pricing.totalAmount) * 100) : 0;
  
  const isFullySettled = paymentStatus?.toLowerCase() === 'completed' || pricing.remainingAmount === 0;

  return (
    <section className="bg-white border border-gray-100/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Financial Dashboard
        </h3>
        {isFullySettled && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Fully Settled
          </span>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden flex-1 mr-4">
            <div 
              className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${isFullySettled ? 'bg-emerald-500' : 'bg-primary'}`} 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <span className={`font-bold text-[11px] leading-none flex-shrink-0 ${isFullySettled ? 'text-emerald-600' : 'text-primary'}`}>
            {progressPercent}% Paid
          </span>
        </div>
      </div>
      
      {/* Big Numbers Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100/50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">₹{formatCurrency(pricing.totalAmount)}</p>
        </div>
        <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100/50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Paid</p>
          <p className={`text-lg font-bold ${isFullySettled ? 'text-emerald-600' : 'text-gray-900'}`}>
            ₹{formatCurrency(amountPaid)}
          </p>
        </div>
      </div>
      
      {/* Remaining Balance Section */}
      {!isFullySettled && (
        <div className="bg-amber-50/30 border border-amber-100/50 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
              <AlertCircle className="w-3.5 h-3.5" /> Action Required
            </p>
            <p className="text-sm font-semibold text-gray-900">Balance Remaining</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-amber-600">₹{formatCurrency(pricing.remainingAmount)}</p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-gray-100/80 grid grid-cols-2 gap-3 text-xs">
        {pricing.balanceDueDate && !isFullySettled && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
            <p className="font-semibold text-gray-900">{formatDate(pricing.balanceDueDate)}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Policy</p>
          <p className="font-semibold text-gray-900">
            {isAdvancePayment ? `Advance (${pricing.policyMetadata?.advancePercentage || 50}%)` : 'Full Payment'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DrawerPaymentSummary;
