import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookText, 
  Video, 
  GraduationCap, 
  BarChart2, 
  LogOut,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Notes', path: '/notes', icon: BookText },
    { name: 'Videos', path: '/videos', icon: Video },
    { name: 'Semesters', path: '/semesters', icon: GraduationCap },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="h-full bg-dark-card border-r border-dark-border flex flex-col z-20"
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-dark-border">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-glow">
                  NV
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  NoteVault
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-dark-border text-gray-400 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-3 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(124,58,237,0.1)]' 
                  : 'text-gray-400 hover:text-gray-100 hover:bg-dark-cardHover'}
              `}
            >
              <item.icon size={22} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-border">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={22} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <header className="h-20 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border flex items-center justify-between px-8 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Search notes, videos, or subjects..." 
                className="w-full bg-[#161622] border border-dark-border rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 ml-8">
            <button className="relative p-2 text-gray-400 hover:text-gray-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-200">{user?.name || 'User'}</p>
                <p className="text-xs text-primary">{user?.role === 'admin' ? 'Admin Panel' : 'Pro Member'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5">
                <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
