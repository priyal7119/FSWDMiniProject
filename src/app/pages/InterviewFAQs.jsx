import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Zap, BookOpen, Award, Target, ClipboardList, Code, Search, Rocket } from "lucide-react";
import { t } from "../utils/translate.js";
import { getRoadmap, api } from "../utils/api.js";

export function InterviewFAQs() {
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [openQuestions, setOpenQuestions] = useState({});
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [isPrepping, setIsPrepping] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    const fetchRoleAndQuestions = async () => {
      try {
        const roadmap = await getRoadmap();
        if (roadmap && roadmap.target_role) {
          setSelectedRole(roadmap.target_role);
          const q = await api.interview.getQuestions(roadmap.target_role);
          setDynamicQuestions(q);
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };
    fetchRoleAndQuestions();
  }, [token]);

  useEffect(() => {
    const fetchQ = async () => {
      const q = await api.interview.getQuestions(selectedRole);
      setDynamicQuestions(q);
    };
    fetchQ();
  }, [selectedRole]);

  const roles = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "AI/ML Engineer", "DevOps Engineer", 
    "UI/UX Designer", "Cybersecurity"
  ];

  const technicalQuestions = {
    "Frontend Developer": [
      { question: "What is the Virtual DOM and how does React use it for performance?", answer: "The Virtual DOM is a lightweight copy of the real DOM. React uses it to batch updates. When state changes, React compares a new Virtual DOM with the old one (diffing) and only updates the necessary real DOM nodes (reconciliation)." },
      { question: "Explain the difference between cookies, localStorage, and sessionStorage.", answer: "Cookies have small size limits and are sent with HTTP requests. LocalStorage is persistent across sessions and has larger capacity (~5MB). SessionStorage is similar to LocalStorage but is cleared when the tab is closed." },
      { question: "What are CSS pseudo-classes and pseudo-elements?", answer: "Pseudo-classes (:hover, :active) define a special state of an element. Pseudo-elements (::before, ::after) are used to style specific parts of an element." }
    ],
    "Backend Developer": [
      { question: "Explain the differences between REST and GraphQL.", answer: "REST is architectural, usually returning fixed data structures from multiple endpoints. GraphQL is a query language that allows clients to request exactly what they need from a single endpoint, reducing over-fetching." },
      { question: "What is horizontal vs vertical scaling?", answer: "Vertical scaling (Scaling Up) means adding more power (CPU, RAM) to an existing server. Horizontal scaling (Scaling Out) means adding more servers to the pool to handle traffic." },
      { question: "How does a relational database ensure ACID properties?", answer: "ACID (Atomicity, Consistency, Isolation, Durability) is ensured through transaction logging, locking mechanisms, and multi-version concurrency control (MVCC)." }
    ],
    "Full Stack Developer": [
      { question: "What is JAMstack and why is it popular?", answer: "JAMstack stands for JavaScript, APIs, and Markup. It focuses on decoupling the frontend from the backend, using pre-rendered static files served over a CDN for extreme speed and security." },
      { question: "Explain the concept of 'Hydration' in Server-Side Rendering.", answer: "Hydration is the process where client-side JavaScript takes over static HTML sent by the server, attaching event listeners and turning it into a fully interactive SPA." }
    ],
    "Data Scientist": [
      { question: "What is the difference between supervised and unsupervised learning?", answer: "Supervised learning uses labeled datasets to train algorithms for classification or regression. Unsupervised learning analyzes unlabeled data to find hidden patterns or clustering." },
      { question: "Explain the Bias-Variance tradeoff.", answer: "Bias is error from erroneous assumptions (underfitting). Variance is error from sensitivity to small fluctuations in training data (overfitting). A good model balances both to minimize total error." }
    ],
    "AI/ML Engineer": [
      { question: "What is Gradient Descent and how does it work?", answer: "Gradient Descent is an optimization algorithm used to minimize the cost function by iteratively moving toward the steepest descent (negative gradient) of the function." },
      { question: "Explain the difference between CNNs and RNNs.", answer: "CNNs (Convolutional Neural Networks) are great for spatial data like images. RNNs (Recurrent Neural Networks) are designed for sequential data like text or time-series because they have 'memory' of previous inputs." }
    ],
    "DevOps Engineer": [
      { question: "What is Infrastructure as Code (IaC)?", answer: "IaC is the practice of managing and provisioning computing infrastructure through machine-readable definition files (like Terraform or Ansible) rather than physical hardware configuration or interactive tools." },
      { question: "Explain the concept of Blue-Green Deployment.", answer: "It's a deployment strategy that uses two identical production environments. Only one (Blue) is live at a time. The new version is deployed to Green, tested, and then traffic is switched instantly." }
    ],
    "UI/UX Designer": [
      { question: "What is 'Affordance' in design?", answer: "Affordance refers to the properties of an object that show how it can be used. For example, a button that 'looks clickable' has a clear affordance." },
      { question: "Explain the difference between UI and UX.", answer: "UI (User Interface) focuses on the visual layout and interactivity. UX (User Experience) focuses on the overall feel of the product and how easily users can achieve their goals." }
    ],
    "Cybersecurity": [
      { question: "What is a Man-in-the-Middle (MITM) attack?", answer: "An attack where the attacker secretly intercepts and relays communication between two parties who believe they are communicating directly with each other." },
      { question: "Explain the principle of Least Privilege.", answer: "It's the security concept that any user or system should have only the minimum access levels necessary to perform their job functions." }
    ]
  };

  const getGenericQuestions = (role) => {
    const isTechnical = role.includes("Engineer") || role.includes("Developer") || role.includes("Data");
    const roleFocus = role.split(" ")[0]; // "Frontend", "Data", "Cybersecurity"

    return {
      behavioral: [
        {
          question: `Tell me about a time when you faced a challenging bug in a ${roleFocus} environment. How did you resolve it?`,
          answer: "Use the STAR method (Situation, Task, Action, Result). Describe your specific debugging approach, the diagnostic tools you used, and how you ensured it never happened again.",
        },
        {
          question: `How do you handle scope-creep or shifting requirements in your ${roleFocus} tasks?`,
          answer: "Explain your approach to open communication with product managers. Mention focusing on the MVP (Minimum Viable Product) and evaluating technical trade-offs before over-promising.",
        },
        {
          question: `Describe a project where you had to learn a new ${isTechnical ? 'technology' : 'design paradigm'} quickly.`,
          answer: "Share a specific example. Discuss your learning process, documentation reading habits, and how you applied it successfully to hit a tight deadline.",
        },
        {
          question: "What motivates you as a professional?",
          answer: "Be genuine. Common motivations include solving complex problems, building scalable architecture, continuous learning, and directly impacting the user experience.",
        },
      ],
      project: [
        {
          question: "Walk me through the most complex project returning on your resume.",
          answer: "Choose your best blueprint. Explain: (1) The problem it solves, (2) Architectural choices and why, (3) Your specific code/design contributions, (4) Scale/impact metrics.",
        },
        {
          question: `What was the most challenging aspect of building that ${roleFocus} project?`,
          answer: "Discuss a technical or architectural ceiling, how you identified it, the approaches you considered, and your final solution. Emphasize critical thinking over raw coding.",
        },
        {
          question: `How do you enforce quality control and best practices in your ${roleFocus} workflow?`,
          answer: `Mention practices like: ${isTechnical ? 'unit testing, CI/CD pipelines, strict linting, and rigorous peer code reviews' : 'design systems, user testing, a/b split testing, and accessibility checks'}.`,
        },
        {
          question: "If you had 3 more months to work on that project, what would you refactor or add?",
          answer: "Show a growth mindset. Discuss architectural improvements like migrating to a microservice, better automated testing coverage, or advanced performance optimization strategies.",
        },
      ],
    };
  };

  const toggleQuestion = (category, index) => {
    const key = `${category}-${index}`;
    setOpenQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--mapout-bg)] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 font-sans">
          {t('interviewHeading', language)}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium">
          {t('interviewSubheading', language)}
        </p>

        {/* Preparation Tips - Top Section */}
        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-l-4 border-blue-500 rounded-2xl p-8 shadow-sm mb-12 border border-slate-100 dark:border-white/5">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 font-sans">
            <Zap size={28} className="text-blue-500 fill-blue-500/20" />
            Expert Interview Strategies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <ClipboardList className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">STAR Method</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Structure your behavioral answers with Situation, Task, Action, and Result.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Code className="text-indigo-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Live Coding</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Practice algorithm efficiency and clean code on LeetCode daily.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Target className="text-emerald-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Project Deep-Dive</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Be ready to justify every technical decision in your portfolio projects.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <Search className="text-orange-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Company Culture</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Research company values and prepare thoughtful questions for your peer panel.</p>
              </div>
            </div>
          </div>
        </div>

        {/* MOCK INTERVIEW START */}
        <div className="mb-12 bg-white dark:bg-slate-900 rounded-3xl p-10 border-2 border-blue-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-blue-500/40 transition-all">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:rotate-6 transition-transform">
               <Rocket size={40} />
             </div>
             <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Ready for a Simulation?</h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium tracking-tight max-w-md">Launch a professional timed mock interview for <span className="text-blue-500 font-bold">{selectedRole}</span>. We'll simulate technical challenges and evaluate your STAR responses.</p>
             </div>
          </div>
          <button 
            onClick={async () => {
              setIsPrepping(true);
              await api.interview.incrementPrepCount();
              setTimeout(() => {
                setIsPrepping(false);
                window.open("https://meet.google.com/new", "_blank");
              }, 1500);
            }}
            disabled={isPrepping}
            className={`px-12 py-5 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 text-lg ${isPrepping ? 'opacity-70 animate-pulse' : ''}`}
          >
            {isPrepping ? "Provisioning Agent..." : "Deploy Mock Session"}
            <ChevronDown size={20} className="-rotate-90" />
          </button>
        </div>

        {/* Role Selection Dropdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm mb-12 border border-slate-100 dark:border-white/5">
          <label className="block mb-4 font-bold text-slate-800 dark:text-slate-200 text-lg">Target Career Role</label>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-6 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all appearance-none cursor-pointer"
            >
              {roles.map((role) => (
                <option key={role} value={role} className="bg-white dark:bg-slate-950">
                  {role}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Technical Questions */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
              <Target className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-sans">
              Technical Core for {selectedRole}
            </h2>
          </div>
          <div className="space-y-4">
            {([...(technicalQuestions[selectedRole] || technicalQuestions["Frontend Developer"]), ...dynamicQuestions]).map((item, idx) => {
              const isOpen = openQuestions[`technical-${idx}`];
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-300 hover:shadow-md">
                  <button
                    onClick={() => toggleQuestion("technical", idx)}
                    className="w-full p-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 dark:text-gray-200 text-left leading-relaxed">{item.question}</span>
                    <div className={`p-2 rounded-lg transition-transform ${isOpen ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 rotate-180' : 'text-slate-400'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6">
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5">
                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Behavioral Questions */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-inner">
              <Award className="text-purple-600 dark:text-purple-400" size={28} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-sans">
              Behavioral Scenarios
            </h2>
          </div>
          <div className="space-y-4">
            {getGenericQuestions(selectedRole).behavioral.map((item, idx) => {
              const isOpen = openQuestions[`behavioral-${idx}`];
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-300 hover:shadow-md">
                  <button
                    onClick={() => toggleQuestion("behavioral", idx)}
                    className="w-full p-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 dark:text-gray-200 text-left leading-relaxed">{item.question}</span>
                    <div className={`p-2 rounded-lg transition-transform ${isOpen ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 rotate-180' : 'text-slate-400'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6">
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5">
                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Questions */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <BookOpen className="text-emerald-600 dark:text-emerald-400" size={28} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-sans">
              Portfolio & Projects
            </h2>
          </div>
          <div className="space-y-4">
            {getGenericQuestions(selectedRole).project.map((item, idx) => {
              const isOpen = openQuestions[`project-${idx}`];
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-300 hover:shadow-md">
                  <button
                    onClick={() => toggleQuestion("project", idx)}
                    className="w-full p-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 dark:text-gray-200 text-left leading-relaxed">{item.question}</span>
                    <div className={`p-2 rounded-lg transition-transform ${isOpen ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rotate-180' : 'text-slate-400'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6">
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5">
                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -mb-40 -mr-40" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-8 font-sans">Final Check-List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Practice complex algorithmic problems on LeetCode regularly.",
                "Structure your STAR answers with quantifiable metrics (e.g., 'improved speed by 20%').",
                "Deep-dive into your personal projects' architecture and technical trade-offs.",
                "Thoroughly research the company engineering blog and tech stack.",
                "Conduct at least 3 mock interviews with senior developers/peers.",
                "Prepare at least 4 insightful questions for the technical recruiters."
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <p className="text-slate-100 font-medium leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
