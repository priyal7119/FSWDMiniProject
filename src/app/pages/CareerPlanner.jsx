import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Briefcase, GraduationCap, Search, CheckCircle, 
  ChevronDown, ArrowRight, Target, Zap, Check, X, 
  TrendingUp, Award, Map, Lightbulb, PlayCircle, BookMarked, Calendar, LayoutDashboard, Clock, User,
  BookOpen, FileText, Globe, Rocket, Compass, ChevronRight
} from "lucide-react";
import { getRoadmap, setRoadmap, getMilestones, toggleMilestone, addMilestone } from "../utils/api.js";
import { useToast } from "../components/Toast.jsx";

export function CareerPlanner() {
  const navigate = useNavigate();
  const { info, success, warning } = useToast();
  const token = localStorage.getItem("token");

  // Global Constants
  const roles = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer", 
    "Data Scientist", "AI/ML Engineer", "DevOps Engineer", "UI/UX Designer", "Cybersecurity"
  ];

  // State Management
  const [activeStep, setActiveStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [roadmapData, setRoadmapData] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab states
  const [activeGateTab, setActiveGateTab] = useState("study_plan");
  const [expandedYear, setExpandedYear] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roleSkills, setRoleSkills] = useState([]);

  // Scroll references
  const customizeRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const initData = async () => {
      try {
        setLoading(true);
        const [roadmap, milestones, skills] = await Promise.all([
          getRoadmap(),
          getMilestones(),
          getSkills()
        ]);

        setUserSkills(skills?.map(s => s.skill_name.toLowerCase()) || []);

        if (roadmap) {
          setSelectedPath(roadmap.selected_path);
          setSelectedRole(roadmap.target_role || "Frontend Developer");
          if (roadmap.selected_path) {
             setActiveStep(2);
             updateRoleSkills(roadmap.target_role || "Frontend Developer");
          }
        }
        setRoadmapData(milestones || []);
      } catch (err) {
        console.error("Error initializing planner:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [token]);

  const updateRoleSkills = (role) => {
    // Simulated role-based skill requirements
    const toolkit = {
      "Frontend Developer": ["React & Next.js", "TypeScript", "Tailwind CSS", "State Management (Redux/Zustand)", "Browser APIs"],
      "Backend Developer": ["Node.js / Go", "PostgreSQL", "Redis", "Docker & K8s", "REST/GraphQL Design"],
      "Full Stack Developer": ["React", "Express", "Supabase", "System Architecture", "Deployment Pipelines"],
      "Data Scientist": ["Python (Pandas/NumPy)", "Scikit-Learn", "SQL", "Statistics", "Data Visualization"],
      "AI/ML Engineer": ["PyTorch/TensorFlow", "Math for ML", "MLOps", "LLM Fine-tuning", "Transformers"],
    };
    setRoleSkills(toolkit[role] || toolkit["Frontend Developer"]);
  };
  const handlePathSelect = async (pathId) => {
    try {
      setIsGenerating(true);
      setSelectedPath(pathId);
      setActiveStep(2);
      setShowProgress(false);
      
      // Persist to Supabase and Seed Milestones
      await setRoadmap({ selected_path: pathId, target_role: selectedRole });
      
      const updatedMilestones = await getMilestones();
      setRoadmapData(updatedMilestones);
      
      setTimeout(() => {
        customizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        info(`Path Saved: ${pathId.replace('_', ' ').toUpperCase()}`);
        setIsGenerating(false);
      }, 500);
    } catch (err) {
      setIsGenerating(false);
      warning("Failed to save path selection.");
    }
  };

  const handleRoleChange = async (role) => {
    setSelectedRole(role);
    updateRoleSkills(role);
    try {
      await setRoadmap({ selected_path: selectedPath, target_role: role });
      success(`Target role set to ${role}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await toggleMilestone(id, newStatus);
      const updated = await getMilestones();
      setRoadmapData(updated);
      success("Progress updated.");
    } catch (err) {
      warning("Failed to update milestone.");
    }
  };

  const handleCheckProgress = () => {
    setShowProgress(true);
    setActiveStep(3);
    
    setTimeout(() => {
      progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      success("Career progress loaded securely.");
    }, 150);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300" style={{ scrollBehavior: 'smooth' }}>
      
      {/* GENERATING OVERLAY */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-[#0A192F]/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            <Rocket className="absolute inset-0 m-auto text-blue-400 animate-bounce" size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-widest uppercase mb-2">Architecting Roadmap</h2>
          <p className="text-blue-200/70 font-medium">Syncing specialized milestones to your profile...</p>
        </div>
      )}
      
      {/* 1. STICKY HEADER PROGRESS */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#0A192F] to-[#00B4D8] p-2 rounded-lg shadow-md">
              <Map className="text-white" size={20} />
            </div>
            <span className="font-bold text-[#0A192F] dark:text-white text-xl tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>MapOut Planner</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className={`flex items-center gap-2 transition-colors duration-300 ${activeStep >= 1 ? 'text-[#0A192F]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${activeStep >= 1 ? 'bg-[#00B4D8] text-white shadow-cyan-500/30' : 'bg-gray-100 text-gray-400'}`}>1</div>
              <span className="font-semibold text-[15px]">Choose Path</span>
            </div>
            <div className={`w-12 h-[3px] rounded-full transition-colors duration-500 ${activeStep >= 2 ? 'bg-[#00B4D8]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 transition-colors duration-300 ${activeStep >= 2 ? 'text-[#0A192F] dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${activeStep >= 2 ? 'bg-[#0A192F] text-white shadow-blue-900/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600'}`}>2</div>
              <span className="font-semibold text-[15px]">Customize</span>
            </div>
            <div className={`w-12 h-[3px] rounded-full transition-colors duration-500 ${activeStep >= 3 ? 'bg-[#0A192F]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 transition-colors duration-300 ${activeStep >= 3 ? 'text-[#0A192F] dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${activeStep >= 3 ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600'}`}>3</div>
              <span className="font-semibold text-[15px]">Track Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <div className="bg-gradient-to-br from-[#0A192F] via-[#0f2a4f] to-[#00B4D8] animate-mesh text-white py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Plan Your Career Path with <span className="text-[#00B4D8]">Confidence</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Choose your trajectory and get a highly personalized roadmap, skill analysis, and dynamic progress tracking.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 500, behavior: 'smooth'})}
            className="px-10 py-5 bg-white text-[#0A192F] font-bold rounded-full hover:bg-cyan-50 hover:shadow-[0_0_30px_rgba(0,180,216,0.3)] transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 mx-auto text-lg"
          >
            Start Your Journey <ArrowRight size={22} className="text-[#00B4D8]" />
          </button>
        </div>
        
        {/* Subtle Decorative Gradient Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00B4D8] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>
      </div>

      {/* 3. PATH SELECTION BOXES */}
      <div className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A192F] dark:text-white mb-4 tracking-tight">Choose Your Destination</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Select a track below to instantly generate your custom roadmap and analytics wrapper without reloading the page.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'industry', icon: Briefcase, title: 'Industry Jobs', desc: 'Join companies as a software developer, data engineer, or specialist.' },
            { id: 'higher_studies', icon: GraduationCap, title: 'Higher Studies', desc: 'Pursue advanced degrees, target GATE, and contribute to research.' },
            { id: 'exploring', icon: Search, title: 'Still Exploring', desc: 'Take time to explore broad domains, varied internships, and projects.' }
          ].map((path) => {
            const Icon = path.icon;
            const isSelected = selectedPath === path.id;
            
            return (
              <div 
                key={path.id}
                onClick={() => handlePathSelect(path.id)}
                className={`cursor-pointer rounded-2xl p-10 transition-all duration-300 ease-in-out transform hover:-translate-y-2 group ${
                  isSelected 
                    ? 'border-2 border-[#00B4D8] bg-white dark:bg-slate-900 shadow-[0_20px_40px_rgba(0,180,216,0.15)] ring-4 ring-[#00B4D8]/10' 
                    : 'border border-gray-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl hover:border-[#00B4D8]/30'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${isSelected ? 'bg-gradient-to-br from-[#0A192F] to-[#00B4D8] text-white shadow-lg shadow-[#00B4D8]/30 scale-110' : 'bg-gray-50 text-[#00B4D8] group-hover:bg-[#00B4D8]/10'}`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{path.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{path.desc}</p>
                
                <div className={`mt-8 overflow-hidden transition-all duration-300 ${isSelected ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex items-center text-[#00B4D8] font-bold text-[15px] bg-[#00B4D8]/5 p-3 rounded-lg border border-[#00B4D8]/10">
                    <CheckCircle size={18} className="mr-2" /> Selected Track Active
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 4. DYNAMIC SECTION: INDUSTRY JOBS FLOW */}
      {/* ========================================================== */}
      {selectedPath === 'industry' && (
        <div ref={customizeRef} className="bg-white dark:bg-slate-900 py-20 border-t border-gray-100 dark:border-white/5 shadow-sm relative">
          <div className="max-w-[1440px] mx-auto px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="text-center mb-16">
              <span className="text-[#00B4D8] font-bold tracking-widest uppercase text-sm mb-2 block">Step 2: Customize</span>
              <h2 className="text-4xl font-bold text-[#0A192F] dark:text-white mb-4 tracking-tight">Role Architecture</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Select your target industry role to dynamically shift the roadmap and gap analysis vectors mapping exactly to your desired job.</p>
            </div>

            {/* Role Chips */}
            <div className="flex flex-wrap justify-center gap-4 mb-20">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`px-8 py-4 rounded-full text-[15px] font-bold transition-all duration-300 shadow-sm ${
                    selectedRole === role 
                      ? 'bg-[#0A192F] text-white shadow-lg shadow-[#0A192F]/20 scale-105 border border-[#0A192F]' 
                      : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-[#00B4D8] hover:text-[#00B4D8] hover:bg-cyan-50/30'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Two Column Layout: Skills & Roadmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              
              {/* Box A: Timeline Stepper */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-[24px] p-10 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <TrendingUp size={200} />
                </div>
                 <h3 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-10 flex items-center gap-3 relative z-10 tracking-tight">
                  <TrendingUp className="text-[#00B4D8]" size={28} /> 4-Year Academic Path
                </h3>
                
                <div className="space-y-2 pl-4 border-l-2 border-gray-200 ml-4 relative z-10">
                  {[
                    { year: 'Year 1', title: 'Fundementals & DSA', desc: 'Focus strictly on core programming syntax in C++ or Python. Master standard algorithms and fundamental data structures to ace future OAs.' },
                    { year: 'Year 2', title: 'Core Frameworks', desc: 'Shift deeply into web frameworks (React/Node) or data libraries. Execute 2 substantial personal projects deployed to product-grade.' },
                    { year: 'Year 3', title: 'Internships & Networking', desc: 'Secure an industry internship. Begin contributing heavily to massive open-source bases. Double down on specific domains.' },
                    { year: 'Year 4', title: 'Placement Preparation', desc: 'Refine CV, master system design principles, and schedule 10+ mock interviews with platform agents or peers.' }
                  ].map((step, idx) => (
                    <div key={idx} className="relative pl-8 pb-4">
                      {/* Node circle */}
                      <div className="absolute -left-[45px] top-1 w-7 h-7 rounded-full bg-white border-4 border-[#00B4D8] shadow-md z-20"></div>
                      
                      <button 
                        onClick={() => setExpandedYear(expandedYear === idx ? null : idx)}
                        className="w-full text-left bg-white hover:bg-cyan-50/50 p-6 rounded-2xl transition-all duration-300 border border-gray-100 shadow-sm focus:outline-none group"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest">{step.year}</span>
                          <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${expandedYear === idx ? 'rotate-180 bg-[#00B4D8]/10 text-[#00B4D8]' : 'group-hover:bg-gray-100'}`}>
                            <ChevronDown size={18} className="text-gray-500" />
                          </div>
                        </div>
                        <h4 className="font-bold text-[#0A192F] dark:text-white text-lg">{step.title}</h4>
                        
                        <div className={`overflow-hidden transition-all duration-400 ease-in-out ${expandedYear === idx ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                          <p className="text-[15px] text-gray-600 border-t border-gray-100 pt-4 leading-relaxed">{step.desc}</p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box B: Skill Gap Split View */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-10 border border-gray-200 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none relative">
                <h3 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-10 flex items-center gap-3 tracking-tight">
                  <Target className="text-[#0A192F] dark:text-blue-400" size={28} /> Skill Gap Analysis <span className="text-sm font-medium bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 block sm:inline mt-2 sm:mt-0 ml-auto border border-gray-200 dark:border-white/10">{selectedRole}</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
                  {/* Decorative divider for desktop */}
                  <div className="hidden sm:block absolute left-1/2 top-4 bottom-4 w-[1px] bg-gray-100 dark:bg-white/5 transform -translate-x-1/2"></div>
                  
                  {/* Required Column */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-widest mb-6 border-b border-gray-100 dark:border-white/5 pb-3 flex items-center gap-2">
                      <LayoutDashboard size={16} className="text-[#0A192F] dark:text-blue-400" /> Required Toolkit
                    </h4>
                    {roleSkills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent">
                        <div className="w-2 h-2 rounded-full bg-[#0A192F] dark:bg-blue-400 shadow-sm"></div>
                        <span className="text-[14px] font-semibold text-[#0A192F] dark:text-white">{skill}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-widest mb-6 border-b border-gray-100 dark:border-white/5 pb-3 flex items-center gap-2">
                      <User size={16} className="text-[#00B4D8]" /> Match Stats
                    </h4>
                    {roleSkills.map((skill, i) => {
                      const isMastered = userSkills.includes(skill.toLowerCase());
                      return (
                        <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border transition-transform hover:scale-[1.02] ${isMastered ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200'}`}>
                          <div className="p-1 bg-white dark:bg-slate-800 rounded-md shadow-sm opacity-80">
                            {isMastered ? <Check size={14} /> : <X size={14} />}
                          </div>
                          <span className="text-[14px] font-bold">{isMastered ? 'Mastered' : 'Missing'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Check Progress Trigger */}
            <div className="text-center pt-8 border-t border-gray-100">
              <button 
                onClick={handleCheckProgress}
                className="px-12 py-5 bg-[#0A192F] text-white font-bold text-lg rounded-full hover:bg-blue-900 transition-all shadow-[0_10px_30px_rgba(10,25,47,0.2)] hover:shadow-[0_15px_40px_rgba(10,25,47,0.3)] hover:-translate-y-1 inline-flex items-center gap-3"
              >
                <Award size={24} className="text-[#00B4D8]" /> Check Career Progress
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. DYNAMIC SECTION: HIGHER STUDIES FLOW */}
      {/* ========================================================== */}
      {selectedPath === 'higher_studies' && (
        <div ref={customizeRef} className="bg-white dark:bg-slate-900 py-20 border-t border-gray-100 dark:border-white/5 shadow-sm relative">
          <div className="max-w-[1440px] mx-auto px-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
            
            <div className="text-center mb-16">
               <span className="text-[#00B4D8] font-bold tracking-widest uppercase text-sm mb-2 block">Step 2: Customize</span>
              <h2 className="text-4xl font-bold text-[#0A192F] dark:text-white mb-4 tracking-tight">GATE & Academic Prep</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">Access highly curated study materials, structured mock exams, and academic optimization playbooks required for tier-1 admissions.</p>
            </div>

            {/* Tabs Controller */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 dark:bg-slate-800 p-2 rounded-2xl flex gap-2 border dark:border-white/5">
                {[
                  { id: 'study_plan', icon: Calendar, label: 'Study Timeline' },
                  { id: 'resources', icon: BookMarked, label: 'Core Resources' },
                  { id: 'mocks', icon: CheckCircle, label: 'Mock Exams' }
                ].map((tab) => (
                   <button
                    key={tab.id}
                    onClick={() => setActiveGateTab(tab.id)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[15px] transition-all duration-300 ${
                      activeGateTab === tab.id 
                        ? 'bg-white text-[#0A192F] shadow-md border border-gray-200' 
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                    }`}
                  >
                    <tab.icon size={18} className={activeGateTab === tab.id ? "text-[#00B4D8]" : ""} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Views */}
            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-[24px] p-10 min-h-[400px]">
              {activeGateTab === 'study_plan' && (
                <div className="animate-in fade-in duration-500">
                  <h3 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-8 border-b dark:border-white/5 pb-4">6-Month Optimal Study Plan</h3>
                  <div className="space-y-6">
                    {['Month 1: Deep dive Engineering Math & Aptitude', 'Month 2-3: Core Operating Systems & DBMS Concepts', 'Month 4: DSA and Theory of Computation', 'Month 5: Full Mock test series iteration and metric tracking', 'Month 6: Only revisions and previous year paper destruction cycle'].map((plan, i) => (
                       <div key={i} className="flex gap-4 items-center bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-[#00B4D8] font-bold rounded-lg flex items-center justify-center flex-shrink-0">M{i+1}</div>
                         <p className="font-medium text-gray-800 dark:text-gray-200 text-[15px]">{plan}</p>
                       </div>
                    ))}
                  </div>
                </div>
              )}

              {activeGateTab === 'resources' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                   {[
                    { type: 'Video Series', title: 'Advanced OS Lectures', icon: PlayCircle },
                    { type: 'Textbook', title: 'Cormen: Algorithms', icon: BookOpen },
                    { type: 'Notes', title: 'Topper DBMS Summary', icon: FileText }
                   ].map((res, i) => (
                     <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                        <res.icon size={32} className="text-[#00B4D8] flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{res.type}</p>
                          <h4 className="font-bold text-[#0A192F] text-lg">{res.title}</h4>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {activeGateTab === 'mocks' && (
                 <div className="animate-in fade-in duration-500 text-center py-20">
                    <CheckCircle size={64} className="text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-[#0A192F] mb-4">Mocks Portal Integration</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">Full-length timed assessments will automatically unlock once you clear Phase 1 of the timeline.</p>
                    <button className="px-8 py-3 bg-[#0A192F] text-white font-bold rounded-full opacity-50 cursor-not-allowed">Locked Phase</button>
                 </div>
              )}
            </div>

            {/* Exam Tips Grid */}
            <div className="mt-20">
              <h3 className="text-3xl font-bold text-[#0A192F] mb-8 text-center tracking-tight">High-Yield Examination Principles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Pomodoro Revision", desc: "Enforce strict 50-minute blocks of intense focus followed by 10-minute pure breaks." },
                  { title: "Error Logging", desc: "Maintain a strict notebook of every incorrectly answered mock question to review weekly." },
                  { title: "Formula Mapping", desc: "Create visual mind-maps for heavily numerical topics and review them every single morning." }
                ].map((tip, i) => (
                  <div key={i} className="bg-gradient-to-br from-[#0A192F] to-[#0f2a4f] p-8 rounded-2xl text-white transform transition hover:-translate-y-1 hover:shadow-xl">
                     <Lightbulb className="text-[#00B4D8] mb-6" size={32} />
                     <h4 className="font-bold text-xl mb-3">{tip.title}</h4>
                     <p className="text-blue-100/70 text-sm leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-16 pt-8 border-t border-gray-100">
               <button 
                onClick={handleCheckProgress}
                className="px-12 py-5 bg-[#00B4D8] hover:bg-cyan-600 text-white font-bold text-lg rounded-full transition-all shadow-[0_10px_30px_rgba(0,180,216,0.2)] hover:shadow-[0_15px_40px_rgba(0,180,216,0.4)] animate-pulse-slow"
              >
                Track Academic Readiness
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. DYNAMIC SECTION: STILL EXPLORING FLOW */}
      {/* ========================================================== */}
      {selectedPath === 'exploring' && (
        <div ref={customizeRef} className="bg-white dark:bg-slate-900 py-20 border-t border-gray-100 dark:border-white/5 shadow-sm relative">
          <div className="max-w-[1440px] mx-auto px-6 relative z-10 animate-in fade-in slide-in-from-right-8 duration-600">
            
            <div className="text-center mb-16">
               <span className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-2 block">Step 2: Exploration Mode</span>
              <h2 className="text-4xl font-bold text-[#0A192F] dark:text-white mb-4 tracking-tight">Broad Spectrum Discovery</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">Not ready to specialize? No problem. MapOut helps you build a versatile core that keeps all your high-value opportunities open.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
               {/* Strategy A: The T-Shaped Foundation */}
               <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-10 rounded-[32px] border border-indigo-100 dark:border-indigo-500/10">
                  <Globe className="text-indigo-600 dark:text-indigo-400 mb-6" size={40} />
                  <h3 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-6">The T-Shaped Strategy</h3>
                  <div className="space-y-4">
                    {[
                      { point: 'Broad Core', desc: 'Master universal logic (DSA, OS, Networking) that powers 100% of tech roles.' },
                      { point: 'Mini-Specializations', desc: 'Trial 3 different domains (Web, AI, Mobile) for 2 months each.' },
                      { point: 'Portfolio Buffet', desc: 'Build 1 project per domain to see which "click" with your flow state.' }
                    ].map((p, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center flex-shrink-0 text-indigo-700 dark:text-white font-bold text-xs">{i+1}</div>
                        <div>
                          <p className="font-bold text-[#0A192F] dark:text-white text-sm">{p.point}</p>
                          <p className="text-gray-500 text-xs mt-1">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Strategy B: Industry Immersion */}
               <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-10 rounded-[32px] border border-emerald-100 dark:border-emerald-500/10">
                  <Rocket className="text-emerald-600 dark:text-emerald-400 mb-6" size={40} />
                  <h3 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-6">Industry Immersion</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-8">
                    Gain exposure without commitment by participating in high-velocity external events.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     {['Hackathons', 'Open Source', 'Tech Meetups', 'Job Shadowing'].map((evt, i) => (
                       <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-500/10 text-center font-bold text-sm text-emerald-700 dark:text-emerald-400 transition-hover hover:shadow-md">
                          {evt}
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="text-center pt-8 border-t border-gray-100 dark:border-white/5">
               <button 
                onClick={handleCheckProgress}
                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full transition-all shadow-[0_10px_30px_rgba(79,70,229,0.2)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.4)]"
              >
                Begin Core Exposure Path
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. TRACK PROGRESS FOOTER PANEL (Rendered on Button Click) */}
      {/* ========================================================== */}
      {showProgress && activeStep === 3 && (
        <div ref={progressRef} className="bg-gray-900 text-white py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00B4D8] to-transparent opacity-50"></div>
          
          <div className="max-w-[1440px] mx-auto px-6 relative z-10 animate-in slide-in-from-bottom-16 fade-in duration-700">
             <div className="text-center mb-16">
               <span className="text-[#00B4D8] font-bold tracking-widest uppercase text-sm mb-2 block">Step 3: Verification</span>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Live Action Matrix</h2>
              <p className="text-gray-400/90 text-lg max-w-2xl mx-auto">Your continuous tracking hub detailing unlocked achievement nodes and live completion metrics based on platform activity.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-10 lg:p-14">
              
              {/* Big Progress */}
              <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-10">
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h4 className="text-xl font-bold">Overall Alignment</h4>
                      <p className="text-gray-400 text-sm">Targeting {selectedPath.replace('_',' ')} mastery</p>
                    </div>
                    <span className="text-5xl font-extrabold text-[#00B4D8]">32<span className="text-2xl text-gray-500">%</span></span>
                  </div>
                  <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-[#00B4D8] rounded-full w-[32%] relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 animate-slide"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="bg-gray-900 border border-gray-700 p-4 rounded-2xl text-center">
                       <Clock size={24} className="text-gray-400 mx-auto mb-2" />
                       <div className="font-bold text-2xl">14</div>
                       <div className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mt-1">Days Streak</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 p-4 rounded-2xl text-center">
                       <Award size={24} className="text-yellow-500 mx-auto mb-2" />
                       <div className="font-bold text-2xl">4</div>
                       <div className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mt-1">Badges</div>
                    </div>
                </div>
              </div>

              {/* Timeline Nodes */}
              <div className="relative pt-10 pb-4">
                  <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gray-700 transform md:-translate-x-1/2"></div>
                  
                  {roadmapData.length > 0 ? roadmapData.map((block, i) => (
                    <div key={i} className={`relative flex items-center justify-between md:justify-normal w-full mb-12 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="hidden md:block md:w-5/12"></div>
                      
                      {/* Node circle wrapper exactly on center line */}
                      <div className="absolute left-6 md:left-1/2 w-8 h-8 transform -translate-x-1/2 flex items-center justify-center z-10 cursor-pointer" onClick={() => handleToggleMilestone(block.id, block.status)}>
                        {block.status === 'completed' && <div className="w-8 h-8 rounded-full bg-green-500 border-4 border-gray-800 flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                        {block.status === 'pending' && <div className="w-8 h-8 rounded-full bg-[#00B4D8] border-4 border-gray-800 shadow-[0_0_15px_#00B4D8] animate-pulse"></div>}
                        {block.status === 'locked' && <div className="w-6 h-6 rounded-full bg-gray-700 border-4 border-gray-800"></div>}
                      </div>

                      {/* Card block */}
                      <div className={`w-full pl-20 pr-4 md:w-5/12 ${i % 2 !== 0 ? 'md:pl-0 md:pr-12 md:text-right' : 'md:pr-0 md:pl-12 md:text-left'}`}>
                        <div 
                          onClick={() => handleToggleMilestone(block.id, block.status)}
                          className={`p-6 rounded-2xl border cursor-pointer transition-all ${block.status === 'pending' ? 'bg-[#0A192F] border-[#00B4D8] shadow-lg shadow-cyan-900/20' : block.status === 'completed' ? 'bg-gray-800 border-gray-700 opacity-80 scale-95' : 'bg-gray-900/50 border-gray-800 opacity-50'}`}
                        >
                           <p className="font-bold text-lg mb-2">{block.title}</p>
                           <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest ${block.status === 'pending' ? 'bg-[#00B4D8]/20 text-[#00B4D8]' : 'bg-gray-700 text-gray-400'}`}>{block.category}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No milestones tracked yet. Complete your profile to get started!</p>
                      <button 
                        onClick={() => handleToggleMilestone('initial', 'pending')} 
                        className="mt-4 text-[#00B4D8] font-bold border border-[#00B4D8] px-4 py-2 rounded-lg"
                      >
                        Generate Initial Roadmap
                      </button>
                    </div>
                  )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 7. GLOBAL TIPS FOR SUCCESS (Always Visible Footer UI) */}
      {/* ========================================================== */}
      <div className="max-w-[1440px] mx-auto px-6 pt-24 pb-12">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-white/5 rounded-[32px] p-10 md:p-14 shadow-xl">
           <h3 className="text-3xl font-bold text-[#0A192F] dark:text-white mb-10 flex items-center gap-4 tracking-tight">
              <Lightbulb className="text-yellow-500" size={36} /> Universal Intelligence Log
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'The 1% Rule', desc: 'Improve computationally by 1% daily. Compounding returns in software design are exponential.' },
                { title: 'Learn In Public', desc: 'Deploy garbage architectures online. Collect savage feedback. Iterate aggressively.' },
                { title: 'Deep Work Modes', desc: 'Write logic strictly in 90-minute blocks without active network connections.' },
                { title: 'Agentic Scaling', desc: 'Embrace AI tooling. Those who harness LLMs will out-scale standard developers 10-to-1.' }
              ].map((tip, i) => (
                <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-gray-100 dark:border-white/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                   <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/40 rounded-full flex items-center justify-center mb-4"><Zap size={20} className="text-yellow-600 dark:text-yellow-400" /></div>
                   <h4 className="font-bold text-[#0A192F] dark:text-white mb-2">{tip.title}</h4>
                   <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

    </div>
  );
}
