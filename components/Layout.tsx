import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Settings, User, LogOut, Monitor, ChevronRight, Check } from 'lucide-react';
import Sidebar from './Sidebar';
import { ViewState } from '../types';

// Mock Notifications Initial State
const INITIAL_NOTIFICATIONS = [
    { id: 1, title: 'Job Completed', message: 'Docking Analysis #8821 finished successfully.', time: '2 min ago', read: false, type: 'success' },
    { id: 2, title: 'System Alert', message: 'Scheduled maintenance in 2 hours.', time: '1 hour ago', read: false, type: 'warning' },
    { id: 3, title: 'New Comment', message: 'Dr. Sarah updated Project Chimera notes.', time: '3 hours ago', read: true, type: 'info' },
];

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'settings' | 'profile' | null>(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isDark, setIsDark] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Close dropdowns when clicking outside
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: 'notifications' | 'settings' | 'profile') => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
  };

  const handleLogout = () => {
    alert("Signing out...");
    setView(ViewState.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-slate-200">
      <Sidebar 
        currentView={currentView} 
        setView={(v) => { setView(v); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen} 
        onSettings={() => toggleDropdown('settings')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <header ref={headerRef} className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur-md lg:px-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="block rounded-lg p-2 hover:bg-white/5 lg:hidden text-slate-400 hover:text-white transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden md:flex items-center rounded-full bg-surfaceHighlight px-4 py-1.5 border border-white/5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                    <Search className="mr-2 h-4 w-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search projects, molecules..." 
                        className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative">
                    <button 
                        onClick={() => toggleDropdown('notifications')}
                        className={`relative rounded-full p-2 transition-all ${activeDropdown === 'notifications' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                        )}
                    </button>
                    
                    {activeDropdown === 'notifications' && (
                        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-surface shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden z-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                                <h3 className="font-semibold text-white text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllRead}
                                        className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-bold ${notif.type === 'success' ? 'text-green-400' : notif.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                    {notif.title}
                                                </span>
                                                <span className="text-[10px] text-slate-500">{notif.time}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-snug">{notif.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                             <div className="p-2 text-center border-t border-white/5 bg-surfaceHighlight">
                                <button className="text-xs text-slate-400 hover:text-white transition-colors">View All History</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <div className="relative">
                    <button 
                         onClick={() => toggleDropdown('settings')}
                         className={`rounded-full p-2 transition-all ${activeDropdown === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Settings className="h-5 w-5" />
                    </button>

                    {activeDropdown === 'settings' && (
                         <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-surface shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 p-2">
                             <div className="px-3 py-2 mb-2 border-b border-white/5">
                                 <h3 className="font-semibold text-white text-sm">Quick Settings</h3>
                             </div>
                             <div className="space-y-1">
                                 <div 
                                    onClick={toggleTheme}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer group"
                                 >
                                     <div className="flex items-center gap-3 text-sm text-slate-300 group-hover:text-white">
                                         <Monitor className="h-4 w-4" />
                                         <span>Appearance</span>
                                     </div>
                                     <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 min-w-[30px] text-center">
                                         {isDark ? 'Dark' : 'Light'}
                                     </span>
                                 </div>
                                  <div 
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer group"
                                  >
                                     <div className="flex items-center gap-3 text-sm text-slate-300 group-hover:text-white">
                                         <Bell className="h-4 w-4" />
                                         <span>Notifications</span>
                                     </div>
                                     <div className={`w-8 h-4 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-primary/20' : 'bg-slate-700'}`}>
                                         <div className={`absolute top-1 h-2 w-2 rounded-full transition-all ${notificationsEnabled ? 'bg-primary right-1' : 'bg-slate-400 left-1'}`}></div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative pl-2 border-l border-white/10 ml-1">
                    <button 
                        onClick={() => toggleDropdown('profile')}
                        className="flex items-center gap-3 rounded-full py-1 pr-1 hover:bg-white/5 transition-colors"
                    >
                         <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-white leading-none">Dr. Novikov</p>
                            <p className="text-[10px] text-slate-500 leading-none mt-1">Lead Chemist</p>
                        </div>
                        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="h-full w-full object-cover" />
                             <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></div>
                        </div>
                    </button>

                    {activeDropdown === 'profile' && (
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-surface shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
                             <div className="px-4 py-4 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                                 <p className="font-semibold text-white">Gleb Novikov</p>
                                 <p className="text-xs text-slate-400">gleb.novikov@invero.ai</p>
                             </div>
                             <div className="p-2">
                                 <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                     <User className="h-4 w-4" /> Profile
                                 </button>
                                 <button 
                                    onClick={() => toggleDropdown('settings')}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                 >
                                     <Settings className="h-4 w-4" /> Preferences
                                 </button>
                                 <div className="my-2 border-t border-white/5"></div>
                                 <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                 >
                                     <LogOut className="h-4 w-4" /> Sign Out
                                 </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Scrollable View Content */}
        <main className="p-4 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;