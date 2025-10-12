import React, { useState } from "react";
import { MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="shadow-sm border-b dark:border-gray-700 px-6 py-4" style={{ background: "var(--sidebar-bg)" }}>
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--navbar-search-text)" }}
            />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                background: "var(--navbar-search-bg)",
                color: "var(--navbar-search-text)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            />
          </div>
        </div>

        <div className="ml-4 relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg"
            style={{ color: "var(--sidebar-text)" }}
          >
            <UserCircleIcon className="w-8 h-8" />
          </button>
          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50"
              style={{ background: "var(--page-bg)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <a className="block px-4 py-2 text-sm" style={{ color: "var(--sidebar-text)" }}>Profile</a>
              <a className="block px-4 py-2 text-sm" style={{ color: "var(--sidebar-text)" }}>Settings</a>
              <a className="block px-4 py-2 text-sm" style={{ color: "var(--sidebar-text)" }}>Logout</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
