import { Link } from "react-router";
import { Linkedin, Github, Twitter, Map, ShieldCheck, Mail } from "lucide-react";
import { useToast } from "./Toast.jsx";

export function Footer() {
  const { info } = useToast();

  return (
    <footer className="bg-muted/30 border-t border-border mt-auto pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-16">

          {/* Institutional Brand */}
          <div className="md:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-teal-500/10">
                  <Map size={20} />
               </div>
               <span className="text-xl font-black text-foreground tracking-tight">MapOut.</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-medium">
               Your all-in-one platform for career growth and job preparation.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Linkedin, url: "https://linkedin.com" },
                { icon: Github, url: "https://github.com" },
                { icon: Twitter, url: "https://twitter.com" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Ecosystem Matrix */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-6">Explore</h4>
            <ul className="space-y-4">
              {[
                { name: "Dashboard", path: "/dashboard" },
                { name: "Resume Studio", path: "/resume-studio" },
                { name: "Career Planner", path: "/career-planner" },
                { name: "Projects", path: "/projects" },
              ].map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligence Matrix */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-6">Resources</h4>
            <ul className="space-y-4">
              {[
                { name: "Research Guide", path: "/research-guide" },
                { name: "Interview FAQs", path: "/interview-faqs" },
                { name: "Bookmarks", path: "/bookmarks" },
                { name: "About", path: "/about" },
              ].map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Secure Contact */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-6">Contact Us</h4>
            <div className="p-6 bg-muted/30 border border-border rounded-[2rem] space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-primary"><Mail size={18} /></div>
                   <div>
                      <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none mb-1">Support</p>
                      <a href="mailto:support@mapout.io" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">support@mapout.io</a>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-teal-500"><ShieldCheck size={18} /></div>
                   <div>
                      <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none mb-1">Auth Protocol</p>
                      <p className="text-xs font-bold text-muted-foreground">Secure SSL Encrypted</p>
                   </div>
                </div>
            </div>
          </div>

        </div>

        {/* Global Footer Bar */}
        <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
             <span>© {new Date().getFullYear()} MapOut.</span>
             <button onClick={() => info("Privacy Policy enabled.")} className="hover:text-primary transition-colors">Privacy</button>
             <button onClick={() => info("Terms of Service enabled.")} className="hover:text-primary transition-colors">Terms</button>
          </div>
          <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest px-4 py-2 bg-muted/50 rounded-full border border-border">
             Made for your success.
          </div>
        </div>
      </div>
    </footer>
  );
}
