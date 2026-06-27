import React from 'react';
import { CalendarDays } from 'lucide-react';

function BookingsPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
          My Bookings
        </h1>
        <p style={{ color: '#717171', marginTop: 6, fontSize: 15 }}>
          View and manage all your venue bookings in one place.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 360,
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #ebebeb',
          gap: 16,
          padding: 48,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#fff1f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CalendarDays size={32} color="#ff385c" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>No bookings yet</h2>
        <p style={{ fontSize: 14, color: '#717171', textAlign: 'center', maxWidth: 320 }}>
          You haven't booked any venues yet. Explore venues and make your first booking!
        </p>
        <a
          href="/home"
          style={{
            marginTop: 8,
            padding: '12px 28px',
            background: '#ff385c',
            color: '#fff',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => (e.target.style.background = '#e0334e')}
          onMouseLeave={(e) => (e.target.style.background = '#ff385c')}
        >
          Explore Venues
        </a>
      </div>
    </div>
  );
}

export default BookingsPage;
