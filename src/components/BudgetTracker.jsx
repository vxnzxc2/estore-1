import { useState, useEffect } from "react"

const CATS = ["Food","Transport","Utilities","Shopping","Health","Entertainment","Savings","Other"]
const CAT_ICONS = {
  Food:"ti-salad",Transport:"ti-car",Utilities:"ti-bolt",Shopping:"ti-shopping-bag",
  Health:"ti-heart-rate-monitor",Entertainment:"ti-device-tv",Savings:"ti-piggy-bank",Other:"ti-dots"
}
const CAT_COLORS = {
  Food:"#1D9E75",Transport:"#378ADD",Utilities:"#EF9F27",Shopping:"#D4537E",
  Health:"#E24B4A",Entertainment:"#7F77DD",Savings:"#639922",Other:"#888780"
}

function getWeekKey(d = new Date()) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d); mon.setDate(diff); mon.setHours(0,0,0,0)
  return `week-${mon.toISOString().slice(0,10)}`
}
function getMonthKey(d = new Date()) { return `month-${d.getFullYear()}-${d.getMonth()+1}` }
function weekLabel(key) {
  const date = new Date(key.replace("week-",""))
  const end = new Date(date); end.setDate(end.getDate()+6)
  const fmt = dt => dt.toLocaleDateString("en-PH",{month:"short",day:"numeric"})
  return `${fmt(date)} – ${fmt(end)}`
}
function monthLabel(key) {
  const [,y,m] = key.split("-")
  return new Date(y,m-1,1).toLocaleDateString("en-PH",{month:"long",year:"numeric"})
}

export default function BudgetTracker() {
  const [tab, setTab] = useState("week")
  const [data, setData] = useState({})
  const [loaded, setLoaded] = useState(false)

  const [showSetBudget, setShowSetBudget] = useState(false)
  const [showAddExp, setShowAddExp] = useState(false)

  const [budgetInput, setBudgetInput] = useState("")
  const [expAmt, setExpAmt] = useState("")
  const [expCat, setExpCat] = useState("Food")
  const [expNote, setExpNote] = useState("")

  const currentKey = tab === "week" ? getWeekKey() : getMonthKey()

  useEffect(() => {
    async function load() {
      try {
        const r = await window.storage.get("budget-data")
        if (r) setData(JSON.parse(r.value))
      } catch {}
      setLoaded(true)
    }
    load()
  }, [])

  async function save(next) {
    setData(next)
    try { await window.storage.set("budget-data", JSON.stringify(next)) } catch {}
  }

  function getPeriod(key) {
    return data[key] || { budget: 0, expenses: [] }
  }

  const period = getPeriod(currentKey)
  const total = period.expenses.reduce((s,e) => s+e.amount, 0)
  const remaining = period.budget - total
  const pct = period.budget > 0 ? Math.min(100, Math.round((total/period.budget)*100)) : 0

  function handleSetBudget() {
    const val = parseFloat(budgetInput)
    if (!val || val <= 0) return
    const next = { ...data, [currentKey]: { ...getPeriod(currentKey), budget: val } }
    save(next)
    setBudgetInput("")
    setShowSetBudget(false)
  }

  function handleAddExp() {
    const val = parseFloat(expAmt)
    if (!val || val <= 0) return
    const exp = { id: Date.now(), amount: val, category: expCat, note: expNote.trim(), date: new Date().toISOString() }
    const p = getPeriod(currentKey)
    const next = { ...data, [currentKey]: { ...p, expenses: [exp, ...p.expenses] } }
    save(next)
    setExpAmt(""); setExpNote(""); setExpCat("Food")
    setShowAddExp(false)
  }

  function deleteExp(id) {
    const p = getPeriod(currentKey)
    const next = { ...data, [currentKey]: { ...p, expenses: p.expenses.filter(e => e.id !== id) } }
    save(next)
  }

  const byCategory = CATS.map(cat => ({
    cat,
    total: period.expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0)
  })).filter(x=>x.total>0)

  const allKeys = Object.keys(data).filter(k=>k.startsWith(tab==="week"?"week-":"month-"))
    .filter(k=>k!==currentKey).sort().reverse().slice(0,4)

  if (!loaded) return <div style={{padding:"2rem",color:"var(--color-text-secondary)",fontSize:14}}>Loading…</div>

  const barColor = pct >= 90 ? "#E24B4A" : pct >= 70 ? "#EF9F27" : "#1D9E75"

  return (
    <div style={{fontFamily:"var(--font-sans)",padding:"1rem 0"}}>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem",flexWrap:"wrap",gap:8}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:500,color:"var(--color-text-primary)"}}>Budget tracker</h2>
          <p style={{margin:"2px 0 0",fontSize:13,color:"var(--color-text-secondary)"}}>
            {tab==="week" ? weekLabel(currentKey) : monthLabel(currentKey)}
          </p>
        </div>
        <div style={{display:"flex",gap:6}}>
          <div style={{display:"flex",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:3,border:"0.5px solid var(--color-border-tertiary)"}}>
            {["week","month"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"5px 14px",borderRadius:6,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,
                background:tab===t?"var(--color-background-primary)":"transparent",
                color:tab===t?"var(--color-text-primary)":"var(--color-text-secondary)",
                boxShadow:tab===t?"0 0 0 0.5px var(--color-border-secondary)":"none",
                transition:"all .15s"
              }}>{t==="week"?"Weekly":"Monthly"}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"1.25rem",marginBottom:"1rem"}}>
        {period.budget > 0 ? (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
              <div>
                <p style={{margin:0,fontSize:12,color:"var(--color-text-secondary)"}}>Budget</p>
                <p style={{margin:"2px 0 0",fontSize:22,fontWeight:500,color:"var(--color-text-primary)"}}>₱{period.budget.toLocaleString()}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{margin:0,fontSize:12,color:"var(--color-text-secondary)"}}>Remaining</p>
                <p style={{margin:"2px 0 0",fontSize:22,fontWeight:500,color:remaining<0?"#E24B4A":remaining<period.budget*0.2?"#EF9F27":"#1D9E75"}}>
                  {remaining<0?"-":""}₱{Math.abs(remaining).toLocaleString()}
                </p>
              </div>
            </div>
            <div style={{background:"var(--color-background-secondary)",borderRadius:99,height:8,overflow:"hidden"}}>
              <div style={{height:8,width:`${pct}%`,background:barColor,borderRadius:99,transition:"width .4s ease"}} />
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <p style={{margin:0,fontSize:11,color:"var(--color-text-secondary)"}}>₱{total.toLocaleString()} spent</p>
              <p style={{margin:0,fontSize:11,color:pct>=90?"#E24B4A":pct>=70?"#EF9F27":"var(--color-text-secondary)"}}>{pct}%</p>
            </div>
            <button onClick={()=>setShowSetBudget(true)} style={{marginTop:10,fontSize:12,color:"var(--color-text-secondary)",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>
              Edit budget
            </button>
          </>
        ) : (
          <div style={{textAlign:"center",padding:"0.5rem 0"}}>
            <i className="ti ti-coin" style={{fontSize:32,color:"var(--color-text-secondary)"}} aria-hidden />
            <p style={{margin:"8px 0 4px",fontSize:15,fontWeight:500,color:"var(--color-text-primary)"}}>No budget set</p>
            <p style={{margin:"0 0 12px",fontSize:13,color:"var(--color-text-secondary)"}}>Set a budget for this {tab} to start tracking</p>
            <button onClick={()=>setShowSetBudget(true)} style={{
              background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-secondary)",
              borderRadius:"var(--border-radius-md)",padding:"8px 20px",cursor:"pointer",fontSize:13,fontWeight:500,
              color:"var(--color-text-primary)"
            }}>Set budget</button>
          </div>
        )}
      </div>

      {showSetBudget && (
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-lg)",padding:"1rem",marginBottom:"1rem"}}>
          <p style={{margin:"0 0 10px",fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>
            Set {tab==="week"?"weekly":"monthly"} budget
          </p>
          <div style={{display:"flex",gap:8}}>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"var(--color-text-secondary)"}}>₱</span>
              <input type="number" placeholder="0.00" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSetBudget()}
                style={{paddingLeft:24,width:"100%",boxSizing:"border-box"}} autoFocus />
            </div>
            <button onClick={handleSetBudget} style={{padding:"0 16px",background:"#1D9E75",color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:13,fontWeight:500}}>Save</button>
            <button onClick={()=>{setShowSetBudget(false);setBudgetInput("")}} style={{padding:"0 12px",background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary)"}}>Cancel</button>
          </div>
        </div>
      )}

      <button onClick={()=>setShowAddExp(o=>!o)} style={{
        width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        padding:"10px",marginBottom:"1rem",
        background:"var(--color-background-primary)",border:"0.5px dashed var(--color-border-secondary)",
        borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:13,fontWeight:500,
        color:"var(--color-text-secondary)",transition:"all .15s"
      }}>
        <i className="ti ti-plus" style={{fontSize:15}} aria-hidden /> Add expense
      </button>

      {showAddExp && (
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-lg)",padding:"1rem",marginBottom:"1rem"}}>
          <p style={{margin:"0 0 12px",fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>New expense</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"var(--color-text-secondary)"}}>₱</span>
              <input type="number" placeholder="Amount" value={expAmt} onChange={e=>setExpAmt(e.target.value)}
                style={{paddingLeft:24,width:"100%",boxSizing:"border-box"}} autoFocus />
            </div>
            <select value={expCat} onChange={e=>setExpCat(e.target.value)} style={{width:"100%"}}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <input type="text" placeholder="Note (optional)" value={expNote} onChange={e=>setExpNote(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleAddExp()}
            style={{width:"100%",boxSizing:"border-box",marginBottom:8}} />
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleAddExp} style={{flex:1,padding:"8px 0",background:"#1D9E75",color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:13,fontWeight:500}}>Add expense</button>
            <button onClick={()=>{setShowAddExp(false);setExpAmt("");setExpNote("");setExpCat("Food")}} style={{padding:"8px 14px",background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:13,color:"var(--color-text-secondary)"}}>Cancel</button>
          </div>
        </div>
      )}

      {byCategory.length > 0 && (
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"1rem",marginBottom:"1rem"}}>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"}}>By category</p>
          {byCategory.map(({cat,total:ct})=>(
            <div key={cat} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:28,height:28,borderRadius:8,background:CAT_COLORS[cat]+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <i className={`ti ${CAT_ICONS[cat]}`} style={{fontSize:14,color:CAT_COLORS[cat]}} aria-hidden />
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,color:"var(--color-text-primary)"}}>
                    {cat} <span style={{fontSize:11,color:"var(--color-text-secondary)"}}>{period.budget>0?`${Math.round(ct/period.budget*100)}%`:""}</span>
                  </span>
                  <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-primary)"}}>₱{ct.toLocaleString()}</span>
                </div>
                <div style={{height:4,background:"var(--color-background-secondary)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:4,width:period.budget>0?`${Math.min(100,ct/period.budget*100)}%`:"0%",background:CAT_COLORS[cat],borderRadius:99}} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {period.expenses.length > 0 && (
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"1rem",marginBottom:"1rem"}}>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"}}>Expenses</p>
          {period.expenses.map((e,i)=>(
            <div key={e.id} style={{
              display:"flex",alignItems:"center",gap:10,padding:"8px 0",
              borderTop:i>0?"0.5px solid var(--color-border-tertiary)":"none"
            }}>
              <div style={{width:28,height:28,borderRadius:8,background:CAT_COLORS[e.category]+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <i className={`ti ${CAT_ICONS[e.category]}`} style={{fontSize:14,color:CAT_COLORS[e.category]}} aria-hidden />
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontSize:13,color:"var(--color-text-primary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {e.note||e.category}
                </p>
                <p style={{margin:0,fontSize:11,color:"var(--color-text-secondary)"}}>
                  {e.category} · {new Date(e.date).toLocaleDateString("en-PH",{month:"short",day:"numeric"})}
                </p>
              </div>
              <span style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",flexShrink:0}}>₱{e.amount.toLocaleString()}</span>
              <button onClick={()=>deleteExp(e.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:"var(--color-text-secondary)",display:"flex",alignItems:"center",opacity:.5}} title="Delete">
                <i className="ti ti-trash" style={{fontSize:14}} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {allKeys.length > 0 && (
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"1rem"}}>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:500,color:"var(--color-text-secondary)"}}>Past {tab==="week"?"weeks":"months"}</p>
          {allKeys.map((k,i)=>{
            const p=getPeriod(k)
            const t=p.expenses.reduce((s,e)=>s+e.amount,0)
            const pct2=p.budget>0?Math.min(100,Math.round(t/p.budget*100)):0
            const clr=pct2>=90?"#E24B4A":pct2>=70?"#EF9F27":"#1D9E75"
            return (
              <div key={k} style={{padding:"10px 0",borderTop:i>0?"0.5px solid var(--color-border-tertiary)":"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"var(--color-text-primary)"}}>{tab==="week"?weekLabel(k):monthLabel(k)}</span>
                  <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)"}}>
                    ₱{t.toLocaleString()} {p.budget>0?`/ ₱${p.budget.toLocaleString()}`:""}
                  </span>
                </div>
                {p.budget>0&&(
                  <div style={{height:3,background:"var(--color-background-secondary)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:3,width:`${pct2}%`,background:clr,borderRadius:99}} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {period.expenses.length===0&&!showAddExp&&period.budget===0&&(
        <div style={{textAlign:"center",padding:"1rem 0",color:"var(--color-text-secondary)",fontSize:13}}>
          Start by setting a budget above, then log your expenses.
        </div>
      )}
    </div>
  )
}
