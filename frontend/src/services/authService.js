// L'URL de base de votre API, SANS la partie '/users'
const API_URL = 'http://localhost:5000/api';

/**
 * Fonction pour l'inscription (Signup)
 * @param {object} userData - { nom, prenom, email, mot_de_passe, role }
 */
export const signup = async (userData) => {
  // On appelle directement la bonne URL, sans slash en trop
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (res.ok) {
    // Stocker l'utilisateur et le token pour une connexion automatique
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } else {
    // Utiliser le message d'erreur du backend s'il existe
    throw new Error(data.message || 'L\'inscription a échoué');
  }
};

/**
 * Fonction pour la connexion (Login)
 * @param {object} credentials - { email, mot_de_passe }
 */
export const login = async (credentials) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } else {
    throw new Error(data.message || 'La connexion a échoué');
  }
};

/**
 * Fonction pour demander la réinitialisation du mot de passe
 * @param {string} email
 */
export const requestPasswordReset = async (email) => {
  const res = await fetch(`${API_URL}/users/forgotpassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La demande a échoué');
  }
};

/**
 * Fonction pour réinitialiser le mot de passe
 * @param {string} token - Le token reçu par email
 * @param {string} newPassword - Le nouveau mot de passe
 */
export const resetPassword = async (token, newPassword) => {
  const res = await fetch(`${API_URL}/users/resetpassword/${token}`, {
    method: 'PUT', // La méthode doit être PUT, comme défini dans nos routes backend
    headers: {
      'Content-Type': 'application/json',
    },
    // Le nom du champ doit correspondre à ce que le backend attend
    body: JSON.stringify({ mot_de_passe: newPassword }),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'La réinitialisation a échoué');
  }
};

export const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token || null;
}

export const logout = () => {
  localStorage.removeItem('user');
}

/**
 * Fonction pour récupérer le profil de l'utilisateur connecté
 */
export const getUserProfile = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('Non authentifié');
  }

  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  // Vérifier le Content-Type avant de parser
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Erreur serveur: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la récupération du profil');
  }
};

/**
 * Fonction pour mettre à jour le profil de l'utilisateur
 * @param {object} userData - { nom, prenom, email, tel, telCode }
 */
export const updateUserProfile = async (userData) => {
  const token = getToken();
  if (!token) {
    throw new Error('Non authentifié');
  }

  const url = `${API_URL}/users/profile`;
  console.log('PUT request to:', url);
  console.log('Request data:', userData);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  console.log('Response status:', res.status);
  console.log('Response headers:', res.headers);

  // Vérifier le Content-Type avant de parser
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    console.error('Non-JSON response:', text);
    throw new Error(`Erreur serveur: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la mise à jour du profil');
  }
};

/**
 * Fonction pour mettre à jour le mot de passe
 * @param {string} currentPassword - Le mot de passe actuel
 * @param {string} newPassword - Le nouveau mot de passe
 */
export const updatePassword = async (currentPassword, newPassword) => {
  const token = getToken();
  if (!token) {
    throw new Error('Non authentifié');
  }

  const res = await fetch(`${API_URL}/users/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  // Vérifier le Content-Type avant de parser
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Erreur serveur: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || 'Erreur lors de la mise à jour du mot de passe');
  }
};