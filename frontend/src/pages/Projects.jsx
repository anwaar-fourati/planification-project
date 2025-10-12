import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  RectangleStackIcon,
  CalendarDaysIcon,
  PaperAirplaneIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { EyeIcon as EyeIconSolid, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [projects, setProjects] = useState([
    { id: 1, name: "Website Redesign", status: "In Progress", dueDate: "2025-10-15", priority: "High", members: 3, progress: 75 },
    { id: 2, name: "Mobile App Development", status: "Planning", dueDate: "2025-11-01", priority: "Medium", members: 5, progress: 20 },
    { id: 3, name: "API Integration", status: "Completed", dueDate: "2025-09-28", priority: "Low", members: 2, progress: 100 },
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold";
      case "In Progress": return "bg-purple-500/20 text-purple-800 dark:text-purple-200 font-bold";
      case "Planning": return "bg-pink-500/20 text-pink-800 dark:text-pink-200 font-bold";
      default: return "bg-gray-200 text-gray-800 dark:text-gray-200 font-bold";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-pink-600 dark:text-pink-400";
      case "Medium": return "text-purple-600 dark:text-purple-400";
      case "Low": return "text-emerald-600 dark:text-emerald-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const addProject = (formData) => {
    const newProject = {
      id: Date.now(),
      name: formData.name,
      status: formData.status,
      dueDate: formData.dueDate,
      priority: formData.priority || "Medium",
      members: 1,
      progress: 0,
    };
    setProjects(prev => [...prev, newProject]);
    setShowAddModal(false);
  };

  return (
    <div className="w-full h-full p-6" style={{ background: "var(--page-bg)", color: "var(--text-main)" }}>
      <div className="relative space-y-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>Project Workspace</h2>
            <p className="text-md" style={{ color: "var(--sidebar-text)" }}>Manage all team deliverables and track progress.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-md" style={{ background: "linear-gradient(90deg,#7B61FF,#9B5CFF)", color: "#fff" }}>
            <PlusIcon className="w-5 h-5 mr-2" />
            New Project
          </button>
        </div>

        <GlassCard className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />
            <input
              type="text"
              placeholder="Search projects by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200"
              style={{ background: "var(--navbar-search-bg)", color: "var(--navbar-search-text)", border: "1px solid rgba(0,0,0,0.06)" }}
            />
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none px-4 py-3 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200" style={{ background: "var(--navbar-search-bg)", color: "var(--navbar-search-text)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <option value="all">All Status</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="planning">Planning</option>
              </select>
              <FunnelIcon className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />
            </div>

            <button onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")} className={`p-3 rounded-2xl transition-all duration-300 ${viewMode === "cards" ? "bg-purple-600 text-white shadow-md" : ""}`} title={viewMode === "cards" ? "Switch to List View" : "Switch to Card View"}>
              {viewMode === "cards" ? <Bars3Icon className="w-6 h-6" /> : <RectangleStackIcon className="w-6 h-6" />}
            </button>
          </div>
        </GlassCard>

        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {filteredProjects.map((project) => (
              <GlassCard key={project.id} className="p-5 flex flex-col justify-between transition-transform duration-300 hover:scale-105">
                <div>
                  <h4 className="font-semibold text-lg" style={{ color: "var(--text-main)" }}>{project.name}</h4>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getStatusColor(project.status)}`}>{project.status}</span>
                  <div className="w-full bg-gray-300 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <p className="text-sm mt-3" style={{ color: "var(--sidebar-text)" }}>
                    <span className="font-bold mr-1">{project.progress}%</span> complete • {project.members} members
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>{project.priority} Priority</div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-2 overflow-hidden">
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-purple-300 dark:divide-purple-600">
                <thead className="bg-white/80 dark:bg-gray-700/80 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: "var(--sidebar-text)" }}>Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: "var(--sidebar-text)" }}>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: "var(--sidebar-text)" }}>Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: "var(--sidebar-text)" }}>Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: "var(--sidebar-text)" }}>Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-bold" style={{ color: "var(--sidebar-text)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200/50 dark:divide-purple-700/50">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-purple-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: "var(--text-main)" }}>{project.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>{project.status}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--sidebar-text)" }}><CalendarDaysIcon className="w-4 h-4 mr-1 inline" style={{ color: "var(--sidebar-icon)" }} />{project.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>{project.priority}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--sidebar-text)" }}>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 mr-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="font-semibold">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button className="text-purple-600 dark:text-purple-400 transition-colors" title="View Details"><EyeIconSolid className="w-5 h-5 inline" /></button>
                        <button className="text-purple-600 dark:text-purple-400 transition-colors" title="Edit Project"><PencilIcon className="w-5 h-5 inline" /></button>
                        <button className="text-pink-600 dark:text-pink-400 transition-colors" title="Delete Project"><TrashIcon className="w-5 h-5 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>Add New Project</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 dark:text-gray-400 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
              </div>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = {
                  name: e.target.name.value,
                  description: e.target.description.value,
                  status: e.target.status.value,
                  priority: e.target.priority.value,
                  dueDate: e.target.dueDate.value,
                };
                if (formData.name && formData.dueDate) {
                  addProject(formData);
                  e.target.reset();
                } else {
                  console.error("Project Name and Due Date are required.");
                }
              }}>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--sidebar-text)" }}>Project Name <span className="text-pink-600">*</span></label>
                  <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl focus:outline-none" style={{ background: "var(--navbar-search-bg)", color: "var(--navbar-search-text)", border: "1px solid rgba(0,0,0,0.06)" }} placeholder="E.g., Unision Design System" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--sidebar-text)" }}>Description</label>
                  <textarea name="description" rows="3" className="w-full px-4 py-3 rounded-xl focus:outline-none" style={{ background: "var(--navbar-search-bg)", color: "var(--navbar-search-text)", border: "1px solid rgba(0,0,0,0.06)" }} placeholder="Brief description..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--sidebar-text)" }}>Status</label>
                    <select name="status" className="w-full px-4 py-3 rounded-xl focus:outline-none" style={{ background: "var(--navbar-search-bg)", color: "var(--navbar-search-text)", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <option>Planning</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--sidebar-text)" }}>Priority</label>
                    <select name="priority" className="w-full px-4 py-3 rounded-xl focus:outline-none" style={{ background: "var(--navbar-search-bg)", color: "var(--navbar-search-text)", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--sidebar-text)" }}>Due Date <span className="text-pink-600">*</span></label>
                    <input type="date" name="dueDate" required className="w-full px-4 py-3 rounded-xl focus:outline-none" style={{ background: "var(--navbar-search-bg)", color: "var(--navbar-search-text)", border: "1px solid rgba(0,0,0,0.06)" }} />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.06)", color: "var(--sidebar-text)" }}>Cancel</button>
                  <button type="submit" className="flex items-center px-6 py-2 rounded-xl" style={{ background: "linear-gradient(90deg,#7B61FF,#9B5CFF)", color: "#fff" }}>
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" /> Create Project
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
