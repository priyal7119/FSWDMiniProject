import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { ResumeStudio } from "./pages/ResumeStudio";
import { CareerPlanner } from "./pages/CareerPlanner";
import { Projects } from "./pages/Projects";
import { ResearchGuide } from "./pages/ResearchGuide";
import { InterviewFAQs } from "./pages/InterviewFAQs";
import { Login } from "./pages/Login";
import About from "./pages/About";
import { Profile } from "./pages/Profile";
import { Bookmarks } from "./pages/Bookmarks";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "about", Component: About },
      { path: "dashboard", Component: Dashboard },
      { path: "research-guide", Component: ResearchGuide },
      { path: "interview-faqs", Component: InterviewFAQs },

      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: "resume-studio", Component: ResumeStudio },
          { path: "career-planner", Component: CareerPlanner },
          { path: "projects", Component: Projects },
          { path: "bookmarks", Component: Bookmarks },
          { path: "profile", Component: Profile },
        ],
      },
    ],
  },
]);