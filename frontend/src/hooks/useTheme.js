import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function useTheme() {
  const user = useSelector(s => s.user);
  const [theme, setThemeState] = useState(() => localStorage.getItem("dt_theme") || "dark");

  useEffect(() => {
    const t = user?.theme || localStorage.getItem("dt_theme") || "dark";
    applyTheme(t);
    setThemeState(t);
  }, [user?.theme]);

  const applyTheme = (t) => {
    const root = document.documentElement;
    if (t === "light") {
      // ✅ Improved light mode — high contrast, fully visible
      root.style.setProperty("--bg", "#f5f7f5");
      root.style.setProperty("--bg2", "#eaf0ec");
      root.style.setProperty("--bg3", "#dde8df");
      root.style.setProperty("--card", "rgba(255,255,255,0.98)");
      root.style.setProperty("--text", "#0a1a0f");          // Very dark green-black
      root.style.setProperty("--text2", "#1c4228");         // Dark forest green
      root.style.setProperty("--text3", "#2d6640");         // Medium green (visible!)
      root.style.setProperty("--green", "#006b33");         // Deep green (not neon)
      root.style.setProperty("--green2", "#005528");
      root.style.setProperty("--green3", "#003d1c");
      root.style.setProperty("--border", "rgba(0,100,50,0.25)");
      root.style.setProperty("--border2", "rgba(0,100,50,0.45)");
      root.style.setProperty("--dim", "#b8d4be");
      root.style.setProperty("--purple", "#6d28d9");
      root.style.setProperty("--blue", "#0369a1");
      root.style.setProperty("--orange", "#c2410c");
      root.style.setProperty("--red", "#dc2626");
    } else {
      root.style.setProperty("--bg", "#040d08");
      root.style.setProperty("--bg2", "#071510");
      root.style.setProperty("--bg3", "#0a1d14");
      root.style.setProperty("--card", "rgba(7,21,16,0.85)");
      root.style.setProperty("--text", "#e0ffe8");
      root.style.setProperty("--text2", "#7db88a");
      root.style.setProperty("--text3", "#3d6b4a");
      root.style.setProperty("--green", "#00ff87");
      root.style.setProperty("--green2", "#00d46a");
      root.style.setProperty("--green3", "#00a854");
      root.style.setProperty("--border", "rgba(0,255,135,0.1)");
      root.style.setProperty("--border2", "rgba(0,255,135,0.22)");
      root.style.setProperty("--dim", "#1a3d2a");
      root.style.setProperty("--purple", "#a78bfa");
      root.style.setProperty("--blue", "#38bdf8");
      root.style.setProperty("--orange", "#fb923c");
      root.style.setProperty("--red", "#f87171");
    }
    localStorage.setItem("dt_theme", t);
  };

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.add("theme-transitioning");
    document.body.classList.add("theme-flash");
    applyTheme(newTheme);
    setThemeState(newTheme);
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
      document.body.classList.remove("theme-flash");
    }, 400);
    try { await axios.patch("/user/theme", { theme: newTheme }); } catch {}
  };

  return { theme, toggleTheme };
}
