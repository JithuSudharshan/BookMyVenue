import React from 'react';
import { CheckCircle2, Clock, XCircle, CreditCard, CalendarCheck, Flag } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const getEventIcon = (status) => {
  const norm = status?.toLowerCase() || '';
  if (norm.includes('created') || norm === 'pending') return <Clock className="w-3.5 h-3.5 text-gray-400" />;
  if (norm.includes('payment') || norm.includes('paid')) return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
  if (norm === 'confirmed') return <CalendarCheck className="w-3.5 h-3.5 text-purple-500" />;
  if (norm === 'completed') return <Flag className="w-3.5 h-3.5 text-emerald-500" />;
  if (norm === 'cancelled' || norm.includes('refund')) return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
};

const DrawerTimeline = ({ booking }) => {
  if (!booking || !booking.timeline || booking.timeline.length === 0) return null;

  return (
    <section className="bg-white border border-gray-100/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-xl p-5 h-full">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
        Booking Lifecycle
      </h3>
      
      <div className="relative border-l-2 border-gray-100 ml-2 space-y-6">
        {booking.timeline.map((event, idx) => {
          const isLast = idx === booking.timeline.length - 1;
          const isActive = idx === booking.timeline.length - 1; // Highlight the latest event
          
          return (
            <div key={idx} className="relative pl-5">
              <div className={`absolute -left-[11px] top-[-2px] w-5 h-5 rounded-full flex items-center justify-center bg-white border-2 ${isActive ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                 {isActive ? <div className="w-1.5 h-1.5 rounded-full bg-primary" /> : <div className="w-1 h-1 rounded-full bg-gray-300" />}
              </div>
              
              <div className="flex flex-col gap-0.5 -mt-1">
                <div className="flex items-center gap-2">
                  {getEventIcon(event.status)}
                  <p className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'} capitalize`}>
                    {event.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 font-mono ml-5.5 pl-1.5 mt-0.5">
                  {formatDate(event.timestamp)}
                </p>
                {event.note && (
                  <p className="text-[11px] text-gray-500 italic mt-1.5 ml-5.5 pl-1.5 border-l border-gray-100">
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DrawerTimeline;
