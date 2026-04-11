import { useState, useRef, useEffect, useCallback } from "react";
import {
  Briefcase, GraduationCap, ArrowRight, Check, Download,
  TrendingUp, Award, Map, BookOpen,
  Compass, Rocket, Star, Clock,
  Brain, BarChart2, Calendar,
  Layers, Code, Database, Cloud, Shield,
  PenTool, Loader2, Sparkles,
  ChevronDown, ChevronUp, ExternalLink,
  Trophy, Flame, Circle, Monitor, FileText, ClipboardList,
  Key, Search, AlertTriangle, ShieldAlert, Scale, Microscope, Edit3,
  Terminal, Globe, Book, LockOpen, Activity, Cpu, Settings, 
  Layout, MessageSquare, Eye, Box, Plug, Wrench, Zap, Target,
  Anchor, RotateCw, HardDrive, Hexagon, User, Palette, Play,
  Smartphone, Share2, Server, Trash2
} from "lucide-react";
import {
  getRoadmap, setRoadmap, getMilestones, toggleMilestone,
  getSkills, saveRoadmapPreferences, getRoadmapPreferences
} from "../utils/api.js";
import { useToast } from "../components/Toast.jsx";
import { jsPDF } from "jspdf";

// ──────────────────────────────────────────────────────────────────────────
// DATA LAYER — Comprehensive role + roadmap definitions
// ──────────────────────────────────────────────────────────────────────────

const ROLE_DATA = {
  "Frontend Developer": {
    icon: Code,
    color: "from-blue-500/20 to-cyan-500/20",
    accent: "#3B82F6",
    tagColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description: "Build stunning user interfaces and web experiences",
    avgSalary: "₹8–22 LPA",
    demand: "Very High",
    skills: [
      { name: "HTML & CSS", level: "Foundation", priority: 1, icon: Palette },
      { name: "JavaScript (ES6+)", level: "Core", priority: 1, icon: Zap },
      { name: "React.js", level: "Core", priority: 1, icon: Code },
      { name: "TypeScript", level: "Advanced", priority: 2, icon: FileText },
      { name: "Next.js", level: "Advanced", priority: 2, icon: Rocket },
      { name: "Tailwind CSS", level: "Core", priority: 2, icon: Layers },
      { name: "Redux / Zustand", level: "Advanced", priority: 3, icon: RotateCw },
      { name: "Web Performance", level: "Expert", priority: 3, icon: Activity },
      { name: "Testing (Jest/RTL)", level: "Advanced", priority: 3, icon: ShieldAlert },
      { name: "Responsive Design", level: "Core", priority: 2, icon: Smartphone },
    ],
    roadmap: {
      beginner: [
        { phase: "Phase 1", duration: "2 months", title: "Web Fundamentals", tasks: ["Master HTML5 semantics & accessibility", "CSS layouts: Flexbox & Grid", "CSS animations & transitions", "Responsive design principles"] },
        { phase: "Phase 2", duration: "3 months", title: "JavaScript Mastery", tasks: ["ES6+ features: arrow fns, destructuring", "DOM manipulation & events", "Async JS: Promises, async/await", "Fetch API & REST integration"] },
        { phase: "Phase 3", duration: "3 months", title: "React Ecosystem", tasks: ["React components & JSX", "Hooks: useState, useEffect, custom hooks", "React Router for navigation", "State management with Zustand"] },
        { phase: "Phase 4", duration: "2 months", title: "Portfolio & Jobs", tasks: ["Build 3 production-quality projects", "Deploy on Vercel / Netlify", "Optimize GitHub profile", "Apply to 5+ positions weekly"] },
      ],
      intermediate: [
        { phase: "Phase 1", duration: "6 weeks", title: "Advanced React Patterns", tasks: ["TypeScript with React", "Next.js App Router", "Server Components & SSR", "Performance optimization"] },
        { phase: "Phase 2", duration: "6 weeks", title: "Tooling & Testing", tasks: ["Vite & build optimization", "Jest & React Testing Library", "Storybook for component docs", "CI/CD with GitHub Actions"] },
        { phase: "Phase 3", duration: "4 weeks", title: "Architecture", tasks: ["Design systems & component libraries", "Micro-frontend architecture", "Web accessibility (WCAG)", "Core Web Vitals optimization"] },
        { phase: "Phase 4", duration: "4 weeks", title: "Land the Role", tasks: ["LeetCode: 50 problems (Easy/Medium)", "System design for frontends", "Contribute to open source", "Interview preparation"] },
      ],
      advanced: [
        { phase: "Phase 1", duration: "4 weeks", title: "Expert Patterns", tasks: ["Advanced TypeScript generics", "Custom rendering engines", "WebAssembly basics", "V8 engine internals"] },
        { phase: "Phase 2", duration: "4 weeks", title: "Lead-Level Skills", tasks: ["Monorepo management (Turborepo/Nx)", "Design system governance", "Performance budgeting", "Cross-team API contracts"] },
        { phase: "Phase 3", duration: "4 weeks", title: "Impact Projects", tasks: ["Build & publish an npm package", "Open source major PR", "Technical blog / talks", "Senior role applications"] },
      ],
    },
    resources: [
      { title: "MDN Web Docs", url: "https://developer.mozilla.org", type: "Reference" },
      { title: "React Official Docs", url: "https://react.dev", type: "Documentation" },
      { title: "JavaScript.info", url: "https://javascript.info", type: "Tutorial" },
      { title: "Frontend Masters", url: "https://frontendmasters.com", type: "Course" },
    ],
  },

  "Backend Developer": {
    icon: Database,
    color: "from-emerald-500/20 to-teal-500/20",
    accent: "#10B981",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    description: "Power apps with scalable APIs and robust server architectures",
    avgSalary: "₹9–25 LPA",
    demand: "High",
    skills: [
      { name: "Node.js / Python", level: "Core", priority: 1, icon: "🟢" },
      { name: "REST API Design", level: "Core", priority: 1, icon: "🔌" },
      { name: "SQL (PostgreSQL)", level: "Core", priority: 1, icon: "🗄️" },
      { name: "Authentication (JWT/OAuth)", level: "Core", priority: 2, icon: "🔐" },
      { name: "Redis / Caching", level: "Advanced", priority: 2, icon: "⚡" },
      { name: "Docker", level: "Advanced", priority: 2, icon: "🐳" },
      { name: "GraphQL", level: "Advanced", priority: 3, icon: "◉" },
      { name: "Microservices", level: "Expert", priority: 3, icon: "🏗️" },
      { name: "Message Queues", level: "Expert", priority: 3, icon: "📨" },
      { name: "System Design", level: "Expert", priority: 3, icon: "📐" },
    ],
    roadmap: {
      beginner: [
        { phase: "Phase 1", duration: "2 months", title: "Programming Foundations", tasks: ["Python or Node.js fundamentals", "OOP principles & patterns", "CLI tools & scripting", "Git version control"] },
        { phase: "Phase 2", duration: "2 months", title: "Databases & SQL", tasks: ["Relational database design", "PostgreSQL queries & JOINs", "Indexing & query optimization", "ORMs: Prisma or SQLAlchemy"] },
        { phase: "Phase 3", duration: "3 months", title: "API Development", tasks: ["REST API with Express/FastAPI", "Authentication: JWT & sessions", "Input validation & error handling", "API documentation with Swagger"] },
        { phase: "Phase 4", duration: "3 months", title: "Production Readiness", tasks: ["Docker containerization", "Environment configs & secrets", "Logging & monitoring basics", "Deploy to Railway / Render"] },
      ],
      intermediate: [
        { phase: "Phase 1", duration: "6 weeks", title: "Advanced Databases", tasks: ["Redis caching strategies", "Database replication & sharding", "Full-text search with Elasticsearch", "NoSQL patterns (MongoDB)"] },
        { phase: "Phase 2", duration: "6 weeks", title: "Scalability", tasks: ["Microservices decomposition", "Message queues (RabbitMQ/Kafka)", "gRPC & Protocol Buffers", "API Gateway patterns"] },
        { phase: "Phase 3", duration: "8 weeks", title: "System Design", tasks: ["Distributed systems theory", "CAP theorem & consistency", "Rate limiting & throttling", "System design interviews"] },
      ],
    },
    resources: [
      { title: "The Odin Project", url: "https://theodinproject.com", type: "Tutorial" },
      { title: "PostgreSQL Docs", url: "https://postgresql.org/docs", type: "Reference" },
      { title: "Node.js Best Practices", url: "https://github.com/goldbergyoni/nodebestpractices", type: "Guide" },
    ],
  },

  "Full Stack Developer": {
    icon: Layers,
    color: "from-violet-500/20 to-purple-500/20",
    accent: "#8B5CF6",
    tagColor: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    description: "Master both client and server—build complete products end-to-end",
    avgSalary: "₹10–28 LPA",
    demand: "Very High",
    skills: [
      { name: "React.js", level: "Core", priority: 1, icon: Code },
      { name: "Node.js", level: "Core", priority: 1, icon: Server },
      { name: "PostgreSQL / Supabase", level: "Core", priority: 1, icon: Database },
      { name: "TypeScript", level: "Core", priority: 2, icon: FileText },
      { name: "REST & GraphQL APIs", level: "Core", priority: 2, icon: Plug },
      { name: "Git & CI/CD", level: "Core", priority: 2, icon: Wrench },
      { name: "Docker", level: "Advanced", priority: 3, icon: Box },
      { name: "Cloud (AWS/GCP)", level: "Advanced", priority: 3, icon: Cloud },
      { name: "System Design", level: "Expert", priority: 3, icon: Layout },
      { name: "Web Security", level: "Advanced", priority: 3, icon: Shield },
    ],
    roadmap: {
      beginner: [
        { phase: "Phase 1", duration: "3 months", title: "Frontend Core", tasks: ["HTML, CSS, JavaScript mastery", "React fundamentals & hooks", "Responsive & accessible UI", "Figma basics for dev handoff"] },
        { phase: "Phase 2", duration: "3 months", title: "Backend Core", tasks: ["Node.js + Express APIs", "SQL + Supabase/PostgreSQL", "Authentication & authorization", "File uploads & storage"] },
        { phase: "Phase 3", duration: "2 months", title: "Full Stack Projects", tasks: ["Build 2 full stack apps", "Deploy on Vercel + Railway", "Domain & HTTPS setup", "Write technical documentation"] },
        { phase: "Phase 4", duration: "2 months", title: "Job Market Entry", tasks: ["Portfolio with 3 live projects", "Resume & LinkedIn optimization", "LeetCode 75 problems", "Mock interview practice"] },
      ],
      intermediate: [
        { phase: "Phase 1", duration: "8 weeks", title: "Advanced Architecture", tasks: ["Next.js full stack applications", "Serverless functions & Edge", "Real-time with WebSockets", "Advanced database patterns"] },
        { phase: "Phase 2", duration: "8 weeks", title: "DevOps & Scale", tasks: ["Docker & Kubernetes basics", "CI/CD pipelines", "Cloud deployment (AWS/GCP)", "Monitoring with Datadog/Grafana"] },
        { phase: "Phase 3", duration: "4 weeks", title: "Leadership Prep", tasks: ["System design mock interviews", "Technical writing & docs", "Code review best practices", "Open source contributions"] },
      ],
    },
    resources: [
      { title: "Full Stack Open", url: "https://fullstackopen.com", type: "Free Course" },
      { title: "Supabase Docs", url: "https://supabase.com/docs", type: "Documentation" },
    ],
  },

  "Data Scientist": {
    icon: BarChart2,
    color: "from-orange-500/20 to-amber-500/20",
    accent: "#F59E0B",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    description: "Turn raw data into insights that drive decisions",
    avgSalary: "₹8–20 LPA",
    demand: "High",
    skills: [
      { name: "Python", level: "Core", priority: 1, icon: Monitor },
      { name: "Pandas & NumPy", level: "Core", priority: 1, icon: BarChart2 },
      { name: "SQL", level: "Core", priority: 1, icon: Database },
      { name: "Data Visualization", level: "Core", priority: 2, icon: TrendingUp },
      { name: "Machine Learning (Scikit)", level: "Advanced", priority: 2, icon: Brain },
      { name: "Statistics & Probability", level: "Core", priority: 1, icon: Compass },
      { name: "Feature Engineering", level: "Advanced", priority: 2, icon: Settings },
      { name: "TensorFlow / Keras", level: "Advanced", priority: 3, icon: Cpu },
      { name: "Big Data (Spark)", level: "Expert", priority: 3, icon: Flame },
      { name: "Storytelling with Data", level: "Core", priority: 2, icon: Target },
    ],
    roadmap: {
      beginner: [
        { phase: "Phase 1", duration: "2 months", title: "Python & Stats", tasks: ["Python: lists, dicts, loops, functions", "Descriptive statistics & probability", "NumPy arrays & operations", "Pandas DataFrames"] },
        { phase: "Phase 2", duration: "2 months", title: "Data Analysis", tasks: ["Exploratory data analysis (EDA)", "Matplotlib & Seaborn charts", "Handling missing data", "Feature engineering basics"] },
        { phase: "Phase 3", duration: "3 months", title: "Machine Learning", tasks: ["Scikit-learn: regression & classification", "Model evaluation & cross-validation", "Clustering algorithms", "Kaggle competitions"] },
        { phase: "Phase 4", duration: "3 months", title: "Portfolio & Industry", tasks: ["End-to-end ML projects", "Tableau / Power BI dashboards", "SQL for data analysis", "Data science job applications"] },
      ],
    },
    resources: [
      { title: "Kaggle Learn", url: "https://kaggle.com/learn", type: "Free Course" },
      { title: "Towards Data Science", url: "https://towardsdatascience.com", type: "Blog" },
    ],
  },

  "AI/ML Engineer": {
    icon: Brain,
    color: "from-pink-500/20 to-rose-500/20",
    accent: "#EC4899",
    tagColor: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    description: "Build intelligent systems and production ML pipelines",
    avgSalary: "₹12–35 LPA",
    demand: "Exceptional",
    skills: [
      { name: "Python", level: "Core", priority: 1, icon: Monitor },
      { name: "PyTorch / TensorFlow", level: "Core", priority: 1, icon: Flame },
      { name: "Deep Learning", level: "Core", priority: 1, icon: Brain },
      { name: "NLP & Transformers", level: "Advanced", priority: 2, icon: MessageSquare },
      { name: "Computer Vision", level: "Advanced", priority: 2, icon: Eye },
      { name: "MLOps (MLflow)", level: "Advanced", priority: 2, icon: Settings },
      { name: "Data Engineering", level: "Advanced", priority: 3, icon: HardDrive },
      { name: "Cloud AI (SageMaker/Vertex)", level: "Expert", priority: 3, icon: Cloud },
      { name: "LLMs & Prompt Engineering", level: "Advanced", priority: 2, icon: Sparkles },
      { name: "Mathematics (Linear Algebra)", level: "Core", priority: 1, icon: Compass },
    ],
    roadmap: {
      beginner: [
        { phase: "Phase 1", duration: "2 months", title: "Math & Python", tasks: ["Linear algebra & calculus intuition", "Probability & statistics", "Python for ML: NumPy, Pandas", "Jupyter notebooks mastery"] },
        { phase: "Phase 2", duration: "3 months", title: "ML Foundations", tasks: ["Supervised learning algorithms", "Neural networks from scratch", "PyTorch tensors & autograd", "Model training & evaluation loops"] },
        { phase: "Phase 3", duration: "3 months", title: "Deep Learning", tasks: ["CNNs for computer vision", "RNNs & Transformers for NLP", "Transfer learning & fine-tuning", "Hugging Face ecosystem"] },
        { phase: "Phase 4", duration: "4 months", title: "MLOps & Deployment", tasks: ["Model serving with FastAPI", "MLflow experiment tracking", "Docker for ML models", "Cloud deployment (AWS SageMaker)"] },
      ],
    },
    resources: [
      { title: "fast.ai", url: "https://fast.ai", type: "Free Course" },
      { title: "Hugging Face Docs", url: "https://huggingface.co/docs", type: "Documentation" },
      { title: "Papers With Code", url: "https://paperswithcode.com", type: "Research" },
    ],
  },

  "DevOps Engineer": {
    icon: Cloud,
    color: "from-sky-500/20 to-blue-500/20",
    accent: "#0EA5E9",
    tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    description: "Bridge development and operations—automate and scale infrastructure",
    avgSalary: "₹10–30 LPA",
    demand: "High",
    skills: [
      { name: "Linux Administration", level: "Core", priority: 1, icon: Terminal },
      { name: "Docker & Containers", level: "Core", priority: 1, icon: Box },
      { name: "Kubernetes", level: "Advanced", priority: 2, icon: Anchor },
      { name: "CI/CD (GitHub Actions)", level: "Core", priority: 1, icon: RotateCw },
      { name: "AWS / GCP / Azure", level: "Advanced", priority: 2, icon: Cloud },
      { name: "Terraform (IaC)", level: "Advanced", priority: 2, icon: Hexagon },
      { name: "Bash & Python Scripting", level: "Core", priority: 1, icon: Code },
      { name: "Monitoring (Prometheus)", level: "Advanced", priority: 3, icon: Activity },
      { name: "Networking & DNS", level: "Core", priority: 2, icon: Globe },
      { name: "Security (DevSecOps)", level: "Expert", priority: 3, icon: Shield },
    ],
    roadmap: {
      beginner: [
        { phase: "Phase 1", duration: "2 months", title: "Linux & Networking", tasks: ["Linux CLI: files, permissions, processes", "Bash scripting fundamentals", "TCP/IP, DNS, HTTP basics", "SSH & remote server management"] },
        { phase: "Phase 2", duration: "2 months", title: "Containers & CI/CD", tasks: ["Docker: images, containers, compose", "GitHub Actions workflows", "Artifact registries", "Environment management"] },
        { phase: "Phase 3", duration: "3 months", title: "Cloud & IaC", tasks: ["AWS core services (EC2, S3, RDS)", "Terraform for infrastructure", "Kubernetes fundamentals", "Helm charts & deployments"] },
        { phase: "Phase 4", duration: "3 months", title: "Production Systems", tasks: ["Prometheus & Grafana monitoring", "Log aggregation (ELK stack)", "On-call practices & SLOs", "Security scanning & compliance"] },
      ],
    },
    resources: [
      { title: "KodeKloud", url: "https://kodekloud.com", type: "Hands-on Labs" },
      { title: "AWS Free Tier", url: "https://aws.amazon.com/free", type: "Practice" },
    ],
  },

  "UI/UX Designer": {
    icon: PenTool,
    color: "from-fuchsia-500/20 to-pink-500/20",
    accent: "#D946EF",
    tagColor: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
    description: "Design experiences that delight users and drive engagement",
    avgSalary: "₹6–18 LPA",
    demand: "Moderate",
    skills: [
      { name: "Figma", level: "Core", priority: 1, icon: Palette },
      { name: "User Research", level: "Core", priority: 1, icon: Search },
      { name: "Wireframing", level: "Core", priority: 1, icon: Compass },
      { name: "Prototyping", level: "Core", priority: 2, icon: Zap },
      { name: "Design Systems", level: "Advanced", priority: 2, icon: Layers },
      { name: "Accessibility (WCAG)", level: "Advanced", priority: 2, icon: User },
      { name: "Usability Testing", level: "Advanced", priority: 2, icon: Activity },
      { name: "Motion Design", level: "Advanced", priority: 3, icon: Play },
      { name: "HTML/CSS Basics", level: "Core", priority: 2, icon: Code },
      { name: "Design Psychology", level: "Expert", priority: 3, icon: Brain },
    ],
    roadmap: {
      beginner: [
        { phase: "Phase 1", duration: "2 months", title: "Design Foundations", tasks: ["Principles: color, typography, spacing", "Gestalt psychology in UI", "Figma fundamentals & shortcuts", "UI component patterns"] },
        { phase: "Phase 2", duration: "2 months", title: "UX Research", tasks: ["User interviews & surveys", "Persona creation", "User journey mapping", "Affinity diagrams"] },
        { phase: "Phase 3", duration: "3 months", title: "Prototyping & Testing", tasks: ["Wireframes → high-fidelity", "Interactive Figma prototypes", "Usability testing sessions", "A/B testing basics"] },
        { phase: "Phase 4", duration: "3 months", title: "Portfolio & Handoff", tasks: ["3 case study projects", "Developer handoff with tokens", "Portfolio on Behance/Dribbble", "Job applications + portfolio review"] },
      ],
    },
    resources: [
      { title: "Figma Community", url: "https://figma.com/community", type: "Resources" },
      { title: "Nielsen Norman Group", url: "https://nngroup.com", type: "Research" },
    ],
  },

  "Cybersecurity": {
    icon: Shield,
    color: "from-red-500/20 to-orange-500/20",
    accent: "#EF4444",
    tagColor: "bg-red-500/10 text-red-600 border-red-500/20",
    description: "Protect systems and defend against ever-evolving cyber threats",
    avgSalary: "₹8–25 LPA",
    demand: "High",
    skills: [
      { name: "Networking (TCP/IP)", level: "Core", priority: 1, icon: Globe },
      { name: "Linux Security", level: "Core", priority: 1, icon: Terminal },
      { name: "Penetration Testing", level: "Advanced", priority: 2, icon: LockOpen },
      { name: "SIEM Tools (Splunk)", level: "Advanced", priority: 2, icon: BarChart2 },
      { name: "Cryptography", level: "Core", priority: 2, icon: Key },
      { name: "Vulnerability Assessment", level: "Advanced", priority: 2, icon: Search },
      { name: "Incident Response", level: "Advanced", priority: 3, icon: AlertTriangle },
      { name: "Malware Analysis", level: "Expert", priority: 3, icon: ShieldAlert },
      { name: "Cloud Security (AWS)", level: "Expert", priority: 3, icon: Cloud },
      { name: "Risk Assessment", level: "Core", priority: 2, icon: Scale },
    ],
    roadmap: {
      beginner: [
        { phase: "Phase 1", duration: "3 months", title: "Networking & OS", tasks: ["TCP/IP, OSI model, subnetting", "Linux fundamentals & hardening", "Windows security basics", "Python scripting for security"] },
        { phase: "Phase 2", duration: "3 months", title: "Security Fundamentals", tasks: ["Cryptography concepts & PKI", "Common attack vectors (OWASP Top 10)", "Web application security", "CTF challenges (HackTheBox)"] },
      ],
    },
  },
};

const HIGHER_STUDY_TRACKS = {
  "GATE & MTech": {
    phases: [
      { phase: "Phase 1", duration: "Months 1–3", title: "Core Foundations", icon: Compass, tasks: ["Data Structures & Algorithms (CLRS)", "Discrete Mathematics (Kenneth Rosen)", "Engineering Mathematics", "Digital Logic Design"] },
      { phase: "Phase 2", duration: "Months 4–6", title: "CS Core Subjects", icon: Monitor, tasks: ["Operating Systems (Galvin)", "Computer Networks (Forouzan)", "Database Management (Ramakrishnan)", "Computer Organisation & Architecture"] },
      { phase: "Phase 3", duration: "Months 7–9", title: "Practice & Mock Tests", icon: Target, tasks: ["Solve 500+ PYQs topic-wise", "Full-length timed mock tests", "Weak area revision", "GATE Academy / MADE Easy tests"] },
      { phase: "Phase 4", duration: "Months 10–12", title: "Final Sprint", icon: Rocket, tasks: ["Daily revision flashcards", "5 mocks per week minimum", "College shortlisting (IIT/NIT/IIIT)", "Statement of Purpose drafts"] },
    ],
    skills: ["Data Structures", "Algorithms", "OS", "DBMS", "Computer Networks", "Discrete Math", "COA", "TOC", "Compiler Design"],
    resources: ["GATE PYQ Series", "Standard Textbooks", "Mock Test Series", "NPTEL Courses"],
  },
  "MS Abroad (US/Europe)": {
    phases: [
      { phase: "Phase 1", duration: "Months 1–4", title: "Test Preparation", icon: FileText, tasks: ["GRE quantitative (target 165+)", "GRE verbal (target 155+)", "IELTS/TOEFL preparation", "Shortlist 10–15 universities"] },
      { phase: "Phase 2", duration: "Months 5–8", title: "Application Building", icon: ClipboardList, tasks: ["Statement of Purpose writing", "3 strong Letters of Recommendation", "Resume tailored for research", "Portfolio of projects"] },
      { phase: "Phase 3", duration: "Months 9–12", title: "Applications & Funding", icon: GraduationCap, tasks: ["Submit applications (Oct–Dec)", "Apply for scholarships & TA/RA", "Visa documentation prep", "Financial aid negotiations"] },
    ],
    skills: ["GRE Quant", "Academic Writing", "Research Methods", "Python/R", "Technical SOP", "English Proficiency"],
    resources: ["GRE Official Guide", "GradCafe Forum", "US News University Rankings", "Scholarship Portals"],
  },
  "PhD / Research": {
    phases: [
      { phase: "Phase 1", duration: "Months 1–3", title: "Research Direction", icon: Microscope, tasks: ["Identify research area & gaps", "Literature review (Google Scholar)", "Read 20+ papers in domain", "Contact potential supervisors"] },
      { phase: "Phase 2", duration: "Months 4–6", title: "Academic Profile", icon: Edit3, tasks: ["Publish in conferences/journals", "Research proposal writing", "Network at academic events", "Master's thesis if applicable"] },
      { phase: "Phase 3", duration: "Months 7–12", title: "Proposal Defense", icon: Terminal, tasks: ["Draft full research proposal", "Research methodology design", "Entrance exams / Interviews", "Finalize funding & advisor"] },
    ],
    skills: ["Scientific Writing", "Critical Analysis", "Statistics/ML", "Presentation Skills", "Literature Mapping"],
    resources: ["Connected Papers", "ResearchGate", "Academic Twitter", "Grant Writing Guides"],
  },
};

const EXPLORE_INTERESTS = [
  { id: "tech", label: "Technology & Software", icon: Monitor, roles: ["Frontend Developer", "Full Stack Developer"] },
  { id: "data", label: "Data & Analytics", icon: BarChart2, roles: ["Data Scientist", "AI/ML Engineer"] },
  { id: "infra", label: "Infrastructure & Cloud", icon: Cloud, roles: ["DevOps Engineer", "Cybersecurity"] },
  { id: "design", label: "Design & Creativity", icon: Palette, roles: ["UI/UX Designer"] },
  { id: "research", label: "Research & Academia", icon: Microscope, roles: [] },
];

const TIPS = [
  { icon: TrendingUp, title: "Grow Every Day", desc: "Consistent 1–2 hrs of focused learning beats marathon sessions.", color: "from-teal-50 to-teal-100/60", border: "border-teal-200", iconBg: "bg-teal-500/10 text-teal-600" },
  { icon: Rocket, title: "Build and Ship Early", desc: "Launch imperfect projects. Real feedback beats perfect planning.", color: "from-indigo-50 to-indigo-100/60", border: "border-indigo-200", iconBg: "bg-indigo-500/10 text-indigo-600" },
  { icon: Brain, title: "Focus on Deep Work", desc: "Block distraction-free hours. Quality > quantity of time spent.", color: "from-purple-50 to-purple-100/60", border: "border-purple-200", iconBg: "bg-purple-500/10 text-purple-600" },
  { icon: Star, title: "Leverage AI Tools", desc: "Use AI assistants to learn faster, debug smarter, boost output.", color: "from-amber-50 to-amber-100/60", border: "border-amber-200", iconBg: "bg-amber-500/10 text-amber-600" },
];

// Priority level labels
const PRIORITY_LABELS = { 1: "Must-Have", 2: "Very Important", 3: "Nice to Have" };
const PRIORITY_COLORS = {
  1: "bg-red-500/10 text-red-600 border-red-500/20",
  2: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  3: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};
const LEVEL_COLORS = {
  "Foundation": "bg-blue-500/10 text-blue-600",
  "Core": "bg-teal-500/10 text-teal-600",
  "Advanced": "bg-purple-500/10 text-purple-600",
  "Expert": "bg-rose-500/10 text-rose-600",
};

// ──────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ──────────────────────────────────────────────────────────────────────────

function SkillBadge({ skill, isMastered }) {
  const Icon = skill.icon || Award;
  return (
    <div className={`group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${isMastered ? "bg-teal-500/5 border-teal-500/20" : "bg-card border-border hover:border-primary/30"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className="font-bold text-sm text-foreground">{skill.name}</span>
        </div>
        {isMastered && (
          <div className="flex-shrink-0 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
            <Check size={12} className="text-white" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${LEVEL_COLORS[skill.level] || "bg-muted text-muted-foreground"}`}>
          {skill.level}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_COLORS[skill.priority]}`}>
          {PRIORITY_LABELS[skill.priority]}
        </span>
        {isMastered && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
            ✓ In Profile
          </span>
        )}
      </div>
    </div>
  );
}

function RoadmapPhaseCard({ phase, index, isActive, onClick, totalPhases }) {
  const [expanded, setExpanded] = useState(index === 0);
  const Icon = phase.icon || Code;

  useEffect(() => { setExpanded(isActive); }, [isActive]);

  return (
    <div
      className={`relative rounded-3xl border-2 transition-all duration-500 overflow-hidden ${isActive ? "border-primary/40 shadow-2xl shadow-primary/10 bg-card" : "border-border bg-card/50 hover:border-border hover:shadow-md"}`}
    >
      {/* Phase connector line */}
      {index < totalPhases - 1 && (
        <div className="absolute -bottom-4 left-8 w-0.5 h-8 bg-gradient-to-b from-border to-transparent z-10" />
      )}

      {/* Header */}
      <button
        onClick={() => { setExpanded(!expanded); onClick(index); }}
        className="w-full text-left p-6 flex items-center gap-5"
      >
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{phase.phase}</span>
            <span className="text-[10px] text-muted-foreground font-medium">• {phase.duration}</span>
          </div>
          <h4 className="font-black text-base text-foreground truncate">{phase.title}</h4>
        </div>
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Task list */}
      {expanded && (
        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
          <div className="ml-[4.25rem] space-y-2.5">
            {phase.tasks.map((task, ti) => (
              <div key={ti} className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 border-primary/40 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                </div>
                <span className="text-sm text-muted-foreground font-medium leading-snug group-hover:text-foreground transition-colors">{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneRow({ milestone, onToggle }) {
  const isDone = milestone.status === "completed";
  return (
    <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 group ${isDone ? "bg-teal-500/5 border-teal-500/20" : "bg-muted/20 border-transparent hover:bg-card hover:border-border hover:shadow-md"}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggle(milestone.id, milestone.status)}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDone ? "bg-teal-500 text-white shadow-md shadow-teal-500/30" : "bg-muted border-2 border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
        >
          {isDone ? <Check size={18} /> : <Circle size={18} />}
        </button>
        <div>
          <p className={`font-bold text-sm ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>{milestone.title}</p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{milestone.category}</p>
        </div>
      </div>
      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${isDone ? "bg-teal-500/10 text-teal-600" : "bg-muted text-muted-foreground"}`}>
        {isDone ? "Done ✓" : "Pending"}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────

export function CareerPlanner() {
  const { info, success, warning, error: toastError } = useToast();
  const token = localStorage.getItem("token");

  // ── Core state
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [selectedHigherStudy, setSelectedHigherStudy] = useState("GATE & MTech");
  const [roadmapData, setRoadmapData] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);
  const [roleSkills, setRoleSkills] = useState([]);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [showMilestones, setShowMilestones] = useState(false);
  const [savedPreferences, setSavedPreferences] = useState(null);
  const [exploreInterest, setExploreInterest] = useState(null);
  const [skillFilter, setSkillFilter] = useState("all"); // all | to-learn | mastered

  // ── Preferences form state
  const [prefs, setPrefs] = useState({
    experience: "beginner",   // beginner | intermediate | advanced
    timePerWeek: "10",        // hours
    learningStyle: "project", // project | structured | mixed
    timeline: "6months",      // 3months | 6months | 1year
    currentSkills: [],
  });

  const roadmapRef = useRef(null);
  const milestonesRef = useRef(null);
  const roles = Object.keys(ROLE_DATA);

  // ── Init
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const init = async () => {
      try {
        setLoading(true);
        const [roadmap, milestones, skills, prefData] = await Promise.all([
          getRoadmap().catch(() => null),
          getMilestones().catch(() => []),
          getSkills().catch(() => []),
          getRoadmapPreferences().catch(() => null),
        ]);

        const skillNames = (skills || []).map(s => (s.skill_name || s.name || "").toLowerCase());
        setUserSkills(skillNames);
        setRoadmapData(milestones || []);

        if (prefData) {
          setSavedPreferences(prefData);
          if (prefData.experience) setPrefs(p => ({ ...p, ...prefData }));
        }

        if (roadmap?.selected_path) {
          setSelectedPath(roadmap.selected_path);
          const role = roadmap.target_role || "Frontend Developer";
          setSelectedRole(role);
          if (roadmap.selected_path === "industry") {
            fetchRoleSkillsLocal(role);
            setRoadmapGenerated(true);
          } else if (roadmap.selected_path === "higher_studies") {
            setRoadmapGenerated(true);
          }
        }
      } catch (err) {
        console.error("CareerPlanner init:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  const fetchRoleSkillsLocal = useCallback((role) => {
    const data = ROLE_DATA[role];
    if (data) setRoleSkills(data.skills || []);
  }, []);

  // Backend sync for role change
  const handleRoleChange = async (role) => {
    setSelectedRole(role);
    fetchRoleSkillsLocal(role);
    setRoadmapGenerated(false);
    try { 
      await setRoadmap({ selected_path: selectedPath, target_role: role }); 
    } catch { 
      warning("Failed to sync role preference with server."); 
    }
  };

  // Path selection
  const handlePathSelect = async (pathId) => {
    setSelectedPath(pathId);
    setRoadmapGenerated(false);
    setShowMilestones(false);
    if (pathId === "industry") fetchRoleSkillsLocal(selectedRole);
    try { 
      await setRoadmap({ selected_path: pathId, target_role: selectedRole }); 
    } catch { 
      warning("Failed to sync path selection with server."); 
    }
    setTimeout(() => roadmapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  // Generate roadmap
  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    try {
      // 1. Save preferences and seed milestones in one go
      await setRoadmap({ 
        selected_path: selectedPath, 
        target_role: selectedRole,
        ...prefs // Includes experience, timePerWeek, etc.
      });

      // 2. Fetch the newly seeded milestones
      const updated = await getMilestones().catch(() => []);
      setRoadmapData(updated || []);
      setSavedPreferences({ ...prefs, target_role: selectedRole });
      setRoadmapGenerated(true);
      
      success(`Roadmap successfully synced to cloud for ${selectedRole}!`);
    } catch (err) {
      console.error("Roadmap Sync failed:", err);
      // Fallback: Still show the generated roadmap UI even if cloud sync fails
      setRoadmapGenerated(true);
      warning("Roadmap generated locally. (Cloud storage connection interrupted)");
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle milestone
  const handleToggleMilestone = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await toggleMilestone(id, newStatus);
      const updated = await getMilestones();
      setRoadmapData(updated || []);
      if (newStatus === "completed") success("Milestone completed! Great work.");
    } catch { warning("Failed to update milestone."); }
  };

  // Download PDF
  const handleDownloadRoadmap = () => {
    try {
      info("Generating your roadmap PDF…");
      const doc = new jsPDF();
      const roleData = ROLE_DATA[selectedRole];
      const roadmapPhases = roleData?.roadmap?.[prefs.experience] || [];

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("MapOut Career Roadmap", 20, 18);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${selectedRole} — ${prefs.experience.charAt(0).toUpperCase() + prefs.experience.slice(1)} Level`, 20, 30);

      // Meta info
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      let y = 55;
      doc.setFont("helvetica", "bold");
      doc.text("Preferences:", 20, y); y += 8;
      doc.setFont("helvetica", "normal");
      doc.text(`• Experience Level: ${prefs.experience}`, 25, y); y += 6;
      doc.text(`• Time per week: ${prefs.timePerWeek} hours`, 25, y); y += 6;
      doc.text(`• Timeline: ${prefs.timeline}`, 25, y); y += 6;
      doc.text(`• Learning style: ${prefs.learningStyle}`, 25, y); y += 14;

      // Divider
      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(0.5);
      doc.line(20, y, 190, y); y += 10;

      // Phases
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("YOUR LEARNING ROADMAP", 20, y); y += 10;

      roadmapPhases.forEach((phase, i) => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(13, 148, 136);
        doc.text(`${phase.phase}: ${phase.title} (${phase.duration})`, 20, y); y += 7;
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        phase.tasks.forEach(task => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`  • ${task}`, 22, y); y += 6;
        });
        y += 6;
      });

      // Skills section
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setDrawColor(13, 148, 136);
      doc.line(20, y, 190, y); y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("REQUIRED SKILLS", 20, y); y += 10;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      (roleData?.skills || []).forEach(s => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`  • ${s.name} [${s.level}]`, 22, y); y += 5;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Generated by MapOut Career Planner · mapout.app", 105, 290, { align: "center" });
      doc.save(`mapout_${selectedRole.toLowerCase().replace(/\s+/g, "_")}_${prefs.experience}_roadmap.pdf`);
      success("📄 Roadmap PDF downloaded!");
    } catch { warning("Could not generate PDF. Please try again."); }
  };

  // Computed
  const completed = roadmapData.filter(m => m.status === "completed").length;
  const total = roadmapData.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const currentRoleData = ROLE_DATA[selectedRole];
  const currentRoadmapPhases = currentRoleData?.roadmap?.[prefs.experience] || currentRoleData?.roadmap?.beginner || [];

  const filteredSkills = roleSkills.length > 0
    ? roleSkills.filter(skill => {
        const name = (typeof skill === "string" ? skill : skill.name).toLowerCase();
        const mastered = userSkills.includes(name);
        if (skillFilter === "mastered") return mastered;
        if (skillFilter === "to-learn") return !mastered;
        return true;
      })
    : [];

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-medium">Loading your career data…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="mb-14 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Map size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Career Planner</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-none">
            Your Personalised <span className="text-primary">Career Roadmap.</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl text-lg">
            Tell us your goals and experience — we'll generate a custom step-by-step roadmap with the exact skills you need, tailored to your timeline.
          </p>

          {/* Stats bar */}
          {savedPreferences && (
            <div className="mt-6 inline-flex items-center gap-6 px-6 py-3 bg-card border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground">Roadmap Active</span>
              </div>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs font-bold text-foreground">{savedPreferences.target_role || selectedRole}</span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs font-bold text-primary">{progressPct}% Complete</span>
            </div>
          )}
        </div>

        {/* ── Step 1: Path Selection ───────────────────────────────── */}
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-primary text-white text-sm font-black flex items-center justify-center">1</span>
            Choose Your Direction
          </h2>
          <p className="text-muted-foreground text-sm mb-7 ml-11">What's your primary career goal right now?</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "industry", icon: Briefcase, title: "Get a Job in Tech", desc: "Land roles at top companies. Get a personalised skill roadmap for your target role.", badge: "🚀 Most Popular" },
              { id: "higher_studies", icon: GraduationCap, title: "Higher Studies", desc: "Prepare for GATE, MS Abroad, or Research. Track your study plan end-to-end.", badge: "🎓 Academic" },
              { id: "exploring", icon: Compass, title: "Still Exploring", desc: "Discover what interests you. Browse across fields and find your ideal career fit.", badge: "🔍 Discovery" },
            ].map((path) => {
              const Icon = path.icon;
              const isSelected = selectedPath === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => handlePathSelect(path.id)}
                  className={`text-left cursor-pointer rounded-[2rem] p-8 transition-all duration-400 group relative overflow-hidden border-2 ${
                    isSelected
                      ? "bg-card border-primary ring-2 ring-primary/20 shadow-2xl shadow-primary/10"
                      : "bg-muted/20 border-transparent hover:bg-card hover:border-border hover:shadow-lg"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
                  )}
                  <div className="relative">
                    <span className="inline-flex text-[10px] font-black px-3 py-1 rounded-full bg-muted text-muted-foreground mb-5 border border-border">
                      {path.badge}
                    </span>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-400 ${isSelected ? "bg-primary text-white shadow-xl shadow-primary/30" : "bg-muted text-muted-foreground group-hover:text-primary"}`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-black mb-3 tracking-tight">{path.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium text-sm mb-6">{path.desc}</p>
                    <div className={`flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest transition-all duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                      {isSelected ? "Selected" : "Select this path"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Scroll anchor ─────────────────────────────────────────── */}
        <div ref={roadmapRef} />

        {/* ════════════════════════════════════════════════════════════
            INDUSTRY PATH
        ════════════════════════════════════════════════════════════ */}
        {selectedPath === "industry" && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">

            {/* Step 2: Role Selection */}
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary text-white text-sm font-black flex items-center justify-center">2</span>
                Pick Your Target Role
              </h2>
              <p className="text-muted-foreground text-sm mb-7 ml-11">What role are you working towards?</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roles.map(role => {
                  const RoleIcon = ROLE_DATA[role]?.icon || Briefcase;
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all border-2 ${
                        isSelected
                          ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-md"
                      }`}
                    >
                      <RoleIcon size={18} className={isSelected ? "text-white" : "text-primary"} />
                      <span className="text-[11px] font-black">{role}</span>
                    </button>
                  );
                })}
              </div>

              {/* Role overview card */}
              {currentRoleData && (
                <div className={`mt-6 p-6 rounded-3xl border border-border bg-gradient-to-br ${currentRoleData.color} flex flex-col md:flex-row md:items-center gap-6`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
                      <currentRoleData.icon size={28} style={{ color: currentRoleData.accent }} />
                    </div>
                    <div>
                      <h3 className="font-black text-xl">{selectedRole}</h3>
                      <p className="text-muted-foreground text-sm">{currentRoleData.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 md:ml-auto">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Salary</p>
                      <p className="font-black text-foreground">{currentRoleData.avgSalary}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Market Demand</p>
                      <p className="font-black text-foreground">{currentRoleData.demand}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Preferences */}
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary text-white text-sm font-black flex items-center justify-center">3</span>
                Customize Your Roadmap
              </h2>
              <p className="text-muted-foreground text-sm mb-7 ml-11">Tell us about yourself so we can tailor the roadmap to you.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience level */}
                <div className="bg-card border border-border rounded-3xl p-6">
                  <p className="font-black text-sm mb-4 flex items-center gap-2"><Flame size={16} className="text-primary" /> Your Experience Level</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "beginner", label: "Beginner", icon: Circle, desc: "0–1 yr" },
                      { val: "intermediate", label: "Intermediate", icon: Zap, desc: "1–3 yrs" },
                      { val: "advanced", label: "Advanced", icon: Rocket, desc: "3+ yrs" },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => setPrefs(p => ({ ...p, experience: opt.val }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${prefs.experience === opt.val ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                      >
                        <opt.icon size={20} className="text-primary mb-1" />
                        <span className="text-[10px] font-black">{opt.label}</span>
                        <span className="text-[9px] text-muted-foreground">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time per week */}
                <div className="bg-card border border-border rounded-3xl p-6">
                  <p className="font-black text-sm mb-4 flex items-center gap-2"><Clock size={16} className="text-primary" /> Weekly Learning Time</p>
                  <div className="grid grid-cols-4 gap-2">
                    {["5", "10", "15", "20+"].map(hrs => (
                      <button
                        key={hrs}
                        onClick={() => setPrefs(p => ({ ...p, timePerWeek: hrs }))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${prefs.timePerWeek === hrs ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                      >
                        <span className="text-lg font-black">{hrs}</span>
                        <span className="text-[9px] text-muted-foreground">hrs/week</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning style */}
                <div className="bg-card border border-border rounded-3xl p-6">
                  <p className="font-black text-sm mb-4 flex items-center gap-2"><Brain size={16} className="text-primary" /> Learning Style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "project", label: "Project-based", icon: Wrench },
                      { val: "structured", label: "Course-driven", icon: Book },
                      { val: "mixed", label: "Balanced", icon: Scale },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => setPrefs(p => ({ ...p, learningStyle: opt.val }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${prefs.learningStyle === opt.val ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                      >
                        <opt.icon size={20} className="text-primary mb-1" />
                        <span className="text-[10px] font-black">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-card border border-border rounded-3xl p-6">
                  <p className="font-black text-sm mb-4 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Target Timeline</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "3months", label: "3 Months", icon: Zap },
                      { val: "6months", label: "6 Months", icon: Calendar },
                      { val: "1year", label: "1 Year", icon: Clock },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => setPrefs(p => ({ ...p, timeline: opt.val }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${prefs.timeline === opt.val ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                      >
                        <opt.icon size={20} className="text-primary mb-1" />
                        <span className="text-[10px] font-black">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate button */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gradient-to-r from-card to-muted/30 border border-border rounded-3xl p-6">
                <div>
                  <p className="font-black text-foreground">Ready to see your roadmap?</p>
                  <p className="text-sm text-muted-foreground">We'll generate a custom {prefs.experience}-level plan for {selectedRole}.</p>
                </div>
                <button
                  onClick={handleGenerateRoadmap}
                  disabled={isGenerating}
                  className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-sm uppercase tracking-wider rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <><Loader2 size={18} className="animate-spin" /> Generating…</>
                  ) : (
                    <><Sparkles size={18} /> Generate My Roadmap</>
                  )}
                </button>
              </div>
            </div>

            {/* ── Generated Roadmap ───────────────────────────────────── */}
            {roadmapGenerated && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-14">

                {/* ─ Roadmap Title Banner ─ */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-10 text-white">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-64 h-64 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-4 left-4 w-40 h-40 rounded-full bg-white blur-2xl" />
                  </div>
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Your Personalised Roadmap</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                        {selectedRole}
                      </h2>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-black">
                          {prefs.experience.charAt(0).toUpperCase() + prefs.experience.slice(1)} Level
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-black">
                          {prefs.timePerWeek} hrs/week
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-black">
                          {prefs.timeline.replace("months", " Months").replace("1year", "1 Year")}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-black capitalize">
                          {prefs.learningStyle === "project" ? "Project-based" : prefs.learningStyle === "structured" ? "Course-driven" : "Balanced"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDownloadRoadmap}
                        className="flex items-center gap-2 px-5 py-3 bg-white/20 text-white border border-white/30 hover:bg-white/30 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all"
                      >
                        <Download size={16} /> Export PDF
                      </button>
                      <button
                        onClick={() => setShowMilestones(prev => {
                          const next = !prev;
                          if (next) setTimeout(() => milestonesRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
                          return next;
                        })}
                        className="flex items-center gap-2 px-5 py-3 bg-white text-primary rounded-2xl font-black text-[11px] uppercase tracking-wider hover:shadow-lg transition-all"
                      >
                        <Trophy size={16} /> {showMilestones ? "Hide" : "Track"} Progress
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {total > 0 && (
                    <div className="relative mt-8 pt-6 border-t border-white/20">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] font-black opacity-80">Overall Progress</span>
                        <span className="font-black text-xl">{progressPct}%</span>
                      </div>
                      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-1000"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-[11px] opacity-70 mt-2 font-medium">{completed} of {total} milestones completed</p>
                    </div>
                  )}
                </div>

                {/* ─ Two-column layout: Phases + Skills ─ */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">

                  {/* LEFT: Roadmap Phases Timeline */}
                  <div className="xl:col-span-3 space-y-10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Rocket size={24} className="text-primary" /> Learning Phases
                      </h3>
                      <button 
                        onClick={handleDownloadRoadmap} 
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Export PDF
                      </button>
                    </div>

                    <div className="p-8 bg-slate-50/50 border-2 border-slate-200 rounded-[3rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                      <div className="relative z-10 pl-6 border-l-2 border-slate-200 space-y-6">
                        {currentRoadmapPhases.map((phase, idx) => (
                          <RoadmapPhaseCard
                            key={idx}
                            phase={phase}
                            index={idx}
                            isActive={activePhaseIndex === idx}
                            onClick={setActivePhaseIndex}
                            totalPhases={currentRoadmapPhases.length}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    {currentRoleData?.resources?.length > 0 && (
                      <div className="p-8 bg-white border-2 border-slate-200 rounded-[3rem] shadow-sm">
                        <h4 className="font-black mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
                          <BookOpen size={16} /> Curated Learning Resources
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentRoleData.resources.map((res, i) => (
                            <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-[2rem] hover:bg-white hover:border-primary/30 transition-all group shadow-sm hover:shadow-md">
                              <div>
                                <p className="font-black text-sm text-slate-900 mb-1">{res.title}</p>
                                <span className="text-[10px] font-black text-primary uppercase tracking-wider">{res.type}</span>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                <ExternalLink size={14} />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Skills Panel */}
                  <div className="xl:col-span-2 space-y-8">
                    <div className="p-8 bg-white border-2 border-slate-200 rounded-[3rem] shadow-sm">
                      <div className="mb-8">
                        <h3 className="text-2xl font-black tracking-tight mb-2">Technical Arsenal</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                           <Target size={14} className="text-primary" /> Skill Map for {selectedRole}
                        </p>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex gap-2 mb-8 p-1 bg-slate-50 border border-slate-200 rounded-2xl w-fit">
                        {[
                          { val: "all", label: "All" },
                          { val: "to-learn", label: "To Learn" },
                          { val: "mastered", label: "✓ Mastered" },
                        ].map(f => (
                          <button
                            key={f.val}
                            onClick={() => setSkillFilter(f.val)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm transition-all ${skillFilter === f.val ? "bg-white text-primary border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {/* Skills grid */}
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scroll mb-8">
                        {(currentRoleData?.skills || [])
                          .filter(skill => {
                            const name = (typeof skill === "string" ? skill : skill.name).toLowerCase();
                            const mastered = userSkills.includes(name);
                            if (skillFilter === "mastered") return mastered;
                            if (skillFilter === "to-learn") return !mastered;
                            return true;
                          })
                          .map((skill, i) => {
                            const name = (typeof skill === "string" ? skill : skill.name).toLowerCase();
                            const isMastered = userSkills.includes(name);
                            return (
                              <SkillBadge key={i} skill={skill} isMastered={isMastered} />
                            );
                          })}
                      </div>

                      {/* Skill summary */}
                      <div className="p-6 bg-slate-900 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-teal-500/20 transition-colors"></div>
                        <div className="relative z-10">
                           <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.2em] mb-6">Gap Analysis Engine</p>
                           <div className="space-y-5">
                             {[
                               { label: "Mastered", count: (currentRoleData?.skills || []).filter(s => userSkills.includes(s.name.toLowerCase())).length, color: "bg-teal-400" },
                               { label: "Target", count: (currentRoleData?.skills || []).filter(s => !userSkills.includes(s.name.toLowerCase())).length, color: "bg-white" },
                             ].map((item, i) => {
                               const total = currentRoleData?.skills?.length || 1;
                               return (
                                 <div key={i}>
                                   <div className="flex justify-between items-center mb-2">
                                     <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{item.label}</span>
                                     <span className="text-sm font-black text-white">{item.count}/{total}</span>
                                   </div>
                                   <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                     <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(45,212,191,0.3)]`} style={{ width: `${(item.count / total) * 100}%` }} />
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                           <p className="text-[10px] text-white/40 mt-8 font-bold leading-relaxed">
                             Optimize your map by adding new skills in your profile dashboard.
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─ Milestone Progress Tracker ─ */}
                <div ref={milestonesRef} />
                {showMilestones && (
                  <div className="animate-in slide-in-from-bottom-8 duration-500 bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight mb-1">Progress Tracker</h3>
                        <p className="text-muted-foreground text-sm">Mark milestones as complete. Your data auto-saves to the cloud.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completed</p>
                          <p className="text-2xl font-black text-primary">{completed}<span className="text-muted-foreground text-base font-bold">/{total}</span></p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <Award size={28} />
                        </div>
                      </div>
                    </div>

                    {roadmapData.length > 0 ? (
                      <div className="space-y-3">
                        {roadmapData.map((milestone, i) => (
                          <MilestoneRow
                            key={milestone.id || i}
                            milestone={milestone}
                            onToggle={handleToggleMilestone}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-14 text-center bg-muted/20 border border-dashed border-border rounded-3xl">
                        <p className="font-black text-foreground mb-2">No milestones yet.</p>
                        <p className="text-sm text-muted-foreground">Click "Generate My Roadmap" above to create personalized milestones.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            HIGHER STUDIES PATH
        ════════════════════════════════════════════════════════════ */}
        {selectedPath === "higher_studies" && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary text-white text-sm font-black flex items-center justify-center">2</span>
                Choose Your Study Track
              </h2>
              <p className="text-muted-foreground text-sm mb-7 ml-11">Select the type of higher education you're pursuing.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {Object.keys(HIGHER_STUDY_TRACKS).map(track => {
                  const isSelected = selectedHigherStudy === track;
                  const icons = { "GATE & MTech": "🎓", "MS Abroad (US/Europe)": "✈️", "PhD / Research": "🔬" };
                  return (
                    <button
                      key={track}
                      onClick={() => { setSelectedHigherStudy(track); setRoadmapGenerated(false); }}
                      className={`text-left p-6 rounded-3xl border-2 transition-all ${isSelected ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card hover:border-primary/40 hover:shadow-md"}`}
                    >
                      <span className="text-3xl mb-3 block">{icons[track]}</span>
                      <h3 className="font-black text-base mb-1">{track}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{HIGHER_STUDY_TRACKS[track].phases.length} phases</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferences for Higher Studies */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gradient-to-r from-card to-muted/30 border border-border rounded-3xl p-6">
              <div>
                <p className="font-black text-foreground">Generate your {selectedHigherStudy} roadmap</p>
                <p className="text-sm text-muted-foreground">Get a phase-wise plan with skills, resources, and timeline.</p>
              </div>
              <button
                onClick={handleGenerateRoadmap}
                disabled={isGenerating}
                className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-sm uppercase tracking-wider rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-60"
              >
                {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating…</> : <><Sparkles size={18} /> Generate Roadmap</>}
              </button>
            </div>

            {roadmapGenerated && (() => {
              const track = HIGHER_STUDY_TRACKS[selectedHigherStudy];
              return (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
                  {/* Banner */}
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-10 text-white shadow-2xl">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-64 h-64 rounded-full bg-white blur-3xl animate-pulse" />
                    </div>
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <GraduationCap size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Strategic Academic Blueprint</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{selectedHigherStudy}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                    {/* LEFT: Study Plan */}
                    <div className="xl:col-span-3 space-y-10">
                      <div className="flex items-center justify-between">
                         <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                           <BookOpen size={24} className="text-primary" /> Core Study Plan
                         </h3>
                      </div>
                      
                      <div className="p-8 bg-slate-50/50 border-2 border-slate-200 rounded-[3rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 pl-6 border-l-2 border-slate-200 space-y-6">
                          {track.phases.map((phase, idx) => (
                            <RoadmapPhaseCard
                              key={idx}
                              phase={phase}
                              index={idx}
                              isActive={activePhaseIndex === idx}
                              onClick={setActivePhaseIndex}
                              totalPhases={track.phases.length}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Progress tracker */}
                      {total > 0 && (
                        <div className="p-10 bg-white border-2 border-slate-200 rounded-[3rem] text-center shadow-sm">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Milestone Accuracy</p>
                          <p className="text-3xl font-black text-slate-900 mb-2">{completed} / {total}</p>
                          <p className="text-xs text-slate-400 font-bold mb-8">{progressPct}% of study tracks completed</p>
                          <button
                            onClick={() => setShowMilestones(p => {
                               const next = !p;
                               if(next) setTimeout(() => milestonesRef.current?.scrollIntoView({ behavior: 'smooth'}), 100);
                               return next;
                            })}
                            className="px-8 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary transition-all shadow-xl"
                          >
                            {showMilestones ? "Minimize" : "Expand"} Progress Tracker
                          </button>
                        </div>
                      )}
                    </div>

                    {/* RIGHT: Academic Arsenal */}
                    <div className="xl:col-span-2 space-y-8">
                       <div className="p-8 bg-white border-2 border-slate-200 rounded-[3rem] shadow-sm">
                        <div className="mb-8">
                          <h3 className="text-2xl font-black tracking-tight mb-2">Specialization Skills</h3>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Competencies</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-10">
                          {track.skills.map((s, i) => (
                            <span key={i} className="px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-[11px] font-black shadow-sm">
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Resources */}
                        <div className="mb-8">
                           <h4 className="font-black text-[10px] mb-4 flex items-center gap-2 uppercase tracking-widest text-primary">
                             <BookOpen size={14} /> Curated Study Guides
                           </h4>
                           <div className="space-y-2">
                             {track.resources.map((r, i) => (
                               <div key={i} className="flex items-center gap-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                 <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-primary border border-slate-200 shadow-sm">
                                   <BookOpen size={14} />
                                 </div>
                                 <span className="text-sm font-black text-slate-800">{r}</span>
                               </div>
                             ))}
                           </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-6 bg-slate-900 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                          <h4 className="font-black text-[10px] mb-4 flex items-center gap-2 uppercase tracking-widest text-teal-400">
                             <Calendar size={14} /> Strategic Calendar
                          </h4>
                          <div className="space-y-3 text-[11px] text-white/70 font-bold leading-relaxed">
                            {selectedHigherStudy === "GATE & MTech" && <>
                               <div className="flex justify-between items-center pb-2 border-b border-white/5"><span>Registration</span><span className="text-white">September</span></div>
                               <div className="flex justify-between items-center pb-2 border-b border-white/5"><span>National Exam</span><span className="text-white">February</span></div>
                               <div className="flex justify-between items-center"><span>IIT Admissions</span><span className="text-white">April–May</span></div>
                            </>}
                            {selectedHigherStudy === "MS Abroad (US/Europe)" && <>
                               <div className="flex justify-between items-center pb-2 border-b border-white/5"><span>GRE/TOEFL Cycle</span><span className="text-white">Jun–Aug</span></div>
                               <div className="flex justify-between items-center pb-2 border-b border-white/5"><span>Main Applications</span><span className="text-white">Oct–Dec</span></div>
                               <div className="flex justify-between items-center"><span>Offer Letters</span><span className="text-white">Feb–Apr</span></div>
                            </>}
                            {selectedHigherStudy === "PhD / Research" && <>
                               <div className="flex justify-between items-center pb-2 border-b border-white/5"><span>Applications</span><span className="text-white">Rolling</span></div>
                               <div className="flex justify-between items-center"><span>Research Proposal</span><span className="text-white">6 Months Out</span></div>
                            </>}
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadRoadmap}
                          className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] hover:bg-slate-900 transition-all shadow-xl shadow-primary/20"
                        >
                          <Download size={16} /> Export Blueprint
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Milestone View */}
                  <div ref={milestonesRef} />
                  {showMilestones && roadmapData.length > 0 && (
                    <div className="animate-in slide-in-from-bottom-8 duration-500 bg-white border-2 border-slate-200 rounded-[3rem] p-8 md:p-12 shadow-2xl">
                       <div className="flex items-center justify-between mb-10">
                         <h3 className="text-2xl font-black">Milestone Control</h3>
                         <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                            <Trophy size={24} />
                         </div>
                       </div>
                       <div className="space-y-4">
                         {roadmapData.map((m, i) => (
                           <MilestoneRow key={m.id || i} milestone={m} onToggle={handleToggleMilestone} />
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            EXPLORING PATH
        ════════════════════════════════════════════════════════════ */}
        {selectedPath === "exploring" && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary text-white text-sm font-black flex items-center justify-center">2</span>
                What Interests You?
              </h2>
              <p className="text-muted-foreground text-sm mb-7 ml-11">Select an area to explore — we'll show you the roles and skills involved.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {EXPLORE_INTERESTS.map(interest => {
                  const isSelected = exploreInterest === interest.id;
                  return (
                    <button
                      key={interest.id}
                      onClick={() => setExploreInterest(interest.id)}
                      className={`text-left p-7 rounded-3xl border-2 transition-all group ${isSelected ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"}`}
                    >
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/10 group-hover:scale-110 transition-transform">
                        <interest.icon size={24} />
                      </div>
                      <h3 className="font-black text-base mb-1">{interest.label}</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {interest.roles.length > 0 ? interest.roles.join(", ") : "Academia & Research paths"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Show roles for selected interest */}
            {exploreInterest && (() => {
              const interest = EXPLORE_INTERESTS.find(i => i.id === exploreInterest);
              const relatedRoles = interest?.roles || [];
              return (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-8">
                  {relatedRoles.length > 0 ? (
                    <>
                      <h3 className="text-xl font-black">Roles in {interest?.label}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {relatedRoles.map(role => {
                          const rd = ROLE_DATA[role];
                          if (!rd) return null;
                          return (
                            <div key={role} className={`p-6 rounded-3xl border border-border bg-gradient-to-br ${rd.color} hover:shadow-xl transition-all group`}>
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center" style={{ color: rd.accent }}>
                                  <rd.icon size={24} />
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Salary</p>
                                  <p className="font-black text-foreground text-sm">{rd.avgSalary}</p>
                                </div>
                              </div>
                              <h4 className="font-black text-lg mb-1">{role}</h4>
                              <p className="text-sm text-muted-foreground mb-4">{rd.description}</p>
                              <div className="flex flex-wrap gap-1.5 mb-5">
                                {rd.skills.slice(0, 4).map((s, i) => (
                                  <span key={i} className="px-2.5 py-1 bg-white/60 rounded-full text-[10px] font-bold">{s.name}</span>
                                ))}
                                {rd.skills.length > 4 && (
                                  <span className="px-2.5 py-1 bg-white/60 rounded-full text-[10px] font-bold">+{rd.skills.length - 4} more</span>
                                )}
                              </div>
                              <button
                                onClick={() => { setSelectedPath("industry"); handleRoleChange(role); setTimeout(() => roadmapRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-primary text-white hover:bg-primary/80 transition-all"
                              >
                                Start This Roadmap <ArrowRight size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 bg-card border border-border rounded-3xl">
                      <h3 className="font-black text-xl mb-3">Research & Academia Path</h3>
                      <p className="text-muted-foreground text-sm mb-5">Interested in research? Consider switching to the Higher Studies path for a dedicated preparation roadmap.</p>
                      <button
                        onClick={() => handlePathSelect("higher_studies")}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm hover:scale-105 transition-all"
                      >
                        Explore Higher Studies <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Explore all roles */}
                  <div className="p-8 bg-card border border-border rounded-3xl">
                    <h3 className="font-black text-lg mb-2 flex items-center gap-2"><Compass size={18} className="text-primary" /> Browse All Roles</h3>
                    <p className="text-muted-foreground text-sm mb-5">See skills required for any role before committing.</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {roles.map(role => (
                        <button
                          key={role}
                          onClick={() => { handleRoleChange(role); }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${selectedRole === role ? "bg-primary text-white border-primary" : "bg-muted/50 border-border text-muted-foreground hover:border-primary/40"}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    {selectedRole && currentRoleData?.skills?.length > 0 && (
                      <div className="pt-6 border-t border-border space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-foreground">Skills for <span className="text-primary">{selectedRole}</span></p>
                          <button
                            onClick={() => { setSelectedPath("industry"); setTimeout(() => roadmapRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all"
                          >
                            Full Roadmap <ArrowRight size={10} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentRoleData.skills.slice(0, 6).map((skill, i) => {
                            const isMastered = userSkills.includes(skill.name.toLowerCase());
                            return (
                              <SkillBadge key={i} skill={skill} isMastered={isMastered} />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Career Tips Footer ───────────────────────────────────── */}
        <div className="pt-20 mt-20 border-t border-border">
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight mb-2">Tips for Career Success</h2>
            <p className="text-muted-foreground text-sm">Simple habits that compound into massive results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIPS.map((tip, i) => (
              <div key={i} className={`p-7 bg-gradient-to-br ${tip.color} border ${tip.border} rounded-[2.5rem] hover:shadow-xl hover:-translate-y-1 transition-all group`}>
                <div className={`w-12 h-12 ${tip.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <tip.icon size={22} />
                </div>
                <h4 className="font-black mb-2 text-foreground">{tip.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
