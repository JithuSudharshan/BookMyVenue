import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const SubcategoryFormModal = ({ isOpen, onClose, onSubmit, initialData, parentCategoryId }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
      } else {
        setName('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Subcategory name is required");
      return;
    }
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      setError("Subcategory name must be between 3 and 50 characters");
      return;
    }
    if (!/^[a-zA-Z0-9\s-]+$/.test(trimmedName)) {
      setError("Subcategory name can only contain letters, numbers, spaces, and hyphens");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = initialData ? { name } : { name, categoryId: parentCategoryId };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            {initialData ? 'Edit Subcategory' : 'Add Subcategory'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g., Banquet Hall"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubcategoryFormModal;
