import React, { useEffect, useMemo, useState } from "react";

/* TYPES */
type Category =
  | "length" | "mass" | "volume" | "speed" | "area" | "temperature" | "time" | "data" | "currency";

type Unit = {
  key: string; label: string; en?: string; factor?: number; offset?: number;
  toBase?: (v: number) => number; fromBase?: (v: number) => number;
};
type CategoryDef = { key: Category; label: string; base: string; units: Unit[] };
type DataMode = "si" | "iec";
type Lang = "he" | "en";
interface Props { lang?: Lang }

/* CATALOG */
const STATIC: Omit<CategoryDef,"units">[] = [
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
  { key: "mm", label: "מ״מ", en: "mm", factor: 0.001 },
  { key: "cm", label: "ס״מ", en: "cm", factor: 0.01 },
  { key: "m",  label: "מטר", en: "m", factor: 1 },
  { key: "km", label: "ק״מ", en: "km", factor: 1000 },
  { key: "in", label: "אינץ׳", en: "in", factor: 0.0254 },
  { key: "ft", label: "פיט", en: "ft", factor: 0.3048 },
  { key: "yd", label: "יארד", en: "yd", factor: 0.9144 },
  { key: "mi", label: "מייל", en: "mi", factor: 1609.344 },
];
const MASS: Unit[] = [
  { key: "mg", label: "מ״ג", en: "mg", factor: 1e-6 },
  { key: "g",  label: "גרם", en: "g", factor: 1e-3 },
  { key: "kg", label: "ק״ג", en: "kg", factor: 1 },
  { key: "t",  label: "טון", en: "t", factor: 1000 },
  { key: "oz", label: "אונקיה", en: "oz", factor: 0.028349523125 },
  { key: "lb", label: "פאונד", en: "lb", factor: 0.45359237 },
  { key: "st", label: "סטון", en: "st", factor: 6.35029318 },
];
const VOLUME: Unit[] = [
  { key: "ml", label: "מ״ל", en: "mL", factor: 0.001 },
  { key: "L",  label: "ליטר", en: "L", factor: 1 },
  { key: "m3", label: "מ״ק", en: "m³", factor: 1000 },
  { key: "tsp", label: "כפית (US)", en: "tsp", factor: 0.00492892159375 },
  { key: "tbsp", label: "כף (US)", en: "tbsp", factor: 0.01478676478125 },
  { key: "cup", label: "כוס (US)", en: "cup", factor: 0.2365882365 },
  { key: "pt",  label: "פיינט (US)", en: "pt", factor: 0.473176473 },
  { key: "qt",  label: "קוורט (US)", en: "qt", factor: 0.946352946 },
  { key: "gal", label: "גלון (US)", en: "gal", factor: 3.785411784 },
];
const SPEED: Unit[] = [
  { key: "mps",  label: "מ׳/ש׳", en: "m/s", factor: 1 },
  { key: "kmph", label: "קמ״ש", en: "km/h", factor: 1000/3600 },
  { key: "mph",  label: "מייל/שעה", en: "mph", factor: 1609.344/3600 },
  { key: "knot", label: "קשר", en: "knot", factor: 1852/3600 },
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
  { key: "ha",   label: "הקטר", en: "ha", factor: 10000 },
];
const TEMPERATURE: Unit[] = [
  { key: "C", label: "°C (צלזיוס)", en: "Celsius", toBase:v=>v, fromBase:v=>v },
  { key: "F", label: "°F (פרנהייט)", en: "Fahrenheit", toBase:v=>(v-32)*(5/9), fromBase:v=>v*9/5+32 },
  { key: "K", label: "K (קלווין)", en: "Kelvin", toBase:v=>v-273.15, fromBase:v=>v+273.15 },
];
const TIME: Unit[] = [
  { key: "ms", label: "מילישניות", en: "ms", factor: 1e-3 },
  { key: "s",  label: "שניות", en: "s", factor: 1 },
  { key: "min", label: "דקות", en: "min", factor: 60 },
  { key: "h", label: "שעות", en: "h", factor: 3600 },
  { key: "d", label: "ימים", en: "d", factor: 86400 },
  { key: "wk", label: "שבועות", en: "wk", factor: 604800 },
];
const CURRENCY_CODES = ["ILS","USD","EUR","GBP","JPY","CNY","CAD","AUD","CHF","SEK","NOK","DKK","INR","BRL","MXN","ZAR","AED","SAR","TRY"];

/* HELPERS */
const mapUnits: Record<Exclude<Category,"data"|"currency">, Unit[]> = {
  length: LENGTH, mass: MASS, volume: VOLUME, speed: SPEED, area: AREA, temperature: TEMPERATURE, time: TIME
};
const getCategory = (key: Category, mode: DataMode): CategoryDef => {
  if (key === "data") {
    const list = mode === "si" ? ["B","KB","MB","GB","TB","PB"] : ["B","KiB","MiB","GiB","TiB","PiB"];
    const units: Unit[] = list.map((k, i)=>({ key:k, label:k, en:k, factor: i===0?1:(mode==="si"?1000:1024)**i }));
    return { key, label: "נתונים", base: "B", units };
  }
  if (key === "currency") return { key, label: "מטבע", base: "CUR", units: CURRENCY_CODES.map(c=>({ key:c, label:c })) };
  const s = STATIC.find(c=>c.key===key)!; return { key, label: s.label, base: s.base, units: mapUnits[key] };
};
const linToBase = (u:Unit,v:number)=>((v+(u.offset??0))*(u.factor??1));
const linFromBase=(u:Unit,v:number)=> (v/(u.factor??1))-(u.offset??0);
const toBase=(u:Unit,v:number)=>u.toBase?u.toBase(v):linToBase(u,v);
const fromBase=(u:Unit,v:number)=>u.fromBase?u.fromBase(v):linFromBase(u,v);
const fmt=(n:number, lang:Lang)=>{
  if (!Number.isFinite(n)) return "—";
  const abs=Math.abs(n);
  const opts: Intl.NumberFormatOptions =
    abs && (abs<0.001 || abs>=1e6)?{notation:"scientific", maximumFractionDigits:6}:{maximumFractionDigits:8};
  return new Intl.NumberFormat(lang==="he"?"he-IL":"en-US", opts).format(n);
};

function useQueryState<T extends Record<string,string>>(defaults:T){
  const [state,setState]=useState<T>(()=> {
    const url=new URL(location.href); const next={...defaults};
    for (const k of Object.keys(defaults)){ const v=url.searchParams.get(k); if(v!==null) (next as any)[k]=v;}
    return next;
  });
  useEffect(()=>{
    const url=new URL(location.href);
    for(const [k,v] of Object.entries(state)) url.searchParams.set(k,String(v));
    history.replaceState({}, "", url.toString());
  },[state]);
  return [state,setState] as const;
}

/* COMPONENT */
const Converter: React.FC<Props> = ({ lang = "he" }) => {
  const [dataMode, setDataMode] = useState<DataMode>(() => (localStorage.getItem("uuc.dataMode") as DataMode) || "si");
  const [qs, setQs] = useQueryState({
    cat: "area",
    from: "mm2",
    to: "cm2",
    amount: "1",
    cfrom: "ILS",
    cto: "USD",
    crate: "0.27",
  });

  const isCurrency = qs.cat === "currency";
  const cat = useMemo(()=>getCategory(qs.cat as Category, dataMode),[qs.cat, dataMode]);

  const fromUnit = useMemo(()=> (cat.units.find(u => u.key === (isCurrency?qs.cfrom:qs.from)) || cat.units[0]),[cat, qs.from, qs.cfrom, isCurrency]);
  const toUnit   = useMemo(()=> (cat.units.find(u => u.key === (isCurrency?qs.cto:qs.to)) || cat.units[1] || cat.units[0]),[cat, qs.to, qs.cto, isCurrency]);

  const amount = Number(qs.amount || "0");
  const result = useMemo(()=>{
    if (isCurrency){
      const r = Number(qs.crate || "0"); if (!isFinite(r) || r<=0) return NaN;
      return amount * r;
    }
    const base = toBase(fromUnit, amount); return fromBase(toUnit, base);
  },[isCurrency, amount, qs.crate, fromUnit, toUnit]);

  useEffect(()=>{ try{
    localStorage.setItem("uuc.dataMode", dataMode);
    if (isCurrency) localStorage.setItem(`uuc.rate:${qs.cfrom}->${qs.cto}`, qs.crate);
  }catch{} },[dataMode, isCurrency, qs.cfrom, qs.cto, qs.crate]);

  useEffect(()=>{ if(!isCurrency) return;
    const key=`uuc.rate:${qs.cfrom}->${qs.cto}`; const saved=localStorage.getItem(key);
    if (saved && saved !== qs.crate) setQs(s=>({...s, crate:saved}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[qs.cfrom, qs.cto, isCurrency]);

  const t = lang==="he"
    ? { convert:"המרה", amount:"כמות", category:"קטגוריה", from:"מ־", to:"אל", rate:"שער", result:"תוצאה",
        dataMode:"נתונים", si:"SI", iec:"IEC", copy:"העתק" }
    : { convert:"Converter", amount:"Amount", category:"Category", from:"FROM", to:"TO", rate:"Rate", result:"Result",
        dataMode:"Data", si:"SI", iec:"IEC", copy:"Copy" };

  const set = (k:string,v:string)=> setQs(s=>({...s,[k]:v}));

  const swap = () => {
    if (isCurrency) setQs(s=>({ ...s, cfrom: s.cto, cto: s.cfrom }));
    else setQs(s=>({ ...s, from: s.to, to: s.from }));
  };

  return (
    <section className="panel converter" data-lang={lang}>
      <div className="panel-head" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 6 }}>
        <h2 style={{ margin:0 }}>{t.convert}</h2>
        {qs.cat === "data" && (
          <div className="toggle" style={{ gap: 8 }}>
            <button className={`chip ${dataMode==="si"?"on":""}`} onClick={()=>setDataMode("si")}>{t.si}</button>
            <button className={`chip ${dataMode==="iec"?"on":""}`} onClick={()=>setDataMode("iec")}>{t.iec}</button>
          </div>
        )}
      </div>

      <div className="u-grid">
        {/* Amount */}
        <div className="u-row">
          <label className="u-label">{t.amount}</label>
          <input className="u-field" inputMode="decimal" value={qs.amount} onChange={e=>set("amount", e.target.value)} />
        </div>

        {/* Category */}
        <div className="u-row">
          <label className="u-label">{t.category}</label>
          <select className="u-field" value={qs.cat} onChange={(e)=>set("cat", e.target.value)}>
            {STATIC.map(c=>(
              <option key={c.key} value={c.key}>{lang==="he" ? c.label : c.key[0].toUpperCase()+c.key.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* FROM */}
        <div className="u-row">
          <label className="u-label badge from">{t.from}</label>
          <select
            className="u-field"
            value={isCurrency?qs.cfrom:qs.from}
            onChange={(e)=>set(isCurrency?"cfrom":"from", e.target.value)}
          >
            {cat.units.map(u=>(
              <option key={u.key} value={u.key}>{lang==="he"?u.label:(u.en||u.key)}</option>
            ))}
          </select>
        </div>

        {/* SWAP */}
        <div className="u-row u-row--swap">
          <button type="button" className="swap-btn" onClick={swap} aria-label="swap">
            ⇄
          </button>
        </div>

        {/* TO */}
        <div className="u-row">
          <label className="u-label badge to">{t.to}</label>
          <select
            className="u-field"
            value={isCurrency?qs.cto:qs.to}
            onChange={(e)=>set(isCurrency?"cto":"to", e.target.value)}
          >
            {cat.units.map(u=>(
              <option key={u.key} value={u.key}>{lang==="he"?u.label:(u.en||u.key)}</option>
            ))}
          </select>
        </div>

        {/* Rate (currency only) */}
        {isCurrency && (
          <div className="u-row">
            <label className="u-label">{t.rate}</label>
            <input className="u-field" inputMode="decimal" value={qs.crate} onChange={(e)=>set("crate", e.target.value)} />
          </div>
        )}

        {/* RESULT */}
        <div className="u-row u-row--result">
          <label className="u-label">{t.result}</label>
          <div className="result-chip">
            <span className="unit">{lang==="he" ? (isCurrency?qs.cto:toUnit.label) : (toUnit.en||toUnit.key)}</span>
            <span className="num">{fmt(result, lang)}</span>
          </div>
          <button className="copy-btn" type="button" onClick={()=>navigator.clipboard.writeText(String(result))}>
            {t.copy}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Converter;
