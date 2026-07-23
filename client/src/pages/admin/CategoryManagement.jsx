import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
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
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';

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
    <div className="grid gap-[26px]">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink">Category Management</h1>
          <p className="block text-muted text-[12px] mt-1">Manage event categories and subcategories.</p>
        </div>
        
        <button
          onClick={() => setCategoryModal({ isOpen: true, data: null })}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-4 rounded-[7px] text-[13px] font-extrabold text-white bg-admin-red hover:bg-admin-red-dark transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-[18px] justify-between">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
          />
          
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="relative">
              <select 
                value={status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="appearance-none bg-white border border-line rounded-lg px-3 py-2 pr-8 text-sm font-semibold text-ink hover:border-gray-300 focus:outline-none focus:border-admin-red cursor-pointer transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Published</option>
                <option value="inactive">Unpublished</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={sort} 
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="appearance-none bg-white border border-line rounded-lg px-3 py-2 pr-8 text-sm font-semibold text-ink hover:border-gray-300 focus:outline-none focus:border-admin-red cursor-pointer transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-red"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-panel p-12 text-center rounded-xl border border-line">
            <p className="text-muted text-sm font-medium">No categories found matching your criteria.</p>
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
          <div className="mt-8">
            <Pagination 
              currentPage={pagination.currentPage} 
              totalPages={pagination.totalPages} 
              totalItems={pagination.totalCategories} 
              itemsPerPage={pagination.limit} 
              onPageChange={(page) => setPagination(p => ({ ...p, currentPage: page }))} 
            />
          </div>
        )}
      </section>

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


