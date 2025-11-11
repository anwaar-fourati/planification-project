import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../services/authService';
import { getProjectTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon
} from "@heroicons/react/24/outline";

// GlassCard Component
const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 ${className}`}>
      {children}
    </div>
  );
};

const Tasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    priorite: 'Medium',
    statut: 'À faire',
    dateEcheance: '',
    assigneA: ''
  });

  // Charger les tâches au montage
  useEffect(() => {
    if (projectId) {
      fetchTasks();
      fetchProjectDetails();
    }
  }, [projectId]);

  // Récupérer les tâches
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getProjectTasks(projectId);
      
      // Transform backend data to frontend format
      const formattedTasks = data.taches.map(task => ({
        id: task._id,
        name: task.nom,
        description: task.description,
        status: task.statut,
        priority: task.priorite,
        dueDate: task.dateEcheance,
        assignedTo: task.assigneA ? {
          id: task.assigneA._id,
          name: `${task.assigneA.prenom} ${task.assigneA.nom}`
        } : null,
        createur: task.createur
      }));
      
      setTasks(formattedTasks);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les détails du projet (pour avoir la liste des membres)
  const fetchProjectDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération du projet');

      const projet = await response.json();
      
      // Formatter les membres pour le select
      const members = projet.membres.map(membre => ({
        id: membre.utilisateur._id,
        name: `${membre.utilisateur.prenom} ${membre.utilisateur.nom}`
      }));
      
      setProjectMembers(members);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Créer ou modifier une tâche
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const taskData = {
        nom: formData.nom,
        description: formData.description,
        priorite: formData.priorite,
        statut: formData.statut,
        dateEcheance: formData.dateEcheance,
        assigneA: formData.assigneA || undefined
      };

      if (editingTask) {
        // Mise à jour
        await updateTask(editingTask.id, taskData);
      } else {
        // Création
        await createTask(projectId, taskData);
      }

      // Recharger les tâches
      await fetchTasks();
      
      // Fermer le modal et réinitialiser
      setShowAddModal(false);
      setEditingTask(null);
      setFormData({
        nom: '',
        description: '',
        priorite: 'Medium',
        statut: 'À faire',
        dateEcheance: '',
        assigneA: ''
      });

    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une tâche
  const handleDelete = async (taskId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteTask(taskId);
      await fetchTasks();
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal d'édition
  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      nom: task.name,
      description: task.description || '',
      priorite: task.priority,
      statut: task.status,
      dateEcheance: task.dueDate || '',
      assigneA: task.assignedTo?.id || ''
    });
    setShowAddModal(true);
  };

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Couleurs pour les statuts
  const getStatusColor = (status) => {
    switch (status) {
      case "Terminé":
      case "Terminée": 
        return "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200";
      case "En cours": 
        return "bg-purple-500/20 text-purple-800 dark:text-purple-200";
      case "À faire": 
        return "bg-pink-500/20 text-pink-800 dark:text-pink-200";
      case "En attente":
        return "bg-yellow-500/20 text-yellow-800 dark:text-yellow-200";
      default: 
        return "bg-gray-200 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-pink-600 dark:text-pink-400";
      case "Medium": return "text-purple-600 dark:text-purple-400";
      case "Low": return "text-emerald-600 dark:text-emerald-400";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="relative space-y-6 w-full max-w-7xl mx-auto">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button 
              onClick={() => navigate('/projects')}
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline mb-2"
            >
              ← Retour aux projets
            </button>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h2>
            <p className="text-md text-gray-600 dark:text-gray-400">Organize and track project deliverables</p>
          </div>
          
          <button 
            onClick={() => {
              setEditingTask(null);
              setFormData({
                nom: '',
                description: '',
                priorite: 'Medium',
                statut: 'À faire',
                dateEcheance: '',
                assigneA: ''
              });
              setShowAddModal(true);
            }}
            className="flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Task
          </button>
        </div>

        {/* BARRE DE RECHERCHE ET FILTRES */}
        <GlassCard className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
            />
          </div>

          <div className="relative">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="appearance-none px-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
            >
              <option value="all">All Status</option>
              <option value="à faire">À faire</option>
              <option value="en cours">En cours</option>
              <option value="terminé">Terminé</option>
              <option value="en attente">En attente</option>
            </select>
            <FunnelIcon className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </GlassCard>

        {/* AFFICHAGE DES TÂCHES */}
        {loading && <p className="text-center text-gray-600 dark:text-gray-400">Chargement...</p>}
        
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune tâche trouvée</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Créez votre première tâche pour commencer</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <GlassCard key={task.id} className="p-5 flex flex-col justify-between hover:scale-105 transition-transform">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{task.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                )}

                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>

                <div className="space-y-2 text-sm">
                  <div className={`flex items-center ${getPriorityColor(task.priority)}`}>
                    <span className="font-semibold">{task.priority} Priority</span>
                  </div>

                  {task.dueDate && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}

                  {task.assignedTo && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <UserIcon className="w-4 h-4 mr-2" />
                      {task.assignedTo.name}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* MODAL CRÉATION/ÉDITION */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <GlassCard className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTask(null);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Task Name <span className="text-pink-600">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="nom"
                    required 
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" 
                    placeholder="E.g., Design homepage mockup" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea 
                    name="description"
                    rows="3" 
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" 
                    placeholder="Task details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select 
                      name="statut"
                      value={formData.statut}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    >
                      <option value="À faire">À faire</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminé">Terminé</option>
                      <option value="En attente">En attente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select 
                      name="priorite"
                      value={formData.priorite}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Due Date
                    </label>
                    <input 
                      type="date" 
                      name="dateEcheance"
                      value={formData.dateEcheance}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Assign To
                    </label>
                    <select 
                      name="assigneA"
                      value={formData.assigneA}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingTask(null);
                    }}
                    className="px-6 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
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

export default Tasks;