import React, { useEffect, useMemo, useState } from "react";

/* TYPES */
type Category =
  | "length" | "mass" | "volume" | "speed" | "area" | "temperature" | "time" | "data" | "currency";

type Unit = {
  key: string;       // internal
  label: string;     // Hebrew
  en?: string;       // English (shown on phones under the select)
  factor?: number;
  offset?: number;
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
};

type CategoryDef = { key: Category; label: string; base: string; units: Unit[] };
type DataMode = "si" | "iec";

/* CATALOG */
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
  { key: "mm", label: "מ״מ", en: "millimeter", factor: 0.001 },
  { key: "cm", label: "ס״מ", en: "centimeter", factor: 0.01 },
  { key: "m",  label: "מטר", en: "meter", factor: 1 },
  { key: "km", label: "ק״מ", en: "kilometer", factor: 1000 },
  { key: "in", label: "אינץ׳", en: "inch", factor: 0.0254 },
  { key: "ft", label: "פיט", en: "foot", factor: 0.3048 },
  { key: "yd", label: "יארד", en: "yard", factor: 0.9144 },
  { key: "mi", label: "מייל", en: "mile", factor: 1609.344 },
];

const MASS: Unit[] = [
  { key: "mg", label: "מ״ג", en: "milligram", factor: 1e-6 },
  { key: "g",  label: "גרם", en: "gram", factor: 1e-3 },
  { key: "kg", label: "ק״ג", en: "kilogram", factor: 1 },
  { key: "t",  label: "טון", en: "tonne", factor: 1000 },
  { key: "oz", label: "אונקיה", en: "ounce", factor: 0.028349523125 },
  { key: "lb", label: "פאונד", en: "pound", factor: 0.45359237 },
  { key: "st", label: "סטון", en: "stone", factor: 6.35029318 },
];

const VOLUME: Unit[] = [
  { key: "ml", label: "מ״ל", en: "milliliter", factor: 0.001 },
  { key: "L",  label: "ליטר", en: "liter", factor: 1 },
  { key: "m3", label: "מ״ק", en: "cubic meter", factor: 1000 },
  { key: "tsp", label: "כפית (US)", en: "teaspoon", factor: 0.00492892159375 },
  { key: "tbsp", label: "כף (US)", en: "tablespoon", factor: 0.01478676478125 },
  { key: "cup", label: "כוס (US)", en: "cup", factor: 0.2365882365 },
  { key: "pt",  label: "פיינט (US)", en: "pint", factor: 0.473176473 },
  { key: "qt",  label: "קוורט (US)", en: "quart", factor: 0.946352946 },
  { key: "gal", label: "גלון (US)", en: "gallon", factor: 3.785411784 },
];

const SPEED: Unit[] = [
  { key: "mps",  label: "מ׳/ש׳", en: "m/s", factor: 1 },
  { key: "kmph", label: "קמ״ש", en: "km/h", factor: 1000 / 3600 },
  { key: "mph",  label: "מייל/שעה", en: "mph", factor: 1609.344 / 3600 },
  { key: "knot", label: "קשר", en: "knot", factor: 1852 / 3600 },
];

const AREA: Unit[] = [
  { key: "mm2", label: "ממ״ר", en: "mm²", factor: 1e-6 },
  { key: "cm2", label: "סמ״ר", en: "cm²", factor: 1e-4 },
  { key: "m2",  label: "מ״ר", en: "m²", factor: 1 },
  { key: "km2", label: "קמ״ר", en: "km²", factor: 1e6 },
  { key: "in2", label: "אינץ׳²", en: "in²", factor: 0.00064516 },
  { key: "ft2", label: "פיט²", en: "ft²", factor: 0.09290304 },
  { key: "yd2", label: "יארד²", en: "yd²", factor: 0.83612736 },
  { key: "acre", label: "אקר", en: "acre", factor: 4046.8564224 },
  { key: "ha",   label: "הקטר", en: "hectare", factor: 10000 },
];

const TEMPERATURE: Unit[] = [
  { key: "C", label: "°C (צלזיוס)", en: "Celsius", toBase: (v) => v, fromBase: (v) => v },
  { key: "F", label: "°F (פרנהייט)", en: "Fahrenheit", toBase: (v) => (v - 32) * (5/9), fromBase: (v) => v * 9/5 + 32 },
  { key: "K", label: "K (קלווין)",  en: "Kelvin",  toBase: (v) => v - 273.15,       fromBase: (v) => v + 273.15 },
];

const TIME: Unit[] = [
  { key: "ms",  label: "מילישניות", en: "milliseconds", factor: 1e-3 },
  { key: "s",   label: "שניות", en: "seconds", factor: 1 },
  { key: "min", label: "דקות", en: "minutes", factor: 60 },
  { key: "h",   label: "שעות", en: "hours", factor: 3600 },
  { key: "d",   label: "ימים", en: "days", factor: 86400 },
  { key: "wk",  label: "שבועות", en: "weeks", factor: 604800 },
];

const CURRENCY_CODES = ["ILS","USD","EUR","GBP","JPY","CNY","CAD","AUD","CHF","SEK","NOK","DKK","INR","BRL","MXN","ZAR","AED","SAR","TRY"];

/* HELPERS */
const getCategory = (key: Category, mode: DataMode): CategoryDef => {
  if (key === "data") {
    const k = mode === "si" ? 1000 : 1024;
    const suffixKeys = mode === "si" ? ["KB","MB","GB","TB","PB"] : ["KiB","MiB","GiB","TiB","PiB"];
    const suffixHeb  = mode === "si" ? ["ק״ב","מ״ב","ג״ב","ט״ב","פ״ב"] : ["קי״ב","מי״ב","גי״ב","טי״ב","פי״ב"];
    const suffixEn   = mode === "si" ? ["KB","MB","GB","TB","PB"] : ["KiB","MiB","GiB","TiB","PiB"];
    const units: Unit[] = [
      { key: "B", label: "בתים", en: "bytes", factor: 1 },
      ...suffixKeys.map((kkey, i) => ({
        key: kkey, label: suffixHeb[i], en: suffixEn[i], factor: (mode === "si" ? 1000 : 1024) ** (i + 1)
      })),
    ];
    return { key, label: "נתונים", base: "B", units };
  }
  const map: Record<Exclude<Category,"data"|"currency">, Unit[]> = {
    length: LENGTH, mass: MASS, volume: VOLUME, speed: SPEED, area: AREA, temperature: TEMPERATURE, time: TIME
  };
  if (key !== "currency") {
    const s = STATIC.find(c => c.key === key)!;
    return { key, label: s.label, base: s.base, units: map[key] };
  }
  return { key: "currency", label: "מטבע", base: "CUR", units: CURRENCY_CODES.map(code => ({ key: code, label: code })) };
};

const getUnit = (cat: CategoryDef, unitKey: string) =>
  cat.units.find(u => u.key === unitKey) || cat.units[0];

const linearToBase = (unit: Unit, value: number) => ((value + (unit.offset ?? 0)) * (unit.factor ?? 1));
const linearFromBase = (unit: Unit, baseValue: number) => (baseValue / (unit.factor ?? 1)) - (unit.offset ?? 0);
const toBase   = (u: Unit, v: number) => u.toBase ? u.toBase(v) : linearToBase(u, v);
const fromBase = (u: Unit, v: number) => u.fromBase ? u.fromBase(v) : linearFromBase(u, v);

function formatNumber(n: number) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions =
    abs !== 0 && (abs < 0.001 || abs >= 1e6)
      ? { notation: "scientific", maximumFractionDigits: 6 }
      : { maximumFractionDigits: 8 };
  return new Intl.NumberFormat("he-IL", opts).format(n);
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

/* COMPONENT */
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
  const ripple = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const swap = () => {
    if (isCurrency) setQs(s => ({ ...s, cfrom: s.cto, cto: s.cfrom }));
    else setQs(s => ({ ...s, from: s.to, to: s.from }));
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); showToast("הועתק!"); }
    catch { showToast("נכשל ההעתקה"); }
  };

  return (
    <section className="panel glass compact">
      <div className="panel-head">
        <h2>המרה</h2>
        {/* subtitle removed per request */}
      </div>

      {qs.cat === "data" && (
        <div className="toggles glass-strong" title="בחר שיטת חישוב: 1000 = SI, 1024 = IEC">
          <div className={`toggle-chip ${dataMode === "si" ? "on" : ""}`}
               role="button" tabIndex={0}
               onClick={() => setDataMode("si")} onKeyDown={(e)=>e.key==="Enter"&&setDataMode("si")}
               onMouseDown={ripple}>1000</div>
          <div className={`toggle-chip ${dataMode === "iec" ? "on" : ""}`}
               role="button" tabIndex={0}
               onClick={() => setDataMode("iec")} onKeyDown={(e)=>e.key==="Enter"&&setDataMode("iec")}
               onMouseDown={ripple}>1024</div>
        </div>
      )}

      <div className="grid grid--comfy">
        <label className="field field--full">
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

        <label className="field field--full">
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
            {isCurrency ? (
              <select value={qs.cfrom} onChange={(e) => setQs(s => ({ ...s, cfrom: e.target.value }))}>
                {CURRENCY_CODES.map(code => <option key={code} value={code}>{code}</option>)}
              </select>
            ) : (
              <>
                <select value={qs.from} onChange={(e) => setQs(s => ({ ...s, from: e.target.value }))}>
                  {cat.units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
                <small className="sub-en mobile-only">{getUnit(cat, qs.from)?.en}</small>
              </>
            )}
          </div>
        </label>

        <label className="field">
          <span className="label">אל</span>
          <div className="control">
            {isCurrency ? (
              <select value={qs.cto} onChange={(e) => setQs(s => ({ ...s, cto: e.target.value }))}>
                {CURRENCY_CODES.map(code => <option key={code} value={code}>{code}</option>)}
              </select>
            ) : (
              <>
                <select value={qs.to} onChange={(e) => setQs(s => ({ ...s, to: e.target.value }))}>
                  {cat.units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
                <small className="sub-en mobile-only">{getUnit(cat, qs.to)?.en}</small>
              </>
            )}
          </div>
        </label>
      </div>

      <div className="actions-row actions-row--center">
        <button className="btn eq" onMouseDown={ripple} onClick={swap} aria-label="החלפה">⇅ החלף</button>
        <button className="btn eq" onMouseDown={ripple} onClick={() =>
          copy(`${qs.amount || 0} ${isCurrency ? qs.cfrom : fromUnit.label} = ${formatNumber(result)} ${isCurrency ? qs.cto : toUnit.label}`)
        }>העתק תוצאה</button>
        <button className="btn eq" onMouseDown={ripple} onClick={() => copy(window.location.href)} title="העתקת קישור לממיר">
          שלח לחבר
        </button>
      </div>

      <output className="result glass-strong" aria-live="polite">
        <div className="result-top">
          <span className="badge">{isCurrency ? `${qs.cfrom} → ${qs.cto}` : `${fromUnit.label} → ${toUnit.label}`}</span>
          {isCurrency && <span className="badge alt">שער: {qs.crate || "—"}</span>}
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
                <span className="u">{u.label}</span>
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
