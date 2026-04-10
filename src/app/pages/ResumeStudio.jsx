import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  FileCheck, AlertTriangle, Lightbulb, Download, 
  Upload, CheckCircle, TrendingUp, Zap, Lock, 
  BarChart3, FileText, X, ChevronRight, PenTool, 
  Clipboard, Archive, Map, Shield, Layout, Trophy, Target 
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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError, info, warning } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", linkedin: "", github: "",
    education: "", skills: "", projects: "", internships: "", achievements: "",
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
        if (history && history.length > 0 && history[0].content) {
          try {
            const savedContent = JSON.parse(history[0].content);
            setFormData(prev => ({ ...prev, ...savedContent }));
          } catch(e) { console.error(e); }
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
      await createResume(token, { title: formData.fullName || "My Resume", content: JSON.stringify(formData) });
      const doc = createPDFDocument();
      doc.save(`${formData.fullName ? formData.fullName.replace(/\s+/g, '_') : 'mapout'}_resume.pdf`);
      success('Your resume has successfully downloaded.');
    } catch (err) {
      toastError('Error creating resume. Please try again.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const result = await analyzeResume(token, file);
        setResumeScore(result.score);
        setIsResumeUploaded(true);
        setUploadedFile(file);
        success(`Analysis complete! Score: ${result.score}`);
      } catch (err) {
        toastError("Failed to upload and analyze resume");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="mb-12 animate-in fade-in slide-in-from-left-4 duration-700">
          <h1 className="text-5xl font-black tracking-tight mb-3 font-header text-foreground">
            Resume <span className="text-primary">Studio.</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Build a professional, ATS-friendly resume to land your dream job.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Builder Column */}
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm">
              <h2 className="text-2xl font-black mb-8 tracking-tight flex items-center gap-3 text-foreground">
                <PenTool className="text-primary" size={24} /> Resume Details
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
                  { label: "Education", name: "education", placeholder: "List your degrees and schools..." },
                  { label: "Skills", name: "skills", placeholder: "List your key skills..." },
                  { label: "Projects", name: "projects", placeholder: "Describe your recent projects..." }
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
          <div className="space-y-8">
             <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-colors group-hover:bg-primary/10"></div>
                <h2 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-3 text-foreground">
                   <Target className="text-primary" size={24} /> Analysis Summary
                </h2>

                <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="p-8 bg-muted/30 rounded-[2rem] border border-transparent hover:border-border transition-all">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Resume Score</p>
                      <p className="text-5xl font-black text-primary">{resumeScore || 75}<span className="text-lg text-muted-foreground">/100</span></p>
                   </div>
                   <div className="p-8 bg-muted/30 rounded-[2rem] border border-transparent hover:border-border transition-all">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">ATS Sync</p>
                      <p className="text-5xl font-black text-primary">87<span className="text-lg text-muted-foreground">%</span></p>
                   </div>
                </div>

                <div className="p-8 bg-primary text-white rounded-[2rem] shadow-2xl shadow-teal-500/10 mb-10 relative overflow-hidden">
                   <div className="relative z-10">
                      <h4 className="font-black text-lg mb-4 flex items-center gap-2">
                         <Lightbulb size={20} className="text-teal-200" /> AI Suggestions
                      </h4>
                      <p className="text-sm font-medium leading-relaxed italic opacity-90">
                        {resumeScore >= 80 ? "Your resume looks great! It's ready for applications." : "Some sections could be improved. Try adding more skills or project details to boost your score."}
                      </p>
                   </div>
                   <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Upload Your Resume</h4>
                   <label className="flex flex-col items-center justify-center gap-4 py-12 border-2 border-dashed border-border rounded-[2rem] hover:bg-muted/30 cursor-pointer transition-all group">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                         <Upload size={28} />
                      </div>
                      <div className="text-center">
                         <p className="font-black text-sm uppercase tracking-widest mb-1 text-foreground">Upload Resume</p>
                         <p className="text-xs text-muted-foreground font-medium">Upload your current file for a quick score.</p>
                      </div>
                      <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                   </label>
                </div>
             </div>

             <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm">
                <h3 className="text-xl font-black mb-8 tracking-tight flex items-center gap-3 text-foreground">
                   <Trophy className="text-primary" size={20} /> Pro Strategies
                </h3>
                <div className="grid grid-cols-1 gap-4">
                   {[
                     "Deploy high-impact action verbs (Architected, Engineered).",
                     "Quantify architectural outputs (Reduced latency by 40%).",
                     "Synchronize skill clusters with industry demand nodes.",
                     "Maintain a single-page minimalist blueprint structure."
                   ].map((tip, i) => (
                     <div key={i} className="flex items-start gap-4 p-5 bg-muted/20 rounded-2xl border border-transparent hover:border-border transition-all">
                        <div className="mt-1 w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium text-foreground">{tip}</span>
                     </div>
                   ))}
                </div>
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
