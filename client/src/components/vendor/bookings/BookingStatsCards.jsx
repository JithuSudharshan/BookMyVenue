import React from 'react';
import { CalendarDays, CalendarClock, CheckCircle2, XCircle, IndianRupee } from 'lucide-react';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN').format(n || 0);

const statCards = [
  {
    key: 'upcoming',
    label: 'Upcoming',
    icon: CalendarDays,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    key: 'todayBookings',
    label: "Today's Bookings",
    icon: CalendarClock,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-400',
  },
  {
    key: 'todayRevenue',
    label: "Today's Revenue",
    icon: IndianRupee,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    isCurrency: true,
  },
];

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100" />
      <div className="h-3 w-24 bg-gray-100 rounded" />
    </div>
    <div className="h-7 w-16 bg-gray-100 rounded" />
  </div>
);

const BookingStatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => <SkeletonCard key={s.key} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map(({ key, label, icon: Icon, iconBg, iconColor, isCurrency }) => (
        <div
          key={key}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className={`p-2 rounded-xl ${iconBg}`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <span className="text-xs font-medium text-gray-500 leading-tight">{label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            {isCurrency ? `₹${formatCurrency(stats?.[key])}` : (stats?.[key] ?? 0)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BookingStatsCards;
