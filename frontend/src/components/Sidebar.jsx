import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  HomeIcon, 
  FolderIcon, 
  ChartBarIcon, 
  CogIcon, 
  UserCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Sidebar = ({ isCollapsed, setCollapsed }) => {
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (isMobile) setCollapsed(true); // Auto-collapse on mobile
  }, [isMobile, setCollapsed]);

  const menuItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/' },
    { icon: FolderIcon, label: 'Projects', path: '/projects' },
    { icon: ChartBarIcon, label: 'Reports', path: '/reports' },
    { icon: CogIcon, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <div className="text-xl font-bold text-gray-800 dark:text-white">ProjectMgr</div>
        ) : (
          <div className="w-6 h-6" />
        )}
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isCollapsed ? <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center w-full p-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <UserCircleIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
