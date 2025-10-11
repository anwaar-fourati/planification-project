import { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  CheckIcon,
  Bars3Icon, 
  RectangleStackIcon 
} from '@heroicons/react/24/outline';
import { EyeIcon as EyeIconSolid } from '@heroicons/react/24/solid';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [projects, setProjects] = useState([
    { id: 1, name: 'Website Redesign', status: 'In Progress', dueDate: '2024-03-15', priority: 'High', members: 3, progress: 75 },
    { id: 2, name: 'Mobile App Development', status: 'Planning', dueDate: '2024-04-01', priority: 'Medium', members: 5, progress: 20 },
    { id: 3, name: 'API Integration', status: 'Completed', dueDate: '2024-02-28', priority: 'Low', members: 2, progress: 100 },
    { id: 4, name: 'Database Migration', status: 'In Progress', dueDate: '2024-03-20', priority: 'High', members: 4, progress: 50 },
  ]);

  // Filter and search logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Mock add project function
  const addProject = (formData) => {
    const newProject = {
      id: Date.now(),
      name: formData.name,
      status: formData.status,
      dueDate: formData.dueDate,
      priority: formData.priority || 'Medium',
      members: 1,
      progress: 0,
    };
    setProjects(prev => [...prev, newProject]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-2 h-full w-full p-0">  {/* Tight vertical space, full height/width, no padding */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 w-full">  {/* Minimal gap/padding, full width */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-0">Projects</h2>  {/* No margin bottom */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">Manage your projects and tasks</p>  {/* No margin */}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">  {/* Minimal p/gap, full width */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="planning">Planning</option>
            </select>
          </div>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FunnelIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title={viewMode === 'cards' ? 'Switch to Table View' : 'Switch to Card View'}
          >
            {viewMode === 'cards' ? <Bars3Icon className="w-5 h-5" /> : <RectangleStackIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Projects Content */}
      {viewMode === 'cards' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2 w-full h-full">  {/* Minimal gap/p, full width/height */}
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow w-full h-full">  {/* Full width/height per card */}
              <div className="flex justify-between items-start mb-2">  {/* Reduced mb */}
                <h4 className="font-medium text-gray-900 dark:text-white text-lg">{project.name}</h4>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-blue-500" title="View Details">
                    <EyeIconSolid className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-blue-500" title="Edit Project">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-500" title="Delete Project">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <div className="mt-2">  {/* Reduced mt */}
                <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>• {project.priority} Priority</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due: {project.dueDate}</p>  {/* Reduced mt */}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">  {/* Reduced mt */}
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{project.members} members</p>  {/* Reduced mt */}
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-4 p-2">  {/* Minimal py/p */}
              <p className="text-gray-500 dark:text-gray-400">No projects found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden w-full h-full p-2">  {/* Minimal p, full w/h */}
          <div className="overflow-x-auto h-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Name</th>  {/* Reduced px/py */}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Due Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Priority</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Progress</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{project.name}</td>  {/* Reduced px/py */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{project.dueDate}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span>{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">  {/* Reduced px/py */}
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" title="View Details">
                        <EyeIconSolid className="w-4 h-4 inline" />
                      </button>
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" title="Edit Project">
                        <PencilIcon className="w-4 h-4 inline" />
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title="Delete Project">
                        <TrashIcon className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProjects.length === 0 && (
            <div className="text-center py-4 p-2">  {/* Minimal py/p */}
              <p className="text-gray-500 dark:text-gray-400">No projects found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Project Modal – Unchanged, but overlays full screen without gaps */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0">  {/* No p for full overlay */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">  {/* Minimal p in modal */}
              <div className="flex justify-between items-center mb-2">  {/* Reduced mb */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Project</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form className="space-y-2" onSubmit={(e) => {  {/* Reduced space-y in form */}
                e.preventDefault(); 
                const formData = {
                  name: e.target.name.value,
                  description: e.target.description.value,
                  status: e.target.status.value,
                  priority: e.target.priority.value,
                  dueDate: e.target.dueDate.value,
                };
                if (formData.name && formData.dueDate) {
                  addProject(formData);
                  e.target.reset();
                } else {
                  alert('Please fill in the required fields: Name and Due Date.');
                }
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="Brief description of the project..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                                    <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Projects;