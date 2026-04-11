import { useState, useEffect } from "react";
import { 
  BookOpen, FileText, Search as SearchIcon, Globe, 
  ChevronRight, Bookmark, Zap, Award, Shield, Target, 
  ArrowRight, Layers, FileCheck, Info, CheckCircle, Archive
} from "lucide-react";
import { getResearchGuides, addBookmark } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";

const segments = [
  { id: "methodology", label: "Writing Methodology", icon: Layers },
  { id: "ieee", label: "IEEE Standards", icon: Shield },
  { id: "citations", label: "Citation Rules", icon: Zap },
  { id: "ethics", label: "Ethics & Integrity", icon: Award },
  { id: "journals", label: "Journal Submission", icon: Target },
];

export function ResearchGuide() {
  const [guides, setGuides] = useState([]);
  const [activeSegment, setActiveSegment] = useState("methodology");
  const [loading, setLoading] = useState(true);
  const { success, error: toastError, info } = useToast();

  const handleSave = async (title, desc) => {
    try {
       await addBookmark({
          title: title,
          description: desc,
          type: 'course' // Using 'course' as a proxy for guide/academic content
       });
       success(`${title} added to Archive Vault.`);
    } catch (err) {
       toastError("Failed to synchronize archive.");
    }
  };
  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const data = await getResearchGuides();
      setGuides(data || []);
    } catch (err) {
      console.error("Error fetching guides:", err);
      toastError("Failed to load research information.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    info("Preparing your research template...");
    setTimeout(() => {
      success("IEEE Research Template downloaded successfully!");
    }, 1500);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12">
        {/* Header */}
        <div className="mb-16 animate-in fade-in slide-in-from-left-4 duration-700">
           <h1 className="text-5xl font-black tracking-tight mb-3 font-header text-foreground">
             Research <span className="text-primary">Guide.</span>
           </h1>
           <p className="text-muted-foreground font-medium text-lg max-w-2xl">
              Learn how to write professional research papers and follow academic standards with ease.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           {/* Navigation Sidebar */}
           <div className="lg:col-span-1 border-border lg:border-r lg:pr-12">
              <div className="sticky top-32 space-y-3">
                 {segments.map((seg) => (
                    <button
                       key={seg.id}
                       onClick={() => setActiveSegment(seg.id)}
                       className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          activeSegment === seg.id 
                          ? "bg-primary text-white shadow-xl shadow-teal-500/20" 
                          : "text-muted-foreground hover:bg-muted"
                       }`}
                    >
                       <seg.icon size={18} />
                       {seg.label}
                    </button>
                 ))}
                 
                 <div className="mt-12 p-8 bg-muted/30 rounded-[2rem] border border-border">
                    <h4 className="text-sm font-black mb-4 tracking-tight text-foreground">Current Standard</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                       Following late-2026 IEEE documentation standards for technical peer review and academic integrity.
                    </p>
                 </div>
              </div>
           </div>

           {/* Content Area */}
           <div className="lg:col-span-3 space-y-12">
              {activeSegment === 'methodology' && (
                <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-16 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-10 group">
                    <div className="flex items-center gap-4 text-primary">
                        <BookOpen size={32} />
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    <button 
                      onClick={() => handleSave("Systematic Research", "Comprehensive guide on academic writing methodology.")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary/5 text-primary border border-primary/20 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all ml-4"
                    >
                      <Archive size={14} /> Archive Metadata
                    </button>
                  </div>
                  
                  <h2 className="text-4xl font-black mb-10 tracking-tight text-foreground text-left">Systematic Research</h2>
                  <div className="space-y-10">
                      <div className="max-w-none text-foreground">
                        <p className="text-lg text-muted-foreground leading-relaxed font-medium mb-12">
                            Academic research is about finding facts, testing theories, and sharing new knowledge with the world through a structured process.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                           <div className="space-y-4">
                              <h3 className="text-xl font-bold tracking-tight">1. Problem Definition</h3>
                              <p className="text-muted-foreground text-sm font-medium leading-relaxed">Identity a specific gap in existing knowledge. Ask yourself: "What question remains unanswered in my field?" Your research should aim to provide a unique solution or a fresh perspective on this specific problem.</p>
                           </div>
                           <div className="space-y-4">
                              <h3 className="text-xl font-bold tracking-tight">2. Literature Review</h3>
                              <p className="text-muted-foreground text-sm font-medium leading-relaxed">Don't reinvent the wheel. Study textbooks, journals, and conference papers to understand what has already been achieved. This helps you position your work and supports your claims with existing evidence.</p>
                           </div>
                        </div>

                        <div className="p-8 bg-primary/5 rounded-3xl border border-primary/20 flex gap-6 items-start my-12 text-left">
                           <Info className="text-primary shrink-0" size={24} />
                           <div>
                              <p className="text-sm text-primary font-bold italic leading-relaxed">
                                 "Good research starts with a good question. Focus on solving one problem thoroughly rather than many problems poorly. Depth is always more valuable than breadth in academic writing."
                              </p>
                           </div>
                        </div>

                        <h3 className="text-2xl font-black mb-6 tracking-tight text-foreground text-left">The Writing Process</h3>
                        <div className="space-y-6">
                           {[
                              { step: "Outline", desc: "Before writing, create a roadmap. List your main headings and the key points you'll cover under each. This prevents writer's block and ensures your arguments follow a logical, easy-to-follow sequence." },
                              { step: "Drafting", desc: "Focus on the flow of ideas first. Don't stop to fix every comma or spelling error. The goal is to translate your mental research into a written format. You can always polish the language in the next stage." },
                              { step: "Review & Refine", desc: "Read your work as if you're a critic. Is every claim backed by data? Does the conclusion actually answer the problem you stated in the introduction? Check for clarity, tone, and technical accuracy." }
                           ].map((item, i) => (
                             <div key={i} className="flex gap-4 items-start p-6 bg-muted/20 rounded-2xl border border-border">
                                <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">{i+1}</div>
                                <div>
                                   <p className="font-bold text-foreground mb-1">{item.step}</p>
                                   <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {activeSegment === 'ieee' && (
                <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-16 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-10 text-primary">
                      <Shield size={32} />
                      <div className="h-px flex-1 bg-border" />
                  </div>
                  <h2 className="text-4xl font-black mb-4 tracking-tight text-foreground text-left">IEEE Writing Guide</h2>
                  <p className="text-muted-foreground font-medium mb-12 text-left text-lg">Detailed breakdown of the standard 10-section IEEE format.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section className="space-y-6">
                      <h3 className="font-black text-primary uppercase tracking-widest text-xs text-left">The Structure</h3>
                      <div className="space-y-8">
                        {[
                          { t: "Title", d: "Keep it under 15 words. Descriptive and specific." },
                          { t: "Abstract", d: "The 'elevator pitch'. 150-250 words summarizing the core contribution." },
                          { t: "Keywords", d: "5-10 terms for indexing and SEO." },
                          { t: "Introduction", d: "Background and specific research goals." }
                        ].map((s, i) => (
                          <div key={i} className="flex gap-4 group text-left">
                            <div className="text-primary font-black mt-1">0{i+1}</div>
                            <div>
                              <p className="font-bold text-foreground mb-1 text-base">{s.t}</p>
                              <p className="text-sm text-muted-foreground font-medium leading-relaxed">{s.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="space-y-6">
                      <h3 className="font-black text-primary uppercase tracking-widest text-xs text-left">Technical Core</h3>
                      <div className="space-y-8">
                        {[
                          { t: "Methodology", d: "Detail algorithms, math, and process flow." },
                          { t: "Results", d: "Objective data presentation with charts." },
                          { t: "Discussion", d: "Interpretation of findings and supporting evidence." },
                          { t: "Conclusion", d: "Key takeaways and future research directions." }
                        ].map((s, i) => (
                          <div key={i} className="flex gap-4 text-left">
                            <div className="text-primary font-black mt-1">0{i+5}</div>
                            <div>
                              <p className="font-bold text-foreground mb-1 text-base">{s.t}</p>
                              <p className="text-sm text-muted-foreground font-medium leading-relaxed">{s.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {activeSegment === 'citations' && (
                <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-16 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-10 text-primary">
                    <Zap size={32} />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h2 className="text-4xl font-black mb-8 tracking-tight text-foreground text-left">IEEE Citations</h2>
                  <p className="text-lg text-muted-foreground font-medium mb-12 text-left leading-relaxed">Proper citation is the foundation of academic honesty.</p>
                  <div className="space-y-6">
                    <div className="p-8 bg-muted rounded-[2rem] border border-border text-left">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">In-Text Example</p>
                      <p className="text-foreground text-lg font-semibold italic">"Breakthroughs in ML [4] suggest real-time processing [7] is achievable."</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSegment === 'ethics' && (
                <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-16 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-10 text-primary">
                    <Award size={32} />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h2 className="text-4xl font-black mb-10 tracking-tight text-foreground text-left">Ethics & Plagiarism</h2>
                  <p className="text-lg text-muted-foreground font-medium leading-relaxed text-left">Reputation is built on honesty. Ethics is the core of science.</p>
                </div>
              )}

              {activeSegment === 'journals' && (
                <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-16 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-10 text-primary">
                    <Target size={32} />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h2 className="text-4xl font-black mb-10 tracking-tight text-foreground text-left">Journal Submission</h2>
                  <p className="text-lg text-muted-foreground font-medium leading-relaxed text-left">Choosing the right journal affects your research's reach.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
}
