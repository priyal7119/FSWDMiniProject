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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "dashboard", Component: Dashboard },
      { path: "resume-studio", Component: ResumeStudio },
      { path: "career-planner", Component: CareerPlanner },
      { path: "projects", Component: Projects },
      { path: "research-guide", Component: ResearchGuide },
      { path: "interview-faqs", Component: InterviewFAQs },
      { path: "bookmarks", Component: Bookmarks },
      { path: "login", Component: Login },
      { path: "about", Component: About },
      { path: "profile", Component: Profile },
    ],
  },
]);