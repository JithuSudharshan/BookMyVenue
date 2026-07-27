import React from 'react';

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>
      <div>
        <h3 className="font-label-md text-on-surface-variant mb-1">{title}</h3>
        <p className="font-headline-lg font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
