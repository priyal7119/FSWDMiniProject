-- =========================================================
-- MapOut — Complete Projects & Archive Synchronization
-- =========================================================

-- 1. Ensure projects table has all required columns
ALTER TABLE IF EXISTS projects
ADD COLUMN IF NOT EXISTS technology       VARCHAR(100) DEFAULT 'General',
ADD COLUMN IF NOT EXISTS domain           VARCHAR(100) DEFAULT 'Web Development',
ADD COLUMN IF NOT EXISTS difficulty       VARCHAR(50)  DEFAULT 'Intermediate',
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50)  DEFAULT 'Intermediate',
ADD COLUMN IF NOT EXISTS tags             TEXT[]       DEFAULT '{}',
ADD COLUMN IF NOT EXISTS link             TEXT         DEFAULT 'https://github.com';

UPDATE projects SET difficulty = 'Intermediate' WHERE difficulty IS NULL;
UPDATE projects SET technology = 'General' WHERE technology IS NULL;

INSERT INTO projects (title, description, technology, domain, difficulty, tags, link)
SELECT 'Modern E-Commerce API', 'Scalable microservices architecture for high-traffic commerce platforms.', 'Backend', 'Web Development', 'Advanced', ARRAY['Node.js', 'Redis', 'PostgreSQL', 'Docker'], 'https://github.com/example/ecommerce-api'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Modern E-Commerce API');

INSERT INTO projects (title, description, technology, domain, difficulty, tags, link)
SELECT 'AI Portfolio Builder', 'Automated portfolio generation using large language models and React.', 'Full Stack', 'AI/ML', 'Beginner', ARRAY['Next.js', 'OpenAI', 'Supabase'], 'https://github.com/example/ai-portfolio'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'AI Portfolio Builder');

INSERT INTO projects (title, description, technology, domain, difficulty, tags, link)
SELECT 'Cybersecurity Audit Tool', 'Network vulnerability scanner and security compliance reporter.', 'Backend', 'Cybersecurity', 'Advanced', ARRAY['Python', 'Scapy', 'Nmap'], 'https://github.com/example/security-tool'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Cybersecurity Audit Tool');

INSERT INTO projects (title, description, technology, domain, difficulty, tags, link)
SELECT 'React Component Library', 'Enterprise-grade UI components built with Tailwind and Framer Motion.', 'Frontend', 'Web Development', 'Beginner', ARRAY['React', 'Tailwind', 'Motion'], 'https://github.com/example/component-lib'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'React Component Library');

INSERT INTO projects (title, description, technology, domain, difficulty, tags, link)
SELECT 'Data Viz Dashboard', 'Real-time financial data visualization with advanced D3 charts.', 'Frontend', 'FinTech', 'Intermediate', ARRAY['D3.js', 'TypeScript', 'WebSockets'], 'https://github.com/example/data-viz'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Data Viz Dashboard');

-- 4. Ensure bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  type         VARCHAR(50) NOT NULL, -- 'project', 'course', 'faq', 'guide'
  resource_id  INTEGER,
  url          TEXT,
  saved_date   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. RLS Policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
CREATE POLICY "Users can create their own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);
