import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// NotFound.jsx
// A responsive, accessible 404 page component styled with TailwindCSS.
// Drop this file in src/components/NotFound.jsx and use it in your router.

export default function NotFoundPage({ title = "Page not found", message = "We couldn't find the page you're looking for.", homeLabel = "Go home" }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6">
      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
        aria-labelledby="notfound-title"
        role="main"
      >
        <section className="flex-1 text-center md:text-left">
          <h1 id="notfound-title" className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-800">404</h1>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-700">{title}</h2>
          <p className="mt-4 text-gray-600">{message}</p>

          <div className="mt-6 flex justify-center md:justify-start gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {homeLabel}
            </button>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 focus:outline-none"
            >
              Go back
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-400">If you think this is a mistake, contact support or try searching the site.</p>
        </section>

        <aside className="w-56 h-56 md:w-72 md:h-72 flex-shrink-0">
          {/* Decorative illustration (SVG) */}
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" rx="20" fill="url(#g1)" opacity="0.15" />
            <g transform="translate(40,40)">
              <motion.circle
                cx="40"
                cy="40"
                r="28"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
                fill="#fff"
                opacity="0.9"
              />
              <motion.path
                d="M8 48c8-20 68-20 76 0"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9 }}
              />
            </g>
          </svg>
        </aside>
      </motion.main>
    </div>
  );
}
