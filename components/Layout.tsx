
import React from 'react';
import { CollegeInfo, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collegeInfo: CollegeInfo;
  user: User;
  onSignOut: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, collegeInfo, user, onSignOut }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'ledger', label: 'Audit Ledger', icon: '📑' },
    { id: 'volunteers', label: 'Volunteers', icon: '👥' },
    { id: 'reports', label: 'Reports & Export', icon: '📁' },
    { id: 'certificates', label: 'Certificates', icon: '🎓' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-indigo-950 text-white flex flex-col shadow-2xl z-20 relative">
        {/* Glass background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 to-indigo-950/90 pointer-events-none"></div>
        
        <div className="p-10 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-5 mb-5">
            {collegeInfo.logo ? (
              <img src={collegeInfo.logo} className="w-14 h-14 rounded-2xl object-cover bg-white p-1.5 shadow-lg" alt="Logo" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 shadow-xl shadow-indigo-500/20 flex items-center justify-center font-black text-2xl">A</div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none text-white">AuditEasy</h1>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-1 block">NSS Finance Hub</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed line-clamp-2">
            {collegeInfo.name}
          </p>
        </div>
        
        <nav className="flex-1 mt-10 px-6 space-y-3 relative z-10">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 scale-[1.02]' 
                  : 'text-indigo-200/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`text-2xl transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              <span className="font-black text-sm tracking-tight uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white"></div>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-8 border-t border-white/5 relative z-10">
           <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-xl">
              <div className="flex items-center gap-4">
                 <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-indigo-400/50 p-0.5" alt="Avatar" />
                 <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black truncate text-white">{user.name}</p>
                    <p className="text-[9px] text-indigo-400 font-bold truncate uppercase tracking-widest">{user.role}</p>
                 </div>
                 <button 
                  onClick={onSignOut} 
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center text-xl"
                  title="Sign Out"
                 >
                    🚪
                 </button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-12 scroll-smooth">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></span>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">
                  Academic Year 2024-25 / Unit: {collegeInfo.unitCode}
               </p>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter capitalize flex items-center gap-4">
              {activeTab === 'dashboard' ? 'Audit Overview' : activeTab.replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end mr-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                   Verified Record <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </span>
             </div>
             <button className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-xl hover:shadow-lg transition-all active:scale-95 relative">
                🔔
                <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
