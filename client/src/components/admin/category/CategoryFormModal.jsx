import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          image: null
        });
        setImagePreview(initialData.image || '');
      } else {
        setFormData({ name: '', image: null });
        setImagePreview('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validateName = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "Category name is required";
    if (trimmed.length < 3 || trimmed.length > 50) return "Must be between 3 and 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) return "Only letters and spaces are allowed";
    return "";
  };

  const validateImage = (file, isEdit) => {
    if (!file && !isEdit) return "Category image is required";
    if (file instanceof File) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) return "Only JPG, PNG, and WEBP allowed";
      if (file.size > 5 * 1024 * 1024) return "Image must be less than 5MB";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateName(value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: validateImage(file, !!initialData) }));
    } else {
      if (!formData.image && !initialData) {
        setErrors(prev => ({ ...prev, image: "Category image is required" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nameError = validateName(formData.name);
    const imageError = validateImage(formData.image, !!initialData);
    
    if (nameError || imageError) {
      setErrors({ name: nameError, image: imageError });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || err.message || "Failed to save category" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-[#00000040] backdrop-blur-[2px] p-4">
      <div className="bg-surface rounded-xl shadow-admin w-full max-w-md flex flex-col max-h-[90vh] border border-line">
        <div className="px-6 py-4 border-b border-line flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-ink">
            {initialData ? 'Edit Category' : 'Create Category'}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
            <X size={20} />
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
              <label className="block text-sm font-semibold text-ink mb-1">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-admin-red-soft transition-all text-sm ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-line focus:border-admin-red text-ink'
                }`}
                placeholder="e.g., Wedding Halls"
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Category Image *</label>
              
              {imagePreview && (
                <div className="mb-3 relative group w-fit">
                  <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded-lg border border-line shadow-sm" />
                </div>
              )}
              
              <input
                type="file"
                name="image"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="w-full text-sm text-muted
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-admin-red-soft file:text-admin-red
                  hover:file:bg-[#fecaca] transition-colors cursor-pointer"
              />
              {errors.image ? (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.image}</p>
              ) : (
                <p className="mt-1.5 text-xs text-muted">Select an image file (JPG, PNG, WebP) up to 5MB.</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-line rounded-md text-sm font-bold text-muted hover:bg-panel transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-admin-red text-white rounded-md text-sm font-bold hover:bg-admin-red-dark disabled:opacity-70 transition-colors flex items-center shadow-sm"
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


