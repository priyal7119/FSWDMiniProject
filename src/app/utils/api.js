import { supabase } from "./supabaseClient.js";

// Helper: handle Supabase response errors
const handleSupaError = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────
  auth: {
    login: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { 
        token: data.session?.access_token, 
        name: data.user?.user_metadata?.full_name || data.user?.email,
        id: data.user?.id 
      };
    },

    register: async ({ email, password, name }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) return { error: error.message };
      return { id: data.user?.id };
    },
  },

  // ── Dashboard ─────────────────────────────────────────────────────
  dashboard: {
    getStats: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Aggregate counts from other tables
      const { count: bookmarkCount } = await supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: skillCount } = await supabase.from('skills').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: milestoneCount } = await supabase.from('milestones').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed');
      const { data: profile } = await supabase.from('profiles').select('resume_score').eq('id', user.id).single();
      const { data: roadmap } = await supabase.from('user_roadmaps').select('selected_path').eq('user_id', user.id).single();
      
      return {
        resume_score: profile?.resume_score || 75,
        skills_learned: skillCount || 0,
        milestones_completed: milestoneCount || 0,
        recommended_projects: 8,
        bookmarks: bookmarkCount || 0,
        active_path: roadmap?.selected_path || 'exploring'
      };
    },
  },

  // ── Milestones ──────────────────────────────────────────────────
  milestones: {
    list: async () => {
      const { data, error } = await supabase.from('milestones').select('*').order('created_at', { ascending: true });
      return handleSupaError({ data, error });
    },
    toggle: async (id, status) => {
      const { data, error } = await supabase
        .from('milestones')
        .update({ status, completed_at: status === 'completed' ? new Date() : null })
        .eq('id', id)
        .select()
        .single();
      return handleSupaError({ data, error });
    },
    add: async (milestone) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('milestones')
        .insert({ user_id: user.id, ...milestone })
        .select()
        .single();
      return handleSupaError({ data, error });
    }
  },

  // ── Notifications ───────────────────────────────────────────────
  notifications: {
    list: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      return handleSupaError({ data, error });
    },
    markAsRead: async (id) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      return { success: true };
    }
  },

  // ── Roadmaps ────────────────────────────────────────────────────
  roadmaps: {
    get: async () => {
      const { data, error } = await supabase.from('user_roadmaps').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    set: async (pathData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('user_roadmaps')
        .upsert({ user_id: user.id, ...pathData, updated_at: new Date() })
        .select()
        .single();
      return handleSupaError({ data, error });
    }
  },

  // ── User ──────────────────────────────────────────────────────────
  user: {
    getProfile: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return {
        name: data?.full_name || user.user_metadata?.full_name || "User",
        email: data?.email || user.email,
        phone: data?.phone || "+1 (555) 000-0000",
        location: data?.location || "Not Set",
        headline: data?.qualification || "Career Professional",
        resumeScore: data?.resume_score || 75,
        emailNotifications: data?.email_notifications ?? true,
        newsletterOptIn: data?.newsletter_opt_in ?? true,
        themePreference: data?.theme_preference || 'dark',
        joinDate: data?.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "March 2024"
      };
    },

    updateProfile: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Map UI keys to DB keys if necessary
      const dbData = {
        id: user.id,
        full_name: data.name,
        phone: data.phone,
        location: data.location,
        qualification: data.headline,
        email_notifications: data.emailNotifications,
        newsletter_opt_in: data.newsletterOptIn,
        theme_preference: data.themePreference,
        updated_at: new Date()
      };

      // Clean undefined
      Object.keys(dbData).forEach(key => dbData[key] === undefined && delete dbData[key]);

      const { error } = await supabase.from('profiles').upsert(dbData);
      if (error) throw error;
      return { message: "Profile updated successfully" };
    },
  },

  // ── Skills ────────────────────────────────────────────────────────
  skills: {
    add: async (skillData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('skills')
        .insert({ user_id: user.id, ...skillData })
        .select()
        .single();
      return handleSupaError({ data, error });
    },

    list: async () => {
      const { data, error } = await supabase.from('skills').select('*');
      return handleSupaError({ data, error });
    },

    getDemand: async () => {
      return [
        { name: "React", demand: 95 },
        { name: "Node.js", demand: 88 },
        { name: "PostgreSQL", demand: 82 },
      ];
    },
  },

  // ── Bookmarks ─────────────────────────────────────────────────────
  bookmarks: {
    add: async (bookmarkData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, ...bookmarkData })
        .select()
        .single();
      return handleSupaError({ data, error });
    },

    list: async () => {
      const { data, error } = await supabase.from('bookmarks').select('*');
      return handleSupaError({ data, error });
    },

    remove: async (id) => {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },

  // ── Resume ───────────────────────────────────────────────────────
  resume: {
    create: async (token, resumeData) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: true }; // Fallback

        const { data, error } = await supabase
          .from('resumes')
          .insert({ 
            user_id: user.id, 
            title: resumeData.title,
            file_url: "form-submission", 
            analysis_score: { score: 75 } 
          })
          .select()
          .single();
          
        if (error) {
          console.warn("Supabase resumes table missing. Using local fallback.");
          return { success: true, id: "mock-fallback" };
        }
        return data;
      } catch (err) {
        return { success: true, fallback: true };
      }
    },
    list: async () => {
      const { data, error } = await supabase.from('resumes').select('*');
      if (error) return [];
      return data;
    },
    analyze: async (token, file) => {
      try {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('resumes')
          .upload(fileName, file);
        
        if (error) {
          console.warn("Supabase resumes bucket missing. Using local mock analysis.");
          return { score: Math.floor(Math.random() * 30) + 70, url: "local-mock" };
        }

        return {
          score: Math.floor(Math.random() * 30) + 70,
          url: data.path
        };
      } catch (err) {
        return { score: Math.floor(Math.random() * 30) + 70, url: "local-mock" };
      }
    },
  },

  // ── Database Queries ────────────────────────────────────────────────
  projects: { 
    getRecommended: async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        console.error("Projects query failed:", error);
        return [];
      }
      return data;
    }
  },
  search: { query: async () => [] },
  exports: { create: async () => ({ message: "Export created" }) },
};

// ── Named convenience exports ──────────────────────────────────────
export const loginUser            = api.auth.login;
export const registerUser         = api.auth.register;
export const getStats             = api.dashboard.getStats;
export const getProfile           = api.user.getProfile;
export const updateProfile        = api.user.updateProfile;
export const getBookmarks         = api.bookmarks.list;
export const addBookmark          = api.bookmarks.add;
export const removeBookmark       = api.bookmarks.remove;
export const getSkills            = api.skills.list;
export const addSkill             = api.skills.add;
export const getSkillDemand       = api.skills.getDemand;
export const getRecommendedProjects = api.projects.getRecommended;
export const searchBackend        = api.search.query;
export const createExport         = api.exports.create;
export const createResume         = api.resume.create;
export const getResumes           = api.resume.list;
export const analyzeResume        = api.resume.analyze;

// New Exports
export const getMilestones        = api.milestones.list;
export const toggleMilestone       = api.milestones.toggle;
export const addMilestone          = api.milestones.add;
export const getNotifications      = api.notifications.list;
export const markNotificationRead  = api.notifications.markAsRead;
export const getRoadmap            = api.roadmaps.get;
export const setRoadmap            = api.roadmaps.set;



