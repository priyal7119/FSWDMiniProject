import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  FileCheck, Award, AlertCircle, Briefcase, 
  Search as SearchIcon, X, ExternalLink, TrendingUp, 
  Calendar, Target, BarChart3, Lightbulb, Trophy, 
  GraduationCap, Zap, BookOpen, MapPin, Tag, ArrowRight 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, 
  PieChart, Pie, Cell 
} from "recharts";
import { api, getStats, getDetailedDashboardData } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";

const COLORS = ['#14b8a6', '#0ea5e9', '#6366f1', '#ec4899', '#f59e0b'];

const resumeScoreHistory = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 70 },
  { month: "Mar", score: 78 },
  { month: "Apr", score: 82 },
  { month: "May", score: 85 },
];

const timeSpentData = [
  { name: "Resume Studio", value: 25 },
  { name: "Career Planner", value: 20 },
  { name: "Projects", value: 30 },
  { name: "Interview Prep", value: 15 },
  { name: "Research Guide", value: 10 },
];

const skillProgressData = [
  { skill: "React", progress: 85, target: 90 },
  { skill: "JavaScript", progress: 90, target: 95 },
  { skill: "Python", progress: 65, target: 80 },
  { skill: "SQL", progress: 70, target: 85 },
  { skill: "TypeScript", progress: 60, target: 85 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem("token");
  const language = localStorage.getItem("language") || "English";
  const { error: toastError } = useToast();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoggedIn(true);
        const data = await getStats(token);
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        toastError("Failed to sync your dashboard.");
        setStats({ skills_learned: 12, milestones_completed: 5, resume_score: 85 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const summaryCards = [
    { icon: FileCheck, title: "Resume Score", value: stats?.resume_score ? `${stats.resume_score}/100` : "75/100", desc: "Your resume performance", color: "bg-teal-500/10 border-teal-500/20 text-teal-600" },
    { icon: Award, title: "Skills Learned", value: stats?.skills_learned || 12, desc: "Skills mastered", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600" },
    { icon: AlertCircle, title: "Milestones", value: stats?.milestones_completed || 5, desc: "Objectives achieved", color: "bg-rose-500/10 border-rose-500/20 text-rose-600" },
    { icon: Briefcase, title: "Projects", value: "8", desc: "Personalized blueprints", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      const res = await api.search.query(query);
      setResults(res || []);
      setHasSearched(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-foreground tracking-tight mb-3 font-header text-5xl font-black">
              Learning <span className="text-primary">Dashboard.</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl text-lg">
              Precision-monitored metrics for your professional trajectory.
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search library, projects, FAQs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-medium"
            />
          </form>
        </div>

        {/* Search Results Overlay */}
        {hasSearched && (
          <div className="mb-16 animate-in fade-in zoom-in-95 duration-300 bg-card border border-border rounded-[2.5rem] p-10">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black">Search Results</h2>
               <button onClick={() => setHasSearched(false)} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline">
                 <X size={16} /> Clear Protocol
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {results.map((res, i) => (
                 <div key={i} onClick={() => navigate(res.path)} className="p-6 bg-muted/30 border border-transparent hover:border-border hover:bg-white rounded-2xl transition-all cursor-pointer group">
                    <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{res.title}</h4>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{res.type}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {summaryCards.map((card, idx) => (
            <div key={idx} className="bg-card border-2 border-border/60 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border group-hover:scale-110 transition-transform ${card.color}`}>
                <card.icon size={28} />
              </div>
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">{card.title}</h3>
              <p className="text-4xl font-black text-foreground mb-2">{card.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Resume Progress Chart */}
          <div className="bg-card border border-border rounded-[3rem] p-12 shadow-sm relative overflow-hidden group">
            <h3 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-4">
              <TrendingUp className="text-primary" /> Growth Vector
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resumeScoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '16px', color: '#F8FAFC', padding: '12px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--mapout-primary)" 
                    strokeWidth={5} 
                    dot={{ r: 6, fill: 'var(--mapout-primary)', strokeWidth: 3, stroke: '#FFFFFF' }}
                    activeDot={{ r: 9, fill: 'var(--mapout-primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-transparent italic text-sm text-muted-foreground font-medium">
               "Intelligence metrics show a 20-point increase in system alignment over 5 cycles."
            </div>
          </div>

          {/* Time Distribution Chart */}
          <div className="bg-card border border-border rounded-[3rem] p-12 shadow-sm relative overflow-hidden group">
            <h3 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-4">
               <PieChart className="text-primary" /> Resource Allocation
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeSpentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {timeSpentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '16px', color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
               {timeSpentData.map((d, i) => (
                 <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{d.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Skill Matrix Comparison */}
        <div className="bg-card border border-border rounded-[3rem] p-12 lg:p-16 shadow-sm mb-16">
          <div className="flex justify-between items-end mb-12">
             <div>
                <h3 className="text-3xl font-black mb-2 tracking-tight">Competency Matrix</h3>
                <p className="text-muted-foreground font-medium">Comparative analysis of current skillset vs. target benchmarks.</p>
             </div>
             <BarChart3 className="text-primary opacity-20" size={60} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {skillProgressData.map((skill, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-lg font-black tracking-tight">{skill.skill}</span>
                  <div className="text-right">
                     <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">{skill.progress}% Mastery</span>
                     <span className="text-[10px] text-muted-foreground font-bold">Target Index: {skill.target}%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                    style={{ width: `${skill.progress}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse"
                    style={{ left: `${skill.target}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Strategy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-primary text-white rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
              <h3 className="text-2xl font-black mb-10 tracking-tight">Autonomous Strategy</h3>
              <div className="space-y-6">
                 {[
                   { title: "Optimize Resume", path: "/resume-studio", desc: "Detected 4 missing technical keywords for target role." },
                   { title: "Sync Skill Node", path: "/career-planner", desc: "Docker & K8s mastery recommended for evolution." },
                   { title: "Execute Project", path: "/projects", desc: "New API Architecture blueprint aligned with current profile." }
                 ].map((act, i) => (
                   <div key={i} onClick={() => navigate(act.path)} className="p-6 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group/item">
                      <div className="flex justify-between items-center">
                         <div>
                            <h4 className="font-black text-lg mb-1">{act.title}</h4>
                            <p className="text-sm text-teal-50/70 font-medium">{act.desc}</p>
                         </div>
                         <ArrowRight className="group-hover/item:translate-x-2 transition-transform" size={20} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-card border border-border border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8 animate-bounce">
                 <Trophy size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">System Honor</h3>
              <p className="text-muted-foreground font-medium max-w-sm mb-10 leading-relaxed">
                 You are in the <span className="text-primary font-bold">top 5%</span> of active career architects this cycle. System performance is optimal.
              </p>
              <button onClick={() => navigate("/profile")} className="text-primary font-black text-[12px] uppercase tracking-widest underline decoration-2 underline-offset-8 hover:text-foreground transition-colors">
                 View Detailed Governance
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
