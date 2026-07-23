import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, EyeOff, Eye, Plus } from 'lucide-react';
import SubcategoryItem from './SubcategoryItem';

const CategoryCardAdmin = ({ 
  category, 
  onEditCategory, 
  onToggleCategoryStatus,
  onAddSubcategory,
  onEditSubcategory,
  onToggleSubcategoryStatus,
  onDeleteSubcategory
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAllSubs, setShowAllSubs] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`bg-surface rounded-xl shadow-admin border border-line overflow-hidden flex flex-col transition-all ${!category.isActive ? 'opacity-60 grayscale-[20%]' : ''}`}>
      {!category.isActive && (
        <div className="bg-panel border-b border-line px-4 py-1.5 flex items-center gap-2">
          <EyeOff size={12} className="text-muted flex-shrink-0" />
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Unpublished — Hidden from users
          </span>
        </div>
      )}
      <div className="p-5 flex gap-4">
        {/* Category Image */}
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {category.image ? (
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-ink truncate">{category.name}</h3>
              <span className={`inline-block px-2 py-1 text-[10px] font-black rounded-md mt-1 uppercase ${category.isActive ? 'bg-[#dcfce7] text-admin-green' : 'bg-panel border border-line text-muted'}`}>
                {category.isActive ? 'PUBLISHED' : 'UNPUBLISHED'}
              </span>
            </div>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-md border border-line hover:bg-panel text-muted transition-colors"
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-surface rounded-md shadow-admin py-1 z-dropdown border border-line">
                  <button
                    onClick={() => { setShowMenu(false); onEditCategory(category); }}
                    className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-panel flex items-center"
                  >
                    <Edit2 className="mr-2" size={14} /> Edit Category
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onToggleCategoryStatus(category); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${category.isActive ? 'text-admin-red hover:bg-admin-red-soft' : 'text-admin-green hover:bg-[#dcfce7]'}`}
                  >
                    {category.isActive ? (
                      <><EyeOff className="mr-2" size={14} /> Unpublish</>
                    ) : (
                      <><Eye className="mr-2" size={14} /> Publish</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col">
        <div className="border-t border-line pt-4 mb-3">
          <h4 className="text-[11px] font-black uppercase text-[#7b6b6b] mb-3 tracking-wider">Subcategories ({category.subcategories?.length || 0})</h4>
          
          <div className="space-y-1 pr-1">
            {category.subcategories && category.subcategories.length > 0 ? (
              <>
                {(showAllSubs ? category.subcategories : category.subcategories.slice(0, 4)).map(sub => (
                  <SubcategoryItem 
                    key={sub._id} 
                    subcategory={sub} 
                    parentIsActive={category.isActive}
                    onEdit={onEditSubcategory}
                    onToggleStatus={onToggleSubcategoryStatus}
                    onDelete={onDeleteSubcategory}
                  />
                ))}
                {!showAllSubs && category.subcategories.length > 4 && (
                  <button
                    onClick={() => setShowAllSubs(true)}
                    className="text-xs font-semibold text-admin-red hover:text-admin-red-dark w-full text-center py-2 transition-colors"
                  >
                    Show {category.subcategories.length - 4} more ↓
                  </button>
                )}
                {showAllSubs && category.subcategories.length > 4 && (
                  <button
                    onClick={() => setShowAllSubs(false)}
                    className="text-xs font-semibold text-muted hover:text-ink w-full text-center py-2 transition-colors"
                  >
                    Show less ↑
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted italic text-center py-2">No subcategories yet</p>
            )}
          </div>
        </div>

        <div className="mt-auto pt-2">
          <button 
            onClick={() => category.isActive && onAddSubcategory(category._id)}
            disabled={!category.isActive}
            title={!category.isActive ? 'Publish the category first to add subcategories' : ''}
            className={`w-full py-2 flex items-center justify-center border border-dashed rounded-md text-sm font-medium transition-colors
              ${category.isActive
                ? 'border-admin-red text-admin-red hover:bg-admin-red-soft cursor-pointer'
                : 'border-line text-[#d1c7c7] cursor-not-allowed'
              }`}
          >
            <Plus className="mr-1" size={16} /> Add Subcategory
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCardAdmin;

