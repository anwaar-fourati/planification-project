// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { getToken, logout as logoutService } from '../services/authService';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = () => {
//     const token = getToken();
//     if (token) {
//       try {
//         // Decode JWT token to get user info
//         const payload = JSON.parse(atob(token.split('.')[1]));
        
//         // Check if token is expired
//         if (payload.exp * 1000 < Date.now()) {
//           logoutService();
//           setUser(null);
//         } else {
//           setUser({
//             id: payload.id,
//             token: token
//           });
//         }
//       } catch (error) {
//         console.error('Error decoding token:', error);
//         logoutService();
//         setUser(null);
//       }
//     }
//     setLoading(false);
//   };

//   const login = (userData) => {
//     setUser(userData);
//   };

//   const logout = () => {
//     logoutService();
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };