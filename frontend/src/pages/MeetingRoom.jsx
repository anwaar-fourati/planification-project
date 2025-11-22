import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getSalleReunion, 
  quitterReunion, 
  terminerReunion, 
  envoyerMessage, 
  getMessages 
} from '../services/meetingService';
import {
  PhoneXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

// REMPLACEZ MicrophoneSlashIcon par ces alternatives :
import { MicrophoneIcon as MicrophoneSolid } from '@heroicons/react/24/solid';
import { MicrophoneIcon as MicrophoneOutline } from '@heroicons/react/24/outline';

const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 ${className}`}>
      {children}
    </div>
  );
};

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [salle, setSalle] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour les contrôles utilisateur
  const [microActive, setMicroActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [partageEcran, setPartageEcran] = useState(false);
  const [chatOuvert, setChatOuvert] = useState(false);
  const [participantsOuvert, setParticipantsOuvert] = useState(false);
  const [parametresOuvert, setParametresOuvert] = useState(false);

  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (roomId) {
      fetchSalle();
      fetchMessages();
      
      // Simuler la connexion WebRTC (à remplacer par une vraie implémentation)
      initializeMedia();
      
      // Rafraîchir périodiquement
      const interval = setInterval(fetchSalle, 5000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  useEffect(() => {
    // Scroll vers le bas du chat quand de nouveaux messages arrivent
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchSalle = async () => {
    try {
      const data = await getSalleReunion(roomId);
      setSalle(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await getMessages(roomId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Erreur messages:', err);
    }
  };

  const initializeMedia = async () => {
    try {
      // Demander l'accès à la caméra et au micro
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Activer le micro et la caméra par défaut selon les paramètres
      setMicroActive(true);
      setCameraActive(true);
      
    } catch (err) {
      console.error('Erreur accès média:', err);
      alert('Impossible d\'accéder à la caméra ou au microphone');
    }
  };

  const toggleMicro = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !microActive;
      });
      setMicroActive(!microActive);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !cameraActive;
      });
      setCameraActive(!cameraActive);
    }
  };

  const togglePartageEcran = async () => {
    try {
      if (!partageEcran) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        
        screenStream.getTracks().forEach(track => {
          track.onended = () => {
            setPartageEcran(false);
            if (streamRef.current && videoRef.current) {
              videoRef.current.srcObject = streamRef.current;
            }
          };
        });
        
        setPartageEcran(true);
      } else {
        if (streamRef.current && videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setPartageEcran(false);
      }
    } catch (err) {
      console.error('Erreur partage écran:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await envoyerMessage(roomId, newMessage);
      setNewMessage('');
      // Rafraîchir les messages après envoi
      setTimeout(fetchMessages, 500);
    } catch (err) {
      console.error('Erreur envoi message:', err);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      await quitterReunion(roomId);
      
      // Arrêter tous les streams média
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      navigate('/meetings');
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.message);
    }
  };

  const handleEndMeeting = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir terminer la réunion pour tous les participants ?')) {
      try {
        await terminerReunion(roomId);
        
        // Arrêter tous les streams média
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        navigate('/meetings');
      } catch (err) {
        console.error('Erreur:', err);
        alert(err.message);
      }
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!salle) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
        <p style={{ color: "var(--sidebar-text)" }}>Chargement de la réunion...</p>
      </div>
    );
  }

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isHost = salle.createur._id === currentUser._id;

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: "var(--page-bg)" }}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/meetings')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{ color: "var(--sidebar-text)" }}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
              {salle.nom}
            </h1>
            <p className="text-sm" style={{ color: "var(--sidebar-text)" }}>
              Code: {salle.codeAcces} • {salle.reunionEnCours.participantsActuels?.length || 0} participants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">En direct</span>
          </div>
          
          {isHost && (
            <button
              onClick={handleEndMeeting}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" }}
            >
              Terminer
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex">
        
        {/* VIDEO AREA */}
        <div className="flex-1 flex flex-col p-4">
          
          {/* MAIN VIDEO */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-black mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* User info overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-purple-600">
                {currentUser.prenom?.[0]}{currentUser.nom?.[0]}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {currentUser.prenom} {currentUser.nom} {isHost && '(Hôte)'}
                </p>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span>{microActive ? '🎤' : '🔇'}</span>
                  <span>{cameraActive ? '📹' : '🚫'}</span>
                  {partageEcran && <span>🖥️</span>}
                </div>
              </div>
            </div>
          </div>

          {/* PARTICIPANTS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {salle.reunionEnCours.participantsActuels
              ?.filter(p => p.utilisateur._id !== currentUser._id)
              .map((participant) => (
              <div key={participant._id} className="relative rounded-xl overflow-hidden bg-gray-800 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-purple-600">
                    {participant.utilisateur.prenom?.[0]}{participant.utilisateur.nom?.[0]}
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                  <p className="text-white text-sm font-semibold truncate">
                    {participant.utilisateur.prenom} {participant.utilisateur.nom}
                  </p>
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <span>{participant.micro ? '🎤' : '🔇'}</span>
                    <span>{participant.camera ? '📹' : '🚫'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CONTROLS */}
          <div className="flex justify-center items-center gap-4 p-4">
            {/* Micro Control */}
            <button
              onClick={toggleMicro}
              className={`p-4 rounded-full transition-all duration-300 ${
                microActive 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {microActive ? (
                <MicrophoneIcon className="w-6 h-6" />
              ) : (
                <MicrophoneIcon className="w-6 h-6" />
                // Alternative: utiliser une icône barrée ou changer la couleur
              )}
            </button>

            {/* Camera Control */}
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-all duration-300 ${
                cameraActive 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {cameraActive ? (
                <VideoCameraIcon className="w-6 h-6" />
              ) : (
                <VideoCameraSlashIcon className="w-6 h-6" />
              )}
            </button>

            {/* Leave Call */}
            <button
              onClick={handleLeaveMeeting}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
            >
              <PhoneXMarkIcon className="w-6 h-6" />
            </button>

            {/* Screen Share */}
            <button
              onClick={togglePartageEcran}
              className={`p-4 rounded-full transition-all duration-300 ${
                partageEcran 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              <ComputerDesktopIcon className="w-6 h-6" />
            </button>

            {/* Participants */}
            <button
              onClick={() => setParticipantsOuvert(!participantsOuvert)}
              className={`p-4 rounded-full transition-all duration-300 ${
                participantsOuvert 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              <UserGroupIcon className="w-6 h-6" />
            </button>

            {/* Chat */}
            <button
              onClick={() => setChatOuvert(!chatOuvert)}
              className={`p-4 rounded-full transition-all duration-300 ${
                chatOuvert 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setParametresOuvert(!parametresOuvert)}
              className="p-4 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-300"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* SIDEBAR - CHAT & PARTICIPANTS */}
        {(chatOuvert || participantsOuvert) && (
          <div className="w-80 border-l" style={{ borderColor: "var(--border-color)" }}>
            
            {/* CHAT SIDEBAR */}
            {chatOuvert && (
              <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold" style={{ color: "var(--text-main)" }}>Chat</h3>
                    <button
                      onClick={() => setChatOuvert(false)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <XMarkIcon className="w-4 h-4" style={{ color: "var(--sidebar-text)" }} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 p-4 space-y-4 overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                >
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500">Aucun message pour le moment</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message._id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-purple-600 flex-shrink-0">
                          {message.expediteur.prenom?.[0]}{message.expediteur.nom?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm" style={{ color: "var(--text-main)" }}>
                              {message.expediteur.prenom} {message.expediteur.nom}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.dateEnvoi)}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: "var(--sidebar-text)" }}>
                            {message.contenu}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ 
                        background: "var(--box-bg)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-main)"
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #8C79D9 0%, #A78BFA 100%)" }}
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PARTICIPANTS SIDEBAR */}
            {participantsOuvert && (
              <div className="h-full flex flex-col">
                {/* Participants Header */}
                <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold" style={{ color: "var(--text-main)" }}>
                      Participants ({salle.reunionEnCours.participantsActuels?.length || 0})
                    </h3>
                    <button
                      onClick={() => setParticipantsOuvert(false)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <XMarkIcon className="w-4 h-4" style={{ color: "var(--sidebar-text)" }} />
                    </button>
                  </div>
                </div>

                {/* Participants List */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {salle.reunionEnCours.participantsActuels?.map((participant) => (
                    <div key={participant._id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--box-bg)" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-purple-600">
                        {participant.utilisateur.prenom?.[0]}{participant.utilisateur.nom?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: "var(--text-main)" }}>
                          {participant.utilisateur.prenom} {participant.utilisateur.nom}
                          {participant.utilisateur._id === salle.createur._id && ' (Hôte)'}
                        </p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--sidebar-text)" }}>
                          <span>{participant.micro ? '🎤' : '🔇'}</span>
                          <span>{participant.camera ? '📹' : '🚫'}</span>
                          <span className={`w-2 h-2 rounded-full ${
                            participant.statut === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <GlassCard className="p-4 border-red-300">
            <p className="text-red-600">{error}</p>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;