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
          achievements: (stats.achievements && stats.achievements.length > 0) ? stats.achievements : ["Early Adopter", "Explorer"],
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleShare = (platform) => {
    info(`Opening share dialog for ${platform}...`);
  };

  const handleExport = () => {
    if (!userStats) return;
    
    let profileContent = `============== MAPOUT PROFILE ==============\n`;
    profileContent += `Name: ${userStats.name}\n`;
    profileContent += `Headline: ${userStats.headline}\n`;
    profileContent += `Email: ${userStats.email}\n`;
    profileContent += `Phone: ${userStats.phone}\n`;
    profileContent += `============================================\n\n`;
    profileContent += `STATISTICS\n`;
    profileContent += `Resume Score: ${userStats.resumeScore}/100\n`;
    profileContent += `Skills Learned: ${userStats.skillsLearned}\n`;
    profileContent += `Projects Done: ${userStats.projectsCompleted}\n`;
    profileContent += `Interviews Prepped: ${userStats.interviewsPrepped}\n\n`;
    profileContent += `ACHIEVEMENTS\n`;
    userStats.achievements.forEach(ach => {
      profileContent += `- ${ach}\n`;
    });

    const blob = new Blob([profileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userStats.name.replace(/\s+/g, '_')}_Profile.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success('Your profile data has been exported successfully.');
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
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                   {['Open to Opportunities', 'Top 5% Performer', 'Verified Professional'].map((tag, i) => (
                      <span key={i} className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-white/80 border border-white/5 uppercase tracking-widest">
                        {tag}
                      </span>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => handleShare('LinkedIn')}
                className="px-6 py-4 bg-white/5 hover:bg-white text-white hover:text-primary rounded-2xl font-bold transition-all border border-white/10 flex items-center gap-2 group"
              >
                <Share2 size={18} className="group-hover:scale-110 transition-transform" /> Share Profile
              </button>
              <button 
                onClick={handleExport}
                className="px-6 py-4 bg-[var(--mapout-secondary)] hover:bg-teal-400 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 group"
              >
                <Layout size={18} className="group-hover:scale-110 transition-transform" /> Export Data
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
                 <Trophy size={20} className="text-[var(--mapout-secondary)]" /> Performance Hub
               </h3>
               <div className="space-y-6">
                  {[
                    { label: "Resume IQ", value: userStats.resumeScore, icon: FileText, suffix: "%" },
                    { label: "Skills Gained", value: userStats.skillsLearned, icon: Zap, suffix: "" },
                    { label: "Projects Case", value: userStats.projectsCompleted, icon: Briefcase, suffix: "" },
                    { label: "Interviews", value: userStats.interviewsPrepped, icon: Award, suffix: "" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-muted/20 rounded-[1.5rem] border border-transparent hover:border-border transition-all group">
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
               <h3 className="text-xl font-bold mb-8 relative z-10">Honor Board</h3>
               <div className="flex flex-wrap gap-3 relative z-10">
                 {userStats.achievements.map((ach, idx) => (
                    <div key={idx} className="px-5 py-3 bg-muted/30 border border-border rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md hover:border-[var(--mapout-secondary)] transition-all group cursor-default">
                       <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-[var(--mapout-secondary)] group-hover:scale-110 transition-transform">
                          <Award size={16} />
                       </div>
                       <span className="font-bold text-sm text-foreground">{ach}</span>
                    </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Right Column: Settings & Information */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Contact Information */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm relative group overflow-hidden">
               <h3 className="text-xl font-bold mb-10">Personal Intelligence</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[
                    { label: "E-MAIL PROTOCOL", value: userStats.email, icon: Mail },
                    { label: "MOBILE UPLINK", value: userStats.phone, icon: Phone },
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
               <h3 className="text-xl font-bold mb-10">Ecosystem Connectivity</h3>
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
                        <p className="text-[10px] font-black text-muted-foreground mb-6 tracking-widest uppercase">{isActive ? 'Uplink Active' : 'Offline'}</p>
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

            {/* Security Profile */}
            <div className="bg-muted border border-border border-dashed rounded-[2.5rem] p-12 text-center flex flex-col items-center">
               <div className="w-20 h-20 bg-white border border-border rounded-[1.5rem] flex items-center justify-center mb-8 shadow-sm group hover:scale-110 transition-transform">
                 <ShieldCheck className="text-[var(--mapout-secondary)]" size={36} />
               </div>
               <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Security & Governance</h3>
               <p className="text-muted-foreground font-medium max-w-md mb-10 leading-relaxed">
                 Your data is protected by industry-standard encryption protocols. You have complete control over your professional data export and session termination.
               </p>
               <button 
                 onClick={handleLogout}
                 className="px-12 py-5 bg-red-600 text-white font-black text-[12px] tracking-[0.2em] rounded-2xl hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/20 flex items-center gap-3"
               >
                 <LogOut size={18} /> TERMINATE SESSION
               </button>
            </div>
          </div>
        </div>
        
        {/* Profile Footer Intelligence */}
        <div className="mt-20 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-[12px] font-black shadow-lg">MO</div>
             <p className="text-[10px] font-black text-muted-foreground tracking-[0.3em] uppercase">SYSTEM ID: {userStats.email.split('@')[0].toUpperCase()}-X91 • VERIFIED</p>
           </div>
           <div className="flex gap-10">
              {['Privacy', 'Legal', 'Security'].map((link, i) => (
                <button key={i} className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors tracking-[0.2em] uppercase">{link}</button>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
