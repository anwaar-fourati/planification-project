import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  // MODIFICATION 1: Ajouter un état pour les erreurs
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Réinitialiser les erreurs à chaque soumission

    try {
      const payload = {
        email: formData.email,
        mot_de_passe: formData.password
      };

      const data = await login(payload);
      console.log("Login successful:", data);
      
      // La fonction de service a stocké le token, on redirige vers le dashboard
      navigate('/projects');

    } catch (err) {
      console.error("Login error:", err.message);
      // MODIFICATION 2: Mettre à jour l'état d'erreur au lieu d'utiliser alert()
      setError(err.message);
    }
  };

  // ... (Vos icônes EyeIcon et EyeSlashIcon ne changent pas)
  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const EyeSlashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200">
      {/* ... (Vos décorations ne changent pas) ... */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl flex items-center justify-between gap-12">
          
          <div className="flex-1 hidden lg:block">
            <h1 className="text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Welcome Back !
            </h1>
            <Link to="/" className="px-8 py-3 border-2 border-gray-900 text-gray-900 text-lg font-medium hover:bg-gray-900 hover:text-white transition-all duration-300 italic">
              Skip the lag ?
            </Link>
          </div>

          <div className="w-full max-w-md">
            <div className="backdrop-blur-xl bg-white/30 rounded-3xl shadow-2xl p-8 border border-white/40">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
                <p className="text-gray-700">Glad you're back !</p>
              </div>

              {/* MODIFICATION 3: Afficher le message d'erreur */}
              {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center mb-4">{error}</p>}

              {/* MODIFICATION 4: Utiliser une balise <form> avec onSubmit */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                    type="email" // Changer "text" en "email" pour une meilleure validation par le navigateur
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-white/50 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgotpassword" className="text-sm text-gray-700 hover:text-purple-700 transition-colors hover:underline">
                    Forgot password ?
                  </Link>
                </div>

                {/* MODIFICATION 5: Changer le type du bouton en "submit" */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Login
                </button>
              </form>
              
              {/* ... (Votre Divider, Social Login et Footer ne changent pas) ... */}
              <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-400"></div>
                  <span className="text-sm text-gray-600">Or</span>
                  <div className="flex-1 h-px bg-gray-400"></div>
              </div>
              <div className="flex justify-center gap-4">
                  {/* ... vos boutons sociaux ... */}
              </div>
              <div className="mt-8 text-center space-y-4">
                <p className="text-sm text-gray-700">
                  Don't have an account ? <Link to="/signup" className="text-purple-700 font-semibold hover:underline">Signup</Link>
                </p>
                {/* ... le reste du footer ... */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;