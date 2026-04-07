-- MapOut Global Seed Data
-- =========================================================
-- Execute this script directly in your PostgreSQL / Supabase SQL Editor
-- This strictly seeds the GLOBAL required data (Projects, Skills, Roadmaps).
-- NO USER DATA is touched or modified by this script.
-- =========================================================

-- =========================================================
-- TABLE A: skill_catalog  (GLOBAL — pre-seeded, no user_id)
-- This is the master dictionary of all available skills on the platform.
-- Users pick FROM this catalog to populate their own skills table.
-- Run this DDL first if the table doesn't exist yet in Supabase.
-- =========================================================
CREATE TABLE IF NOT EXISTS skill_catalog (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL
);

-- 1. SEED: skill_catalog (53 globally available skills — no user_id needed)
INSERT INTO skill_catalog (name, category) VALUES
-- Languages
('Python', 'Languages'), ('JavaScript', 'Languages'), ('TypeScript', 'Languages'),
('C++', 'Languages'), ('Go', 'Languages'), ('Rust', 'Languages'),
('Java', 'Languages'), ('C#', 'Languages'), ('Swift', 'Languages'), ('Kotlin', 'Languages'),

-- Frontend
('React', 'Frontend'), ('Next.js', 'Frontend'), ('Vue.js', 'Frontend'),
('Angular', 'Frontend'), ('Svelte', 'Frontend'), ('Tailwind CSS', 'Frontend'),
('Redux', 'Frontend'), ('Framer Motion', 'Frontend'),

-- Backend
('Node.js', 'Backend'), ('Express.js', 'Backend'), ('Django', 'Backend'),
('FastAPI', 'Backend'), ('Spring Boot', 'Backend'), ('Ruby on Rails', 'Backend'),
('NestJS', 'Backend'), ('GraphQL', 'Backend'),

-- Database
('PostgreSQL', 'Database'), ('MongoDB', 'Database'), ('Redis', 'Database'),
('MySQL', 'Database'), ('Cassandra', 'Database'), ('Elasticsearch', 'Database'),
('Prisma ORM', 'Database'), ('Supabase', 'Database'),

-- DevOps & Cloud
('Docker', 'DevOps'), ('Kubernetes', 'DevOps'), ('AWS (EC2/S3)', 'DevOps'),
('Google Cloud Platform', 'DevOps'), ('Terraform', 'DevOps'), ('GitHub Actions', 'DevOps'),
('Nginx', 'DevOps'), ('Linux System Admin', 'DevOps'),

-- AI & Data Science
('TensorFlow', 'AI/ML'), ('PyTorch', 'AI/ML'), ('Pandas', 'Data Science'),
('Scikit-Learn', 'Data Science'), ('OpenAI API', 'AI/ML'),

-- Core Concepts
('System Design', 'Core Concepts'), ('Data Structures & Algorithms', 'Core Concepts'),
('Microservices Architecture', 'Core Concepts'), ('RESTful API Design', 'Core Concepts'),
('Agile/Scrum Management', 'Core Concepts'), ('Test-Driven Development', 'Core Concepts')
ON CONFLICT (name) DO NOTHING;


-- =========================================================
-- TABLE B: skills  (USER-SPECIFIC — populated at runtime)
-- Schema: id, user_id, skill_name, level, created_at
-- This table is NOT pre-seeded here. It is populated dynamically
-- when a user adds a skill from their dashboard/profile.
-- The frontend (api.js) inserts into this table via:
--   supabase.from('skills').insert({ user_id, skill_name, level })
-- =========================================================
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL, -- Links to Supabase auth.users or your custom users table
  skill_name VARCHAR(255) NOT NULL,
  level VARCHAR(50) DEFAULT 'Beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- NO INSERT needed — this table fills automatically per user action.


-- 2. SEED: PROJECTS (30 High-Quality Professional Projects)
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO projects (title, description, is_recommended) VALUES
('AI-Powered Financial Analyzer', 'Architect a Python backend ingesting large CSV aggregates using Pandas, wrapped with a React frontend that utilizes Recharts to map localized financial trends.', true),
('Full-Stack Issue Tracker', 'A resilient product tracker built with Next.js, Node, and PostgreSQL. Implement real-time WebSocket syncing for ticket updates and drag-n-drop Kanban boards.', true),
('Distributed Cache System', 'Construct an in-memory key-value data store mimicking Redis in Go or C++. Implement LRU cache eviction algorithms and heavy concurrency models utilizing Mutex locks.', true),
('Decentralized Voting Application', 'Deploy smart contracts via Solidity onto an Ethereum testnet mapping cryptographic voting logs. Link a React frontend utilizing Ethers.js to read states.', false),
('E-Commerce Recommendation Engine', 'Build a microservice mapping user shopping patterns through a Collaborative Filtering ML algorithm, deploying results globally via a FastAPI endpoint.', true),
('Serverless Authentication Service', 'Develop an isolated authentication service deployed purely on AWS Lambda functions utilizing JWTs, Bcrypt password hashing, and API Gateways.', false),
('Real-Time Video Conferencing App', 'Utilize WebRTC and Socket.io to establish peer-to-peer visual mapping bridges. Include a signaling server designed in Express.js.', true),
('Automated Testing Framework', 'Develop an open-source testing toolkit in Python acting similarly to PyTest, capable of recursively crawling directories executing modular test maps.', false),
('Cryptocurrency Portfolio Dashboard', 'A Next.js dashboard wrapping continuous polling from Binance APIs. Render tactile glassmorphism elements mapping real-time profit margins.', true),
('High-Frequency Trading Bot', 'An algorithmic bot constructed in Rust or C++. Monitor exchange order books natively and execute trades mathematically beneath standard temporal thresholds.', false),
('Cloud-Based PDF Generator', 'Establish an Express instance receiving massive JSON maps, piping streams through Puppeteer, and dropping processed documents cleanly into an S3 bucket.', true),
('Global Chat Application', 'A WhatsApp clone mapping data continuously through Cassandra (for heavy write loads) and Node.js. Provide absolute end-to-end encryption mechanics.', true),
('Self-Driving Car Simulation', 'Use Python alongside standard Pygame/OpenCV instances to map physical environments and utilize a genetic algorithm teaching an agent successful track routing.', false),
('Social Media API Infrastructure', 'Strictly a backend project building rate-limited Graph API structures mimicking Twitter. Use PostgreSQL to handle complex relationship mapping between users.', true),
('Web Crawler and Indexer', 'A localized search engine built in Go. Crawl domain architectures asynchronously and map semantic relationships via inverted indices mapped to Elasticsearch.', true),
('Hospital Patient Management System', 'Develop a Java Spring Boot enterprise architecture handling sensitive patient mappings. Utilize strict Role-Based Access Control limits mapped globally.', false),
('Cross-Platform Fitness Tracker', 'Map local device sensors via React Native and pipe progress logs continuously to a minimal Firebase database structure.', true),
('Code Snippet Repository', 'A highly accessible React application mapping text fragments. Implement syntax highlighting natively alongside a MongoDB layer for fluid text indexing.', false),
('Interactive Pathfinding Visualizer', 'A purely visual DOM project utilizing complex graph algorithms (Dijkstra, A*) mapped visually executing at specific interval framerates.', true),
('Micro-Blogging Platform CMS', 'A minimal content management system specifically orchestrating multi-tenant database clusters allowing thousands of users to map subdomains securely.', false),
('Stock Prediction Transformer', 'Deploy a foundational PyTorch model mapping temporal stock arrays mapping heavy analytical predictions across upcoming market weeks.', true),
('Terminal-Based Text Editor', 'Write a minimal POSIX-compliant text editor specifically entirely in C mimicking Vim functionality and handling kernel-level key bindings safely.', false),
('Job Board Application', 'A Next.js front linked to Prisma ORM. Map complex queries filtering geospatial jobs visually onto an interactive mapping element.', true),
('Personal Cloud Storage Wrapper', 'Establish an internal drop-box mapping local network chunks. Use WebSockets alongside heavy Docker orchestration to virtualize user drives natively.', false),
('IoT Temperature Monitor', 'Deploy C headers onto an Arduino/Raspberry Pi mapping thermal reads directly to a sleek web dashboard utilizing lightweight MQTT protocols.', true),
('Blockchain Block Explorer', 'A heavy front-end project scraping network layers utilizing an RPC interface to dynamically map active block generations visually for users.', false),
('Restaurant Reservation Ecosystem', 'A PostgreSQL instance handling strict transactional isolation limits (ACID) assuring concurrent booking locks do not inherently collide randomly.', true),
('Custom Linux Shell', 'A localized bash implementation written strictly in C. Manage native system calls mapping parent-child process handling and local memory piping layers.', false),
('Expense Tracking Progressive Web App', 'An offline-capable Vue.js application dynamically caching native service workers. Sync local writes efficiently when the device establishes global connections.', true),
('Static Site Generator', 'A lightweight Node.js engine ingesting massive markdown directories compiling and piping static absolute HTML instances completely devoid of backend requirements.', false);


-- 3. SEED: ROADMAP PHASES
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


-- 4. SEED: ROADMAP MILESTONES
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id SERIAL PRIMARY KEY,
  roadmap_phase_id INTEGER REFERENCES roadmap_phases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL
);

INSERT INTO roadmap_milestones (roadmap_phase_id, title) VALUES
-- Year 1
(1, 'Master Core Programming Syntax (C++, Java, or Python)'),
(1, 'Understand Big-O Notation & Time/Space Complexities'),
(1, 'Map Base Algorithms (Sorting, Searching, Pointers)'),
(1, 'Master Foundational Data Structures (Arrays, Hash Maps, Trees)'),

-- Year 2
(2, 'Transition purely to Object-Oriented Architectures'),
(2, 'Execute Version Control logic smoothly via Git/GitHub'),
(2, 'Architect functional databases utilizing SQL protocols'),
(2, 'Build your first HTTP REST API handling concurrent loads'),

-- Year 3
(3, 'Integrate Cloud infrastructures (AWS/Google Cloud Platforms)'),
(3, 'Contribute safely to 2 Open Source framework layers'),
(3, 'Finalize mapping out a heavy multi-container Docker cluster'),
(3, 'Lock-in an intensive corporate Intern position natively'),

-- Year 4
(4, 'Complete absolute System Design mapping simulations'),
(4, 'Finalize 3 highly-technical, scale-grade personal projects'),
(4, 'Execute continuous behavioral mock-interview systems'),
(4, 'Complete formal ATS Resume synchronization passes');

-- Reset sequences out of an abundance of caution
SELECT setval('roadmap_phases_id_seq', (SELECT MAX(id) FROM roadmap_phases));
