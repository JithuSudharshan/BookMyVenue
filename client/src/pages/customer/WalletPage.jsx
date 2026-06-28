import React, { useEffect, useState } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight, ReceiptText } from 'lucide-react';
import { fetchWalletDetails } from '../../api/user-api/walletApi';

const LIMIT = 8;

function WalletPage() {
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadWallet(page);
  }, [page]);

  const loadWallet = async (currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWalletDetails(currentPage, LIMIT);
      if (res.success) {
        setWalletData(res.data.wallet);
        setTransactions(res.data.transactions || []);
        setTotalPages(res.pagination?.totalPages || 1);
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

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>Wallet</h1>
        <p style={{ color: '#717171', marginTop: 6, fontSize: 15 }}>
          Manage your credits, payment history, and refunds.
        </p>
      </div>

      {/* Balance Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
          borderRadius: 20,
          padding: '32px 36px',
          marginBottom: 28,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 32px rgba(15, 52, 96, 0.30)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', right: -30, top: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', right: 50, bottom: -40,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div>
          <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.6, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Available Balance
          </p>
          {loading ? (
            <p style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.5px' }}>...</p>
          ) : (
            <p style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.5px' }}>
              {formatCurrency(walletData?.currentBalance ?? 0)}
            </p>
          )}
          <p style={{ fontSize: 12, marginTop: 8, opacity: 0.5 }}>
            {walletData ? `Wallet ID: ${walletData._id}` : 'Loading...'}
          </p>
        </div>
        <Wallet size={52} style={{ opacity: 0.15, flexShrink: 0 }} />
      </div>

      {error && (
        <div style={{ padding: 16, background: '#fce8e6', color: '#d93025', borderRadius: 10, marginBottom: 24, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Transactions Section */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ebebeb', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>Transaction History</h2>
          {!loading && (
            <span style={{ fontSize: 12, color: '#717171', background: '#f7f7f9', padding: '4px 10px', borderRadius: 20 }}>
              {transactions.length} of {totalPages * LIMIT > 0 ? (page - 1) * LIMIT + transactions.length : 0}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ color: '#717171', fontSize: 14 }}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, gap: 12, padding: 40 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f7f7f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReceiptText size={26} color="#b0b0b0" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>No transactions yet</p>
            <p style={{ fontSize: 13, color: '#717171', textAlign: 'center', maxWidth: 300 }}>
              Your booking payments, refunds, and credits will appear here.
            </p>
          </div>
        ) : (
          <>
            {transactions.map((txn, idx) => {
              const isCredit = txn.transactionType === 'Credit';
              return (
                <div
                  key={txn._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: idx < transactions.length - 1 ? '1px solid #f5f5f5' : 'none',
                    transition: 'background 0.15s',
                    gap: 16,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: isCredit ? '#e6f4ea' : '#fce8e6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isCredit
                      ? <ArrowDownCircle size={22} color="#1e8e3e" />
                      : <ArrowUpCircle size={22} color="#d93025" />
                    }
                  </div>

                  {/* Description & Date */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 3 }}>
                      {txn.description || txn.transactionType}
                    </p>
                    <p style={{ fontSize: 12, color: '#a0a0a0' }}>{formatDate(txn.createdAt)}</p>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: 15, fontWeight: 700,
                      color: isCredit ? '#1e8e3e' : '#d93025',
                    }}>
                      {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <span style={{
                      display: 'inline-block', marginTop: 3, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: isCredit ? '#e6f4ea' : '#fce8e6',
                      color: isCredit ? '#1e8e3e' : '#d93025',
                    }}>
                      {txn.transactionType}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid #f0f0f0', gap: 16 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', border: '1px solid #ebebeb',
                    background: page === 1 ? '#f7f7f9' : '#fff',
                    color: page === 1 ? '#c0c0c0' : '#222',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#484848' }}>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', border: '1px solid #ebebeb',
                    background: page === totalPages ? '#f7f7f9' : '#fff',
                    color: page === totalPages ? '#c0c0c0' : '#222',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WalletPage;
