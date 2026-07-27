import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApi } from '../../api/vendor-api/vendorApi';
import { toast } from 'sonner';
import { Wallet, Clock, Activity, Building2, Plus, CalendarCheck } from 'lucide-react';
import StatCard from '../../components/vendor/dashboard/StatCard';
import RevenueChart from '../../components/vendor/dashboard/RevenueChart';

import ActionCenterWidget from '../../components/vendor/dashboard/ActionCenterWidget';
import TopPerformersWidget from '../../components/vendor/dashboard/TopPerformersWidget';
import TransactionHistory from '../../components/vendor/dashboard/TransactionHistory';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [data, setData] = useState({
    walletStats: { balance: 0, pendingPayouts: 0 },
    activeVenuesCount: 0,
    actionItems: [],
    chartData: [],
    topPerformers: [],
    walletHistory: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await vendorApi.getDashboardAnalytics(timeRange);
        setData(res);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  if (loading && !data.chartData.length) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-outline-variant/30"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      <main className="w-full mt-4 px-4 md:px-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Overview</h1>
            <p className="font-body-lg text-on-surface-variant">Here's what's happening with your venues today.</p>
          </div>
          <button
            onClick={() => navigate('/vendor/venues/add')}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add Venue
          </button>
        </div>
        
        {/* Row 1: KPI Stats (Bento Grid 4 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Total Balance" 
            value={`₹${data.walletStats.balance.toLocaleString()}`}
            icon={Wallet} 
          />
          <StatCard 
            title="Pending Payouts" 
            value={`₹${data.walletStats.pendingPayouts.toLocaleString()}`}
            icon={Clock} 
          />
          <StatCard 
            title="Active Venues" 
            value={data.activeVenuesCount}
            icon={Building2} 
          />
          <StatCard 
            title="Total Bookings (Period)" 
            value={data.chartData.reduce((acc, curr) => acc + curr.bookings, 0)}
            icon={CalendarCheck} 
          />
        </div>

        {/* Row 2: Chart and Action Center (Bento Grid 12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Main Chart Area - spans 8 columns on large screens */}
          <div className="lg:col-span-8">
            <RevenueChart 
              data={data.chartData} 
              timeRange={timeRange} 
              setTimeRange={setTimeRange} 
            />
          </div>
          
          {/* Action Center Sidebar - spans 4 columns on large screens */}
          <div className="lg:col-span-4 h-full">
            <ActionCenterWidget items={data.actionItems} />
          </div>
        </div>

        {/* Row 3: Insights and History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 h-full">
            <TopPerformersWidget venues={data.topPerformers} />
          </div>
          <div className="lg:col-span-6 h-full">
            <TransactionHistory transactions={data.walletHistory} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default VendorDashboard;
