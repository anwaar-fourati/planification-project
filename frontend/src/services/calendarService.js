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
 * Créer un nouvel événement dans le calendrier d'un projet
 * @param {string} projectId - L'ID du projet
 * @param {object} eventData - Les données de l'événement
 */
export const createEvent = async (projectId, eventData) => {
  const res = await fetch(`${API_URL}/projects/${projectId}/calendar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La création de l\'événement a échoué');
  }
};

/**
 * Récupérer tous les événements d'un projet
 * @param {string} projectId - L'ID du projet
 * @param {object} filters - Filtres optionnels (startDate, endDate, type)
 */
export const getProjectEvents = async (projectId, filters = {}) => {
  let url = `${API_URL}/projects/${projectId}/calendar`;
  
  // Ajouter les paramètres de filtrage
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.type) params.append('type', filters.type);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la récupération des événements');
  }
};

/**
 * Récupérer un événement spécifique
 * @param {string} eventId - L'ID de l'événement
 */
export const getEvent = async (eventId) => {
  const res = await fetch(`${API_URL}/calendar/${eventId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Événement non trouvé');
  }
};

/**
 * Mettre à jour un événement
 * @param {string} eventId - L'ID de l'événement
 * @param {object} eventData - Les nouvelles données
 */
export const updateEvent = async (eventId, eventData) => {
  const res = await fetch(`${API_URL}/calendar/${eventId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La mise à jour de l\'événement a échoué');
  }
};

/**
 * Supprimer un événement
 * @param {string} eventId - L'ID de l'événement
 */
export const deleteEvent = async (eventId) => {
  const res = await fetch(`${API_URL}/calendar/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La suppression de l\'événement a échoué');
  }
};

/**
 * Récupérer les événements à venir pour tous les projets
 * @param {number} days - Nombre de jours à l'avance (par défaut 7)
 */
export const getUpcomingEvents = async (days = 7) => {
  const res = await fetch(`${API_URL}/calendar/upcoming?days=${days}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la récupération des événements');
  }
};