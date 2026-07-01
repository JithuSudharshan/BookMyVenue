import React, { useEffect, useState, useMemo } from 'react';
import { 
  Wallet, ArrowDownCircle, ArrowUpCircle, 
  ChevronLeft, ChevronRight, ReceiptText, 
  Search, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Calendar, CheckCircle2
} from 'lucide-react';
import { fetchWalletDetails } from '../../api/user-api/walletApi';
import './WalletPage.css';

const LIMIT = 8;

function WalletPage() {
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalCredits: 0, totalDebits: 0, totalRefunds: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTxnCount, setTotalTxnCount] = useState(0);

  // Local UI State
  const [filter, setFilter] = useState('All'); 

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

  return (
    <div className="wp-page">
      {/* Header */}
      <div className="wp-header">
        <h1 className="wp-title">Wallet</h1>
        <p className="wp-subtitle">
          Manage your credits, payment history, and refunds securely.
        </p>
      </div>

      {/* Balance Card */}
      <div className="wp-balance-card">
        <div className="wp-balance-info">
          <p className="wp-balance-label">Available Balance</p>
          <div className="wp-balance-amount">
            {loading ? '...' : formatCurrency(walletData?.currentBalance ?? 0)}
          </div>
          {walletData && (
            <div className="wp-wallet-id">
              ID: {walletData._id}
            </div>
          )}
        </div>
        <div className="wp-balance-icon">
          <Wallet size={48} strokeWidth={1.5} color="#fff" />
        </div>
      </div>



      {error && (
        <div style={{ padding: 16, background: '#fce8e6', color: '#d93025', borderRadius: 10, marginBottom: 24, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="wp-filters-container">
        <div className="wp-filters">
          {['All', 'Credit', 'Debit', 'Refund'].map(f => (
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
              const isRefund = (txn.description || '').toLowerCase().includes('refund');
              
              let typeClass = isCredit ? 'credit' : 'debit';
              let badgeText = txn.transactionType;
              let Icon = isCredit ? ArrowDownCircle : ArrowUpCircle;
              
              if (isRefund) {
                typeClass = 'refund';
                badgeText = 'Refund';
                Icon = RefreshCcw;
              }

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
    </div>
  );
}

export default WalletPage;
