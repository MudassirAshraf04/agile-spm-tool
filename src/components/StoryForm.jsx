export default function StoryForm({ storyForm, setStoryForm, requirements, onSubmit, saving, submitLabel }) {
  return (
    <div style={{ background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", padding:"20px", marginBottom:"20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
        <div style={{ width:30, height:30, background:"var(--green-bg)", border:"1px solid rgba(61,214,140,.2)", borderRadius:"var(--radius-sm)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📝</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{submitLabel?.includes("Save")?"Edit User Story":"New User Story"}</div>
          <div style={{ fontSize:11, color:"var(--text3)" }}>Define a story in the standard Agile format</div>
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <div className="inp-label">Linked Requirement</div>
        <select className="inp" value={storyForm.requirement} onChange={(e) => setStoryForm({ ...storyForm, requirement:e.target.value })} style={{ width:"100%" }}>
          <option value="">— Select a Requirement (optional) —</option>
          {requirements.map((r) => <option key={r.id} value={r.id}>{r.reqId||r.id} — {r.title}</option>)}
        </select>
      </div>

      <div style={{ marginBottom:12 }}>
        <div className="inp-label">As a… *</div>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:11, color:"var(--accent2)", fontWeight:600, pointerEvents:"none" }}>As a</span>
          <input className="inp" placeholder="registered user, project manager..."
            value={storyForm.asA} onChange={(e) => setStoryForm({ ...storyForm, asA:e.target.value })} style={{ width:"100%", paddingLeft:52 }} />
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <div className="inp-label">I want… *</div>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:11, color:"var(--green)", fontWeight:600, pointerEvents:"none" }}>I want</span>
          <input className="inp" placeholder="to log in with my Google account..."
            value={storyForm.iWant} onChange={(e) => setStoryForm({ ...storyForm, iWant:e.target.value })} style={{ width:"100%", paddingLeft:56 }} />
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <div className="inp-label">So that…</div>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:11, color:"var(--amber)", fontWeight:600, pointerEvents:"none" }}>So that</span>
          <input className="inp" placeholder="I don't have to remember a password..."
            value={storyForm.soThat} onChange={(e) => setStoryForm({ ...storyForm, soThat:e.target.value })} style={{ width:"100%", paddingLeft:62 }} />
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div className="inp-label">Acceptance Criteria</div>
        <textarea className="inp"
          placeholder={"Given I am on the login page\nWhen I click Sign in with Google\nThen I should be redirected to the dashboard"}
          value={storyForm.acceptance} onChange={(e) => setStoryForm({ ...storyForm, acceptance:e.target.value })}
          rows={3} style={{ width:"100%", resize:"vertical", lineHeight:1.6, fontFamily:"'DM Mono', monospace", fontSize:12 }} />
      </div>

      <div style={{ marginBottom:16 }}>
        <div className="inp-label">Story Points</div>
        <div style={{ display:"flex", gap:8 }}>
          {["1","2","3","5","8","13"].map((pt) => (
            <button key={pt} onClick={() => setStoryForm({ ...storyForm, points:pt })}
              style={{ flex:1, padding:"8px 4px", borderRadius:"var(--radius-sm)", cursor:"pointer", transition:"all .15s",
                border:     storyForm.points===pt?"1px solid var(--accent)"  :"1px solid var(--border2)",
                background: storyForm.points===pt?"var(--accent-bg)"         :"transparent",
                color:      storyForm.points===pt?"var(--accent2)"           :"var(--text3)",
                fontWeight: storyForm.points===pt?700:400, fontSize:13 }}>
              {pt}
            </button>
          ))}
        </div>
      </div>

      <button className="tbtn primary"
        style={{ width:"100%", justifyContent:"center", padding:"10px", background:"var(--green)", borderColor:"var(--green)" }}
        onClick={onSubmit} disabled={saving}>
        {saving?"Saving…":(submitLabel||"+ Create User Story")}
      </button>
    </div>
  );
}