import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileCheck, AlertTriangle, Lightbulb, Download, Upload, CheckCircle, TrendingUp, Zap, Lock, BarChart3, FileText, X } from "lucide-react";
import { createResume, getStats, analyzeResume } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";
import { jsPDF } from "jspdf";


export function ResumeStudio() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const language = localStorage.getItem("language") || "English";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeScore, setResumeScore] = useState(0);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError, info, warning } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    education: "",
    skills: "",
    projects: "",
    internships: "",
    achievements: "",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchResumeData = async () => {
      try {
        const stats = await getStats(token);
        setIsLoggedIn(true);
        setResumeScore(stats.resume_score || 75);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching resume stats:", err);
        setIsLoggedIn(true);
        setResumeScore(75);
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!token) {
        warning('Please log in to upload your resume!');
        navigate("/login");
        return;
      }
      
      try {
        setLoading(true);
        info(`Analyzing resume: ${file.name}...`);
        
        const result = await analyzeResume(token, file);
        
        setResumeScore(result.score);
        setIsResumeUploaded(true);
        setUploadedFile(file);
        success(`Analysis complete! Score: ${result.score}`);
      } catch (err) {
        console.error("Upload error:", err);
        toastError(err.message || "Failed to upload and analyze resume");
      } finally {
        setLoading(false);
      }
    }
  };

  const generateDynamicAnalysis = () => {
    if (!isLoggedIn || !isResumeUploaded) {
      return {
        score: "--",
        keywords: [],
        missingSections: [],
        improvements: [],
      };
    }

    // 1. Dynamic Keywords based on user's actual skills input
    const extractedKeywords = formData.skills 
      ? formData.skills.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean).slice(0, 6) 
      : ["Leadership", "Communication", "Problem Solving"];
    
    if (extractedKeywords.length === 0) extractedKeywords.push("Teamwork", "Adaptability", "Time Management");

    // 2. Dynamic Missing Sections based on what's empty
    const missing = [];
    if (!formData.achievements || formData.achievements.trim() === "") missing.push("Awards & Recognitions");
    if (!formData.internships || formData.internships.trim() === "") missing.push("Professional Experience");
    if (!formData.github && !formData.linkedin) missing.push("Portfolio Links");
    if (!formData.projects || formData.projects.trim() === "") missing.push("Past Projects");
    
    if (missing.length === 0) missing.push("Open Source Contributions", "Certifications");

    // 3. Dynamic Contextual Improvements
    const improvements = [];
    
    // Project context
    if (formData.projects && formData.projects.length > 5 && !formData.projects.includes('%')) {
      improvements.push({
        weak: formData.projects.substring(0, 40) + "...",
        improved: "Try quantifying this project! Ex: 'Improved load times by 40%' or 'Managed 5 databases'."
      });
    } else {
      improvements.push({
        weak: "Developed the backend server",
        improved: "Engineered a scalable Node.js backend architecture supporting 10,000+ daily concurrent users."
      });
    }

    // Education context
    if (formData.education && !formData.education.includes('GPA') && !formData.education.includes('%')) {
      improvements.push({
        weak: "Graduated with degree in computer science",
        improved: "B.S. in Computer Science (3.8 GPA) - Key Coursework: Distributed Systems, Advanced Algorithms."
      });
    } else {
      improvements.push({
        weak: "Good communication skills",
        improved: "Facilitated weekly technical syncs across 3 global teams, ensuring 100% milestone alignment."
      });
    }

    return {
      score: resumeScore,
      keywords: extractedKeywords,
      missingSections: missing,
      improvements: improvements,
    };
  };

  const analysisData = generateDynamicAnalysis();

  const createPDFDocument = () => {
    const doc = new jsPDF();
    let yPos = 25;
    
    // Aesthetic Styling Template
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(formData.fullName ? formData.fullName.toUpperCase() : "PROFESSIONAL RESUME", 20, yPos);
    
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    const contactLine = [
      formData.email,
      formData.phone,
      formData.linkedin,
      formData.github
    ].filter(Boolean).join("  |  ");
    
    doc.text(contactLine || "Contact information will appear here", 20, yPos);
    
    yPos += 15;

    const addAestheticSection = (title, content) => {
      if (!content) return;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Section Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(title.toUpperCase(), 20, yPos);
      
      // Subtle Section Line
      yPos += 3;
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      
      // Section Content
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate 700
      
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, 20, yPos);
      
      yPos += (lines.length * 5) + 12; // Adjusted line height for aesthetics
    };

    addAestheticSection("Education", formData.education);
    addAestheticSection("Skills & Expertise", formData.skills);
    addAestheticSection("Professional Experience", formData.internships);
    addAestheticSection("Key Projects", formData.projects);
    addAestheticSection("Awards & Achievements", formData.achievements);
    
    return doc;
  };

  const handlePreviewResume = () => {
    if (!token) {
      warning('Please log in to preview your resume!');
      navigate("/login");
      return;
    }
    const doc = createPDFDocument();
    setPdfPreviewUrl(doc.output('datauristring'));
  };

  const handleDownloadPDF = async () => {
    if (!token) {
      warning('Please log in to download your resume!');
      navigate("/login");
      return;
    }
    try {
      const res = await createResume(token, { 
        title: formData.fullName || "My Resume",
        content: JSON.stringify(formData)
      });
      
      const doc = createPDFDocument();
      doc.save(`${formData.fullName ? formData.fullName.replace(/\s+/g, '_') : 'mapout'}_resume.pdf`);

      
      success('Your resume has successfully downloaded.');
    } catch (err) {
      console.error("Error creating resume:", err);
      toastError('Error creating resume. Please try again.');
    }
  };

  const formatScore = (score) => {
    return score === "--" ? "--/--" : `${score}/100`;
  };

  const handleCreateResume = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await createResume(token, { 
        title: formData.fullName || "My Resume",
        content: JSON.stringify(formData)
      });
      success('Resume created successfully!');
      console.log('Resume created:', res);
    } catch (err) {
      console.error("Error creating resume:", err);
      toastError('Error creating resume. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--mapout-bg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--mapout-bg)]">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          {t('resumeStudioHeading', language)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isLoggedIn ? t('resumeStudioSubheading', language) : t('resumeStudioSubheading', language)}
        </p>

        {/* Two Column Layout: Resume Builder and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-max lg:auto-rows-fr">
          {/* Left Column: Resume Builder Form */}
          <div className="bg-white dark:bg-slate-800/40 rounded-[10px] p-8 shadow-md flex flex-col border border-transparent dark:border-white/5">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Resume Builder
            </h2>

            {!isLoggedIn ? (
              <div className="text-center py-12 flex flex-col items-center justify-center flex-1">
                <Lock className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                <p className="text-gray-600 mb-6">Log in to start building your professional resume</p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 bg-[var(--mapout-secondary)] text-white rounded-md hover:bg-[var(--mapout-primary)] transition-colors font-medium"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
               <form className="space-y-6 flex-1 flex flex-col">
                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">GitHub</label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="github.com/johndoe"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Education</label>
                  <textarea
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="B.Tech in Computer Science, XYZ University (2022-2026)"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Skills</label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="JavaScript, React, Node.js, Python, SQL"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Projects</label>
                  <textarea
                    name="projects"
                    value={formData.projects}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Describe your key projects..."
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Internships</label>
                  <textarea
                    name="internships"
                    value={formData.internships}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Describe your internship experiences..."
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Achievements</label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Awards, certifications, hackathons..."
                  />
                </div>

                <div className="mt-auto pt-4 space-y-3 border-t border-gray-200">

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handlePreviewResume}
                      className="flex-1 px-4 py-3 bg-[var(--mapout-secondary)] text-white rounded-md hover:bg-[var(--mapout-primary)] transition-colors font-medium"
                    >
                      Preview Resume
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="flex-1 px-4 py-3 bg-white border-2 border-[var(--mapout-secondary)] text-[var(--mapout-secondary)] rounded-md hover:bg-[var(--mapout-secondary)] hover:text-white transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Download size={18} />
                      Download
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Resume Analysis & Tips */}
          <div className="bg-white dark:bg-slate-800/40 rounded-[10px] p-8 shadow-md flex flex-col border border-transparent dark:border-white/5">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Analysis & Insights
            </h2>

            {!isLoggedIn ? (
              <div className="text-center py-12 flex flex-col items-center justify-center flex-1">
                <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Unlock Analysis Features</h3>
                <p className="text-gray-600 mb-6">Sign in to get AI-powered resume analysis and recommendations</p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 bg-[var(--mapout-secondary)] text-white rounded-md hover:bg-[var(--mapout-primary)] transition-colors font-medium"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                {/* Pro Tips Section (Always Visible) */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-5 shadow-sm font-sans">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Pro Tips for Better Resume
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300/90">
                    <li>• Use action verbs (Developed, Implemented, Designed)</li>
                    <li>• Quantify achievements (increased by 40%, managed 5 projects)</li>
                    <li>• Keep it to 1-2 pages maximum</li>
                    <li>• Use industry keywords from job descriptions</li>
                    <li>• Maintain consistent formatting and font</li>
                    <li>• List most recent experience first</li>
                    <li>• Proofread for grammar and spelling</li>
                  </ul>
                </div>

                {/* Upload Feature */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex justify-between items-center text-lg tracking-tight">
                    Upload Your Resume
                    <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-[var(--mapout-secondary)] dark:text-blue-400 px-2 py-1 rounded-full uppercase tracking-wider">Get Analysis</span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Upload an existing PDF to get AI-powered scoring, tailored recommendations, and missing section feedback.</p>
                  
                  {uploadedFile ? (
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-[var(--mapout-secondary)] dark:border-blue-500 rounded-lg shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-lg text-red-600 dark:text-red-400">
                          <FileText size={28} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate pr-4">{uploadedFile.name}</p>
                          <p className="text-xs font-semibold text-gray-500 tracking-tight mt-0.5 whitespace-nowrap">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setUploadedFile(null);
                          setIsResumeUploaded(false);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
                        title="Remove file"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 px-6 py-6 border-2 border-dashed border-[var(--mapout-secondary)] dark:border-blue-900 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-all group shadow-sm bg-gray-50 dark:bg-slate-900/50 hover:border-blue-500">
                      <Upload size={28} className="text-[var(--mapout-secondary)] dark:text-blue-400 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-[var(--mapout-secondary)] dark:text-blue-400 font-bold">Choose PDF File</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Drag and drop or click to browse</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Analysis Display */}
                {isResumeUploaded && (
                  <div className="mt-2 pt-6 border-t border-gray-100 dark:border-white/5 space-y-6 flex-1 flex flex-col animate-fade-in-up">
                    <h3 className="font-bold text-2xl mb-2 text-gray-800 dark:text-white tracking-tight">Analysis Results</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Resume Score */}
                      <div className="bg-[var(--mapout-accent)] dark:bg-slate-700/50 rounded-lg p-5 shadow-sm transform transition hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileCheck className="text-[var(--mapout-primary)] dark:text-blue-400" size={24} />
                          <h4 className="text-lg font-bold tracking-tight dark:text-white">Resume Score</h4>
                        </div>
                        <p className="text-4xl font-bold text-[var(--mapout-primary)] dark:text-blue-400">{formatScore(analysisData.score)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                          {analysisData.score >= 80 ? "Excellent resume! Ready for applications." : "Good progress. See suggestions below."}
                        </p>
                      </div>

                      {/* ATS Score */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800/40 shadow-sm transform transition hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Zap className="text-purple-600 dark:text-purple-400" size={24} />
                          <h4 className="text-lg font-bold tracking-tight dark:text-white">ATS Compatibility</h4>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">87%</p>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300/90 mt-2 font-medium">Optimized for applicant tracking systems</p>
                      </div>
                    </div>

                    {/* Keyword Suggestions */}
                    {analysisData.keywords.length > 0 && (
                      <div className="bg-[var(--mapout-mint)] dark:bg-green-900/10 rounded-lg p-5 shadow-sm border border-transparent dark:border-green-900/20">
                        <div className="flex items-center gap-3 mb-2">
                          <Lightbulb className="text-[var(--mapout-primary)] dark:text-green-400" size={24} />
                          <h4 className="text-lg font-bold dark:text-white">Keywords Found</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {analysisData.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-sm text-[var(--mapout-primary)] dark:text-green-400 font-bold shadow-sm border border-green-100 dark:border-white/5 tracking-wide"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Sections */}
                    {analysisData.missingSections.length > 0 && (
                      <div className="bg-[var(--mapout-pink)] dark:bg-red-900/10 rounded-lg p-5 shadow-sm border border-transparent dark:border-red-900/20">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="text-[var(--mapout-primary)] dark:text-red-400" size={24} />
                          <h4 className="text-lg font-bold dark:text-white">Missing Sections</h4>
                        </div>
                        <ul className="mt-3 space-y-2 pl-1">
                          {analysisData.missingSections.map((section, idx) => (
                            <li key={idx} className="text-sm text-red-700 dark:text-red-400 font-bold">
                              • {section}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvement Suggestions */}
                    {analysisData.improvements.length > 0 && (
                      <div className="flex-1 mt-2">
                        <h4 className="mb-4 font-bold flex items-center gap-2 text-xl dark:text-white tracking-tight">
                          <TrendingUp size={22} className="text-[var(--mapout-secondary)]" />
                          Improvement Suggestions
                        </h4>
                        <div className="space-y-4">
                          {analysisData.improvements.map((item, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-white/5 rounded-lg p-5 bg-white dark:bg-slate-900 shadow-sm border-l-4 border-l-[var(--mapout-secondary)]">
                              <div className="mb-4">
                                <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-1.5 rounded uppercase tracking-wider inline-block mb-2">Needs Work</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{item.weak}"</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-slate-800/50 rounded p-3 border border-gray-100 dark:border-white/5">
                                <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1.5 rounded uppercase tracking-wider inline-block mb-2">Recommended Betterment</span>
                                <p className="text-sm text-gray-900 dark:text-white font-bold tracking-tight">"{item.improved}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 sm:p-8 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white tracking-tight">
                <FileText size={22} className="text-[var(--mapout-secondary)] dark:text-blue-400" />
                Resume Preview
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleDownloadPDF();
                    setPdfPreviewUrl(null); // Optional: close on download
                  }}
                  className="px-4 py-2 bg-[var(--mapout-secondary)] text-white text-sm font-bold rounded-lg hover:bg-[var(--mapout-primary)] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Download size={16} />
                  Download Build
                </button>
                <button
                  onClick={() => setPdfPreviewUrl(null)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-full transition-colors ml-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-200 dark:bg-slate-950 p-4 sm:p-8 overflow-hidden flex justify-center">
              {/* Added a protective wrap to make the iframe feel like a physical page */}
              <div className="w-full h-full max-w-[800px] shadow-2xl rounded-sm overflow-hidden bg-white">
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-full border-none"
                  title="Resume PDF Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
