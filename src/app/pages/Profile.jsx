import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Award, Share2, Download, LogOut, Github, Cloud, Layout, Trophy, ShieldCheck, FileText, Zap } from "lucide-react";
import { getProfile, updateProfile, getStats } from "../utils/api.js";
import { useToast } from "../components/Toast.jsx";

export function Profile() {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        const stats = await getStats();
        
        setUserStats({
          ...profile,
          skillsLearned: stats.skills_learned,
          projectsCompleted: stats.milestones_completed,
          interviewsPrepped: stats.interviews_prepped,
          achievements: (stats.achievements && stats.achievements.length > 0) ? stats.achievements : [],
          joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "April 2026"
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        toastError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleToggleSetting = async (key, value) => {
    try {
      const updatedSettings = { ...userStats, [key]: value };
      setUserStats(updatedSettings);
      await updateProfile({ [key]: value });
      success("Setting saved.");
    } catch (err) {
      console.error(err);
      toastError("Failed to update setting.");
    }
  };



  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success("Profile link copied to clipboard!");
  };

  const handleResumeStudio = () => {
    navigate("/resume-studio");
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--mapout-bg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading profile...</h1>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-[var(--mapout-bg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        
        {/* Profile Header Block */}
        <div className="bg-primary rounded-[2.5rem] p-12 mb-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-teal-500/20 transition-colors duration-700"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-3xl bg-white/5 backdrop-blur-md flex items-center justify-center text-5xl font-extrabold text-white border border-white/10 shadow-2xl transform hover:rotate-3 transition-transform cursor-default">
                {userStats.name.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">
                  {userStats.name}
                </h1>
                <p className="text-xl text-white/60 font-medium max-w-lg">{userStats.headline}</p>
                <div className="flex items-center gap-2 mt-6">
                   <span className="px-4 py-1.5 bg-teal-500/20 rounded-full text-[10px] font-black text-teal-300 border border-teal-500/20 uppercase tracking-widest flex items-center gap-2">
                     <ShieldCheck size={12} /> Verified Professional
                   </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleShare}
                className="px-6 py-4 bg-white/5 hover:bg-white text-white hover:text-primary rounded-2xl font-bold transition-all border border-white/10 flex items-center gap-2 group"
              >
                <Share2 size={18} className="group-hover:scale-110 transition-transform" /> Share Profile
              </button>
               <button 
                onClick={handleResumeStudio}
                className="px-6 py-4 bg-[var(--mapout-secondary)] hover:bg-teal-400 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 group"
              >
                <FileText size={18} className="group-hover:scale-110 transition-transform" /> Resume Studio
              </button>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Metrics & Achievements */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Quick Stats Card */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm">
               <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                 <Trophy size={20} className="text-[var(--mapout-secondary)]" /> Stats Overview
               </h3>
               <div className="space-y-6">
                  {[
                    { label: "Resume IQ", value: userStats.resumeScore, icon: FileText, suffix: "%", action: handleResumeStudio },
                    { label: "Skills Gained", value: userStats.skillsLearned, icon: Zap, suffix: "" },
                    { label: "Projects Case", value: userStats.projectsCompleted, icon: Briefcase, suffix: "" },
                    { label: "Interviews", value: userStats.interviewsPrepped, icon: Award, suffix: "" },
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      onClick={stat.action || null}
                      className={`flex items-center justify-between p-5 bg-muted/20 rounded-[1.5rem] border border-transparent hover:border-border transition-all group ${stat.action ? 'cursor-pointer hover:bg-muted/40 active:scale-[0.98]' : ''}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white border border-border rounded-xl flex items-center justify-center text-[var(--mapout-secondary)] group-hover:scale-105 transition-transform shadow-sm">
                             <stat.icon size={20} />
                          </div>
                          <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors text-sm uppercase tracking-wider">{stat.label}</span>
                       </div>
                       <span className="text-2xl font-black text-foreground">{stat.value}{stat.suffix}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Achievements Card */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--mapout-secondary)]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <h3 className="text-xl font-bold mb-8 relative z-10">Achievements</h3>
                <div className="relative z-10 flex flex-wrap gap-3">
                  {userStats.achievements.length > 0 ? (
                    userStats.achievements.map((ach, idx) => (
                       <div key={idx} className="px-5 py-3 bg-muted/30 border border-border rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md hover:border-[var(--mapout-secondary)] transition-all group cursor-default">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-[var(--mapout-secondary)] group-hover:scale-110 transition-transform">
                             <Award size={16} />
                          </div>
                          <span className="font-bold text-sm text-foreground">{ach}</span>
                       </div>
                    ))
                  ) : (
                    <div className="w-full py-8 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No achievements unlocked yet</p>
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Right Column: Settings & Information */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Contact Information */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm relative group overflow-hidden">
               <h3 className="text-xl font-bold mb-10">Contact Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[
                    { label: "EMAIL ADDRESS", value: userStats.email, icon: Mail },
                    { label: "PHONE NUMBER", value: userStats.phone, icon: Phone },
                    { label: "LOCATION", value: userStats.location, icon: MapPin },
                    { label: "ACTIVE SINCE", value: userStats.joinDate, icon: Calendar },
                  ].map((info, i) => (
                    <div key={i} className="space-y-3">
                       <p className="text-[10px] font-black text-muted-foreground tracking-[0.2em]">{info.label}</p>
                       <div className="flex items-center gap-4">
                          <div className="p-2 bg-muted/50 rounded-lg text-[var(--mapout-secondary)]">
                            <info.icon size={18} />
                          </div>
                          <span className="font-bold text-foreground text-lg">{info.value}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Account Status Systems */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm">
               <h3 className="text-xl font-bold mb-10">Connections</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: 'GitHub Ecosystem', icon: Github, key: 'github', url: userStats.githubUrl },
                   { label: 'Professional Network', icon: Share2, key: 'linkedin', url: userStats.linkedinUrl },
                   { label: 'Cloud Drive', icon: Cloud, key: 'drive', url: userStats.driveUrl }
                 ].map((social) => {
                   const isActive = !!social.url;
                   return (
                     <div key={social.key} className={`p-8 bg-muted/20 rounded-[2rem] border border-transparent hover:border-[var(--mapout-secondary)]/30 transition-all flex flex-col items-center text-center group ${isActive ? 'ring-1 ring-[var(--mapout-secondary)]/10' : ''}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${isActive ? 'bg-[var(--mapout-secondary)] text-white shadow-xl shadow-teal-500/20' : 'bg-white border border-border text-muted-foreground'}`}>
                           <social.icon size={28} />
                        </div>
                        <h4 className="font-bold mb-1 text-sm">{social.label}</h4>
                        <p className="text-[10px] font-black text-muted-foreground mb-6 tracking-widest uppercase">{isActive ? 'Linked' : 'Not Linked'}</p>
                        <button 
                          onClick={() => handleToggleSetting(social.key, !isActive)}
                          className={`mt-auto w-full py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${isActive ? 'bg-muted text-foreground hover:bg-slate-200' : 'bg-primary text-white hover:bg-[var(--mapout-primary)]/90'}`}
                        >
                          {isActive ? 'Disconnect' : 'Connect'}
                        </button>
                     </div>
                   );
                 })}
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
