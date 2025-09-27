import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type Lang = "he" | "en";
type Theme = "dark" | "light";
type Dest = "home" | "convert" | "quiz" | "learn";

interface Props {
  open: boolean;
  onClose: () => void;
  onGoto: (d: Dest) => void;
  centered?: boolean;

  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;

  applyPreset: (query: string) => void;
}

const NavDrawer: React.FC<Props> = ({
  open,
  onClose,
  onGoto,
  centered,
  theme,
  setTheme,
  lang,
  setLang,
  applyPreset,
}) => {
  const t = lang === "he"
    ? {
        menu: "תפריט",
        theme: "ערכת נושא",
        light: "בהיר",
        dark: "כהה",
        lang: "שפה",
        home: "דף הבית",
        converter: "המרה",
        quiz: "חידון",
        learn: "למד",
        quick: "קיצורי דרך",
        cf: "C ↔ °F",
        mf: "מטר ↔ פיט",
        mib: "MB ↔ MiB",
        lgal: "ליטר ↔ גלון",
      }
    : {
        menu: "Menu",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        lang: "Lang",
        home: "Home",
        converter: "Converter",
        quiz: "Quiz",
        learn: "Learn",
        quick: "Quick presets",
        cf: "C ↔ °F",
        mf: "m ↔ ft",
        mib: "MB ↔ MiB",
        lgal: "L ↔ gal",
      };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.button
            className="nav-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close"
          />
          {/* Drawer */}
          <motion.aside
            className={`nav-drawer ${centered ? "centered" : ""}`}
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            role="dialog"
            aria-label={t.menu}
          >
            {/* Header */}
            <div className="nav-head">
              <strong>{t.menu}</strong>
              <button className="nav-close" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* Toggles */}
            <div className="control-row">
              <div className="toggle" role="group" aria-label={t.theme}>
                <span className="label">{t.theme}</span>
                <button
                  className={`chip ${theme === "light" ? "on" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  {t.light}
                </button>
                <button
                  className={`chip ${theme === "dark" ? "on" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  {t.dark}
                </button>
              </div>

              <div className="toggle" role="group" aria-label={t.lang}>
                <span className="label">{t.lang}</span>
                <button
                  className={`chip ${lang === "en" ? "on" : ""}`}
                  onClick={() => setLang("en")}
                >
                  English
                </button>
                <button
                  className={`chip ${lang === "he" ? "on" : ""}`}
                  onClick={() => setLang("he")}
                >
                  עברית
                </button>
              </div>
            </div>

            {/* Nav items */}
            <nav className="nav-items">
              <button className="nav-item" onClick={() => onGoto("home")}>
                {t.home}
              </button>
              <button className="nav-item" onClick={() => onGoto("convert")}>
                {t.converter}
              </button>
              <button className="nav-item" onClick={() => onGoto("quiz")}>
                {t.quiz}
              </button>
              <button className="nav-item" onClick={() => onGoto("learn")}>
                {t.learn}
              </button>
            </nav>

            {/* Presets */}
            <section className="nav-section">
              <h4>{t.quick}</h4>
              <div className="preset-grid">
                <button
                  className="preset"
                  onClick={() =>
                    applyPreset("?cat=temperature&from=C&to=F&amount=1")
                  }
                >
                  {t.cf}
                </button>
                <button
                  className="preset"
                  onClick={() =>
                    applyPreset("?cat=length&from=m&to=ft&amount=1")
                  }
                >
                  {t.mf}
                </button>
                <button
                  className="preset"
                  onClick={() =>
                    applyPreset("?cat=data&from=MB&to=MiB&amount=256")
                  }
                >
                  {t.mib}
                </button>
                <button
                  className="preset"
                  onClick={() =>
                    applyPreset("?cat=volume&from=L&to=gal&amount=3.5")
                  }
                >
                  {t.lgal}
                </button>
              </div>
            </section>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default NavDrawer;
