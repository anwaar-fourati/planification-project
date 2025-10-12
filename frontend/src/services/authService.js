const API_URL = 'http://localhost:5000/api/users';

export const signup = async (userData) => {
  const res = await fetch(`${API_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('token', data.token);
        return data;
    } else {
        throw new Error(data.message || 'Signup failed');
    }
};

export const login = async (credentials) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('token', data.token);
        return data;
    } else {
        throw new Error(data.message || 'Login failed');
    }
};

export const requestPasswordReset = async (email) => {
  const res = await fetch(`${API_URL}/forgotpassword`, {
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
        throw new Error(data.message || 'Password reset request failed');
    }
};

export const resetPassword = async (token, newPassword) => {
    const res = await fetch(`${API_URL}/resetpassword/${token}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword }),
  });
    const data = await res.json();
    if (res.ok) {
        return data;
    } else {
        throw new Error(data.message || 'Password reset failed');
    }
};

export const getToken = () => {
  return localStorage.getItem('token');
}

export const logout = () => {
  localStorage.removeItem('token');
}