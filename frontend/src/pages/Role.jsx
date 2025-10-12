import React, { useState } from 'react';

// Main component mirroring the styling and structure of the Signup page
const RoleSelection = () => {
  // Use state to track the selected role, mimicking the state pattern from the original component
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    console.log(`Role selected: ${role}`);
    // In a real application, this would navigate the user or store the selection
  };

  const handleReturn = () => {
    console.log('User returned to previous page or step.');
    // In a real application, this would handle navigation back
  };

  // --- Background and Layout Setup ---
  return (
    // Background container: full screen, responsive, with gradient and animations
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 font-sans">
      
      {/* Decorative blurred circles (copied from original pattern) */}
      {/* Note: I'm adding keyframes for the blob animation here using custom CSS in the single file */}
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
      
      {/* Top Right Blob (Purple) */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      {/* Bottom Left Blob (Pink) */}
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      {/* Center Blob (Darker Purple) */}
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2"></div>


      {/* Main Content Area: Centering the card */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        
        {/* Central Card Container */}
        <div className="w-full max-w-md">
          {/* Glassmorphism Card Style (copied from original pattern) */}
          <div className="backdrop-blur-xl bg-white/30 rounded-3xl shadow-2xl p-10 lg:p-12 border border-white/40 relative">
            
            {/* Header / Title Section */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-serif italic font-bold text-gray-900 mb-2">
                welcome to unision
              </h1>
              <p className="text-gray-700 text-lg tracking-wider">
                Team Planning and Management System
              </p>
            </div>

            {/* Role Selection Prompt */}
            <p className="text-center text-gray-700 text-sm mb-6 uppercase tracking-wider font-medium">
              select your role please
            </p>

            {/* --- Role Buttons --- */}
            <div className="space-y-4">
              
              {/* Lead The Team Button */}
              <button
                onClick={() => handleRoleSelect('lead')}
                className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 shadow-md 
                  ${selectedRole === 'lead'
                    ? 'bg-purple-800 text-white shadow-xl'
                    : 'bg-purple-600/80 hover:bg-purple-700 text-white'
                  }`}
              >
                lead the team
              </button>

              {/* Join The Team Button */}
              <button
                onClick={() => handleRoleSelect('join')}
                className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 shadow-md 
                  ${selectedRole === 'join'
                    ? 'bg-purple-800 text-white shadow-xl'
                    : 'bg-purple-600/80 hover:bg-purple-700 text-white'
                  }`}
              >
                Join the Team
              </button>
            </div>
            
            {/* Return Link/Button */}
            <button
              onClick={handleReturn}
              className="absolute bottom-5 right-10 text-gray-600 hover:text-purple-700 transition-colors text-sm font-medium mt-6"
            >
              return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
