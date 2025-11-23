import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalleReunion, quitterReunion, terminerReunion } from '../services/meetingService';
import io from 'socket.io-client';
import {
  ArrowLeftIcon,
  PhoneXMarkIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [microEnabled, setMicroEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [participants, setParticipants] = useState([]);
  
  // Refs
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const remoteStreamsRef = useRef({});
  const messagesEndRef = useRef(null);
  
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const API_URL = 'http://localhost:5000';

  // Configuration ICE servers (STUN/TURN)
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    initializeSocket();
    fetchRoomDetails();
    
    return () => {
      cleanup();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSocket = () => {
    const token = currentUser?.token;
    if (!token) return;

    socketRef.current = io(API_URL, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected');
      socketRef.current.emit('join-meeting', { roomId });
    });

    socketRef.current.on('current-participants', ({ participantIds }) => {
      console.log('👥 Current participants:', participantIds);
    });

    socketRef.current.on('user-joined', ({ userId, userInfo }) => {
      console.log('👤 User joined:', userInfo);
      addParticipant(userId, userInfo);
    });

    socketRef.current.on('user-left', ({ userId }) => {
      console.log('👋 User left:', userId);
      removeParticipant(userId);
    });

    socketRef.current.on('new-message', (messageData) => {
      console.log('💬 New message:', messageData);
      setMessages(prev => [...prev, messageData]);
    });

    socketRef.current.on('user-media-updated', ({ userId, micro, camera }) => {
      console.log('📹 Media updated:', userId, micro, camera);
      setParticipants(prev => prev.map(p => 
        p.userId === userId ? { ...p, micro, camera } : p
      ));
    });

    socketRef.current.on('webrtc-offer', async ({ offer, fromUserId, fromUserInfo }) => {
      console.log('📞 Received offer from:', fromUserInfo);
      await handleWebRTCOffer(offer, fromUserId, fromUserInfo);
    });

    socketRef.current.on('webrtc-answer', async ({ answer, fromUserId }) => {
      console.log('📞 Received answer from:', fromUserId);
      const peerConnection = peerConnectionsRef.current[fromUserId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketRef.current.on('webrtc-ice-candidate', async ({ candidate, fromUserId }) => {
      const peerConnection = peerConnectionsRef.current[fromUserId];
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  };

  const fetchRoomDetails = async () => {
    try {
      const data = await getSalleReunion(roomId);
      setSalle(data);
      
      if (data.reunionEnCours?.participantsActuels) {
        const initialParticipants = data.reunionEnCours.participantsActuels.map(p => ({
          userId: p.utilisateur._id,
          userInfo: p.utilisateur,
          micro: p.micro,
          camera: p.camera,
          stream: null
        }));
        setParticipants(initialParticipants);
      }
      
      await startLocalMedia();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  const startLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getAudioTracks().forEach(track => track.enabled = false);
      stream.getVideoTracks().forEach(track => track.enabled = false);

      addParticipant(currentUser._id, {
        _id: currentUser._id,
        nom: currentUser.nom,
        prenom: currentUser.prenom
      }, stream);

    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const addParticipant = (userId, userInfo, stream = null) => {
    setParticipants(prev => {
      const exists = prev.find(p => p.userId === userId);
      if (exists) return prev;
      
      return [...prev, {
        userId,
        userInfo,
        micro: false,
        camera: false,
        stream
      }];
    });

    if (userId !== currentUser._id && localStreamRef.current) {
      createPeerConnection(userId, userInfo);
    }
  };

  const removeParticipant = (userId) => {
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close();
      delete peerConnectionsRef.current[userId];
    }

    setParticipants(prev => prev.filter(p => p.userId !== userId));

    if (remoteStreamsRef.current[userId]) {
      delete remoteStreamsRef.current[userId];
    }
  };

  const createPeerConnection = async (userId, userInfo) => {
    try {
      const peerConnection = new RTCPeerConnection(iceServers);
      peerConnectionsRef.current[userId] = peerConnection;

      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('webrtc-ice-candidate', {
            roomId,
            candidate: event.candidate,
            targetUserId: userId
          });
        }
      };

      peerConnection.ontrack = (event) => {
        console.log('📹 Received remote track from:', userId);
        const [remoteStream] = event.streams;
        remoteStreamsRef.current[userId] = remoteStream;
        
        setParticipants(prev => prev.map(p => 
          p.userId === userId ? { ...p, stream: remoteStream } : p
        ));
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit('webrtc-offer', {
        roomId,
        offer,
        targetUserId: userId
      });

    } catch (err) {
      console.error('Error creating peer connection:', err);
    }
  };

  const handleWebRTCOffer = async (offer, fromUserId, fromUserInfo) => {
    try {
      const peerConnection = new RTCPeerConnection(iceServers);
      peerConnectionsRef.current[fromUserId] = peerConnection;

      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('webrtc-ice-candidate', {
            roomId,
            candidate: event.candidate,
            targetUserId: fromUserId
          });
        }
      };

      peerConnection.ontrack = (event) => {
        console.log('📹 Received remote track from:', fromUserId);
        const [remoteStream] = event.streams;
        remoteStreamsRef.current[fromUserId] = remoteStream;
        
        setParticipants(prev => prev.map(p => 
          p.userId === fromUserId ? { ...p, stream: remoteStream } : p
        ));
      };

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socketRef.current.emit('webrtc-answer', {
        roomId,
        answer,
        targetUserId: fromUserId
      });

      addParticipant(fromUserId, fromUserInfo);

    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMicState = audioTrack.enabled;
        setMicroEnabled(newMicState);
        
        // Update local participant state
        setParticipants(prev => prev.map(p => 
          p.userId === currentUser._id ? { ...p, micro: newMicState } : p
        ));
        
        socketRef.current.emit('update-media-state', {
          roomId,
          micro: newMicState,
          camera: cameraEnabled
        });
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newCameraState = videoTrack.enabled;
        setCameraEnabled(newCameraState);
        
        // Update local participant state
        setParticipants(prev => prev.map(p => 
          p.userId === currentUser._id ? { ...p, camera: newCameraState } : p
        ));
        
        socketRef.current.emit('update-media-state', {
          roomId,
          micro: microEnabled,
          camera: newCameraState
        });
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    socketRef.current.emit('send-message', {
      roomId,
      message: newMessage.trim()
    });
    
    setNewMessage('');
  };

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this meeting?')) {
      setLoading(true);
      try {
        await quitterReunion(roomId);
        cleanup();
        navigate('/meetings');
      } catch (err) {
        console.error('Erreur:', err);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };


  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};

    if (socketRef.current) {
      socketRef.current.emit('leave-meeting', { roomId });
      socketRef.current.disconnect();
    }
  };

  const VideoParticipant = ({ participant }) => {
    const videoRef = useRef(null);
    const isLocalUser = participant.userId === currentUser._id;

    useEffect(() => {
      if (videoRef.current && participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
    }, [participant.stream]);

    return (
      <GlassCard className="relative overflow-hidden aspect-video">
        <video
          ref={isLocalUser ? localVideoRef : videoRef}
          autoPlay
          playsInline
          muted={isLocalUser}
          className="w-full h-full object-cover"
        />
        
        {!participant.camera && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-3xl mb-4">
                {participant.userInfo?.prenom?.[0]}{participant.userInfo?.nom?.[0]}
              </div>
              <p className="text-white font-semibold text-lg">
                {participant.userInfo?.prenom} {participant.userInfo?.nom}
                {isLocalUser && ' (You)'}
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className={`p-2 rounded-lg ${participant.micro ? 'bg-green-500' : 'bg-red-500'}`}>
            <MicrophoneIcon className="w-4 h-4 text-white" />
          </span>
          <span className={`p-2 rounded-lg ${participant.camera ? 'bg-green-500' : 'bg-red-500'}`}>
            <VideoCameraIcon className="w-4 h-4 text-white" />
          </span>
        </div>

        <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-lg">
          <p className="text-white text-sm font-semibold">
            {participant.userInfo?.prenom} {participant.userInfo?.nom}
            {isLocalUser && ' (You)'}
          </p>
        </div>
      </GlassCard>
    );
  };

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

  if (!salle) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
        <p style={{ color: "var(--sidebar-text)" }}>Loading meeting room...</p>
      </div>
    );
  }

  const isHost = salle.createur._id === currentUser._id;

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: "var(--page-bg)" }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700" style={{ background: "var(--box-bg)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/meetings')}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                background: "var(--box-bg)",
                color: "var(--sidebar-text)"
              }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                {salle.nom}
              </h1>
              <p className="text-sm" style={{ color: "var(--sidebar-text)" }}>
                {participants.length} participant{participants.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-3 rounded-xl transition-all duration-300"
              style={{ 
                background: showParticipants ? "rgba(140, 121, 217, 0.2)" : "var(--box-bg)",
                color: showParticipants ? "#8C79D9" : "var(--sidebar-icon)"
              }}
            >
              <UserGroupIcon className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-3 rounded-xl transition-all duration-300"
              style={{ 
                background: showChat ? "rgba(140, 121, 217, 0.2)" : "var(--box-bg)",
                color: showChat ? "#8C79D9" : "var(--sidebar-icon)"
              }}
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </button>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
            {participants.map((participant) => (
              <VideoParticipant key={participant.userId} participant={participant} />
            ))}
          </div>

          {/* Controls */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={toggleMicrophone}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                microEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={microEnabled ? 'Mute' : 'Unmute'}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                cameraEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={cameraEnabled ? 'Stop Video' : 'Start Video'}
            >
              <VideoCameraIcon className="w-6 h-6" />
            </button>

            <button
              onClick={handleLeave}
              disabled={loading}
              className="p-4 rounded-full transition-all duration-300 shadow-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              title="Leave Meeting"
            >
              <PhoneXMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col" style={{ background: "var(--box-bg)" }}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: "var(--text-main)" }}>
                Participants ({participants.length})
              </h3>
              <button onClick={() => setShowParticipants(false)}>
                <XMarkIcon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {participants.map((participant) => (
                <div key={participant.userId} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--page-bg)" }}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {participant.userInfo?.prenom?.[0]}{participant.userInfo?.nom?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--text-main)" }}>
                      {participant.userInfo?.prenom} {participant.userInfo?.nom}
                      {participant.userId === currentUser._id && ' (You)'}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-xs">{participant.micro ? '🎤' : '🔇'}</span>
                      <span className="text-xs">{participant.camera ? '📹' : '🚫'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col" style={{ background: "var(--box-bg)" }}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: "var(--text-main)" }}>Chat</h3>
              <button onClick={() => setShowChat(false)}>
                <XMarkIcon className="w-5 h-5" style={{ color: "var(--sidebar-icon)" }} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 opacity-30" style={{ color: "var(--sidebar-icon)" }} />
                  <p className="text-sm" style={{ color: "var(--sidebar-text)" }}>
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div key={msg._id || index} className={`flex gap-2 ${msg.expediteur._id === currentUser._id ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {msg.expediteur?.prenom?.[0]}{msg.expediteur?.nom?.[0]}
                      </div>
                      <div className={`flex-1 ${msg.expediteur._id === currentUser._id ? 'text-right' : ''}`}>
                        <p className="text-xs font-semibold mb-1" style={{ color: "var(--sidebar-text)" }}>
                          {msg.expediteur?.prenom} {msg.expediteur?.nom}
                        </p>
                        <div className={`inline-block p-2 rounded-lg max-w-xs break-words ${
                          msg.expediteur._id === currentUser._id 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <p className="text-sm">
                            {msg.contenu}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: "var(--page-bg)", color: "var(--text-main)" }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;