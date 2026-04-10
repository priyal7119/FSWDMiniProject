import { Globe, Lightbulb, Target, Cpu, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-6 py-24 flex flex-col items-center">
        
        <div className="w-24 h-2 bg-primary rounded-full mb-12 animate-pulse"></div>
        <h1 className="text-6xl md:text-8xl font-black text-center mb-8 text-foreground tracking-tight leading-none italic">
          About <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mapout-primary)] to-[var(--mapout-secondary)]">MapOut.</span>
        </h1>
        <p className="text-xl text-muted-foreground text-center mb-24 font-medium max-w-2xl leading-relaxed">
          The next generation of career tools powered by easy-to-use AI.
        </p>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
          {[
            { 
              icon: Globe, title: "Our Story", 
              desc: "Founded in 2026, MapOut was built to help everyone bridge the gap between education and a great career." 
            },
            { 
              icon: Cpu, title: "Our Technology", 
              desc: "We use advanced AI to help you build the perfect resume and find your ideal career path." 
            },
            { 
              icon: Target, title: "Our Mission", 
              desc: "Our goal is simple: to help you succeed. We don't just provide guides; we provide the tools you need to lead your industry." 
            },
            { 
              icon: Lightbulb, title: "Our Vision", 
              desc: "We bring clarity to your career journey with real-time updates on global industry trends." 
            }
          ].map((item, i) => (
             <div key={i} className="bg-card border border-border p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:shadow-teal-500/5 transition-all group">
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/10 group-hover:scale-110 transition-transform">
                   <item.icon size={28} />
                </div>
                <h2 className="text-3xl font-black mb-6 text-foreground tracking-tight">{item.title}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed italic">
                  "{item.desc}"
                </p>
             </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="w-full mt-24">
           <div className="bg-primary text-white p-12 md:p-20 rounded-[4rem] text-center shadow-2xl shadow-teal-500/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400/10 rounded-full blur-[100px]" />
              
              <div className="relative z-10">
                 <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Level up your career.</h2>
                 <p className="text-teal-50/80 text-xl font-medium leading-relaxed mb-12 max-w-3xl mx-auto">
                    Whether you are just starting or looking for your next big role, MapOut has the tools you need to succeed.
                 </p>
                 <button 
                   onClick={() => navigate('/login')}
                   className="px-12 py-5 bg-white text-primary rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 mx-auto"
                 >
                    Get Started <ArrowRight size={16} />
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}