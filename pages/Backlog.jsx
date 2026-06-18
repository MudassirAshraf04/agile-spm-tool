import { useState, useEffect } from "react";
import api from "../src/services/api";

const pc = { High:"pill pill-red", Med:"pill pill-amber", Low:"pill pill-green" };
const sc = {
  "In Sprint":"pill pill-purple", Backlog:"pill pill-green",
  Blocked:"pill pill-red", "In Progress":"pill pill-amber", Done:"pill pill-green",
};

export default function Backlog() {
  const [stories,   setStories]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [filterPri, setFilterPri] = useState("All");
  const [filterSt,  setFilterSt]  = useState("All");
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [editStory, setEditStory] = useState(null);
  const [form, setForm] = useState({ iWant:"", asA:"", soThat:"", points:3, priority:"Med" });

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterPri !== "All") params.priority = filterPri;
      if (filterSt  !== "All") params.status   = filterSt;
      if (search)               params.search   = search;
      const data = await api.stories.getAll(params);
      setStories(data);
    } catch (err) {
      setError("Could not load stories — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStories(); }, [filterPri, filterSt, search]);

  const handleAdd = async () => {
    if (!form.iWant.trim()) return;
    setSaving(true);
    try {
      await api.stories.create(form);
      setForm({ iWant:"", asA:"", soThat:"", points:3, priority:"Med" });
      setShowForm(false);
      fetchStories();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const openEdit = (s) => {
    setEditStory(s);
    setForm({ iWant:s.iWant, asA:s.asA||"", soThat:s.soThat||"", points:s.points||3, priority:s.priority||"Med" });
    setShowForm(false);
  };

  const handleEdit = async () => {
    if (!form.iWant.trim()) return;
    setSaving(true);
    try {
      await api.stories.update(editStory._id, form);
      setEditStory(null);
      fetchStories();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this story?")) return;
    try {
      await api.stories.delete(id);
      setStories(stories.filter((s) => s._id !== id));
    } catch (err) { setError(err.message); }
  };

  const InlineForm = ({ onSubmit, submitLabel }) => (
    <div className="card" style={{ marginBottom:16, borderLeft:"3px solid var(--accent)" }}>
      <div className="card-title" style={{ marginBottom:12 }}>{editStory ? "Edit User Story" : "New User Story"}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <div>
          <div className="inp-label">As a…</div>
          <input className="inp" placeholder="registered user" value={form.asA}
            onChange={(e) => setForm({ ...form, asA:e.target.value })} style={{ width:"100%" }} />
        </div>
        <div>
          <div className="inp-label">Priority</div>
          <select className="inp" value={form.priority} onChange={(e) => setForm({ ...form, priority:e.target.value })} style={{ width:"100%" }}>
            <option value="High">High</option><option value="Med">Med</option><option value="Low">Low</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom:10 }}>
        <div className="inp-label">I want… *</div>
        <input className="inp" placeholder="to log in with Google" value={form.iWant}
          onChange={(e) => setForm({ ...form, iWant:e.target.value })} style={{ width:"100%" }} />
      </div>
      <div style={{ marginBottom:10 }}>
        <div className="inp-label">So that…</div>
        <input className="inp" placeholder="I don't need a separate password" value={form.soThat}
          onChange={(e) => setForm({ ...form, soThat:e.target.value })} style={{ width:"100%" }} />
      </div>
      <div style={{ marginBottom:14 }}>
        <div className="inp-label">Story Points</div>
        <div style={{ display:"flex", gap:6 }}>
          {[1,2,3,5,8,13].map((p) => (
            <button key={p} onClick={() => setForm({ ...form, points:p })}
              style={{ flex:1, padding:"7px 4px", borderRadius:6, cursor:"pointer",
                border:     form.points===p?"1px solid var(--accent)"   :"1px solid var(--border2)",
                background: form.points===p?"var(--accent-bg)"          :"transparent",
                color:      form.points===p?"var(--accent2)"            :"var(--text3)",
                fontWeight: form.points===p?700:400, fontSize:13 }}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button className="tbtn" style={{ flex:1, justifyContent:"center" }}
          onClick={() => { setShowForm(false); setEditStory(null); }}>Cancel</button>
        <button className="tbtn primary" style={{ flex:2, justifyContent:"center" }}
          onClick={onSubmit} disabled={saving}>{saving?"Saving…":submitLabel}</button>
      </div>
    </div>
  );

  return (
    <div>
      {error && (
        <div style={{ background:"var(--red-bg)", border:"1px solid rgba(240,101,101,.2)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"var(--red)", marginBottom:14 }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display:"flex", gap:10, marginBottom:18, alignItems:"center" }}>
        <input className="inp" placeholder="Search stories..." style={{ flex:1 }} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="inp" style={{ width:140 }} value={filterPri} onChange={(e) => setFilterPri(e.target.value)}>
          <option value="All">All Priorities</option><option value="High">High</option><option value="Med">Med</option><option value="Low">Low</option>
        </select>
        <select className="inp" style={{ width:130 }} value={filterSt} onChange={(e) => setFilterSt(e.target.value)}>
          <option value="All">All Statuses</option><option value="Backlog">Backlog</option>
          <option value="In Sprint">In Sprint</option><option value="In Progress">In Progress</option>
          <option value="Blocked">Blocked</option><option value="Done">Done</option>
        </select>
        <button className="tbtn primary" onClick={() => { setShowForm(!showForm); setEditStory(null); }}>
          {showForm?"✕ Cancel":"+ Add Story"}
        </button>
      </div>

      {showForm && !editStory && <InlineForm onSubmit={handleAdd} submitLabel="+ Add to Backlog" />}
      {editStory && <InlineForm onSubmit={handleEdit} submitLabel="✓ Save Changes" />}

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:40, textAlign:"center", color:"var(--text3)", fontSize:13 }}>Loading stories from backend…</div>
        ) : stories.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"var(--text3)", fontSize:13 }}>No stories yet — click "+ Add Story" to create one.</div>
        ) : (
          <table className="bl-table">
            <thead>
              <tr>{["ID","Story","Pts","Priority","Status","Actions"].map((h)=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s._id} style={{ background:editStory?._id===s._id?"var(--accent-bg)":"" }}>
                  <td style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"var(--text3)" }}>{s.storyId}</td>
                  <td>
                    <div style={{ fontWeight:500, color:"var(--text)" }}>{s.iWant}</div>
                    {s.asA && <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>As a {s.asA}{s.soThat?`, so that ${s.soThat}`:""}</div>}
                  </td>
                  <td><div className="pts-badge">{s.points}</div></td>
                  <td><span className={pc[s.priority]||"pill"}>{s.priority}</span></td>
                  <td><span className={sc[s.status]  ||"pill"}>{s.status}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="tbtn icon" title="Edit"   onClick={() => openEdit(s)}>✏</button>
                      <button className="tbtn icon" title="Delete" onClick={() => handleDelete(s._id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && stories.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12 }}>
          <span style={{ fontSize:12, color:"var(--text3)" }}>{stories.length} {stories.length===1?"story":"stories"} found</span>
        </div>
      )}
    </div>
  );
}