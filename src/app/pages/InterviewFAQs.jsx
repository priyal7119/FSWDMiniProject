import { useState, useEffect } from "react";
import { 
  MessageSquare, Search as SearchIcon, ChevronDown, 
  ChevronUp, Globe, Filter, Zap, Shield, Target, 
  Award, ArrowRight 
} from "lucide-react";
import { getFAQs, incrementPrepCount } from "../utils/api.js";
import { t } from "../utils/translate.js";
import { useToast } from "../components/Toast.jsx";

const faqRoles = [
  { id: "all", label: "All Questions", icon: MessageSquare },
  { id: "Frontend", label: "Frontend", icon: Zap },
  { id: "Backend", label: "Backend", icon: Target },
  { id: "Fullstack", label: "Full Stack", icon: Globe },
  { id: "Data-Science", label: "Data Science", icon: Globe },
];

export function InterviewFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [activeRole, setActiveRole] = useState("all");
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
    if (activeRole !== "all") {
      result = result.filter((f) => f.role === activeRole || f.category === activeRole);
    }
    if (searchQuery) {
      result = result.filter((f) => 
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredFaqs(result);
  }, [activeRole, searchQuery, faqs]);

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
              Interview <span className="text-primary">Prep.</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-xl">
              Master technical, behavioral, and project-based questions to ace your next interview.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search interview questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-foreground"
            />
          </div>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {faqRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${
                activeRole === role.id 
                ? "bg-primary text-white border-primary shadow-teal-500/20" 
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <role.icon size={16} />
              {role.label}
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
                  onClick={() => {
                    const isExpanding = expandedId !== faq.id;
                    setExpandedId(isExpanding ? faq.id : null);
                    if (isExpanding) {
                       incrementPrepCount().catch(console.error);
                    }
                  }}
                  className="w-full text-left px-10 py-8 flex items-center justify-between gap-6 group"
                >
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${expandedId === faq.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                        <MessageSquare size={20} />
                     </div>
                     <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">{faq.role || faq.category}</span>
                        <h3 className="text-xl font-bold tracking-tight text-foreground leading-snug">{faq.question}</h3>
                     </div>
                  </div>
                  {expandedId === faq.id ? <ChevronUp size={24} className="text-primary" /> : <ChevronDown size={24} className="text-muted-foreground" />}
                </button>
                
                {expandedId === faq.id && (
                  <div className="px-10 pb-10 animate-in slide-in-from-top-4 duration-500">
                     <div className="pt-6 border-t border-border">
                        <div className="text-foreground/80 font-medium text-lg leading-relaxed bg-muted/30 p-8 rounded-3xl border border-border/50">
                          <p className="whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                        <div className="mt-8 flex items-center justify-between gap-4">
                           <span className="text-xs font-bold text-muted-foreground">Expert Approved</span>
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
               <h3 className="text-2xl font-black mb-2 tracking-tight">No Questions Found</h3>
               <p className="text-muted-foreground font-medium">No interview questions match your current search.</p>
               <button onClick={() => { setActiveRole("all"); setSearchQuery(""); }} className="mt-8 text-primary font-black text-[10px] uppercase tracking-[0.2em] underline decoration-2 underline-offset-8 text-foreground">Reset Search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
