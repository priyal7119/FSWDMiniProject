import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileCheck, Award, AlertCircle, Briefcase, Search as SearchIcon, X, ExternalLink, TrendingUp, Calendar, Target, BarChart3, Lightbulb, Trophy, GraduationCap, Zap, BookOpen, MapPin, Tag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { searchContent } from "@/utils/searchService";
import { getStats } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";

const skillData = [
  { skill: "JavaScript", progress: 85 },
  { skill: "React", progress: 75 },
  { skill: "Python", progress: 60 },
  { skill: "SQL", progress: 50 },
];

const skillProgressData = [
  { skill: "React", progress: 85, target: 90 },
  { skill: "JavaScript", progress: 90, target: 95 },
  { skill: "Python", progress: 65, target: 80 },
  { skill: "SQL", progress: 70, target: 85 },
  { skill: "TypeScript", progress: 60, target: 85 },
];

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
  { name: "Interview FAQs", value: 15 },
  { name: "Research Guide", value: 10 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const activityStats = [
  { label: "Total Time Spent", value: "26 hrs", icon: Calendar, color: "bg-blue-50 dark:bg-blue-900/10" },
  { label: "Skills Learned", value: "12", icon: Award, color: "bg-green-50 dark:bg-green-900/10" },
  { label: "Projects Completed", value: "5", icon: Target, color: "bg-purple-50 dark:bg-purple-900/10" },
  { label: "Interviews Prepared", value: "8", icon: TrendingUp, color: "bg-orange-50 dark:bg-orange-900/10" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [contentType, setContentType] = useState("all");
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
        console.log("Dashboard stats:", data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        toastError(err.message || "Failed to sync your dashboard.");
        // Use mock data as fallback
        setStats({
          skills_learned: 12,
          milestones_completed: 5,
          resume_score: 85
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);
  const summaryCards = stats ? [
    {
      icon: FileCheck,
      title: "Resume Score",
      value: `${stats.resume_score}/100`,
      description: "Your resume performance",
      color: "bg-[var(--mapout-accent)]",
    },
    {
      icon: Award,
      title: "Skills Learned",
      value: stats.skills_learned,
      description: "Skills mastered",
      color: "bg-[var(--mapout-mint)]",
    },
    {
      icon: AlertCircle,
      title: "Milestones Completed",
      value: stats.milestones_completed,
      description: "Career milestones achieved",
      color: "bg-[var(--mapout-pink)]",
    },
    {
      icon: Briefcase,
      title: "Recommended Projects",
      value: "8",
      description: "Projects matching your profile",
      color: "bg-[var(--mapout-accent)]",
    },
  ] : [];

  const guestSummaryCards = [
    {
      icon: FileCheck,
      title: "Resume Score",
      value: "--",
      description: "Track your resume performance",
      color: "bg-gray-100",
    },
    {
      icon: Award,
      title: "Skills Learned",
      value: "--",
      description: "Monitor your skill development",
      color: "bg-gray-100",
    },
    {
      icon: AlertCircle,
      title: "Missing Skills",
      value: "--",
      description: "Identify gaps in your knowledge",
      color: "bg-gray-100",
    },
    {
      icon: Briefcase,
      title: "Recommended Projects",
      value: "--",
      description: "Get personalized project suggestions",
      color: "bg-gray-100",
    },
  ];

  const activities = [
    {
      title: "Recent Resume Analysis",
      description: "Your resume has strong technical keywords. Consider adding more quantifiable achievements.",
      color: "bg-blue-50",
      path: "/resume-studio",
    },
    {
      title: "Recommended Skill to Learn",
      description: "Docker and Kubernetes are highly valued for your target role as a Backend Developer.",
      color: "bg-purple-50",
      path: "/career-planner",
    },
    {
      title: "Suggested Project",
      description: "Build a RESTful API with authentication using Node.js and PostgreSQL.",
      color: "bg-green-50",
      path: "/projects",
    },
  ];

  const guestActivities = [
    {
      title: "Track Your Progress",
      description: "Get detailed insights into your resume strength and areas for improvement.",
      color: "bg-blue-50",
      path: "/resume-studio",
    },
    {
      title: "Skill Development",
      description: "Discover which skills you need to learn for your dream career.",
      color: "bg-purple-50",
      path: "/career-planner",
    },
    {
      title: "Project Recommendations",
      description: "Receive personalized project ideas that match your career goals.",
      color: "bg-green-50",
      path: "/projects",
    },
  ];

  const currentSummaryCards = isLoggedIn ? summaryCards : guestSummaryCards;
  const currentActivities = isLoggedIn ? activities : guestActivities;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const searchResults = searchContent(query, contentType);
      setResults(searchResults);
      setHasSearched(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      project: "bg-blue-100 text-blue-700",
      course: "bg-purple-100 text-purple-700",
      faq: "bg-orange-100 text-orange-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getTypeIcon = (type) => {
    const icons = {
      project: <Briefcase size={20} className="text-blue-600" />,
      course: <BookOpen size={20} className="text-purple-600" />,
      faq: <SearchIcon size={20} className="text-orange-600" />,
    };
    return icons[type] || <FileCheck size={20} className="text-gray-600" />;
  };
  
  return (
    <div className="min-h-screen bg-[var(--mapout-bg)]">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        {/* Greeting */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--mapout-primary)] dark:text-blue-400">
            My Learning Dashboard
          </h1>
          {!isLoggedIn && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 font-medium">
              {t('dashboardSubheading', language)}
            </p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {currentSummaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="glass dark:bg-slate-800/40 rounded-xl p-6 shadow-sm hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 ease-out border border-gray-100 dark:border-white/5 group relative overflow-hidden">
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className="text-[var(--mapout-primary)]" size={24} />
                </div>
                <h3 className="mb-2 font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-[var(--mapout-primary)] dark:text-blue-400 mb-1">{card.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
              </div>
            );
          })}
        </div>



        {/* Analytics Section */}
        {isLoggedIn && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Analytics & Progress
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {activityStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`${stat.color} dark:bg-slate-800/40 rounded-xl p-6 shadow-sm border border-transparent dark:border-white/5 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 ease-out`}>
                    <Icon size={24} className="text-[var(--mapout-primary)] dark:text-blue-400 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-[var(--mapout-primary)] dark:text-gray-100">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Resume Score Progress */}
              <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 shadow-md border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Resume Score Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={resumeScoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--mapout-secondary)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--mapout-secondary)', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                  <TrendingUp size={16} className="inline mr-1 text-green-500" />
                  Your resume score has improved by 20 points in 5 months!
                </p>
              </div>

              {/* Time Spent Distribution */}
              <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 shadow-md border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Time Spent by Feature</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={timeSpentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {timeSpentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills Progress */}
            <div className="bg-white dark:bg-slate-900 rounded-[10px] p-8 shadow-md mb-8 border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white">Skill Progress Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {skillProgressData.map((skill, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between mb-3">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{skill.skill}</span>
                      <span className="text-sm font-bold text-[var(--mapout-secondary)] dark:text-blue-400">{skill.progress}% <span className="text-gray-400 font-medium">/ {skill.target}%</span></span>
                    </div>
                    <div className="relative h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 group-hover:brightness-110"
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                      <div
                        className="absolute h-full top-0 w-[2px] bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        style={{ left: `${skill.target}%` }}
                        aria-label={`Target: ${skill.target}%`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center font-medium italic">
                <BarChart3 size={16} className="inline mr-2 text-blue-500" />
                Performance metrics indicate you are pacing 12% faster than last quarter.
              </p>
            </div>

            {/* Goals & Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 shadow-md border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Upcoming Goals</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-white/10" aria-label="Learn Docker" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Learn Docker & Kubernetes</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Due in 2 weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-white/10" aria-label="Build portfolio" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Build 2 Full-Stack Projects</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Due in 1 month</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-purple-600 rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-white/10" aria-label="Interview prep" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Complete 50 Interview Questions</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Due in 3 weeks</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 shadow-md border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Recent Achievements <Trophy size={20} className="inline ml-2 text-yellow-500" /></h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                    <GraduationCap size={20} className="text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">5-Point Improvement</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Resume +5 points this week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
                    <Zap size={20} className="text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Skill Master</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">JavaScript at 90% proficiency</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                    <Lightbulb size={20} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Consistent Learner</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">26 hours spent this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Progress Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-[10px] p-8 shadow-md border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <h3 className="mb-8 font-bold text-xl tracking-tight text-gray-800 dark:text-white">
                Skill Proficiency Histogram
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={skillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="skill" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Bar dataKey="progress" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}