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
  AlertCircle
} from "lucide-react";

import img1 from "../../imports/image1.png";
import img2 from "../../imports/image2.png";


const carouselImages = [
    img1, img2
];

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
    <div>
      {/* Hero Section with Carousel */}
      <section className="relative h-[600px] overflow-hidden">
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

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>

        {/* Hero Content */}
        <div className="relative h-full max-w-[1440px] mx-auto px-20 flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="mb-6 text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Map Your <span className="text-[var(--mapout-secondary)]">Career</span> Journey
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Build resumes, detect skill gaps, discover projects, and prepare for interviews.
            </p>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-8 py-3 bg-[var(--mapout-secondary)] text-white rounded-md hover:bg-[var(--mapout-primary)] transition-colors"
              >
                Get Started
              </Link>
              <button 
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/30 transition-colors border border-white/30"
              >
                Explore Features
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-20 bg-[var(--mapout-bg)]">
        <div className="max-w-[1440px] mx-auto px-20">
          <h2 className="text-center mb-16 text-4xl font-bold tracking-tight">
            Platform Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => navigate("/resume-studio")} className="bg-white dark:bg-slate-800/40 rounded-[10px] p-8 shadow-md border-2 border-transparent cursor-pointer hover:border-[var(--mapout-secondary)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40">
                <FileCheck className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Resume Studio</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Build and optimize your resume with AI-powered analysis. Track your ATS score and get improvement suggestions.</p>
              <div className="flex items-center text-[var(--mapout-secondary)] font-semibold group-hover:gap-2 transition-all">Get Started <span className="group-hover:block hidden">→</span></div>
            </div>
            <div onClick={() => navigate("/career-planner")} className="bg-white dark:bg-slate-800/40 rounded-[10px] p-8 shadow-md border-2 border-transparent cursor-pointer hover:border-[var(--mapout-secondary)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40">
                <Target className="text-purple-600 dark:text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Career Growth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Plan your 4-year career roadmap with personalized paths. Track milestones, identify skill gaps, and chart your journey to success.</p>
              <div className="flex items-center text-[var(--mapout-secondary)] font-semibold group-hover:gap-2 transition-all">Explore Path <span className="group-hover:block hidden">→</span></div>
            </div>
            <div onClick={() => navigate("/projects")} className="bg-white dark:bg-slate-800/40 rounded-[10px] p-8 shadow-md border-2 border-transparent cursor-pointer hover:border-[var(--mapout-secondary)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800/40">
                <Briefcase className="text-green-600 dark:text-green-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Projects</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Discover hand-picked projects matched to your skills. Build portfolio pieces that impress recruiters and gain practical experience.</p>
              <div className="flex items-center text-[var(--mapout-secondary)] font-semibold group-hover:gap-2 transition-all">View Projects <span className="group-hover:block hidden">→</span></div>
            </div>
            <div onClick={() => navigate("/bookmarks")} className="bg-white dark:bg-slate-800/40 rounded-[10px] p-8 shadow-md border-2 border-transparent cursor-pointer hover:border-[var(--mapout-secondary)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40">
                <BookOpen className="text-orange-600 dark:text-orange-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Bookmarks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Save and organize learning resources, articles, and tutorials. Build your personal knowledge library for quick reference.</p>
              <div className="flex items-center text-[var(--mapout-secondary)] font-semibold group-hover:gap-2 transition-all">My Collection <span className="group-hover:block hidden">→</span></div>
            </div>
            <div onClick={() => navigate("/interview-faqs")} className="bg-white dark:bg-slate-800/40 rounded-[10px] p-8 shadow-md border-2 border-transparent cursor-pointer hover:border-[var(--mapout-secondary)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-red-100 dark:bg-red-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-800/40">
                <AlertCircle className="text-red-600 dark:text-red-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Interview Prep</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Master technical, behavioral, and project-based interview questions. Get role-specific preparation tips and guidance.</p>
              <div className="flex items-center text-[var(--mapout-secondary)] font-semibold group-hover:gap-2 transition-all">Prepare Now <span className="group-hover:block hidden">→</span></div>
            </div>
            <div onClick={() => navigate("/research-guide")} className="bg-white dark:bg-slate-800/40 rounded-[10px] p-8 shadow-md border-2 border-transparent cursor-pointer hover:border-[var(--mapout-secondary)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/40">
                <BookOpen className="text-indigo-600 dark:text-indigo-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Research Guide</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Learn to write professional research papers. Master IEEE formatting, citations, and academic writing standards.</p>
              <div className="flex items-center text-[var(--mapout-secondary)] font-semibold group-hover:gap-2 transition-all">Learn More <span className="group-hover:block hidden">→</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
