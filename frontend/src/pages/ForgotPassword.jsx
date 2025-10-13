import { useState } from 'react';
import { requestPasswordReset } from '../services/authService'; // 1. Importer la fonction du service
import { Link } from 'react-router-dom'; // Pour les liens de navigation

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  // 2. Ajouter des états pour gérer le chargement et les messages de succès/erreur
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Toujours utiliser preventDefault dans un formulaire
    
    // Réinitialiser les messages précédents
    setMessage('');
    setError('');
    
    // Activer l'état de chargement
    setLoading(true);

    try {
      // 3. Appeler la fonction du service avec l'email fourni
      const data = await requestPasswordReset(email);
      setMessage(data.message || 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      // 4. Désactiver l'état de chargement à la fin, que ça réussisse ou non
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-purple-100">
      {/* ... (vos cercles décoratifs ne changent pas) ... */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl flex items-center justify-between gap-12">
          
          <div className="flex-1 hidden lg:block">
            <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
              No Worries.!!
            </h1>
            <Link to="/login" className="px-6 py-3 border-2 border-gray-900 text-gray-900 text-lg font-medium hover:bg-gray-900 hover:text-white transition-all duration-300 italic">
              Take me back.!
            </Link>
          </div>

          <div className="w-full max-w-md">
            <div className="backdrop-blur-xl bg-white/30 rounded-3xl shadow-2xl p-8 border border-white/40">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password ?</h2>
                <p className="text-gray-700">Please enter your email</p>
              </div>

              {/* 5. Gérer l'affichage des messages de succès et d'erreur */}
              {message && <div className="mb-4 text-center p-3 rounded-lg bg-green-100 text-green-800">{message}</div>}
              {error && <div className="mb-4 text-center p-3 rounded-lg bg-red-100 text-red-800">{error}</div>}

              {/* On utilise une balise <form> pour une meilleure sémantique */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required // Ajout de la validation HTML5
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600"
                />

                <button
                  type="submit" // Le bouton est de type "submit"
                  disabled={loading} // Le bouton est désactivé pendant le chargement
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <p className="text-sm text-gray-700">
                  Don’t have an account? <Link to="/signup" className="text-purple-700 font-semibold hover:underline">Signup</Link>
                </p>
                {/* ... (votre footer) ... */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;