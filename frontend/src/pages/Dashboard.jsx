import React from 'react';
import { PlusIcon, ChartBarIcon, ClockIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

// Utility component for the glass-style card wrapper
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/60 transition-all duration-300 hover:shadow-2xl ${className}`}>
    {children}
  </div>
);

const Dashboard = () => {
  // Update stats data to use purple accent and a more defined color mapping
  const stats = [
    // Changed color from 'blue' to 'purple'
    { name: 'Total Projects', value: '12', change: '+2', icon: ChartBarIcon, color: 'purple' }, 
    { name: 'Active Tasks', value: '45', change: '-3', icon: ClockIcon, color: 'pink' }, // Changed icon to ClockIcon
    { name: 'Team Members', value: '8', change: '+1', icon: UserGroupIcon, color: 'emerald' }, // Changed icon to UserGroupIcon
  ];

  const projects = [
    { name: 'Website Redesign', status: 'In Progress', progress: 75, members: 3 },
    { name: 'Mobile App', status: 'Planning', progress: 20, members: 5 },
    { name: 'API Integration', status: 'Completed', progress: 100, members: 2 },
  ];

  const recentActivity = [
    { time: '2h ago', action: 'John Doe completed task "Design UI"', icon: CheckCircleIcon, color: 'emerald' },
    { time: '4h ago', action: 'Jane Smith added project "Mobile App"', icon: PlusIcon, color: 'pink' },
    { time: '1d ago', action: 'Team updated progress on "Website Redesign"', icon: ClockIcon, color: 'purple' },
  ];

  return (
    // Outer Container matching the theme background
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 font-sans p-6">
      
      {/* Custom CSS for blob animation */}
      <style>
        {`
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}
      </style>
      
      {/* Decorative blurred circles (Blobs) */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Dashboard Content Area */}
      <div className="relative z-10 space-y-4 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Unision Dashboard</h2>
          <button className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg self-start sm:self-auto">
            <PlusIcon className="w-5 h-5 mr-2" />
            New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${stat.color}-200`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-700">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-pink-600'}`}>
                    {stat.change} from last week
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Projects Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 pt-2 pl-2">Recent Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project, i) => (
                <GlassCard key={i} className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">{project.name}</h4>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 ${
                    project.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-800' :
                    project.status === 'In Progress' ? 'bg-purple-500/20 text-purple-800' :
                    'bg-pink-500/20 text-pink-800'
                  }`}>
                    {project.status}
                  </span>
                  
                  <div className="w-full bg-gray-300 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-700 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3 flex items-center">
                    <span className="font-bold mr-1">{project.progress}%</span> complete • {project.members} members
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 pt-2 pl-2">Recent Activity</h3>
            <GlassCard className="mt-4">
              <ul className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-${activity.color}-100 flex-shrink-0`}>
                      <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>

        {/* Chart Placeholder (using GlassCard style) */}
        <GlassCard>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Task Overview</h3>
          <div className="h-64 bg-white/60 rounded-xl flex flex-col items-center justify-center p-4 shadow-inner">
            <p className="text-gray-600 mb-4">Task Completion Visualization</p>
            {/* Simple purple/pink chart simulation */}
            <div className="flex space-x-2 items-end h-full max-h-48 w-full max-w-sm">
              {[10, 20, 15, 30, 25, 40, 35].map((val, i) => (
                <div key={i} 
                  className="w-8 rounded-t-lg transition-all duration-500 hover:scale-y-105" 
                  style={{ 
                    height: `${val * 3}px`, 
                    backgroundColor: i % 2 === 0 ? 'rgba(124, 58, 237, 0.8)' : 'rgba(236, 72, 153, 0.8)' 
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
