import { useState, useEffect } from "react";
import { 
  MessageSquare, Search as SearchIcon, ChevronDown, 
  ChevronUp, Globe, Filter, Zap, Shield, Target, 
  Award, ArrowRight 
} from "lucide-react";
import { getFAQs } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";

const faqCategories = [
  { id: "all", label: "All Intelligence", icon: MessageSquare },
  { id: "Technical", label: "Technical Logic", icon: Zap },
  { id: "Behavioral", label: "Behavioral Matrix", icon: Target },
  { id: "Project-based", label: "Project Analysis", icon: Shield },
];

export function InterviewFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const data = await getFAQs();
      setFaqs(data || []);
      setFilteredFaqs(data || []);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      toastError("Failed to sync intelligence nodes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = faqs;
    if (activeCategory !== "all") {
      result = result.filter((f) => f.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter((f) => 
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredFaqs(result);
  }, [activeCategory, searchQuery, faqs]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-5xl font-black tracking-tight mb-3 font-header text-foreground">
              Interview <span className="text-primary">Intelligence.</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-xl">
              Master technical, behavioral, and logic-based vectors with role-specific intelligence matrices.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search intelligence nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-foreground"
            />
          </div>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${
                activeCategory === cat.id 
                ? "bg-primary text-white border-primary shadow-teal-500/20" 
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Intelligence Nodes */}
        <div className="space-y-6">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div 
                key={faq.id} 
                className={`bg-card border transition-all duration-500 rounded-[2.5rem] overflow-hidden ${
                  expandedId === faq.id ? "border-primary shadow-2xl shadow-primary/5" : "border-border shadow-sm hover:border-muted-foreground/30"
                }`}
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full text-left px-10 py-8 flex items-center justify-between gap-6 group"
                >
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${expandedId === faq.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                        <MessageSquare size={20} />
                     </div>
                     <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">{faq.category}</span>
                        <h3 className="text-xl font-black tracking-tight text-foreground">{faq.question}</h3>
                     </div>
                  </div>
                  {expandedId === faq.id ? <ChevronUp size={24} className="text-primary" /> : <ChevronDown size={24} className="text-muted-foreground" />}
                </button>
                
                {expandedId === faq.id && (
                  <div className="px-10 pb-10 animate-in slide-in-from-top-4 duration-500">
                    <div className="pt-6 border-t border-border">
                       <p className="text-muted-foreground font-medium text-lg leading-relaxed bg-muted/30 p-8 rounded-3xl border border-border/50">
                         {faq.answer}
                       </p>
                       <div className="mt-8 flex items-center gap-4">
                          <div className="px-4 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10">Mastered in 85% of simulations</div>
                          <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2 ml-auto">
                             Practice Evolution <ArrowRight size={14} />
                          </button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-32 text-center bg-muted/20 rounded-[3rem] border border-dashed border-border text-foreground">
               <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground mx-auto mb-8">
                  <Filter size={40} />
               </div>
               <h3 className="text-2xl font-black mb-2 tracking-tight">Signals Lost</h3>
               <p className="text-muted-foreground font-medium">No intelligence nodes match your current search vector.</p>
               <button onClick={() => { setActiveCategory("all"); setSearchQuery(""); }} className="mt-8 text-primary font-black text-[10px] uppercase tracking-[0.2em] underline decoration-2 underline-offset-8 text-foreground">Reset Vector</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
