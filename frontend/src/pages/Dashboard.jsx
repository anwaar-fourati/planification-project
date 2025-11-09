import React from "react";
import GlassCard from "../components/GlassCard";
import { PlusIcon, ChartBarIcon, ClockIcon, CheckCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
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

  return (
    <div className="min-h-screen relative overflow-hidden font-sans p-6" style={{ background: "var(--page-bg)", color: "var(--text-main)" }}>
      <div className="absolute top-10 right-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-blob" style={{ backgroundColor: "rgba(124,58,237,0.25)" }}></div>
      <div className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-2000" style={{ backgroundColor: "rgba(236,72,153,0.18)" }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: "rgba(124,58,237,0.2)" }}></div>

      <div className="relative z-10 space-y-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>Unision Dashboard</h2>
          <button className="flex items-center px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-md" style={{ background: "linear-gradient(90deg,#7B61FF,#9B5CFF)", color: "#fff" }}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Create a new Project
          </button>
           <button className="flex items-center px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-md" style={{ background: "linear-gradient(90deg,#FF61B8,#FF8CBA)", color: "#fff" }}>
             <UserGroupIcon className="w-5 h-5 mr-2" />
            Participate in a Project
    </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-4">
              <div className="flex items-center">
                <div style={{ padding: 12, borderRadius: 9999, background: "var(--sidebar-bg)" }}>
                  <stat.icon className="w-6 h-6" style={{ color: "var(--sidebar-icon)" }} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>{stat.name}</p>
                  <p className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-emerald-600" : "text-pink-600"}`}>
                    {stat.change} from last week
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold pt-2 pl-2" style={{ color: "var(--text-main)" }}>Recent Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project, i) => (
                <GlassCard key={i} className="p-4">
                  <h4 className="font-semibold mb-2 text-lg" style={{ color: "var(--text-main)" }}>{project.name}</h4>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 ${project.status === "Completed" ? "bg-emerald-500/20 text-emerald-800" : project.status === "In Progress" ? "bg-purple-500/20 text-purple-800" : "bg-pink-500/20 text-pink-800"}`}>
                    {project.status}
                  </span>

                  <div className="w-full bg-gray-300 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-700 h-2.5 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                  </div>

                  <p className="text-sm mt-3" style={{ color: "var(--sidebar-text)" }}>
                    <span className="font-bold mr-1">{project.progress}%</span> complete • {project.members} members
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold pt-2 pl-2" style={{ color: "var(--text-main)" }}>Recent Activity</h3>
            <GlassCard className="mt-4">
              <ul className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <div className="p-2 rounded-full flex-shrink-0" style={{ background: "var(--sidebar-bg)" }}>
                      <activity.icon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: "var(--text-main)" }}>{activity.action}</p>
                      <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>

        <GlassCard>
          <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-main)" }}>Task Overview</h3>
          <div className="h-64 rounded-xl flex flex-col items-center justify-center p-4" style={{ background: "var(--box-bg)" }}>
            <p className="text-sm" style={{ color: "var(--sidebar-text)" }}>Task Completion Visualization</p>
            <div className="flex space-x-2 items-end h-full max-h-48 w-full max-w-sm">
              {[10,20,15,30,25,40,35].map((val,i)=>(
                <div key={i} className="w-8 rounded-t-lg transition-all duration-500" style={{ height: `${val*3}px`, backgroundColor: i%2===0 ? 'rgba(124,58,237,0.9)' : 'rgba(236,72,153,0.9)' }}></div>
              ))}
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Dashboard;
