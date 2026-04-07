import { Link } from "react-router";
import { Linkedin, Github, Twitter, Compass } from "lucide-react";
import { useToast } from "./Toast.jsx";

export function Footer() {
  const { info } = useToast();

  return (
    <footer className="bg-slate-900 dark:bg-[#060b18] text-white border-t border-slate-800 dark:border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Compass size={16} className="text-white" />
              </div>
              <span className="text-[17px] font-bold text-white tracking-tight">MapOut</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              AI-powered career development platform for students and early professionals.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Linkedin size={14} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Github size={14} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-sky-500 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Twitter size={14} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Platform</p>
            <ul className="space-y-2.5">
              {[
                { name: "Dashboard", path: "/dashboard" },
                { name: "Resume Studio", path: "/resume-studio" },
                { name: "Career Planner", path: "/career-planner" },
                { name: "Projects", path: "/projects" },
              ].map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resources</p>
            <ul className="space-y-2.5">
              {[
                { name: "Research Guide", path: "/research-guide" },
                { name: "Interview FAQs", path: "/interview-faqs" },
                { name: "Bookmarks", path: "/bookmarks" },
                { name: "About Us", path: "/about" },
              ].map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => info("Team page coming soon!")}
                  className="text-sm text-slate-400 hover:text-white transition-colors font-medium text-left">
                  Team
                </button>
              </li>
              <li>
                <a href="mailto:support@mapout.io" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                  Contact
                </a>
              </li>
              <li>
                <button onClick={() => info("Privacy policy coming soon!")}
                  className="text-sm text-slate-400 hover:text-white transition-colors font-medium text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => info("Terms of service coming soon!")}
                  className="text-sm text-slate-400 hover:text-white transition-colors font-medium text-left">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} MapOut. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built for ambitious careers.
          </p>
        </div>
      </div>
    </footer>
  );
}
