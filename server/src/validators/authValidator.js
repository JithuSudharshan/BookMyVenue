export const validateSignupData = (data) => {
  const errors = [];
  let { firstName, lastName, email, phone, password } = data;

  // Formatting & Sanitization
  firstName = firstName ? firstName.trim() : '';
  lastName = lastName ? lastName.trim() : '';
  email = email ? email.trim().toLowerCase() : '';
  phone = phone ? String(phone).replace(/[\s-]/g, '') : '';

  // 1. First Name
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!firstName) {
    errors.push('First name is required');
  } else if (firstName.length < 2 || firstName.length > 50) {
    errors.push('First name must be between 2 and 50 characters');
  } else if (!nameRegex.test(firstName)) {
    errors.push('First name can only contain alphabets, spaces, apostrophes, and hyphens');
  }

  // 2. Last Name (Optional)
  if (lastName) {
    if (lastName.length > 50) {
      errors.push('Last name must be less than 50 characters');
    } else if (!nameRegex.test(lastName)) {
      errors.push('Last name can only contain alphabets, spaces, apostrophes, and hyphens');
    }
  }

  // 3. Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    errors.push('Email is required');
  } else if (email.includes(' ')) {
    errors.push('Email cannot contain spaces');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  // 4. Phone
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!/^\d+$/.test(phone)) {
    errors.push('Phone number must contain only digits');
  } else if (!phoneRegex.test(phone)) {
    errors.push('Invalid Indian mobile number format. Must be 10 digits starting with 6, 7, 8, or 9.');
  }

  // 5. Password
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8 || password.length > 128) {
      errors.push('Password must be between 8 and 128 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check if password contains personal info
    if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      errors.push('Password cannot contain your email username');
    }
    if (firstName && password.toLowerCase().includes(firstName.toLowerCase())) {
      errors.push('Password cannot contain your first name');
    }
    if (lastName && password.toLowerCase().includes(lastName.toLowerCase())) {
      errors.push('Password cannot contain your last name');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: { firstName, lastName, email, phone, password }
  };
};

export const validateVendorSignupData = (data) => {
  const errors = [];
  let { firstName, lastName, email, phone, password } = data;

  // Formatting & Sanitization
  firstName = firstName ? firstName.trim() : '';
  lastName = lastName ? lastName.trim() : '';
  email = email ? email.trim().toLowerCase() : '';
  phone = phone ? String(phone).replace(/[\s-]/g, '') : '';

  // 1. First Name
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!firstName) {
    errors.push('First name is required');
  } else if (firstName.length < 2 || firstName.length > 50) {
    errors.push('First name must be between 2 and 50 characters');
  } else if (!nameRegex.test(firstName)) {
    errors.push('First name can only contain alphabets, spaces, apostrophes, and hyphens');
  }

  // 2. Last Name (Optional)
  if (lastName) {
    if (lastName.length > 50) {
      errors.push('Last name must be less than 50 characters');
    } else if (!nameRegex.test(lastName)) {
      errors.push('Last name can only contain alphabets, spaces, apostrophes, and hyphens');
    }
  }

  // 3. Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    errors.push('Email is required');
  } else if (email.includes(' ')) {
    errors.push('Email cannot contain spaces');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  // 4. Phone
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!/^\d+$/.test(phone)) {
    errors.push('Phone number must contain only digits');
  } else if (!phoneRegex.test(phone)) {
    errors.push('Invalid Indian mobile number format. Must be 10 digits starting with 6, 7, 8, or 9.');
  }

  // 5. Password
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8 || password.length > 128) {
      errors.push('Password must be between 8 and 128 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check if password contains personal info
    if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      errors.push('Password cannot contain your email username');
    }
    if (firstName && password.toLowerCase().includes(firstName.toLowerCase())) {
      errors.push('Password cannot contain your first name');
    }
    if (lastName && password.toLowerCase().includes(lastName.toLowerCase())) {
      errors.push('Password cannot contain your last name');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: { firstName, lastName, email, phone, password }
  };
};

