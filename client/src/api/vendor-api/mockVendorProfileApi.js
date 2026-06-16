const VENDOR_STORAGE_KEY = 'bmv_vendor_profile';

const DEFAULT_VENDOR_PROFILE = {
  businessName: 'Grand Palazzo Catering & Events',
  email: 'contact@grandpalazzo.com',
  phone: '+91 98765 43211',
  profileImage: '', // Business logo placeholder initially
  verificationStatus: 'Verified',
  documents: [
    { id: 'd1', name: 'Business Registration Certificate', status: 'Verified' },
    { id: 'd2', name: 'Public Liability Insurance Policy', status: 'Verified' },
    { id: 'd3', name: 'Food Safety & Handling License', status: 'Under Review' }
  ],
  wallet: {
    id: 'w_303',
    ownerType: 'Vendor',
    currentBalance: 85400.00,
    transactions: [
      {
        id: 'wt_901',
        walletId: 'w_303',
        transactionType: 'Credit',
        amount: 45000.00,
        description: 'Advance Booking payment for Palazzo Grand Banquet Hall',
        referenceId: 'b_701',
        createdAt: '2026-06-08T10:30:00.000Z'
      },
      {
        id: 'wt_902',
        walletId: 'w_303',
        transactionType: 'Debit',
        amount: 4500.00,
        description: 'Platform service commission fee',
        referenceId: 'ref_802',
        createdAt: '2026-06-08T11:00:00.000Z'
      },
      {
        id: 'wt_903',
        walletId: 'w_303',
        transactionType: 'Credit',
        amount: 28000.00,
        description: 'Booking payment for Grand Garden Terrace',
        referenceId: 'b_702',
        createdAt: '2026-06-09T15:45:00.000Z'
      }
    ]
  },
  venues: [
    { id: 'ven_501', name: 'Palazzo Grand Banquet Hall', location: 'MG Road, Sector 4, Gurugram', pricing: 15000, venueStatus: 'Active', approvalStatus: 'Approved' },
    { id: 'ven_502', name: 'Grand Garden Terrace', location: 'Indiranagar, Bengaluru', pricing: 9500, venueStatus: 'Active', approvalStatus: 'Approved' },
    { id: 'ven_503', name: 'Lakeside Club House', location: 'Vashi, Navi Mumbai', pricing: 12000, venueStatus: 'Inactive', approvalStatus: 'Pending' }
  ],
  createdAt: '2026-06-09T11:00:00.000Z',
  updatedAt: '2026-06-10T08:00:00.000Z'
};

const initializeVendorStorage = () => {
  const existing = localStorage.getItem(VENDOR_STORAGE_KEY);
  if (!existing || JSON.parse(existing).wallet.currentBalance === 3850 || !JSON.parse(existing).wallet.transactions) {
    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(DEFAULT_VENDOR_PROFILE));
  }
};

/**
 * Fetch Vendor Profile
 * @returns {Promise<Object>}
 */
export const getVendorProfile = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      initializeVendorStorage();
      const profile = JSON.parse(localStorage.getItem(VENDOR_STORAGE_KEY));
      resolve({ success: true, data: profile });
    }, 400);
  });
};



/**
 * Upload Vendor Avatar/Logo
 * @param {File} file 
 * @returns {Promise<Object>}
 */
export const uploadVendorAvatar = (file) => {
  return new Promise((resolve, reject) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return reject(new Error('Only PNG, JPG, JPEG, and WEBP formats are supported.'));
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      return reject(new Error('Image file size must be less than 5MB.'));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        initializeVendorStorage();
        const profile = JSON.parse(localStorage.getItem(VENDOR_STORAGE_KEY));
        profile.profileImage = reader.result; // Base64
        profile.updatedAt = new Date().toISOString();

        localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(profile));
        resolve({ success: true, profileImage: reader.result });
      }, 600);
    };
    reader.onerror = () => {
      reject(new Error('Error reading image file.'));
    };
    reader.readAsDataURL(file);
  });
};
