import { useState, useEffect } from "react";
import api from "../src/services/api";

export default function GanttChart() {
  const [sprints,  setSprints]  = useState([]);
  const [stories,  setStories]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sprintData, storyData] = await Promise.all([
          api.sprints.getAll(),
          api.stories.getAll(),
        ]);
        setSprints(sprintData);
        setStories(storyData);
        const active = sprintData.find((s) => s.status === "Active") || sprintData[0];
        if (active) setSelected(active._id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeSprint = sprints.find((s) => s._id === selected) || sprints[0];

  const buildBars = () => {
    if (!activeSprint) return [];
    const sprintStoryIds = activeSprint.stories.map((s) => s._id || s);
    const sprintStories  = stories.filter((s) =>
      sprintStoryIds.includes(s._id) || s.sprint?._id === activeSprint._id
    );
    return sprintStories.slice(0, 10).map((s, i) => {
      const storyStart = Math.min(i * (100 / Math.max(sprintStories.length, 1)), 85);
      const storyWidth = Math.max(10, Math.min(30, (1 / Math.max(sprintStories.length, 1)) * 100 * 2));
      const type =
        s.status === "Done"        ? "done" :
        s.status === "In Progress" ? "prog" : "plan";
      return { label: s.iWant, left: storyStart, width: storyWidth, type, pts: s.points };
    });
  };

  const bars    = buildBars();
  const barCls  = { done: "gantt-bar gantt-done", prog: "gantt-bar gantt-prog", plan: "gantt-bar gantt-plan" };
  const donePts = activeSprint ? activeSprint.stories.filter((s) => s.status === "Done").reduce((a, s) => a + (s.points || 0), 0) : 0;
  const pct     = activeSprint?.capacity > 0 ? Math.round((donePts / activeSprint.capacity) * 100) : 0;
  const daysLeft = activeSprint ? Math.max(0, Math.ceil((new Date(activeSprint.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const sprintDone  = activeSprint ? activeSprint.stories.filter((s) => s.status === "Done").length : 0;
  const sprintTotal = activeSprint ? activeSprint.stories.length : 0;

  if (loading) return (
    <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--text3)" }}>Loading Gantt chart…</div>
  );

  if (sprints.length === 0) return (
    <div className="card" style={{ textAlign: "center", padding: 48 }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>▬</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}>No Sprints Yet</div>
      <div style={{ fontSize: 12, marginTop: 4, color: "var(--text3)" }}>Create sprints in Sprint Planner to see the Gantt chart</div>
    </div>
  );

  return (
    <div>
      {sprints.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {sprints.map((sp) => (
            <button key={sp._id} className={`tbtn${selected === sp._id ? " primary" : ""}`}
              style={{ fontSize: 11 }} onClick={() => setSelected(sp._id)}>
              {sp.name}
            </button>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Gantt Chart — {activeSprint?.name || "Project Timeline"}</div>
            <div className="card-sub">
              {activeSprint
                ? `${new Date(activeSprint.startDate).toLocaleDateString()} – ${new Date(activeSprint.endDate).toLocaleDateString()}`
                : "Select a sprint"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text3)" }}>
            {[["var(--green)", "Done"], ["var(--amber)", "In Progress"], ["var(--accent)", "Planned"]].map(([c, l]) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, background: c, borderRadius: 2, display: "inline-block" }} />{l}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", paddingLeft: 160, marginBottom: 6 }}>
          {["Week 1", "Week 2", "Week 3", "Week 4"].map((w) => (
            <div key={w} style={{ flex: 1, fontSize: 10, color: "var(--text3)", textAlign: "center" }}>{w}</div>
          ))}
        </div>

        {bars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)", fontSize: 13 }}>
            No stories assigned to this sprint yet
          </div>
        ) : (
          bars.map((b, i) => (
            <div key={i} className="gantt-row">
              <div className="gantt-label" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {b.label}
              </div>
              <div className="gantt-track">
                <div className={barCls[b.type]} style={{ left: `${b.left}%`, width: `${b.width}%` }}>
                  <span className="gantt-bar-text">{b.pts}pt</span>
                </div>
              </div>
            </div>
          ))
        )}

        {activeSprint && (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, background: "var(--surface2)", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ width: 3, height: 24, background: "var(--red)", borderRadius: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "var(--text2)", flex: 1 }}>
              {activeSprint.name} is <strong style={{ color: "var(--text)" }}>{pct}% complete</strong>
              {" · "}{sprintDone}/{sprintTotal} stories done
              {activeSprint.status === "Active" && ` · ${daysLeft} days remaining`}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: activeSprint.status === "Active" ? "var(--accent2)" : activeSprint.status === "Completed" ? "var(--green)" : "var(--text3)" }}>
              {activeSprint.status}
            </div>
          </div>
        )}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head"><div className="card-title">Sprint Summary</div></div>
          {sprints.map((sp) => {
            const spDone = sp.stories.filter((s) => s.status === "Done").reduce((a, s) => a + (s.points || 0), 0);
            const spPct  = sp.capacity > 0 ? Math.round((spDone / sp.capacity) * 100) : 0;
            const color  = sp.status === "Completed" ? "var(--green)" : sp.status === "Active" ? "var(--accent)" : "var(--surface3)";
            return (
              <div key={sp._id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "var(--text2)", fontWeight: 600 }}>{sp.name}</span>
                  <span style={{ color, fontWeight: 700 }}>{spPct}%</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-fill" style={{ width: `${spPct}%`, background: color }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>
                  {sp.stories.length} stories · {sp.capacity} pts capacity
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Story Status in {activeSprint?.name}</div></div>
          {activeSprint ? (
            [
              { label: "In Sprint (Todo)", status: "In Sprint",   color: "var(--accent2)" },
              { label: "In Progress",      status: "In Progress", color: "var(--amber)"   },
              { label: "Blocked",          status: "Blocked",     color: "var(--red)"     },
              { label: "Done",             status: "Done",        color: "var(--green)"   },
            ].map(({ label, status, color }) => {
              const count  = activeSprint.stories.filter((s) => s.status === status).length;
              const pctBar = sprintTotal > 0 ? Math.round((count / sprintTotal) * 100) : 0;
              return (
                <div key={status} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: "var(--text2)" }}>{label}</span>
                    <span style={{ color, fontWeight: 600 }}>{count}</span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-fill" style={{ width: `${pctBar}%`, background: color }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text3)", fontSize: 13 }}>Select a sprint</div>
          )}
        </div>
      </div>
    </div>
  );
}