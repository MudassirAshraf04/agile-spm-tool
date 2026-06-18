export default function RequirementForm({ reqForm, setReqForm, onSubmit, saving, submitLabel }) {
  return (
    <div style={{ background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", padding:"20px", marginBottom:"20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
        <div style={{ width:30, height:30, background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:"var(--radius-sm)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📋</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{submitLabel?.includes("Save")?"Edit Requirement":"New Requirement"}</div>
          <div style={{ fontSize:11, color:"var(--text3)" }}>Fill in details to capture a project requirement</div>
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <div className="inp-label">Requirement Title *</div>
        <input className="inp" placeholder="e.g. User authentication system"
          value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title:e.target.value })} style={{ width:"100%" }} />
      </div>

      <div style={{ marginBottom:12 }}>
        <div className="inp-label">Description</div>
        <textarea className="inp" placeholder="Describe the requirement in detail..."
          value={reqForm.description} onChange={(e) => setReqForm({ ...reqForm, description:e.target.value })}
          rows={3} style={{ width:"100%", resize:"vertical", lineHeight:1.6 }} />
      </div>

      <div style={{ marginBottom:12 }}>
        <div className="inp-label">Stakeholder</div>
        <input className="inp" placeholder="e.g. Product Manager, Client, End User"
          value={reqForm.stakeholder} onChange={(e) => setReqForm({ ...reqForm, stakeholder:e.target.value })} style={{ width:"100%" }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
        <div>
          <div className="inp-label">Priority</div>
          <select className="inp" value={reqForm.priority} onChange={(e) => setReqForm({ ...reqForm, priority:e.target.value })} style={{ width:"100%" }}>
            <option value="High">🔴 High</option><option value="Medium">🟡 Medium</option><option value="Low">🟢 Low</option>
          </select>
        </div>
        <div>
          <div className="inp-label">Category</div>
          <select className="inp" value={reqForm.category} onChange={(e) => setReqForm({ ...reqForm, category:e.target.value })} style={{ width:"100%" }}>
            <option value="Functional">Functional</option><option value="Non-Functional">Non-Functional</option>
            <option value="Business">Business</option><option value="Technical">Technical</option>
          </select>
        </div>
      </div>

      <button className="tbtn primary" style={{ width:"100%", justifyContent:"center", padding:"10px" }}
        onClick={onSubmit} disabled={saving}>
        {saving?"Saving…":(submitLabel||"+ Add Requirement")}
      </button>
    </div>
  );
}