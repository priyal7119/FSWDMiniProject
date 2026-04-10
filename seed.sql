-- MapOut Global Seed Data
-- =========================================================
-- Execute this script directly in your PostgreSQL / Supabase SQL Editor
-- This strictly seeds the GLOBAL required data (Projects, Skills, Roadmaps).
-- NO USER DATA is touched or modified by this script.
-- =========================================================

-- =========================================================
-- TABLE: profiles refinement (If not exists)
-- =========================================================
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS drive_url TEXT,
ADD COLUMN IF NOT EXISTS resume_score INTEGER DEFAULT 75,
ADD COLUMN IF NOT EXISTS interviews_prepped INTEGER DEFAULT 0;

-- =========================================================
-- TABLE A: skill_catalog  (GLOBAL)
-- =========================================================
CREATE TABLE IF NOT EXISTS skill_catalog (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL
);

INSERT INTO skill_catalog (name, category) VALUES
('Python', 'Languages'), ('JavaScript', 'Languages'), ('TypeScript', 'Languages'),
('C++', 'Languages'), ('Go', 'Languages'), ('Rust', 'Languages'),
('Java', 'Languages'), ('C#', 'Languages'), ('Swift', 'Languages'), ('Kotlin', 'Languages'),
('React', 'Frontend'), ('Next.js', 'Frontend'), ('Vue.js', 'Frontend'),
('Angular', 'Frontend'), ('Svelte', 'Frontend'), ('Tailwind CSS', 'Frontend'),
('Redux', 'Frontend'), ('Framer Motion', 'Frontend'),
('Node.js', 'Backend'), ('Express.js', 'Backend'), ('Django', 'Backend'),
('FastAPI', 'Backend'), ('Spring Boot', 'Backend'), ('Ruby on Rails', 'Backend'),
('NestJS', 'Backend'), ('GraphQL', 'Backend'),
('PostgreSQL', 'Database'), ('MongoDB', 'Database'), ('Redis', 'Database'),
('MySQL', 'Database'), ('Cassandra', 'Database'), ('Elasticsearch', 'Database'),
('Prisma ORM', 'Database'), ('Supabase', 'Database'),
('Docker', 'DevOps'), ('Kubernetes', 'DevOps'), ('AWS (EC2/S3)', 'DevOps'),
('Google Cloud Platform', 'DevOps'), ('Terraform', 'DevOps'), ('GitHub Actions', 'DevOps'),
('Nginx', 'DevOps'), ('Linux System Admin', 'DevOps'),
('TensorFlow', 'AI/ML'), ('PyTorch', 'AI/ML'), ('Pandas', 'Data Science'),
('Scikit-Learn', 'Data Science'), ('OpenAI API', 'AI/ML'),
('System Design', 'Core Concepts'), ('Data Structures & Algorithms', 'Core Concepts'),
('Microservices Architecture', 'Core Concepts'), ('RESTful API Design', 'Core Concepts'),
('Agile/Scrum Management', 'Core Concepts'), ('Test-Driven Development', 'Core Concepts')
ON CONFLICT (name) DO NOTHING;

-- =========================================================
-- TABLE B: projects (Refined for tailoring)
-- =========================================================
DROP TABLE IF EXISTS projects CASCADE;
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  skills TEXT[] DEFAULT '{}',
  difficulty VARCHAR(50) DEFAULT 'Intermediate',
  technology VARCHAR(100) DEFAULT 'Full Stack',
  domain VARCHAR(100) DEFAULT 'Web Development',
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO projects (title, description, skills, difficulty, technology, domain, is_recommended) VALUES
('AI-Powered Financial Analyzer', 'Architect a Python backend ingesting large CSV aggregates using Pandas, wrapped with a React frontend that utilizes Recharts to map localized financial trends.', '{"Python", "Pandas", "React", "Recharts"}', 'Advanced', 'Python', 'AI/ML', true),
('Full-Stack Issue Tracker', 'A resilient product tracker built with Next.js, Node, and PostgreSQL. Implement real-time WebSocket syncing for ticket updates and drag-n-drop Kanban boards.', '{"Next.js", "Node.js", "PostgreSQL", "WebSockets"}', 'Intermediate', 'Full Stack', 'Web Development', true),
('Distributed Cache System', 'Construct an in-memory key-value data store mimicking Redis in Go or C++. Implement LRU cache eviction algorithms and heavy concurrency models utilizing Mutex locks.', '{"Go", "C++", "System Design"}', 'Advanced', 'Backend', 'System Engineering', true),
('Decentralized Voting App', 'Deploy smart contracts via Solidity onto an Ethereum testnet mapping cryptographic voting logs. Link a React frontend utilizing Ethers.js to read states.', '{"Solidity", "React", "Ethers.js"}', 'Advanced', 'Full Stack', 'Blockchain', false),
('E-Commerce Recommendation Engine', 'Build a microservice mapping user shopping patterns through a Collaborative Filtering ML algorithm, deploying results globally via a FastAPI endpoint.', '{"Python", "FastAPI", "Scikit-Learn"}', 'Intermediate', 'AI/ML', 'E-Commerce', true),
('Interactive Canvas Application', 'Develop an advanced browser-based drawing application using pure mathematics and matrix transforms.', '{"React", "HTML5 Canvas", "Framer Motion"}', 'Advanced', 'Frontend', 'Web Development', true),
('Microservices Architecture', 'Architect a resilient system using clustered stateless containers connected via RabbitMQ.', '{"Node.js", "Docker", "Kubernetes", "RabbitMQ"}', 'Advanced', 'Backend', 'Web Development', true),
('Real-Time WebSocket Dashboard', 'Create a live monitoring system that renders streaming data utilizing bidirectional WebSockets.', '{"React", "Socket.IO", "Chart.js"}', 'Intermediate', 'Frontend', 'Web Development', true),
('Predictive Analytics Engine', 'Design an algorithmic pipeline that forecasts trends based on multi-variate continuous time-series data.', '{"Python", "TensorFlow", "Pandas"}', 'Advanced', 'Python', 'AI/ML', true),
('NLP Sentiment Analyzer', 'Create a natural language processing model that scores live customer feedback streams.', '{"PyTorch", "NLTK", "Scikit-Learn"}', 'Intermediate', 'Python', 'AI/ML', true),
('RESTful Authentication API', 'Develop a high-security user authentication API featuring cryptographic hashing and token issuance.', '{"Express", "JWT", "PostgreSQL"}', 'Intermediate', 'Backend', 'Web Development', true),
('Hybrid Mobile Social App', 'Implement a hybrid mobile framework that targets iOS and Android simultaneously with real-time sync.', '{"React Native", "Firebase", "Zustand"}', 'Advanced', 'Mobile', 'Mobile Development', true);

-- =========================================================
-- TABLE C: interview_questions
-- =========================================================
CREATE TABLE IF NOT EXISTS interview_questions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'Technical', -- Technical, Behavioral, Project
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

INSERT INTO interview_questions (role, category, question, answer) VALUES
('Frontend Developer', 'Technical', 'What is the Virtual DOM?', 'The Virtual DOM is a lightweight copy of the real DOM. React uses it to batch updates by diffing and reconciliation.'),
('Frontend Developer', 'Technical', 'Cookies vs LocalStorage?', 'Cookies are small (4KB) and sent with requests. LocalStorage is larger (5MB) and persistent on the client.'),
('Backend Developer', 'Technical', 'REST vs GraphQL?', 'REST uses multiple fixed endpoints. GraphQL uses a single endpoint for flexible data fetching.'),
('Backend Developer', 'Technical', 'Horizontal vs Vertical Scaling?', 'Vertical: Adding power to one server. Horizontal: Adding more servers to a load balancer.'),
('Data Scientist', 'Technical', 'Supervised vs Unsupervised?', 'Supervised uses labeled data for training. Unsupervised finds patterns in unlabeled data.'),
('Full Stack Developer', 'Project', 'Walk me through your most complex project.', 'Use the STAR method to explain: (1) Problem, (2) Architectural choices, (3) Your contributions, (4) Impact.'),
('Frontend Developer', 'Behavioral', 'How do you handle scope creep?', 'Communicate with PMs early, evaluate technical trade-offs, and focus on the MVP.'),
('AI/ML Engineer', 'Technical', 'What is Gradient Descent?', 'An optimization algorithm to minimize cost functions by moving towards the steepest descent of the gradient.');

-- =========================================================
-- TABLE D: roadmap_phases & milestones
-- =========================================================
CREATE TABLE IF NOT EXISTS roadmap_phases (
  id SERIAL PRIMARY KEY,
  year VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL
);

INSERT INTO roadmap_phases (id, year, title) VALUES
(1, 'Year 1', 'The Core Foundation (Logic & Algorithms)'),
(2, 'Year 2', 'Engineering Architectures & Tooling'),
(3, 'Year 3', 'Domain Specialization & Networks'),
(4, 'Year 4', 'Professional Launch Operations')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id SERIAL PRIMARY KEY,
  roadmap_phase_id INTEGER REFERENCES roadmap_phases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL
);

INSERT INTO roadmap_milestones (roadmap_phase_id, title) VALUES
(1, 'Master Core Programming Syntax (C++, Java, or Python)'),
(1, 'Understand Big-O Notation & Time/Space Complexities'),
(1, 'Map Base Algorithms (Sorting, Searching, Pointers)'),
(1, 'Master Foundational Data Structures (Arrays, Hash Maps, Trees)'),
(2, 'Transition purely to Object-Oriented Architectures'),
(2, 'Execute Version Control logic smoothly via Git/GitHub'),
(2, 'Architect functional databases utilizing SQL protocols'),
(2, 'Build your first HTTP REST API handling concurrent loads'),
(3, 'Integrate Cloud infrastructures (AWS/Google Cloud Platforms)'),
(3, 'Contribute safely to 2 Open Source framework layers'),
(3, 'Finalize mapping out a heavy multi-container Docker cluster'),
(3, 'Lock-in an intensive corporate Intern position natively'),
(4, 'Complete absolute System Design mapping simulations'),
(4, 'Finalize 3 highly-technical, scale-grade personal projects'),
(4, 'Execute continuous behavioral mock-interview systems'),
(4, 'Complete formal ATS Resume synchronization passes');

-- =========================================================
-- TABLE E: role_requirements (For Career Planner Skill Gaps)
-- =========================================================
CREATE TABLE IF NOT EXISTS role_requirements (
  id SERIAL PRIMARY KEY,
  role VARCHAR(100) NOT NULL,
  required_skills TEXT[] NOT NULL
);

INSERT INTO role_requirements (role, required_skills) VALUES
('Frontend Developer', '{"React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"}'),
('Backend Developer', '{"Node.js", "PostgreSQL", "Redis", "Docker", "GraphQL"}'),
('Full Stack Developer', '{"React", "Node.js", "Supabase", "System Design", "AWS"}'),
('Data Scientist', '{"Python", "Pandas", "Scikit-Learn", "SQL", "Statistics"}'),
('AI/ML Engineer', '{"PyTorch", "TensorFlow", "MLOps", "Math", "Python"}');

-- =========================================================
-- TABLE F: research_guide
-- =========================================================
CREATE TABLE IF NOT EXISTS research_guide (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  content TEXT[] NOT NULL
);

INSERT INTO research_guide (title, icon, color, content) VALUES
('Research Idea Selection', 'Lightbulb', 'bg-[var(--mapout-mint)]', '{"Identify a problem in your field of interest", "Review existing literature", "Look for gaps or areas that need improvement", "Ensure feasibility", "Discuss with mentors"}'),
('Paper Structure', 'FileText', 'bg-[var(--mapout-accent)]', '{"Abstract: 150-250 words", "Introduction", "Literature Review", "Methodology", "Results", "Discussion", "Conclusion", "References"}'),
('IEEE Formatting', 'Layout', 'bg-[var(--mapout-pink)]', '{"Use official templates", "Margins: 0.75 inches", "Font: Times New Roman, 10pt", "Two column format", "Numbered headings", "Equations: Center-aligned", "Figures and Tables: Captioned"}');

-- Reset sequences
SELECT setval('roadmap_phases_id_seq', (SELECT MAX(id) FROM roadmap_phases));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('interview_questions_id_seq', (SELECT MAX(id) FROM interview_questions));
SELECT setval('research_guide_id_seq', (SELECT MAX(id) FROM research_guide));
