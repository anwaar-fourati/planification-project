import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesSallesReunion, demarrerReunion, rejoindreReunion } from '../services/meetingService';
import {
  VideoCameraIcon,
  UserGroupIcon,
  ClockIcon,
  SignalIcon,
  ChartBarIcon,
  PlayIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// GlassCard Component
const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 ${className}`}>
      {children}
    </div>
  );
};

const Meetings = () => {
  const navigate = useNavigate();
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joiningRoomId, setJoiningRoomId] = useState(null);

  // Auto-refresh every 10 seconds to update live meeting status
  useEffect(() => {
    fetchSalles();
    const interval = setInterval(fetchSalles, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSalles = async () => {
    try {
      setLoading(true);
      const data = await getMesSallesReunion();
      setSalles(data.salles || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrStartMeeting = async (salle) => {
    setJoiningRoomId(salle._id);
    try {
      if (salle.reunionEnCours?.active) {
        // Join existing meeting
        await rejoindreReunion(salle._id, { micro: false, camera: false });
      } else {
        // Start new meeting
        await demarrerReunion(salle._id, { micro: false, camera: false });
      }
      
      // Navigate to meeting room
      navigate(`/meetings/${salle._id}/room`);
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.message);
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleViewDetails = (salle) => {
    navigate(`/meetings/${salle._id}`);
  };

  const getMeetingStatusColor = (active) => {
    return active ? 'text-green-500' : 'text-gray-400';
  };

  const getMeetingStatusText = (active) => {
    return active ? 'Live Now' : 'No Active Meeting';
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Separate active and inactive meetings
  const activeMeetings = salles.filter(s => s.reunionEnCours?.active);
  const inactiveMeetings = salles.filter(s => !s.reunionEnCours?.active);

  return (
    <div className="w-full min-h-screen p-6" style={{ background: "var(--page-bg)" }}>
      <div className="relative space-y-6 w-full max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>Meeting Rooms</h2>
            <p className="text-md" style={{ color: "var(--sidebar-text)" }}>
              Connect with your team in real-time
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            {activeMeetings.length > 0 && (
              <div className="flex items-center px-4 py-2 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {activeMeetings.length} Live Meeting{activeMeetings.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* STATISTICS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>Total Rooms</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-main)" }}>{salles.length}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(140, 121, 217, 0.2)" }}>
                <VideoCameraIcon className="w-6 h-6" style={{ color: "#8C79D9" }} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>Active Now</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{activeMeetings.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <SignalIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>Total Meetings</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-main)" }}>
                  {salles.reduce((acc, s) => acc + (s.statistiques?.nombreReunions || 0), 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(140, 121, 217, 0.2)" }}>
                <ChartBarIcon className="w-6 h-6" style={{ color: "#8C79D9" }} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--sidebar-text)" }}>Total Hours</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-main)" }}>
                  {Math.round(salles.reduce((acc, s) => acc + (s.statistiques?.dureeTotale || 0), 0) / 60)}h
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(140, 121, 217, 0.2)" }}>
                <ClockIcon className="w-6 h-6" style={{ color: "#8C79D9" }} />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ACTIVE MEETINGS SECTION */}
        {activeMeetings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                Live Meetings
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMeetings.map((salle) => (
                <GlassCard 
                  key={salle._id} 
                  className="p-6 hover:shadow-2xl transition-all duration-300 border-2 border-green-500 relative overflow-hidden"
                >
                  {/* Live Badge */}
                  <div className="absolute top-0 right-0">
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </div>
                  </div>

                  {/* Animated Background Pulse */}
                  <div className="absolute inset-0 bg-green-500 opacity-5 animate-pulse"></div>

                  <div className="relative z-10">
                    {/* Project Info */}
                    <div className="mb-4">
                      <h4 className="text-lg font-bold mb-1" style={{ color: "var(--text-main)" }}>
                        {salle.projet?.nom || salle.nom}
                      </h4>
                      <p className="text-sm" style={{ color: "var(--sidebar-text)" }}>
                        {salle.description}
                      </p>
                    </div>

                    {/* Live Participants */}
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <UserGroupIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {salle.reunionEnCours.participantsActuels?.length || 0} participants in meeting
                      </span>
                    </div>

                    {/* Meeting Code */}
                    <div className="mb-4">
                      <span className="text-xs font-mono px-2 py-1 rounded" style={{ 
                        background: "var(--box-bg)", 
                        color: "var(--sidebar-text)" 
                      }}>
                        {salle.codeAcces}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinOrStartMeeting(salle)}
                        disabled={joiningRoomId === salle._id}
                        className="flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
                      >
                        {joiningRoomId === salle._id ? (
                          'Joining...'
                        ) : (
                          <>
                            <ArrowRightIcon className="w-5 h-5 mr-2" />
                            Join Now
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleViewDetails(salle)}
                        className="px-4 py-3 rounded-xl transition-all duration-300"
                        style={{ 
                          background: "var(--box-bg)",
                          color: "var(--sidebar-icon)"
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* ALL MEETING ROOMS SECTION */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
            All Meeting Rooms
          </h3>
          
          {loading && salles.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: "var(--sidebar-text)" }}>Loading meeting rooms...</p>
            </div>
          ) : salles.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <VideoCameraIcon className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--sidebar-icon)" }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-main)" }}>
                No Meeting Rooms Yet
              </h3>
              <p style={{ color: "var(--sidebar-text)" }}>
                Meeting rooms are automatically created when you create a project
              </p>
              <button
                onClick={() => navigate('/projects')}
                className="mt-6 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #8C79D9 0%, #A78BFA 100%)" }}
              >
                Create Your First Project
              </button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salles.map((salle) => {
                const isLive = salle.reunionEnCours?.active;
                const isHost = salle.membres?.find(m => m.role === 'host')?.utilisateur._id === JSON.parse(localStorage.getItem('user'))._id;
                
                return (
                  <GlassCard 
                    key={salle._id} 
                    className={`p-6 hover:shadow-xl transition-all duration-300 ${isLive ? 'ring-2 ring-green-500' : ''}`}
                  >
                    {/* Header with Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-1" style={{ color: "var(--text-main)" }}>
                          {salle.projet?.nom || salle.nom}
                        </h4>
                        {isHost && (
                          <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded" style={{ 
                            background: "rgba(140, 121, 217, 0.2)",
                            color: "#8C79D9"
                          }}>
                            <CheckBadgeIcon className="w-3 h-3 mr-1" />
                            Host
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className={`text-xs font-semibold ${getMeetingStatusColor(isLive)}`}>
                          {getMeetingStatusText(isLive)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {salle.description && (
                      <p className="text-sm mb-4" style={{ color: "var(--sidebar-text)" }}>
                        {salle.description.length > 80 ? `${salle.description.slice(0, 80)}...` : salle.description}
                      </p>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 rounded-lg" style={{ background: "var(--box-bg)" }}>
                        <UserGroupIcon className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--sidebar-icon)" }} />
                        <p className="text-xs font-semibold" style={{ color: "var(--text-main)" }}>
                          {salle.membres?.length || 0}
                        </p>
                        <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>Members</p>
                      </div>
                      
                      <div className="text-center p-2 rounded-lg" style={{ background: "var(--box-bg)" }}>
                        <CalendarIcon className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--sidebar-icon)" }} />
                        <p className="text-xs font-semibold" style={{ color: "var(--text-main)" }}>
                          {salle.statistiques?.nombreReunions || 0}
                        </p>
                        <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>Meetings</p>
                      </div>
                      
                      <div className="text-center p-2 rounded-lg" style={{ background: "var(--box-bg)" }}>
                        <ClockIcon className="w-4 h-4 mx-auto mb-1" style={{ color: "var(--sidebar-icon)" }} />
                        <p className="text-xs font-semibold" style={{ color: "var(--text-main)" }}>
                          {formatDuration(salle.statistiques?.dureeTotale || 0)}
                        </p>
                        <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>Duration</p>
                      </div>
                    </div>

                    {/* Meeting Code */}
                    <div className="mb-4">
                      <span className="text-xs font-mono px-2 py-1 rounded" style={{ 
                        background: "var(--box-bg)", 
                        color: "var(--sidebar-text)" 
                      }}>
                        {salle.codeAcces}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinOrStartMeeting(salle)}
                        disabled={joiningRoomId === salle._id}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50"
                        style={{ 
                          background: isLive 
                            ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" 
                            : "linear-gradient(135deg, #8C79D9 0%, #A78BFA 100%)" 
                        }}
                      >
                        {joiningRoomId === salle._id ? (
                          'Loading...'
                        ) : (
                          <>
                            {isLive ? <ArrowRightIcon className="w-4 h-4 mr-2" /> : <PlayIcon className="w-4 h-4 mr-2" />}
                            {isLive ? 'Join' : 'Start'}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleViewDetails(salle)}
                        className="px-4 py-2.5 rounded-xl transition-all duration-300"
                        style={{ 
                          background: "var(--box-bg)",
                          color: "var(--sidebar-icon)"
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <GlassCard className="p-4 border-red-300">
            <p className="text-red-600 text-center">{error}</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default Meetings;