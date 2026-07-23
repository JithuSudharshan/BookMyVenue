import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, EyeOff, Eye, Trash2 } from 'lucide-react';

const SubcategoryItem = ({ subcategory, parentIsActive, onEdit, onToggleStatus, onDelete }) => {
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
    <div className={`flex items-center justify-between p-3 mb-2 rounded-md border border-line ${!effectivelyActive ? 'bg-panel' : 'bg-surface hover:bg-panel'}`}>
      <span className={`text-[13px] font-bold ${!subcategory.isActive ? 'text-muted line-through' : 'text-ink'}`}>
        {subcategory.name}
        {!parentIsActive && subcategory.isActive && (
          <span className="ml-2 text-[10px] text-admin-amber font-normal italic">(hidden — parent unpublished)</span>
        )}
      </span>
      
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => parentIsActive && setShowMenu(!showMenu)}
          disabled={!parentIsActive}
          title={!parentIsActive ? 'Publish the parent category first' : ''}
          className={`p-1 rounded-md transition-colors
            ${parentIsActive
              ? 'hover:bg-line text-muted cursor-pointer'
              : 'text-[#d1c7c7] cursor-not-allowed'
            }`}
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-surface rounded-md shadow-admin py-1 z-dropdown border border-line">
            <button
              onClick={() => { setShowMenu(false); onEdit(subcategory); }}
              className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-panel flex items-center"
            >
              <Edit2 className="mr-2" size={14} /> Edit Subcategory
            </button>
            <button
              onClick={() => { 
                setShowMenu(false); 
                onToggleStatus(subcategory); 
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center ${subcategory.isActive ? 'text-admin-red hover:bg-admin-red-soft' : 'text-admin-green hover:bg-[#dcfce7]'}`}
            >
              {subcategory.isActive ? (
                <><EyeOff className="mr-2" size={14} /> Unpublish</>
              ) : (
                <><Eye className="mr-2" size={14} /> Publish</>
              )}
            </button>
            <hr className="my-1 border-line" />
            <button
              onClick={() => { setShowMenu(false); onDelete(subcategory); }}
              className="w-full text-left px-4 py-2 text-sm text-admin-red hover:bg-admin-red-soft flex items-center"
            >
              <Trash2 className="mr-2" size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryItem;

