import { useState, useEffect } from "react";
import Sidebar    from "./components/Sidebar";
import Topbar     from "./components/Topbar";
import Login      from "../pages/Login";
import Dashboard  from "../pages/Dashboard";
import Estimation from "../pages/Estimation";
import Backlog    from "../pages/Backlog";
import SprintPlanner        from "../pages/SprintPlanner";
import KanbanBoard          from "../pages/KanbanBoard";
import GanttChart           from "../pages/GanttChart";
import PertDiagram          from "../pages/PertDiagram";
import RequirementsStories  from "../pages/RequirementsStories";

const pages = {
  dashboard:           { title: "Dashboard",           badge: "Overview"        },
  estimation:          { title: "Estimation",           badge: "5 methods"       },
  backlog:             { title: "Product Backlog",      badge: "Stories"         },
  sprint:              { title: "Sprint Planner",       badge: "Active sprint"   },
  kanban:              { title: "Kanban Board",         badge: "Sprint 2"        },
  gantt:               { title: "Gantt Chart",          badge: "Project timeline"},
  pert:                { title: "PERT Diagram",         badge: "Network analysis"},
  requirementsStories: { title: "Requirements & Stories", badge: "Req & Stories" },
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [user,       setUser]       = useState(null);
  const [checking,   setChecking]   = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token  = localStorage.getItem("token");
    if (stored && token) setUser(JSON.parse(stored));
    setChecking(false);
  }, []);

  const handleLogin  = (data) => setUser(data);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":           return <Dashboard />;
      case "estimation":          return <Estimation />;
      case "backlog":             return <Backlog />;
      case "sprint":              return <SprintPlanner />;
      case "kanban":              return <KanbanBoard />;
      case "gantt":               return <GanttChart />;
      case "pert":                return <PertDiagram />;
      case "requirementsStories": return <RequirementsStories />;
      default:                    return <Dashboard />;
    }
  };

  if (checking) return null;

  // ✅ Login protection ENABLED
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          title={pages[activePage].title}
          badge={pages[activePage].badge}
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}