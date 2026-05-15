import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, ShieldAlert, LogOut, Settings, Hospital, 
    BarChart3, User, Search, Bell, Activity, Menu, X, HeartPulse 
} from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const MainLayout = ({ role }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    full_name: localStorage.getItem('user_name') || 'User',
    email: localStorage.getItem('user_email') || '',
    role: role
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getMe();
        setUser(res.data);
        localStorage.setItem('user_name', res.data.full_name);
        if (res.data.email) localStorage.setItem('user_email', res.data.email);
      } catch (err) {
        console.warn("[AUTH SYNC] Sync failed, using local session fallback.");
        if (!localStorage.getItem('token')) {
            navigate('/login');
        }
      }
    };
    fetchUser();
  }, [navigate]);

  const getInitials = (name) => {
    if (!name || name === 'User') return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const menuItems = {
    patient: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
      { icon: ShieldAlert, label: 'New Emergency', path: '/patient/emergency' },
      { icon: HeartPulse, label: 'My Health', path: '/patient/health' },
    ],
    hospital: [
      { icon: LayoutDashboard, label: 'Overview', path: '/hospital/dashboard' },
      { icon: Hospital, label: 'Resources', path: '/hospital/resources' },
      { icon: ShieldAlert, label: 'Emergency Queue', path: '/hospital/queue' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Global View', path: '/admin/dashboard' },
      { icon: BarChart3, label: 'Deep Analytics', path: '/admin/analytics' },
      { icon: Settings, label: 'Systems Config', path: '/admin/settings' },
    ]
  };

  const currentMenu = menuItems[role] || [];
  const displayName = user.full_name || user.email || 'User';

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col hidden lg:flex border-r border-slate-800">
        <div className="p-8 text-2xl font-black flex items-center gap-3">
          <div className="bg-brand-primary p-2 rounded-2xl shadow-lg shadow-sky-500/20">
            <Activity size={28} className="text-white" />
          </div>
          <span className="tracking-tight">MediRoute<span className="text-brand-primary">AI</span></span>
        </div>
        
        <nav className="flex-1 px-6 py-4 flex flex-col gap-2">
          {currentMenu.map((item, i) => (
            <NavLink 
              key={i} 
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-brand-primary text-white shadow-xl shadow-sky-500/20 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
              `}
            >
              <item.icon size={22} className="transition-colors" />
              <span className="font-bold text-[15px]">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-black group"
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-4 bg-slate-100/50 px-5 py-3 rounded-2xl border border-slate-200/60 w-80 lg:w-96">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Search operations..." className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 px-2 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-brand-primary transition-colors">
                    {displayName}
                 </p>
                 <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">
                    {role === 'patient' ? 'Patient' : role === 'hospital' ? 'Hospital' : 'Admin'} Mode
                 </p>
               </div>
               <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white text-lg font-black shadow-lg border-2 border-white">
                 {getInitials(displayName)}
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <aside className="absolute left-0 top-0 bottom-0 w-80 bg-slate-900 p-8 shadow-2xl flex flex-col">
                <nav className="flex-1 flex flex-col gap-4">
                    {currentMenu.map((item, i) => (
                        <NavLink 
                            key={i} 
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) => `flex items-center gap-4 p-4 rounded-xl font-bold ${isActive ? 'bg-brand-primary text-white' : 'text-slate-400'}`}
                        >
                            <item.icon size={20} /> {item.label}
                        </NavLink>
                    ))}
                    <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-xl font-bold text-rose-400 mt-auto"><LogOut size={20} /> Logout</button>
                </nav>
            </aside>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
