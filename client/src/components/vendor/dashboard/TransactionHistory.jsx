import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

const TransactionHistory = ({ transactions = [] }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white shadow-[0_8px_30px_rgb(220,0,22,0.04)] h-full flex flex-col">
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h3 className="font-headline-sm text-on-surface">Recent Wallet History</h3>
        <Clock className="w-5 h-5 text-on-surface-variant" />
      </div>

      <div className="flex-1 flex flex-col overflow-x-auto">
        {transactions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/40">
                <th className="pb-3 font-label-md text-on-surface-variant font-medium">Transaction</th>
                <th className="pb-3 font-label-md text-on-surface-variant font-medium">Date</th>
                <th className="pb-3 font-label-md text-on-surface-variant font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-variant/20 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${tx.transactionType === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.transactionType === 'Credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <span className="font-body-sm sm:font-body-md text-on-surface whitespace-nowrap sm:whitespace-normal">{tx.description || 'Wallet Transfer'}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-body-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <span className={`font-label-md sm:font-label-lg ${tx.transactionType === 'Credit' ? 'text-green-600' : 'text-on-surface'}`}>
                      {tx.transactionType === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <p className="font-body-md text-on-surface-variant">No recent transactions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
