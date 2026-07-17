import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiEdit2, FiLock, FiUnlock, FiPlus, FiCalendar } from 'react-icons/fi';
import SubcategoryItem from './SubcategoryItem';

const CategoryCardAdmin = ({ 
  category, 
  onEditCategory, 
  onToggleCategoryStatus,
  onAddSubcategory,
  onEditSubcategory,
  onToggleSubcategoryStatus
}) => {
  const [showMenu, setShowMenu] = useState(false);
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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${!category.isActive ? 'opacity-80' : ''}`}>
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
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md mt-1 ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {category.isActive ? 'ACTIVE' : 'BLOCKED'}
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
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
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
                      <><FiLock className="mr-2" size={14} /> Block Category</>
                    ) : (
                      <><FiUnlock className="mr-2" size={14} /> Unblock Category</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{category.description || 'No description provided.'}</p>
          
          <div className="flex items-center text-xs text-gray-500 mt-3">
            <FiCalendar className="mr-1.5" size={12} />
            <span>Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col">
        <div className="border-t border-gray-100 pt-4 mb-3">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Subcategories ({category.subcategories?.length || 0})</h4>
          
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {category.subcategories && category.subcategories.length > 0 ? (
              category.subcategories.map(sub => (
                <SubcategoryItem 
                  key={sub._id} 
                  subcategory={sub} 
                  parentIsActive={category.isActive}
                  onEdit={onEditSubcategory}
                  onToggleStatus={onToggleSubcategoryStatus}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-2">No subcategories yet</p>
            )}
          </div>
        </div>

        <div className="mt-auto pt-2">
          <button 
            onClick={() => onAddSubcategory(category._id)}
            className="w-full py-2 flex items-center justify-center border border-dashed border-primary text-primary hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
          >
            <FiPlus className="mr-1" size={16} /> Add Subcategory
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCardAdmin;
