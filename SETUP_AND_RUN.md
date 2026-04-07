# MapOut Setup & Run Guide

## Prerequisites
- Node.js (v16+)
- PostgreSQL (or any PostgreSQL-compatible database)
- npm or yarn

## Frontend Setup

```bash
# Navigate to frontend directory
cd c:\Users\Priyal\Downloads\MapOut

# Install dependencies
npm install

# Create .env file (already exists, verify it has):
# VITE_API_BASE_URL=http://localhost:5000/api

# Start dev server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

## Backend Setup

```bash
# Navigate to backend directory
cd c:\Users\Priyal\Downloads\MapOut\backend

# Install dependencies
npm install

# Create .env file (already exists, verify it has):
# PORT=5000
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=mapout
# DB_PASSWORD=password
# DB_PORT=5432
# JWT_SECRET=your_jwt_secret_key_change_this_in_production

# Start dev server with nodemon
npm run dev
```

**Backend runs on:** `http://localhost:5000`

## Database Setup

### PostgreSQL Tables Required:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Skills
CREATE TABLE user_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  skill_id INTEGER,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100)
);

-- Resumes
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resume Sections
CREATE TABLE resume_sections (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER REFERENCES resumes(id),
  section_type VARCHAR(100),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookmarks
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  resource_id INTEGER,
  resource_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roadmap Phases
CREATE TABLE roadmap_phases (
  id SERIAL PRIMARY KEY,
  year VARCHAR(50),
  title VARCHAR(255)
);

-- Roadmap Milestones
CREATE TABLE roadmap_milestones (
  id SERIAL PRIMARY KEY,
  roadmap_phase_id INTEGER REFERENCES roadmap_phases(id),
  title VARCHAR(255)
);

-- User Milestone Progress
CREATE TABLE user_milestone_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  milestone_id INTEGER REFERENCES roadmap_milestones(id),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running Both Servers

### Option 1: Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Single Terminal with Concurrently (Optional)

Install concurrently: `npm install -D concurrently`

Update frontend package.json scripts:
```json
"dev:all": "concurrently \"npm run dev\" \"cd backend && npm run dev\""
```

Then run: `npm run dev:all`

## Troubleshooting

### Error: "Cannot find module..."
- **Solution:** Run `npm install` in both frontend and backend directories

### Error: "ECONNREFUSED" on port 5000
- **Solution:** Backend server not running. Start backend first

### Error: "Cannot connect to database"
- **Solution:** Check .env file DATABASE credentials and ensure PostgreSQL is running

### Error: Port 5173 already in use
- **Solution:** Change port in vite.config.ts or kill the process using port 5173

### Clear node_modules and reinstall:
```bash
rm -r node_modules package-lock.json
npm install
```

## API Testing

Use Postman or cURL to test endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get Dashboard Stats (requires token)
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: <token_from_login>"
```

## Features Implemented

✅ User Authentication (Register/Login)
✅ Resume Management
✅ Career Planner with Roadmap
✅ Skill Tracking
✅ Bookmarks Management
✅ Projects Recommendations
✅ Dashboard with Statistics
✅ User Profile
✅ Protected Routes

## Next Steps

1. Ensure all dependencies are installed
2. Set up PostgreSQL database with tables above
3. Update .env files with correct credentials
4. Start backend server
5. Start frontend server
6. Navigate to http://localhost:5173
7. Create account and login

## Support

For issues, check:
- Backend console for server errors
- Browser DevTools for frontend errors
- PostgreSQL connection string in .env
- Ensure ports 5000 and 5173 are not in use
