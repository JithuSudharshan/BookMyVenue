import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          image: null
        });
        setImagePreview(initialData.image || '');
      } else {
        setFormData({ name: '', description: '', image: null });
        setImagePreview('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const name = formData.name.trim();
    if (!name) {
      setError("Category name is required");
      return;
    }
    if (name.length < 3 || name.length > 50) {
      setError("Category name must be between 3 and 50 characters");
      return;
    }
    if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
      setError("Category name can only contain letters, numbers, spaces, and hyphens");
      return;
    }

    if (formData.description && formData.description.length > 500) {
      setError("Description cannot exceed 500 characters");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            {initialData ? 'Edit Category' : 'Create Category'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="e.g., Wedding Halls"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Brief description of this category..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
              
              {imagePreview && (
                <div className="mb-3 relative group w-fit">
                  <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded-lg border border-gray-200 shadow-sm" />
                </div>
              )}
              
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-primary
                  hover:file:bg-red-100 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">Select an image file (JPG, PNG, WebP) up to 5MB.</p>
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
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-70 flex items-center"
            >
              {loading ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
