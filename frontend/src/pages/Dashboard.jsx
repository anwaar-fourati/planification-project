import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  UserGroupIcon,
  PencilIcon as PencilIconOutline 
} from "@heroicons/react/24/outline";

// GlassCard Component
const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 p-4 ${className}`}>
      {children}
    </div>
  );
};

const Dashboard = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const stats = [
    { name: "Total Projects", value: "12", change: "+2", icon: ChartBarIcon },
    { name: "Active Tasks", value: "45", change: "-3", icon: ClockIcon },
    { name: "Team Members", value: "8", change: "+1", icon: UserGroupIcon },
  ];

  const projects = [
    { name: "Website Redesign", status: "In Progress", progress: 75, members: 3 },
    { name: "Mobile App", status: "Planning", progress: 20, members: 5 },
    { name: "API Integration", status: "Completed", progress: 100, members: 2 },
  ];

  const recentActivity = [
    { time: "2h ago", action: 'John Doe completed task "Design UI"', icon: CheckCircleIcon },
    { time: "4h ago", action: 'Jane Smith added project "Mobile App"', icon: PlusIcon },
    { time: "1d ago", action: 'Team updated progress on "Website Redesign"', icon: ClockIcon },
  ];

  const handleCreateProject = () => {
    setShowMenu(false);
    // Navigue vers la page Projects et demande l'ouverture du modal de création
    navigate('/projects', { state: { openCreate: true } });
  };

  const handleJoinProject = () => {
    setShowMenu(false);
    // Navigue vers la page Projects et demande l'ouverture du modal de rejoindre
    navigate('/projects', { state: { openJoin: true } });
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Blobs animés en arrière-plan */}
      <div className="absolute top-10 right-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-pulse bg-purple-400/25"></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-2000 bg-pink-400/18"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2 bg-purple-400/20"></div>

      <div className="relative z-10 space-y-4 max-w-7xl mx-auto">
        {/* En-tête avec bouton + */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Unision Dashboard</h2>
          
          {/* Bouton + avec menu déroulant */}
          <div className="relative z-[100]">
            <button 
              onClick={() => setShowMenu(prev => !prev)} 
              className="flex items-center p-3 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 focus:ring-4 focus:ring-purple-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              aria-expanded={showMenu}
            >
              <PlusIcon className="w-6 h-6" />
            </button>
            
            {showMenu && (
              <>
                {/* Backdrop pour fermer le menu */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Menu déroulant */}
                <div 
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl shadow-2xl z-50 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 overflow-hidden"
                >
                  <div className="py-2">
                    {/* Option Rejoindre un projet */}
                    <button 
                      onClick={handleJoinProject} 
                      className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 border-b border-purple-200/50 dark:border-purple-700/50 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <UserGroupIcon className="w-6 h-6 mr-3 text-pink-500 flex-shrink-0" />
                      <span className="font-semibold">Rejoindre un projet</span>
                    </button>
                    
                    {/* Option Créer un projet */}
                    <button 
                      onClick={handleCreateProject} 
                      className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <PencilIconOutline className="w-6 h-6 mr-3 text-purple-500 flex-shrink-0" />
                      <span className="font-semibold">Créer un projet</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <stat.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-emerald-600" : "text-pink-600"}`}>
                    {stat.change} from last week
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Projets récents et activité */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold pt-2 pl-2 text-gray-900 dark:text-white">Recent Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project, i) => (
                <GlassCard key={i}>
                  <h4 className="font-semibold mb-2 text-lg text-gray-900 dark:text-white">{project.name}</h4>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 ${
                    project.status === "Completed" 
                      ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200" 
                      : project.status === "In Progress" 
                      ? "bg-purple-500/20 text-purple-800 dark:text-purple-200" 
                      : "bg-pink-500/20 text-pink-800 dark:text-pink-200"
                  }`}>
                    {project.status}
                  </span>

                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                  </div>

                  <p className="text-sm mt-3 text-gray-600 dark:text-gray-400">
                    <span className="font-bold mr-1">{project.progress}%</span> complete • {project.members} members
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold pt-2 pl-2 text-gray-900 dark:text-white">Recent Activity</h3>
            <GlassCard className="mt-4">
              <ul className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <div className="p-2 rounded-full flex-shrink-0 bg-purple-100 dark:bg-purple-900/30">
                      <activity.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>

        {/* Graphique des tâches */}
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Task Overview</h3>
          <div className="h-64 rounded-xl flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Task Completion Visualization</p>
            <div className="flex space-x-2 items-end h-full max-h-48 w-full max-w-sm justify-center">
              {[10,20,15,30,25,40,35].map((val,i)=>(
                <div 
                  key={i} 
                  className="w-8 rounded-t-lg transition-all duration-500 hover:opacity-80" 
                  style={{ 
                    height: `${val*3}px`, 
                    backgroundColor: i%2===0 ? 'rgba(124,58,237,0.9)' : 'rgba(236,72,153,0.9)' 
                  }}
                ></div>
              ))}
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Dashboard;