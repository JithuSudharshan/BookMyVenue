import React from 'react';
import { Link } from 'react-router-dom';
import DetailItem from '../../common/DetailItem';

function VendorProfileView({ profile }) {
  const {
    businessName,
    email,
    phone,
    documents = [],
    wallet = { currentBalance: 0, transactions: [] },
    venues = []
  } = profile;

  const displayedVenues = venues.slice(0, 3);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="profile-view-container">
      <div className="profile-grid">
        <div className="profile-section-card">
          <h3 className="headline-sm section-title">Business Information</h3>
          <div className="details-stack">
            <DetailItem label="Registered Business Name" value={businessName} />
            <DetailItem label="Contact Phone" value={phone} />
            <DetailItem label="Business Email" value={email} />
            <DetailItem label="Office Address" value="102, Dynasty Business Park, Andheri Kurla Road, Mumbai, Maharashtra 400059" />
          </div>
        </div>

        <div className="profile-section-card">
          <h3 className="headline-sm section-title">Verification Documents</h3>
          <div className="details-stack" style={{ gap: '12px' }}>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className="document-item">
                  <div className="document-info">
                    <span className="document-name">{doc.name}</span>
                  </div>
                  <span className={`document-status ${doc.status === 'Verified' ? 'status-badge-verified' : 'status-badge-review'}`}>
                    {doc.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="body-sm text-muted">No documents uploaded.</p>
            )}
          </div>
        </div>
      </div>

      <div className="activity-grid">
        <div className="activity-section">
          <div className="section-header-row">
            <h3 className="headline-sm">My Wallet</h3>
            <span className="activity-count-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              Linked
            </span>
          </div>

          <div className="wallet-preview-box">
            <div className="wallet-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h14v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
              </svg>
            </div>
            <span className="wallet-balance-value">
              {formatCurrency(wallet.currentBalance)}
            </span>
          </div>

          <div className="wallet-transactions-box" style={{ marginTop: '4px' }}>
            <h4 className="label-sm" style={{ color: 'var(--secondary)', marginBottom: '8px', fontSize: '11px', letterSpacing: '0.05em' }}>Recent Transactions</h4>
            {wallet.transactions && wallet.transactions.length > 0 ? (
              <div className="transactions-list">
                {wallet.transactions.map((tx) => (
                  <div key={tx.id} className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-desc">{tx.description}</span>
                      <span className="transaction-date">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className={`transaction-amount ${tx.transactionType === 'Credit' ? 'transaction-credit' : 'transaction-debit'}`}>
                      {tx.transactionType === 'Credit' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-activity-card" style={{ padding: '16px' }}>
                <p className="body-sm text-muted">No recent transactions.</p>
              </div>
            )}
          </div>

          <Link to="/wallet" className="activity-more-link">
            Go to Wallet &rarr;
          </Link>
        </div>

        <div className="activity-section">
          <div className="section-header-row">
            <h3 className="headline-sm">My Venues</h3>
            <span className="activity-count-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {venues.length} Venues
            </span>
          </div>

          {venues.length > 0 ? (
            <div className="bookings-list">
              {displayedVenues.map((venue) => (
                <div key={venue.id} className="venue-preview-card">
                  <div className="venue-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="venue-meta-info">
                    <span className="venue-meta-name">{venue.name}</span>
                    <span className="venue-meta-loc">{venue.location}</span>
                  </div>
                  <span className="venue-meta-price">
                    {formatCurrency(venue.pricing)}/hr
                  </span>
                </div>
              ))}

              <Link to="/venues" className="activity-more-link">
                Manage Venues &rarr;
              </Link>
            </div>
          ) : (
            <div className="empty-activity-card">
              <p className="body-sm text-muted">No venues created yet.</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

export default VendorProfileView;
