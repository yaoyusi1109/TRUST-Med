"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "zh";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("trust-med-language");
    if (saved === "en" || saved === "zh") {
      setLanguageState(saved);
      document.documentElement.lang = saved === "zh" ? "zh-CN" : "en";
    }
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("trust-med-language", nextLanguage);
    document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "zh" : "en")
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex border border-line bg-background p-1 ${
        compact ? "text-[11px]" : "text-xs"
      }`}
      aria-label="Language switcher"
    >
      {([
        ["en", "EN"],
        ["zh", "中文"]
      ] as const).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setLanguage(value)}
          className={`px-3 py-1 font-mono uppercase tracking-[0.1em] transition-colors ${
            language === value
              ? "bg-primary text-white"
              : "text-muted hover:bg-wash hover:text-primary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
