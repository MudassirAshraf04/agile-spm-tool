// export default function Topbar({ title, badge }) {
//   return (
//     <div className="topbar">
//       <div className="topbar-left">
//         <span className="topbar-title">{title}</span>
//         <span className="topbar-badge">{badge}</span>
//       </div>
//       <div className="topbar-right">
//         <button className="tbtn icon">🔔</button>
//         <button className="tbtn icon">👤</button>
//         <button className="tbtn primary">+ New</button>
//       </div>
//     </div>
//   );
// }

export default function Topbar({ title, badge, user, onLogout }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{title}</span>
        <span className="topbar-badge">{badge}</span>
      </div>
      <div className="topbar-right">
        <button className="tbtn icon">🔔</button>

        {/* User pill */}
        {user && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "4px 12px 4px 6px",
            fontSize: 12,
            color: "var(--text2)",
          }}>
            <div style={{
              width: 24, height: 24,
              background: "var(--accent)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {user.name?.split(" ")[0]}
          </div>
        )}

        {/* Logout */}
        {onLogout && (
          <button
            className="tbtn"
            onClick={onLogout}
            style={{ fontSize: 12 }}
            title="Sign out"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
 