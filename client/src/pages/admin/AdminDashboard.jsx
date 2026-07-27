import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Wallet,
  CalendarCheck,
  Users,
  Store,
  Building2,
  TrendingUp,
  Clock,
  AlertTriangle,
  FileText,
  Filter,
  Eye,
  RefreshCw,
  Sparkles,
  UserCheck,
  MapPin,
  RotateCcw,
  CheckCircle,
  BarChart,
  ArrowUpRight,
  XCircle,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import StatusBadge from '../../components/admin/StatusBadge';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { getDashboardStats } from '../../api/admin-api/adminApi';

// --- DASHBOARD SKELETON COMPONENT ---
function DashboardSkeleton() {
  return (
    <div className="grid gap-6 animate-pulse p-1">
      <div className="h-20 bg-white border border-line rounded-lg p-4 flex justify-between items-center">
        <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
        <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-white border border-line rounded-lg p-5 flex justify-between">
            <div className="w-2/3 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-white border border-line rounded-lg p-5"></div>
        <div className="h-80 bg-white border border-line rounded-lg p-5"></div>
      </div>
    </div>
  );
}

// Map label to API timeframe
const TIMEFRAME_MAP = {
  'All': 'all',
  'Today': 'today',
  'Last 7 Days': 'last_7_days',
  'This Month': 'this_month',
  'Last Month': 'last_month',
  'This Year': 'this_year',
};

// --- MAIN ADMIN DASHBOARD COMPONENT ---
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [activeTableTab, setActiveTableTab] = useState('bookings');
  const [toastMessage, setToastMessage] = useState(null);

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDashboardMetrics = async (timeframeLabel) => {
    setLoading(true);
    setError(null);
    try {
      const timeframeParam = TIMEFRAME_MAP[timeframeLabel] || 'all';
      const data = await getDashboardStats({ timeframe: timeframeParam });
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics(selectedDateFilter);
  }, [selectedDateFilter]);

  const handleRefresh = () => {
    fetchDashboardMetrics(selectedDateFilter);
    showNotification('Dashboard metrics refreshed successfully.');
  };

  if (loading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (error && !dashboardData) {
    return (
      <div className="p-8 text-center bg-white border border-line rounded-lg shadow-admin my-6">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink">Failed to Load Dashboard Data</h2>
        <p className="text-sm text-muted mt-1">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-admin-red text-white text-xs font-bold rounded-lg hover:bg-admin-red-dark transition-all inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const {
    header = {},
    kpis = {},
    charts = {},
    financialSummary = {},
    platformInsights = {},
    tables = {}
  } = dashboardData || {};

  return (
    <div className="grid gap-7 text-ink pb-10">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-lg shadow-xl animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SECTION 1: HEADER & QUICK ACTIONS */}
      <header className="bg-surface border border-line rounded-lg p-5 sm:p-6 shadow-admin">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="m-0 text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Welcome Back, Admin
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold text-admin-red bg-admin-red-soft rounded-full">
                Super Admin
              </span>
            </div>
            <p className="m-0 mt-1.5 text-xs sm:text-sm text-muted flex items-center gap-2">
              <Clock className="w-4 h-4 text-admin-red inline" />
              <span>{currentDateFormatted}</span>
              <span className="text-gray-300">•</span>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block"></span>
                System Live
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-lg border border-line text-muted hover:text-admin-red hover:bg-admin-red-soft transition-all"
              title="Refresh Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/admin/vendors?tab=review')}
              className="px-4 py-2.5 text-xs font-extrabold text-white bg-admin-red border border-admin-red rounded-lg hover:bg-admin-red-dark transition-all flex items-center gap-2 shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>Approve Vendors ({header.pendingVendors || 0})</span>
            </button>
            <button
              onClick={() => navigate('/admin/venues')}
              className="px-4 py-2.5 text-xs font-extrabold text-blue-900 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2 shadow-sm"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Approve Venues ({header.pendingVenues || 0})</span>
            </button>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="mt-5 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-muted mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Timeframe:
            </span>
            {['All', 'Today', 'Last 7 Days', 'This Month', 'Last Month', 'This Year'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedDateFilter(filter)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all border ${
                  selectedDateFilter === filter
                    ? 'bg-admin-red text-white border-admin-red shadow-sm'
                    : 'bg-white text-muted border-line hover:text-admin-red hover:bg-admin-red-soft'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted font-medium">
            Showing metrics for: <strong className="text-ink">{selectedDateFilter}</strong>
          </span>
        </div>
      </header>

      {/* SECTION 2: OVERVIEW KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div
          onClick={() => navigate('/admin/wallet')}
          className="bg-surface border border-line rounded-lg p-4 shadow-admin hover:border-admin-red transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <strong className="text-xl sm:text-2xl font-bold text-ink block">
              {formatCurrency(kpis.totalRevenue?.value || 0)}
            </strong>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className={`font-bold flex items-center ${(kpis.totalRevenue?.growth || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {(kpis.totalRevenue?.growth || 0) >= 0 ? `+${kpis.totalRevenue?.growth}%` : `${kpis.totalRevenue?.growth}%`}
              </span>
              <span className="text-muted text-[11px]">vs prev period</span>
            </div>
          </div>
        </div>

        {/* Platform Commission (20%) */}
        <div
          onClick={() => navigate('/admin/wallet')}
          className="bg-surface border border-line rounded-lg p-4 shadow-admin hover:border-admin-red transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Commission (20%)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <strong className="text-xl sm:text-2xl font-bold text-ink block">
              {formatCurrency(kpis.platformCommission?.value || 0)}
            </strong>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className={`font-bold flex items-center ${(kpis.platformCommission?.growth || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {(kpis.platformCommission?.growth || 0) >= 0 ? `+${kpis.platformCommission?.growth}%` : `${kpis.platformCommission?.growth}%`}
              </span>
              <span className="text-muted text-[11px]">vs prev period</span>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div
          onClick={() => navigate('/admin/bookings')}
          className="bg-surface border border-line rounded-lg p-4 shadow-admin hover:border-admin-red transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <strong className="text-xl sm:text-2xl font-bold text-ink block">
              {formatNumber(kpis.totalBookings?.value || 0)}
            </strong>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className={`font-bold flex items-center ${(kpis.totalBookings?.growth || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {(kpis.totalBookings?.growth || 0) >= 0 ? `+${kpis.totalBookings?.growth}%` : `${kpis.totalBookings?.growth}%`}
              </span>
              <span className="text-muted text-[11px]">vs prev period</span>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-surface border border-line rounded-lg p-4 shadow-admin hover:border-admin-red transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 grid place-items-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <strong className="text-xl sm:text-2xl font-bold text-ink block">
              {formatNumber(kpis.totalUsers?.value || 0)}
            </strong>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className={`font-bold flex items-center ${(kpis.totalUsers?.growth || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {(kpis.totalUsers?.growth || 0) >= 0 ? `+${kpis.totalUsers?.growth}%` : `${kpis.totalUsers?.growth}%`}
              </span>
              <span className="text-muted text-[11px]">vs prev period</span>
            </div>
          </div>
        </div>

        {/* Active Vendors */}
        <div
          onClick={() => navigate('/admin/vendors')}
          className="bg-surface border border-line rounded-lg p-4 shadow-admin hover:border-admin-red transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Active Vendors</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 grid place-items-center group-hover:scale-110 transition-transform">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <strong className="text-xl sm:text-2xl font-bold text-ink block">
              {formatNumber(kpis.activeVendors?.value || 0)}
            </strong>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className={`font-bold flex items-center ${(kpis.activeVendors?.growth || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {(kpis.activeVendors?.growth || 0) >= 0 ? `+${kpis.activeVendors?.growth}%` : `${kpis.activeVendors?.growth}%`}
              </span>
              <span className="text-muted text-[11px]">vs prev period</span>
            </div>
          </div>
        </div>

        {/* Total Venues */}
        <div
          onClick={() => navigate('/admin/venues')}
          className="bg-surface border border-line rounded-lg p-4 shadow-admin hover:border-admin-red transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Total Venues</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-admin-red grid place-items-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <strong className="text-xl sm:text-2xl font-bold text-ink block">
              {formatNumber(kpis.totalVenues?.value || 0)}
            </strong>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className={`font-bold flex items-center ${(kpis.totalVenues?.growth || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {(kpis.totalVenues?.growth || 0) >= 0 ? `+${kpis.totalVenues?.growth}%` : `${kpis.totalVenues?.growth}%`}
              </span>
              <span className="text-muted text-[11px]">vs prev period</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ANALYTICS & CHARTS GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Commission vs Vendor Earnings Stacked Bar */}
        <div className="bg-surface border border-line rounded-lg p-5 shadow-admin">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
            <div>
              <h2 className="m-0 text-base font-bold text-ink flex items-center gap-2">
                <BarChart className="w-4 h-4 text-blue-600" /> Revenue Split Breakdown
              </h2>
              <p className="m-0 text-xs text-muted">Platform Commission vs Vendor Payouts</p>
            </div>
            <span className="text-xs font-bold text-muted">20% Take Rate</span>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={charts.revenueTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(v) => `₹${v / 100000}L`} />
                <Tooltip formatter={(value) => [formatCurrency(value)]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="vendorEarnings" name="Vendor Earnings (80%)" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="commission" name="Platform Commission (20%)" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Trend */}
        <div className="bg-surface border border-line rounded-lg p-5 shadow-admin">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
            <div>
              <h2 className="m-0 text-base font-bold text-ink flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-600" /> Monthly Booking Volume
              </h2>
              <p className="m-0 text-xs text-muted">Total vs Completed Bookings</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Historical Volume
            </span>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.bookingTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="total" name="Total Bookings" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution Donut */}
        <div className="bg-surface border border-line rounded-lg p-5 shadow-admin flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
            <div>
              <h2 className="m-0 text-base font-bold text-ink flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" /> Booking Status Distribution
              </h2>
              <p className="m-0 text-xs text-muted">Current Period Breakdown</p>
            </div>
            <span className="text-xs font-bold text-muted">
              Status Breakdown
            </span>
          </div>
          <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.bookingStatusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(charts.bookingStatusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} Bookings`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Financial Summary */}
        <div className="bg-surface border border-line rounded-lg p-5 shadow-admin flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h2 className="m-0 text-base font-bold text-ink flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" /> Platform Financial Summary
              </h2>
              <p className="m-0 text-xs text-muted">YTD platform revenue & settlements</p>
            </div>
            <button
              onClick={() => navigate('/admin/wallet')}
              className="text-xs font-bold text-admin-red hover:underline flex items-center gap-1"
            >
              <span>Wallet Panel</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="bg-panel border border-line rounded-lg p-3">
              <span className="text-[11px] font-bold text-muted uppercase">Gross Revenue (YTD)</span>
              <strong className="text-base font-extrabold text-ink block mt-0.5">
                {formatCurrency(financialSummary.grossRevenueYTD || 0)}
              </strong>
              <small className="text-[11px] text-emerald-600 font-semibold">
                {financialSummary.yoyGrowth >= 0 ? `+${financialSummary.yoyGrowth}% YoY` : `${financialSummary.yoyGrowth}% YoY`}
              </small>
            </div>

            <div className="bg-panel border border-line rounded-lg p-3">
              <span className="text-[11px] font-bold text-muted uppercase">Platform Commission</span>
              <strong className="text-base font-extrabold text-ink block mt-0.5">
                {formatCurrency(financialSummary.platformCommissionYTD || 0)}
              </strong>
              <small className="text-[11px] text-blue-600 font-semibold">20% Standard Fee</small>
            </div>

            <div className="bg-panel border border-line rounded-lg p-3">
              <span className="text-[11px] font-bold text-muted uppercase">Vendor Payouts</span>
              <strong className="text-base font-extrabold text-ink block mt-0.5">
                {formatCurrency(financialSummary.vendorPayoutsYTD || 0)}
              </strong>
              <small className="text-[11px] text-muted font-semibold">80% Settled</small>
            </div>

            <div className="bg-panel border border-line rounded-lg p-3">
              <span className="text-[11px] font-bold text-muted uppercase">Refund Total</span>
              <strong className="text-base font-extrabold text-ink block mt-0.5">
                {formatCurrency(financialSummary.refundTotalYTD || 0)}
              </strong>
              <small className="text-[11px] text-rose-600 font-semibold">
                {financialSummary.refundRate || 0}% Refund Rate
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE DATA TABLES */}
      <section className="bg-surface border border-line rounded-lg shadow-admin p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line mb-5">
          <div>
            <h2 className="m-0 text-lg font-bold text-ink flex items-center gap-2">
              <FileText className="w-5 h-5 text-admin-red" /> Platform Data Registers
            </h2>
            <p className="m-0 text-xs text-muted">Inspect recent bookings, vendors, clients, and top venues</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'bookings', label: 'Recent Bookings' },
              { id: 'vendors', label: 'Recent Vendors' },
              { id: 'users', label: 'Recent Users' },
              { id: 'topVenues', label: 'Top Venues' },
              { id: 'topVendors', label: 'Top Vendors' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTableTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTableTab === tab.id
                    ? 'bg-admin-red text-white shadow-sm'
                    : 'bg-panel text-muted hover:bg-admin-red-soft hover:text-admin-red border border-line'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Recent Bookings */}
        {activeTableTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-[11px] font-black uppercase text-muted tracking-wider">
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Venue Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(tables.recentBookings || []).map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => navigate('/admin/bookings')}
                        className="border-b border-line hover:bg-panel transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-bold text-ink">{row.id}</td>
                        <td className="p-3">
                          <div className="font-semibold text-ink">{row.customer}</div>
                          <div className="text-[11px] text-muted">{row.email}</div>
                        </td>
                        <td className="p-3 font-medium text-ink">{row.venue}</td>
                        <td className="p-3 text-muted text-xs">{row.date}</td>
                        <td className="p-3 font-bold text-ink">{formatCurrency(row.amount)}</td>
                        <td className="p-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate('/admin/bookings'); }}
                            className="p-1.5 rounded-md border border-line hover:bg-admin-red-soft hover:text-admin-red text-muted transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {(tables.recentBookings || []).length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted text-xs">
                        No recent bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}

        {/* Tab 2: Recent Vendors */}
        {activeTableTab === 'vendors' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-[11px] font-black uppercase text-muted tracking-wider">
                  <th className="p-3">Vendor ID</th>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(tables.recentVendors || []).map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => navigate('/admin/vendors')}
                    className="border-b border-line hover:bg-panel transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-bold text-ink">{v.id}</td>
                    <td className="p-3 font-semibold text-ink">{v.vendor}</td>
                    <td className="p-3 text-muted font-medium">{v.email}</td>
                    <td className="p-3 text-muted text-xs">{v.joined}</td>
                    <td className="p-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/admin/vendors'); }}
                        className="px-2.5 py-1 text-xs font-bold text-admin-red bg-admin-red-soft rounded hover:bg-admin-red hover:text-white transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {(tables.recentVendors || []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted text-xs">
                      No recent vendors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Recent Users */}
        {activeTableTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-[11px] font-black uppercase text-muted tracking-wider">
                  <th className="p-3">User ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3">Account Status</th>
                </tr>
              </thead>
              <tbody>
                {(tables.recentUsers || []).map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate('/admin/users')}
                    className="border-b border-line hover:bg-panel transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-bold text-ink">{u.id}</td>
                    <td className="p-3 font-semibold text-ink">{u.name}</td>
                    <td className="p-3 text-muted">{u.email}</td>
                    <td className="p-3 text-muted text-xs">{u.joined}</td>
                    <td className="p-3">
                      <StatusBadge status={u.status} />
                    </td>
                  </tr>
                ))}
                {(tables.recentUsers || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted text-xs">
                      No recent users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Top Performing Venues */}
        {activeTableTab === 'topVenues' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-[11px] font-black uppercase text-muted tracking-wider">
                  <th className="p-3">Venue Name</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Total Bookings</th>
                  <th className="p-3">Generated Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(tables.topVenues || []).map((tv) => (
                  <tr
                    key={tv.id}
                    onClick={() => navigate('/admin/venues')}
                    className="border-b border-line hover:bg-panel transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-bold text-ink flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-admin-red" /> {tv.name}
                    </td>
                    <td className="p-3 text-muted">{tv.city}</td>
                    <td className="p-3 font-semibold text-ink">{tv.bookings} Bookings</td>
                    <td className="p-3 font-bold text-emerald-600">{formatCurrency(tv.revenue)}</td>
                  </tr>
                ))}
                {(tables.topVenues || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted text-xs">
                      No top venues found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Top Vendors */}
        {activeTableTab === 'topVendors' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-[11px] font-black uppercase text-muted tracking-wider">
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Venues Owned</th>
                  <th className="p-3">Total Bookings</th>
                  <th className="p-3">Gross Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(tables.topVendors || []).map((tvn) => (
                  <tr
                    key={tvn.id}
                    onClick={() => navigate('/admin/vendors')}
                    className="border-b border-line hover:bg-panel transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-bold text-ink flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-600" /> {tvn.name}
                    </td>
                    <td className="p-3 font-medium text-muted">{tvn.venues} Venues</td>
                    <td className="p-3 font-semibold text-ink">{tvn.bookings} Bookings</td>
                    <td className="p-3 font-bold text-emerald-600">{formatCurrency(tvn.revenue)}</td>
                  </tr>
                ))}
                {(tables.topVendors || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted text-xs">
                      No top vendors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-line flex justify-between items-center text-xs text-muted">
          <span>Showing top records for {activeTableTab} register.</span>
          <button
            onClick={() => {
              const targetRoutes = {
                bookings: '/admin/bookings',
                vendors: '/admin/vendors',
                users: '/admin/users',
                topVenues: '/admin/venues',
                topVendors: '/admin/vendors',
              };
              const targetLabels = {
                bookings: 'Open Full Bookings Register →',
                vendors: 'Open Full Vendors Register →',
                users: 'Open Full Users Register →',
                topVenues: 'Open Full Venues Register →',
                topVendors: 'Open Full Vendors Register →',
              };
              navigate(targetRoutes[activeTableTab] || '/admin/bookings');
            }}
            className="font-bold text-admin-red hover:underline"
          >
            {{
              bookings: 'Open Full Bookings Register →',
              vendors: 'Open Full Vendors Register →',
              users: 'Open Full Users Register →',
              topVenues: 'Open Full Venues Register →',
              topVendors: 'Open Full Vendors Register →',
            }[activeTableTab] || 'Open Full Register →'}
          </button>
        </div>
      </section>
    </div>
  );
}
