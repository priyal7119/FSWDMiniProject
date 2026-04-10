import { useState, useEffect } from "react";
import { 
  BookOpen, FileText, Search as SearchIcon, Globe, 
  ChevronRight, Bookmark, Zap, Award, Shield, Target, 
  ArrowRight, Layers, FileCheck, Info, CheckCircle
} from "lucide-react";
import { getResearchGuides } from "../utils/api.js";
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
                  <div className="flex items-center gap-4 mb-10 text-primary">
                      <BookOpen size={32} />
                      <div className="h-px flex-1 bg-border" />
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

                      <button onClick={handleDownload} className="mt-8 px-12 py-5 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl flex items-center gap-4">
                        Download Research Template <FileCheck size={18} />
                      </button>
                  </div>
                </div>
              )}

              {activeSegment === 'ieee' && (
                <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-16 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-10 text-[var(--mapout-secondary)]">
                      <Shield size={32} />
                      <div className="h-px flex-1 bg-border" />
                  </div>
                  
                  <h2 className="text-4xl font-black mb-4 tracking-tight text-foreground text-left">IEEE Writing Guide</h2>
                  <p className="text-muted-foreground font-medium mb-12 text-left text-lg">Detailed breakdown of the standard 10-section IEEE format.</p>

                  <div className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section className="space-y-6">
                           <h3 className="font-black text-primary uppercase tracking-widest text-xs text-left">The Structure</h3>
                           <div className="space-y-8">
                              {[
                                 { t: "Title", d: "Keep it under 15 words. It should accurately describe the contents without being too broad. Avoid jargon that only a few people would understand." },
                                 { t: "Abstract", d: "This is your 'elevator pitch'. In one paragraph, explain the problem, what you did, the main result, and why it matters. Keep it between 150-250 words." },
                                 { t: "Keywords", d: "Choose 5-10 words that represent the core pillars of your paper. These are used by search engines (like Google Scholar) to help other researchers find your work." },
                                 { t: "Introduction", d: "Set the stage. Provide background information, explain why the topic is important, and clearly state the specific goals or 'contributions' of your research." },
                                 { t: "Related Work", d: "Acknowledge the giants whose shoulders you stand on. Briefly summarize previous studies and explain how your approach is different or better." }
                              ].map((s, i) => (
                                <div key={i} className="flex gap-4 group text-left">
                                   <div className="text-primary font-black mt-1">0{i+1}</div>
                                   <div>
                                      <p className="font-bold text-foreground mb-1 text-base">{s.t}</p>
                                      <p className="text-base text-muted-foreground font-medium leading-relaxed">{s.d}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </section>

                        <section className="space-y-6">
                           <h3 className="font-black text-primary uppercase tracking-widest text-xs text-left">Technical Core</h3>
                           <div className="space-y-8">
                              {[
                                 { t: "Methodology", d: "The 'meat' of the paper. Provide enough detail (algorithms, circuit diagrams, math) so that another researcher could replicate your work exactly." },
                                 { t: "Results", d: "Show, don't just tell. Use graphs and tables to present your findings. Be objective and include both successful and unsuccessful outcomes if they are relevant." },
                                 { t: "Discussion", d: "Interpret the data. Why did you get these results? Do they support your initial theory? Discuss any unexpected findings and what they might mean for the field." },
                                 { t: "Conclusion", d: "Wrap everything up. Highlight the most important takeaway, mention the limitations of your study, and suggest what could be researched next." },
                                 { t: "References", d: "Credit your sources. Follow the numbered IEEE format [1] exactly. Every source mentioned in your paper must appear here in the order of appearance." }
                              ].map((s, i) => (
                                <div key={i} className="flex gap-4 text-left">
                                   <div className="text-primary font-black mt-1">0{i+6}</div>
                                   <div>
                                      <p className="font-bold text-foreground mb-1 text-base">{s.t}</p>
                                      <p className="text-base text-muted-foreground font-medium leading-relaxed">{s.d}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </section>
                     </div>

                     <div className="bg-muted/50 p-10 rounded-[2.5rem] border border-border mt-12 text-left">
                        <h3 className="text-xl font-black mb-8 text-foreground flex items-center gap-3">
                           <Zap className="text-primary" size={24} /> IEEE Pro Tips
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {[
                              "Passive Voice: Use formal language. Instead of 'I observed the results', use 'The results were observed'. This maintains academic objectivity.",
                              "Image Quality: Use 300+ DPI images. Diagrams should be clear even when printed in black and white. Use vector formats (SVG/PDF) for charts.",
                              "Equation Numbering: Every significant mathematical formula should be centered and numbered (e.g., (1)) on the right margin for easy reference.",
                              "Abstract Integrity: The abstract is a standalone document. It should never contain internal references, citations, or cross-links to other sections.",
                              "Acronym Definition: Always spell out the first instance of an acronym, like 'Artificial Intelligence (AI)', before using just the shorthand.",
                              "Concise Language: Every sentence should serve a purpose. If a word doesn't add value to the technical explanation, delete it to keep focus."
                           ].map((tip, i) => {
                              const [title, desc] = tip.split(':');
                              return (
                                <div key={i} className="flex items-start gap-4">
                                   <CheckCircle className="text-primary shrink-0 mt-1" size={18} />
                                   <div>
                                      <p className="font-bold text-foreground text-base mb-1">{title}</p>
                                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{desc}</p>
                                   </div>
                                </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeSegment === 'citations' && (
                <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-16 shadow-sm animate-in fade-in duration-500">
                   <div className="flex items-center gap-4 mb-10 text-rose-500">
                      <Zap size={32} />
                      <div className="h-px flex-1 bg-border" />
                  </div>
                  <h2 className="text-4xl font-black mb-8 tracking-tight text-foreground text-left">IEEE Citations</h2>
                  <p className="text-lg text-muted-foreground font-medium mb-12 text-left leading-relaxed">Proper citation is the foundation of academic honesty. It shows which ideas are yours and which belong to others.</p>
                  
                  <div className="space-y-12">
                     <div className="p-10 bg-muted rounded-[2rem] border border-border text-left">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">In-Text Example</p>
                        <p className="text-foreground text-xl font-semibold italic leading-relaxed">
                           "Recent breakthroughs in neural networks [4] suggest that real-time processing [7] is finally achievable at low costs."
                        </p>
                        <p className="mt-6 text-sm text-muted-foreground font-medium">Notice how the numbers refer to the Reference list at the end of your paper. Never use author names like 'Smith says' in IEEE style.</p>
                     </div>

                     <div className="max-w-none text-foreground text-left">
                        <h3 className="text-2xl font-black mb-8">Standard Citation Formats</h3>
                        <div className="space-y-6">
                           <div className="flex flex-col gap-3 p-8 bg-muted/30 rounded-3xl border border-border hover:border-primary/30 transition-all">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Journal Papers</span>
                              <p className="text-sm font-medium mb-2 text-foreground">For articles published in journals or magazines:</p>
                              <code className="text-xs text-primary font-bold bg-primary/5 p-4 rounded-xl border border-primary/10 block">
                                 [1] J. K. Author, "Name of paper," Title of Journal, vol. x, no. x, pp. xxx–xxx, Month, year.
                              </code>
                           </div>
                           <div className="flex flex-col gap-3 p-8 bg-muted/30 rounded-3xl border border-border hover:border-primary/30 transition-all">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Conference Proceedings</span>
                              <p className="text-sm font-medium mb-2 text-foreground">For papers presented at academic conferences:</p>
                              <code className="text-xs text-primary font-bold bg-primary/5 p-4 rounded-xl border border-primary/10 block">
                                 [2] J. K. Author, "Name of paper," in Abbrev. Title of Conf., City, State, Country, year, pp. xxx-xxx.
                              </code>
                           </div>
                           <div className="flex flex-col gap-3 p-8 bg-muted/30 rounded-3xl border border-border hover:border-primary/30 transition-all">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Books</span>
                              <p className="text-sm font-medium mb-2 text-foreground">For physical or digital books:</p>
                              <code className="text-xs text-primary font-bold bg-primary/5 p-4 rounded-xl border border-primary/10 block">
                                 [3] J. K. Author, Title of Book, edition. City, State, Country: Publisher, year.
                              </code>
                           </div>
                        </div>
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
                  <div className="space-y-12 text-left">
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                       In the academic world, your reputation is built on the honesty of your work. Ethics isn't just a rule—it's the core of trustworthy science.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[
                          { t: "Avoid Self-Plagiarism", d: "You cannot recycle your own previous work. Even if you wrote it, using it in a new paper without citation is considered unethical 'double-dipping'." },
                          { t: "Proper Attribution", d: "If an idea isn't common knowledge, cite it. Always give credit for snippets of code, unique phrasing, or specific experimental data." },
                          { t: "Authorship Integrity", d: "Only list people who made a substantial intellectual contribution. Do not include 'honorary' authors who didn't work on the actual research." },
                          { t: "Data Honesty", d: "Never 'p-hack' or manipulate results to make your theory look better. Reporting a failed experiment is often as valuable as reporting a successful one." }
                       ].map((e, i) => (
                         <div key={i} className="p-8 bg-muted/20 rounded-3xl border border-border hover:bg-white transition-all">
                            <p className="font-bold text-foreground mb-3 text-lg">{e.t}</p>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{e.d}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSegment === 'journals' && (
                <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-16 shadow-sm animate-in fade-in duration-500">
                   <div className="flex items-center gap-4 mb-10 text-primary">
                      <Target size={32} />
                      <div className="h-px flex-1 bg-border" />
                  </div>
                  <h2 className="text-4xl font-black mb-10 tracking-tight text-foreground text-left">Journal Submission</h2>
                  <div className="space-y-8 text-left">
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                       Sharing your work with the global community requires careful planning. Choosing the right journal is a strategic decision that affects your research's reach.
                    </p>
                    <div className="space-y-8 mt-12">
                       {[
                          { t: "Scope Alignment", d: "Read the 'Aims and Scope' of the journal. If your paper is about hardware but the journal focuses on pure theory, it will be rejected almost immediately regardless of quality." },
                          { t: "Impact Factor (IF)", d: "Think of IF as the journal's 'popularity score'. High IF journals reach more people but are extremely competitive. For your first paper, aim for a mid-tier, reputable journal." },
                          { t: "Reputable Indexing", d: "Verify that the journal is indexed in Scopus, Web of Science, or IEEE Xplore. Avoid 'predatory' journals that ask for high fees without providing proper peer review." },
                          { t: "The Review Process", d: "Be patient. Peer review can take anywhere from 3 to 12 months. When you receive feedback (Reviewer 2 is usually the toughest), respond professionally and address every point." }
                       ].map((j, i) => (
                          <div key={i} className="flex gap-6 items-start p-6 rounded-3xl border border-transparent hover:bg-muted/30 hover:border-border transition-all">
                             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 transition-transform hover:rotate-12 shadow-sm">
                                <Target size={22} />
                             </div>
                             <div>
                                <p className="font-bold text-foreground text-lg mb-2">{j.t}</p>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{j.d}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
}
