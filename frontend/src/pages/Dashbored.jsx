import { PlusIcon, ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const stats = [
    { name: 'Total Projects', value: '12', change: '+2', icon: ChartBarIcon, color: 'blue' },
    { name: 'Active Tasks', value: '45', change: '-3', icon: ChartBarIcon, color: 'green' },
    { name: 'Team Members', value: '8', change: '+1', icon: ChartBarIcon, color: 'purple' },
  ];

  const projects = [
    { name: 'Website Redesign', status: 'In Progress', progress: 75, members: 3 },
    { name: 'Mobile App', status: 'Planning', progress: 20, members: 5 },
    { name: 'API Integration', status: 'Completed', progress: 100, members: 2 },
  ];

  const recentActivity = [
    { time: '2h ago', action: 'John Doe completed task "Design UI"', icon: CheckCircleIcon },
    { time: '4h ago', action: 'Jane Smith added project "Mobile App"', icon: PlusIcon },
    { time: '1d ago', action: 'Team updated progress on "Website Redesign"', icon: ClockIcon },
  ];

  return (
    <div className="space-y-2 h-full w-full p-0">  {/* Reduced space-y-6 to space-y-2, full h/w, no padding */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2">  {/* Reduced gap/padding */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-start sm:self-auto">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">  {/* Reduced gap/padding */}
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow w-full">  {/* Full width */}
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last week
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 p-2">  {/* Reduced gap/padding */}
        {/* Projects Grid */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white p-2">Recent Projects</h3>  {/* Reduced mb/p */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">  {/* Reduced gap/p */}
            {projects.map((project, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow w-full">  {/* Full width */}
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{project.name}</h4>  {/* Reduced mb */}
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {project.status}
                </span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  {project.progress}% complete • {project.members} members
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full">  {/* Full width */}
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white p-2">Recent Activity</h3>  {/* Reduced mb/p */}
          <ul className="space-y-2">  {/* Reduced space-y */}
            {recentActivity.map((activity, i) => (
              <li key={i} className="flex items-start space-x-3 p-2">  {/* Added small p for readability */}
                <activity.icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full">  {/* Full width */}
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white p-2">Task Overview</h3>  {/* Reduced mb/p */}
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center p-2">  {/* Full height, minimal p */}
          <p className="text-gray-500 dark:text-gray-400">Chart Placeholder (Integrate Recharts or Chart.js here)</p>
          <div className="flex space-x-1 ml-auto mr-auto">
            {[10, 20, 15, 30, 25].map((val, i) => (
              <div key={i} className="w-4 bg-blue-500 rounded" style={{ height: `${val}px` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
