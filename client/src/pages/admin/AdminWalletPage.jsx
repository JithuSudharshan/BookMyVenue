import React, { useEffect, useState } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Calendar, CheckCircle2, ReceiptText } from 'lucide-react';
import { getAdminWallet } from '../../api/admin-api/adminApi';
import StateBlock from '../../components/admin/StateBlock';
import Pagination from '../../components/admin/Pagination';
import { formatDate, formatNumber } from '../../utils/formatters';

const LIMIT = 10;

function AdminWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState('All');

  const loadWallet = async (currentPage, currentFilter) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminWallet({ page: currentPage, limit: LIMIT, filter: currentFilter });
      if (res) {
        setWallet(res.wallet);
        setTransactions(res.transactions || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.total || 0);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet(page, filter);
  }, [page, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const formatCurrency = (amt) => `₹${formatNumber(amt)}`;

  if (loading && !wallet) {
    return <StateBlock title="Loading wallet" message="Fetching admin wallet details." />;
  }

  if (error && !wallet) {
    return <StateBlock title="Unable to load wallet" message={error} />;
  }

  return (
    <div className="grid gap-[26px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Finance</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Admin Wallet</h1>
          <p className="block text-muted text-[12px] mt-1">View your balance and system transactions securely.</p>
        </div>
      </div>

      {/* Balance Overview Card */}
      <div className="p-6 bg-surface border border-line rounded-lg shadow-admin flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold text-muted tracking-wider">Available Balance</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mt-1">
            {formatCurrency(wallet?.currentBalance ?? 0)}
          </h2>
        </div>
        <div className="w-14 h-14 rounded-full bg-admin-red-soft flex items-center justify-center text-admin-red shrink-0">
          <Wallet size={28} />
        </div>
      </div>

      {/* Transactions Section */}
      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-line mb-6">
          <div className="flex items-center gap-2">
            {['All', 'Credit', 'Debit'].map((f) => (
              <button
                key={f}
                type="button"
                className={`min-h-[34px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                  filter === f
                    ? 'bg-admin-red text-white border-admin-red'
                    : 'bg-white text-[#6b5555] border-line hover:bg-admin-red-soft hover:text-admin-red'
                }`}
                onClick={() => handleFilterChange(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted font-extrabold">
            Total Transactions: {totalCount}
          </span>
        </div>

        {/* Transactions Table / List */}
        {loading ? (
          <StateBlock title="Loading transactions" message="Please wait..." />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ReceiptText size={44} className="text-muted mb-2" />
            <p className="text-sm font-extrabold text-ink">No transactions found</p>
            <p className="text-xs text-muted mt-1">Transactions will appear here when activity occurs.</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {transactions.map((txn) => {
              const isCredit = txn.transactionType === 'Credit';
              const Icon = isCredit ? ArrowDownCircle : ArrowUpCircle;

              return (
                <div key={txn._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="m-0 text-sm font-extrabold text-ink">
                        {txn.description || txn.transactionType}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(txn.createdAt)}
                        </span>
                        {txn.referenceId && (
                          <span className="flex items-center gap-1 font-mono">
                            <CheckCircle2 size={12} /> Ref: {txn.referenceId.slice(-8).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className={`text-base font-extrabold ${isCredit ? 'text-emerald-600' : 'text-ink'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded mt-1 ${
                        isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {txn.transactionType}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-line">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminWalletPage;
