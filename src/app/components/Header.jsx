import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, Bell, User, X, LogOut, Compass, Sun, Moon, ChevronRight, Check } from "lucide-react";
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

  // Scroll effect for header shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Theme persistence
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
      
      // Initial notification fetch
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
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Resume Studio", path: "/resume-studio" },
    { name: "Career Planner", path: "/career-planner" },
    { name: "Projects", path: "/projects" },
    { name: "Research Guide", path: "/research-guide" },
    { name: "Interview FAQs", path: "/interview-faqs" },
  ];

  const sidebarLinks = [...navLinks, { name: "Bookmarks", path: "/bookmarks" }];

  return (
    <>
      {/* ─── HEADER ─── */}
      <header
        style={{ height: '64px' }}
        className={`sticky top-0 z-50 w-full bg-white dark:bg-[#0a0f1e] transition-all duration-200 ${
          scrolled
            ? "shadow-lg dark:shadow-black/50 border-b border-gray-200 dark:border-gray-800"
            : "border-b border-gray-100 dark:border-white/5"
        }`}
      >
        <div
          className="h-full w-full px-5 grid items-center"
          style={{ gridTemplateColumns: 'minmax(180px, 1fr) 2fr minmax(180px, 1fr)' }}
        >

          {/* ── COL 1 · EXTREME LEFT: Hamburger + Logo ── */}
          <div className="flex items-center gap-2.5">
            <button
              id="hamburger-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-colors flex-shrink-0 shadow-sm"
            >
              <Menu size={18} strokeWidth={2.5} />
            </button>

            <Link to="/" className="flex items-center gap-2 group select-none">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Compass size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                MapOut
              </span>
            </Link>
          </div>

          {/* ── COL 2 · CENTER: Desktop Navigation ── */}
          <nav className="hidden lg:flex items-center justify-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-md text-[14px] font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-600/15 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* ── COL 3 · EXTREME RIGHT: Actions ── */}
          <div className="flex items-center justify-end gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun size={17} className="text-yellow-400" /> : <Moon size={17} />}
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
                <button
                  onClick={() => setIsNotificationsOpen((v) => !v)}
                  aria-label="Notifications"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-[#0a0f1e] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/10 shadow-xl z-50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                      {unreadCount > 0 && <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-slate-50 dark:divide-white/5">
                          {notifications.slice(0, 5).map(notif => (
                            <div key={notif.id} className={`px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group ${!notif.is_read ? 'bg-blue-50/40 dark:bg-blue-900/5' : ''}`}>
                              <p className={`text-[13px] leading-relaxed mb-1 ${!notif.is_read ? 'font-semibold text-slate-900 dark:text-gray-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                {notif.message}
                              </p>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(notif.created_at).toLocaleDateString()}</span>
                                {!notif.is_read && (
                                  <button 
                                    onClick={() => handleMarkRead(notif.id)}
                                    className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                                  >
                                    Mark Read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-5 py-12 text-center text-slate-400">
                          <Bell size={24} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm font-medium">Clear as day! No alerts.</p>
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 text-center">
                      <button className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest">
                        View All Activity
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* Profile */}
            <Link
              to="/profile"
              aria-label="Profile"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <User size={17} />
            </Link>

            {/* Sign In / Logout CTA */}
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="ml-1 inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── SIDEBAR OVERLAY ─── */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed top-0 left-0 bottom-0 z-[100] w-72 bg-white dark:bg-slate-950 flex flex-col shadow-2xl">
            {/* Sidebar Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
                  <Compass size={15} className="text-white" />
                </div>
                <span className="text-[16px] font-bold text-slate-900 dark:text-white">MapOut</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* User badge (if logged in) */}
            {isLoggedIn && (
              <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3 border border-slate-100 dark:border-white/5">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Hello, {userName}</p>
                  <p className="text-xs text-slate-400 font-medium">Professional Plan</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {sidebarLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
                      active
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-600/15 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {link.name}
                    {active && <ChevronRight size={14} />}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="px-3 pb-4 border-t border-slate-100 dark:border-white/5 pt-3 space-y-0.5">
              <Link
                to="/about"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-[14px] font-semibold text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                Help & Docs
              </Link>
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
              {!isLoggedIn && (
                <Link
                  to="/login"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[14px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}