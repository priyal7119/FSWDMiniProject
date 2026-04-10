import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  FileCheck, AlertTriangle, Lightbulb, Download, 
  Upload, CheckCircle, TrendingUp, Zap, Lock, 
  BarChart3, FileText, X, ChevronRight, PenTool, 
  Clipboard, Archive, Map, Shield, Layout, Trophy, Target, Search 
} from "lucide-react";
import { createResume, getStats, analyzeResume, getResumes, getSkills } from "../utils/api.js";
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
  const [analysisResults, setAnalysisResults] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { success, error: toastError, info, warning } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", linkedin: "", github: "",
    education: "", skills: "", projects: "", internships: "", achievements: "",
  });

  const fetchHistory = async () => {
    if (!token) return;
    try {
      setHistoryLoading(true);
      const history = await getResumes(token);
      setResumes(history || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoggedIn(true);
        const [stats] = await Promise.all([
          getStats(token)
        ]);
        setResumeScore(stats.resume_score || 75);
        await fetchHistory();
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

  const createPDFDocument = () => {
    const doc = new jsPDF();
    let yPos = 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(30, 41, 59);
    doc.text(formData.fullName ? formData.fullName.toUpperCase() : "PROFESSIONAL RESUME", 20, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const contactLine = [formData.email, formData.phone, formData.linkedin, formData.github].filter(Boolean).join("  |  ");
    doc.text(contactLine || "Contact details", 20, yPos);
    yPos += 15;
    const addSection = (title, content) => {
      if (!content) return;
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(15, 23, 42);
      doc.text(title.toUpperCase(), 20, yPos);
      yPos += 3; doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.5); doc.line(20, yPos, 190, yPos);
      yPos += 8; doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(content, 170); doc.text(lines, 20, yPos);
      yPos += (lines.length * 5) + 12; 
    };
    addSection("Education", formData.education);
    addSection("Skills & Expertise", formData.skills);
    addSection("Professional Experience", formData.internships);
    addSection("Key Projects", formData.projects);
    addSection("Awards & Achievements", formData.achievements);
    return doc;
  };

  const handleDownloadPDF = async () => {
    if (!token) { navigate("/login"); return; }
    try {
      const result = analysisResults || { score: resumeScore || 75 };
      await createResume(token, { 
        title: formData.fullName || "My Resume", 
        content: JSON.stringify({ ...formData, analysis: result }),
        analysis_score: result 
      });
      const doc = createPDFDocument();
      doc.save(`${formData.fullName ? formData.fullName.replace(/\s+/g, '_') : 'mapout'}_resume.pdf`);
      success('Your resume has successfully downloaded and saved.');
      fetchHistory();
    } catch (err) {
      toastError('Error creating resume. Please try again.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && token) {
      try {
        setLoading(true);
        const result = await analyzeResume(token, file);
        
        // Save to database
        await createResume(token, {
          title: file.name,
          content: JSON.stringify({ analysis: result }),
          analysis_score: result,
          file_url: result.url
        });

        setResumeScore(result.score);
        setAnalysisResults(result);
        setIsResumeUploaded(true);
        setUploadedFile(file);
        success(`Analysis complete! Successfully saved to your archive.`);
        fetchHistory();
      } catch (err) {
        toastError("Failed to upload and analyze resume");
      } finally {
        setLoading(false);
      }
    } else if (!token) {
      navigate("/login");
    }
  };

  const loadFromHistory = (resume) => {
    try {
      const data = JSON.parse(resume.content);
      const analysis = resume.analysis_score || data.analysis;
      
      if (data.fullName !== undefined) {
        // This is a form-based resume
        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          education: data.education || "",
          skills: data.skills || "",
          projects: data.projects || "",
          internships: data.internships || "",
          achievements: data.achievements || "",
        });
      }

      if (analysis) {
        setResumeScore(analysis.score);
        setAnalysisResults(analysis);
        setIsResumeUploaded(true);
        success(`Loaded analysis for ${resume.title}`);
      }
    } catch (err) {
      toastError("Failed to load historical data");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="mb-12 animate-in fade-in slide-in-from-left-4 duration-700">
        <h1 className="text-5xl font-black tracking-tight mb-3 font-header text-foreground">
          Resume <span className="text-primary">Studio.</span>
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
          Build, analyze, and optimize your resume with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Builder Column */}
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm">
            <h2 className="text-2xl font-black mb-8 tracking-tight flex items-center gap-3 text-foreground">
              <PenTool className="text-primary" size={24} /> Resume Builder
            </h2>
            <div className="space-y-6">
              {[
                { label: "Full Name", name: "fullName", placeholder: "John Doe" },
                { label: "Email Address", name: "email", placeholder: "john@example.com" },
                { label: "Phone Number", name: "phone", placeholder: "+1 234 567 8900" },
                { label: "LinkedIn URL", name: "linkedin", placeholder: "linkedin.com/in/johndoe" },
                { label: "GitHub URL", name: "github", placeholder: "github.com/johndoe" }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full px-6 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-foreground"
                  />
                </div>
              ))}
              
              {[
                { label: "Education Mastery", name: "education", placeholder: "B.Tech in Computer Science, XYZ University (2022-2026)" },
                { label: "Skill Clusters", name: "skills", placeholder: "JavaScript, React, Node.js, Python, SQL" },
                { label: "Technical Projects", name: "projects", placeholder: "Describe your architectural outputs..." },
                { label: "Internships", name: "internships", placeholder: "Describe your internship experiences..." },
                { label: "Achievements", name: "achievements", placeholder: "Awards, certifications, hackathons..." }
              ].map((area) => (
                <div key={area.name}>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{area.label}</label>
                  <textarea
                    name={area.name}
                    value={formData[area.name]}
                    onChange={handleChange}
                    rows={3}
                    placeholder={area.placeholder}
                    className="w-full px-6 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-foreground"
                  />
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setPdfPreviewUrl(createPDFDocument().output('datauristring'))}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-teal-500/20"
                >
                  Preview Resume
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 py-4 bg-muted border border-border text-foreground rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Column */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Analysis & Insights</h2>

          {/* Pro Tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8">
            <h3 className="text-lg font-black text-blue-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-blue-600" /> Pro Tips for Better Resume
            </h3>
            <ul className="space-y-2">
              {[
                "Use action verbs (Developed, Implemented, Designed)",
                "Quantify achievements (increased by 40%, managed 5 projects)",
                "Keep it to 1-2 pages maximum",
                "Use industry keywords from job descriptions",
                "Maintain consistent formatting and font",
                "List most recent experience first",
                "Proofread for grammar and spelling"
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium text-blue-800/80">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Upload Section */}
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-foreground">Upload Your Resume</h3>
              <button className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                Get Analysis
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-6">Upload an existing PDF to get AI-powered scoring, tailored recommendations, and missing section feedback.</p>
            
            <label className="flex flex-col items-center justify-center gap-4 py-12 border-2 border-dashed border-border rounded-[2rem] hover:bg-muted/30 cursor-pointer transition-all group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                <Upload size={28} />
              </div>
              <div className="text-center">
                <p className="font-black text-sm uppercase tracking-widest mb-1 text-foreground">Upload Archive</p>
                <p className="text-xs text-muted-foreground font-medium">Verify existing files for optimization.</p>
              </div>
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Analysis Results Container */}
          <div className="space-y-6">
            <h3 className="text-xl font-black tracking-tight">Analysis Results</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="text-indigo-600" size={18} />
                  <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Resume Score</span>
                </div>
                <p className="text-4xl font-black text-indigo-900 mb-2">{resumeScore || 82}<span className="text-lg text-indigo-400">/100</span></p>
                <p className="text-[10px] text-indigo-700/70 font-bold leading-tight">Excellent resume! Ready for applications.</p>
              </div>
              <div className="p-8 bg-purple-50 border border-purple-100 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="text-purple-600" size={18} />
                  <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">ATS Compatibility</span>
                </div>
                <p className="text-4xl font-black text-purple-900 mb-2">87<span className="text-lg text-purple-400">%</span></p>
                <p className="text-[10px] text-purple-700/70 font-bold leading-tight">Optimized for applicant tracking systems.</p>
              </div>
            </div>

            {/* Keywords Found */}
            <div className="p-8 bg-teal-50 border border-teal-100 rounded-[2rem] shadow-sm">
              <h4 className="text-[10px] font-black text-teal-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Search size={14} /> Keywords Found
              </h4>
              <div className="flex flex-wrap gap-2">
                {["React", "JavaScript", "Node.js", "Git", "Agile"].map((tag) => (
                  <span key={tag} className="px-4 py-1.5 bg-white border border-teal-200 rounded-full text-xs font-bold text-teal-800">{tag}</span>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="p-8 bg-primary text-white rounded-[2rem] shadow-2xl shadow-teal-500/10 mb-10 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-black text-lg mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-teal-200" /> AI Suggestions
                </h4>
                <p className="text-sm font-medium leading-relaxed italic opacity-90">
                  {resumeScore >= 80 ? "Your resume looks great! It's ready for applications." : "Some sections could be improved. Try adding more skills or project details to boost your score."}
                </p>
              </div>
            </div>

            {/* Missing Sections */}
            <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2rem] shadow-sm">
              <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> Missing Sections
              </h4>
              <ul className="space-y-1">
                {["• Certifications", "• Publications"].map((item) => (
                  <li key={item} className="text-xs font-bold text-rose-800">{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Analysis History */}
          <div className="p-8 bg-card border border-border rounded-[2rem] shadow-sm">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <Archive size={14} /> Analysis History
            </h4>
            
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : resumes.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {resumes.map((resume) => {
                  const score = resume.analysis_score?.score || 75;
                  const date = new Date(resume.created_at).toLocaleDateString();
                  return (
                    <button
                      key={resume.id}
                      onClick={() => loadFromHistory(resume)}
                      className="w-full text-left p-4 bg-muted/30 border border-transparent hover:border-primary/30 hover:bg-white rounded-2xl transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-xs font-black truncate max-w-[150px]">{resume.title}</h5>
                        <span className={`text-[10px] font-black ${score > 80 ? 'text-teal-600' : 'text-primary'}`}>{score}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium">{date}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No history yet</p>
                <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">Uploaded resumes will appear here.</p>
              </div>
            )}
          </div>

          {/* Improvement Suggestions */}
          <div className="space-y-4">
            <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} /> Improvement Suggestions
            </h4>
            <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Maintain persistent optimization by integrating high-impact technical keywords and quantifying achievements for better conversion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-8 animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-10 py-6 border-b border-border bg-muted/30">
              <h3 className="text-xl font-black tracking-tight text-foreground">Resume Preview</h3>
              <div className="flex items-center gap-4">
                <button onClick={handleDownloadPDF} className="px-6 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Download Archive</button>
                <button onClick={() => setPdfPreviewUrl(null)} className="p-3 bg-muted rounded-full hover:bg-white transition-colors text-foreground"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 bg-muted p-10 overflow-hidden flex justify-center">
              <iframe src={pdfPreviewUrl} className="w-full h-full max-w-[800px] shadow-2xl rounded-sm border-none bg-white" title="Resume Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
