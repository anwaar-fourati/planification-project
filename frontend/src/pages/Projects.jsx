import React, { useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  RectangleStackIcon,
  CalendarDaysIcon,
  PaperAirplaneIcon,
  UserGroupIcon, 
  PencilIcon as PencilIconOutline 
} from "@heroicons/react/24/outline";
import { EyeIcon as EyeIconSolid, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";

// GlassCard Component
const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 ${className}`}>
      {children}
    </div>
  );
};

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false); 
  
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
  
  const handleCreateProject = () => {
    setShowMenu(false);
    setShowAddModal(true);
  };

  const handleJoinProject = () => {
    setShowMenu(false);
    setShowParticipateModal(true);
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="relative space-y-6 w-full max-w-7xl mx-auto">
        
        {/* SECTION 1: EN-TÊTE ET BOUTON DE CRÉATION/PARTICIPATION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Project Workspace</h2>
            <p className="text-md text-gray-600 dark:text-gray-400">Manage all team deliverables and track progress.</p>
          </div>
          
          {/* CONTEXTE D'EMPILEMENT MAXIMAL POUR LE BOUTON + ET SON MENU */}
          <div className="relative z-[100]"> 
            <button 
              onClick={() => setShowMenu(prev => !prev)} 
              className="flex items-center p-3 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 focus:ring-4 focus:ring-purple-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              aria-expanded={showMenu}
            >
              <PlusIcon className="w-6 h-6" />
            </button>
            
            {showMenu && (
              <>
                {/* Backdrop pour fermer le menu en cliquant à l'extérieur */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                
                <div 
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl shadow-2xl z-50 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 overflow-hidden"
                >
                  <div className="py-2">
                    
                    {/* Option Rejoindre un projet */}
                    <button 
                      onClick={handleJoinProject} 
                      className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 border-b border-purple-200/50 dark:border-purple-700/50 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <UserGroupIcon className="w-6 h-6 mr-3 text-pink-500 flex-shrink-0" />
                      <span className="font-semibold">Rejoindre un projet</span>
                    </button>
                    
                    {/* Option Créer un projet */}
                    <button 
                      onClick={handleCreateProject} 
                      className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <PencilIconOutline className="w-6 h-6 mr-3 text-purple-500 flex-shrink-0" />
                      <span className="font-semibold">Créer un projet</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: BARRE DE RECHERCHE ET CONTRÔLES */}
        <GlassCard className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-0">
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
            />
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none px-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                <option value="all">All Status</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="planning">Planning</option>
              </select>
              <FunnelIcon className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>

            <button onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")} className={`p-3 rounded-2xl transition-all duration-300 ${viewMode === "cards" ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"}`} title={viewMode === "cards" ? "Switch to List View" : "Switch to Card View"}>
              {viewMode === "cards" ? <Bars3Icon className="w-6 h-6" /> : <RectangleStackIcon className="w-6 h-6" />}
            </button>
          </div>
        </GlassCard>

        {/* SECTION 3: VUES DES PROJETS (Cartes ou Tableau) */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {filteredProjects.map((project) => (
              <GlassCard key={project.id} className="p-5 flex flex-col justify-between transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{project.name}</h4>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getStatusColor(project.status)}`}>{project.status}</span>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 mb-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold mr-1">{project.progress}%</span> complete • {project.members} members
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>{project.priority} Priority</div>
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
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
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200/50 dark:divide-purple-700/50">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-purple-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{project.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>{project.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400"><CalendarDaysIcon className="w-4 h-4 mr-1 inline text-gray-500" />{project.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 mr-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="font-semibold">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors" title="View Details"><EyeIconSolid className="w-5 h-5 inline" /></button>
                        <button className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors" title="Edit Project"><PencilIcon className="w-5 h-5 inline" /></button>
                        <button className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 transition-colors" title="Delete Project"><TrashIcon className="w-5 h-5 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* SECTION 4: MODALES (Ajout et Participation) */}
        
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Project</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
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
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Project Name <span className="text-pink-600">*</span></label>
                  <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" placeholder="E.g., Unision Design System" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Description</label>
                  <textarea name="description" rows="3" className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" placeholder="Brief description..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Status</label>
                    <select name="status" className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                      <option>Planning</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Priority</label>
                    <select name="priority" className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Due Date <span className="text-pink-600">*</span></label>
                    <input type="date" name="dueDate" required className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                  <button type="submit" className="flex items-center px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300">
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" /> Create Project
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
        
        {showParticipateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-md w-full p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rejoindre un projet</h3>
                <button onClick={() => setShowParticipateModal(false)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
              </div>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Ceci est une simulation de la fenêtre pour rejoindre un projet.
                Vous pourriez ajouter ici un champ pour entrer un code d'invitation ou rechercher un projet public.
              </p>
              <div className="flex justify-end">
                 <button onClick={() => setShowParticipateModal(false)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300">Fermer</button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;