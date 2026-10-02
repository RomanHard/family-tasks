import { createContext, useContext, useState } from "react";
import { tr } from "./i18n.js";
import { useAuth } from "./auth.jsx";

const LangContext = createContext(null);

// Language: the logged-in user's own language, or the guest choice on the login screen.
export function LangProvider({ children }) {
  const { user } = useAuth();
  const [guestLang, setGuestLang] = useState(() => localStorage.getItem("ft_lang") || "uk");
  const lang = user?.language || guestLang;
  const setLang = (l) => {
    setGuestLang(l);
    localStorage.setItem("ft_lang", l);
  };
  const t = (key, vars) => tr(lang, key, vars);
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
