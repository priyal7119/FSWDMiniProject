import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, Bell, User, X, LogOut, Compass, Sun, Moon, ChevronRight, Check, Map, Zap, Archive } from "lucide-react";
import { getNotifications, markNotificationRead } from "../utils/api.js";

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      const name = localStorage.getItem("userName");
      setUserName(name && name !== "undefined" && name !== "null" ? name : "User");
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setIsSidebarOpen(false);
    window.location.href = "/login";
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Resume Studio", path: "/resume-studio" },
    { name: "Career Planner", path: "/career-planner" },
    { name: "Projects", path: "/projects" },
    { name: "Interview Prep", path: "/interview-faqs" },
    { name: "Research Guide", path: "/research-guide" }
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-[100] w-full h-20 transition-all duration-500 flex items-center bg-muted/50 backdrop-blur-md border-b border-border shadow-sm`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          
          {/* Left: Menu & Brand (Restored to Left) */}
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col gap-1.5 p-2 hover:opacity-70 transition-opacity group">
              <span className="w-6 h-0.5 bg-foreground rounded-full transition-all group-hover:w-4"></span>
              <span className="w-6 h-0.5 bg-foreground rounded-full"></span>
              <span className="w-4 h-0.5 bg-foreground rounded-full transition-all group-hover:w-6"></span>
            </button>
            <Link to="/" className="flex items-center gap-3 group">
               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-teal-500/20 group-hover:scale-110 transition-transform">
                  <Map size={20} strokeWidth={2.5} />
               </div>
               <span className="text-xl font-black text-foreground tracking-tight hidden sm:block">MapOut.</span>
            </Link>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden lg:flex items-center justify-center">
            <nav className="flex items-center gap-1 p-1 bg-muted/60 rounded-2xl border border-border/80 shadow-inner">
               {navLinks.map((link) => {
                 const active = location.pathname === link.path;
                 return (
                   <Link
                     key={link.path}
                     to={link.path}
                     className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                       active
                         ? "bg-white text-primary shadow-sm"
                         : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                     }`}
                   >
                     {link.name}
                   </Link>
                 );
               })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
             {/* Notifications */}
             <div 
               className="relative group/notif" 
               ref={notifRef}
               onMouseEnter={() => setIsNotificationsOpen(true)}
               onMouseLeave={() => setIsNotificationsOpen(false)}
             >
                <button 
                  className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all relative"
                >
                   <Bell size={18} />
                   {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-xl shadow-teal-500/50" />}
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full pt-4 w-80 z-[110]">
                    <div className="bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                      <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Notifications</h4>
                          <span className="text-[8px] font-black px-2 py-1 bg-primary text-white rounded-full">{unreadCount}</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.slice(0, 5).map(notif => (
                                <div key={notif.id} className="p-5 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                                  <p className="text-xs font-semibold text-foreground mb-2 leading-relaxed">{notif.message}</p>
                                  <div className="flex justify-between items-center">
                                      <span className="text-[8px] font-black text-muted-foreground uppercase">{new Date(notif.created_at).toLocaleDateString()}</span>
                                      {!notif.is_read && <button onClick={() => handleMarkRead(notif.id)} className="text-[8px] font-black text-primary hover:underline uppercase tracking-tighter">Mark as Read</button>}
                                  </div>
                                </div>
                            ))
                          ) : (
                            <div className="py-12 text-center text-muted-foreground opacity-30"><Bell size={24} className="mx-auto" /></div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
             </div>

             {/* Profile Icon */}
             <Link to="/profile" className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                <User size={18} />
             </Link>

             {/* Auth Button */}
             <button 
                onClick={isLoggedIn ? handleLogout : () => navigate("/login")}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
             >
                {isLoggedIn ? "Log Out" : "Sign In"}
             </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 z-[130] w-80 bg-card border-r border-border shadow-2xl p-8 flex flex-col animate-in slide-in-from-left-full duration-500 overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black tracking-tight font-header text-foreground">
                  Explore <span className="text-primary">Features.</span>
                </h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-muted"><X size={20} /></button>
             </div>
             
             <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Welcome back,</p>
                <h4 className="text-2xl font-black text-foreground">Hello, {userName}!</h4>
             </div>
             
             <nav className="flex-1 space-y-2">
                {[...navLinks, { name: "Bookmarks", path: "/bookmarks" }, { name: "Profile", path: "/profile" }].map(link => (
                   <Link 
                     key={link.path} 
                     to={link.path} 
                     onClick={() => setIsSidebarOpen(false)}
                     className={`flex items-center justify-between p-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                       location.pathname === link.path ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                     }`}
                   >
                      {link.name} <ChevronRight size={14} />
                   </Link>
                ))}
             </nav>

             <div className="pt-8 border-t border-border mt-auto">
                <Link to="/about" onClick={() => setIsSidebarOpen(false)} className="block p-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                {isLoggedIn && <button onClick={handleLogout} className="w-full mt-4 p-4 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Log Out</button>}
             </div>
          </aside>
        </>
      )}
    </>
  );
}