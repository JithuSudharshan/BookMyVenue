import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiEdit2, FiEyeOff, FiEye, FiPlus } from 'react-icons/fi';
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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all ${!category.isActive ? 'opacity-60 grayscale-[20%]' : ''}`}>
      {!category.isActive && (
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5 flex items-center gap-2">
          <FiEyeOff size={12} className="text-gray-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
              <h3 className="text-lg font-bold text-gray-900 truncate">{category.name}</h3>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md mt-1 ${category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {category.isActive ? 'PUBLISHED' : 'UNPUBLISHED'}
              </span>
            </div>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
              >
                <FiMoreVertical size={16} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-dropdown border border-gray-200">
                  <button
                    onClick={() => { setShowMenu(false); onEditCategory(category); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FiEdit2 className="mr-2" size={14} /> Edit Category
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onToggleCategoryStatus(category); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${category.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                  >
                    {category.isActive ? (
                      <><FiEyeOff className="mr-2" size={14} /> Unpublish</>
                    ) : (
                      <><FiEye className="mr-2" size={14} /> Publish</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col">
        <div className="border-t border-gray-100 pt-4 mb-3">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Subcategories ({category.subcategories?.length || 0})</h4>
          
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
                    className="text-xs font-semibold text-primary hover:text-red-700 w-full text-center py-2 transition-colors"
                  >
                    Show {category.subcategories.length - 4} more ↓
                  </button>
                )}
                {showAllSubs && category.subcategories.length > 4 && (
                  <button
                    onClick={() => setShowAllSubs(false)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 w-full text-center py-2 transition-colors"
                  >
                    Show less ↑
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-2">No subcategories yet</p>
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
                ? 'border-primary text-primary hover:bg-red-50 cursor-pointer'
                : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
          >
            <FiPlus className="mr-1" size={16} /> Add Subcategory
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCardAdmin;

