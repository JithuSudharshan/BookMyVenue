import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';

const SubcategoryItem = ({ subcategory, parentIsActive, onEdit, onToggleStatus }) => {
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

  const effectivelyActive = parentIsActive && subcategory.isActive;

  return (
    <div className={`flex items-center justify-between p-3 mb-2 rounded-md border border-gray-100 ${!effectivelyActive ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}>
      <span className={`text-sm font-medium ${!effectivelyActive ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
        {subcategory.name}
      </span>
      
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
        >
          <FiMoreVertical size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
            <button
              onClick={() => { setShowMenu(false); onEdit(subcategory); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FiEdit2 className="mr-2" size={14} /> Edit Subcategory
            </button>
            <button
              onClick={() => { 
                setShowMenu(false); 
                // Business Rule: Can't unblock if parent is blocked
                if (!parentIsActive && !subcategory.isActive) {
                  alert("Cannot unblock subcategory while parent category is blocked.");
                  return;
                }
                onToggleStatus(subcategory); 
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center ${subcategory.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
            >
              {subcategory.isActive ? (
                <><FiLock className="mr-2" size={14} /> Block Subcategory</>
              ) : (
                <><FiUnlock className="mr-2" size={14} /> Unblock Subcategory</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryItem;
