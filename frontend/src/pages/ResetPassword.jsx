import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  // 1. Récupérer les outils de navigation et de paramètres d'URL
  const navigate = useNavigate();
  const { token } = useParams(); // Récupère le ':token' depuis l'URL

  // 2. Gérer l'état du formulaire et de la communication API
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // S'assurer que le token est bien présent dans l'URL
  useEffect(() => {
    if (!token) {
      setError("Le lien de réinitialisation est invalide ou manquant.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple côté client
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      // 3. Appeler la fonction du service avec le token et le nouveau mot de passe
      const data = await resetPassword(token, password);
      setMessage("Votre mot de passe a été réinitialisé avec succès !");

      // 4. Connecter automatiquement et rediriger l'utilisateur après un court délai
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Délai de 2 secondes pour que l'utilisateur puisse lire le message

    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-purple-100">
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/30 rounded-3xl shadow-2xl p-8 border border-white/40">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
              <p className="text-gray-700">Choose a new password for your account.</p>
            </div>

            {message && <div className="mb-4 text-center p-3 rounded-lg bg-green-100 text-green-800">{message}</div>}
            {error && <div className="mb-4 text-center p-3 rounded-lg bg-red-100 text-red-800">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Set New Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;