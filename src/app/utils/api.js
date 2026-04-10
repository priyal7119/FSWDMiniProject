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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const [
          { data: bookmarks },
          { data: skills },
          { data: milestones },
          { data: profile }
        ] = await Promise.all([
          supabase.from('bookmarks').select('id').eq('user_id', user.id),
          supabase.from('skills').select('id').eq('user_id', user.id),
          supabase.from('milestones').select('id').eq('user_id', user.id).eq('status', 'completed'),
          supabase.from('profiles').select('*, resume_score, interviews_prepped, achievements').eq('id', user.id).single()
        ]);

        return {
          resume_score: profile?.resume_score || 0,
          skills_learned: skills?.length || 0,
          milestones_completed: milestones?.length || 0,
          bookmarks: bookmarks?.length || 0,
          interviews_prepped: profile?.interviews_prepped || 0,
          achievements: profile?.achievements || []
        };
      } catch (err) {
        console.error("GetStats error:", err);
        return { 
          resume_score: 0, 
          skills_learned: 0, 
          milestones_completed: 0, 
          bookmarks: 0,
          interviews_prepped: 0,
          achievements: []
        };
      }
    },
    getDetailedData: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch all relevant data for charts
      const [skills, milestones, resumes, profile, projects] = await Promise.all([
        supabase.from('skills').select('*').eq('user_id', user.id),
        supabase.from('milestones').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('projects').select('*') // Global projects for now
      ]);

      return {
        skills: skills.data || [],
        milestones: milestones.data || [],
        resumes: resumes.data || [],
        profile: profile.data || {},
        projects: projects.data || []
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
    getPhases: async () => {
      const { data, error } = await supabase.from('roadmap_phases').select('*').order('id', { ascending: true });
      if (error) throw error;
      return data;
    },
    set: async (pathData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Update/Upsert the user's roadmap selection
      const { data: roadmap, error: rError } = await supabase
        .from('user_roadmaps')
        .upsert({ 
          user_id: user.id, 
          ...pathData, 
          updated_at: new Date() 
        })
        .select()
        .single();
      
      if (rError) return handleSupaError({ data: null, error: rError });

      // 2. Clear existing milestones for this user (to re-seed)
      await supabase.from('milestones').delete().eq('user_id', user.id);

      // 3. Seed new milestones based on global template
      // For demo, we use the global roadmap_milestones pre-seeded in seed.sql
      const { data: templates } = await supabase
        .from('roadmap_milestones')
        .select('*, roadmap_phases(year, title)');
      
      if (templates && templates.length > 0) {
        const userMilestones = templates.map(t => ({
          user_id: user.id,
          title: t.title,
          category: t.roadmap_phases?.year || "Core",
          status: 'pending'
        }));
        await supabase.from('milestones').insert(userMilestones);
      }

      return roadmap;
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
        phone: data?.phone || user.user_metadata?.phone || "+1 (555) 000-0000",
        location: data?.location || "Not Set",
        headline: data?.qualification || "Career Professional",
        resumeScore: data?.resume_score || 75,
        emailNotifications: data?.email_notifications ?? true,
        newsletterOptIn: data?.newsletter_opt_in ?? true,
        themePreference: data?.theme_preference || 'dark',
        joinDate: data?.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "April 2026",
        achievements: data?.achievements || [],
        githubUrl: data?.github_url || "",
        linkedinUrl: data?.linkedin_url || "",
        driveUrl: data?.drive_url || ""
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
        achievements: data.achievements,
        github_url: data.githubUrl,
        linkedin_url: data.linkedinUrl,
        drive_url: data.driveUrl,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('resumes')
        .insert({ 
          user_id: user.id, 
          title: resumeData.title || "Untitled Resume",
          content: resumeData.content, // JSON string of form data
          analysis_score: resumeData.analysis_score || { score: 75 },
          file_url: resumeData.file_url || "form-submission"
        })
        .select()
        .single();
        
      if (error) {
        console.warn("Supabase resumes table missing or error:", error.message);
        return { success: true, id: "mock-" + Date.now(), ...resumeData };
      }
      return data;
    },
    list: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data;
    },
    analyze: async (token, file) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('resumes')
          .upload(fileName, file);
        
        const baseScore = Math.floor(Math.random() * 20) + 65;
        const foundKeywords = ["React", "JavaScript", "SQL", "Teamwork"];
        if (file.name.toLowerCase().includes("python")) foundKeywords.push("Python");
        if (file.name.toLowerCase().includes("senior")) foundKeywords.push("Leadership");
        
        return {
          score: baseScore,
          ats_compatibility: Math.floor(Math.random() * 15) + 80,
          keywords: foundKeywords,
          missing: ["Docker", "Kubernetes", "Unit Testing"],
          url: data?.path || "local-mock-cache"
        };
      } catch (err) {
        return { 
          score: 72, 
          ats_compatibility: 85,
          keywords: ["Analysis", "Communication"], 
          missing: ["Cloud Services"],
          url: "local-mock" 
        };
      }
    },
  },

  // ── Database Queries ────────────────────────────────────────────────
  projects: { 
    getRecommended: async (filters = {}) => {
      let query = supabase.from('projects').select('*');
      
      if (filters.difficulty && filters.difficulty !== 'All') {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.technology && filters.technology !== 'All') {
        query = query.eq('technology', filters.technology);
      }
      if (filters.domain && filters.domain !== 'All') {
        query = query.eq('domain', filters.domain);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error("Projects query failed:", error);
        return [];
      }
      return data.map(p => ({
        ...p,
        category: p.technology?.toLowerCase().replace(' ', '-') || 'other'
      }));
    }
  },

  interview: {
    getQuestions: async (role) => {
      let query = supabase.from('interview_questions').select('*');
      if (role) query = query.eq('role', role);
      const { data, error } = await query;
      
      if (error) {
        console.error("Interview query failed:", error);
        return [];
      }
      return data;
    },
    incrementPrepCount: async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
       
       const { data: profile } = await supabase.from('profiles').select('interviews_prepped').eq('id', user.id).single();
       const count = (profile?.interviews_prepped || 0) + 1;
       
       await supabase.from('profiles').update({ interviews_prepped: count }).eq('id', user.id);
       return count;
    }
  },
  search: { 
    query: async (searchTerm) => {
      const term = searchTerm.toLowerCase();
      
      // Static Pages/Modules that can be searched
      const pages = [
        { title: 'Dashboard', type: 'page', path: '/dashboard' },
        { title: 'Resume Studio', type: 'page', path: '/resume-studio' },
        { title: 'Career Planner', type: 'page', path: '/career-planner' },
        { title: 'Interview FAQs', type: 'page', path: '/interview-faqs' },
        { title: 'Research Guide', type: 'page', path: '/research-guide' },
        { title: 'Projects', type: 'page', path: '/projects' },
        { title: 'Bookmarks', type: 'page', path: '/bookmarks' },
        { title: 'Profile', type: 'page', path: '/profile' },
        { title: 'About Us', type: 'page', path: '/about' }
      ].filter(p => p.title.toLowerCase().includes(term));

      const [projectsResult, interviewResult] = await Promise.all([
        supabase.from('projects').select('id, title, domain, description').ilike('title', `%${searchTerm}%`),
        supabase.from('interview_questions').select('id, question, role').ilike('question', `%${searchTerm}%`)
      ]);

      const projects = (projectsResult.data || []).map(p => ({
        id: p.id,
        title: p.title,
        type: 'project',
        path: '/projects',
        domain: p.domain
      }));

      const faqs = (interviewResult.data || []).map(q => ({
        id: q.id,
        title: q.question,
        type: 'faq',
        path: '/interview-faqs',
        domain: q.role
      }));

      // Return unique results, prioritizing pages
      return [...pages, ...projects, ...faqs];
    } 
  },
  planner: {
    getRoleRequirements: async (role) => {
      const { data, error } = await supabase
        .from('role_requirements')
        .select('*')
        .eq('role', role)
        .single();
      if (error) return null;
      return data.required_skills;
    }
  },
  research: {
    getGuide: async () => {
      const { data, error } = await supabase.from('research_guide').select('*').order('id', { ascending: true });
      if (error) throw error;
      return data;
    }
  },
  exports: { create: async () => ({ message: "Export created" }) },
};

export const getResearchGuide     = api.research.getGuide;

// ── Named convenience exports ──────────────────────────────────────
export const loginUser            = api.auth.login;
export const registerUser         = api.auth.register;
export const getStats             = api.dashboard.getStats;
export const getDetailedDashboardData = api.dashboard.getDetailedData;
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
export const getRoadmapPhases      = api.roadmaps.getPhases;
export const setRoadmap            = api.roadmaps.set;

// Convenience Aliases for UI Components
export const getProjects           = api.projects.getRecommended;
export const getFAQs               = api.interview.getQuestions;
export const getResearchGuides     = api.research.getGuide;
export const searchContent         = api.search.query;
export const incrementPrepCount    = api.interview.incrementPrepCount;



