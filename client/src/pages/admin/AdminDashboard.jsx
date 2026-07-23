import { Building2, CalendarCheck, IndianRupee, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/admin/MetricCard';
import StateBlock from '../../components/admin/StateBlock';
import { getDashboardStats } from '../../api/admin-api/adminApi';
import { formatNumber } from '../../utils/formatters';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats(await getDashboardStats());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <StateBlock title="Loading dashboard" message="Fetching the latest admin metrics." />;
  }

  if (error) {
    return <StateBlock title="Dashboard unavailable" message={error} />;
  }

  return (
    <div className="grid gap-[26px]">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink">Platform Overview</h1>
          <p className="block text-muted text-[12px] mt-1">Real-time metrics and system health for BookMyVenue.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-4 gap-5">
        <MetricCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          detail="+12% this month"
          icon={Users}
          tone="blue"
        />
        <MetricCard
          title="Total Vendors"
          value={formatNumber(stats.totalVendors)}
          detail="+5% this month"
          icon={Building2}
          tone="green"
        />
        {/* Total Venues now uses dynamic Phase 2 stub from API */}
        <MetricCard 
          title="Total Venues" 
          value={stats.totalVenues !== undefined ? formatNumber(stats.totalVenues) : "0"} 
          detail="Under Review" 
          icon={CalendarCheck} 
          tone="violet" 
        />
        {/* TODO: Replace with revenue API integration in a future phase. */}
        <MetricCard title="Total Revenue (MTD)" value="$142.5k" detail="+24%" icon={IndianRupee} tone="red" />
      </section>

      <section className="grid grid-cols-1 min-[1100px]:grid-cols-[2fr_0.85fr] gap-[22px]">
        <article className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
          <div className="flex items-center justify-between gap-3.5">
            <div>
              <h2 className="m-0 text-xl font-bold text-ink">Revenue Growth</h2>
              <p className="block text-muted text-[12px] mt-1">Last 6 Months</p>
            </div>
            <button className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all" type="button">
              Monthly
            </button>
          </div>
          {/* TODO: Replace static bars with booking/revenue analytics API integration. */}
          <div className="grid grid-cols-6 items-end h-[240px] mt-[18px] border-b border-line" aria-label="Revenue growth placeholder chart">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
              <div className="grid items-end h-full text-muted text-[12px] text-center" key={month}>
                <div 
                  className={`w-full min-h-[35px] rounded-t-[4px] ${index === 5 ? 'bg-admin-red' : 'bg-[#df9098]'}`} 
                  style={{ height: `${38 + index * 8}%` }} 
                />
                <span className="mt-2 block">{month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="bg-surface border border-line rounded-lg shadow-admin p-[22px] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3.5 pb-4 border-b border-line">
            <div>
              <h2 className="m-0 text-xl font-bold text-ink">Under Review</h2>
              <p className="block text-muted text-[12px] mt-1">{formatNumber(stats.pendingVerifications)} vendor applications are under review.</p>
            </div>
            <strong className="grid place-items-center min-w-[60px] min-h-[52px] text-admin-red bg-[#ffe0df] rounded-full font-bold text-lg">{formatNumber(stats.pendingVerifications)}</strong>
          </div>
          <div className="flex-1 mt-4 space-y-3">
            {stats.recentPendingVendors && stats.recentPendingVendors.length > 0 ? (
              stats.recentPendingVendors.map((vendor) => (
                <div className="flex items-center justify-between p-3.5 border border-line rounded-[7px] bg-white text-ink text-sm font-medium" key={vendor._id}>
                  <span>{vendor.fullName} (Verification)</span>
                  <TrendingUp size={15} className="text-muted" />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between p-3.5 border border-line rounded-[7px] bg-white text-ink text-sm font-medium">
                <span>No applications under review</span>
              </div>
            )}
          </div>
          <button 
            className="min-h-[36px] w-full px-3.5 mt-4 rounded-[7px] text-[13px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all"
            onClick={() => navigate('/admin/vendor-approvals')}
          >
            View All Approvals
          </button>
        </article>
      </section>
    </div>
  );
}

export default AdminDashboard;
