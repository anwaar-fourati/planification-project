import React, { useState, useEffect } from "react";
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
  ArrowRightIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline";
import { EyeIcon as EyeIconSolid, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";

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

  // Charger les projets au montage du composant
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fonction pour récupérer les projets depuis le backend
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // ou votre méthode de stockage du token
      
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des projets');
      }

      const data = await response.json();
      
      // Transformer les données du backend pour le frontend
      const formattedProjects = data.projets.map(projet => ({
        id: projet._id,
        name: projet.nom,
        status: projet.statut,
        dueDate: projet.dateEcheance ? new Date(projet.dateEcheance).toISOString().split('T')[0] : '',
        priority: projet.priorite,
        members: projet.nombreMembres || projet.membres?.length || 0,
        progress: projet.progression || 0,
        code: projet.codeAcces
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

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    dueDate: ''
  });

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Créer un projet via l'API
  const addProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      const projectData = {
        nom: formData.projectName,
        description: formData.description,
        statut: formData.status,
        priorite: formData.priority,
        dateEcheance: formData.dueDate,
      };

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du projet');
      }

      const data = await response.json();
      
      // Afficher le code généré
      setProjectCode(data.projet.codeAcces);
      setShowAddModal(false);
      setShowCodeModal(true);
      
      // Recharger la liste des projets
      await fetchProjects();
      
      // Réinitialiser le formulaire
      setFormData({
        projectName: '',
        description: '',
        status: 'Planning',
        priority: 'Medium',
        dueDate: ''
      });

    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la création du projet');
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rejoindre un projet avec un code
  const handleJoinWithCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/projects/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codeAcces: joinCode.toUpperCase() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Code invalide');
      }

      const data = await response.json();
      
      alert(`✅ ${data.message}: ${data.projet.nom}`);
      setShowParticipateModal(false);
      setJoinCode("");
      
      // Recharger la liste des projets
      await fetchProjects();

    } catch (err) {
      console.error('Erreur:', err);
      alert(err.message || 'Code invalide. Veuillez vérifier et réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateProject = () => {
    setShowMenu(false);
    setShowAddModal(true);
  };

  const handleJoinProject = () => {
    setShowMenu(false);
    setShowParticipateModal(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(projectCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="relative space-y-6 w-full max-w-7xl mx-auto">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Project Workspace</h2>
            <p className="text-md text-gray-600 dark:text-gray-400">Manage all team deliverables and track progress.</p>
          </div>
          
          {/* BOUTON + ET MENU */}
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
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                
                <div 
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl shadow-2xl z-50 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 overflow-hidden"
                >
                  <div className="py-2">
                    <button 
                      onClick={handleJoinProject} 
                      className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 border-b border-purple-200/50 dark:border-purple-700/50 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <UserGroupIcon className="w-6 h-6 mr-3 text-pink-500 flex-shrink-0" />
                      <span className="font-semibold">Join a project</span>
                    </button>
                    
                    <button 
                      onClick={handleCreateProject} 
                      className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <PencilIconOutline className="w-6 h-6 mr-3 text-purple-500 flex-shrink-0" />
                      <span className="font-semibold">Create a project</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BARRE DE RECHERCHE */}
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

        {/* AFFICHAGE DES PROJETS */}
        {loading && <p className="text-center text-gray-600 dark:text-gray-400">Chargement...</p>}
        
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {filteredProjects.map((project) => (
              <GlassCard key={project.id} className="p-5 flex flex-col justify-between transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{project.name}</h4>
                    {project.code && (
                      <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                        {project.code}
                      </span>
                    )}
                  </div>
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
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200/50 dark:divide-purple-700/50">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-purple-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{project.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{project.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>{project.status}</span>
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* MODAL CRÉATION */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <GlassCard className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4" onSubmit={addProject}>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Project Name <span className="text-pink-600">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="projectName"
                    id="projectName"
                    required 
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" 
                    placeholder="E.g., Unision Design System" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea 
                    name="description"
                    id="description"
                    rows="3" 
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" 
                    placeholder="Brief description..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select 
                      name="status"
                      id="status"
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    >
                      <option>Planning</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select 
                      name="priority"
                      id="priority"
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Due Date <span className="text-pink-600">*</span>
                    </label>
                    <input 
                      type="date" 
                      name="dueDate"
                      id="dueDate"
                      required 
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" 
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="px-6 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addProject}
                    disabled={loading}
                    className="flex items-center px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5 mr-2" /> 
                        Create Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* MODAL CODE GÉNÉRÉ */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <GlassCard className="max-w-md w-full p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  <CheckIcon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Project Created Successfully! 🎉
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Share this code with your team so they can join the project
                </p>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Code
                  </p>
                  <p className="text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                    {projectCode}
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center justify-center w-full px-4 py-2 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-5 h-5 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setShowCodeModal(false)}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  Done
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* MODAL REJOINDRE */}
        {showParticipateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <GlassCard className="max-w-md w-full p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Join a Project</h3>
                <button onClick={() => setShowParticipateModal(false)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter the project code you wish to join
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Project Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g., ABC-1X2Y"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 font-mono text-lg text-center uppercase"
                    maxLength={20}
                  />
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    💡 <span className="font-semibold">Tip:</span> The project code is on the project card or you can ask the project creator.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowParticipateModal(false)}
                    className="px-6 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinWithCode}
                    disabled={!joinCode || loading}
                    className="flex items-center px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Joining...' : (
                      <>
                        Join
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;