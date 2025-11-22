import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { getUserProfile } from "../services/authService";
import { getUserProjects } from "../services/projectService";
import { getMesTaches } from "../services/taskService";
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CalendarIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const userData = await getUserProfile();
      setUser(userData);

      // Load projects
      const projectsData = await getUserProjects().catch(() => ({ projets: [] }));
      const projects = projectsData?.projets || [];

      // Load all tasks from all projects
      let allTasks = [];
      if (projects.length > 0) {
        const { getProjectTasks } = await import('../services/taskService');
        const tasksPromises = projects.map(project => 
          getProjectTasks(project._id).catch(() => ({ taches: [] }))
        );
        const tasksResults = await Promise.all(tasksPromises);
        tasksResults.forEach(result => {
          if (result && Array.isArray(result.taches)) {
            allTasks = [...allTasks, ...result.taches];
          }
        });
      }

      // Calculate stats
      const activeTasks = allTasks.filter(task => 
        task.statut !== 'Terminé' && task.statut !== 'Completed'
      ).length;

      const completedTasks = allTasks.filter(task => 
        task.statut === 'Terminé' || task.statut === 'Completed'
      ).length;

      setStats({
        totalProjects: projects.length,
        activeTasks,
        completedTasks,
      });

    } catch (error) {
      console.error("Error loading profile data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: "var(--text-main)" }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
        <GlassCard>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadProfileData}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Retry
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--page-bg)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>
            My Profile
          </h1>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <GlassCard>
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {user?.prenom?.[0]?.toUpperCase() || 'U'}
                    {user?.nom?.[0]?.toUpperCase() || 'N'}
                  </span>
                </div>

                {/* User Name */}
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-main)" }}>
                  {user?.prenom || ""} {user?.nom || ""}
                </h2>

                {/* Username */}
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                  @{user?.prenom?.toLowerCase() || "user"}-{user?.nom?.toLowerCase() || "name"}
                </p>

                {/* Role Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {user?.role === 'admin' ? 'Administrator' : 
                     user?.role === 'chef_projet' ? 'Project Manager' : 
                     'Team Member'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <EnvelopeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-sm truncate" style={{ color: "var(--text-main)" }}>
                      {user?.email || "No email"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <PhoneIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-sm" style={{ color: "var(--text-main)" }}>
                      {user?.telCode || "+216"} {user?.tel || "Not provided"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-sm" style={{ color: "var(--text-main)" }}>
                      Joined {formatDate(user?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Stats and Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <BriefcaseIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
                      {stats.totalProjects}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Tasks</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
                      {stats.activeTasks}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
                      {stats.completedTasks}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Account Details */}
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-main)" }}>
                Account Details
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">First Name</p>
                    <p className="font-medium" style={{ color: "var(--text-main)" }}>
                      {user?.prenom || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Name</p>
                    <p className="font-medium" style={{ color: "var(--text-main)" }}>
                      {user?.nom || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email Address</p>
                  <p className="font-medium" style={{ color: "var(--text-main)" }}>
                    {user?.email || "Not provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone Number</p>
                    <p className="font-medium" style={{ color: "var(--text-main)" }}>
                      {user?.telCode || "+216"} {user?.tel || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</p>
                    <p className="font-medium" style={{ color: "var(--text-main)" }}>
                      {user?.role === 'admin' ? 'Administrator' : 
                       user?.role === 'chef_projet' ? 'Project Manager' : 
                       'Team Member'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Member Since</p>
                  <p className="font-medium" style={{ color: "var(--text-main)" }}>
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-main)" }}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/projects')}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <BriefcaseIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium" style={{ color: "var(--text-main)" }}>
                      View My Projects
                    </span>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Cog6ToothIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium" style={{ color: "var(--text-main)" }}>
                      Edit Settings
                    </span>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;