import React from "react";

export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl shadow-xl p-6 border transition-all duration-300 hover:shadow-2xl ${className}`}
      style={{
        background: "var(--box-bg, rgba(236,232,248,0.6))",
        borderColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  );
}
