import React from 'react';
import '../../user/profile/Profile.css';

const FormField = React.forwardRef(({ label, id, required, error, type = "text", ...rest }, ref) => {
  return (
    <div className="pf-input-group">
      <label htmlFor={id} className="pf-label">
        {label}{required && <span className="pf-required"> *</span>}
      </label>
      <input ref={ref} id={id} type={type} className={`pf-input${error ? ' error' : ''}`} {...rest} />
      {error && <p className="pf-error-msg">{error.message}</p>}
    </div>
  );
});

export default FormField;
