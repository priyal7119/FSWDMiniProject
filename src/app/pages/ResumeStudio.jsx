import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileCheck, AlertTriangle, Lightbulb, Download, Upload, CheckCircle, TrendingUp, Zap, Lock, BarChart3, FileText, X, ChevronRight } from "lucide-react";
import { createResume, getStats, analyzeResume, getResumes } from "../utils/api.js";
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
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("builder"); // builder, analysis, history
  const [analysisResults, setAnalysisResults] = useState(null);
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

    const fetchData = async () => {
      try {
        setIsLoggedIn(true);
        const [stats, history] = await Promise.all([
          getStats(token),
          getResumes(token)
        ]);
        setResumeScore(stats.resume_score || 75);
        setResumeHistory(history || []);
        
        // If there's a recent resume with content, pre-fill the form
        if (history && history.length > 0 && history[0].content) {
          try {
            const savedContent = JSON.parse(history[0].content);
            setFormData(prev => ({ ...prev, ...savedContent }));
          } catch(e) { console.error("Error parsing saved resume", e); }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        setAnalyzing(true);
        info(`Analyzing resume: ${file.name}...`);
        
        const result = await analyzeResume(token, file);
        
        setAnalysisResults(result);
        setResumeScore(result.score);
        setIsResumeUploaded(true);
        setUploadedFile(file);
        setActiveTab("analysis"); // Switch to analysis view
        success(`Analysis complete! Score: ${result.score}`);
        
        // Refresh history to include this upload if it was saved
        const history = await getResumes(token);
        setResumeHistory(history);
      } catch (err) {
        console.error("Upload error:", err);
        toastError(err.message || "Failed to upload and analyze resume");
      } finally {
        setAnalyzing(false);
      }
    }
  };

  // Analysis data now comes directly from analysisResults state after upload
  // or is derived from form completion for the builder

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
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, 20, yPos);
      
      yPos += (lines.length * 5) + 12; 
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
      const doc = createPDFDocument();
      // Calculate score based on form completion
      const completionScore = Math.min(
        Object.values(formData).filter(v => v && v.length > 5).length * 10,
        95
      );

      await createResume(token, { 
        title: formData.fullName || "My Resume",
        content: JSON.stringify(formData),
        analysis_score: { score: completionScore }
      });
      
      doc.save(`${formData.fullName ? formData.fullName.replace(/\s+/g, '_') : 'mapout'}_resume.pdf`);
      
      // Refresh history
      const history = await getResumes(token);
      setResumeHistory(history);
      
      success('Your resume has successfully downloaded.');
    } catch (err) {
      console.error("Error creating resume:", err);
      toastError('Error creating resume. Please try again.');
    }
  };

  const formatScore = (score) => {
    if (score === "--" || !score) return "--/--";
    return `${score}/100`;
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

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-white/10">
          {[
            { id: "builder", label: "Resume Builder", icon: FileText },
            { id: "analysis", label: "AI Analysis", icon: Zap },
            { id: "history", label: "My History", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-[var(--mapout-secondary)] text-[var(--mapout-secondary)] bg-blue-50/50 dark:bg-blue-900/10"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area (8 cols) */}
          <div className="lg:col-span-8">
            {!isLoggedIn ? (
              <div className="bg-white dark:bg-slate-800/40 rounded-xl p-12 shadow-md border border-gray-100 dark:border-white/5 text-center flex flex-col items-center">
                <Lock className="w-20 h-20 text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Sign In Required</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">Log in to unlock all professional resume features, AI analysis, and cloud saving.</p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-10 py-3 bg-[var(--mapout-secondary)] text-white rounded-xl hover:bg-[var(--mapout-primary)] transition-all font-bold shadow-lg"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800/40 rounded-xl p-8 shadow-md border border-gray-100 dark:border-white/5 min-h-[600px]">
                {activeTab === "builder" && (
                  <form className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder-gray-400" placeholder="e.g. Priyal Sharma" />
                      </div>
                      <div>
                        <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-gray-50 dark:border-white/5">
                      <div>
                        <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Education</label>
                        <textarea name="education" value={formData.education} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none" placeholder="Master of Science in Computer Science, Stanford University..." />
                      </div>
                      <div>
                        <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Technical Skills</label>
                        <textarea name="skills" value={formData.skills} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none" placeholder="React, Node.js, AWS, Kubernetes, Python..." />
                      </div>
                      <div>
                        <label className="block mb-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Professional Experience</label>
                        <textarea name="internships" value={formData.internships} onChange={handleChange} rows={5} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none" placeholder="Senior Software Engineer at Google..." />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-8">
                      <button type="button" onClick={handlePreviewResume} className="flex-1 px-6 py-4 bg-[var(--mapout-secondary)] text-white rounded-xl hover:bg-[var(--mapout-primary)] transition-all font-bold shadow-lg flex items-center justify-center gap-2">
                         <FileText size={20} /> Preview Resume
                      </button>
                      <button type="button" onClick={handleDownloadPDF} className="flex-1 px-6 py-4 bg-white border-2 border-[var(--mapout-secondary)] text-[var(--mapout-secondary)] rounded-xl hover:bg-blue-50 transition-all font-bold flex items-center justify-center gap-2">
                        <Download size={20} /> Download PDF
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "analysis" && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-8 border border-dashed border-gray-300 dark:border-white/10 text-center">
                      <h3 className="text-xl font-bold mb-4">Live Resume Analyzer</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your existing PDF to get a deep-dive analysis on keywords, ATS formatting, and impact scoring.</p>
                      
                      {uploadedFile ? (
                        <div className="max-w-md mx-auto p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-500 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="text-red-500" />
                            <div className="text-left">
                              <p className="text-sm font-bold truncate max-w-[200px]">{uploadedFile.name}</p>
                              <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer group">
                          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="text-[var(--mapout-secondary)]" size={32} />
                          </div>
                          <span className="font-bold text-[var(--mapout-secondary)]">Click to upload PDF</span>
                          <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                        </label>
                      )}
                    </div>

                    {analyzing && (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="font-bold text-blue-500 tracking-widest uppercase text-xs">AI is scanning your document...</p>
                      </div>
                    )}

                    {isResumeUploaded && analysisResults && (
                      <div className="space-y-8 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-sm font-bold uppercase text-blue-800 dark:text-blue-300">Overall Score</span>
                              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{analysisResults.score}%</span>
                            </div>
                            <div className="h-3 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${analysisResults.score}%` }}></div>
                            </div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-sm font-bold uppercase text-purple-800 dark:text-purple-300">ATS Compatibility</span>
                              <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{analysisResults.ats_compatibility}%</span>
                            </div>
                            <div className="h-3 bg-purple-100 dark:bg-purple-900/40 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${analysisResults.ats_compatibility}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold text-lg flex items-center gap-2">
                            <Zap size={18} className="text-yellow-500" /> Key Strengths Found
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.keywords.map((kw, i) => (
                              <span key={i} className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-bold border border-green-100 dark:border-green-900/30">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold text-lg flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-500" /> Improvement Suggestions
                          </h4>
                          <div className="space-y-3">
                            {analysisResults.missing.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 border-l-4 border-blue-500 rounded-r-lg">
                                <AlertTriangle className="text-yellow-500" size={20} />
                                <span className="font-medium text-gray-700 dark:text-gray-300">Consider adding more evidence of <strong>{item}</strong> proficiency.</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                   <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Your Saved Resumes</h3>
                        <span className="text-xs font-bold px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full">{resumeHistory.length} Resumes Saved</span>
                      </div>
                      
                      {resumeHistory.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {resumeHistory.map((res, i) => (
                            <div key={i} className="p-6 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between hover:border-blue-500/50 transition-all cursor-pointer group" onClick={() => {
                              if (res.content) {
                                setFormData(JSON.parse(res.content));
                                setActiveTab("builder");
                                success("Resume loaded into editor!");
                              }
                            }}>
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                  <FileText className="text-blue-500" size={24} />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{res.title}</p>
                                  <p className="text-xs text-gray-500">{new Date(res.created_at).toLocaleDateString()} • {res.analysis_score?.score || 75}% Score</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className={`px-4 py-1.5 rounded-full text-xs font-black ${(res.analysis_score?.score || 75) > 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {res.analysis_score?.score || 75}/100
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-all" size={20} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                          <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                          <p className="text-gray-500 font-medium">No resumes saved yet. Build your first one!</p>
                        </div>
                      )}
                   </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <Lightbulb size={24} />
                  </div>
                  <h3 className="font-bold text-lg tracking-tight">Pro Mastery Tips</h3>
                </div>
                <div className="space-y-4 text-sm font-medium text-blue-50/90 leading-relaxed">
                  <div className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs">01</span>
                    <p>Use <strong>Action Verbs</strong> (Architected, Orchestrated, Spearheaded) to start bullet points.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs">02</span>
                    <p>Quantify everything. <em>"Increased speed by 40%"</em> beats <em>"Made it fast"</em>.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-xs">03</span>
                    <p>Mirror the job description keywords for <strong>ATS Optimization</strong>.</p>
                  </div>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-800/40 rounded-xl p-6 shadow-md border border-gray-100 dark:border-white/5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-500" /> Your Impact Score
                </h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-slate-900" />
                      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={213} strokeDashoffset={213 - (213 * resumeScore / 100)} className="text-blue-500" />
                    </svg>
                    <span className="absolute text-xl font-black text-slate-800 dark:text-white">{resumeScore}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-gray-200">Current Standing</p>
                    <p className="text-xs text-gray-500 font-medium">{resumeScore > 80 ? "Top 5% Expert" : resumeScore > 60 ? "Strategic Professional" : "Growth Stage"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab("analysis")}
                  className="w-full py-2.5 text-blue-600 dark:text-blue-400 font-bold text-sm bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Deep Analysis Report
                </button>
             </div>
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
