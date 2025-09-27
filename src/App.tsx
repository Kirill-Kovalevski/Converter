import React, { useEffect, useMemo, useState } from "react";
import Converter from "./components/ConverterTemp";
import HedgehogIcon from "./components/HedgehogIcon";
import NavDrawer from "./components/NavDrawer";

type Lang = "he" | "en";
type Theme = "dark" | "light";

const App: React.FC = () => {
  const [view, setView] = useState<"convert" | "quiz" | "learn">("convert");
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [lang, setLang] = useState<Lang>("he");

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "he" ? "rtl" : "ltr");
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const t = useMemo(
    () =>
      lang === "he"
        ? { title: "הממיר", home: "דף הבית" }
        : { title: "The Convertor", home: "Home" },
    [lang]
  );

  return (
    <div className="app" dir={lang === "he" ? "rtl" : "ltr"}>
      {/* ===== HERO ===== */}
      <header className="hero">
        {/* Title (click = go home) */}
        <h1
          className="hero-title"
          onClick={() => {
            setView("convert");
            window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
          }}
          title={t.home}
          aria-label={t.home}
        >
          <span>{t.title}</span>
        </h1>

        {/* Hedgehog menu trigger */}
        <button
          className="hedge-btn"
          aria-label={lang === "he" ? "פתח תפריט" : "Open menu"}
          onClick={() => setNavOpen(true)}
        >
          <HedgehogIcon size={78} />
        </button>
      </header>

      {/* ===== MAIN ===== */}
      <main className="main-area">
        <div className="content-wrap" data-lang={lang}>
          {view === "convert" && (
            <div className="converter-host" data-lang={lang}>
              <Converter lang={lang} />
            </div>
          )}
        </div>
      </main>

      {/* ===== NAV DRAWER ===== */}
      <NavDrawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onGoto={(dest) => {
          if (dest === "convert" || dest === "quiz" || dest === "learn") setView(dest);
          if (dest === "home") setView("convert");
          setNavOpen(false);
          window.scrollTo({ top: 0 });
        }}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        applyPreset={(query) => {
          const cleanPath = location.pathname.replace(/\/{2,}/g, "/");
          history.replaceState(null, "", `${cleanPath}${query}`);
          setView("convert");
          setNavOpen(false);
          window.scrollTo({ top: 0 });
        }}
        centered
      />
    </div>
  );
};

export default App;
