import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalleReunion, demarrerReunion, rejoindreReunion, getHistorique } from '../services/meetingService';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  PlayIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 ${className}`}>
      {children}
    </div>
  );
};

const MeetingDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [salle, setSalle] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchDetails();
      fetchHistorique();
    }
  }, [roomId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getSalleReunion(roomId);
      setSalle(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async () => {
    try {
      const data = await getHistorique(roomId);
      setHistorique(data.historique || []);
    } catch (err) {
      console.error('Erreur historique:', err);
    }
  };

  const handleJoinOrStart = async () => {
    setJoining(true);
    try {
      if (salle.reunionEnCours?.active) {
        await rejoindreReunion(roomId, { micro: false, camera: false });
      } else {
        await demarrerReunion(roomId, { micro: false, camera: false });
      }
      navigate(`/meetings/${roomId}/room`);
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.message);
    } finally {
      setJoining(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !salle) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
        <p style={{ color: "var(--sidebar-text)" }}>Loading...</p>
      </div>
    );
  }

  if (error && !salle) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
        <GlassCard className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/meetings')}
            className="px-6 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, #8C79D9 0%, #A78BFA 100%)" }}
          >
            Back to Meetings
          </button>
        </GlassCard>
      </div>
    );
  }

  if (!salle) return null;

  const isLive = salle.reunionEnCours?.active;
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isHost = salle.createur._id === currentUser._id;

  return (
    <div className="w-full min-h-screen p-6" style={{ background: "var(--page-bg)" }}>
      <div className="relative space-y-6 w-full max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/meetings')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
            style={{ 
              background: "var(--box-bg)",
              color: "var(--sidebar-text)"
            }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>

          {isLive && (
            <div className="flex items-center px-4 py-2 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                Meeting in Progress
              </span>
            </div>
          )}
        </div>

        {/* MAIN INFO */}
        <GlassCard className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-main)" }}>
                {salle.nom}
              </h1>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-mono px-3 py-1 rounded-lg" style={{ 
                  background: "var(--box-bg)",
                  color: "var(--sidebar-text)"
                }}>
                  {salle.codeAcces}
                </span>
                
                {isHost && (
                  <span className="inline-flex items-center text-sm font-semibold px-3 py-1 rounded-lg" style={{ 
                    background: "rgba(140, 121, 217, 0.2)",
                    color: "#8C79D9"
                  }}>
                    <CheckBadgeIcon className="w-4 h-4 mr-1" />
                    Host
                  </span>
                )}
              </div>

              {salle.description && (
                <p className="text-lg mb-6" style={{ color: "var(--sidebar-text)" }}>
                  {salle.description}
                </p>
              )}

              {/* Project Link */}
              {salle.projet && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2" style={{ color: "var(--sidebar-text)" }}>
                    Project:
                  </p>
                  <button
                    onClick={() => navigate(`/projects/${salle.projet._id}/tasks`)}
                    className="inline-flex items-center px-4 py-2 rounded-lg transition-colors"
                    style={{ 
                      background: "var(--box-bg)",
                      color: "var(--text-main)"
                    }}
                  >
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    {salle.projet.nom}
                  </button>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleJoinOrStart}
                disabled={joining}
                className="w-full lg:w-auto flex items-center justify-center px-8 py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                style={{ 
                  background: isLive 
                    ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" 
                    : "linear-gradient(135deg, #8C79D9 0%, #A78BFA 100%)" 
                }}
              >
                {joining ? (
                  'Loading...'
                ) : isLive ? (
                  <>
                    <ArrowRightIcon className="w-6 h-6 mr-2" />
                    Join Meeting Now
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-6 h-6 mr-2" />
                    Start Meeting
                  </>
                )}
              </button>
            </div>

            {/* Right Side - Statistics */}
            <div className="lg:w-80 space-y-4">
              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <UserGroupIcon className="w-6 h-6" style={{ color: "var(--sidebar-icon)" }} />
                  <span className="font-semibold" style={{ color: "var(--text-main)" }}>Members</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>
                  {salle.membres?.length || 0}
                </p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CalendarIcon className="w-6 h-6" style={{ color: "var(--sidebar-icon)" }} />
                  <span className="font-semibold" style={{ color: "var(--text-main)" }}>Total Meetings</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>
                  {salle.statistiques?.nombreReunions || 0}
                </p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ClockIcon className="w-6 h-6" style={{ color: "var(--sidebar-icon)" }} />
                  <span className="font-semibold" style={{ color: "var(--text-main)" }}>Total Time</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>
                  {formatDuration(salle.statistiques?.dureeTotale || 0)}
                </p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ChartBarIcon className="w-6 h-6" style={{ color: "var(--sidebar-icon)" }} />
                  <span className="font-semibold" style={{ color: "var(--text-main)" }}>Peak Attendance</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>
                  {salle.statistiques?.maxParticipants || 0}
                </p>
              </GlassCard>
            </div>
          </div>
        </GlassCard>

        {/* CURRENT MEETING */}
        {isLive && salle.reunionEnCours.participantsActuels?.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: "var(--text-main)" }}>
              Current Participants ({salle.reunionEnCours.participantsActuels.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salle.reunionEnCours.participantsActuels.map((participant) => (
                <div 
                  key={participant._id}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: "var(--box-bg)" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: "#8C79D9" }}
                  >
                    {participant.utilisateur?.prenom?.[0]}{participant.utilisateur?.nom?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: "var(--text-main)" }}>
                      {participant.utilisateur?.prenom} {participant.utilisateur?.nom}
                    </p>
                    <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>
                      {participant.micro ? '🎤' : '🔇'} {participant.camera ? '📹' : '🚫'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* MEMBERS LIST */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4" style={{ color: "var(--text-main)" }}>
            All Members ({salle.membres?.length || 0})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salle.membres?.map((membre) => (
              <div 
                key={membre._id}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: "var(--box-bg)" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: membre.role === 'host' ? "#8C79D9" : "#A78BFA" }}
                >
                  {membre.utilisateur?.prenom?.[0]}{membre.utilisateur?.nom?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: "var(--text-main)" }}>
                    {membre.utilisateur?.prenom} {membre.utilisateur?.nom}
                  </p>
                  <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>
                    {membre.role === 'host' ? 'Host' : membre.role === 'moderator' ? 'Moderator' : 'Participant'}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  membre.statut === 'online' ? 'bg-green-500' : 
                  membre.statut === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* MEETING HISTORY */}
{historique.length > 0 && (
  <GlassCard className="p-6">
    <h3 className="text-xl font-bold mb-4" style={{ color: "var(--text-main)" }}>
      Meeting History
    </h3>
    <div className="space-y-3">
      {historique.slice(0, 5).map((meeting, index) => (
        <div 
          key={index}
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: "var(--box-bg)" }}
        >
          <div className="flex-1">
            <p className="font-semibold" style={{ color: "var(--text-main)" }}>
              {formatDate(meeting.dateDebut)}
            </p>
            <p className="text-sm" style={{ color: "var(--sidebar-text)" }}>
              {meeting.participants?.length || 0} participants • {formatDuration(meeting.duree)}
            </p>
          </div>
          {meeting.enregistrement?.disponible && (
            <span className="text-xs font-semibold px-2 py-1 rounded" style={{ 
              background: "rgba(140, 121, 217, 0.2)",
              color: "#8C79D9"
            }}>
              Recorded
            </span>
          )}
        </div>
      ))}
    </div>
  </GlassCard>
)}
      </div>
    </div>
  );
};

export default MeetingDetails;