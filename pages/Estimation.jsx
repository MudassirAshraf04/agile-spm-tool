import { useState, useEffect } from "react";
import api from "../src/services/api";

const fibCards    = ["0","½","1","2","3","5","8","13","21","?"];
const tshirtSizes = [
  { size:"XS", pts:1, cls:"sel-xs" },{ size:"S", pts:2, cls:"sel-s" },
  { size:"M",  pts:3, cls:"sel-m"  },{ size:"L", pts:5, cls:"sel-l" },
  { size:"XL", pts:8, cls:"sel-xl" },
];
const TABS = [
  { id:"poker",   label:"Planning Poker"  },
  { id:"tshirt",  label:"T-Shirt Sizing"  },
  { id:"analogy", label:"Analogy-Based"   },
  { id:"proxy",   label:"Proxy-Based"     },
  { id:"pert",    label:"PERT Calculator" },
];
const steps = [
  { icon:"📋", label:"Select\nUser Story",  done:true,  active:false },
  { icon:"🎯", label:"Choose\nMethod",      done:false, active:true  },
  { icon:"🗳",  label:"Team\nEstimates",    done:false, active:false },
  { icon:"🤝", label:"Reach\nConsensus",   done:false, active:false },
  { icon:"✅", label:"Save to\nBacklog",   done:false, active:false },
];
const proxyRows = [
  { type:"Screens / Pages",   count:6,  hrs:8 },
  { type:"API Endpoints",     count:10, hrs:3 },
  { type:"Database Tables",   count:5,  hrs:2 },
  { type:"User Roles",        count:3,  hrs:4 },
  { type:"Report Types",      count:2,  hrs:5 },
];

export default function Estimation() {
  const [activeTab,     setActiveTab]     = useState("poker");
  const [selectedCard,  setSelectedCard]  = useState("3");
  const [selectedSize,  setSelectedSize]  = useState("M");
  const [selectedRef,   setSelectedRef]   = useState(0);
  const [comparison,    setComparison]    = useState("Slightly Larger");
  const [pertO, setPertO] = useState(2);
  const [pertM, setPertM] = useState(4);
  const [pertP, setPertP] = useState(9);
  const [stories,       setStories]       = useState([]);
  const [estimations,   setEstimations]   = useState([]);
  const [selectedStory, setSelectedStory] = useState("");
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [error,         setError]         = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storyData, estData] = await Promise.all([
          api.stories.getAll(),
          api.estimations.getAll(),
        ]);
        setStories(storyData);
        setEstimations(estData);
        if (storyData.length > 0) setSelectedStory(storyData[0]._id);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const pertEst    = ((pertO + 4*pertM + pertP)/6).toFixed(1);
  const pertSD     = ((pertP - pertO)/6).toFixed(1);
  const totalProxy = proxyRows.reduce((a,r) => a + r.count*r.hrs, 0);
  const analogySuggested =
    comparison === "Much Smaller" ? (stories[selectedRef]?.points||5) - 2 :
    comparison === "Similar"      ? (stories[selectedRef]?.points||5) :
                                    (stories[selectedRef]?.points||5) + 3;

  const saveEstimation = async (method, result, details) => {
    setSaving(true); setError("");
    try {
      const est = await api.estimations.create({
        story: selectedStory || undefined, method, result: Number(result), details,
      });
      setEstimations((prev) => [est, ...prev]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (selectedStory) await api.stories.update(selectedStory, { points: Number(result) });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const StorySelector = () => (
    <div style={{ marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
      <div className="inp-label" style={{ marginBottom:0, whiteSpace:"nowrap" }}>Estimating:</div>
      <select className="inp" style={{ flex:1 }} value={selectedStory} onChange={(e) => setSelectedStory(e.target.value)}>
        <option value="">— No story (standalone) —</option>
        {stories.map((s) => <option key={s._id} value={s._id}>{s.storyId} · {s.iWant?.slice(0,50)}</option>)}
      </select>
    </div>
  );

  const SaveFeedback = () => (
    <>
      {saved && <div style={{ color:"var(--green)", fontSize:12, marginTop:8, textAlign:"center" }}>✓ Estimation saved!</div>}
      {error && <div style={{ color:"var(--red)",   fontSize:12, marginTop:8, textAlign:"center" }}>⚠ {error}</div>}
    </>
  );

  return (
    <div>
      <div className="card">
        <div className="card-head"><div className="card-title">How Estimation Works — Process Flow</div></div>
        <div className="process-steps">
          {steps.map((s,i) => (
            <div key={i} className="process-step">
              <div className={`step-circle${s.done?" done":s.active?" active-step":""}`}>{s.icon}</div>
              <div className="step-label" style={{ whiteSpace:"pre-line" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => <button key={t.id} className={`tab${activeTab===t.id?" active":""}`} onClick={()=>setActiveTab(t.id)}>{t.label}</button>)}
      </div>

      {/* PLANNING POKER */}
      {activeTab==="poker" && (
        <div className="two-col">
          <div className="card">
            <StorySelector />
            <div className="card-head"><div><div className="card-title">Planning Poker</div></div></div>
            <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>Fibonacci cards — click to select</div>
            <div className="poker-grid">
              {fibCards.map((c) => <div key={c} className={`pcard${selectedCard===c?" sel":""}`} onClick={()=>setSelectedCard(c)}>{c}</div>)}
            </div>
            <div style={{ background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:8, padding:14, textAlign:"center", marginBottom:12 }}>
              <div style={{ fontSize:10, color:"var(--accent2)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Your Estimate</div>
              <div style={{ fontSize:34, fontWeight:700, color:"var(--accent2)" }}>{selectedCard} pts</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="tbtn" style={{ flex:1, justifyContent:"center" }} onClick={()=>setSelectedCard("3")}>Reset</button>
              <button className="tbtn primary" style={{ flex:1, justifyContent:"center" }} disabled={saving}
                onClick={()=>saveEstimation("planning_poker", isNaN(selectedCard)?0:Number(selectedCard), { card:selectedCard })}>
                {saving?"Saving…":"✓ Confirm & Save"}
              </button>
            </div>
            <SaveFeedback />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Planning Poker History</div></div>
            {estimations.filter((e)=>e.method==="planning_poker").slice(0,5).map((e,i)=>(
              <div key={i} className="story-row">
                <div className="pts-badge">{e.result}</div>
                <div style={{ flex:1 }}>
                  <div className="story-title">{e.story?.iWant||"Standalone estimate"}</div>
                  <div className="story-meta">Card: {e.details?.card||e.result}</div>
                </div>
              </div>
            ))}
            {estimations.filter((e)=>e.method==="planning_poker").length===0 && (
              <div style={{ textAlign:"center", padding:"24px 0", color:"var(--text3)", fontSize:13 }}>No poker estimations saved yet</div>
            )}
          </div>
        </div>
      )}

      {/* T-SHIRT */}
      {activeTab==="tshirt" && (
        <div className="two-col">
          <div className="card">
            <StorySelector />
            <div className="card-head"><div><div className="card-title">T-Shirt Sizing</div><div className="card-sub">Quick category-based estimation</div></div></div>
            <div className="tshirt-row" style={{ marginBottom:14 }}>
              {tshirtSizes.map((s)=><div key={s.size} className={`tsz${selectedSize===s.size?" "+s.cls:""}`} onClick={()=>setSelectedSize(s.size)}>{s.size}</div>)}
            </div>
            <div style={{ background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:8, padding:12, textAlign:"center", marginBottom:12 }}>
              <div style={{ fontSize:10, color:"var(--accent2)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Converted to Story Points</div>
              <div style={{ fontSize:28, fontWeight:700, color:"var(--accent2)" }}>
                {selectedSize} = {tshirtSizes.find((s)=>s.size===selectedSize)?.pts} pts
              </div>
            </div>
            <button className="tbtn primary" style={{ width:"100%", justifyContent:"center" }} disabled={saving}
              onClick={()=>saveEstimation("tshirt", tshirtSizes.find((s)=>s.size===selectedSize)?.pts||3, { size:selectedSize })}>
              {saving?"Saving…":"✓ Save Estimation"}
            </button>
            <SaveFeedback />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">T-Shirt History</div></div>
            {estimations.filter((e)=>e.method==="tshirt").slice(0,5).map((e,i)=>(
              <div key={i} className="story-row">
                <div className="pts-badge" style={{ fontSize:10 }}>{e.details?.size||"M"}</div>
                <div className="story-title">{e.story?.iWant||"Standalone estimate"}</div>
                <span style={{ fontSize:12, fontWeight:700, color:"var(--accent2)" }}>{e.result} pt</span>
              </div>
            ))}
            {estimations.filter((e)=>e.method==="tshirt").length===0 && (
              <div style={{ textAlign:"center", padding:"24px 0", color:"var(--text3)", fontSize:13 }}>No T-Shirt estimations saved yet</div>
            )}
          </div>
        </div>
      )}

      {/* ANALOGY */}
      {activeTab==="analogy" && (
        <div className="two-col">
          <div className="card">
            <StorySelector />
            <div className="card-head"><div><div className="card-title">Analogy-Based</div><div className="card-sub">Compare to a known reference story</div></div></div>
            <div className="inp-label">Pick a reference story from your backlog</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
              {stories.slice(0,5).map((r,i)=>(
                <div key={i} className={`ref-card${selectedRef===i?" sel":""}`} onClick={()=>setSelectedRef(i)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13, color:"var(--text)", fontWeight:500 }}>{r.iWant?.slice(0,40)}</span>
                    <span className="pill pill-purple">{r.points} pts</span>
                  </div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:3 }}>{r.storyId}{selectedRef===i?" · Selected":""}</div>
                </div>
              ))}
              {stories.length===0 && <div style={{ textAlign:"center", padding:16, color:"var(--text3)", fontSize:13 }}>No stories yet</div>}
            </div>
            <div className="inp-label">Compared to reference, this story is…</div>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              {["Much Smaller","Similar","Slightly Larger"].map((c)=>(
                <button key={c} className={comparison===c?"tbtn primary":"tbtn"} style={{ flex:1, justifyContent:"center", fontSize:12 }} onClick={()=>setComparison(c)}>{c}</button>
              ))}
            </div>
            <div className="pert-result" style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--green)" }}>Suggested: {analogySuggested} pts</div>
            </div>
            <button className="tbtn primary" style={{ width:"100%", justifyContent:"center" }} disabled={saving}
              onClick={()=>saveEstimation("analogy", Math.max(1,analogySuggested), { comparison, referenceStory:stories[selectedRef]?.storyId })}>
              {saving?"Saving…":"✓ Save Estimation"}
            </button>
            <SaveFeedback />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">How Analogy-Based Works</div></div>
            {[
              { step:"1", title:"Build a reference library", desc:"Keep a list of already-estimated stories the team agreed on.", accent:"var(--accent)" },
              { step:"2", title:"Pick the closest reference", desc:"Choose the story most similar in size and complexity.", accent:"var(--accent)" },
              { step:"3", title:"Adjust and confirm", desc:"Decide if the new story is smaller, same, or larger.", accent:"var(--green)" },
            ].map((s)=>(
              <div key={s.step} style={{ padding:12, background:"var(--surface2)", borderRadius:8, borderLeft:`3px solid ${s.accent}`, marginBottom:10 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", marginBottom:4 }}>Step {s.step} — {s.title}</div>
                <div style={{ fontSize:12, color:"var(--text3)" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROXY */}
      {activeTab==="proxy" && (
        <div className="two-col">
          <div className="card">
            <StorySelector />
            <div className="card-head"><div><div className="card-title">Proxy-Based Estimation</div><div className="card-sub">Count measurable units to estimate effort</div></div></div>
            <table className="proxy-table">
              <thead><tr><th>Proxy Type</th><th>Count</th><th>Hrs/Unit</th><th>Total Hrs</th></tr></thead>
              <tbody>
                {proxyRows.map((r)=>(
                  <tr key={r.type}>
                    <td>{r.type}</td>
                    <td><input type="number" defaultValue={r.count} className="inp" style={{ width:60, padding:"4px 8px" }}/></td>
                    <td style={{ color:"var(--text3)" }}>{r.hrs}h</td>
                    <td>{r.count*r.hrs}h</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={3}>Total estimated effort</td><td style={{ color:"var(--green)", fontSize:16 }}>{totalProxy}h</td></tr></tfoot>
            </table>
            <button className="tbtn primary" style={{ width:"100%", justifyContent:"center", marginTop:12 }} disabled={saving}
              onClick={()=>saveEstimation("proxy", Math.ceil(totalProxy/8), { totalHours:totalProxy })}>
              {saving?"Saving…":"✓ Save Estimation"}
            </button>
            <SaveFeedback />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Effort Breakdown</div></div>
            {proxyRows.map((r,i)=>{
              const colors=["var(--accent)","var(--blue)","var(--green)","var(--amber)","var(--pink)"];
              const pct=Math.round((r.count*r.hrs/totalProxy)*100);
              return (
                <div key={r.type} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                    <span style={{ color:"var(--text2)" }}>{r.type}</span>
                    <span style={{ color:"var(--text)", fontWeight:600 }}>{r.count*r.hrs}h ({pct}%)</span>
                  </div>
                  <div className="progress-wrap"><div className="progress-fill" style={{ width:`${pct}%`, background:colors[i] }}/></div>
                </div>
              );
            })}
            <div style={{ background:"var(--green-bg)", border:"1px solid rgba(61,214,140,.2)", borderRadius:8, padding:12, textAlign:"center", marginTop:14 }}>
              <div style={{ fontSize:11, color:"var(--green)", marginBottom:3 }}>Total = {totalProxy} hours ≈</div>
              <div style={{ fontSize:22, fontWeight:700, color:"var(--green)" }}>~{Math.ceil(totalProxy/8)} working days</div>
            </div>
          </div>
        </div>
      )}

      {/* PERT CALCULATOR */}
      {activeTab==="pert" && (
        <div className="two-col">
          <div className="card">
            <StorySelector />
            <div className="card-head"><div><div className="card-title">PERT Calculator</div><div className="card-sub">Program Evaluation and Review Technique</div></div></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
              {[{label:"Optimistic (O)",val:pertO,set:setPertO},{label:"Most Likely (M)",val:pertM,set:setPertM},{label:"Pessimistic (P)",val:pertP,set:setPertP}].map((f)=>(
                <div key={f.label}><div className="inp-label">{f.label}</div><input type="number" value={f.val} onChange={(e)=>f.set(Number(e.target.value))} className="inp"/></div>
              ))}
            </div>
            <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:12, marginBottom:12, fontFamily:"'DM Mono',monospace", fontSize:12, color:"var(--text3)", lineHeight:1.8 }}>
              PERT = (O + 4M + P) / 6<br/>
              <span style={{ color:"var(--text)" }}>= ({pertO} + {4*pertM} + {pertP}) / 6 = <span style={{ color:"var(--accent2)", fontWeight:700 }}>{pertEst} days</span></span><br/>
              Std Dev = (P − O) / 6 = <span style={{ color:"var(--green)" }}>± {pertSD} days</span>
            </div>
            <div className="pert-result" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color:"var(--green)", marginBottom:2 }}>PERT Estimate</div>
                <div style={{ fontSize:24, fontWeight:700, color:"var(--green)" }}>{pertEst} days</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:"var(--text3)" }}>Std Deviation</div>
                <div style={{ fontSize:16, fontWeight:700, color:"var(--text2)" }}>± {pertSD}</div>
              </div>
            </div>
            <button className="tbtn primary" style={{ width:"100%", justifyContent:"center" }} disabled={saving}
              onClick={()=>saveEstimation("pert", Number(pertEst), { optimistic:pertO, mostLikely:pertM, pessimistic:pertP, stdDev:Number(pertSD) })}>
              {saving?"Saving…":"✓ Save to Backlog"}
            </button>
            <SaveFeedback />
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">PERT History</div><span className="pill pill-gray">{estimations.filter((e)=>e.method==="pert").length} saved</span></div>
            {estimations.filter((e)=>e.method==="pert").slice(0,6).map((e,i)=>(
              <div key={i} className="story-row">
                <div className="pts-badge" style={{ fontSize:10, fontFamily:"'DM Mono',monospace" }}>{e.result}d</div>
                <div>
                  <div className="story-title">{e.story?.iWant||"Standalone estimate"}</div>
                  <div className="story-meta" style={{ fontFamily:"'DM Mono',monospace" }}>
                    O:{e.details?.optimistic||"?"} M:{e.details?.mostLikely||"?"} P:{e.details?.pessimistic||"?"}
                    {e.details?.stdDev?` · σ ±${e.details.stdDev}`:""}
                  </div>
                </div>
              </div>
            ))}
            {estimations.filter((e)=>e.method==="pert").length===0 && (
              <div style={{ textAlign:"center", padding:"24px 0", color:"var(--text3)", fontSize:13 }}>No PERT estimations saved yet</div>
            )}
            {estimations.filter((e)=>e.method==="pert").length>0 && (
              <div style={{ background:"var(--surface2)", borderRadius:8, padding:12, textAlign:"center", marginTop:10 }}>
                <div style={{ fontSize:11, color:"var(--text3)" }}>Total PERT estimate</div>
                <div style={{ fontSize:20, fontWeight:700, color:"var(--accent2)" }}>
                  {estimations.filter((e)=>e.method==="pert").reduce((a,e)=>a+e.result,0).toFixed(1)} days
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}