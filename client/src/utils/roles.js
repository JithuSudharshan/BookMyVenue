export const ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
};

export const isValidRole = (role) => Object.values(ROLES).includes(role);
