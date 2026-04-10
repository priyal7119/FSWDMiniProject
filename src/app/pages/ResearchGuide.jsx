import { useState, useEffect } from "react";
import { 
  BookOpen, FileText, Search as SearchIcon, Globe, 
  ChevronRight, Bookmark, Zap, Award, Shield, Target, 
  ArrowRight, Layers, FileCheck, Info 
} from "lucide-react";
import { getResearchGuides } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";

const segments = [
  { id: "methodology", label: "Neural Methodology", icon: Layers },
  { id: "ieee", label: "IEEE Standards", icon: Shield },
  { id: "citations", label: "Citation Logic", icon: Zap },
];

export function ResearchGuide() {
  const [guides, setGuides] = useState([]);
  const [activeSegment, setActiveSegment] = useState("methodology");
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const data = await getResearchGuides();
      setGuides(data || []);
    } catch (err) {
      console.error("Error fetching guides:", err);
      toastError("Failed to sync scholarly nodes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        {/* Header */}
        <div className="mb-16 animate-in fade-in slide-in-from-left-4 duration-700">
           <h1 className="text-5xl font-black tracking-tight mb-3 font-header text-foreground">
             Research <span className="text-primary">Guide.</span>
           </h1>
           <p className="text-muted-foreground font-medium text-lg max-w-2xl">
              Masterscholarly documentation and technical dissemination through rigorous academic writing and methodology guides.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           {/* Navigation Sidebar */}
           <div className="lg:col-span-1 border-r border-border pr-12">
              <div className="sticky top-32 space-y-4">
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
                    <h4 className="text-sm font-black mb-4 tracking-tight text-foreground">Active Protocol</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                       Following IEEE 802.1x standards for technical documentation and peer review logic.
                    </p>
                 </div>
              </div>
           </div>

           {/* Content Area */}
           <div className="lg:col-span-3 space-y-12">
              <div className="bg-card border border-border rounded-[3rem] p-12 lg:p-16 shadow-sm animate-in fade-in duration-500">
                 <div className="flex items-center gap-4 mb-10 text-primary">
                    <BookOpen size={32} />
                    <div className="h-px flex-1 bg-border" />
                 </div>
                 
                 <h2 className="text-3xl font-black mb-8 tracking-tight text-foreground"> Scholarly Blueprint</h2>
                 <div className="space-y-10">
                    <div className="prose prose-slate dark:prose-invert max-w-none text-foreground">
                       <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-8">
                          Academic research is the systematic investigation into and study of materials and sources in order to establish facts and reach new conclusions.
                       </p>

                       <h3 className="text-xl font-black mb-4 tracking-tight">1. Abstract Logic</h3>
                       <p className="text-muted-foreground leading-relaxed mb-6 font-medium">
                          The abstract serves as a condensed version of your entire research paper. It should clearly state the problem, methodology, findings, and conclusions within 150-250 words.
                       </p>

                       <h3 className="text-xl font-black mb-4 tracking-tight text-foreground">2. Methodology Node</h3>
                       <p className="text-muted-foreground leading-relaxed mb-6 font-medium">
                          Explain the system architecture and implementation details. Use diagrams where necessary to illustrate neural flows and data logic.
                       </p>

                       <div className="p-8 bg-primary/5 rounded-3xl border border-primary/20 flex gap-6 items-start my-10">
                          <Info className="text-primary shrink-0" size={24} />
                          <p className="text-sm text-primary font-bold italic leading-relaxed">
                             "Reliability in research is determined by the repeatability of results within the specified architecture."
                          </p>
                       </div>

                       <h3 className="text-xl font-black mb-4 tracking-tight text-foreground">3. Citation Strategy</h3>
                       <p className="text-muted-foreground leading-relaxed mb-10 font-medium">
                          Avoid plagiarism by synchronizing all external intelligence nodes with proper IEEE citations. Maintain high academic integrity throughout the dissemination.
                       </p>
                    </div>

                    <button className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl flex items-center gap-4">
                       Download Master Blueprint <FileCheck size={18} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-muted/30 border border-border border-dashed rounded-[2.5rem] p-10 group">
                    <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-3 text-foreground">
                       <Award className="text-primary" size={24} /> Performance Ethics
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
                       Ensure all data points are verified through multiple iteration cycles before scholarly publication.
                    </p>
                    <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all flex items-center gap-2">
                       Explore Ethics Protocol <ArrowRight size={14} />
                    </button>
                 </div>

                 <div className="bg-muted/30 border border-border border-dashed rounded-[2.5rem] p-10 group">
                    <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-3 text-foreground">
                       <Target className="text-primary" size={24} /> Target Journals
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
                       Synchronize your research with high-impact journals indexed in Scopus and Web of Science.
                    </p>
                    <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all flex items-center gap-2">
                       Sync Journal Nodes <ArrowRight size={14} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
