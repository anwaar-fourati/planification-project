import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getUserProjects } from '../services/projectService';
import { getMesTaches, getProjectTasks } from '../services/taskService';
import { getUpcomingEvents } from '../services/calendarService';
import { 
  PlusIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  UserGroupIcon,
  PencilIcon as PencilIconOutline,
  ExclamationTriangleIcon
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentProjects: [],
    recentActivity: [],
    taskOverview: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Fetching dashboard data...');
      
      // D'abord récupérer les projets
      const projectsData = await getUserProjects().catch(err => {
        console.error('Error fetching projects:', err);
        return { projets: [] };
      });

      console.log('✅ Projects data:', projectsData);

      const projects = Array.isArray(projectsData?.projets) ? projectsData.projets : [];
      console.log(`📁 Found ${projects.length} projects`);

      // Récupérer TOUTES les tâches de TOUS les projets de l'utilisateur
      let allTasks = [];
      
      if (projects.length > 0) {
        console.log('🔄 Fetching tasks for all projects...');
        
        const tasksPromises = projects.map(project => 
          getProjectTasks(project._id).catch(err => {
            console.error(`Error fetching tasks for project ${project._id}:`, err);
            return { taches: [] };
          })
        );
        
        const tasksResults = await Promise.all(tasksPromises);
        
        // Combiner toutes les tâches
        tasksResults.forEach(result => {
          if (result && Array.isArray(result.taches)) {
            allTasks = [...allTasks, ...result.taches];
          }
        });
      }

      console.log(`📋 Found ${allTasks.length} total tasks across all projects`);

      // Récupérer les événements
      const eventsData = await getUpcomingEvents(7).catch(err => {
        console.error('Error fetching events:', err);
        return { evenements: [] };
      });

      console.log('✅ Events data:', eventsData);
      const events = Array.isArray(eventsData?.evenements) ? eventsData.evenements : [];
      console.log(`📅 Found ${events.length} events`);

      // Calculate total projects
      const totalProjects = projects.length;
      
      // Calculate active tasks (excluding completed)
      const activeTasks = allTasks.filter(task => 
        task.statut !== 'Terminé' && 
        task.statut !== 'Completed'
      ).length;
      
      console.log(`✅ Active tasks: ${activeTasks} out of ${allTasks.length}`);
      
      // Calculate unique team members
      const teamMembers = new Set();
      projects.forEach(project => {
        // Add creator
        if (project.createur && project.createur._id) {
          teamMembers.add(project.createur._id);
        }
        // Add all members
        if (Array.isArray(project.membres)) {
          project.membres.forEach(member => {
            if (member.utilisateur && member.utilisateur._id) {
              teamMembers.add(member.utilisateur._id);
            }
          });
        }
      });

      console.log(`👥 Found ${teamMembers.size} unique team members`);

      // Calculate project status distribution
      const projectsByStatus = projects.reduce((acc, project) => {
        const status = project.statut || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      console.log('📊 Projects by status:', projectsByStatus);

      // Prepare stats
      const stats = [
        { 
          name: "Total Projects", 
          value: totalProjects.toString(), 
          change: totalProjects > 0 ? "+0" : "0", 
          icon: ChartBarIcon 
        },
        { 
          name: "Active Tasks", 
          value: activeTasks.toString(), 
          change: activeTasks > 0 ? "+0" : "0", 
          icon: ClockIcon 
        },
        { 
          name: "Team Members", 
          value: teamMembers.size.toString(), 
          change: teamMembers.size > 0 ? "+0" : "0", 
          icon: UserGroupIcon 
        },
      ];

      // Prepare recent projects (last 3)
      const recentProjects = projects
        .slice(0, 3)
        .map(project => ({
          id: project._id,
          name: project.nom || 'Unnamed Project',
          status: project.statut || 'Unknown',
          progress: project.progression || 0,
          members: project.membres?.length || 0, // Le créateur est déjà inclus dans membres
          dueDate: project.dateEcheance
        }));

      // Prepare recent activity
      const recentActivity = [];
      
      // Add recent events
      events.slice(0, 3).forEach(event => {
        recentActivity.push({
          time: formatTimeAgo(new Date(event.dateDebut)),
          action: `Event: ${event.titre}`,
          icon: ClockIcon
        });
      });

      // Add recent completed tasks
      const completedTasks = allTasks
        .filter(task => task.statut === 'Terminé' || task.statut === 'Completed')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 2);
      
      completedTasks.forEach(task => {
        recentActivity.push({
          time: formatTimeAgo(new Date(task.updatedAt || task.createdAt)),
          action: `Completed: ${task.nom}`,
          icon: CheckCircleIcon
        });
      });

      // Prepare task overview
      const taskOverview = calculateTaskOverview(allTasks);

      console.log('✅ Dashboard data prepared:', {
        statsCount: stats.length,
        projectsCount: recentProjects.length,
        activityCount: recentActivity.length,
        taskOverviewCount: taskOverview.length
      });

      setDashboardData({
        stats,
        recentProjects,
        recentActivity,
        taskOverview
      });

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message);
      
      // Set fallback empty data
      setDashboardData({
        stats: [
          { name: "Total Projects", value: "0", change: "0", icon: ChartBarIcon },
          { name: "Active Tasks", value: "0", change: "0", icon: ClockIcon },
          { name: "Team Members", value: "0", change: "0", icon: UserGroupIcon },
        ],
        recentProjects: [],
        recentActivity: [],
        taskOverview: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const calculateTaskOverview = (tasks) => {
    const statusCount = {
      'À faire': 0,
      'En cours': 0,
      'Terminé': 0,
      'En attente': 0
    };

    tasks.forEach(task => {
      const status = task.statut || 'À faire';
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    const total = tasks.length;
    
    return Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));
  };

  const handleCreateProject = () => {
    setShowMenu(false);
    navigate('/projects', { state: { openCreate: true } });
  };

  const handleJoinProject = () => {
    setShowMenu(false);
    navigate('/projects', { state: { openJoin: true } });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": 
      case "Terminé":
        return "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200";
      case "In Progress":
      case "En cours":
        return "bg-purple-500/20 text-purple-800 dark:text-purple-200";
      case "Planning":
        return "bg-pink-500/20 text-pink-800 dark:text-pink-200";
      case "On Hold":
        return "bg-orange-500/20 text-orange-800 dark:text-orange-200";
      default:
        return "bg-gray-500/20 text-gray-800 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Blobs animés en arrière-plan */}
      <div className="absolute top-10 right-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-pulse bg-purple-400/25"></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-2000 bg-pink-400/18"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2 bg-purple-400/20"></div>

      <div className="relative z-10 space-y-4 max-w-7xl mx-auto">
        {/* En-tête avec bouton + */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Unision Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back! Here's your project overview.
            </p>
          </div>
          
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
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                
                <div 
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl shadow-2xl z-50 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 overflow-hidden"
                >
                  <div className="py-2">
                    <button 
                      onClick={handleJoinProject} 
                      className="w-full flex items-center px-5 py-4 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-200 border-b border-purple-200/50 dark:border-purple-700/50 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <UserGroupIcon className="w-6 h-6 mr-3 text-pink-500 flex-shrink-0" />
                      <span className="font-semibold">Rejoindre un projet</span>
                    </button>
                    
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

        {/* Message d'erreur */}
        {error && (
          <GlassCard className="bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </GlassCard>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboardData.stats.map((stat, i) => (
            <GlassCard key={i}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <stat.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  {parseInt(stat.value) > 0 && (
                    <p className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-emerald-600" : "text-gray-600"}`}>
                      {stat.change} from last week
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Projets récents et activité */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold pt-2 pl-2 text-gray-900 dark:text-white">Recent Projects</h3>
            {dashboardData.recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.recentProjects.map((project, i) => (
                  <GlassCard key={i}>
                    <h4 className="font-semibold mb-2 text-lg text-gray-900 dark:text-white">{project.name}</h4>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>

                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>

                    <p className="text-sm mt-3 text-gray-600 dark:text-gray-400">
                      <span className="font-bold mr-1">{project.progress}%</span> complete • {project.members} members
                    </p>

                    <button
                      onClick={() => navigate(`/projects/${project.id}/tasks`)}
                      className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm"
                    >
                      View Project
                    </button>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard>
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No projects yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    Start by creating your first project or join an existing one
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleCreateProject}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                    >
                      Create Project
                    </button>
                    <button
                      onClick={handleJoinProject}
                      className="px-6 py-2 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                    >
                      Join Project
                    </button>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold pt-2 pl-2 text-gray-900 dark:text-white">Recent Activity</h3>
            <GlassCard className="mt-4">
              {dashboardData.recentActivity.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.recentActivity.map((activity, i) => (
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
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Your activity will appear here
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Graphique des tâches */}
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Task Overview</h3>
          {dashboardData.taskOverview.length > 0 ? (
            <div className="rounded-xl p-6 bg-gray-50 dark:bg-gray-700/30">
              <div className="flex space-x-2 items-end h-48 justify-center mb-6">
                {dashboardData.taskOverview.map((task, i) => (
                  <div 
                    key={i} 
                    className="relative flex flex-col items-center group"
                  >
                    <div 
                      className="w-16 rounded-t-lg transition-all duration-500 hover:opacity-80 flex flex-col items-center justify-end relative" 
                      style={{ 
                        height: `${Math.max(task.percentage * 1.5, 10)}px`,
                        backgroundColor: i % 4 === 0 ? 'rgba(124,58,237,0.9)' : 
                                       i % 4 === 1 ? 'rgba(236,72,153,0.9)' :
                                       i % 4 === 2 ? 'rgba(16,185,129,0.9)' : 
                                       'rgba(251,146,60,0.9)'
                      }}
                    >
                      <span className="text-white text-sm font-bold mb-2">{task.count}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 text-center w-20">
                      {task.status}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {dashboardData.taskOverview.map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ 
                          backgroundColor: i % 4 === 0 ? 'rgba(124,58,237,0.9)' : 
                                         i % 4 === 1 ? 'rgba(236,72,153,0.9)' :
                                         i % 4 === 2 ? 'rgba(16,185,129,0.9)' : 
                                         'rgba(251,146,60,0.9)'
                        }}
                      ></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {task.status}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {task.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-xl flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/30">
              <CheckCircleIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">No tasks available</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Create tasks in your projects to see the overview
              </p>
            </div>
          )}
        </GlassCard>

      </div>
    </div>
  );
};

export default Dashboard;