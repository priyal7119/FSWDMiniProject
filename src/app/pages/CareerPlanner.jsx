import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Briefcase, GraduationCap, Search, CheckCircle, 
  ChevronDown, ArrowRight, Target, Zap, Check, X, 
  TrendingUp, Award, Map, Lightbulb, PlayCircle, BookMarked, Calendar, LayoutDashboard, Clock, User,
  BookOpen, FileText, Globe, Rocket, Compass, ChevronRight
} from "lucide-react";
import { getRoadmap, setRoadmap, getMilestones, toggleMilestone, addMilestone, getSkills, getRoadmapPhases } from "../utils/api.js";
import { useToast } from "../components/Toast.jsx";
import { jsPDF } from "jspdf";

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
  const [roadmapPhases, setRoadmapPhases] = useState([]);

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
        const [roadmap, milestones, skills, phases] = await Promise.all([
          getRoadmap(),
          getMilestones(),
          getSkills(),
          getRoadmapPhases()
        ]);

        setUserSkills(skills?.map(s => s.skill_name.toLowerCase()) || []);
        setRoadmapPhases(phases || []);

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

  const updateRoleSkills = async (role) => {
    try {
      // Logic for role requirements
      setRoleSkills(["Logic Architecture", "System Design", "Advanced Protocols", "Scaling", "Security"]);
    } catch (err) {
      console.error("Error fetching role skills:", err);
      setRoleSkills(["Logic Architecture", "System Design"]);
    }
  };

  const handleDownloadRoadmap = () => {
    try {
      info("Generating your personalized roadmap...");
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("MAPOUT CAREER ROADMAP", 20, 25);
      
      doc.setFontSize(14);
      doc.text(`Target Role: ${selectedRole}`, 20, 40);
      doc.text(`Path: ${selectedPath?.replace('_', ' ').toUpperCase() || 'General'}`, 20, 50);
      
      doc.setDrawColor(20, 184, 166);
      doc.line(20, 55, 190, 55);
      
      let y = 70;
      doc.setFontSize(12);
      doc.text("CORE MILESTONES:", 20, y);
      y += 10;
      
      doc.setFont("helvetica", "normal");
      roadmapData.forEach((m, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const status = m.status === 'completed' ? '[DONE]' : '[PENDING]';
        doc.text(`${i + 1}. ${status} ${m.title} (${m.category})`, 25, y);
        y += 8;
      });
      
      doc.save(`mapout_roadmap_${selectedRole.toLowerCase().replace(' ', '_')}.pdf`);
      success("Roadmap downloaded successfully!");
    } catch (err) {
      warning("Failed to generate PDF. Please try again.");
    }
  };

  const handlePathSelect = async (pathId) => {
    try {
      setIsGenerating(true);
      setSelectedPath(pathId);
      setActiveStep(2);
      setShowProgress(false);
      
      await setRoadmap({ selected_path: pathId, target_role: selectedRole });
      
      const updatedMilestones = await getMilestones();
      setRoadmapData(updatedMilestones);
      
      setTimeout(() => {
        customizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        info(`Path Saved: ${pathId.replace('_', ' ').toUpperCase()}`);
        setIsGenerating(false);
      }, 500);
      updateRoleSkills(selectedRole);
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
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
                   <Map size={24} />
                </div>
                <h2 className="text-xl font-black tracking-tight">MapOut Architect</h2>
             </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-none">
              Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mapout-primary)] to-[var(--mapout-secondary)]">Evolution.</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl text-lg">
              Map your professional trajectory with precision-engineered roadmaps and strategic skill benchmarks.
            </p>
          </div>
        </div>

        {/* Path Selection Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { id: 'industry', icon: Briefcase, title: 'Industry Dominance', desc: 'Secure high-impact positions at global tech enterprises and startups.' },
            { id: 'higher_studies', icon: GraduationCap, title: 'Academic Mastery', desc: 'Pursue advanced research and elite postgraduate targets (GATE/Masters).' },
            { id: 'exploring', icon: Search, title: 'Broad Discovery', desc: 'Synthesize a versatile core while exploring diverse technical vectors.' }
          ].map((path) => {
            const Icon = path.icon;
            const isSelected = selectedPath === path.id;
            
            return (
              <div 
                key={path.id}
                onClick={() => handlePathSelect(path.id)}
                className={`cursor-pointer rounded-[2.5rem] p-10 transition-all duration-500 ease-in-out group relative overflow-hidden ${
                  isSelected 
                    ? 'bg-card border-primary ring-1 ring-primary/20 shadow-2xl shadow-teal-500/10' 
                    : 'bg-muted/30 border-transparent hover:bg-card hover:border-border shadow-sm'
                } border-2`}
              >
                {isSelected && (
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />
                )}
                <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-8 transition-all duration-500 ${isSelected ? 'bg-primary text-white shadow-xl shadow-teal-500/30' : 'bg-white text-muted-foreground group-hover:text-primary group-hover:scale-110'}`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{path.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium mb-8 text-sm">{path.desc}</p>
                
                <div className={`flex items-center gap-2 transition-all duration-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                   <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Vector</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Ref */}
        <div ref={customizeRef} />

        {/* Industry Jobs Section */}
        {selectedPath === 'industry' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black tracking-tight mb-4">Role Specialization</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedRole === role 
                        ? 'bg-primary text-white shadow-xl shadow-teal-500/20 scale-105 border-primary' 
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-white hover:text-foreground'
                    } border-2`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-24">
              {/* Left: Professional Roadmap */}
              <div className="lg:col-span-1 border-r border-border pr-8">
                 <div className="sticky top-8 space-y-12">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Growth Vector</h3>
                      <div className="p-6 bg-card border border-border rounded-[2rem] shadow-sm">
                         <p className="text-[10px] font-black text-primary mb-1 uppercase tracking-widest">Targeting</p>
                         <h4 className="text-xl font-extrabold tracking-tight">{selectedRole}</h4>
                      </div>
                    </div>

                    <div className="space-y-8 relative">
                       <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-muted"></div>
                       {roadmapPhases.map((step, idx) => (
                          <div key={idx} className="relative pl-12 group cursor-pointer" onClick={() => setExpandedYear(idx)}>
                             <div className={`absolute left-0 top-1 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                               expandedYear === idx ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'
                             }`}>
                               <span className="text-[10px] font-black">{idx + 1}</span>
                             </div>
                             <div>
                                <h4 className={`font-bold text-sm transition-colors ${expandedYear === idx ? 'text-primary' : ''}`}>
                                  {step.title}
                                </h4>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{step.year}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Right: Skill Matrix */}
              <div className="lg:col-span-3 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {roleSkills.map((skill, i) => {
                      const isMastered = userSkills.includes(skill.toLowerCase());
                      return (
                        <div key={i} className="bg-card border border-border rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                           <div className="flex justify-between items-center mb-6">
                              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                 {isMastered ? <CheckCircle size={24} /> : <TrendingUp size={24} />}
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                isMastered ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                              }`}>
                                {isMastered ? 'VERIFIED' : 'REQUIRED'}
                              </span>
                           </div>
                           <h4 className="text-lg font-black mb-4">{skill}</h4>
                           <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                 <div className={`h-full transition-all duration-1000 ${isMastered ? 'bg-teal-500 w-full' : 'bg-primary w-2/3'}`}></div>
                              </div>
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{isMastered ? '100%' : '65%'}</span>
                           </div>
                        </div>
                      );
                   })}
                 </div>

                 <div className="p-12 bg-muted/30 border border-border border-dashed rounded-[3rem] text-center">
                    <button 
                      onClick={handleCheckProgress}
                      className="px-12 py-5 bg-primary text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/20"
                    >
                      Track Progress
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Matrix */}
        {showProgress && (
           <div ref={progressRef} className="animate-in slide-in-from-bottom-12 duration-700 bg-card border border-border rounded-[3rem] p-12 lg:p-20 shadow-2xl shadow-teal-500/5 mb-24">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                 <div>
                    <h3 className="text-3xl font-black tracking-tight mb-2">Live Action Matrix</h3>
                    <p className="text-muted-foreground font-medium">Real-time synchronization of your professional growth vectors.</p>
                 </div>

                 <div className="flex flex-wrap items-center gap-6">
                    <button 
                      onClick={handleDownloadRoadmap}
                      className="px-6 py-3 bg-white border border-border text-foreground hover:bg-muted rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
                    >
                       <Download size={16} className="text-primary" /> Download Roadmap
                    </button>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Overall Alignment</p>
                          <p className="text-2xl font-black text-primary">32.4%</p>
                       </div>
                       <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          <Award size={32} />
                       </div>

                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 {roadmapData.map((milestone, i) => (
                    <div key={i} className="flex items-center justify-between p-8 bg-muted/30 border border-transparent rounded-[2rem] hover:border-border hover:bg-white transition-all group">
                       <div className="flex items-center gap-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                            milestone.status === 'completed' ? 'bg-teal-500 text-white' : 'bg-white border border-border text-muted-foreground group-hover:text-primary'
                          }`}>
                            {milestone.status === 'completed' ? <Check size={24} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg mb-1">{milestone.title}</h4>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{milestone.category}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleToggleMilestone(milestone.id, milestone.status)}
                         className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                         milestone.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                       }`}>
                         {milestone.status === 'completed' ? 'VERIFIED' : 'SYNC_NODE'}
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Global Tips Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-24 border-t border-border">
           {[
             { title: 'Computational Improvement', desc: 'Focus on 1% daily exponential growth in software architecture mastery.' },
             { title: 'Validation Logic', desc: 'Deploy early. Fail aggressively. Collect savage feedback for rapid iteration.' },
             { title: 'Flow Synchronization', desc: 'Isolate deep work blocks. Minimize active network interruptions for logic craft.' },
             { title: 'Agentic Scaling', desc: 'Harness high-level AI orchestration for 10x professional output scaling.' }
           ].map((tip, i) => (
              <div key={i} className="p-8 bg-card border border-border rounded-[2.5rem] hover:shadow-xl transition-all group">
                 <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                 </div>
                 <h4 className="font-black mb-2">{tip.title}</h4>
                 <p className="text-sm text-muted-foreground leading-relaxed font-secondary">{tip.desc}</p>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
