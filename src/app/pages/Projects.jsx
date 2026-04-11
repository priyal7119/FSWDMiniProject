import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Briefcase, Search as SearchIcon, ExternalLink, 
  Code, Database, Layout, Smartphone, PieChart, 
  Tag, Filter, ChevronRight, Zap, Trophy, ArrowRight,
  Bookmark, Archive, X
} from "lucide-react";
import { getProjects, addBookmark } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";

const categories = [
  { id: "all", label: "All Projects", icon: Briefcase },
  { id: "frontend", label: "Frontend", icon: Layout },
  { id: "backend", label: "Backend", icon: Database },
  { id: "fullstack", label: "Full Stack", icon: Code },
  { id: "data-science", label: "Data Science", icon: PieChart },
  { id: "mobile", label: "Mobile Dev", icon: Smartphone },
];

export function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const token = localStorage.getItem("token");
  const { success, error: toastError, info } = useToast();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProjects();
  }, [token, navigate]);

  const handleSave = async (project) => {
    try {
       await addBookmark({
          title: project.title,
          description: project.description,
          type: 'project',
          resource_id: project.id
       });
       success(`" ${project.title} " added to your Bookmarks.`);
    } catch (err) {
       toastError("Failed to add bookmark.");
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toastError("Failed to sync project archives.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = projects;
    
    // Category Filter
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    
    // Difficulty Filter
    if (activeDifficulty !== "all") {
      result = result.filter((p) => 
        (p.difficulty?.toLowerCase() === activeDifficulty.toLowerCase()) || 
        (p.difficulty_level?.toLowerCase() === activeDifficulty.toLowerCase())
      );
    }

    // Search Filter
    if (searchQuery) {
      result = result.filter((p) => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProjects(result);
  }, [activeCategory, activeDifficulty, searchQuery, projects]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-5xl font-black tracking-tight mb-3 font-header text-foreground">
              Browse <span className="text-primary">Projects</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-xl">
              Curated projects matched to your career path and skills.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-foreground"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === cat.id 
                ? "bg-primary text-white border-primary shadow-lg shadow-teal-500/20" 
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filters */}
        <div className="flex items-center gap-4 mb-16 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
           <Filter size={16} className="text-muted-foreground" />
           <div className="flex p-1 bg-muted/50 border border-border rounded-xl gap-1">
              {['all', 'beginner', 'intermediate', 'hard'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setActiveDifficulty(lvl === 'hard' ? 'advanced' : lvl)}
                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    (activeDifficulty === lvl || (activeDifficulty === 'advanced' && lvl === 'hard')) 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lvl}
                </button>
              ))}
           </div>
        </div>

        {/* Archives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, idx) => (
              <div 
                key={project.id || idx} 
                className="group bg-card border border-border rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all flex flex-col h-full relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                      <Zap size={28} />
                   </div>
                   <div className="flex gap-2">
                     <span className="px-4 py-1.5 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border">
                        {project.category || "General"}
                     </span>
                   </div>
                </div>

                <h3 className="text-2xl font-black mb-4 tracking-tight text-foreground group-hover:text-primary transition-colors relative z-10">
                  {project.title}
                </h3>
                
                <p className="text-muted-foreground font-medium mb-10 text-sm leading-relaxed flex-grow relative z-10">
                  {project.description}
                </p>

                <div className="space-y-6 relative z-10 mt-auto">
                     <div className="flex flex-wrap gap-2 text-foreground">
                        {(Array.isArray(project.tags) ? project.tags : ["Engineering", "Architecture"]).map((tag, i) => (
                          <span key={i} className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                            #{tag}
                          </span>
                        ))}
                     </div>

                    <div className="pt-6 border-t border-border flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <button 
                            onClick={() => setSelectedProject(project)}
                            className="flex items-center gap-2 text-teal-600 font-black text-[10px] uppercase tracking-widest hover:text-teal-700 transition-colors"
                          >
                            View Details <ExternalLink size={14} />
                          </button>
                          <button 
                            onClick={() => handleSave(project)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group/save"
                          >
                            <Archive size={16} className="group-hover/save:scale-110 transition-transform" />
                            <span className="font-black text-[10px] uppercase tracking-widest">Archive</span>
                          </button>
                       </div>
                       <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
                          <Trophy size={14} /> Elite
                       </div>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-muted/20 rounded-[3rem] border border-dashed border-border">
               <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground mx-auto mb-8">
                  <Filter size={40} />
               </div>
               <h3 className="text-2xl font-black mb-2 tracking-tight text-foreground">No Projects Found</h3>
               <p className="text-muted-foreground font-medium">No projects match your current search.</p>
               <button onClick={() => { setActiveCategory("all"); setSearchQuery(""); }} className="mt-8 text-primary font-black text-[10px] uppercase tracking-[0.2em] underline decoration-2 underline-offset-8">Reset Search</button>
            </div>
          )}
        </div>

        {/* Global Strategy Suggestion */}
        <div className="mt-24 bg-primary rounded-[3rem] p-12 md:p-16 text-white shadow-2xl shadow-teal-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
           <div className="max-w-2xl relative z-10">
              <h2 className="text-4xl font-black mb-6 tracking-tight">Need a Custom Project?</h2>
              <p className="text-teal-50 text-xl font-medium leading-relaxed opacity-90 italic">
                "Our AI platform can create personalized project paths based on your career goals."
              </p>
           </div>
           <button 
             onClick={() => navigate("/career-planner")}
             className="px-12 py-5 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl whitespace-nowrap group/btn"
           >
             Go to Planner <ArrowRight className="inline-block ml-3 group-hover/btn:translate-x-2 transition-transform" />
           </button>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-slate-50/95 border border-slate-200 w-full max-w-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 backdrop-blur-md">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Zap size={28} />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSave(selectedProject)}
                    className="p-3 bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition-all group/bookmark"
                    title="Bookmark Project"
                  >
                    <Bookmark size={20} className="group-active/bookmark:scale-90 transition-transform" />
                  </button>
                  <button onClick={() => setSelectedProject(null)} className="p-3 bg-muted rounded-full hover:bg-rose-50 text-muted-foreground hover:text-rose-500 transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-foreground mb-4">{selectedProject.title}</h2>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-4 py-1.5 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border">
                  {selectedProject.category || "General"}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  selectedProject.difficulty === 'advanced' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                  selectedProject.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                  'bg-teal-50 text-teal-600 border-teal-100'
                }`}>
                  {selectedProject.difficulty || "Beginner"}
                </span>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Project Overview</h4>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{selectedProject.description}</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-950 shadow-sm relative group/outcomes">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-lg group-hover/outcomes:scale-110 transition-transform">
                    <Trophy size={14} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <Trophy size={14} /> Expected Outcomes
                  </h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {selectedProject.expectations || "This project expects you to demonstrate proficiency in current industry frameworks, maintain professional documentation, and implement scalable architectural patterns as defined in the technical guidelines."}
                  </p>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="w-full py-4 border border-border text-muted-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
