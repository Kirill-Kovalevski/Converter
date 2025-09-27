import React, { useMemo, useState } from "react";

// ---------- Types ----------
type QA = {
  question: string;
  options: string[];
  correctIndex: number;
  explain?: string;
};

// ---------- Helpers ----------
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T,>(arr: T[]) => arr.map(v => [v, Math.random()] as const).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);

const fmt = (n: number) =>
  new Intl.NumberFormat("he-IL", { maximumFractionDigits: 6 }).format(n);

// pools
const lengthUnits = [
  { key: "מ״מ", toM: 0.001 }, { key: "ס״מ", toM: 0.01 }, { key: "מטר", toM: 1 },
  { key: "ק״מ", toM: 1000 }, { key: "אינץ׳", toM: 0.0254 }, { key: "פיט", toM: 0.3048 },
  { key: "יארד", toM: 0.9144 }, { key: "מייל", toM: 1609.344 },
];
const massUnits = [
  { key: "מ״ג", toKg: 1e-6 }, { key: "גרם", toKg: 1e-3 }, { key: "ק״ג", toKg: 1 },
  { key: "טון", toKg: 1000 }, { key: "אונקיה", toKg: 0.028349523125 }, { key: "פאונד", toKg: 0.45359237 }
];
const volumeUnits = [
  { key: "מ״ל", toL: 0.001 }, { key: "ליטר", toL: 1 }, { key: "מ״ק", toL: 1000 },
  { key: "כפית (US)", toL: 0.00492892159375 }, { key: "כף (US)", toL: 0.01478676478125 },
  { key: "כוס (US)", toL: 0.2365882365 }, { key: "גלון (US)", toL: 3.785411784 }
];

function makeLinearQuestion(
  amount: number,
  from: { key: string; factor: number },
  to: { key: string; factor: number },
  label: string
): QA {

  const base = amount * from.factor;
  const ans = base / to.factor;
  const correct = fmt(ans);
  // alternatives around correct
  const delta = Math.max(Math.abs(ans) * 0.15, 0.1);
  const opts = shuffle([
    correct,
    fmt(ans + delta),
    fmt(Math.max(ans - delta, 0)),
    fmt(ans * 1.5)
  ]);
  return {
    question: `כמה הם ${fmt(amount)} ${from.key} ב־${to.key}?`,
    options: opts,
    correctIndex: opts.indexOf(correct),
    explain: `המרה בקטגוריית ${label}: מכפילים את ${from.key} לפורמט בסיס ומחלקים ב־${to.key}.`
  };
}

// ---------- Generators ----------
function genLength(): QA {
  const a = rnd(1, 5000);
  const from = lengthUnits[rnd(0, lengthUnits.length - 1)];
  const to = lengthUnits[rnd(0, lengthUnits.length - 1)];
  const f = { key: from.key, factor: from.toM };
  const t = { key: to.key, factor: to.toM };
  return makeLinearQuestion(a, f, t, "אורך");
}
function genMass(): QA {
  const a = rnd(1, 9000);
  const from = massUnits[rnd(0, massUnits.length - 1)];
  const to = massUnits[rnd(0, massUnits.length - 1)];
  return makeLinearQuestion(a, { key: from.key, factor: from.toKg }, { key: to.key, factor: to.toKg }, "מסה");
}
function genVolume(): QA {
  const a = rnd(1, 2000);
  const from = volumeUnits[rnd(0, volumeUnits.length - 1)];
  const to = volumeUnits[rnd(0, volumeUnits.length - 1)];
  return makeLinearQuestion(a, { key: from.key, factor: from.toL }, { key: to.key, factor: to.toL }, "נפח");
}
function genSpeed(): QA {
  const amount = rnd(5, 300);
  const types = [
    { name: "קמ״ש", toMps: 1000/3600 },
    { name: "מ׳/ש׳", toMps: 1 },
    { name: "מייל/שעה", toMps: 1609.344/3600 },
    { name: "קשר", toMps: 1852/3600 }
  ];
  const from = types[rnd(0, types.length-1)];
  const to = types[rnd(0, types.length-1)];
  return makeLinearQuestion(amount, { key: from.name, factor: from.toMps }, { key: to.name, factor: to.toMps }, "מהירות");
}
function genArea(): QA {
  const amount = rnd(1, 2000000);
  const types = [
    { name: "ממ״ר", toM2: 1e-6 }, { name: "סמ״ר", toM2: 1e-4 }, { name: "מ״ר", toM2: 1 },
    { name: "קמ״ר", toM2: 1e6 }, { name: "אקר", toM2: 4046.8564224 }, { name: "הקטר", toM2: 10000 }
  ];
  const from = types[rnd(0, types.length-1)];
  const to = types[rnd(0, types.length-1)];
  return makeLinearQuestion(amount, { key: from.name, factor: from.toM2 }, { key: to.name, factor: to.toM2 }, "שטח");
}
function genTemp(): QA {
  const amount = rnd(-40, 200);
  const temps = ["צלזיוס", "פרנהייט", "קלווין"] as const;
  const from = temps[rnd(0, 2)];
  const to = temps[rnd(0, 2)];
  const toBase = (v:number, f:typeof from) => f==="צלזיוס"?v: f==="פרנהייט"? (v-32)*(5/9) : v-273.15;
  const fromBase = (v:number, t:typeof to) => t==="צלזיוס"?v: t==="פרנהייט"? v*9/5+32 : v+273.15;
  const base = toBase(amount, from);
  const ans = fromBase(base, to);
  const correct = fmt(ans);
  const opts = shuffle([correct, fmt(ans+10), fmt(ans-10), fmt(ans*1.1)]);
  return {
    question: `כמה הם ${fmt(amount)} מעלות ${from} ב־${to}?`,
    options: opts,
    correctIndex: opts.indexOf(correct),
    explain: "המרת טמפרטורה: מעבר לצלזיוס ומשם ליחידה המבוקשת."
  };
}

function buildDeck(count = 30): QA[] {
  const gens = [genLength, genMass, genVolume, genSpeed, genArea, genTemp];
  const qs: QA[] = [];
  for (let i = 0; i < count; i++) {
    qs.push(gens[rnd(0, gens.length - 1)]());
  }
  return qs;
}

// ---------- Component ----------
const Quiz: React.FC = () => {
  const deck = useMemo(() => buildDeck(40), []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [fiftyUsed, setFiftyUsed] = useState(false);

  const q = deck[idx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correctIndex) setScore(s => s + 1);
  };

  const next = () => { setPicked(null); if (idx < deck.length - 1) setIdx(i => i + 1); };

  const useFifty = () => {
    if (fiftyUsed || picked !== null) return;
    setFiftyUsed(true);
    // mark two wrong as disabled by swapping their text to empty marker
    let removed = 0;
    q.options = q.options.map((o, i) => {
      if (i !== q.correctIndex && removed < 2) { removed++; return "— —"; }
      return o;
    });
  };

  const progress = Math.round(((idx + (picked !== null ? 1 : 0)) / deck.length) * 100);

  return (
    <section className="panel glass quiz">
      <div className="quiz-top">
        <div className="ladder">
          <div className="ladder-bar"><span style={{width: `${progress}%`}} /></div>
          <div className="score">ניקוד: {score}/{deck.length}</div>
        </div>
        <div className="lifelines">
          <button className={`lifeline ${fiftyUsed?"used":""}`} onClick={useFifty} disabled={fiftyUsed}>
            50 / 50
          </button>
        </div>
      </div>

      <div className="question">
        <div className="ring"></div>
        <h3>{q.question}</h3>
        {q.explain && <p className="hint">טיפ: {q.explain}</p>}
      </div>

      <div className="answers">
        {q.options.map((opt, i) => {
          const state =
            picked === null ? "" :
            i === q.correctIndex ? "correct" :
            i === picked ? "wrong" : "idle";

          return (
            <button
              key={i}
              className={`option ${state}`}
              onClick={() => pick(i)}
              disabled={picked !== null}
            >
              <span className="bullet">{String.fromCharCode(0x05D0 + i)}</span>
              <span className="txt">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="quiz-actions">
        <button className="btn" onClick={next}>
          {idx < deck.length - 1 ? "לשאלה הבאה" : "סיום המשחק"}
        </button>
      </div>
    </section>
  );
};

export default Quiz;
