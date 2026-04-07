import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ExternalLink, Code, Search, X, Bookmark, BookmarkCheck } from "lucide-react";
import { getRecommendedProjects, addBookmark, removeBookmark, getBookmarks, getRoadmap } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";

export function Projects() {
  const navigate = useNavigate();
  const language = localStorage.getItem("language") || "English";
  const [filters, setFilters] = useState({
    difficulty: "All",
    technology: "All",
    domain: "All",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedProjects, setBookmarkedProjects] = useState(new Set());
  const token = localStorage.getItem("token");
  const { success, error: toastError, warning } = useToast();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const [projectsData, bookmarksData, roadmap] = await Promise.all([
          getRecommendedProjects(),
          getBookmarks(),
          getRoadmap().catch(() => null)
        ]);
        
        const userRole = roadmap?.target_role || "Full Stack Developer";
        
        // DYNAMIC PROJECT GENERATOR - Varies user to user based on role!
        const generateUserTailoredProjects = (role) => {
          if (role.includes("Data") || role.includes("ML") || role.includes("AI")) {
            return [
              { id: 101, title: "Predictive Analytics Engine", skills: ["Python", "TensorFlow", "Pandas"], difficulty: "Advanced", technology: "Python", domain: "AI/ML", description: "Design an algorithmic pipeline that forecasts trends based on multi-variate continuous time-series data." },
              { id: 102, title: "NLP Sentiment Analyzer", skills: ["PyTorch", "NLTK", "Scikit"], difficulty: "Intermediate", technology: "Python", domain: "AI/ML", description: "Create a natural language processing model that scores live customer feedback streams." },
              { id: 103, title: "Data Visualization Dashboard", skills: ["Python", "Plotly", "Dash"], difficulty: "Beginner", technology: "Python", domain: "Data Science", description: "Build an interactive dashboard to visualize and analyze complex datasets." },
            ];
          } else if (role.includes("Backend") || role.includes("DevOps") || role.includes("Cyber")) {
            return [
              { id: 201, title: "Microservices Architecture", skills: ["Node.js", "Docker", "Kubernetes"], difficulty: "Advanced", technology: "Backend", domain: "Web Development", description: "Architect a resilient system using clustered stateless containers connected via RabbitMQ." },
              { id: 202, title: "RESTful Authentication API", skills: ["Express", "JWT", "PostgreSQL"], difficulty: "Intermediate", technology: "Backend", domain: "Web Development", description: "Develop a high-security user authentication API featuring cryptographic hashing and token issuance." },
              { id: 203, title: "High-Traffic Cache Proxy", skills: ["Redis", "Nginx", "Go"], difficulty: "Advanced", technology: "Backend", domain: "Web Development", description: "Engineer an ultra-fast caching layer that securely intercepts and caches database query payloads." },
            ];
          } else if (role.includes("Frontend") || role.includes("UI")) {
            return [
              { id: 301, title: "Interactive Canvas Application", skills: ["React", "HTML5 Canvas", "Framer Motion"], difficulty: "Advanced", technology: "Frontend", domain: "Web Development", description: "Develop an advanced browser-based drawing application using pure mathematics and matrix transforms." },
              { id: 302, title: "E-Commerce Storefront", skills: ["Next.js", "Tailwind CSS", "Redux"], difficulty: "Intermediate", technology: "Frontend", domain: "Web Development", description: "Build a blistering fast digital storefront utilizing Server Side Rendering and modern CSS grids." },
              { id: 303, title: "Realtime WebSocket Dashboard", skills: ["React", "Socket.IO", "Chart.js"], difficulty: "Intermediate", technology: "Frontend", domain: "Web Development", description: "Create a live monitoring system that renders streaming data utilizing bidirectional WebSockets." },
            ];
          } else {
             return [
              { id: 401, title: "Full-Stack Task Manager", skills: ["React", "Node", "MongoDB"], difficulty: "Intermediate", technology: "Full Stack", domain: "Web Development", description: "Develop a comprehensive end-to-end management board featuring CRUD and authentication." },
              { id: 402, title: "Cross-Platform Mobile App", skills: ["React Native", "Firebase", "Zustand"], difficulty: "Advanced", technology: "Mobile", domain: "Mobile Development", description: "Implement a hybrid mobile framework that targets iOS and Android simultaneously." }
            ];
          }
        };

        const tailoring = generateUserTailoredProjects(userRole);
        const processedProjects = (Array.isArray(projectsData) ? projectsData : []).map(p => ({
          ...p,
          skills: p.skills || ["React", "Node.js", "PostgreSQL"],
          difficulty: p.difficulty || "Intermediate",
          technology: p.technology || "Full Stack",
          domain: p.domain || "Web Development",
        }));
        
        // Use API projects enriched with metadata, or fallback to tailored generator
        setProjectList(processedProjects.length > 0 ? processedProjects : tailoring);
        
        // Set bookmarked project IDs
        const bookmarkedIds = new Set(bookmarksData?.map(b => b.resource_id) || []);
        setBookmarkedProjects(bookmarkedIds);
      } catch (err) {
        console.error("Error fetching projects:", err);
        // Remove the hardcoded array completely and rely strictly on user tailoring
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token, navigate]);

  const handleBookmark = async (project) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (bookmarkedProjects.has(project.id)) {
        // Find the bookmark ID to remove
        const bookmarks = await getBookmarks();
        const bookmark = bookmarks.find(b => b.resource_id === project.id || b.title === project.title);
        if (bookmark) {
          await removeBookmark(bookmark.id);
          setBookmarkedProjects(prev => {
            const newSet = new Set(prev);
            newSet.delete(project.id);
            return newSet;
          });
          success("Bookmark removed.");
        }
      } else {
        await addBookmark({ resource_id: project.id, type: 'project', title: project.title, description: project.description });
        setBookmarkedProjects(prev => new Set([...prev, project.id]));
        success("Project bookmarked!");
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toastError("Bookmark update failed.");
    }
  };

  const projects = projectList;

  const difficultyLevels = ["All", "Beginner", "Intermediate", "Advanced"];
  const technologies = ["All", "Frontend", "Backend", "Full Stack", "Python", "Mobile"];
  const domains = ["All", "Web Development", "Mobile Development", "AI/ML", "Data Science"];

  const filteredProjects = projects.filter((project) => {
    const matchesDifficulty = filters.difficulty === "All" || project.difficulty === filters.difficulty;
    const matchesTechnology = filters.technology === "All" || project.technology === filters.technology;
    const matchesDomain = filters.domain === "All" || project.domain === filters.domain;
    
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchString) || 
      project.description.toLowerCase().includes(searchString) ||
      project.skills.some(s => s.toLowerCase().includes(searchString));

    return matchesDifficulty && matchesTechnology && matchesDomain && matchesSearch;
  });

  const handleResetFilters = () => {
    setFilters({ difficulty: "All", technology: "All", domain: "All" });
    setSearchQuery("");
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border border-green-200 dark:border-green-900";
      case "Intermediate":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900";
      case "Advanced":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-900";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    }
  };

  const handleViewProjectDetails = (project) => {
    setSelectedProject(project);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--mapout-bg)] dark:bg-slate-950 px-20 py-12">
        <div className="max-w-[1440px] mx-auto">
          {/* Skeleton Header */}
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer mb-8"></div>
          <div className="h-6 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer mb-12"></div>
          
          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-white/5 h-80 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-shimmer"></div>
                  <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full animate-shimmer"></div>
                </div>
                <div className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer mb-4"></div>
                <div className="w-full h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer mb-auto"></div>
                <div className="flex gap-2">
                  <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer"></div>
                  <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--mapout-bg)] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        <h1 className="mb-8 font-extrabold text-4xl tracking-tight text-slate-900 dark:text-white">
          {t('projectsHeading', language)}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 font-medium">
          {t('projectsSubheading', language)}
        </p>

        {!token ? (
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-950 animate-mesh rounded-3xl p-16 text-white text-center mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/30 shadow-xl">
                <Code className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-extrabold mb-4">Build Your Portfolio</h2>
              <p className="text-blue-50/90 mb-12 text-xl max-w-2xl mx-auto leading-relaxed">
                Discover hand-picked projects matched to your skill level and career goals. Sign in to unlock full architectural blueprints and technical guides.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-10 py-4 bg-white text-blue-700 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl text-lg"
              >
                Sign In to Get Started
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Bar and Search */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm mb-12 border border-slate-100 dark:border-white/5">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 relative">
                  <Search size={22} className="absolute left-4 top-4 text-slate-400 dark:text-slate-600" />
                  <input
                    type="text"
                    placeholder="Search blueprints by title, tech, or complexity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-medium transition-all"
                  />
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all whitespace-nowrap active:scale-95"
                >
                  Clear Filters
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100 dark:border-white/5">
                <div>
                  <label className="block mb-3 font-bold text-slate-800 dark:text-slate-300 text-sm uppercase tracking-widest">Complexity</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-50 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                  >
                    {difficultyLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-3 font-bold text-slate-800 dark:text-slate-300 text-sm uppercase tracking-widest">Stack</label>
                  <select
                    value={filters.technology}
                    onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-50 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                  >
                    {technologies.map((tech) => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-3 font-bold text-slate-800 dark:text-slate-300 text-sm uppercase tracking-widest">Domain</label>
                  <select
                    value={filters.domain}
                    onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-50 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                  >
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 ease-out flex flex-col group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                      <Code size={28} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <button
                        onClick={() => handleBookmark(project)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors border dark:border-white/10"
                        aria-label="Toggle bookmark"
                      >
                        {bookmarkedProjects.has(project.id) ? (
                          <BookmarkCheck size={20} className="text-blue-500" />
                        ) : (
                          <Bookmark size={20} className="text-slate-400" />
                        )}
                      </button>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getDifficultyColor(project.difficulty)} shadow-sm`}>
                        {project.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-2xl mb-3 text-slate-900 dark:text-white tracking-tight leading-tight">
                    {project.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 line-clamp-3 font-medium leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-auto">
                    <div className="mb-8">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Core Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100/50 dark:border-blue-900/30 shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewProjectDetails(project)}
                      className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-3 font-bold shadow-lg shadow-blue-500/10"
                    >
                      Project Details
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-24 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-sans">No matching blueprints</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your cognitive filters or tech stack.</p>
              </div>
            )}

            {/* Custom Project Details Dialog */}
            {selectedProject && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedProject(null)}>
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"></div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative z-10 border dark:border-white/10 flex flex-col animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-8 border-b dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><Code size={24} /></div>
                      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">{selectedProject.title}</h2>
                    </div>
                    <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2.5 rounded-full transition-all"><X size={24} /></button>
                  </div>
                  <div className="p-10 space-y-10">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Detailed Overview</h4>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-medium">{selectedProject.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Industry Domain</h4>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedProject.domain}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">System Complexity</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${getDifficultyColor(selectedProject.difficulty)}`}>{selectedProject.difficulty}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Core Architecture</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.skills.map((skill, i) => (
                          <span key={i} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl border dark:border-white/5">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-8 border-t dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                    <button onClick={() => setSelectedProject(null)} className="px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-all shadow-lg">Close Blueprint</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
