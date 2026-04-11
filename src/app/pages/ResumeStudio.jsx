import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import * as pdfjsLib from "pdfjs-dist";

// Fix for Vite: properly set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

import {
  FileCheck, AlertTriangle, Lightbulb, Download,
  Upload, CheckCircle, TrendingUp, Zap, Lock,
  BarChart3, FileText, X, ChevronRight, PenTool,
  Clipboard, Archive, Map, Shield, Layout, Trophy, Target, Search, Star
} from "lucide-react";
import { createResume, getStats, analyzeResume, getResumes } from "../utils/api.js";
import { useToast } from "../components/Toast.jsx";
import { jsPDF } from "jspdf";

export function ResumeStudio() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeScore, setResumeScore] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { success, error: toastError, info } = useToast();

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
        const stats = await getStats(token);
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

  const handleRemoveFile = () => {
    setIsResumeUploaded(false);
    setAnalysisResults(null);
    setUploadedFile(null);
    setResumeScore(0);
    success("Resume removed. Ready for new upload.");
  };

  const createPDFDocument = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();   // 210
    const pageH = doc.internal.pageSize.getHeight();  // 297

    // ── Palette ─────────────────────────────────────────────────────
    const teal = [20, 184, 166];   // primary
    const white = [255, 255, 255];
    const dark = [15, 23, 42];
    const mid = [51, 65, 85];
    const muted = [100, 116, 139];
    const sideW = 64;  // sidebar width
    const mainX = sideW + 10;
    const mainW = pageW - mainX - 12;
    const name = formData.fullName ? formData.fullName : 'Your Name';

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

    // Thin teal underline
    doc.setDrawColor(...teal);
    doc.setLineWidth(0.8);
    doc.line(mainX + 2, 21, pageW - 12, 21);

    // Contact row
    const contactParts = [
      formData.email && `EMAIL: ${formData.email}`,
      formData.phone && `PHONE: ${formData.phone}`,
      formData.linkedin && `LINKEDIN: ${formData.linkedin}`,
    ].filter(Boolean);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 210, 210);
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
    let lyPos = 54;
    let ryPos = 54;

    const addSideSection = (title, content) => {
      if (!content || !content.trim()) return;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...teal);
      doc.text(title.toUpperCase(), 5, lyPos);
      lyPos += 1.5;
      doc.line(5, lyPos, sideW - 6, lyPos);
      lyPos += 4;
      const items = content.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(200, 230, 228);
      items.forEach(item => {
        const lines = doc.splitTextToSize(`• ${item}`, sideW - 10);
        doc.text(lines, 5, lyPos);
        lyPos += lines.length * 4 + 1;
      });
      lyPos += 5;
    };

    const addMainSection = (title, content) => {
      if (!content || !content.trim()) return;
      doc.setFillColor(...teal);
      doc.roundedRect(mainX, ryPos - 4, mainW, 7, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...white);
      doc.text(title.toUpperCase(), mainX + 3, ryPos + 0.5);
      ryPos += 9;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...mid);
      const lines = doc.splitTextToSize(content.trim(), mainW - 2);
      doc.text(lines, mainX, ryPos);
      ryPos += lines.length * 4.5 + 7;
    };

    addSideSection('SKILLS', formData.skills);
    addSideSection('ACHIEVEMENTS', formData.achievements);
    addMainSection('Education', formData.education);
    addMainSection('Experience', formData.internships);
    addMainSection('Projects', formData.projects);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text('Crafted with MapOut Resume Studio • mapout.app', pageW / 2, pageH - 5, { align: 'center' });

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
        info("Extracting text and analyzing with AI...");

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        let imageData = null;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(" ") + "\n";
          if (i === 1) {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            imageData = canvas.toDataURL("image/jpeg", 0.8);
          }
        }

        const result = await analyzeResume(token, fullText, file, imageData);

        await createResume(token, {
          title: file.name,
          content: JSON.stringify({ analysis: result, text: fullText.substring(0, 500) }),
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
        console.error("Analysis failed:", err);
        toastError("Failed to extract or analyze resume. Ensure it's a valid text-based PDF.");
      } finally {
        setLoading(false);
      }
    } else if (!token) {
      navigate("/login");
    }
  };

  const handleLoadFromHistory = (resume) => {
    try {
      let data = {};
      try { 
        data = typeof resume.content === 'string' ? JSON.parse(resume.content) : resume.content; 
      } catch (_) { data = {}; }
      
      let analysis = resume.analysis_score || data.analysis;
      // Handle cases where analysis might be a string (legacy/db edge cases)
      if (typeof analysis === 'string') {
        try { analysis = JSON.parse(analysis); } catch (_) {}
      }

      // Restore form fields if this was a builder resume
      if (data && (data.fullName !== undefined || data.education !== undefined)) {
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          education: data.education || '',
          skills: data.skills || '',
          projects: data.projects || '',
          internships: data.internships || '',
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
        success(`Restored data: ${resume.title}`);
      }
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

        {/* Left Column: Resume Builder */}
        <div className="space-y-12">
          <div className="p-10 bg-white border-2 border-slate-200 rounded-[3.5rem] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-slate-100 transition-colors"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <PenTool size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">Resume Builder</h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Design your resume</p>
                  </div>
                </div>
                <button
                  onClick={handleClearForm}
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl border border-rose-500/20 transition-all font-bold"
                >
                  <X size={13} /> Clear Form
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", name: "fullName", placeholder: "John Doe" },
                    { label: "Email Address", name: "email", placeholder: "john@example.com" },
                    { label: "Phone Number", name: "phone", placeholder: "+1 234 567 8900" },
                    { label: "LinkedIn URL", name: "linkedin", placeholder: "linkedin.com/in/johndoe" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full px-6 py-4 bg-muted/20 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-medium text-foreground outline-none"
                      />
                    </div>
                  ))}
                </div>

                {[
                  { label: "Education", name: "education", placeholder: "Certifications, Degrees..." },
                  { label: "Core Skills", name: "skills", placeholder: "Languages, Tools..." },
                  { label: "Key Projects", name: "projects", placeholder: "Technical impact..." },
                  { label: "Internships", name: "internships", placeholder: "Roles, Outcomes..." },
                  { label: "Achievements", name: "achievements", placeholder: "Awards, Hackathons..." }
                ].map((area) => (
                  <div key={area.name}>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">{area.label}</label>
                    <textarea
                      name={area.name}
                      value={formData[area.name]}
                      onChange={handleChange}
                      rows={3}
                      placeholder={area.placeholder}
                      className="w-full px-6 py-4 bg-muted/20 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-medium text-foreground outline-none resize-none"
                    />
                  </div>
                ))}

                <div className="flex gap-4 pt-6">
                  <button onClick={handlePreview} className="flex-1 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-teal-500/20">Preview Blueprint</button>
                  <button onClick={handleDownloadPDF} className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                    <Download size={18} /> Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intelligence & Optimization */}
        <div className="space-y-10">

          {/* 1. Pro Tips (Always Visible) */}
          <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-teal-500/20"></div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
              <Shield size={22} className="text-teal-400" /> Pro Tips
            </h3>
            <ul className="space-y-4 relative z-10">
              {[
                "Quantify your results with metrics (e.g., 'Gained 40% speed')",
                "Use high-impact action verbs (Architected, Engineered)",
                "Maintain surgical precision in your skill map",
                "Keep your blueprint to a strict 1-2 page maximum"
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-4 text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Upload Section (Sequential) */}
          <div className="p-10 bg-white border-2 border-slate-200 rounded-[3.5rem] shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                   <Upload size={20} />
                 </div>
                 <div>
                    <h3 className="font-black text-foreground">Upload Resume</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Step 1: File Analysis</p>
                 </div>
               </div>
               {isResumeUploaded && (
                 <button
                   onClick={handleRemoveFile}
                   className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-slate-100"
                 >
                   <X size={18} />
                 </button>
               )}
             </div>

             {isResumeUploaded && uploadedFile ? (
               <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] flex items-center gap-5 transition-all animate-in fade-in zoom-in-95 duration-500">
                 <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                   <FileText size={28} />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="font-black text-slate-900 text-sm truncate">{uploadedFile.name}</p>
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-1 flex items-center gap-2">
                      <Zap size={10} className="fill-teal-600 animate-pulse" /> AI Sync Active
                    </p>
                 </div>
               </div>
             ) : (
               <label htmlFor="resume-upload-trigger" className="flex flex-col items-center justify-center gap-4 py-16 border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:bg-slate-50 cursor-pointer transition-all group">
                 <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">
                   <Upload size={32} />
                 </div>
                 <div className="text-center">
                   <p className="font-black text-sm uppercase tracking-widest mb-1 text-foreground">Select PDF Resume</p>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Supports PDF up to 10MB</p>
                 </div>
                 <input id="resume-upload-trigger" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
               </label>
             )}
          </div>

          {/* 3. Analysis Dashboard (Below Upload) */}
          {isResumeUploaded && analysisResults && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
              <div className="p-10 bg-slate-50 border-2 border-slate-200 rounded-[3.5rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl -mr-24 -mt-24"></div>
                <div className="relative z-10 text-center">
                   <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-10 flex items-center justify-center gap-2">
                     <Zap size={14} className="fill-primary" /> Intelligence Report
                   </h4>
                   <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm group hover:border-primary/40 transition-all">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Health Score</p>
                       <p className="text-5xl font-black text-primary transition-all group-hover:scale-110">
                         {Math.round(analysisResults?.score || resumeScore || 0)}%
                       </p>
                     </div>
                     <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm group hover:border-teal-500/40 transition-all">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">ATS Match</p>
                       <p className="text-5xl font-black text-teal-600 transition-all group-hover:scale-110">
                         {Math.round(analysisResults?.ats_compatibility || 0)}%
                       </p>
                     </div>
                   </div>
                </div>
              </div>

              {analysisResults.bullet_suggestions && (
                <div className="p-10 bg-white border-2 border-slate-200 rounded-[3.5rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                    <Zap size={18} className="text-primary animate-pulse" /> Precision Suggestions
                  </h4>
                  <ul className="space-y-6">
                    {analysisResults.bullet_suggestions.slice(0, 5).map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-6 group">
                        <div className="mt-1 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                          0{i + 1}
                        </div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed font-header">{suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-8 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl"></div>
                 <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <AlertTriangle size={14} /> Gap Analysis Verdict
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-teal-50/70 italic">
                      "{analysisResults.feedback || "Based on your current architectural profile, these adjustments will solidify your market position."}"
                    </p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Library ────────────────────────────────────────── */}
      {resumes.length > 0 && (
        <div className="mt-24 pt-24 border-t-2 border-slate-100 animate-in fade-in duration-1000">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-foreground mb-2">Recent Library</h2>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Saved Architectural Blueprints</p>
            </div>
            <div className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
               <Archive size={20} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resumes.slice(0, 8).map((resume) => (
              <div 
                key={resume.id}
                onClick={() => handleLoadFromHistory(resume)}
                className="p-6 bg-white border-2 border-slate-200 rounded-[2.5rem] hover:border-primary/40 hover:scale-[1.02] cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/5"></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-black text-sm text-foreground truncate">{resume.title}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                       {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]"></div>
                    <span className="text-[10px] font-black uppercase text-teal-600 tracking-tighter">Score: {resume.analysis_score?.score || 0}%</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-8 animate-in fade-in duration-300">
          <div className="bg-white border-2 border-slate-900 w-full max-w-5xl h-[90vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <FileText size={20} />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">Blueprint Preview</h3>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handleDownloadPDF} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-teal-500/20">Download Archive</button>
                <button onClick={() => setPdfPreviewUrl(null)} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all text-slate-400"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-200 p-12 overflow-hidden flex justify-center">
              <iframe src={pdfPreviewUrl} className="w-full h-full max-w-[850px] shadow-2xl rounded-sm border-none bg-white" title="Resume Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
