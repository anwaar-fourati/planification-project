// L'URL de base de votre API
const API_URL = 'http://localhost:5000/api';

/**
 * Récupérer le token depuis localStorage
 */
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;
  
  if (!token) {
    throw new Error('Vous devez être connecté');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Créer une nouvelle tâche dans un projet
 * @param {string} projectId - L'ID du projet
 * @param {object} taskData - { nom, description, priorite, dateEcheance, assigneA }
 */
export const createTask = async (projectId, taskData) => {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La création de la tâche a échoué');
  }
};

/**
 * Récupérer toutes les tâches d'un projet
 * @param {string} projectId - L'ID du projet
 */
export const getProjectTasks = async (projectId) => {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la récupération des tâches');
  }
};

/**
 * Récupérer les tâches assignées à l'utilisateur connecté
 * @route   GET /api/tasks/my-tasks
 * @access  Private
 */
export const getMesTaches = async () => {
  const res = await fetch(`${API_URL}/tasks/my-tasks`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la récupération des tâches');
  }
};

/**
 * Mettre à jour une tâche
 * @param {string} taskId - L'ID de la tâche
 * @param {object} taskData - { nom, description, statut, priorite, dateEcheance, assigneA }
 */
export const updateTask = async (taskId, taskData) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La mise à jour de la tâche a échoué');
  }
};

/**
 * Supprimer une tâche
 * @param {string} taskId - L'ID de la tâche
 */
export const deleteTask = async (taskId) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La suppression de la tâche a échouée');
  }
};

/**
 * Récupérer une tâche spécifique
 * @param {string} taskId - L'ID de la tâche
 */
export const getTask = async (taskId) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Tâche non trouvée');
  }
};