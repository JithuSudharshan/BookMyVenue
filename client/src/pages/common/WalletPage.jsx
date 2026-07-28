import React, { useEffect, useState, useMemo } from 'react';
import { 
  Wallet, ArrowDownCircle, ArrowUpCircle, 
  ChevronLeft, ChevronRight, ReceiptText, 
  Search, ArrowDownToLine, ArrowUpFromLine, Calendar, CheckCircle2, PlusCircle
} from 'lucide-react';
import { fetchWalletDetails } from '../../api/user-api/walletApi';
import BaseModal from '../../components/ui/BaseModal';
import './WalletPage.css';

const LIMIT = 8;
const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

function WalletPage() {
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalCredits: 0, totalDebits: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTxnCount, setTotalTxnCount] = useState(0);

  // Local UI State
  const [filter, setFilter] = useState('All'); 
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpError, setTopUpError] = useState('');

  useEffect(() => {
    loadWallet(page, filter);
  }, [page, filter]);

  const loadWallet = async (currentPage, currentFilter) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWalletDetails(currentPage, LIMIT, currentFilter);
      if (res.success) {
        setWalletData(res.data.wallet);
        setTransactions(res.data.transactions || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalTxnCount(res.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleAmountChange = (val) => {
    setTopUpAmount(val);
    const num = Number(val);
    if (val !== '' && (isNaN(num) || num <= 0)) {
      setTopUpError('Please enter a valid amount greater than ₹0');
    } else if (num > 50000) {
      setTopUpError('Maximum top-up amount per transaction is ₹50,000');
    } else {
      setTopUpError('');
    }
  };

  const handleProceedToRazorpay = () => {
    const num = Number(topUpAmount);
    if (!num || num <= 0 || num > 50000) return;
    
    // Razorpay Integration Stub — Backend developer will replace/integrate this
    console.log('Initiating Razorpay checkout for amount:', num);
    // Future integration: call createRazorpayOrder(num), load Razorpay SDK, open modal
  };

  const handleCloseModal = () => {
    setIsTopUpModalOpen(false);
    setTopUpAmount('');
    setTopUpError('');
  };

  const parsedAmount = Number(topUpAmount);
  const isValidAmount = Boolean(parsedAmount > 0 && parsedAmount <= 50000 && !topUpError);

  return (
    <div className="wp-page">
      {/* Header */}
      <div className="wp-header">
        <h1 className="wp-title">Wallet</h1>
        <p className="wp-subtitle">
          Manage your credits and payment history securely.
        </p>
      </div>

      {/* Balance Card */}
      <div className="wp-balance-card">
        <div className="wp-balance-info">
          <p className="wp-balance-label">Available Balance</p>
          <div className="wp-balance-amount">
            {loading ? '...' : formatCurrency(walletData?.currentBalance ?? 0)}
          </div>
        </div>
        <div className="wp-balance-actions">
          <button 
            className="wp-topup-btn"
            onClick={() => setIsTopUpModalOpen(true)}
          >
            <PlusCircle size={18} />
            <span>Add Money</span>
          </button>
          <div className="wp-balance-icon">
            <Wallet size={48} strokeWidth={1.5} className="text-white" />
          </div>
        </div>
      </div>



      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="wp-filters-container">
        <div className="wp-filters">
          {['All', 'Credit', 'Debit'].map(f => (
            <button 
              key={f}
              className={`wp-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => handleFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="wp-txn-container">
        <div className="wp-txn-header">
          <h2>Transaction History</h2>
          {!loading && (
            <span className="wp-txn-count">
              Showing {transactions.length > 0 ? (page - 1) * LIMIT + 1 : 0} - {(page - 1) * LIMIT + transactions.length} of {totalTxnCount}
            </span>
          )}
        </div>

        {loading && transactions.length === 0 ? (
          <div className="wp-state">
            <p style={{ color: '#717171' }}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="wp-state">
            <ReceiptText size={48} strokeWidth={1} color="#ccc" />
            <p style={{ color: '#717171', marginTop: 12 }}>No transactions found.</p>
          </div>
        ) : (
          <div className="wp-txn-list">
            {transactions.map((txn) => {
              const isCredit = txn.transactionType === 'Credit';
              const typeClass = isCredit ? 'credit' : 'debit';
              const badgeText = txn.transactionType;
              const Icon = isCredit ? ArrowDownCircle : ArrowUpCircle;

              return (
                <div key={txn._id} className="wp-txn-card">
                  {/* Icon */}
                  <div className={`wp-txn-icon-wrap wp-txn-icon-${typeClass}`}>
                    <Icon size={22} />
                  </div>

                  {/* Details */}
                  <div className="wp-txn-details">
                    <div className="wp-txn-title">
                      {txn.description || txn.transactionType}
                    </div>
                    <div className="wp-txn-meta">
                      <span><Calendar size={13} /> {formatDate(txn.createdAt)}</span>
                      {txn.referenceId && (
                        <span><CheckCircle2 size={13} /> Ref: {txn.referenceId.slice(-8).toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  {/* Amount & Badge */}
                  <div className="wp-txn-amount-col">
                    <div className={`wp-txn-amount ${typeClass}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                    </div>
                    <div className={`wp-txn-badge ${typeClass}`}>
                      {badgeText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="wp-pagination">
            <button
              className="wp-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="wp-page-text">Page {page} of {totalPages}</span>
            <button
              className="wp-page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Top-Up Modal */}
      <BaseModal
        isOpen={isTopUpModalOpen}
        onClose={handleCloseModal}
        title="Add Money to Wallet"
        maxWidth="max-w-md"
      >
        <div className="wp-modal-body">
          <div className="wp-input-group">
            <label className="wp-input-label">Enter Amount</label>
            <div className="wp-input-wrapper">
              <span className="wp-input-symbol">₹</span>
              <input
                type="number"
                className="wp-topup-input"
                placeholder="0.00"
                value={topUpAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                min="1"
                max="50000"
                autoFocus
              />
            </div>
            {topUpError && <p className="wp-error-text">{topUpError}</p>}
          </div>

          <div className="wp-input-group">
            <label className="wp-input-label">Quick Add</label>
            <div className="wp-presets-grid">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`wp-preset-chip ${Number(topUpAmount) === amt ? 'active' : ''}`}
                  onClick={() => handleAmountChange(amt.toString())}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="wp-pay-btn"
            disabled={!isValidAmount}
            onClick={handleProceedToRazorpay}
          >
            Proceed to Pay {isValidAmount ? formatCurrency(parsedAmount) : ''}
          </button>
        </div>
      </BaseModal>
    </div>
  );
}

export default WalletPage;

