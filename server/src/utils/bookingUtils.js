export const generateBookingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${randomStr}`;
};
