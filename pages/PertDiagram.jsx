import { useState, useEffect } from "react";
import api from "../src/services/api";

export default function PertDiagram() {
  const [estimations, setEstimations] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const estData = await api.estimations.getAll();
        setEstimations(estData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const pertEstimations = estimations.filter((e) => e.method === "pert");
  const criticalPts     = pertEstimations.filter((_, i) => i % 2 === 0);
  const normalPts       = pertEstimations.filter((_, i) => i % 2 !== 0);
  const criticalTotal   = criticalPts.reduce((a, e) => a + e.result, 0);
  const normalTotal     = normalPts.reduce((a, e) => a + e.result, 0);

  const pertTable = pertEstimations.slice(0, 6).map((est, i) => ({
    n:    String.fromCharCode(66 + i),
    task: est.story?.iWant ? est.story.iWant.slice(0, 22) + (est.story.iWant.length > 22 ? "…" : "") : `Task ${i + 1}`,
    o:    est.details?.optimistic  || 0,
    m:    est.details?.mostLikely  || est.result,
    p:    est.details?.pessimistic || 0,
    est:  `${est.result}d`,
    crit: i % 2 === 0,
  }));

  const staticNodes = [
    { x: 10,  y: 56,  w: 80,  id: "A", name: "Start",       days: "0d",     critical: true  },
    { x: 205, y: 56,  w: 100, id: "B", name: "Design",       days: "5 days", critical: true  },
    { x: 205, y: 176, w: 100, id: "C", name: "Research",     days: "6 days", critical: false },
    { x: 415, y: 56,  w: 100, id: "D", name: "Development",  days: "8 days", critical: true  },
    { x: 415, y: 110, w: 100, id: "E", name: "Testing",      days: "5 days", critical: false },
    { x: 605, y: 56,  w: 85,  id: "F", name: "Release",      days: "3 days", critical: true  },
  ];

  if (loading) return (
    <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--text3)" }}>Loading PERT diagram…</div>
  );

  if (pertEstimations.length === 0) return (
    <div>
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>◎</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>No PERT Estimations Yet</div>
        <div style={{ fontSize: 13, color: "var(--text3)" }}>
          Go to <strong style={{ color: "var(--accent2)" }}>Estimation → PERT Calculator</strong> and save estimations to see the network diagram here.
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div><div className="card-title">Example PERT Network Diagram</div><div className="card-sub">Save PERT estimations to populate with your real data</div></div>
        </div>
        <svg viewBox="0 0 700 280" style={{ width: "100%", overflow: "visible", display: "block" }}>
          <defs>
            <marker id="an" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#7C6FF7" strokeWidth="1.5" strokeLinejoin="round"/></marker>
            <marker id="ac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#F06565" strokeWidth="1.5" strokeLinejoin="round"/></marker>
          </defs>
          <line x1="90" y1="80"  x2="205" y2="80"  stroke="#F06565" strokeWidth="2" markerEnd="url(#ac)"/>
          <line x1="305" y1="80"  x2="415" y2="80"  stroke="#F06565" strokeWidth="2" markerEnd="url(#ac)"/>
          <line x1="515" y1="80"  x2="605" y2="80"  stroke="#F06565" strokeWidth="2" markerEnd="url(#ac)"/>
          <line x1="90" y1="100" x2="205" y2="195" stroke="#7C6FF7" strokeWidth="1.5" markerEnd="url(#an)"/>
          <line x1="305" y1="200" x2="415" y2="130" stroke="#7C6FF7" strokeWidth="1.5" markerEnd="url(#an)"/>
          <line x1="515" y1="130" x2="605" y2="100" stroke="#7C6FF7" strokeWidth="1.5" markerEnd="url(#an)"/>
          {staticNodes.map((n) => (
            <g key={n.id}>
              <rect x={n.x} y={n.y} width={n.w} height={48} rx="8"
                fill={n.critical ? "rgba(240,101,101,0.08)" : "rgba(124,111,247,0.08)"}
                stroke={n.critical ? "rgba(240,101,101,0.4)" : "rgba(124,111,247,0.3)"} strokeWidth="1.5"/>
              <text x={n.x+n.w/2} y={n.y+15} textAnchor="middle" fill={n.critical?"#F06565":"#A89CF7"} fontSize="9" fontWeight="700" fontFamily="monospace">{n.critical?"CRITICAL":"NORMAL"} — {n.id}</text>
              <text x={n.x+n.w/2} y={n.y+30} textAnchor="middle" fill="#F0EFF8" fontSize="12" fontWeight="600">{n.name}</text>
              <text x={n.x+n.w/2} y={n.y+43} textAnchor="middle" fill="#9895B0" fontSize="10">{n.days}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );

  return (
    <div>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">PERT Network Diagram</div>
            <div className="card-sub">Based on your saved PERT estimations</div>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text3)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 12, border: "1.5px solid var(--red)", borderRadius: 2, background: "var(--red-bg)", display: "inline-block" }}/> Critical Path
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 12, border: "1.5px solid var(--accent-border)", borderRadius: 2, background: "var(--accent-bg)", display: "inline-block" }}/> Normal
            </span>
          </div>
        </div>
        <svg viewBox="0 0 700 280" style={{ width: "100%", overflow: "visible", display: "block" }}>
          <defs>
            <marker id="an2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#7C6FF7" strokeWidth="1.5" strokeLinejoin="round"/></marker>
            <marker id="ac2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#F06565" strokeWidth="1.5" strokeLinejoin="round"/></marker>
          </defs>
          <line x1="90"  y1="80"  x2="195" y2="64"  stroke="#F06565" strokeWidth="2" markerEnd="url(#ac2)"/>
          <line x1="305" y1="64"  x2="415" y2="64"  stroke="#F06565" strokeWidth="2" markerEnd="url(#ac2)"/>
          <line x1="525" y1="64"  x2="610" y2="120" stroke="#F06565" strokeWidth="2" markerEnd="url(#ac2)"/>
          <line x1="90"  y1="96"  x2="195" y2="184" stroke="#7C6FF7" strokeWidth="1.5" markerEnd="url(#an2)"/>
          <line x1="305" y1="184" x2="415" y2="184" stroke="#7C6FF7" strokeWidth="1.5" markerEnd="url(#an2)"/>
          <line x1="525" y1="184" x2="610" y2="136" stroke="#7C6FF7" strokeWidth="1.5" markerEnd="url(#an2)"/>
          {[
            { x: 10,  y: 56,  w: 80,  id:"START", name:"Start", days:"0d",  critical:true  },
            ...pertEstimations.slice(0,4).map((est,i)=>({
              x:[195,195,415,415][i], y:[40,160,40,160][i], w:110,
              id: String.fromCharCode(66+i),
              name: (est.story?.iWant||`Task ${i+1}`).slice(0,12),
              days: `${est.result}d`,
              critical: i%2===0,
            })),
            { x: 610, y: 96, w: 80, id:"END", name:"End", days:"", critical:true },
          ].map((n) => (
            <g key={n.id}>
              <rect x={n.x} y={n.y} width={n.w} height={48} rx="8"
                fill={n.critical?"rgba(240,101,101,0.08)":"rgba(124,111,247,0.08)"}
                stroke={n.critical?"rgba(240,101,101,0.4)":"rgba(124,111,247,0.3)"} strokeWidth="1.5"/>
              <text x={n.x+n.w/2} y={n.y+14} textAnchor="middle" fill={n.critical?"#F06565":"#A89CF7"} fontSize="8" fontWeight="700" fontFamily="monospace">{n.critical?"CRITICAL":"NORMAL"} — {n.id}</text>
              <text x={n.x+n.w/2} y={n.y+29} textAnchor="middle" fill="#F0EFF8" fontSize="11" fontWeight="600">{n.name}</text>
              <text x={n.x+n.w/2} y={n.y+42} textAnchor="middle" fill="#9895B0" fontSize="10">{n.days}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head"><div className="card-title">Path Analysis</div></div>
          <div style={{ background:"var(--red-bg)", border:"1px solid rgba(240,101,101,.2)", borderRadius:8, padding:14, marginBottom:10 }}>
            <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:".06em", color:"var(--red)", fontWeight:600, marginBottom:6 }}>Critical Path — Longest</div>
            <div style={{ fontSize:14, fontWeight:600, fontFamily:"'DM Mono',monospace", color:"var(--text)", marginBottom:4 }}>
              START → {criticalPts.map((_,i)=>String.fromCharCode(66+i*2)).join(" → ")} → END
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--red)" }}>{criticalTotal} days total</div>
            <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>No slack — any delay extends the project</div>
          </div>
          {normalPts.length > 0 && (
            <div style={{ background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:8, padding:14 }}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:".06em", color:"var(--accent2)", fontWeight:600, marginBottom:6 }}>Normal Path</div>
              <div style={{ fontSize:14, fontWeight:600, fontFamily:"'DM Mono',monospace", color:"var(--text)", marginBottom:4 }}>
                START → {normalPts.map((_,i)=>String.fromCharCode(67+i*2)).join(" → ")} → END
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:"var(--accent2)" }}>{normalTotal} days total</div>
              <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>{Math.max(0, criticalTotal-normalTotal)} days of float / slack available</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Node PERT Estimates</div></div>
          <table className="proxy-table">
            <thead><tr><th>Node</th><th>Task</th><th>O</th><th>M</th><th>P</th><th>PERT</th></tr></thead>
            <tbody>
              {pertTable.map((r) => (
                <tr key={r.n}>
                  <td style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:r.crit?"var(--red)":"var(--accent2)" }}>{r.n}</td>
                  <td style={{ color:"var(--text2)", fontSize:11 }}>{r.task}</td>
                  <td>{r.o}</td><td>{r.m}</td><td>{r.p}</td>
                  <td style={{ color:"var(--accent2)", fontWeight:700 }}>{r.est}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ background:"var(--surface2)", borderRadius:8, padding:12, textAlign:"center", marginTop:14 }}>
            <div style={{ fontSize:11, color:"var(--text3)" }}>Critical Path Duration</div>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--red)" }}>{criticalTotal} days</div>
          </div>
        </div>
      </div>
    </div>
  );
}