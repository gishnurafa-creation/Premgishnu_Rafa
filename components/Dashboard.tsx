
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { DashboardStats, Transaction, TransactionType } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  recentTransactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, recentTransactions }) => {
  const pieData = [
    { name: 'Regular', value: stats.regularSpent },
    { name: 'Special Camp', value: stats.campSpent },
  ];

  const barData = useMemo(() => {
    // Basic aggregation by month for the current academic year
    const months = ['June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'March'];
    return months.map(m => ({
      name: m,
      Income: Math.floor(Math.random() * 5000) + (m === 'Sept' ? 20000 : 0), // Mock trend for visualization
      Expense: Math.floor(Math.random() * 4000)
    }));
  }, []);

  const COLORS = ['#6366f1', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Audit Balance', value: stats.balance, icon: '🏦', color: 'text-indigo-600', trend: 'Bank + Cash' },
          { label: 'Total Receipts', value: stats.totalIncome, icon: '📈', color: 'text-emerald-600', trend: '+12% vs LY' },
          { label: 'Total Payments', value: stats.totalExpense, icon: '📉', color: 'text-rose-600', trend: '78% Budget Used' },
          { label: 'Verified Status', value: '85%', icon: '🛡️', color: 'text-amber-600', trend: 'Audit Ready' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-black tracking-tight ${stat.color}`}>
               {typeof stat.value === 'number' ? `₹${stat.value.toLocaleString()}` : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Financial Utilization Trend</h3>
            <select className="text-[10px] font-black uppercase bg-slate-50 px-3 py-1 rounded-lg border-none outline-none">
              <option>AY 2024-25</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Expense" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenditure Split */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Fund Allocation</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-[10px] font-black text-slate-400 uppercase">Total Spent</span>
               <span className="text-xl font-black text-slate-800">₹{stats.totalExpense.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
             {pieData.map((d, i) => (
               <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{d.name}</span>
                 </div>
                 <span className="text-xs font-black text-slate-800">₹{d.value.toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
