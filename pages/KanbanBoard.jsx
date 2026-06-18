import { useState, useEffect } from "react";
import api from "../src/services/api";

const COLUMNS = [
  { id: "In Sprint",   label: "To Do",      cls: "pill pill-gray"  },
  { id: "In Progress", label: "In Progress", cls: "pill pill-amber" },
  { id: "Blocked",     label: "Blocked",     cls: "pill pill-red"   },
  { id: "Done",        label: "Done",        cls: "pill pill-green" },
];
const pc = { High: "pill pill-red", Med: "pill pill-amber", Low: "pill pill-green" };

export default function KanbanBoard() {
  const [stories,      setStories]      = useState([]);
  const [sprints,      setSprints]      = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [moving,       setMoving]       = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sprintData, allStories] = await Promise.all([
        api.sprints.getAll(),
        api.stories.getAll(),
      ]);
      setSprints(sprintData);
      const active = sprintData.find((s) => s.status === "Active") || sprintData[0] || null;
      setActiveSprint(active);
      if (active) {
        const sprintStoryIds = active.stories.map((s) => s._id || s);
        const sprintStories  = allStories.filter((s) =>
          sprintStoryIds.includes(s._id) || s.sprint?._id === active._id || s.sprint === active._id
        );
        setStories(sprintStories);
      } else {
        setStories(allStories.filter((s) => ["In Progress", "Blocked", "Done"].includes(s.status)));
      }
    } catch (err) {
      setError("Could not load board — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMove = async (storyId, newStatus) => {
    setMoving(storyId);
    try {
      await api.stories.updateStatus(storyId, newStatus);
      setStories((prev) => prev.map((s) => s._id === storyId ? { ...s, status: newStatus } : s));
    } catch (err) {
      setError(err.message);
    } finally {
      setMoving(null);
    }
  };

  const handleDragStart = (e, storyId) => e.dataTransfer.setData("storyId", storyId);
  const handleDrop      = async (e, newStatus) => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData("storyId");
    if (storyId) await handleMove(storyId, newStatus);
  };
  const handleDragOver = (e) => e.preventDefault();

  if (loading) return (
    <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--text3)" }}>
      Loading Kanban board…
    </div>
  );

  return (
    <div>
      {error && (
        <div style={{ background: "var(--red-bg)", border: "1px solid rgba(240,101,101,.2)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 14 }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: "var(--text3)" }}>
          {activeSprint ? `${activeSprint.name} · Drag cards to update status` : "No active sprint"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {sprints.filter((s) => s.status !== "Completed").map((sp) => (
            <button key={sp._id}
              className={`tbtn${activeSprint?._id === sp._id ? " primary" : ""}`}
              style={{ fontSize: 11 }}
              onClick={async () => {
                setActiveSprint(sp);
                const sprintStoryIds = sp.stories.map((s) => s._id || s);
                const all = await api.stories.getAll();
                setStories(all.filter((s) =>
                  sprintStoryIds.includes(s._id) || s.sprint?._id === sp._id || s.sprint === sp._id
                ));
              }}>
              {sp.name}
            </button>
          ))}
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--text3)" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⊞</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}>No stories in this sprint</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Add stories from Sprint Planner first</div>
        </div>
      ) : (
        <div className="kanban">
          {COLUMNS.map((col) => {
            const colStories = stories.filter((s) => s.status === col.id);
            return (
              <div key={col.id} className="kcol"
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
                style={{ minHeight: 200 }}>
                <div className="kcol-head">
                  <span className="kcol-label">{col.label}</span>
                  <span className="kcol-count">{colStories.length}</span>
                </div>

                {colStories.map((s) => (
                  <div key={s._id} className="kcard"
                    draggable
                    onDragStart={(e) => handleDragStart(e, s._id)}
                    style={{
                      opacity: moving === s._id ? 0.5 : 1,
                      cursor: "grab",
                      borderLeft:
                        col.id === "Blocked"     ? "3px solid var(--red)"   :
                        col.id === "Done"        ? "3px solid var(--green)" :
                        col.id === "In Progress" ? "3px solid var(--amber)" : "",
                    }}>
                    <div className="kcard-title" style={{ marginBottom: 8 }}>{s.iWant}</div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                      {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                        <button key={c.id}
                          onClick={() => handleMove(s._id, c.id)}
                          style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, cursor: "pointer", border: "1px solid var(--border2)", background: "transparent", color: "var(--text3)" }}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                    <div className="kcard-foot">
                      <span className={pc[s.priority] || "pill"} style={{ fontSize: 9 }}>
                        {s.priority} · {s.points}pt
                      </span>
                      <div className="kavatar"
                        style={{ background: s.assignee ? "var(--accent)" : "var(--surface3)", fontSize: s.assignee ? undefined : 9, color: s.assignee ? undefined : "var(--text3)" }}
                        title={s.assignee?.name || "Unassigned"}>
                        {s.assignee ? s.assignee.name?.charAt(0).toUpperCase() : "?"}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>{s.storyId}</div>
                  </div>
                ))}

                {colStories.length === 0 && (
                  <div style={{ border: "2px dashed var(--border2)", borderRadius: 8, padding: "24px 12px", textAlign: "center", fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
                    Drop here
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}