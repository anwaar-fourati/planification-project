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
 * Récupérer tous les projets de l'utilisateur
 */
export const getUserProjects = async () => {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la récupération des projets');
  }
};

/**
 * Créer un nouveau projet
 * @param {object} projectData - { nom, description, statut, priorite, dateEcheance }
 */
export const createProject = async (projectData) => {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La création du projet a échoué');
  }
};

/**
 * Mettre à jour un projet
 * @param {string} projectId - L'ID du projet
 * @param {object} projectData - { nom, description, statut, priorite, dateEcheance, progression }
 */
export const updateProject = async (projectId, projectData) => {
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La mise à jour du projet a échoué');
  }
};

/**
 * Supprimer un projet
 * @param {string} projectId - L'ID du projet
 */
export const deleteProject = async (projectId) => {
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La suppression du projet a échoué');
  }
};

/**
 * Rejoindre un projet avec un code
 * @param {string} codeAcces - Le code d'accès du projet
 */
export const joinProject = async (codeAcces) => {
  const res = await fetch(`${API_URL}/projects/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ codeAcces }),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Impossible de rejoindre le projet');
  }
};

/**
 * Récupérer les détails d'un projet
 * @param {string} projectId - L'ID du projet
 */
export const getProjectDetails = async (projectId) => {
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la récupération du projet');
  }
};