import React, { useEffect, useState } from 'react';
import { 
  CreditCard, Wallet, Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, ReceiptText
} from 'lucide-react';
import { getCustomerTransactions } from '../../api/user-api/transactionApi';
import './TransactionsPage.css';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filter, setFilter] = useState('All');

  const limit = 10;

  useEffect(() => {
    fetchTransactions(page, filter);
  }, [page, filter]);

  const fetchTransactions = async (currentPage, currentFilter) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerTransactions(currentPage, limit, currentFilter);
      if (res.success) {
        setTransactions(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CheckCircle size={14} />;
      case 'pending':
        return <Clock size={14} />;
      case 'failed':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className="tp-container">
      <div className="tp-header">
        <h1 className="tp-title">Payment Transactions</h1>
        <p className="tp-subtitle">View and track all your payment history</p>
      </div>

      <div className="tp-filters-card">
        <div className="tp-filters-scroll">
          {['All', 'Booking Payments', 'Wallet Top-ups', 'Success', 'Pending'].map((f) => (
            <button
              key={f}
              className={`tp-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => handleFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="tp-count-badge">
          Total: {totalCount}
        </div>
      </div>

      {loading ? (
        <div className="tp-loading-state">
          <div className="tp-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="tp-error-state">
          <XCircle size={40} className="text-red-500 mb-3" />
          <p>{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="tp-empty-state">
          <ReceiptText size={48} className="tp-empty-icon" />
          <h3>No transactions found</h3>
          <p>You haven't made any payments that match this filter.</p>
        </div>
      ) : (
        <div className="tp-table-wrapper">
          <table className="tp-table">
            <thead>
              <tr>
                <th className="tp-th w-12 text-center">#</th>
                <th className="tp-th">Type</th>
                <th className="tp-th">Description</th>
                <th className="tp-th">Date & Time</th>
                <th className="tp-th">Gateway</th>
                <th className="tp-th text-right">Amount</th>
                <th className="tp-th text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => {
                const isBooking = txn.paymentType === 'booking';
                const Icon = isBooking ? CreditCard : Wallet;
                const badge = getStatusBadgeColor(txn.status);
                const rowNum = (page - 1) * limit + index + 1;

                return (
                  <tr key={txn._id} className="tp-tr">
                    <td className="tp-td text-center text-muted font-semibold text-xs">{rowNum}</td>
                    <td className="tp-td">
                      <div className="flex items-center gap-2">
                        <div className={`tp-icon-wrapper-sm ${isBooking ? 'tp-icon-booking' : 'tp-icon-wallet'}`}>
                          <Icon size={16} />
                        </div>
                        <span className="font-bold text-ink text-sm">
                          {isBooking ? 'Booking Payment' : 'Wallet Top-up'}
                        </span>
                      </div>
                    </td>
                    <td className="tp-td">
                      {isBooking ? (
                        <span className="text-sm font-semibold text-ink">
                          {txn.bookingId?.venueId?.name ? `Venue: ${txn.bookingId.venueId.name}` : 'Booking'}
                        </span>
                      ) : (
                        <span className="text-sm text-muted">Wallet Deposit</span>
                      )}
                    </td>
                    <td className="tp-td text-xs text-muted whitespace-nowrap">
                      {formatDate(txn.paymentDate || txn.createdAt)}
                    </td>
                    <td className="tp-td text-xs font-semibold capitalize text-ink">
                      {txn.gateway}
                    </td>
                    <td className="tp-td text-right font-extrabold text-ink text-base whitespace-nowrap">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="tp-td text-center">
                      <div className={`tp-status-badge inline-flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                        {getStatusIcon(txn.status)}
                        <span>{txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="tp-pagination">
          <button 
            className="tp-page-btn" 
            disabled={page === 1} 
            onClick={handlePrevPage}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <span className="tp-page-info">
            Page {page} of {totalPages}
          </span>
          <button 
            className="tp-page-btn" 
            disabled={page === totalPages} 
            onClick={handleNextPage}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;
