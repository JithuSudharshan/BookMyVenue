import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, CheckSquare } from 'lucide-react';

const ActionCenterWidget = ({ items = [] }) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'slots': return <CheckSquare className="w-5 h-5 text-amber-500" />;
      case 'draft': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-on-surface-variant" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'rejected': return 'bg-red-50 border-red-100';
      case 'slots': return 'bg-amber-50 border-amber-100';
      case 'draft': return 'bg-blue-50 border-blue-100';
      default: return 'bg-surface-variant/30 border-outline-variant/30';
    }
  };

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/50 shadow-sm h-full flex flex-col">
      <h3 className="font-headline-sm text-on-surface mb-6">Requires Attention</h3>
      
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-1">
        {items.length > 0 ? items.map((item, index) => (
          <div key={`${item.id}-${index}`} className={`flex items-start gap-4 p-4 rounded-xl border hover:ring-2 hover:ring-primary/40 transition-all ${getBg(item.type)}`}>
            <div className="shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-label-lg text-on-surface truncate">{item.title}</h4>
              <p className="font-body-sm text-on-surface-variant line-clamp-2 mt-0.5 mb-2.5">{item.message}</p>
              <button 
                onClick={() => navigate(item.actionLink)}
                className="text-xs font-semibold px-3 py-1.5 bg-white ring-1 ring-outline-variant/50 rounded-lg hover:bg-surface-variant/30 hover:text-primary transition-colors shadow-sm"
              >
                {item.actionText}
              </button>
            </div>
          </div>
        )) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/50">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
              <CheckSquare className="w-6 h-6 text-green-500" />
            </div>
            <p className="font-label-lg text-on-surface mb-1">All caught up!</p>
            <p className="text-sm text-on-surface-variant">You have no pending action items.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionCenterWidget;
