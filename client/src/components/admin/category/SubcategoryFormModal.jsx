import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            {initialData ? 'Edit Subcategory' : 'Add Subcategory'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-6" noValidate>
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {errors.submit}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subcategory Name *</label>
              <input
                type="text"
                value={name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'
                }`}
                placeholder="e.g., Banquet Hall"
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-red-700 disabled:opacity-70 transition-colors flex items-center shadow-sm"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryFormModal;
