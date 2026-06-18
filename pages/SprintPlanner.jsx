// export default function SprintPlanner() {
//   const sprints=[
//     {name:"Sprint 1",          dates:"May 1 – May 14, 2025", status:"Completed",statusCls:"pill pill-green",  pct:100,pts:"32/32",stories:"8/8", vel:"32",barColor:"var(--green)"},
//     {name:"Sprint 2 — Current",dates:"May 15 – May 28, 2025",status:"Active",   statusCls:"pill pill-purple", pct:68, pts:"22/32",stories:"7/10",vel:"—", barColor:"var(--accent)"},
//     {name:"Sprint 3",          dates:"May 29 – Jun 11, 2025",status:"Planned",  statusCls:"pill pill-gray",   pct:0,  pts:"0/32", stories:"0/9", vel:"32",barColor:"var(--accent)"},
//   ];
//   const sprint2=[
//     {id:"#US-01",title:"User login with Google OAuth", pts:5,assignee:"AK",status:"Done",        sc:"pill pill-green" },
//     {id:"#US-02",title:"Dashboard analytics widget",   pts:3,assignee:"SR",status:"In Progress", sc:"pill pill-amber" },
//     {id:"#US-04",title:"Notification system",          pts:8,assignee:"MH",status:"To Do",       sc:"pill pill-gray"  },
//     {id:"#US-05",title:"User profile settings",        pts:3,assignee:"AK",status:"In Progress", sc:"pill pill-amber" },
//   ];
//   return (
//     <div>
//       <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
//         <div style={{fontSize:13,color:"var(--text3)"}}>3 sprints total · 96 story points planned</div>
//         <button className="tbtn primary">+ New Sprint</button>
//       </div>
//       <div className="sprint-cards">
//         {sprints.map(s=>(
//           <div key={s.name} className="sprint-card">
//             <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
//               <div className="sprint-name">{s.name}</div>
//               <span className={s.statusCls}>{s.status}</span>
//             </div>
//             <div className="sprint-dates">{s.dates}</div>
//             <div className="progress-wrap" style={{marginBottom:12}}>
//               <div className="progress-fill" style={{width:`${s.pct}%`,background:s.barColor}}/>
//             </div>
//             <div style={{display:"flex",gap:16,fontSize:12,color:"var(--text3)"}}>
//               <span>Points <span style={{color:"var(--text)",fontWeight:600}}>{s.pts}</span></span>
//               <span>Stories <span style={{color:"var(--text)",fontWeight:600}}>{s.stories}</span></span>
//               <span>Vel <span style={{color:"var(--text)",fontWeight:600}}>{s.vel}</span></span>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="card">
//         <div className="card-head">
//           <div className="card-title">Sprint 2 — Story Breakdown</div>
//           <span className="pill pill-purple">10 stories · 32 pts</span>
//         </div>
//         {sprint2.map(s=>(
//           <div key={s.id} className="story-row">
//             <div className="pts-badge">{s.pts}</div>
//             <div style={{flex:1}}>
//               <div className="story-title">{s.title}</div>
//               <div className="story-meta">{s.id} · {s.assignee}</div>
//             </div>
//             <span className={s.sc}>{s.status}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import api from "../src/services/api";

export default function SprintPlanner() {
  const [sprints,   setSprints]   = useState([]);
  const [backlog,   setBacklog]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({
    name: "", startDate: "", endDate: "", goal: "", capacity: 32,
  });

  const statusCls = {
    Planned:   "pill pill-gray",
    Active:    "pill pill-purple",
    Completed: "pill pill-green",
  };

  // ── Fetch sprints + backlog stories ───────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [sprintData, storyData] = await Promise.all([
        api.sprints.getAll(),
        api.stories.getAll({ status: "Backlog" }),
      ]);
      setSprints(sprintData);
      setBacklog(storyData);
    } catch (err) {
      setError("Could not load data — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Create sprint ──────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      setError("Name, start date, and end date are required."); return;
    }
    setSaving(true);
    try {
      await api.sprints.create(form);
      setForm({ name:"", startDate:"", endDate:"", goal:"", capacity:32 });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Add story to sprint ────────────────────────────────────
  const handleAddStory = async (sprintId, storyId) => {
    try {
      await api.sprints.addStory(sprintId, storyId);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Activate sprint ────────────────────────────────────────
  const handleActivate = async (sprintId) => {
    try {
      await api.sprints.update(sprintId, { status: "Active" });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {error && (
        <div style={{ background:"var(--red-bg)", border:"1px solid rgba(240,101,101,.2)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"var(--red)", marginBottom:14 }}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div style={{ fontSize:13, color:"var(--text3)" }}>
          {loading ? "Loading…" : `${sprints.length} sprints · ${sprints.reduce((a,s)=>a+s.stories.length,0)} stories planned`}
        </div>
        <button className="tbtn primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ New Sprint"}
        </button>
      </div>

      {/* New sprint form */}
      {showForm && (
        <div className="card" style={{ marginBottom:16, borderLeft:"3px solid var(--accent)" }}>
          <div className="card-title" style={{ marginBottom:14 }}>Create Sprint</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <div className="inp-label">Sprint Name *</div>
              <input className="inp" placeholder="Sprint 3" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width:"100%" }}/>
            </div>
            <div>
              <div className="inp-label">Capacity (pts)</div>
              <input className="inp" type="number" value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} style={{ width:"100%" }}/>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <div className="inp-label">Start Date *</div>
              <input className="inp" type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={{ width:"100%" }}/>
            </div>
            <div>
              <div className="inp-label">End Date *</div>
              <input className="inp" type="date" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={{ width:"100%" }}/>
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div className="inp-label">Sprint Goal</div>
            <input className="inp" placeholder="Complete authentication flow" value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })} style={{ width:"100%" }}/>
          </div>
          <button className="tbtn primary" style={{ width:"100%", justifyContent:"center" }}
            onClick={handleCreate} disabled={saving}>
            {saving ? "Creating…" : "+ Create Sprint"}
          </button>
        </div>
      )}

      {/* Sprint cards */}
      {loading ? (
        <div className="card" style={{ textAlign:"center", padding:40, color:"var(--text3)", fontSize:13 }}>
          Loading sprints…
        </div>
      ) : sprints.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:40, color:"var(--text3)", fontSize:13 }}>
          No sprints yet — click "+ New Sprint" to create your first one.
        </div>
      ) : (
        <div className="sprint-cards">
          {sprints.map((s) => {
            const totalPts   = s.stories.reduce((a, st) => a + (st.points || 0), 0);
            const donePts    = s.stories.filter((st) => st.status === "Done").reduce((a, st) => a + (st.points || 0), 0);
            const pct        = s.capacity > 0 ? Math.round((donePts / s.capacity) * 100) : 0;
            const barColor   = s.status === "Completed" ? "var(--green)" : s.status === "Active" ? "var(--accent)" : "var(--surface3)";

            return (
              <div key={s._id} className="sprint-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div className="sprint-name">{s.name}</div>
                  <span className={statusCls[s.status] || "pill"}>{s.status}</span>
                </div>
                <div className="sprint-dates">
                  {new Date(s.startDate).toLocaleDateString()} – {new Date(s.endDate).toLocaleDateString()}
                </div>
                {s.goal && (
                  <div style={{ fontSize:11, color:"var(--text3)", marginBottom:8, fontStyle:"italic" }}>
                    "{s.goal}"
                  </div>
                )}
                <div className="progress-wrap" style={{ marginBottom:10 }}>
                  <div className="progress-fill" style={{ width:`${pct}%`, background:barColor }}/>
                </div>
                <div style={{ display:"flex", gap:16, fontSize:12, color:"var(--text3)", marginBottom:10 }}>
                  <span>Points <strong style={{ color:"var(--text)" }}>{totalPts}/{s.capacity}</strong></span>
                  <span>Stories <strong style={{ color:"var(--text)" }}>{s.stories.length}</strong></span>
                  <span>Done <strong style={{ color:"var(--green)" }}>{pct}%</strong></span>
                </div>

                {/* Activate button if Planned */}
                {s.status === "Planned" && (
                  <button className="tbtn primary" style={{ width:"100%", justifyContent:"center", fontSize:12 }}
                    onClick={() => handleActivate(s._id)}>
                    ▷ Activate Sprint
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Backlog stories available to add */}
      {!loading && sprints.length > 0 && backlog.length > 0 && (
        <div className="card" style={{ marginTop:16 }}>
          <div className="card-head">
            <div className="card-title">Backlog — Add Stories to a Sprint</div>
            <span className="pill pill-gray">{backlog.length} available</span>
          </div>
          {backlog.map((s) => (
            <div key={s._id} className="story-row">
              <div className="pts-badge">{s.points}</div>
              <div style={{ flex:1 }}>
                <div className="story-title">{s.iWant}</div>
                <div className="story-meta">{s.storyId} · {s.priority}</div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {sprints.filter((sp) => sp.status !== "Completed").map((sp) => (
                  <button key={sp._id} className="tbtn" style={{ fontSize:11 }}
                    onClick={() => handleAddStory(sp._id, s._id)}>
                    + {sp.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}