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
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Platform Overview</h1>
          <p>Real-time metrics and system health for BookMyVenue.</p>
        </div>
      </div>

      <section className="metric-grid">
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

      <section className="dashboard-panels">
        <article className="chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue Growth</h2>
              <p>Last 6 Months</p>
            </div>
            <button className="chip-button" type="button">
              Monthly
            </button>
          </div>
          {/* TODO: Replace static bars with booking/revenue analytics API integration. */}
          <div className="bar-chart" aria-label="Revenue growth placeholder chart">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
              <div className="bar-column" key={month}>
                <div className={index === 5 ? 'bar active' : 'bar'} style={{ height: `${38 + index * 8}%` }} />
                <span>{month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="approval-panel">
          <div className="approval-count">
            <div>
              <h2>Under Review</h2>
              <p>{formatNumber(stats.pendingVerifications)} vendor applications are under review.</p>
            </div>
            <strong>{formatNumber(stats.pendingVerifications)}</strong>
          </div>
          {stats.recentPendingVendors && stats.recentPendingVendors.length > 0 ? (
            stats.recentPendingVendors.map((vendor) => (
              <div className="approval-item" key={vendor._id}>
                <span>{vendor.fullName} (Verification)</span>
                <TrendingUp size={15} />
              </div>
            ))
          ) : (
            <div className="approval-item">
              <span>No applications under review</span>
            </div>
          )}
          <button 
            className="chip-button" 
            style={{ width: '100%', marginTop: '1rem' }}
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
