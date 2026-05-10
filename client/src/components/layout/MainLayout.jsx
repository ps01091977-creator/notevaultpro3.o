import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Home,
  GraduationCap,
  Sparkles,
  Info,
  Phone,
  LogOut,
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Inbox
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import api from '../../api/axios';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { fetchSettings } = useSettingsStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const { data } = await api.get('/notifications');
          setNotifications(data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.readBy.includes(user?._id)).length;

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      try {
        const unreadIds = notifications.filter(n => !n.readBy.includes(user?._id)).map(n => n._id);
        await api.put('/notifications/read', { notificationIds: unreadIds });
        setNotifications(notifications.map(n => ({
          ...n,
          readBy: [...n.readBy, user._id]
        })));
      } catch (e) {
        console.error('Failed to mark notifications as read');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Courses', path: '/courses', icon: GraduationCap },
    { name: 'Features & Services', path: '/features-services', icon: Sparkles },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  if (user) {
    navItems.splice(1, 0, { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard });
  }
  
  if (user?.role === 'admin') {
    navItems.push({ name: 'Enquiries', path: '/admin/contact', icon: Inbox });
  }

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden relative">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-dark-card border-r border-dark-border flex flex-col z-50 shadow-2xl"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-glow">
                    NV
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-dark-text to-dark-muted">
                    Note Vault Pro
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-dark-border text-dark-muted transition-colors"
                >
                  <Menu size={20} />
                </button>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center px-4 py-3.5 rounded-xl transition-all duration-300
                      ${isActive
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(124,58,237,0.1)]'
                        : 'text-dark-muted hover:text-dark-text hover:bg-dark-cardHover'}
                    `}
                  >
                    <item.icon size={22} className="mr-4" />
                    <span className="font-medium text-[15px]">{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-dark-border">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={22} className="mr-4" />
                    <span className="font-medium text-[15px]">Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsSidebarOpen(false); navigate('/login'); }}
                    className="flex items-center w-full px-4 py-3.5 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-medium text-[15px] w-full text-center">Login / Sign Up</span>
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Navbar */}
        <header className="h-20 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border flex items-center justify-between px-6 z-[100] sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-dark-border text-dark-muted hover:text-dark-text transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-glow">
                NV
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-dark-text to-dark-muted hidden sm:block">
                NoteVault Pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 ml-4">
              <div className="hidden md:flex items-center gap-6 mr-4 text-base font-medium">
                <NavLink to="/courses" className="text-dark-muted hover:text-primary transition-colors">Courses</NavLink>
                <NavLink to="/about" className="text-dark-muted hover:text-primary transition-colors">About Us</NavLink>
                <NavLink to="/contact" className="text-dark-muted hover:text-primary transition-colors">Contact Us</NavLink>
                {!user && (
                  <div className="flex items-center gap-4 ml-2 border-l border-dark-border pl-6">
                    <button onClick={() => navigate('/login')} className="text-dark-text hover:text-primary font-bold transition-colors">
                      Login
                    </button>
                    <button onClick={() => navigate('/register')} className="px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-glow hover:scale-105">
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

            <button
              onClick={toggleTheme}
              className="p-2 text-dark-muted hover:text-dark-text transition-colors"
            >
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            {user && (
              <>
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={handleNotificationClick}
                    className="relative p-2 text-dark-muted hover:text-dark-text transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accent animate-pulse border-2 border-dark-bg"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
                      >
                        <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
                          <h3 className="font-bold text-dark-text">Notifications</h3>
                          <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {unreadCount} New
                          </span>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map(notification => {
                              const isUnread = !notification.readBy.includes(user._id);
                              return (
                                <div
                                  key={notification._id}
                                  onClick={() => {
                                    setShowNotifications(false);
                                    if (notification.link) navigate(notification.link);
                                  }}
                                  className={`p-4 border-b border-dark-border/50 hover:bg-dark-cardHover transition-colors cursor-pointer flex gap-3 ${isUnread ? 'bg-primary/5' : ''}`}
                                >
                                  <div className="mt-1">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${isUnread ? 'bg-primary' : 'bg-transparent'}`}></div>
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm mb-1 ${isUnread ? 'font-bold text-dark-text' : 'font-medium text-dark-text'}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-dark-muted mb-2 leading-relaxed">
                                      {notification.message}
                                    </p>
                                    <p className="text-[10px] text-dark-muted font-medium">
                                      {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center text-dark-muted">
                              <Bell className="mx-auto mb-3 opacity-20" size={32} />
                              <p className="text-sm font-medium">No notifications yet</p>
                            </div>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-dark-border text-center bg-dark-bg/50">
                            <button className="text-xs font-bold text-primary hover:text-white transition-colors">
                              View All Notifications
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-dark-text">{user.name}</p>
                    <p className="text-xs text-primary">{user.role === 'admin' ? 'Admin Panel' : 'Student'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 cursor-pointer hover:shadow-glow transition-shadow">
                    <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main id="main-scroll" className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
