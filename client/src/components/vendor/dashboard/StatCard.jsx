import React from 'react';

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-[0_8px_30px_rgb(220,0,22,0.04)] hover:shadow-[0_8px_30px_rgb(220,0,22,0.08)] transition-all duration-300 hover:-translate-y-1">
      {/* Subtle decorative gradient orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
      
      <div className="relative flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>
      <div className="relative">
        <h3 className="font-label-md text-on-surface-variant mb-1">{title}</h3>
        <p className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
