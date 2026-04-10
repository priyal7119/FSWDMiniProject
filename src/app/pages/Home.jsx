import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  FileText,
  TrendingUp,
  Target,
  Calendar,
  Lightbulb,
  BookOpen,
  MessageSquare,
  FileCheck,
  Briefcase,
  AlertCircle,
  Archive,
  ChevronRight,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Map,
  Compass,
  Award
} from "lucide-react";

import img1 from "../../imports/image1.png";
import img2 from "../../imports/image2.png";

const carouselImages = [img1, img2];

export function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-sans bg-background">
      {/* Hero Section with Carousel */}
      <section className="relative h-[650px] overflow-hidden">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {carouselImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Overlay Gradient - Silk & Onyx Style */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent"></div>

        {/* Hero Content */}
        <div className="relative h-full max-w-[1440px] mx-auto px-6 flex items-center">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
            <h1 className="mb-6 text-6xl md:text-8xl font-black tracking-tight leading-[0.9] font-header text-foreground">
              Map Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mapout-primary)] to-[var(--mapout-secondary)]">Career</span> Journey
            </h1>
            <p className="text-xl mb-10 text-muted-foreground font-medium leading-relaxed max-w-lg">
              Build a better resume, find the right skills, and prepare for interviews with our easy-to-use tools.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link
                to="/login"
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-teal-500/20"
              >
                Get Started
              </Link>
              <button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-white/5 backdrop-blur-md text-foreground rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white/10 transition-all border border-border group"
              >
                Learn More <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide ? "bg-primary w-12" : "bg-muted w-3 hover:bg-muted-foreground"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-32 bg-background border-t border-border">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-5xl font-black tracking-tight mb-4 font-header">
                Our <span className="text-primary">Tools.</span>
              </h2>
              <p className="text-muted-foreground font-medium max-w-xl text-lg">
                Simple and powerful tools to help you grow your career.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                id: 'resume', 
                route: '/resume-studio', 
                icon: FileCheck, 
                title: 'Resume Studio', 
                desc: 'Build a great resume and get an instant analysis score.',
                color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                private: true
              },
              { 
                id: 'career', 
                route: '/career-planner', 
                icon: Target, 
                title: 'Career Planner', 
                desc: 'Plan your career path and track your milestones easily.',
                color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                private: true
              },
              { 
                id: 'projects', 
                route: '/projects', 
                icon: Briefcase, 
                title: 'Projects', 
                desc: 'Find projects that match your skills to build your experience.',
                color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                private: true
              },
              { 
                id: 'bookmarks', 
                route: '/bookmarks', 
                icon: BookOpen, 
                title: 'Saved Items', 
                desc: 'Keep track of all the resources you want to save for later.',
                color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                private: true
              },
              { 
                id: 'interview', 
                route: '/interview-faqs', 
                icon: AlertCircle, 
                title: 'Interview FAQs', 
                desc: 'Practice common questions and get ready for your next job.',
                color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
                private: false
              },
              { 
                id: 'research', 
                route: '/research-guide', 
                icon: Archive, 
                title: 'Research Guide', 
                desc: 'Learn how to write and format professional research papers.',
                color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
                private: false
              }
            ]
            .map((feature) => (
              <div 
                key={feature.id} 
                onClick={() => navigate(feature.route)} 
                className="bg-card border-2 border-border/60 rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-transform group-hover:scale-110 ${feature.color}`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground font-medium mb-10 leading-relaxed text-sm flex-grow">
                  {feature.desc}
                </p>
                <div className="flex items-center text-primary font-black text-[10px] uppercase tracking-widest gap-2">
                  Access Module <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -ml-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] -mr-48" />
      </section>

      {/* Stats / Proof Section */}
      <section className="py-24 bg-card border-y border-border">
         <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Active Vectors", val: "12,400+" },
              { label: "AI Blueprints", val: "850+" },
              { label: "Industry Sync", val: "99.4%" },
              { label: "Success Rate", val: "10x" }
            ].map((stat, i) => (
               <div key={i}>
                  <p className="text-4xl font-black text-foreground mb-2">{stat.val}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
               </div>
            ))}
         </div>
      </section>

    </div>
  );
}
