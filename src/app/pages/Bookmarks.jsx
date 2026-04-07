import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bookmark, Trash2, ExternalLink, Grid, List, Heart, Archive, Save, Briefcase, BookOpen, HelpCircle, File } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { getBookmarks, removeBookmark } from "../utils/api.js";
import { useToast } from "../components/Toast.jsx";

export function Bookmarks() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToRemove, setItemToRemove] = useState(null);
  const token = localStorage.getItem("token");
  const { success, error: toastError, warning } = useToast();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const data = await getBookmarks(token);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        toastError("Failed to fetch your saved library.");
        // Use default mock data if API fails
        setItems([
          {
            id: 1,
            title: "E-Commerce Platform Project",
            type: "project",
            category: "Web Development",
            savedDate: "March 15, 2024",
            description: "Build a complete e-commerce application with shopping cart and payment integration",
            color: "bg-blue-50",
          },
          {
            id: 2,
            title: "React Advanced Patterns",
            type: "course",
            category: "Frontend",
            savedDate: "March 14, 2024",
            description: "Learn advanced React patterns including hooks, context, and performance optimization",
            color: "bg-purple-50",
          },
          {
            id: 4,
            title: "Virtual DOM Explanation",
            type: "faq",
            category: "Interview Q&A",
            savedDate: "March 12, 2024",
            description: "How does Virtual DOM work in React?",
            color: "bg-orange-50",
          },
          {
            id: 5,
            title: "Machine Learning Basics",
            type: "course",
            category: "AI/ML",
            savedDate: "March 10, 2024",
            description: "Introduction to machine learning concepts and algorithms",
            color: "bg-pink-50",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [token, navigate]);

  const handleRemove = async (id) => {
    try {
      await removeBookmark(token, id);
      setItems(items.filter(item => item.id !== id));
      setItemToRemove(null);
    } catch (err) {
      console.error("Error removing bookmark:", err);
      toastError("Failed to remove item.");
      setItemToRemove(null);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      project: <Briefcase size={24} className="text-blue-600" />,
      course: <BookOpen size={24} className="text-purple-600" />,
      faq: <HelpCircle size={24} className="text-orange-600" />,
    };
    return icons[type] || <File size={24} className="text-gray-600" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      project: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
      course: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
      faq: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
    };
    return colors[type] || "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300";
  };

  const handleOpen = (item) => {
    if (item.type === 'project') navigate('/projects');
    else if (item.type === 'faq') navigate('/interview-faqs');
    else navigate('/research-guide');
  };

  return (
    <div className="min-h-screen bg-[var(--mapout-bg)] font-sans">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        <h1 className="mb-8 font-bold text-4xl text-gray-900 dark:text-white">
          Bookmarks
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">Save and organize your favorite resources</p>

        {!token ? (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 rounded-[12px] p-12 border border-blue-100 dark:border-blue-900/20 text-center mb-12 shadow-sm transition-colors duration-300">
            <div className="bg-white dark:bg-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md border border-blue-50 dark:border-white/5 text-blue-600 dark:text-blue-400">
              <Bookmark className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white">Elevate Your Knowledge Base</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
              Build your professional toolkit by organizing articles, projects, and career resources. Create a personal knowledge library that grows with your career.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left font-sans">
              <div className="bg-white/80 dark:bg-slate-800/40 p-6 rounded-xl border border-blue-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
                <div className="text-indigo-600 dark:text-indigo-400 mb-3"><Save className="w-6 h-6" /></div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Instant Save</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Capture valuable insights with a single click.</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/40 p-6 rounded-xl border border-blue-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
                <div className="text-blue-600 dark:text-blue-400 mb-3"><Bookmark className="w-6 h-6" /></div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Smart Sorting</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Auto-categorization for efficient discovery.</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/40 p-6 rounded-xl border border-blue-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
                <div className="text-cyan-600 dark:text-cyan-400 mb-3"><Archive className="w-6 h-6" /></div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Quick Recall</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find what you need exactly when you need it.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-[var(--mapout-secondary)] text-white rounded-md hover:bg-[var(--mapout-primary)] transition-colors font-semibold text-lg"
            >
              Sign In to Save Resources
            </button>
          </div>
        ) : null}

        {token && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {items.length} saved item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[var(--mapout-secondary)] text-white shadow-lg shadow-blue-500/30"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent dark:border-white/5"
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--mapout-secondary)] text-white shadow-lg shadow-blue-500/30"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent dark:border-white/5"
              }`}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List size={20} />
            </button>
          </div>
        </div>
        )}

        {/* Filter Tabs */}
        {token && (
          <div className="bg-white dark:bg-slate-800/40 rounded-[10px] p-4 shadow-md mb-8 flex items-center gap-4 border border-transparent dark:border-white/5 font-sans">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {[{id: 'all', label: 'All'}, {id: 'project', label: 'Projects'}, {id: 'course', label: 'Courses'}, {id: 'faq', label: 'FAQs'}].map((type) => (
                <button
                  key={type.id}
                  className="px-5 py-2 rounded-full text-sm font-bold shadow-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  aria-label={`Filter by ${type.label}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className={`${item.color} dark:bg-slate-900/40 border border-transparent dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 group`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-transparent dark:border-white/10 group-hover:scale-110 transition-transform">
                    {getTypeIcon(item.type)}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent dark:border-red-500/20"
                        aria-label="Remove bookmark"
                      >
                        <Trash2 size={18} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-slate-900 dark:border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">Remove Bookmark</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-slate-400">
                          Are you sure you want to remove "{item.title}" from your bookmarks? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-slate-800 dark:text-white dark:border-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(item.id)}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 font-medium leading-relaxed">{item.description}</p>

                <div className="flex justify-between items-center mt-auto">
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpen(item)}
                    className="p-2 bg-white dark:bg-slate-800 text-[var(--mapout-secondary)] dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm border dark:border-white/5"
                    aria-label="Open item"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-white/5 my-4"></div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Saved {item.savedDate}</p>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-slate-100 dark:border-white/5">
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-inner group-hover:scale-105 transition-transform">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                          <Bookmark size={12} className="inline" />
                          {item.savedDate}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center ml-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpen(item)}
                        className="p-2 text-[var(--mapout-secondary)] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                        aria-label="Open item"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            aria-label="Remove bookmark"
                          >
                            <Trash2 size={18} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-slate-900 dark:border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">Remove Bookmark</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-slate-400">
                              Are you sure you want to remove "{item.title}" from your bookmarks?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:bg-slate-800 dark:text-white">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(item.id)}
                              className="bg-red-600 hover:bg-red-700 dark:bg-red-500"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No bookmarks yet</p>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Start bookmarking projects and courses to see them here.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
