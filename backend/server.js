const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initializeSocket } = require('./socket');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// --- INITIALISATION ---
dotenv.config();
connectDB();
const app = express();

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.IO
initializeSocket(server);

// --- CONFIGURATION DES MIDDLEWARES ---
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// --- DÉFINITION DES ROUTES ---
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// --- GESTION DES ERREURS ---
app.use(errorHandler);

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));