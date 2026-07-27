import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface ring-1 ring-outline-variant rounded-xl p-4 shadow-lg min-w-[150px]">
        <p className="font-label-md text-on-surface-variant mb-2">{label}</p>
        <p className="font-headline-sm text-primary">
          ₹{payload[0].value.toLocaleString()}
        </p>
        <p className="font-body-sm text-on-surface-variant mt-1">
          {payload[1]?.value || 0} Bookings
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ data, timeRange, setTimeRange }) => {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/50 shadow-sm h-full flex flex-col min-h-[350px]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h3 className="font-headline-sm text-on-surface">Revenue & Bookings</h3>
          <p className="text-sm text-on-surface-variant">Performance overview over time</p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-surface-variant/30 text-sm border-none rounded-xl px-4 py-2.5 text-on-surface focus:ring-2 focus:ring-primary outline-none cursor-pointer hover:bg-surface-variant/50 transition-colors"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
      
      <div className="flex-1 w-full min-h-[250px] mt-4">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(val) => {
                  const date = new Date(val);
                  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
                }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(val) => `₹${val}`}
                dx={-10}
              />
              <YAxis yAxisId="right" orientation="right" hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#4F46E5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="bookings" 
                stroke="transparent" 
                fill="transparent" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant text-sm">
            <div className="w-16 h-16 bg-surface-variant/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-on-surface-variant/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p>No revenue data available for this period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
