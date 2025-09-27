import React, { useMemo, useRef, useState } from "react";

/* ——— types ——— */
type QA = { question: string; options: string[]; correctIndex: number; explain?: string };
type Topic = "length" | "mass" | "volume" | "speed" | "area" | "temperature" | "time" | "data";

/* ——— utils ——— */
const rnd = (a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
const shuffle = <T,>(xs:T[])=>xs.map(v=>[v,Math.random()] as const).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
const fmt = (n:number)=>new Intl.NumberFormat("he-IL",{maximumFractionDigits:6}).format(n);

/* ——— question generators ——— */
function makeLinear(amount:number, from:{key:string;factor:number}, to:{key:string;factor:number}, label:string):QA{
  const ans=(amount*from.factor)/to.factor; const correct=fmt(ans);
  const delta=Math.max(Math.abs(ans)*0.15,0.1);
  const options=shuffle([correct,fmt(ans+delta),fmt(Math.max(ans-delta,0)),fmt(ans*1.5)]);
  return {question:`כמה הם ${fmt(amount)} ${from.key} ב־${to.key}?`,options,correctIndex:options.indexOf(correct),explain:`${label}: בסיס→יעד.`};
}
const L=[{k:"מ״מ",f:.001},{k:"ס״מ",f:.01},{k:"מטר",f:1},{k:"ק״מ",f:1000},{k:"אינץ׳",f:.0254},{k:"פיט",f:.3048},{k:"יארד",f:.9144},{k:"מייל",f:1609.344}];
const M=[{k:"מ״ג",f:1e-6},{k:"גרם",f:1e-3},{k:"ק״ג",f:1},{k:"טון",f:1000},{k:"אונקיה",f:.028349523125},{k:"פאונד",f:.45359237}];
const V=[{k:"מ״ל",f:.001},{k:"ליטר",f:1},{k:"מ״ק",f:1000},{k:"כפית (US)",f:.00492892159375},{k:"כף (US)",f:.01478676478125},{k:"כוס (US)",f:.2365882365},{k:"גלון (US)",f:3.785411784}];
const S=[{k:"קמ״ש",f:1000/3600},{k:"מ׳/ש׳",f:1},{k:"מייל/שעה",f:1609.344/3600},{k:"קשר",f:1852/3600}];
const A=[{k:"ממ״ר",f:1e-6},{k:"סמ״ר",f:1e-4},{k:"מ״ר",f:1},{k:"קמ״ר",f:1e6},{k:"אקר",f:4046.8564224},{k:"הקטר",f:10000}];

function gen(topic:Topic):QA{
  switch(topic){
    case "length":{const a=rnd(1,5000); const f=L[rnd(0,L.length-1)], t=L[rnd(0,L.length-1)]; return makeLinear(a,{key:f.k,factor:f.f},{key:t.k,factor:t.f},"אורך");}
    case "mass":  {const a=rnd(1,9000); const f=M[rnd(0,M.length-1)], t=M[rnd(0,M.length-1)]; return makeLinear(a,{key:f.k,factor:f.f},{key:t.k,factor:t.f},"מסה");}
    case "volume":{const a=rnd(1,2000); const f=V[rnd(0,V.length-1)], t=V[rnd(0,V.length-1)]; return makeLinear(a,{key:f.k,factor:f.f},{key:t.k,factor:t.f},"נפח");}
    case "speed": {const a=rnd(5,300);  const f=S[rnd(0,S.length-1)], t=S[rnd(0,S.length-1)]; return makeLinear(a,{key:f.k,factor:f.f},{key:t.k,factor:t.f},"מהירות");}
    case "area":  {const a=rnd(1,2_000_000); const f=A[rnd(0,A.length-1)], t=A[rnd(0,A.length-1)]; return makeLinear(a,{key:f.k,factor:f.f},{key:t.k,factor:t.f},"שטח");}
    case "temperature":{
      const x=rnd(-40,200); const T=["צלזיוס","פרנהייט","קלווין"] as const;
      const f=T[rnd(0,2)], t=T[rnd(0,2)];
      const toC=(v:number,u:typeof f)=>u==="צלזיוס"?v:u==="פרנהייט"?(v-32)*(5/9):v-273.15;
      const fromC=(v:number,u:typeof f)=>u==="צלזיוס"?v:u==="פרנהייט"?v*9/5+32:v+273.15;
      const y=fromC(toC(x,f),t); const correct=fmt(y);
      const options=shuffle([correct,fmt(y+10),fmt(y-10),fmt(y*1.1)]);
      return {question:`כמה הם ${fmt(x)} מעלות ${f} ב־${t}?`, options, correctIndex: options.indexOf(correct), explain:"טמפרטורה: מעבר לצלזיוס ואז ליעד."};
    }
    case "time":  {const a=rnd(1,20000); const U=[{k:"מילישניות",f:1e-3},{k:"שניות",f:1},{k:"דקות",f:60},{k:"שעות",f:3600},{k:"ימים",f:86400}];
      const f=U[rnd(0,U.length-1)], t=U[rnd(0,U.length-1)]; return makeLinear(a,{key:f.k,factor:f.f},{key:t.k,factor:t.f},"זמן");}
    case "data":  {const a=rnd(1,8000); const base=[1000,1024][rnd(0,1)];
      const D=[{k:"ק״ב",f:base},{k:"מ״ב",f:base**2},{k:"ג״ב",f:base**3},{k:"ט״ב",f:base**4}];
      const f=D[rnd(0,D.length-1)], t=D[rnd(0,D.length-1)]; return makeLinear(a,{key:f.k,factor:f.f},{key:t.k,factor:t.f},"נתונים");}
  }
}
const allTopics:Topic[]=["length","mass","volume","speed","area","temperature","time","data"];
const topicName:Record<Topic,string>={length:"אורך",mass:"מסה",volume:"נפח",speed:"מהירות",area:"שטח",temperature:"טמפרטורה",time:"זמן",data:"נתונים"};
const tips=[
  "מטרי=עשרוני: להזיז נקודה (קילו×1000, סנטי÷100, מילי÷1000).",
  "שטח/נפח: גורם כפול עצמו (²/³).",
  "C→F≈×2+30 · F→C≈(F−30)/2.",
  "1\"=2.54 ס״מ • מייל≈1.6 ק״מ • גלון≈3.8 ל׳.",
  "Factor-Label: כותבים כשבר ומבטלים יחידות."
];

function build(topics:Topic[], n=40){ const pool=topics.length?topics:allTopics; return Array.from({length:n},()=>gen(pool[rnd(0,pool.length-1)])); }

/* ——— component ——— */
const Quiz: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [deck, setDeck] = useState<QA[]>(()=>build([],40));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number|null>(null);
  const [score, setScore] = useState(0);
  const [fifty, setFifty] = useState(false);
  const [tab, setTab] = useState<"play"|"learn">("play");

  const q = deck[i];
  const progress = Math.round(((i + (picked !== null ? 1 : 0)) / deck.length) * 100);

  const spinRef = useRef<HTMLDivElement>(null);

  const toggleTopic = (t:Topic)=>setTopics(s=>s.includes(t)?s.filter(x=>x!==t):[...s,t]);
  const restart = (ts=topics)=>{ setDeck(build(ts,40)); setI(0); setPicked(null); setScore(0); setFifty(false); };

  const spin = ()=>{
    const el = spinRef.current; if(!el) return;
    const rounds = rnd(5,8);
    const choice = allTopics[rnd(0,allTopics.length-1)];
    const per = 360/allTopics.length;
    const idx = allTopics.indexOf(choice);
    const angle = rounds*360 + idx*per + per/2;

    el.style.setProperty("--spin-angle", `${angle}deg`);
    el.style.setProperty("--spin-dur", `${(rounds*0.18 + 1.2).toFixed(2)}s`);
    el.classList.remove("spinning"); void el.offsetWidth; el.classList.add("spinning");

    setTimeout(()=>{ setTopics([choice]); setTimeout(()=>restart([choice]), 350); }, (rounds*180)+1500);
  };

  const pick = (k:number)=>{ if(picked!==null) return; setPicked(k); if(k===q.correctIndex) setScore(s=>s+1); };
  const next = ()=>{ setPicked(null); if(i<deck.length-1) setI(x=>x+1); };
  const useFifty = ()=>{ if(fifty||picked!==null) return; setFifty(true); let r=0; q.options=q.options.map((o,j)=>j!==q.correctIndex&&r<2?(r++,"— —"):o); };

  return (
    <section className="quiz-full">
      <aside className="q-side">
        <div className="q-block">
          <div className="q-tabs">
            <button className={`qtab ${tab==="play"?"on":""}`} onClick={()=>setTab("play")}>שאלון</button>
            <button className={`qtab ${tab==="learn"?"on":""}`} onClick={()=>setTab("learn")}>לומדה</button>
          </div>

          <div className="topics">
            {allTopics.map(t=>(
              <button key={t} className={`chip topic ${topics.includes(t)?"on":""}`} onClick={()=>toggleTopic(t)}>{topicName[t]}</button>
            ))}
          </div>

          <div className="wheel-wrap">
            <div className="wheel3d" ref={spinRef}>
              {allTopics.map((t,idx)=>(
                <div key={t} className="slice3d" style={{"--i":idx} as React.CSSProperties}>
                  <span>{topicName[t]}</span>
                </div>
              ))}
              <div className="spark"></div>
            </div>
            <div className="pin3d">◆</div>
          </div>

          <div className="q-actions">
            <button className="btn eq" onClick={()=>restart()}>התחל</button>
            <button className="btn eq" onClick={spin}>גלגל מזל</button>
          </div>
        </div>

        <div className="scorebox">
          <div className="ladder"><div className="ladder-bar"><span style={{width:`${progress}%`}}/></div><div className="score">ניקוד: {score}/{deck.length}</div></div>
          <button className={`lifeline ${fifty?"used":""}`} onClick={useFifty} disabled={fifty}>50 / 50</button>
        </div>
      </aside>

      <div className="q-main">
        {tab==="play" ? (
          <>
            <div className="tip-strip">{tips[i%tips.length]}</div>
            <div className="question-card"><h3>{q.question}</h3>{q.explain && <p className="hint">טיפ: {q.explain}</p>}</div>
            <div className="answers-grid">
              {q.options.map((opt, k)=>{
                const state = picked===null ? "" : k===q.correctIndex ? "correct" : k===picked ? "wrong" : "idle";
                return (
                  <button key={k} className={`option ${state}`} onClick={()=>pick(k)} disabled={picked!==null}>
                    <span className="bullet">{String.fromCharCode(0x05D0+k)}</span>
                    <span className="txt">{opt}</span>
                  </button>
                );
              })}
            </div>
            <div className="q-foot"><button className="btn eq" onClick={next}>{i<deck.length-1?"לשאלה הבאה":"סיום המשחק"}</button></div>
          </>
        ) : (
          <div className="learn-cards">
            <article className="l-card"><h4>תגיות־גורמים</h4><ul><li>כותבים כשבר ומכפילים בשברים ששווים 1 (‎100 ס״מ / 1 מ׳‎).</li><li>היחידות הלא רצויות מתבטלות.</li><li>דוגמה: ‎2.5 מ׳ × (100 ס״מ / 1 מ׳) = ‎250 ס״מ‎.</li></ul></article>
            <article className="l-card"><h4>מטרי בראש</h4><ul><li>קידומות SI: קילו×1000 · סנטי÷100 · מילי÷1000.</li><li>3.4 ק״ג = 3400 גרם · 75 ס״מ = ‎0.75 מ׳‎.</li></ul></article>
            <article className="l-card"><h4>שטח/נפח</h4><ul><li>אורך×100 → שטח×100² → נפח×100³.</li><li>‎1 מ׳=100 ס״מ ⇒ ‎1 מ״ר=10,000 ס״מ² ⇒ ‎1 מ״ק=1,000,000 ס״מ³.</li></ul></article>
            <article className="l-card"><h4>טמפרטורה</h4><ul><li>מדויק: ‎°F=°C×9/5+32 · ‎°C=(°F−32)×5/9.</li><li>קירוב: C→F≈×2+30 · F→C≈(F−30)/2.</li></ul></article>
            <article className="l-card"><h4>עוגנים</h4><ul><li>1″=2.54 ס״מ · מייל≈1.6 ק״מ.</li><li>גלון (US)≈3.785 ל׳ ≈ 3.8.</li></ul></article>
          </div>
        )}
      </div>
    </section>
  );
};
export default Quiz;
