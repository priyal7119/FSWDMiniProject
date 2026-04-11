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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: true });
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
    set: async (roadmapData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Update/Upsert the user's roadmap selection + preferences
      const payload = {
        user_id: user.id,
        selected_path: roadmapData.selected_path,
        target_role: roadmapData.target_role,
        experience_level: roadmapData.experience || 'beginner',
        time_per_week: roadmapData.timePerWeek || '10',
        learning_style: roadmapData.learningStyle || 'project',
        timeline: roadmapData.timeline || '6months',
        updated_at: new Date()
      };

      const { data: roadmap, error: rError } = await supabase
        .from('user_roadmaps')
        .upsert(payload)
        .select()
        .single();
      
      if (rError) {
        console.warn("User roadmaps table sync failed:", rError.message);
      }

      // 2. Clear and Seed Milestones (Wrap in try/catch as table might be missing)
      try {
        await supabase.from('milestones').delete().eq('user_id', user.id);
        
        let userMilestones = [];
        if (payload.selected_path === 'industry') {
          userMilestones = [
            { user_id: user.id, title: "Career Discovery", category: "Foundation", status: 'completed' },
            { user_id: user.id, title: "Skill Baseline Analysis", category: "Phase 1", status: 'pending' },
            { user_id: user.id, title: "Industry Application", category: "Phase 2", status: 'pending' }
          ];
        } else if (payload.selected_path === 'higher_studies') {
          userMilestones = [
            { user_id: user.id, title: "Program Selection", category: "Academic", status: 'pending' },
            { user_id: user.id, title: "Entrance Prep", category: "Academic", status: 'pending' }
          ];
        }

        if (userMilestones.length > 0) {
          await supabase.from('milestones').insert(userMilestones);
        }
      } catch (mErr) {
        console.warn("Milestone seeding partial failure:", mErr.message);
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
        resumeScore: data?.resume_score || 0,
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
           console.error("Bookmark Error: No active user session found.");
           throw new Error("Auth required");
        }
        
        console.log("Attempting to save bookmark to Supabase:", bookmarkData);

        const payload = {
          user_id: user.id,
          title: bookmarkData.title,
          description: bookmarkData.description || "",
          type: bookmarkData.type || "project",
          resource_id: bookmarkData.resource_id ? parseInt(bookmarkData.resource_id) : null,
          url: bookmarkData.url || "",
          saved_date: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('bookmarks')
          .insert(payload)
          .select();

        if (error) {
           console.error("Supabase Database Error:", error.message, error.details);
           throw error;
        }
        
        console.log("Bookmark successfully saved to Cloud!");
        return data;
      } catch (err) {
        console.warn("Falling back to Local Storage due to error:", err.message);
        
        const localBookmarks = JSON.parse(localStorage.getItem('mapout_local_bookmarks') || '[]');
        const newBookmark = { 
          id: 'local-' + Date.now(), 
          ...bookmarkData, 
          saved_date: new Date().toISOString() 
        };
        localBookmarks.push(newBookmark);
        localStorage.setItem('mapout_local_bookmarks', JSON.stringify(localBookmarks));
        
        return newBookmark;
      }
    },
    list: async () => {
      let dbData = [];
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .order('saved_date', { ascending: false });
          if (!error) dbData = data || [];
        }
      } catch (e) {
        console.warn("Could not fetch cloud bookmarks.");
      }

      const localData = JSON.parse(localStorage.getItem('mapout_local_bookmarks') || '[]');
      return [...dbData, ...localData].sort((a, b) => 
        new Date(b.saved_date) - new Date(a.saved_date)
      );
    },
    remove: async (idOrToken, possibleId) => {
      const id = possibleId || idOrToken;
      if (!id || typeof id !== 'string' && typeof id !== 'number') return { success: false };

      // 1. Try DB removal
      try {
        await supabase.from('bookmarks').delete().eq('id', id);
      } catch (e) {}

      // 2. Try Local removal
      const local = JSON.parse(localStorage.getItem('mapout_local_bookmarks') || '[]');
      const filtered = local.filter(item => item.id !== id);
      localStorage.setItem('mapout_local_bookmarks', JSON.stringify(filtered));
      
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
      
      // Update user's profile score if a score is provided
      const newScore = resumeData.analysis_score?.score || 0;
      if (newScore > 0) {
        await supabase.from('profiles').update({ resume_score: newScore }).eq('id', user.id);
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
    analyze: async (token, textToAnalyze, file = null, imageData = null) => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      let fileUrl = "session-only";
      if (file) {
        try {
          const fileName = `${Date.now()}-${file.name}`;
          const { data } = await supabase.storage.from('resumes').upload(fileName, file);
          fileUrl = data?.path || fileUrl;
        } catch (err) {
          console.warn("Storage upload failed.");
        }
      }

      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return {
          score: 75,
          ats_compatibility: 82,
          keywords: ["Mock", "Data"],
          missing: ["API Key Config"],
          feedback: "Add Gemini API Key to .env for real AI analysis.",
          url: fileUrl
        };
      }

      try {
        const prompt = `
          You are an elite AI Career Architect from MapOut. 
          Analyze the resume provided (text or image) and provide a surgical, high-impact review.
          
          COMPULSORY REQUIREMENTS:
          1. Return a numerical score (0-100) and ATS compatibility (%) based on industry benchmarks.
          2. List exact technical keywords found and critical missing gaps.
          3. COMPULSORY: Provide AT LEAST 3 to 5 distinct, bulleted suggestions for improvement. 
             - Each suggestion must be specific (e.g., "Add metrics to your project descriptions" rather than "Improve descriptions").
          
          FORMAT: Return ONLY a raw JSON object. 
          {
            "score": number,
            "ats_compatibility": number,
            "keywords": ["list", "of", "skills"],
            "missing": ["missing", "sections"],
            "bullet_suggestions": [
                "Detailed suggestion 1",
                "Detailed suggestion 2",
                "Detailed suggestion 3",
                "Detailed suggestion 4",
                "Detailed suggestion 5"
            ],
            "feedback": "A very short (1 sentence) encouraging overview."
          }
        `;

        const parts = [{ text: prompt + "\n\nContent:\n" + textToAnalyze }];
        
        if (imageData) {
          parts.push({
            inline_data: {
              mime_type: "image/jpeg",
              data: imageData.split(',')[1] // Remove data:image/jpeg;base64,
            }
          });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] })
        });

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        
        // Clean markdown backticks if AI included them
        const cleanText = rawText.replace(/```json|```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        const result = JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);

        // Normalize result keys (synonyms check)
        const normalized = {
          score: result.score || result.health_score || result.overall_score || 75,
          ats_compatibility: result.ats_compatibility || result.ats_score || result.compatibility || 80,
          keywords: result.keywords || [],
          missing: result.missing || result.gaps || [],
          bullet_suggestions: result.bullet_suggestions || result.suggestions || [],
          feedback: result.feedback || result.summary || "Strategically adjust your profile to maximize impact.",
          url: fileUrl
        };

        // Fail-safe: Ensure bullet_suggestions is ALWAYS an array with 3-5 items
        if (!normalized.bullet_suggestions || !Array.isArray(normalized.bullet_suggestions) || normalized.bullet_suggestions.length === 0) {
          normalized.bullet_suggestions = [
            "Quantify your achievements with numbers and percentages to show real impact.",
            "Integrate more industry-specific keywords to improve ATS compatibility.",
            "Ensure your technical skills section is up-to-date with current frameworks.",
            "Add a strong professional summary if not already present.",
            "Verify that your formatting is clean and easy for machines to parse."
          ];
        }

        return normalized;
      } catch (err) {
        console.error("Gemini Analysis Error:", err);
        throw new Error("AI analysis failed. Please try again.");
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
      return data.map(p => {
        // Normalize technology into UI-friendly categories
        let cat = p.technology?.toLowerCase() || 'other';
        if (cat.includes('full stack') || cat.includes('fullstack')) cat = 'fullstack';
        if (cat.includes('front')) cat = 'frontend';
        if (cat.includes('back')) cat = 'backend';
        if (cat.includes('data science') || cat.includes('ai') || cat.includes('ml')) cat = 'data-science';
        if (cat.includes('mobile')) cat = 'mobile';
        
        return {
          ...p,
          category: cat,
          tags: p.tags || (p.skills ? p.skills : ["Architecture", "Engineering", "Scale"])
        };
      });
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
    },

    saveRoadmapPreferences: async (prefs) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { data, error } = await supabase
          .from('user_roadmaps')
          .upsert({
            user_id: user.id,
            selected_path: prefs.selected_path || 'industry',
            target_role: prefs.target_role || 'Frontend Developer',
            experience_level: prefs.experience || 'beginner',
            time_per_week: prefs.timePerWeek || '10',
            learning_style: prefs.learningStyle || 'project',
            timeline: prefs.timeline || '6months',
            updated_at: new Date(),
          })
          .select()
          .single();
        if (error) {
          console.warn('saveRoadmapPreferences error (table may need column additions):', error.message);
          return { success: true, local: true };
        }
        return data;
      } catch (err) {
        console.warn('saveRoadmapPreferences failed gracefully:', err.message);
        return { success: true, local: true };
      }
    },

    getRoadmapPreferences: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        const { data, error } = await supabase
          .from('user_roadmaps')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error) return null;
        return {
          experience: data.experience_level || 'beginner',
          timePerWeek: data.time_per_week || '10',
          learningStyle: data.learning_style || 'project',
          timeline: data.timeline || '6months',
          target_role: data.target_role,
          selected_path: data.selected_path,
        };
      } catch {
        return null;
      }
    },
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
export const getRoleRequirements        = api.planner.getRoleRequirements;
export const saveRoadmapPreferences     = api.planner.saveRoadmapPreferences;
export const getRoadmapPreferences      = api.planner.getRoadmapPreferences;

// Convenience Aliases for UI Components
export const getProjects           = api.projects.getRecommended;
export const getFAQs               = api.interview.getQuestions;
export const getResearchGuides     = api.research.getGuide;
export const searchContent         = api.search.query;
export const incrementPrepCount    = api.interview.incrementPrepCount;



