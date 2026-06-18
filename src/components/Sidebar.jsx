const navItems = [
  { section: "Overview",   items: [{ id: "dashboard",  label: "Dashboard",      icon: "⬡" }] },
  { section: "Requirements", items: [{ id: "requirementsStories", label: "Req & Stories", icon: "📋" }] },
  { section: "Estimation", items: [{ id: "estimation", label: "Estimation",     icon: "◈" }] },
  { section: "Planning",   items: [
    { id: "backlog", label: "Backlog",        icon: "≡", badge: "12" },
    { id: "sprint",  label: "Sprint Planner", icon: "▷" },
  ]},
  { section: "Tracking",   items: [
    { id: "kanban", label: "Kanban Board",  icon: "⊞" },
    { id: "gantt",  label: "Gantt Chart",   icon: "▬" },
    { id: "pert",   label: "PERT Diagram",  icon: "◎" },
  ]},
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">AC</div>
        <div>
          <div className="logo-title">AgileCase</div>
          <div className="logo-sub">SPM Tool - Muhammad Mudassir</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", paddingBottom: "8px" }}>
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="nav-section">{group.section}</div>
            {group.items.map(({ id, label, icon, badge }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`nav-item${activePage === id ? " active" : ""}`}
              >
                <span className="nav-icon">{icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="nav-item" style={{ margin: 0 }}>
          <span className="nav-icon">⚙</span>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}

