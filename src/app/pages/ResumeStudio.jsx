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

  const handleClearForm = () => {
    setFormData({
      fullName: '', email: '', phone: '', linkedin: '', github: '',
      education: '', skills: '', projects: '', internships: '', achievements: '',
    });
  };

  const createPDFDocument = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW  = doc.internal.pageSize.getWidth();   // 210
    const pageH  = doc.internal.pageSize.getHeight();  // 297

    // ── Palette ─────────────────────────────────────────────────────
    const teal      = [20,  184, 166];   // primary
    const tealDark  = [13,  148, 136];   // darker teal
    const white     = [255, 255, 255];
    const dark      = [15,  23,  42];
    const mid       = [51,  65,  85];
    const light     = [248, 250, 252];
    const muted     = [100, 116, 139];
    const sideW     = 64;  // sidebar width
    const mainX     = sideW + 10;
    const mainW     = pageW - mainX - 12;
    const name      = formData.fullName ? formData.fullName : 'Your Name';

    // ── Sidebar background ──────────────────────────────────────────
    doc.setFillColor(...dark);
    doc.rect(0, 0, sideW, pageH, 'F');

    // Teal accent stripe on the right edge of sidebar
    doc.setFillColor(...teal);
    doc.rect(sideW - 3, 0, 3, pageH, 'F');

    // ── Header block (full width, dark navy) ────────────────────────
    doc.setFillColor(22, 33, 55);
    doc.rect(sideW, 0, pageW - sideW, 46, 'F');

    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...white);
    doc.text(name.toUpperCase(), mainX + 2, 18);

    // Thin teal underline beneath name
    doc.setDrawColor(...teal);
    doc.setLineWidth(0.8);
    doc.line(mainX + 2, 21, pageW - 12, 21);

    // Contact row
    const contactParts = [
      formData.email   && `EMAIL: ${formData.email}`,
      formData.phone   && `PHONE: ${formData.phone}`,
      formData.linkedin && `LINKEDIN: ${formData.linkedin}`,
      formData.github  && `GITHUB: ${formData.github}`,
    ].filter(Boolean);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 210, 210);
    // Split into two rows if many items
    const row1 = contactParts.slice(0, 2).join('    ');
    const row2 = contactParts.slice(2).join('    ');
    doc.text(row1, mainX + 2, 30);
    if (row2) doc.text(row2, mainX + 2, 37);

    // ── Sidebar: avatar initial circle ─────────────────────────────
    doc.setFillColor(...teal);
    doc.circle(sideW / 2, 24, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...white);
    const initial = name.charAt(0).toUpperCase();
    doc.text(initial, sideW / 2, 29, { align: 'center' });

    // ── Column helpers ──────────────────────────────────────────────
    let lyPos = 54;  // sidebar y
    let ryPos = 54;  // main y

    const addSideSection = (title, content) => {
      if (!content || !content.trim()) return;
      if (lyPos > pageH - 18) return;
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...teal);
      doc.text(title.toUpperCase(), 5, lyPos);
      lyPos += 1.5;
      doc.setDrawColor(...teal);
      doc.setLineWidth(0.3);
      doc.line(5, lyPos, sideW - 6, lyPos);
      lyPos += 4;

      // Render skills as wrapped pill-like text entries
      const items = content.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(200, 230, 228);
      items.forEach(item => {
        if (lyPos > pageH - 12) return;
        const lines = doc.splitTextToSize(`• ${item}`, sideW - 10);
        doc.text(lines, 5, lyPos);
        lyPos += lines.length * 4 + 1;
      });
      lyPos += 5;
    };

    const addMainSection = (title, content) => {
      if (!content || !content.trim()) return;
      if (ryPos > pageH - 20) { doc.addPage(); ryPos = 20; }
      // Section heading
      doc.setFillColor(...teal);
      doc.roundedRect(mainX, ryPos - 4, mainW, 7, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...white);
      doc.text(title.toUpperCase(), mainX + 3, ryPos + 0.5);
      ryPos += 9;

      // Content — detect line-separated entries and render with bullet
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...mid);
      const entries = content.split('\n').filter(l => l.trim());
      if (entries.length > 1) {
        entries.forEach(entry => {
          if (ryPos > pageH - 14) { doc.addPage(); ryPos = 20; }
          const lines = doc.splitTextToSize(entry.trim(), mainW - 6);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(...teal);
          doc.text('▸', mainX + 1, ryPos);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...mid);
          doc.text(lines, mainX + 5, ryPos);
          ryPos += lines.length * 4.5 + 3;
        });
      } else {
        const lines = doc.splitTextToSize(content.trim(), mainW - 2);
        doc.text(lines, mainX, ryPos);
        ryPos += lines.length * 4.5;
      }
      ryPos += 7;
    };

    // ── Populate Sidebar ────────────────────────────────────────────
    addSideSection('SKILLS',        formData.skills);
    addSideSection('ACHIEVEMENTS',  formData.achievements);

    // ── Populate Main ───────────────────────────────────────────────
    addMainSection('Education',  formData.education);
    addMainSection('Experience', formData.internships);
    addMainSection('Projects',   formData.projects);

    // ── Footer ──────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text('Crafted with MapOut Resume Studio  •  mapout.app', pageW / 2, pageH - 5, { align: 'center' });

    return doc;
  };

  const handleDownloadPDF = async () => {
    if (!token) { navigate("/login"); return; }
    if (!formData.fullName && !formData.education && !formData.skills) {
      toastError('Please fill in at least your name, education, or skills before downloading.');
      return;
    }
    try {
      const result = analysisResults || { score: resumeScore || 0 };
      await createResume(token, {
        title: formData.fullName || 'My Resume',
        content: JSON.stringify({ ...formData, analysis: result }),
        analysis_score: result
      });
      const doc = createPDFDocument();
      doc.save(`${formData.fullName ? formData.fullName.replace(/\s+/g, '_') : 'mapout'}_resume.pdf`);
      success('Your resume has been downloaded and saved to your history.');
      fetchHistory();
    } catch (err) {
      console.error(err);
      toastError('Error creating resume. Please try again.');
    }
  };

  const handlePreview = () => {
    if (!formData.fullName && !formData.education && !formData.skills) {
      toastError('Please fill in at least your name, education, or skills to preview.');
      return;
    }
    const url = createPDFDocument().output('datauristring');
    setPdfPreviewUrl(url);
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
      let data = {};
      try { data = JSON.parse(resume.content || '{}'); } catch (_) { data = {}; }
      const analysis = resume.analysis_score || data.analysis;

      // Restore form fields if this was a builder resume
      if (data.fullName !== undefined || data.education !== undefined) {
        setFormData({
          fullName:     data.fullName     || '',
          email:        data.email        || '',
          phone:        data.phone        || '',
          linkedin:     data.linkedin     || '',
          github:       data.github       || '',
          education:    data.education    || '',
          skills:       data.skills       || '',
          projects:     data.projects     || '',
          internships:  data.internships  || '',
          achievements: data.achievements || '',
        });
      }

      if (analysis && typeof analysis === 'object') {
        setResumeScore(analysis.score || 0);
        setAnalysisResults(analysis);
        setIsResumeUploaded(true);
        setUploadedFile({ name: resume.title });
        success(`Loaded: ${resume.title}`);
      } else {
        // No analysis stored — just restore form data quietly
        success(`Restored resume: ${resume.title}`);
      }
    } catch (err) {
      console.error('loadFromHistory error:', err);
      toastError('Failed to load this resume from history.');
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
                <PenTool className="text-primary" size={24} /> Resume Builder
              </h2>
              <button
                onClick={handleClearForm}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl border border-rose-500/20 transition-all"
              >
                <X size={13} /> Clear All
              </button>
            </div>
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
                { label: "Education", name: "education", placeholder: "B.Tech in Computer Science, XYZ University (2022-2026)" },
                { label: "Skills", name: "skills", placeholder: "JavaScript, React, Node.js, Python, SQL" },
                { label: "Projects", name: "projects", placeholder: "Describe your key projects and their impact..." },
                { label: "Internships / Experience", name: "internships", placeholder: "Describe your internship or work experiences..." },
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
                  onClick={handlePreview}
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
              {!uploadedFile && (
                <label htmlFor="resume-upload-trigger" className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer">
                  Get Analysis
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-6">Upload an existing PDF to get AI-powered scoring, tailored recommendations, and missing section feedback.</p>
            
            {uploadedFile ? (
              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl mt-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-rose-500" size={24} />
                  <span className="text-sm font-bold truncate max-w-[200px] text-foreground">{uploadedFile.name}</span>
                </div>
                <button 
                  onClick={() => {
                    setUploadedFile(null);
                    setIsResumeUploaded(false);
                    setAnalysisResults(null);
                  }}
                  className="p-1 hover:bg-white rounded-full text-muted-foreground hover:text-rose-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label htmlFor="resume-upload-trigger" className="flex flex-col items-center justify-center gap-4 py-12 border-2 border-dashed border-border rounded-[2rem] hover:bg-muted/30 cursor-pointer transition-all group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                  <Upload size={28} />
                </div>
                <div className="text-center">
                  <p className="font-black text-sm uppercase tracking-widest mb-1 text-foreground">Click to Upload PDF</p>
                  <p className="text-xs text-muted-foreground font-medium">Supports PDF format · Max 10 MB</p>
                </div>
                <input id="resume-upload-trigger" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Analysis Results Container */}
          {isResumeUploaded && analysisResults && (
            <div className="space-y-6">
              <h3 className="text-xl font-black tracking-tight">Analysis Results</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="text-indigo-600" size={18} />
                    <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Resume Score</span>
                  </div>
                  <p className="text-4xl font-black text-indigo-900 mb-2">{analysisResults.score || 82}<span className="text-lg text-indigo-400">/100</span></p>
                  <p className="text-[10px] text-indigo-700/70 font-bold leading-tight">Excellent resume! Ready for applications.</p>
                </div>
                <div className="p-8 bg-purple-50 border border-purple-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-purple-600" size={18} />
                    <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">ATS Compatibility</span>
                  </div>
                  <p className="text-4xl font-black text-purple-900 mb-2">{analysisResults.ats_compatibility || 87}<span className="text-lg text-purple-400">%</span></p>
                  <p className="text-[10px] text-purple-700/70 font-bold leading-tight">Optimized for applicant tracking systems.</p>
                </div>
              </div>

              {/* Keywords Found */}
              {analysisResults.keywords && analysisResults.keywords.length > 0 && (
                <div className="p-8 bg-teal-50 border border-teal-100 rounded-[2rem] shadow-sm">
                  <h4 className="text-[10px] font-black text-teal-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Search size={14} /> Keywords Found
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.keywords.map((tag) => (
                      <span key={tag} className="px-4 py-1.5 bg-white border border-teal-200 rounded-full text-xs font-bold text-teal-800">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              <div className="p-8 bg-primary text-white rounded-[2rem] shadow-2xl shadow-teal-500/10 mb-10 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-black text-lg mb-4 flex items-center gap-2">
                    <Lightbulb size={20} className="text-teal-200" /> AI Suggestions
                  </h4>
                  <p className="text-sm font-medium leading-relaxed italic opacity-90">
                    {analysisResults.score >= 80 ? "Your resume looks great! It's ready for applications." : "Some sections could be improved. Try adding more skills or project details to boost your score."}
                  </p>
                </div>
              </div>

              {/* Missing Sections */}
              {analysisResults.missing && analysisResults.missing.length > 0 && (
                <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2rem] shadow-sm">
                  <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertTriangle size={14} /> Missing Sections
                  </h4>
                  <ul className="space-y-1">
                    {analysisResults.missing.map((item) => (
                      <li key={item} className="text-xs font-bold text-rose-800">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}


          {/* Improvement Suggestions */}
          {isResumeUploaded && analysisResults && (
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
          )}
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
