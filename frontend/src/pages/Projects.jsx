import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  CheckIcon,
  Bars3Icon, 
  RectangleStackIcon, 
  ClockIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { EyeIcon as EyeIconSolid } from '@heroicons/react/24/solid';

// Utility component for the glass-style card wrapper (reused from Dashboard)
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/60 transition-all duration-300 hover:shadow-2xl ${className}`}>
    {children}
  </div>
);

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [projects, setProjects] = useState([
    { id: 1, name: 'Website Redesign', status: 'In Progress', dueDate: '2025-10-15', priority: 'High', members: 3, progress: 75 },
    { id: 2, name: 'Mobile App Development', status: 'Planning', dueDate: '2025-11-01', priority: 'Medium', members: 5, progress: 20 },
    { id: 3, name: 'API Integration', status: 'Completed', dueDate: '2025-09-28', priority: 'Low', members: 2, progress: 100 },
    { id: 4, name: 'Database Migration', status: 'In Progress', dueDate: '2025-10-20', priority: 'High', members: 4, progress: 50 },
  ]);

  // Filter and search logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Updated Status Colors for Unision Theme
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/20 text-emerald-800 font-bold';
      case 'In Progress': return 'bg-purple-500/20 text-purple-800 font-bold';
      case 'Planning': return 'bg-pink-500/20 text-pink-800 font-bold';
      default: return 'bg-gray-200 text-gray-800 font-bold';
    }
  };

  // Updated Priority Colors for Unision Theme
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-pink-600'; // Strongest accent color
      case 'Medium': return 'text-purple-600';
      case 'Low': return 'text-emerald-600';
      default: return 'text-gray-600';
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
  
  // Custom component for the project card content (for reusability and clean structure)
  const ProjectCardContent = ({ project }) => (
    <>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-xl">{project.name}</h4>
        <div className="flex space-x-1 flex-shrink-0">
          <button className="p-2 text-gray-600 hover:text-purple-600 rounded-full transition-colors" title="View Details">
            <EyeIconSolid className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-purple-600 rounded-full transition-colors" title="Edit Project">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-pink-600 rounded-full transition-colors" title="Delete Project">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
        {project.status}
      </span>
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600 flex items-center">
          <WrenchScrewdriverIcon className="w-4 h-4 mr-2 text-purple-500" />
          <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>{project.priority} Priority</span>
        </p>
        <p className="text-sm text-gray-600 flex items-center">
          <CalendarDaysIcon className="w-4 h-4 mr-2 text-purple-500" />
          Due: {project.dueDate}
        </p>
      </div>
      
      <div className="w-full bg-gray-300 rounded-full h-2.5 mt-4 mb-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${project.progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 font-semibold">{project.progress}% complete</p>
    </>
  );

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
      
      {/* Projects Content Area */}
      <div className="relative z-10 space-y-4 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Project Workspace</h2>
            <p className="text-md text-gray-600">Manage all team deliverables and track progress.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg self-start sm:self-auto"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Project
          </button>
        </div>

        {/* Filters and Search (Using GlassCard) */}
        <GlassCard className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-none shadow-lg">
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search projects by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/70 border border-purple-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-800 placeholder-gray-600"
            />
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none px-4 py-3 bg-white/70 border border-purple-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-800"
              >
                <option value="all">All Status</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="planning">Planning</option>
              </select>
              <FunnelIcon className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
            </div>
            
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className={`p-3 rounded-2xl transition-all duration-300 ${viewMode === 'cards' ? 'bg-purple-600 text-white shadow-md' : 'bg-white/70 text-purple-600 hover:bg-purple-100'}`}
              title={viewMode === 'cards' ? 'Switch to List View' : 'Switch to Card View'}
            >
              {viewMode === 'cards' ? <Bars3Icon className="w-6 h-6" /> : <RectangleStackIcon className="w-6 h-6" />}
            </button>
          </div>
        </GlassCard>

        {/* Projects Content */}
        {viewMode === 'cards' ? (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {filteredProjects.map((project) => (
              <GlassCard key={project.id} className="p-5 flex flex-col justify-between">
                <ProjectCardContent project={project} />
              </GlassCard>
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600 text-lg">No projects found matching your criteria. Start a new one!</p>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <GlassCard className="p-2 overflow-hidden border-none shadow-lg">
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-purple-300">
                <thead className="bg-white/80 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200/50">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1 text-purple-400" />
                        {project.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-300 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button className="text-purple-600 hover:text-pink-600 transition-colors" title="View Details">
                          <EyeIconSolid className="w-5 h-5 inline" />
                        </button>
                        <button className="text-purple-600 hover:text-pink-600 transition-colors" title="Edit Project">
                          <PencilIcon className="w-5 h-5 inline" />
                        </button>
                        <button className="text-pink-600 hover:text-red-700 transition-colors" title="Delete Project">
                          <TrashIcon className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProjects.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">No projects found matching your criteria. Start a new one!</p>
              </div>
            )}
          </GlassCard>
        )}

        {/* Add Project Modal (Using GlassCard for content) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-8 border-none shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Project</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-800 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <form className="space-y-4" onSubmit={(e) => {
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
                  console.error('Project Name and Due Date are required.'); // Replaced alert()
                }
              }}>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Project Name <span className="text-pink-600">*</span></label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-white/70 border border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-800"
                    placeholder="E.g., Unision Design System"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full px-4 py-3 bg-white/70 border border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-800"
                    placeholder="Brief description of the project..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                        <select
                          name="status"
                          className="w-full px-4 py-3 bg-white/70 border border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-800"
                        >
                          <option value="Planning">Planning</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Priority</label>
                        <select
                          name="priority"
                          className="w-full px-4 py-3 bg-white/70 border border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-800"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Due Date <span className="text-pink-600">*</span></label>
                        <input
                          type="date"
                          name="dueDate"
                          required
                          className="w-full px-4 py-3 bg-white/70 border border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-gray-800"
                        />
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 text-gray-700 font-semibold bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                  >
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                    Create Project
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};
export default Projects;
