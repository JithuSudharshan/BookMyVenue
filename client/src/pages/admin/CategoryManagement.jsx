import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'sonner';
import { 
  getCategories, createCategory, updateCategory, toggleCategoryStatus,
  createSubcategory, updateSubcategory, toggleSubcategoryStatus,
  deleteSubcategory
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
        search: debouncedSearch,
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
  }, [pagination.currentPage, pagination.limit, debouncedSearch, status, sort]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(p => ({ ...p, currentPage: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') setStatus(value);
    if (filterType === 'sort') setSort(value);
    setPagination(p => ({ ...p, currentPage: 1 })); // reset to first page on filter change
  };

  // --- Category Actions ---

  const handleSaveCategory = async (data) => {
    try {
      if (categoryModal.data) {
        await updateCategory(categoryModal.data._id, data);
        toast.success("Category updated successfully");
      } else {
        await createCategory(data);
        toast.success("Category created successfully");
        setPagination(p => ({ ...p, currentPage: 1 })); // Reset to first page on create
      }
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const handleToggleCategoryStatus = (category) => {
    const isCurrentlyActive = category.isActive;
    setConfirmModal({
      isOpen: true,
      title: isCurrentlyActive ? 'Unpublish Category' : 'Publish Category',
      message: isCurrentlyActive 
        ? `Are you sure you want to unpublish "${category.name}"? It will be hidden from users. Subcategories will keep their individual published status.`
        : `Are you sure you want to publish "${category.name}"? It will become visible to users.`,
      actionText: isCurrentlyActive ? 'Unpublish' : 'Publish',
      isDestructive: isCurrentlyActive,
      action: async () => {
        try {
          await toggleCategoryStatus(category._id, !isCurrentlyActive);
          toast.success(`Category ${isCurrentlyActive ? 'unpublished' : 'published'} successfully`);
          fetchCategories();
        } catch (error) {
          toast.error("Failed to update category status");
        }
      }
    });
  };

  // --- Subcategory Actions ---

  const handleSaveSubcategory = async (data) => {
    try {
      if (subcategoryModal.data) {
        await updateSubcategory(subcategoryModal.data._id, data);
        toast.success("Subcategory updated successfully");
      } else {
        await createSubcategory(data);
        toast.success("Subcategory created successfully");
      }
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save subcategory");
    }
  };

  const handleToggleSubcategoryStatus = (subcategory) => {
    const isCurrentlyActive = subcategory.isActive;
    setConfirmModal({
      isOpen: true,
      title: isCurrentlyActive ? 'Unpublish Subcategory' : 'Publish Subcategory',
      message: `Are you sure you want to ${isCurrentlyActive ? 'unpublish' : 'publish'} "${subcategory.name}"?`,
      actionText: isCurrentlyActive ? 'Unpublish' : 'Publish',
      isDestructive: isCurrentlyActive,
      action: async () => {
        try {
          await toggleSubcategoryStatus(subcategory._id, !isCurrentlyActive);
          toast.success(`Subcategory ${isCurrentlyActive ? 'unpublished' : 'published'} successfully`);
          fetchCategories();
        } catch (error) {
          toast.error("Failed to update subcategory status");
        }
      }
    });
  };

  const handleDeleteSubcategory = (subcategory) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Subcategory',
      message: `Are you sure you want to permanently delete "${subcategory.name}"? This cannot be undone. Venues linked to this subcategory will lose their subcategory assignment.`,
      actionText: 'Delete',
      isDestructive: true,
      action: async () => {
        try {
          await deleteSubcategory(subcategory._id);
          toast.success(`"${subcategory.name}" deleted successfully`);
          fetchCategories();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete subcategory");
        }
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Category Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage event categories and subcategories</p>
        </div>
        
        {/* Actions & Filters */}
        <div className="flex flex-col items-end gap-3">
          <button
            onClick={() => setCategoryModal({ isOpen: true, data: null })}
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm"
          >
            <FiPlus className="mr-2" /> Add Category
          </button>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-64 focus-within:border-primary transition-colors">
            <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder-gray-400"
            />
          </div>
          
          <div className="relative">
            <select 
              value={status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-gray-600 hover:border-gray-300 focus:outline-none focus:border-primary shadow-sm cursor-pointer transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Published</option>
              <option value="inactive">Unpublished</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
          
          <div className="relative">
            <select 
              value={sort} 
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-gray-600 hover:border-gray-300 focus:outline-none focus:border-primary shadow-sm cursor-pointer transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
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
              onDeleteSubcategory={handleDeleteSubcategory}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))}
              disabled={pagination.currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(p => ({ ...p, currentPage: page }))}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors shadow-sm ${pagination.currentPage === page
                    ? 'bg-primary text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(pagination.totalPages, p.currentPage + 1) }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
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
