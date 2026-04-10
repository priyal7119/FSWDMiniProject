import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bookmark, Trash2, ExternalLink, Grid, List, Heart, Archive, Save, Briefcase, BookOpen, HelpCircle, File, LayoutGrid, Rows } from "lucide-react";
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
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const { success, error: toastError, info } = useToast();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const data = await getBookmarks(token);
        const bookmarks = Array.isArray(data) ? data : [];
        setItems(bookmarks);
        setFilteredItems(bookmarks);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setItems([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [token, navigate]);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.type === activeFilter));
    }
  }, [activeFilter, items]);

  const handleRemove = async (id) => {
    try {
      await removeBookmark(token, id);
      setItems(items.filter(item => item.id !== id));
      success("Resource de-archived.");
    } catch (err) {
      console.error("Error removing bookmark:", err);
      toastError("Failed to remove item.");
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      project: <Briefcase size={24} className="text-primary" />,
      course: <BookOpen size={24} className="text-teal-500" />,
      faq: <HelpCircle size={24} className="text-primary" />,
    };
    return icons[type] || <File size={24} className="text-muted-foreground" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      project: "text-primary bg-primary/10 border-primary/20",
      course: "text-teal-500 bg-teal-500/10 border-teal-500/20",
      faq: "text-primary bg-primary/10 border-primary/20",
    };
    return colors[type] || "text-muted-foreground bg-muted border-border";
  };

  const handleOpen = (item) => {
    if (item.type === 'project') navigate('/projects');
    else if (item.type === 'faq') navigate('/interview-faqs');
    else navigate('/research-guide');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
                   <Archive size={24} />
                </div>
                <h2 className="text-xl font-black tracking-tight text-foreground">Archive Vault</h2>
             </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-4 leading-none">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mapout-primary)] to-[var(--mapout-secondary)]">Library.</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl text-lg">
              Manage and scale your personal knowledge repository of high-impact career resources.
            </p>
          </div>

          {!token && (
             <button
               onClick={() => navigate("/login")}
               className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-teal-500/20"
             >
               Sign In to Architect
             </button>
          )}
        </div>

        {token && (
          <div className="space-y-12">
            
            {/* Filter & View Mode */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-card border border-border rounded-[2.5rem] shadow-sm gap-8">
               <div className="flex flex-wrap gap-3">
                  {['all', 'project', 'course', 'faq'].map((filter) => (
                     <button
                       key={filter}
                       onClick={() => setActiveFilter(filter)}
                       className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                         activeFilter === filter ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-white'
                       }`}
                     >
                        {filter}
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-2 p-1.5 bg-muted rounded-2xl border border-border">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
                  >
                     <LayoutGrid size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
                  >
                     <Rows size={20} />
                  </button>
               </div>
            </div>

            {/* Content View */}
            {viewMode === 'grid' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
                  {filteredItems.map((item) => (
                     <div key={item.id} className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-teal-500/5 transition-all group flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="flex justify-between items-start mb-10">
                           <div className="w-14 h-14 bg-white border border-border rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                              {getTypeIcon(item.type)}
                           </div>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <button className="p-3 rounded-xl bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                                    <Trash2 size={20} />
                                 </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border rounded-[2rem]">
                                 <AlertDialogHeader>
                                    <AlertDialogTitle className="font-black">Discard Archive?</AlertDialogTitle>
                                    <AlertDialogDescription className="font-medium text-muted-foreground">This resource will be removed from your secure library synchronization.</AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemove(item.id)} className="bg-rose-500 hover:bg-rose-600 rounded-xl font-black uppercase text-[10px] tracking-widest">Confirm Removal</AlertDialogAction>
                                 </AlertDialogFooter>
                              </AlertDialogContent>
                           </AlertDialog>
                        </div>

                        <div className="mb-6">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current shadow-sm ${getTypeColor(item.type)}`}>
                              {item.type}
                           </span>
                        </div>

                        <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight leading-tight">
                           {item.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed font-medium mb-10 text-sm line-clamp-2">
                           {item.description}
                        </p>

                        <div className="mt-auto pt-8 border-t border-border flex items-center justify-between">
                           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Archived {item.savedDate || 'Recent'}</span>
                           <button 
                             onClick={() => handleOpen(item)}
                             className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                           >
                              <ExternalLink size={18} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="space-y-4 animate-in fade-in duration-700">
                  {filteredItems.map((item) => (
                     <div key={item.id} className="bg-card border border-border rounded-[2rem] p-6 group flex items-center justify-between hover:bg-muted/30 transition-all">
                        <div className="flex items-center gap-8 flex-1">
                           <div className="w-14 h-14 bg-white border border-border rounded-xl flex items-center justify-center shadow-sm">
                              {getTypeIcon(item.type)}
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <h3 className="font-black text-lg text-foreground tracking-tight">{item.title}</h3>
                                 <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-current ${getTypeColor(item.type)}`}>{item.type}</span>
                              </div>
                              <p className="text-sm text-muted-foreground font-medium line-clamp-1">{item.description}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <button onClick={() => handleOpen(item)} className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-all"><ExternalLink size={20} /></button>
                           <button className="p-3 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={20} /></button>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {filteredItems.length === 0 && (
               <div className="py-24 bg-muted/30 border border-border border-dashed rounded-[3rem] text-center">
                  <Bookmark size={40} className="mx-auto mb-6 text-muted-foreground opacity-30" />
                  <h3 className="text-xl font-black mb-2">Archive empty.</h3>
                  <p className="text-muted-foreground font-medium">Synchronize high-impact resources through the Dashboard or Projects portal.</p>
               </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
