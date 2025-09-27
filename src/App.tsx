import React from "react";
import Converter from "./components/ConverterTemp";

const HedgehogLogo = () => (
  <svg className="logo hedgehog" viewBox="0 0 120 64" aria-hidden="true">
    <defs>
      <linearGradient id="hhg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="currentColor"/>
        <stop offset="1" stopColor="currentColor"/>
      </linearGradient>
    </defs>
    {/* body */}
    <path d="M12 44c0-16 14-28 36-28 22 0 42 12 50 28-6 8-20 12-44 12S14 52 12 44Z"
      fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* eye */}
    <circle cx="34" cy="40" r="2.4" fill="currentColor"/>
    {/* nose */}
    <circle cx="14.8" cy="44" r="2.2" fill="currentColor"/>
    {/* spines */}
    <path d="M38 20 46 6 M50 22 62 6 M62 24 78 8 M74 26 94 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const App: React.FC = () => {
  return (
    <div className="app-shell">
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-a"></span>
        <span className="orb orb-b"></span>
        <span className="orb orb-c"></span>
      </div>

      <header className="app-header">
        <div className="brand">
          <HedgehogLogo />
          <div className="titles">
            <h1>הקונברטר הקוצני</h1>
            <p className="tag">מהיר, אלגנטי, עברית מלאה · 2025</p>
          </div>
        </div>
        <div className="actions">
          <button
            className="chip"
            id="themeToggle"
            onClick={() => {
              document.documentElement.classList.toggle("theme-light");
            }}
            aria-label="החלפת ערכת צבעים"
            title="החלפת ערכת צבעים"
          >
            🌓 מצב תצוגה
          </button>
        </div>
      </header>

      <main className="app-main">
        <Converter />
      </main>

      {/* Footer intentionally empty (we removed the text) */}
      <footer className="app-footer"></footer>
    </div>
  );
};

export default App;
