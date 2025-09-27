import React, { useState } from "react";
import Converter from "./components/ConverterT";
import Quiz from "./components/Quiz";

/** Icon-scale mythical hedgehog (simple + strong). Click = open rail */
const HedgehogIcon: React.FC<{ onClick(): void }> = ({ onClick }) => (
  <button className="logo-btn" onClick={onClick} aria-label="פתח תפריט צד">
    <svg className="logo mythic" viewBox="0 0 72 72" role="img" aria-hidden="true">
     
      <path d="M24 16c3-4 9-6 12-6s9 2 12 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    
      <path d="M6 46c3-12 16-20 30-20s27 8 30 20c-5 8-19 12-30 12S9 54 6 46Z"
            fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/>
      <circle cx="27" cy="44" r="1.9" fill="currentColor"/>
      <path d="M6 46l-4 2" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/>
    
      <path d="M30 26 36 16M36 27 45 17M42 29 54 20M48 31 62 23"
            stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/>
    </svg>
  </button>
);

const App: React.FC = () => {
  const [view, setView] = useState<"convert" | "quiz">("convert");
  const [railOpen, setRailOpen] = useState(false);
  const toggleTheme = () => document.documentElement.classList.toggle("theme-light");

  return (
    <div className="app-shell">
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-a"></span><span className="orb orb-b"></span><span className="orb orb-c"></span>
      </div>

      <header className="app-header">
        <div className="brand">
          <HedgehogIcon onClick={() => setRailOpen(v => !v)} />
          <h1 className="title">הקונברטר הקוצני</h1>
        </div>

        <nav className="top-tabs" aria-label="main">
          <button className={`tab ${view==="convert"?"active":""}`} onClick={() => setView("convert")}>המרה</button>
          <button className={`tab ${view==="quiz"?"active":""}`} onClick={() => setView("quiz")}>בחן את עצמך</button>
        </nav>

        <button className="chip" onClick={toggleTheme} aria-label="מצב תצוגה">🌓</button>
      </header>

      {/* rail is hidden until icon click */}
      <aside className={`rail ${railOpen ? "open" : ""}`} aria-label="פעולות">
        <button className="rail-btn" title="שלח לחבר" onClick={() => navigator.clipboard.writeText(window.location.href)}>↗︎</button>
        <button className="rail-btn" title={view==="quiz"?"חזרה להמרה":"עבור למבחן"} onClick={() => setView(v => v==="quiz"?"convert":"quiz")}>⇄</button>
        <button className="rail-btn" title="מצב תצוגה" onClick={toggleTheme}>☾</button>
      </aside>

      <main className="app-main">
        {view === "convert" ? <Converter /> : <Quiz />}
      </main>
      <footer className="app-footer"></footer>
    </div>
  );
};
export default App;
