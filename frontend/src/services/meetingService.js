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
 * Récupérer toutes les salles de réunion de l'utilisateur
 */
export const getMesSallesReunion = async () => {
  const res = await fetch(`${API_URL}/meetings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la récupération des salles');
  }
};

/**
 * Récupérer une salle de réunion spécifique
 * @param {string} roomId - L'ID de la salle
 */
export const getSalleReunion = async (roomId) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Salle non trouvée');
  }
};

/**
 * Rejoindre une salle avec un code
 * @param {string} codeAcces - Le code d'accès
 */
export const rejoindreSalleAvecCode = async (codeAcces) => {
  const res = await fetch(`${API_URL}/meetings/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ codeAcces }),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la jonction');
  }
};

/**
 * Démarrer une réunion
 * @param {string} roomId - L'ID de la salle
 * @param {object} settings - Paramètres micro/caméra
 */
export const demarrerReunion = async (roomId, settings = {}) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors du démarrage');
  }
};

/**
 * Rejoindre une réunion en cours
 * @param {string} roomId - L'ID de la salle
 * @param {object} settings - Paramètres micro/caméra
 */
export const rejoindreReunion = async (roomId, settings = {}) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}/join-meeting`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la jonction');
  }
};

/**
 * Quitter une réunion
 * @param {string} roomId - L'ID de la salle
 */
export const quitterReunion = async (roomId) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}/leave-meeting`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur');
  }
};

/**
 * Terminer une réunion (hôte uniquement)
 * @param {string} roomId - L'ID de la salle
 */
export const terminerReunion = async (roomId) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}/end`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur');
  }
};

/**
 * Envoyer un message dans le chat
 * @param {string} roomId - L'ID de la salle
 * @param {string} contenu - Le contenu du message
 */
export const envoyerMessage = async (roomId, contenu) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ contenu, type: 'text' }),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur');
  }
};

/**
 * Récupérer les messages d'une salle
 * @param {string} roomId - L'ID de la salle
 * @param {number} limit - Nombre de messages
 */
export const getMessages = async (roomId, limit = 50) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}/messages?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur');
  }
};

/**
 * Mettre à jour les paramètres de la salle
 * @param {string} roomId - L'ID de la salle
 * @param {object} settings - Les nouveaux paramètres
 */
export const updateParametres = async (roomId, settings) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur');
  }
};

/**
 * Récupérer l'historique des réunions
 * @param {string} roomId - L'ID de la salle
 */
export const getHistorique = async (roomId) => {
  const res = await fetch(`${API_URL}/meetings/${roomId}/history`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur');
  }
};