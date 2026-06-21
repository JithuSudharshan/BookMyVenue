import React from 'react';

const InputField = ({ 
  id, 
  label, 
  type = 'text', 
  placeholder, 
  icon: Icon, 
  error, 
  success, 
  register, 
  registerOptions, 
  onBlur, 
  onChange,
  rightElement
}) => {
  
  // Register the input, but we might need to override onBlur/onChange
  const { ref, name, onBlur: rhfOnBlur, onChange: rhfOnChange } = register ? register(id, registerOptions) : {};

  const handleBlur = (e) => {
    if (rhfOnBlur) rhfOnBlur(e);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    if (rhfOnChange) rhfOnChange(e);
    if (onChange) onChange(e);
  };

  const borderClass = error 
    ? 'border-error focus:ring-error focus:border-error' 
    : success 
      ? 'border-success focus:ring-success focus:border-success' 
      : 'border-outline-variant focus:ring-primary focus:border-primary';

  return (
    <div className="space-y-base w-full">
      {label && (
        <label className="block font-label-sm text-label-sm text-on-surface" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input 
          id={id}
          name={name}
          ref={ref}
          type={type}
          placeholder={placeholder}
          onBlur={handleBlur}
          onChange={handleChange}
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} ${rightElement ? 'pr-10' : 'pr-3'} py-3 border ${borderClass} rounded-lg bg-surface font-body-md text-body-md text-on-surface placeholder:text-secondary-fixed-dim focus:outline-none focus:ring-2 transition-shadow`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-error font-label-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default InputField;
