import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { 
  getCategories, createCategory, updateCategory, toggleCategoryStatus,
  createSubcategory, updateSubcategory, toggleSubcategoryStatus
} from '../../api/admin/adminCategoryApi';
import CategoryCardAdmin from '../../components/admin/category/CategoryCardAdmin';
import CategoryFormModal from '../../components/admin/category/CategoryFormModal';
import SubcategoryFormModal from '../../components/admin/category/SubcategoryFormModal';
import ConfirmActionModal from '../../components/admin/category/ConfirmActionModal';

const CategoryManagement = () => {
  // Data state
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCategories: 0, limit: 6 });
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // for debouncing/manual search
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');

  // Modal states
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, data: null });
  const [subcategoryModal, setSubcategoryModal] = useState({ isOpen: false, data: null, parentId: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, title: '', message: '', actionText: '', isDestructive: true });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCategories({
        page: pagination.currentPage,
        limit: pagination.limit,
        search,
        status,
        sort
      });
      setCategories(result.categories || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, search, status, sort]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') setStatus(value);
    if (filterType === 'sort') setSort(value);
    setPagination(p => ({ ...p, currentPage: 1 })); // reset to first page on filter change
  };

  // --- Category Actions ---

  const handleSaveCategory = async (data) => {
    if (categoryModal.data) {
      await updateCategory(categoryModal.data._id, data);
    } else {
      await createCategory(data);
      setPagination(p => ({ ...p, currentPage: 1 })); // Reset to first page on create
    }
    fetchCategories();
  };

  const handleToggleCategoryStatus = (category) => {
    const isCurrentlyActive = category.isActive;
    setConfirmModal({
      isOpen: true,
      title: isCurrentlyActive ? 'Block Category' : 'Unblock Category',
      message: isCurrentlyActive 
        ? `Are you sure you want to block "${category.name}"? All subcategories under this category will automatically be blocked to maintain consistency.`
        : `Are you sure you want to unblock "${category.name}"? Subcategories will retain their previous status.`,
      actionText: isCurrentlyActive ? 'Block' : 'Unblock',
      isDestructive: isCurrentlyActive,
      action: async () => {
        await toggleCategoryStatus(category._id, !isCurrentlyActive);
        fetchCategories();
      }
    });
  };

  // --- Subcategory Actions ---

  const handleSaveSubcategory = async (data) => {
    if (subcategoryModal.data) {
      await updateSubcategory(subcategoryModal.data._id, data);
    } else {
      await createSubcategory(data);
    }
    fetchCategories();
  };

  const handleToggleSubcategoryStatus = (subcategory) => {
    const isCurrentlyActive = subcategory.isActive;
    setConfirmModal({
      isOpen: true,
      title: isCurrentlyActive ? 'Block Subcategory' : 'Unblock Subcategory',
      message: `Are you sure you want to ${isCurrentlyActive ? 'block' : 'unblock'} "${subcategory.name}"?`,
      actionText: isCurrentlyActive ? 'Block' : 'Unblock',
      isDestructive: isCurrentlyActive,
      action: async () => {
        await toggleSubcategoryStatus(subcategory._id, !isCurrentlyActive);
        fetchCategories();
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage event categories and subcategories</p>
        </div>
        <button
          onClick={() => setCategoryModal({ isOpen: true, data: null })}
          className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-red-700 transition-colors shadow-sm"
        >
          <FiPlus className="mr-2" /> Add Category
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories or subcategories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </form>
        
        <div className="flex gap-4">
          <select 
            value={status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          
          <select 
            value={sort} 
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No categories found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map(category => (
            <CategoryCardAdmin
              key={category._id}
              category={category}
              onEditCategory={(data) => setCategoryModal({ isOpen: true, data })}
              onToggleCategoryStatus={handleToggleCategoryStatus}
              onAddSubcategory={(parentId) => setSubcategoryModal({ isOpen: true, data: null, parentId })}
              onEditSubcategory={(data) => setSubcategoryModal({ isOpen: true, data, parentId: null })}
              onToggleSubcategoryStatus={handleToggleSubcategoryStatus}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white rounded-md text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            &lt;
          </button>
          
          {[...Array(pagination.totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setPagination(p => ({ ...p, currentPage: idx + 1 }))}
              className={`w-10 h-10 flex items-center justify-center rounded-md font-medium transition-colors ${
                pagination.currentPage === idx + 1 
                  ? 'bg-primary text-white border border-primary' 
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white rounded-md text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            &gt;
          </button>
        </div>
      )}

      {/* Modals */}
      <CategoryFormModal
        isOpen={categoryModal.isOpen}
        initialData={categoryModal.data}
        onClose={() => setCategoryModal({ isOpen: false, data: null })}
        onSubmit={handleSaveCategory}
      />
      
      <SubcategoryFormModal
        isOpen={subcategoryModal.isOpen}
        initialData={subcategoryModal.data}
        parentCategoryId={subcategoryModal.parentId}
        onClose={() => setSubcategoryModal({ isOpen: false, data: null, parentId: null })}
        onSubmit={handleSaveSubcategory}
      />

      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        actionText={confirmModal.actionText}
        isDestructive={confirmModal.isDestructive}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.action}
      />
    </div>
  );
};

export default CategoryManagement;
