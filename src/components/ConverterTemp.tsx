import React, { useEffect, useMemo, useState } from "react";

/* ===================== Types ===================== */
type Category =
  | "length"
  | "mass"
  | "volume"
  | "speed"
  | "area"
  | "temperature"
  | "time"
  | "data"
  | "currency";

type Unit = {
  key: string;
  label: string;
  factor?: number;
  offset?: number;
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
};

type CategoryDef = {
  key: Category;
  label: string;
  base: string;
  units: Unit[];
};

type DataMode = "si" | "iec";

/* ===================== Catalog ===================== */
const STATIC: Omit<CategoryDef, "units">[] = [
  { key: "length", label: "אורך", base: "m" },
  { key: "mass", label: "מסה", base: "kg" },
  { key: "volume", label: "נפח", base: "L" },
  { key: "speed", label: "מהירות", base: "mps" },
  { key: "area", label: "שטח", base: "m2" },
  { key: "temperature", label: "טמפרטורה", base: "C" },
  { key: "time", label: "זמן", base: "s" },
  { key: "data", label: "נתונים", base: "B" },
  { key: "currency", label: "מטבע", base: "CUR" },
];

const LENGTH: Unit[] = [
  { key: "mm", label: "מילימטרים", factor: 0.001 },
  { key: "cm", label: "סנטימטרים", factor: 0.01 },
  { key: "m", label: "מטרים", factor: 1 },
  { key: "km", label: "קילומטרים", factor: 1000 },
  { key: "in", label: "אינץ׳", factor: 0.0254 },
  { key: "ft", label: "פיט", factor: 0.3048 },
  { key: "yd", label: "יארד", factor: 0.9144 },
  { key: "mi", label: "מייל", factor: 1609.344 },
];

const MASS: Unit[] = [
  { key: "mg", label: "מ״ג", factor: 1e-6 },
  { key: "g", label: "גרם", factor: 1e-3 },
  { key: "kg", label: "ק״ג", factor: 1 },
  { key: "t", label: "טון", factor: 1000 },
  { key: "oz", label: "אונקיה", factor: 0.028349523125 },
  { key: "lb", label: "פאונד", factor: 0.45359237 },
  { key: "st", label: "סטון", factor: 6.35029318 },
];

const VOLUME: Unit[] = [
  { key: "ml", label: "מ״ל", factor: 0.001 },
  { key: "L", label: "ליטר", factor: 1 },
  { key: "m3", label: "מ׳׳ק", factor: 1000 },
  { key: "tsp", label: "כפית (US)", factor: 0.00492892159375 },
  { key: "tbsp", label: "כף (US)", factor: 0.01478676478125 },
  { key: "cup", label: "כוס (US)", factor: 0.2365882365 },
  { key: "pt", label: "פיינט (US)", factor: 0.473176473 },
  { key: "qt", label: "קוורט (US)", factor: 0.946352946 },
  { key: "gal", label: "גלון (US)", factor: 3.785411784 },
];

const SPEED: Unit[] = [
  { key: "mps", label: "מ׳/ש׳", factor: 1 },
  { key: "kmph", label: "קמ״ש", factor: 1000 / 3600 },
  { key: "mph", label: "מייל/שעה", factor: 1609.344 / 3600 },
  { key: "knot", label: "קשר", factor: 1852 / 3600 },
];

const AREA: Unit[] = [
  { key: "mm2", label: "ממ״ר", factor: 1e-6 },
  { key: "cm2", label: "סמ״ר", factor: 1e-4 },
  { key: "m2", label: "מ״ר", factor: 1 },
  { key: "km2", label: "קמ״ר", factor: 1e6 },
  { key: "in2", label: "אינץ׳²", factor: 0.00064516 },
  { key: "ft2", label: "פיט²", factor: 0.09290304 },
  { key: "yd2", label: "יארד²", factor: 0.83612736 },
  { key: "acre", label: "אקר", factor: 4046.8564224 },
  { key: "ha", label: "הקטר", factor: 10000 },
];

const TEMPERATURE: Unit[] = [
  { key: "C", label: "°C", toBase: (v) => v, fromBase: (v) => v },
  { key: "F", label: "°F", toBase: (v) => (v - 32) * (5/9), fromBase: (v) => v * 9/5 + 32 },
  { key: "K", label: "K",  toBase: (v) => v - 273.15,       fromBase: (v) => v + 273.15 },
];

const TIME: Unit[] = [
  { key: "ms", label: "מילישניות", factor: 1e-3 },
  { key: "s", label: "שניות", factor: 1 },
  { key: "min", label: "דקות", factor: 60 },
  { key: "h", label: "שעות", factor: 3600 },
  { key: "d", label: "ימים", factor: 86400 },
  { key: "wk", label: "שבועות", factor: 604800 },
];

const CURRENCY_CODES = ["ILS","USD","EUR","GBP","JPY","CNY","CAD","AUD","CHF","SEK","NOK","DKK","INR","BRL","MXN","ZAR","AED","SAR","TRY"];

/* ===================== Helpers ===================== */
const getCategory = (key: Category, mode: DataMode): CategoryDef => {
  if (key === "data") {
    const k = mode === "si" ? 1000 : 1024;
    const suffix = mode === "si" ? ["KB","MB","GB","TB","PB"] : ["KiB","MiB","GiB","TiB","PiB"];
    const units: Unit[] = [
      { key: "B", label: "Bytes", factor: 1 },
      { key: suffix[0], label: `${suffix[0]} (${k})`, factor: k ** 1 },
      { key: suffix[1], label: `${suffix[1]} (${k}²)`, factor: k ** 2 },
      { key: suffix[2], label: `${suffix[2]} (${k}³)`, factor: k ** 3 },
      { key: suffix[3], label: `${suffix[3]} (${k}⁴)`, factor: k ** 4 },
      { key: suffix[4], label: `${suffix[4]} (${k}⁵)`, factor: k ** 5 },
    ];
    return { key, label: "נתונים", base: "B", units };
  }

  const map: Record<Exclude<Category,"data"|"currency">, Unit[]> = {
    length: LENGTH, mass: MASS, volume: VOLUME, speed: SPEED, area: AREA,
    temperature: TEMPERATURE, time: TIME
  };
  if (key !== "currency") {
    const s = STATIC.find(c => c.key === key)!;
    return { key, label: s.label, base: s.base, units: map[key] };
  }
  return { key: "currency", label: "מטבע", base: "CUR", units: CURRENCY_CODES.map(code => ({ key: code, label: code })) };
};

const getUnit = (cat: CategoryDef, unitKey: string) =>
  cat.units.find(u => u.key === unitKey) || cat.units[0];

const linearToBase = (unit: Unit, value: number) =>
  ((value + (unit.offset ?? 0)) * (unit.factor ?? 1));
const linearFromBase = (unit: Unit, baseValue: number) =>
  (baseValue / (unit.factor ?? 1)) - (unit.offset ?? 0);

function toBase(unit: Unit, value: number) { return unit.toBase ? unit.toBase(value) : linearToBase(unit, value); }
function fromBase(unit: Unit, baseValue: number) { return unit.fromBase ? unit.fromBase(baseValue) : linearFromBase(unit, baseValue); }

function formatNumber(n: number) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions =
    abs !== 0 && (abs < 0.001 || abs >= 1e6)
      ? { notation: "scientific", maximumFractionDigits: 6 }
      : { maximumFractionDigits: 8 };
  return new Intl.NumberFormat(undefined, opts).format(n);
}

function useQueryState<T extends Record<string, string>>(defaults: T) {
  const [state, setState] = useState<T>(() => {
    const url = new URL(window.location.href);
    const next = { ...defaults };
    for (const k of Object.keys(defaults)) {
      const v = url.searchParams.get(k);
      if (v !== null) (next as any)[k] = v;
    }
    return next;
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    for (const [k, v] of Object.entries(state)) url.searchParams.set(k, String(v));
    window.history.replaceState({}, "", url.toString());
  }, [state]);

  return [state, setState] as const;
}

/* ===================== Component ===================== */
const Converter: React.FC = () => {
  const [dataMode, setDataMode] = useState<DataMode>(() => (localStorage.getItem("uuc.dataMode") as DataMode) || "si");

  const [qs, setQs] = useQueryState({
    cat: "length",
    from: "m",
    to: "ft",
    amount: "1",
    cfrom: "ILS",
    cto: "USD",
    crate: "0.27",
  });

  const cat = useMemo(() => getCategory(qs.cat as Category, dataMode), [qs.cat, dataMode]);
  const isCurrency = qs.cat === "currency";
  const fromUnit = useMemo(() => getUnit(cat, isCurrency ? qs.cfrom : qs.from), [cat, qs.from, qs.cfrom, isCurrency]);
  const toUnit   = useMemo(() => getUnit(cat, isCurrency ? qs.cto   : qs.to), [cat, qs.to, qs.cto, isCurrency]);
  const amount = Number(qs.amount || "0");

  const result = useMemo(() => {
    if (isCurrency) {
      const r = Number(qs.crate || "0");
      if (!isFinite(r) || r <= 0) return NaN;
      return amount * r;
    }
    const base = toBase(fromUnit, amount);
    return fromBase(toUnit, base);
  }, [isCurrency, amount, qs.crate, fromUnit, toUnit]);

  useEffect(() => {
    try {
      localStorage.setItem("uuc.dataMode", dataMode);
      if (isCurrency) localStorage.setItem(`uuc.rate:${qs.cfrom}->${qs.cto}`, qs.crate);
    } catch {}
  }, [dataMode, isCurrency, qs.cfrom, qs.cto, qs.crate]);

  useEffect(() => {
    if (!isCurrency) return;
    const key = `uuc.rate:${qs.cfrom}->${qs.cto}`;
    const saved = localStorage.getItem(key);
    if (saved && saved !== qs.crate) setQs(s => ({ ...s, crate: saved }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs.cfrom, qs.cto, isCurrency]);

  const [toast, setToast] = useState<string>("");
  const showToast = (t: string) => { setToast(t); setTimeout(() => setToast(""), 1200); };

  const swap = () => {
    if (isCurrency) setQs(s => ({ ...s, cfrom: s.cto, cto: s.cfrom }));
    else setQs(s => ({ ...s, from: s.to, to: s.from }));
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); showToast("הועתק!"); }
    catch { showToast("נכשל ההעתקה"); }
  };

  return (
    <section className="panel glass">
      <div className="panel-head">
        <h2>המר כל דבר</h2>
        <p className="muted">עברית · יישור מלא · קישורים ניתנים לשיתוף</p>
      </div>

      {/* Global toggles */}
      <div className="toggles glass-strong">
        <div className={`toggle-chip ${dataMode === "si" ? "on":""}`} role="button" tabIndex={0}
             onClick={() => setDataMode("si")} onKeyDown={e=>e.key==="Enter"&&setDataMode("si")}>
          נתונים: SI (1000)
        </div>
        <div className={`toggle-chip ${dataMode === "iec" ? "on":""}`} role="button" tabIndex={0}
             onClick={() => setDataMode("iec")} onKeyDown={e=>e.key==="Enter"&&setDataMode("iec")}>
          נתונים: IEC (1024)
        </div>
      </div>

      <div className="grid">
        <label className="field">
          <span className="label">קטגוריה</span>
          <div className="control">
            <select
              value={qs.cat}
              onChange={(e) => {
                const nextCat = e.target.value as Category;
                const c = getCategory(nextCat, dataMode);
                const first = c.units[0]?.key || "";
                const second = c.units[1]?.key || first;
                setQs(s => ({
                  ...s,
                  cat: nextCat,
                  from: nextCat === "currency" ? s.from : first,
                  to:   nextCat === "currency" ? s.to   : second,
                }));
              }}
            >
              {STATIC.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
        </label>

        <label className="field">
          <span className="label">כמות</span>
          <div className="control">
            <input
              inputMode="decimal"
              type="text"
              value={qs.amount}
              onChange={(e) => {
                const v = e.target.value.replace(",", ".");
                if (/^-?\d*\.?\d*$/.test(v) || v === "") setQs(s => ({ ...s, amount: v }));
              }}
              placeholder="הקלד ערך…"
            />
          </div>
        </label>

        <label className="field">
          <span className="label">מ־</span>
          <div className="control">
            {qs.cat === "currency" ? (
              <select value={qs.cfrom} onChange={(e) => setQs(s => ({ ...s, cfrom: e.target.value }))}>
                {CURRENCY_CODES.map(code => <option key={code} value={code}>{code}</option>)}
              </select>
            ) : (
              <select value={qs.from} onChange={(e) => setQs(s => ({ ...s, from: e.target.value }))}>
                {cat.units.map(u => <option key={u.key} value={u.key}>{u.label} ({u.key})</option>)}
              </select>
            )}
          </div>
        </label>

        <label className="field">
          <span className="label">אל</span>
          <div className="control">
            {qs.cat === "currency" ? (
              <select value={qs.cto} onChange={(e) => setQs(s => ({ ...s, cto: e.target.value }))}>
                {CURRENCY_CODES.map(code => <option key={code} value={code}>{code}</option>)}
              </select>
            ) : (
              <select value={qs.to} onChange={(e) => setQs(s => ({ ...s, to: e.target.value }))}>
                {cat.units.map(u => <option key={u.key} value={u.key}>{u.label} ({u.key})</option>)}
              </select>
            )}
          </div>
        </label>
      </div>

      {qs.cat === "currency" && (
        <div className="grid grid--currency">
          <label className="field">
            <span className="label">שער ידני</span>
            <div className="control">
              <div className="rate-box">
                <span className="mono">1&nbsp;{qs.cfrom}&nbsp;=&nbsp;</span>
                <input
                  inputMode="decimal"
                  type="text"
                  value={qs.crate}
                  onChange={(e) => {
                    const v = e.target.value.replace(",", ".");
                    if (/^(\d+(\.\d*)?|\.\d+)?$/.test(v) || v === "") setQs(s => ({ ...s, crate: v }));
                  }}
                  placeholder="שער"
                />
                <span className="mono">&nbsp;{qs.cto}</span>
              </div>
              <small className="muted">פרטי ומהיר — ללא API. אנחנו זוכרים שערים לכל זוג מטבעות במכשיר שלך.</small>
            </div>
          </label>
        </div>
      )}

      <div className="actions-row">
        <button className="btn primary" onClick={swap} aria-label="החלפה">⇅ החלף</button>
        <button className="btn" onClick={() =>
          copy(`${qs.amount || 0} ${qs.cat === "currency" ? qs.cfrom : fromUnit.key} = ${formatNumber(result)} ${qs.cat === "currency" ? qs.cto : toUnit.key}`)
        }>העתק תוצאה</button>
        <button className="btn" onClick={() => copy(window.location.href)} title="קישור עם המצב הנוכחי">שתף קישור</button>
      </div>

      <output className="result glass-strong" aria-live="polite">
        <div className="result-top">
          <span className="badge">
            {qs.cat === "currency" ? `${qs.cfrom} → ${qs.cto}` : `${fromUnit.key} → ${toUnit.key}`}
          </span>
          {qs.cat === "currency" && <span className="badge alt">שער: {qs.crate || "—"}</span>}
        </div>
        <div className="result-main">
          <div className="big">{formatNumber(result)}</div>
          <div className="small">תוצאה</div>
        </div>
      </output>

      {qs.cat !== "currency" && (
        <div className="mini-table">
          {cat.units.slice(0, 6).map(u => {
            const base = toBase(fromUnit, amount || 0);
            const v = fromBase(u, base);
            return (
              <div className="mini-row" key={u.key}>
                <span className="u">{u.key}</span>
                <span className="v">{formatNumber(v)}</span>
              </div>
            );
          })}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </section>
  );
};

export default Converter;
