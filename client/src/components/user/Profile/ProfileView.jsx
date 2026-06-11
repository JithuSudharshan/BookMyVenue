import React from 'react';
import { Link } from 'react-router-dom';
import DetailItem from '../../common/DetailItem';

function ProfileView({ profile, onEditClick }) {
  const {
    firstName,
    lastName,
    email,
    phone,
    addressStreet,
    addressCity,
    addressDistrict,
    addressState,
    addressZipCode,
    wishlist = [],
    bookings = []
  } = profile;

  const displayedBookings = bookings.slice(0, 2);
  const displayedWishlist = wishlist.slice(0, 2);

  return (
    <div className="profile-view-container">
      <div className="profile-grid">
        <div className="profile-section-card">
          <h3 className="headline-sm section-title">Personal Information</h3>
          <div className="details-stack">
            <DetailItem label="First Name" value={firstName} />
            <DetailItem label="Last Name" value={lastName} />
            <DetailItem label="Phone Number" value={phone} />
            <DetailItem label="Account Email" value={email} />
          </div>
        </div>

        <div className="profile-section-card">
          <h3 className="headline-sm section-title">Primary Address</h3>
          <div className="details-stack">
            <DetailItem label="Street Address" value={addressStreet} />
            <DetailItem label="City" value={addressCity} />
            <DetailItem label="District" value={addressDistrict} />
            <DetailItem label="State" value={addressState} />
            <DetailItem label="PIN Code" value={addressZipCode} />
          </div>
        </div>
      </div>

      <div className="activity-grid">
        <div className="activity-section">
          <div className="section-header-row">
            <h3 className="headline-sm">My Bookings</h3>
            <span className="activity-count-badge">{bookings.length} Bookings</span>
          </div>
          
          {bookings.length > 0 ? (
            <div className="bookings-list">
              {displayedBookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-info">
                    <span className="body-md booking-venue-name">{booking.venueName}</span>
                    <span className="body-sm booking-date">Date: {booking.date}</span>
                  </div>
                  <span className={`status-chip status-${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
              
              <Link to="/bookings" className="activity-more-link">
                See All Bookings &rarr;
              </Link>
            </div>
          ) : (
            <div className="empty-activity-card">
              <p className="body-sm text-muted">No upcoming bookings scheduled.</p>
            </div>
          )}
        </div>

        <div className="activity-section">
          <div className="section-header-row">
            <h3 className="headline-sm">My Wishlist</h3>
            <span className="activity-count-badge">{wishlist.length} Saved</span>
          </div>
          
          {wishlist.length > 0 ? (
            <div className="wishlist-list">
              {displayedWishlist.map((item) => (
                <div key={item.id} className="wishlist-item-card">
                  <div className="wishlist-item-info">
                    <span className="body-md wishlist-item-name">{item.name}</span>
                    <span className="body-sm wishlist-item-loc">{item.location}</span>
                  </div>
                  <button className="wishlist-action-btn" aria-label="Remove item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="var(--primary)" stroke="var(--primary)" />
                    </svg>
                  </button>
                </div>
              ))}

              <Link to="/wishlist" className="activity-more-link">
                See All Wishlist &rarr;
              </Link>
            </div>
          ) : (
            <div className="empty-activity-card">
              <p className="body-sm text-muted">No venues added to your wishlist yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="action-row">
        <button className="cta-button edit-trigger" onClick={onEditClick}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default ProfileView;
