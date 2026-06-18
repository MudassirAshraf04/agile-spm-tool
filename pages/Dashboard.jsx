import { useState, useEffect } from "react";
import api from "../src/services/api";

export default function Dashboard() {
  const [stories,  setStories]  = useState([]);
  const [sprints,  setSprints]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storyData, sprintData] = await Promise.all([
          api.stories.getAll(),
          api.sprints.getAll(),
        ]);
        setStories(storyData);
        setSprints(sprintData);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeSprint      = sprints.find((s) => s.status === "Active") || null;
  const totalStories      = stories.length;
  const doneStories       = stories.filter((s) => s.status === "Done").length;
  const blockedStories    = stories.filter((s) => s.status === "Blocked").length;
  const inProgressStories = stories.filter((s) => s.status === "In Progress").length;
  const backlogStories    = stories.filter((s) => s.status === "Backlog").length;

  const sprintStories    = activeSprint ? activeSprint.stories : [];
  const sprintTotal      = sprintStories.reduce((a, s) => a + (s.points || 0), 0);
  const sprintDone       = sprintStories.filter((s) => s.status === "Done").reduce((a, s) => a + (s.points || 0), 0);
  const sprintInProgress = sprintStories.filter((s) => s.status === "In Progress").length;
  const sprintToDo       = sprintStories.filter((s) => s.status === "In Sprint").length;
  const sprintDoneCount  = sprintStories.filter((s) => s.status === "Done").length;
  const sprintPct        = activeSprint?.capacity > 0
    ? Math.round((sprintDone / activeSprint.capacity) * 100) : 0;

  const velData = sprints.slice(-5).map((sp) => {
    const pts = sp.stories.filter((s) => s.status === "Done").reduce((a, s) => a + (s.points || 0), 0);
    const maxPts = Math.max(...sprints.map((s) =>
      s.stories.filter((st) => st.status === "Done").reduce((a, st) => a + (st.points || 0), 0)
    ), 1);
    return {
      sprint: sp.name.replace("Sprint ", "S"),
      pts,
      h: Math.max(12, Math.round((pts / maxPts) * 88)),
      color: sp.status === "Active" ? "var(--accent)" : sp.status === "Completed" ? "var(--green)" : "var(--surface3)",
    };
  });

  const recentStories = [...stories]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const pc = { High: "pill pill-red", Med: "pill pill-amber", Low: "pill pill-green" };

  const stats = [
    { label: "Total Stories",   value: totalStories,    sub: `${backlogStories} in backlog`,     cls: "neutral" },
    { label: "Done",            value: doneStories,     sub: `${inProgressStories} in progress`, cls: "up"      },
    { label: "Sprint Progress", value: `${sprintPct}%`, sub: activeSprint ? activeSprint.name : "No active sprint", cls: "neutral" },
    { label: "Blocked",         value: blockedStories,  sub: blockedStories > 0 ? "Needs attention" : "All clear ✓", cls: blockedStories > 0 ? "down" : "up" },
  ];

  if (loading) return (
    <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--text3)" }}>
      Loading dashboard…
    </div>
  );

  return (
    <div>
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-sub ${s.cls}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          {activeSprint ? (
            <>
              <div className="card-head">
                <div>
                  <div className="card-title">{activeSprint.name} — Current</div>
                  <div className="card-sub">
                    {new Date(activeSprint.startDate).toLocaleDateString()} –{" "}
                    {new Date(activeSprint.endDate).toLocaleDateString()}
                  </div>
                </div>
                <span className="pill pill-purple">Active</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>
                <span>{sprintDone} / {activeSprint.capacity} story points</span>
                <span>{sprintPct}%</span>
              </div>
              <div className="progress-wrap" style={{ marginBottom: 16 }}>
                <div className="progress-fill" style={{ width: `${sprintPct}%` }} />
              </div>
              <div className="three-col">
                {[
                  { label: "Done",        val: sprintDoneCount,  color: "var(--green)", bg: "var(--green-bg)",  border: "rgba(61,214,140,.15)" },
                  { label: "In Progress", val: sprintInProgress, color: "var(--amber)", bg: "var(--amber-bg)",  border: "rgba(245,166,35,.15)"  },
                  { label: "To Do",       val: sprintToDo,       color: "var(--text2)", bg: "var(--surface2)",  border: "var(--border)"         },
                ].map(({ label, val, color, bg, border }) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
              {activeSprint.goal && (
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>
                  Goal: "{activeSprint.goal}"
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🏃</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}>No Active Sprint</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Go to Sprint Planner to activate one</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Velocity Trend</div></div>
          {velData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)", fontSize: 13 }}>No sprint data yet</div>
          ) : (
            <div className="vel-bars">
              {velData.map((v) => (
                <div key={v.sprint} className="vel-bar-wrap">
                  <div className="vel-val">{v.pts}</div>
                  <div className="vel-bar" style={{ height: v.h, background: v.color }} />
                  <div className="vel-label">{v.sprint}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Recent Backlog Items</div>
            <span className="card-sub">{recentStories.length} latest</span>
          </div>
          {recentStories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text3)", fontSize: 13 }}>No stories yet</div>
          ) : (
            recentStories.map((s) => (
              <div key={s._id} className="story-row">
                <div className="pts-badge">{s.points}</div>
                <div style={{ flex: 1 }}>
                  <div className="story-title">{s.iWant}</div>
                  <div className="story-meta">{s.storyId}</div>
                </div>
                <span className={pc[s.priority] || "pill"}>{s.priority}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Story Status Breakdown</div></div>
          {[
            { label: "Backlog",     val: backlogStories,    color: "var(--text3)"  },
            { label: "In Sprint",   val: stories.filter(s => s.status === "In Sprint").length, color: "var(--accent2)" },
            { label: "In Progress", val: inProgressStories, color: "var(--amber)"  },
            { label: "Done",        val: doneStories,       color: "var(--green)"  },
            { label: "Blocked",     val: blockedStories,    color: "var(--red)"    },
          ].map(({ label, val, color }) => {
            const pct = totalStories > 0 ? Math.round((val / totalStories) * 100) : 0;
            return (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "var(--text2)" }}>{label}</span>
                  <span style={{ color, fontWeight: 600 }}>{val} ({pct}%)</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "var(--text3)" }}>
            {totalStories} total stories across {sprints.length} sprints
          </div>
        </div>
      </div>
    </div>
  );
}