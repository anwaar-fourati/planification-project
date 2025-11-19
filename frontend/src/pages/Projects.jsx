import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserProjects, createProject, updateProject, deleteProject, joinProject } from '../services/projectService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  RectangleStackIcon,
  CalendarDaysIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  PencilIcon as PencilIconOutline,
  CheckIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    dueDate: '',
    progression: 0
  });

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    try {
      if (location?.state) {
        if (location.state.openCreate) setShowAddModal(true);
        if (location.state.openJoin) setShowParticipateModal(true);
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch (err) { }
  }, [location]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getUserProjects();
      const formattedProjects = data.projets.map(projet => ({
        id: projet._id,
        name: projet.nom,
        description: projet.description,
        status: projet.statut,
        dueDate: projet.dateEcheance ? new Date(projet.dateEcheance).toISOString().split('T')[0] : '',
        priority: projet.priorite,
        members: projet.nombreMembres || projet.membres?.length || 0,
        progress: projet.progression || 0,
        code: projet.codeAcces,
        isCreator: projet.createur._id === JSON.parse(localStorage.getItem('user'))._id
      }));
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les projets');
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const projectData = {
        nom: formData.projectName,
        description: formData.description,
        statut: formData.status,
        priorite: formData.priority,
        dateEcheance: formData.dueDate,
      };
      const data = await createProject(projectData);
      setProjectCode(data.projet.codeAcces);
      setShowAddModal(false);
      setShowCodeModal(true);
      await fetchProjects();
      setFormData({ projectName: '', description: '', status: 'Planning', priority: 'Medium', dueDate: '', progression: 0 });
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la création du projet');
      alert(err.message);
    } finally { setLoading(false); }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate || '',
      progression: project.progress || 0
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const projectData = {
        nom: formData.projectName,
        description: formData.description,
        statut: formData.status,
        priorite: formData.priority,
        dateEcheance: formData.dueDate,
        progression: parseInt(formData.progression)
      };
      await updateProject(editingProject.id, projectData);
      setShowEditModal(false);
      setEditingProject(null);
      await fetchProjects();
      setFormData({ projectName: '', description: '', status: 'Planning', priority: 'Medium', dueDate: '', progression: 0 });
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la mise à jour du projet');
      alert(err.message);
    } finally { setLoading(false); }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setLoading(true);
    try {
      await deleteProject(projectToDelete.id);
      setShowDeleteModal(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) { console.error('Erreur:', err); alert(err.message); }
    finally { setLoading(false); }
  };

  const handleJoinWithCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await joinProject(joinCode.toUpperCase());
      alert(`✅ ${data.message}: ${data.projet.nom}`);
      setShowParticipateModal(false);
      setJoinCode("");
      await fetchProjects();
    } catch (err) { console.error('Erreur:', err); alert(err.message || 'Code invalide.'); }
    finally { setLoading(false); }
  };

  const handleCreateProject = () => { setShowMenu(false); setShowAddModal(true); };
  const handleJoinProject = () => { setShowMenu(false); setShowParticipateModal(true); };
  const handleCopyCode = () => { navigator.clipboard.writeText(projectCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="relative space-y-6 w-full max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Project Workspace</h2>
            <p className="text-md text-gray-600 dark:text-gray-400">Manage all team deliverables and track progress.</p>
          </div>

          <div className="relative z-[100]">
            <button onClick={() => setShowMenu(prev => !prev)} className="flex items-center p-3 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 focus:ring-4 focus:ring-purple-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <PlusIcon className="w-6 h-6" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl shadow-2xl z-50 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 overflow-hidden">
                  <div className="py-2">
                    <button onClick={handleJoinProject} className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 border-b border-purple-200/50 dark:border-purple-700/50 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                      <UserGroupIcon className="w-6 h-6 mr-3 text-pink-500 flex-shrink-0" />
                      <span className="font-semibold">Join a project</span>
                    </button>
                    <button onClick={handleCreateProject} className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                      <PencilIconOutline className="w-6 h-6 mr-3 text-purple-500 flex-shrink-0" />
                      <span className="font-semibold">Create a project</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEARCH BAR */}
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

            <button onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")} className={`p-3 rounded-2xl transition-all duration-300 ${viewMode === "cards" ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"}`}>
              {viewMode === "cards" ? <Bars3Icon className="w-6 h-6" /> : <RectangleStackIcon className="w-6 h-6" />}
            </button>
          </div>
        </GlassCard>

        {/* PROJECTS DISPLAY */}
        {loading && <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>}

        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {filteredProjects.map((project) => (
              <GlassCard key={project.id} className="p-5 flex flex-col justify-between transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex-1">{project.name}</h4>
                    <div className="flex space-x-1 ml-2">
                      {project.isCreator && (
                        <>
                          <button onClick={() => handleEditClick(project)} className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600" title="Edit project">
                            <PencilIconOutline className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(project)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Delete project">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {project.code && (
                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 mb-2 inline-block">
                      {project.code}
                    </span>
                  )}

                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getStatusColor(project.status)}`}>{project.status}</span>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 mb-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold mr-1">{project.progress}%</span> complete • {project.members} members
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>{project.priority} Priority</div>
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                  </div>

                  <button
                    onClick={() => navigate(`/projects/${project.id}/tasks`)}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm"
                  >
                    <RectangleStackIcon className="w-5 h-5 mr-2" />
                    View Tasks
                  </button>
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
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Members</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProjects.map(project => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{project.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">{project.code}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor(project.status)}`}>{project.status}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getPriorityColor(project.priority)}`}>{project.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{project.progress}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{project.members}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {project.isCreator && (
                          <>
                            <button onClick={() => handleEditClick(project)} className="text-purple-600 dark:text-purple-400 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteClick(project)} className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* MODALS */}
        {/* --- Création, édition, suppression, code, rejoindre --- */}
       {/* MODALS */}

{/* Add Project Modal */}
{showAddModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <GlassCard className="w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Project</h3>
        <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={addProject} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </GlassCard>
  </div>
)}

{/* Edit Project Modal */}
{showEditModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <GlassCard className="w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Project</h3>
        <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleUpdateProject} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progress (%)</label>
          <input
            type="number"
            name="progression"
            min="0"
            max="100"
            value={formData.progression}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Project'}
          </button>
        </div>
      </form>
    </GlassCard>
  </div>
)}

{/* Delete Confirmation Modal */}
{showDeleteModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <GlassCard className="w-full max-w-md p-6">
      <div className="text-center">
        <TrashIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Project</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete "<span className="font-semibold">{projectToDelete?.name}</span>"? This action cannot be undone.
        </p>
        
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </GlassCard>
  </div>
)}

{/* Project Code Modal */}
{showCodeModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <GlassCard className="w-full max-w-md p-6 text-center">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Created Successfully!</h3>
        <button onClick={() => setShowCodeModal(false)} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">Share this code with your team members to let them join the project:</p>
      
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
        <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{projectCode}</p>
      </div>
      
      <button
        onClick={handleCopyCode}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
      >
        {copied ? (
          <>
            <CheckIcon className="w-5 h-5 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
            Copy Code
          </>
        )}
      </button>
    </GlassCard>
  </div>
)}

{/* Join Project Modal */}
{showParticipateModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <GlassCard className="w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Join a Project</h3>
        <button onClick={() => setShowParticipateModal(false)} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleJoinWithCode} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Code</label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter project code"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowParticipateModal(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Joining...' : 'Join Project'}
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
