import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Award, Share2, Download, LogOut } from "lucide-react";
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
          interviewsPrepped: 8,
          achievements: ["Quick Learner", "Resume Master"],
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
    <div className="min-h-screen bg-[var(--mapout-bg)] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 text-white rounded-3xl p-10 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold border border-white/30 shadow-xl">
                  {userStats.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-5xl font-extrabold mb-2 font-sans tracking-tight">
                    {userStats.name}
                  </h1>
                  <p className="text-xl opacity-80 font-medium">{userStats.headline}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleShare('LinkedIn')}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex items-center gap-2 border border-white/20 shadow-lg group"
                >
                  <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all flex items-center gap-2 border border-white/20 shadow-lg group"
                >
                  <Download size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <p className="opacity-70 text-xs font-bold uppercase tracking-widest mb-1">Member Since</p>
                <p className="text-2xl font-bold">{userStats.joinDate}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <p className="opacity-70 text-xs font-bold uppercase tracking-widest mb-1">Resume Score</p>
                <p className="text-2xl font-bold">{userStats.resumeScore}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <p className="opacity-70 text-xs font-bold uppercase tracking-widest mb-1">Skills Mastered</p>
                <p className="text-2xl font-bold">{userStats.skillsLearned}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <p className="opacity-70 text-xs font-bold uppercase tracking-widest mb-1">Projects Completed</p>
                <p className="text-2xl font-bold">{userStats.projectsCompleted}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/5">
              <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white font-sans">Contact</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-transparent dark:border-white/5">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-gray-200">{userStats.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-transparent dark:border-white/5">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Phone</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-gray-200">{userStats.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-transparent dark:border-white/5">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Location</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-gray-200">{userStats.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/5">
              <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white font-sans flex items-center gap-3">
                <Award size={24} className="text-yellow-500" />
                Achievements
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {userStats.achievements.map((achievement, idx) => (
                  <div key={idx} className="p-3 bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/5">
              <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white font-sans">
                Activity Pulse
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-blue-600/5 dark:bg-blue-600/10 rounded-2xl p-6 border border-blue-600/10">
                  <p className="text-xs text-blue-600 font-bold uppercase mb-2 tracking-widest">Interviews</p>
                  <p className="text-4xl font-extrabold text-blue-700 dark:text-blue-400">{userStats.interviewsPrepped}</p>
                </div>
                <div className="bg-emerald-600/5 dark:bg-emerald-600/10 rounded-2xl p-6 border border-emerald-600/10">
                  <p className="text-xs text-emerald-600 font-bold uppercase mb-2 tracking-widest">Skills</p>
                  <p className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">{userStats.skillsLearned}</p>
                </div>
                <div className="bg-indigo-600/5 dark:bg-indigo-600/10 rounded-2xl p-6 border border-indigo-600/10">
                  <p className="text-xs text-indigo-600 font-bold uppercase mb-2 tracking-widest">Projects</p>
                  <p className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">{userStats.projectsCompleted}</p>
                </div>
                <div className="bg-orange-600/5 dark:bg-orange-600/10 rounded-2xl p-6 border border-orange-600/10">
                  <p className="text-xs text-orange-600 font-bold uppercase mb-2 tracking-widest">Resume</p>
                  <p className="text-4xl font-extrabold text-orange-700 dark:text-orange-400">{userStats.resumeScore}%</p>
                </div>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/5">
              <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white font-sans">Ecosystem</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-white/5 group">
                  <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-extrabold text-2xl mb-4 group-hover:scale-110 transition-transform">G</div>
                  <p className="font-bold text-slate-900 dark:text-white mb-2">GitHub</p>
                  <span className="px-4 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full">Active</span>
                </div>
                <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-white/5 group">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-2xl mb-4 group-hover:scale-110 transition-transform">in</div>
                  <p className="font-bold text-slate-900 dark:text-white mb-2">LinkedIn</p>
                  <button className="px-4 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-blue-600 hover:text-white transition-colors">Connect</button>
                </div>
                <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-white/5 group">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-extrabold text-2xl mb-4 group-hover:scale-110 transition-transform">G</div>
                  <p className="font-bold text-slate-900 dark:text-white mb-2">Drive</p>
                  <button className="px-4 py-1 bg-red-600/10 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-red-600 hover:text-white transition-colors">Connect</button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/5">
              <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white font-sans">Settings</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-white/5">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Email Notifications</span>
                  <input 
                    type="checkbox" 
                    checked={userStats.emailNotifications} 
                    onChange={(e) => handleToggleSetting('emailNotifications', e.target.checked)}
                    className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer" 
                    aria-label="Email notifications toggle" 
                  />
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-white/5">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Newsletter</span>
                  <input 
                    type="checkbox" 
                    checked={userStats.newsletterOptIn} 
                    onChange={(e) => handleToggleSetting('newsletterOptIn', e.target.checked)}
                    className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer" 
                    aria-label="Newsletter toggle" 
                  />
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full px-6 py-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-3 font-bold border border-red-500/20"
              >
                <LogOut size={20} />
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
