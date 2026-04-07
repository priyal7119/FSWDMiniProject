// API Integration Service
// Handles communication with backend APIs and external services

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

class APIIntegration {
  // Jobs API - Fetch real job listings
  static async fetchJobs(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/jobs?${query}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return await response.json();
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Return mock data as fallback
      return this.getMockJobs();
    }
  }

  // Companies API - Fetch company information
  static async fetchCompanies(searchTerm = "") {
    try {
      const response = await fetch(`${API_BASE_URL}/companies?search=${searchTerm}`);
      if (!response.ok) throw new Error("Failed to fetch companies");
      return await response.json();
    } catch (error) {
      console.error("Error fetching companies:", error);
      return [];
    }
  }

  // Skills Demand API - Fetch real-time skill trends
  static async fetchSkillsDemand() {
    try {
      const response = await fetch(`${API_BASE_URL}/skills/demand`);
      if (!response.ok) throw new Error("Failed to fetch skills demand");
      return await response.json();
    } catch (error) {
      console.error("Error fetching skills demand:", error);
      return this.getMockSkillsDemand();
    }
  }

  // GitHub Integration
  static async fetchGitHubProfile(username) {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) throw new Error("GitHub user not found");
      const data = await response.json();
      return {
        name: data.name,
        bio: data.bio,
        repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        profileUrl: data.html_url,
        avatar: data.avatar_url,
      };
    } catch (error) {
      console.error("Error fetching GitHub profile:", error);
      return null;
    }
  }

  // User Authentication
  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // User Registration
  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Registration failed");
      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Resume Analysis API
  static async analyzeResume(resumeFile) {
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Resume analysis failed");
      return await response.json();
    } catch (error) {
      console.error("Resume analysis error:", error);
      throw error;
    }
  }

  // Save User Profile
  static async saveUserProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error("Failed to save profile");
      return await response.json();
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  }

  // Get User Profile
  static async getUserProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      return await response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  // Apply for Job
  static async applyForJob(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      });
      if (!response.ok) throw new Error("Application failed");
      return await response.json();
    } catch (error) {
      console.error("Job application error:", error);
      throw error;
    }
  }

  // Get User's Job Applications
  static async getApplications() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/applications`, {
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      });
      if (!response.ok) throw new Error("Failed to fetch applications");
      return await response.json();
    } catch (error) {
      console.error("Error fetching applications:", error);
      return [];
    }
  }

  // Helper method to get auth token
  static getAuthToken() {
    return localStorage.getItem("authToken") || "";
  }

  // Helper method to log out
  static logout() {
    localStorage.removeItem("authToken");
  }

  // Mock data for fallback
  static getMockJobs() {
    return [
      {
        id: 1,
        title: "Senior Frontend Developer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        salary: "$150,000 - $200,000",
        type: "Full-time",
        level: "Senior",
        remote: true,
        skills: ["React", "TypeScript", "CSS"],
        description: "Looking for an experienced Frontend Developer...",
        postedAt: "2024-01-15",
      },
      {
        id: 2,
        title: "Full Stack JavaScript Developer",
        company: "StartUp Inc",
        location: "Remote",
        salary: "$120,000 - $160,000",
        type: "Full-time",
        level: "Mid",
        remote: true,
        skills: ["JavaScript", "Node.js", "React", "MongoDB"],
        description: "Join our growing team as a Full Stack Developer...",
        postedAt: "2024-01-14",
      },
    ];
  }

  // Mock skills demand data
  static getMockSkillsDemand() {
    return [
      { skill: "React", demand: 95, trend: "up" },
      { skill: "Python", demand: 90, trend: "up" },
      { skill: "AWS", demand: 85, trend: "up" },
      { skill: "TypeScript", demand: 80, trend: "up" },
      { skill: "Docker", demand: 75, trend: "steady" },
      { skill: "GraphQL", demand: 70, trend: "up" },
    ];
  }
}

export default APIIntegration;
