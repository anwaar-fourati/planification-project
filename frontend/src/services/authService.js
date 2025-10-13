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