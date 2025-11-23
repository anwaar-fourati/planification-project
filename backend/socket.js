// backend/socket.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Middleware d'authentification pour Socket.IO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = user._id.toString();
            socket.userInfo = {
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email
            };
            
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('✅ User connected:', socket.userId);

        // Rejoindre une salle de réunion
        socket.on('join-meeting', ({ roomId }) => {
            socket.join(roomId);
            console.log(`👤 User ${socket.userId} joined meeting ${roomId}`);
            
            // Notifier les autres participants
            socket.to(roomId).emit('user-joined', {
                userId: socket.userId,
                userInfo: socket.userInfo
            });

            // Envoyer la liste des participants actuels
            const room = io.sockets.adapter.rooms.get(roomId);
            const participantIds = room ? Array.from(room) : [];
            socket.emit('current-participants', { participantIds });
        });

        // Envoyer un message dans le chat
        socket.on('send-message', ({ roomId, message }) => {
            console.log(`💬 Message in room ${roomId}:`, message);
            
            const messageData = {
                _id: Date.now().toString(),
                expediteur: socket.userInfo,
                contenu: message,
                type: 'text',
                dateEnvoi: new Date()
            };

            // Envoyer à tous dans la salle (y compris l'expéditeur)
            io.to(roomId).emit('new-message', messageData);
        });

        // Gestion WebRTC - Offre
        socket.on('webrtc-offer', ({ roomId, offer, targetUserId }) => {
            console.log(`📞 WebRTC offer from ${socket.userId} to ${targetUserId}`);
            socket.to(roomId).emit('webrtc-offer', {
                offer,
                fromUserId: socket.userId,
                fromUserInfo: socket.userInfo
            });
        });

        // Gestion WebRTC - Réponse
        socket.on('webrtc-answer', ({ roomId, answer, targetUserId }) => {
            console.log(`📞 WebRTC answer from ${socket.userId} to ${targetUserId}`);
            socket.to(roomId).emit('webrtc-answer', {
                answer,
                fromUserId: socket.userId
            });
        });

        // Gestion WebRTC - ICE Candidate
        socket.on('webrtc-ice-candidate', ({ roomId, candidate, targetUserId }) => {
            socket.to(roomId).emit('webrtc-ice-candidate', {
                candidate,
                fromUserId: socket.userId
            });
        });

        // Mise à jour de l'état micro/caméra
        socket.on('update-media-state', ({ roomId, micro, camera }) => {
            console.log(`🎤📹 User ${socket.userId} updated media: mic=${micro}, cam=${camera}`);
            socket.to(roomId).emit('user-media-updated', {
                userId: socket.userId,
                micro,
                camera
            });
        });

        // Quitter la réunion
        socket.on('leave-meeting', ({ roomId }) => {
            socket.leave(roomId);
            socket.to(roomId).emit('user-left', {
                userId: socket.userId
            });
            console.log(`👋 User ${socket.userId} left meeting ${roomId}`);
        });

        // Déconnexion
        socket.on('disconnect', () => {
            console.log('❌ User disconnected:', socket.userId);
            // Notifier toutes les salles que l'utilisateur a quitté
            socket.rooms.forEach(roomId => {
                if (roomId !== socket.id) {
                    socket.to(roomId).emit('user-left', {
                        userId: socket.userId
                    });
                }
            });
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initializeSocket, getIO };