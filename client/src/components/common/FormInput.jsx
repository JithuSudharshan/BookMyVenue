import React from 'react';

/**
 * Reusable FormInput component wrapping inputs with standard styling and error handles.
 * Uses CSS classes from Profile.css scoped under .profile-theme-scope.
 * Compatible with react-hook-form using React.forwardRef.
 */
const FormInput = React.forwardRef(({
  label,
  id,
  type = 'text',
  error,
  placeholder,
  disabled,
  required = false,
  ...rest
}, ref) => {
  return (
    <div className="input-group">
      <label htmlFor={id} className="label-sm input-label">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        id={id}
        ref={ref}
        className={`form-input body-md ${error ? 'input-error-border' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
      {error && <span className="error-message body-sm">{error.message}</span>}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
