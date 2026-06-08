"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Evita parpadeo/hidratación: no renderiza hasta montar
  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden />;
  }

  const isDark = theme !== "light";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 bg-white/10 text-amber-300 hover:text-amber-200 hover:bg-white/20 transition-colors"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
