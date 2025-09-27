import React, { useState } from "react";
import Converter from "./components/ConverterTemp";
import Quiz from "./components/Quiz";

const HedgehogLogo = () => (
  <svg className="logo hedgehog" viewBox="0 0 120 64" aria-hidden="true">
    <path
      d="M12 44c0-16 14-28 36-28 22 0 42 12 50 28-6 8-20 12-44 12S14 52 12 44Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="34" cy="40" r="2.4" fill="currentColor" />
    <circle cx="14.8" cy="44" r="2.2" fill="currentColor" />
    <path
      d="M38 20 46 6 M50 22 62 6 M62 24 78 8 M74 26 94 12"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const App: React.FC = () => {
  const [view, setView] = useState<"convert" | "quiz">("convert");

  return (
    <div className="app-shell">
      {/* background effects */}
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-a"></span>
        <span className="orb orb-b"></span>
        <span className="orb orb-c"></span>
      </div>

      {/* header */}
      <header className="app-header">
        <div className="brand">
          <HedgehogLogo />
          <div className="titles">
            <h1>הקונברטר הקוצני</h1>
          </div>
        </div>

        <div className="actions">
          <div className="tabs">
            <button
              className={`tab ${view === "convert" ? "active" : ""}`}
              onClick={() => setView("convert")}
              aria-label="מצב המרה"
            >
              המרה
            </button>
            <button
              className={`tab ${view === "quiz" ? "active" : ""}`}
              onClick={() => setView("quiz")}
              aria-label="בחן את עצמך"
            >
              בחן את עצמך
            </button>
          </div>

          <button
            className="chip"
            onClick={() =>
              document.documentElement.classList.toggle("theme-light")
            }
            aria-label="החלפת ערכת צבעים"
            title="החלפת ערכת צבעים"
          >
            🌓 מצב תצוגה
          </button>
        </div>
      </header>

      {/* main content */}
      <main className="app-main">
        {view === "convert" ? <Converter /> : <Quiz />}
      </main>

      {/* footer (blank for now) */}
      <footer className="app-footer"></footer>
    </div>
  );
};

export default App;
