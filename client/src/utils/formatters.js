export const formatDate = (value) => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatNumber = (value) =>
  new Intl.NumberFormat('en').format(Number(value || 0));

export const getInitials = (value = '') => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'BM';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

export const vendorEmail = (vendor) => vendor?.userId?.email || 'Not available';

export const vendorUserId = (vendor) =>
  typeof vendor?.userId === 'object' ? vendor.userId?._id : vendor?.userId;
