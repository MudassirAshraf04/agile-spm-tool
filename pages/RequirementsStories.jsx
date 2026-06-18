import { useState, useEffect } from "react";
import RequirementForm from "../src/components/RequirementForm";
import StoryForm       from "../src/components/StoryForm";
import api             from "../src/services/api";

const priorityClass = { High: "pill pill-red", Medium: "pill pill-amber", Low: "pill pill-green" };
const categoryColor = {
  Functional:       "var(--accent2)",
  "Non-Functional": "var(--amber)",
  Business:         "var(--green)",
  Technical:        "var(--blue)",
};

export default function RequirementsStories() {
  const [tab,          setTab]          = useState("requirements");
  const [requirements, setRequirements] = useState([]);
  const [stories,      setStories]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterPri,    setFilterPri]    = useState("All");
  const [filterCat,    setFilterCat]    = useState("All");

  // Edit state
  const [editReq,   setEditReq]   = useState(null);
  const [editStory, setEditStory] = useState(null);

  const [reqForm, setReqForm] = useState({
    title: "", description: "", priority: "Medium", category: "Functional", stakeholder: "",
  });
  const [storyForm, setStoryForm] = useState({
    requirement: "", asA: "", iWant: "", soThat: "", acceptance: "", points: "3",
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [reqData, storyData] = await Promise.all([
        api.requirements.getAll(),
        api.stories.getAll(),
      ]);
      setRequirements(reqData);
      setStories(storyData);
    } catch (err) {
      setError("Could not reach the backend. Make sure the server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── ADD Requirement ────────────────────────────────────────
  const addRequirement = async () => {
    if (!reqForm.title.trim()) return;
    setSaving(true);
    try {
      await api.requirements.create(reqForm);
      setReqForm({ title: "", description: "", priority: "Medium", category: "Functional", stakeholder: "" });
      setShowForm(false);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── EDIT Requirement ───────────────────────────────────────
  const openEditReq = (r) => {
    setEditReq(r);
    setReqForm({ title: r.title, description: r.description || "", priority: r.priority, category: r.category, stakeholder: r.stakeholder || "" });
    setShowForm(true);
    setEditStory(null);
  };

  const saveEditReq = async () => {
    if (!reqForm.title.trim()) return;
    setSaving(true);
    try {
      await api.requirements.update(editReq._id, reqForm);
      setEditReq(null);
      setShowForm(false);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── ADD Story ──────────────────────────────────────────────
  const addStory = async () => {
    if (!storyForm.iWant.trim()) return;
    setSaving(true);
    try {
      await api.stories.create({
        ...storyForm,
        requirement: storyForm.requirement || undefined,
        points: Number(storyForm.points) || 0,
      });
      setStoryForm({ requirement: "", asA: "", iWant: "", soThat: "", acceptance: "", points: "3" });
      setShowForm(false);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── EDIT Story ─────────────────────────────────────────────
  const openEditStory = (s) => {
    setEditStory(s);
    setStoryForm({
      requirement: s.requirement?._id || s.requirement || "",
      asA: s.asA || "",
      iWant: s.iWant || "",
      soThat: s.soThat || "",
      acceptance: s.acceptance || "",
      points: String(s.points || 3),
    });
    setShowForm(true);
    setEditReq(null);
  };

  const saveEditStory = async () => {
    if (!storyForm.iWant.trim()) return;
    setSaving(true);
    try {
      await api.stories.update(editStory._id, {
        ...storyForm,
        requirement: storyForm.requirement || null,
        points: Number(storyForm.points) || 0,
      });
      setEditStory(null);
      setShowForm(false);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── DELETE ─────────────────────────────────────────────────
  const deleteReq = async (id) => {
    if (!window.confirm("Delete this requirement?")) return;
    try {
      await api.requirements.delete(id);
      setRequirements(requirements.filter((r) => r._id !== id));
    } catch (err) { setError(err.message); }
  };

  const deleteStory = async (id) => {
    if (!window.confirm("Delete this story?")) return;
    try {
      await api.stories.delete(id);
      setStories(stories.filter((s) => s._id !== id));
    } catch (err) { setError(err.message); }
  };

  // ── Filtered lists ─────────────────────────────────────────
  const visibleReqs = requirements.filter((r) => {
    if (filterPri !== "All" && r.priority !== filterPri) return false;
    if (filterCat !== "All" && r.category !== filterCat) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const visibleStories = stories.filter((s) =>
    !search || s.iWant.toLowerCase().includes(search.toLowerCase())
  );

  const totalPts    = stories.reduce((a, s) => a + Number(s.points || 0), 0);
  const linkedCount = stories.filter((s) => s.requirement).length;

  // Which submit/cancel to use
  const handleSubmit = tab === "requirements"
    ? (editReq   ? saveEditReq   : addRequirement)
    : (editStory ? saveEditStory : addStory);

  const cancelForm = () => { setShowForm(false); setEditReq(null); setEditStory(null); };

  if (loading) return (
    <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>
      Loading from backend…
    </div>
  );

  return (
    <div>
      {error && (
        <div style={{ background: "var(--red-bg)", border: "1px solid rgba(240,101,101,.2)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 14 }}>
          ⚠ {error}
        </div>
      )}

      {/* Summary */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}>
        {[
          { label: "Total Requirements", value: requirements.length, icon: "📋", color: "var(--accent2)" },
          { label: "User Stories",       value: stories.length,      icon: "📝", color: "var(--green)"   },
          { label: "Story Points",       value: totalPts,            icon: "🎯", color: "var(--amber)"   },
          { label: "Linked Stories",     value: `${linkedCount}/${stories.length}`, icon: "🔗", color: "var(--blue)" },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[
            { id: "requirements", label: `📋 Requirements (${requirements.length})` },
            { id: "stories",      label: `📝 User Stories (${stories.length})`      },
            { id: "matrix",       label: "🔗 Traceability Matrix"                    },
          ].map((t) => (
            <button key={t.id} className={`tab${tab === t.id ? " active" : ""}`}
              onClick={() => { setTab(t.id); cancelForm(); }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "matrix" && (
          <button className="tbtn primary" onClick={() => {
            if (showForm) { cancelForm(); }
            else { setShowForm(true); setEditReq(null); setEditStory(null);
              setReqForm({ title: "", description: "", priority: "Medium", category: "Functional", stakeholder: "" });
              setStoryForm({ requirement: "", asA: "", iWant: "", soThat: "", acceptance: "", points: "3" });
            }
          }}>
            {showForm ? "✕ Cancel"
              : editReq || editStory ? "✕ Cancel Edit"
              : tab === "requirements" ? "+ New Requirement" : "+ New Story"}
          </button>
        )}
      </div>

      {/* Edit/Add label */}
      {showForm && (editReq || editStory) && (
        <div style={{ fontSize: 12, color: "var(--amber)", marginBottom: 8 }}>
          ✏ Editing: {editReq ? editReq.title : editStory?.iWant}
        </div>
      )}

      {/* Filters */}
      {tab === "requirements" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input className="inp" placeholder="Search requirements…" value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
          <select className="inp" style={{ width: 130 }} value={filterPri} onChange={(e) => setFilterPri(e.target.value)}>
            <option value="All">All Priorities</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
          <select className="inp" style={{ width: 160 }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            <option>Functional</option><option>Non-Functional</option>
            <option>Business</option><option>Technical</option>
          </select>
        </div>
      )}
      {tab === "stories" && (
        <div style={{ marginBottom: 16 }}>
          <input className="inp" placeholder="Search user stories…" value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ width: "100%" }} />
        </div>
      )}

      {/* ══ REQUIREMENTS TAB ══ */}
      {tab === "requirements" && (
        <>
          {showForm && (
            <RequirementForm reqForm={reqForm} setReqForm={setReqForm} onSubmit={handleSubmit} saving={saving}
              submitLabel={editReq ? "✓ Save Changes" : "+ Add Requirement"} />
          )}

          {visibleReqs.length === 0 ? (
            <EmptyState icon="📋" title="No requirements yet" sub='Click "+ New Requirement" to add your first one.' />
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="bl-table">
                <thead>
                  <tr>{["ID", "Title & Description", "Category", "Priority", "Stakeholder", "Stories", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {visibleReqs.map((r) => {
                    const linked = stories.filter((s) =>
                      s.requirement && (s.requirement._id || s.requirement) === r._id
                    ).length;
                    return (
                      <tr key={r._id} style={{ background: editReq?._id === r._id ? "var(--accent-bg)" : "" }}>
                        <td>
                          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--accent2)", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: 4, padding: "2px 6px" }}>
                            {r.reqId}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>{r.title}</div>
                          {r.description && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3, maxWidth: 260 }}>{r.description}</div>}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600, background: `${categoryColor[r.category]}18`, color: categoryColor[r.category], border: `1px solid ${categoryColor[r.category]}30` }}>
                            {r.category}
                          </span>
                        </td>
                        <td><span className={priorityClass[r.priority]}>{r.priority}</span></td>
                        <td style={{ fontSize: 12, color: "var(--text2)" }}>{r.stakeholder || "—"}</td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, color: linked > 0 ? "var(--green)" : "var(--text3)" }}>
                            {linked} {linked === 1 ? "story" : "stories"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="tbtn icon" title="Edit" onClick={() => openEditReq(r)}>✏</button>
                            <button className="tbtn icon" title="Delete" onClick={() => deleteReq(r._id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══ STORIES TAB ══ */}
      {tab === "stories" && (
        <>
          {showForm && (
            <StoryForm storyForm={storyForm} setStoryForm={setStoryForm}
              requirements={requirements.map((r) => ({ id: r._id, reqId: r.reqId, title: r.title }))}
              onSubmit={handleSubmit} saving={saving}
              submitLabel={editStory ? "✓ Save Changes" : "+ Add Story"} />
          )}

          {visibleStories.length === 0 ? (
            <EmptyState icon="📝" title="No user stories yet" sub='Click "+ New Story" to create your first user story.' />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleStories.map((s) => {
                const req = s.requirement
                  ? requirements.find((r) => r._id === (s.requirement._id || s.requirement))
                  : null;
                return (
                  <div key={s._id} className="card"
                    style={{ marginBottom: 0, borderLeft: `3px solid ${editStory?._id === s._id ? "var(--amber)" : "var(--green)"}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 700, color: "var(--green)", background: "var(--green-bg)", border: "1px solid rgba(61,214,140,.2)", borderRadius: 4, padding: "2px 7px" }}>
                            {s.storyId}
                          </span>
                          {req && (
                            <span style={{ fontSize: 11, color: "var(--accent2)", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: 4, padding: "2px 7px" }}>
                              🔗 {req.reqId} — {req.title}
                            </span>
                          )}
                        </div>
                        <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 14px", fontSize: 13, lineHeight: 1.7, marginBottom: 10 }}>
                          <span style={{ color: "var(--accent2)", fontWeight: 600 }}>As a </span>
                          <span style={{ color: "var(--text)" }}>{s.asA || "…"}</span>
                          <span style={{ color: "var(--green)", fontWeight: 600 }}>, I want </span>
                          <span style={{ color: "var(--text)" }}>{s.iWant}</span>
                          {s.soThat && (
                            <><span style={{ color: "var(--amber)", fontWeight: 600 }}>, so that </span>
                            <span style={{ color: "var(--text)" }}>{s.soThat}</span></>
                          )}
                        </div>
                        {s.acceptance && (
                          <>
                            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text3)", fontWeight: 600, marginBottom: 6 }}>Acceptance Criteria</div>
                            <pre style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--text2)", background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 12px", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.7 }}>
                              {s.acceptance}
                            </pre>
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 2 }}>
                        <div style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-sm)", padding: "6px 10px", textAlign: "center", minWidth: 48 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent2)", lineHeight: 1 }}>{s.points}</div>
                          <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2 }}>PTS</div>
                        </div>
                        <div style={{ width: "100%", height: 1, background: "var(--border)" }} />
                        <button className="tbtn icon" title="Edit" style={{ width: 32, justifyContent: "center" }}
                          onClick={() => openEditStory(s)}>✏</button>
                        <button className="tbtn icon" title="Delete" style={{ width: 32, justifyContent: "center" }}
                          onClick={() => deleteStory(s._id)}>🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══ TRACEABILITY MATRIX ══ */}
      {tab === "matrix" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="card-title">Requirements ↔ User Stories Traceability Matrix</div>
            <div className="card-sub">Shows which stories satisfy each requirement — gaps flagged in red</div>
          </div>
          {requirements.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
              Add requirements and stories first to see the matrix.
            </div>
          ) : (
            <table className="bl-table">
              <thead>
                <tr><th>Requirement</th><th>Priority</th><th>Category</th><th>Linked Stories</th><th>Coverage</th></tr>
              </thead>
              <tbody>
                {requirements.map((r) => {
                  const linked  = stories.filter((s) => s.requirement && (s.requirement._id || s.requirement) === r._id);
                  const covered = linked.length > 0;
                  return (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>{r.title}</div>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{r.reqId}</div>
                      </td>
                      <td><span className={priorityClass[r.priority]}>{r.priority}</span></td>
                      <td style={{ fontSize: 12, color: categoryColor[r.category] }}>{r.category}</td>
                      <td>
                        {linked.length === 0 ? (
                          <span style={{ fontSize: 12, color: "var(--text3)" }}>No stories linked</span>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {linked.map((s) => (
                              <span key={s._id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(61,214,140,.2)", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>
                                {s.storyId}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: covered ? "100%" : "0%", height: "100%", background: covered ? "var(--green)" : "var(--red)", borderRadius: 3, transition: "width .3s" }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: covered ? "var(--green)" : "var(--red)" }}>
                            {covered ? "✓ Covered" : "✗ Gap"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--text3)" }}>{sub}</div>
    </div>
  );
}
