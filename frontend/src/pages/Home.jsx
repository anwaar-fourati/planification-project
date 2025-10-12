import React, { useState } from 'react';
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  CubeTransparentIcon,
  SparklesIcon,
  RocketLaunchIcon,
  UsersIcon,
  Bars3Icon // <-- Ajout de l'icône manquante pour le menu mobile
} from '@heroicons/react/24/outline';

// --- Composant GlassCard Utility ---
// Utilisé pour créer les panneaux translucides de l'esthétique glassmorphism
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/60 transition-all duration-300 hover:shadow-2xl ${className}`}>
    {children}
  </div>
);

// --- Données Mock ---
const testimonials = [
  { id: 1, name: "Cindy Jeff", title: "Chef de Produit", review: "Unision a transformé la façon dont notre équipe collabore. La planification est plus rapide et les résultats sont visibles immédiatement. Vraiment impressionnant !", avatarUrl: "https://placehold.co/100x100/A78BFA/ffffff?text=CJ" },
  { id: 2, name: "François Marc", title: "Développeur Principal", review: "L'intégration des outils est sans couture. Moins de basculements entre les applications signifie plus de temps pour coder. Recommande fortement !", avatarUrl: "https://placehold.co/100x100/F472B6/ffffff?text=FM" },
  { id: 3, name: "Élisabeth Ma", title: "Designer UX/UI", review: "Le tableau de bord visuel est incroyable. Nous avons une vue d'ensemble claire de tous les projets en cours. Un must pour les équipes créatives.", avatarUrl: "https://placehold.co/100x100/6EE7B7/ffffff?text=EM" },
  { id: 4, name: "Luis Mendoza", title: "Responsable Marketing", review: "Simple et puissant. Nous avons pu lancer notre dernière campagne deux fois plus vite grâce à l'organisation des tâches d'Unision.", avatarUrl: "https://placehold.co/100x100/FBBF24/ffffff?text=LM" },
];

// --- Composant Principal ---
const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Custom CSS pour les blobs
  const BlobStyle = () => (
    <style>
      {`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.05); }
          66% { transform: translate(-30px, 20px) scale(0.95); }
        }
        .animate-blob-1 {
          animation: blob 8s infinite ease-in-out;
        }
        .animate-blob-2 {
          animation: blob 9s infinite reverse ease-in-out;
          animation-delay: 2s;
        }
        .animate-blob-3 {
          animation: blob 10s infinite ease-in-out;
          animation-delay: 4s;
        }
      `}
    </style>
  );

  const PrimaryButton = ({ children, className = '', onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl ${className}`}
    >
      {children}
    </button>
  );

  const SecondaryButton = ({ children, className = '', onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center px-6 py-3 border border-purple-500 text-purple-600 font-semibold bg-white/70 rounded-xl hover:bg-purple-50 transition-all duration-300 shadow-md hover:shadow-lg ${className}`}
    >
      {children}
    </button>
  );

  return (
    // Conteneur Thématique et Responsive
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 font-sans text-gray-800">
      <BlobStyle />

      {/* Blobs de fond animé */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob-1"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob-2"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-3"></div>

      {/* Contenu Principal (Z-index élevé) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-16">
        
        {/* --- 1. Barre de Navigation (Header) --- */}
        <header className="flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-gray-900 flex items-center">
            <CubeTransparentIcon className="w-8 h-8 mr-2 text-purple-600" />
            Unision
          </div>
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
            {['Produits', 'Solutions', 'Services', 'Pourquoi Unision', 'Tarifs'].map((item) => (
              <a key={item} href="#" className="hover:text-purple-600 transition-colors">{item}</a>
            ))}
            <a href="#" className="hover:text-purple-600 transition-colors border-l border-gray-300 pl-8">Connexion</a>
            <PrimaryButton className="py-2 px-4">
              Démarrer Gratuitement
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </PrimaryButton>
          </nav>
          
          {/* Menu Mobile */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-600">
            <Bars3Icon className="w-6 h-6" />
          </button>
        </header>
        
        {/* --- 2. Section Héro --- */}
        <section className="pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Colonne de Texte */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
                Gérez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">projets d'équipe</span>, avec succès.
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Notre plateforme unifiée aide les équipes à planifier, suivre et livrer leurs projets plus rapidement et plus efficacement.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <PrimaryButton>
                  Obtenir la démo
                </PrimaryButton>
                <SecondaryButton>
                  Voir les fonctionnalités
                </SecondaryButton>
              </div>
            </div>
            
            {/* Colonne d'Image/Carte */}
            <div className="relative p-4">
              <GlassCard className="p-0 overflow-hidden shadow-2xl">
                <img
                  src="https://placehold.co/800x400/9333ea/ffffff?text=Collaboration+d'Équipe"
                  alt="Équipe travaillant sur des projets"
                  className="w-full h-auto rounded-3xl"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x400/9333ea/ffffff?text=Collaboration+d'Équipe" }}
                />
              </GlassCard>
            </div>
          </div>
        </section>

        {/* --- 3. Section de Valeur/Fonctionnalités (2 colonnes) --- */}
        <section className="py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-8">
                <div className="flex items-center mb-4">
                    <SparklesIcon className="w-8 h-8 text-pink-500 mr-3" />
                    <h3 className="text-2xl font-bold">Profitez de votre temps de travail</h3>
                </div>
                <p className="text-gray-600 mb-6">
                    Votre plateforme aide les équipes à planifier, suivre et livrer leurs projets plus rapidement et plus efficacement, en créant un alignement et en optimisant les processus.
                </p>
                <a href="#" className="flex items-center text-purple-600 font-semibold hover:text-pink-600 transition-colors">
                    En savoir plus sur les fonctionnalités <ArrowRightIcon className="w-4 h-4 ml-2" />
                </a>
            </GlassCard>
            <GlassCard className="p-8">
                <div className="flex items-center mb-4">
                    <RocketLaunchIcon className="w-8 h-8 text-purple-500 mr-3" />
                    <h3 className="text-2xl font-bold">Développez votre potentiel</h3>
                </div>
                <p className="text-gray-600 mb-6">
                    Déléguez des tâches, suivez la progression en temps réel et gérez les ressources sans effort pour maximiser la productivité de chaque membre de l'équipe.
                </p>
                <a href="#" className="flex items-center text-purple-600 font-semibold hover:text-pink-600 transition-colors">
                    Voir les plans tarifaires <ArrowRightIcon className="w-4 h-4 ml-2" />
                </a>
            </GlassCard>
        </section>

        {/* --- 4. Section Visuelle Centrale (Hub des Outils) --- */}
        <section className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-gray-900">Obtenez tous les outils dont votre équipe a besoin.</h2>
                    <p className="text-lg text-gray-600">
                        Intégrez vos applications préférées, centralisez la communication et rationalisez les flux de travail pour une productivité maximale.
                    </p>
                    <ul className="space-y-2 pt-2">
                        <li className="flex items-center text-gray-700 font-medium"><CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2" /> Gestion de tâches flexible</li>
                        <li className="flex items-center text-gray-700 font-medium"><CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2" /> Rapports et analyses en temps réel</li>
                        <li className="flex items-center text-gray-700 font-medium"><CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2" /> Stockage de documents intégré</li>
                    </ul>
                    <a href="#" className="pt-4 flex items-center text-purple-600 font-semibold hover:text-pink-600 transition-colors">
                        Découvrez toutes les intégrations <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </a>
                </div>
                
                {/* Visualisation de l'outil (Radar Chart Mock) */}
                <div className="flex justify-center p-8">
                    <div className="w-full max-w-sm h-64 bg-white/70 rounded-full shadow-2xl flex items-center justify-center p-4 border border-white/60">
                        {/* Style pour simuler le graphique radar - Utilisation d'un dégradé et d'un SVG simple si possible */}
                        <div className="relative w-full h-full">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                {/* Fond du polygone principal (simulant le graphique radar) */}
                                <polygon points="50,5 90,30 80,70 50,95 20,70 10,30" fill="url(#purpleGradient)" stroke="url(#purpleStroke)" strokeWidth="1" />
                                {/* Définition des dégradés */}
                                <defs>
                                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{stopColor:'rgb(147,51,234)', stopOpacity:0.8}} />
                                        <stop offset="100%" style={{stopColor:'rgb(236,72,153)', stopOpacity:0.8}} />
                                    </linearGradient>
                                    <linearGradient id="purpleStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{stopColor:'rgb(147,51,234)', stopOpacity:1}} />
                                        <stop offset="100%" style={{stopColor:'rgb(236,72,153)', stopOpacity:1}} />
                                    </linearGradient>
                                </defs>
                                {/* Lignes de grille (mock) */}
                                <line x1="50" y1="5" x2="50" y2="95" stroke="#9CA3AF" strokeDasharray="1 1" strokeWidth="0.5" />
                                <line x1="10" y1="30" x2="80" y2="70" stroke="#9CA3AF" strokeDasharray="1 1" strokeWidth="0.5" />
                                <line x1="90" y1="30" x2="20" y2="70" stroke="#9CA3AF" strokeDasharray="1 1" strokeWidth="0.5" />
                                
                                {/* Points d'outils mock (petits cercles) */}
                                {[
                                  { cx: 50, cy: 5, color: 'text-purple-700' },
                                  { cx: 90, cy: 30, color: 'text-pink-600' },
                                  { cx: 80, cy: 70, color: 'text-emerald-500' },
                                  { cx: 50, cy: 95, color: 'text-purple-700' },
                                  { cx: 20, cy: 70, color: 'text-pink-600' },
                                  { cx: 10, cy: 30, color: 'text-emerald-500' },
                                ].map((p, i) => (
                                  <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="white" stroke={i % 2 === 0 ? '#9333ea' : '#ec4899'} strokeWidth="1" />
                                ))}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- 5. Section Callout/Bannière --- */}
        <section className="py-12">
            <div className="bg-gradient-to-r from-purple-700 to-pink-600 p-10 rounded-3xl shadow-2xl text-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold">Les problèmes viennent et sont résolus facilement</h2>
                        <p className="text-purple-200 text-lg">
                            De la gestion des bogues au lancement de produits, Unision est conçu pour gérer n'importe quel flux de travail avec clarté et efficacité.
                        </p>
                    </div>
                    <div className="flex justify-start lg:justify-end">
                        <PrimaryButton className="bg-white text-purple-600 hover:bg-gray-100 transition-colors shadow-none hover:shadow-lg">
                            Démarrer la période d'essai
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </section>
        
        {/* --- 6. Section Améliorer le Flux de Travail --- */}
        <section className="py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">Améliorez le flux de travail.</h2>
                <p className="text-lg text-gray-600 max-w-lg">
                    Chaque équipe, chaque projet. Nous vous fournissons la bonne structure pour une livraison rapide, une collaboration transparente et des résultats exceptionnels.
                </p>
                <a href="#" className="pt-2 flex items-center text-purple-600 font-semibold hover:text-pink-600 transition-colors">
                    Consulter nos modèles <ArrowRightIcon className="w-4 h-4 ml-2" />
                </a>
            </div>
            <div className="relative p-4">
                <GlassCard className="p-0 overflow-hidden shadow-2xl">
                    <img
                        src="https://placehold.co/800x400/9333ea/ffffff?text=Amélioration+du+Flux+de+Travail"
                        alt="Membres de l'équipe collaborant en personne"
                        className="w-full h-auto rounded-3xl"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x400/9333ea/ffffff?text=Amélioration+du+Flux+de+Travail" }}
                    />
                </GlassCard>
            </div>
        </section>

        {/* --- 7. Section Témoignages --- */}
        <section className="py-12">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Témoignages de Clients</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t) => (
                <GlassCard key={t.id} className="p-6 text-center hover:bg-white/80 transition-colors">
                  <img
                    src={t.avatarUrl}
                    alt={`Avatar de ${t.name}`}
                    className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/${t.avatarUrl.split('/')[3].substring(0,6)}/ffffff?text=${t.name.substring(0,1)}${t.title.substring(0,1)}` }}
                  />
                  <p className="text-lg italic text-gray-700 mb-4">"{t.review}"</p>
                  <p className="font-bold text-purple-600">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.title}</p>
                </GlassCard>
              ))}
            </div>
        </section>
        
        {/* --- 8. Section Rejoindre la Communauté (CTA Final) --- */}
        <section className="py-16">
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-10 rounded-3xl shadow-2xl text-center text-white">
                <h2 className="text-3xl font-bold mb-3">Rejoignez la communauté aujourd'hui</h2>
                <p className="text-purple-300 mb-6 max-w-2xl mx-auto">
                    Transformez la gestion de votre équipe. Essayez Unision gratuitement pendant 14 jours, sans engagement.
                </p>
                <PrimaryButton className="mx-auto bg-pink-500 hover:bg-pink-600 transition-all duration-300">
                    S'inscrire Maintenant
                </PrimaryButton>
            </div>
        </section>
        
        {/* --- 9. Pied de Page (Footer) --- */}
        <footer className="py-8 border-t border-purple-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 space-y-4 md:space-y-0">
            <p>Unision @ 2025. Tous droits réservés.</p>
            <div className="flex space-x-6">
              {['Termes', 'Confidentialité', 'Support', 'À Propos', 'Ressources', 'Contact'].map(item => (
                <a key={item} href="#" className="hover:text-purple-600 transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default HomePage;
