import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export default function ThemeSwitch() {
  const { theme, toggle } = useContext(ThemeContext);

  return (
    <button
      onClick={toggle}
      className="flex items-center px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-sm transition"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{ background: "transparent", color: "var(--sidebar-text)" }}
    >
      {theme === "dark" ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
    </button>
  );
}
