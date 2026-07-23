import React, { useState, useEffect } from 'react';
import BaseModal from '../../ui/BaseModal';

const SubcategoryFormModal = ({ isOpen, onClose, onSubmit, initialData, parentCategoryId }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
      } else {
        setName('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateName = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "Subcategory name is required";
    if (trimmed.length < 3 || trimmed.length > 50) return "Must be between 3 and 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) return "Only letters and spaces are allowed";
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setName(value);
    setErrors(prev => ({ ...prev, name: validateName(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nameError = validateName(name);
    
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const payload = initialData ? { name } : { name, categoryId: parentCategoryId };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || err.message || "Failed to save subcategory" });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 border border-line rounded-md text-sm font-bold text-muted hover:bg-panel transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-admin-red text-white rounded-md text-sm font-bold hover:bg-admin-red-dark disabled:opacity-70 transition-colors flex items-center shadow-sm"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Subcategory' : 'Add Subcategory'}
      footer={footer}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="pt-2 pb-2" noValidate>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
            {errors.submit}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Subcategory Name *</label>
            <input
              type="text"
              value={name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-admin-red-soft transition-all text-sm text-ink ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-line focus:border-admin-red'
              }`}
              placeholder="e.g., Banquet Hall"
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default SubcategoryFormModal;

