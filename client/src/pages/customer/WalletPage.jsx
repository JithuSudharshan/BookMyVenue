import React from 'react';
import { Wallet } from 'lucide-react';

function WalletPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
          Wallet
        </h1>
        <p style={{ color: '#717171', marginTop: 6, fontSize: 15 }}>
          Manage your credits, payment history, and refunds.
        </p>
      </div>

      {/* Balance card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ff385c 0%, #e0334e 100%)',
          borderRadius: 20,
          padding: '32px 36px',
          marginBottom: 24,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(255, 56, 92, 0.25)',
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, opacity: 0.8, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Available Balance
          </p>
          <p style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.5px' }}>₹ 0.00</p>
        </div>
        <Wallet size={48} style={{ opacity: 0.3 }} />
      </div>

      {/* Empty transactions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 260,
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #ebebeb',
          gap: 12,
          padding: 40,
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>No transactions yet</p>
        <p style={{ fontSize: 13, color: '#717171', textAlign: 'center', maxWidth: 300 }}>
          Your booking payments, refunds, and credits will appear here.
        </p>
      </div>
    </div>
  );
}

export default WalletPage;
