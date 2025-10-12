import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div style={{ background: "var(--sidebar-bg)" }}>
        <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--page-bg)", color: "var(--text-main)" }}>
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
