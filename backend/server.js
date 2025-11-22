const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// --- INITIALISATION ---
dotenv.config();
connectDB();
const app = express();

// --- CONFIGURATION DES MIDDLEWARES (ORDRE TRÈS IMPORTANT) ---

// 1. Middleware CORS : Doit être le premier pour autoriser les requêtes cross-origin.
app.use(cors());

// 2. Middleware pour parser le JSON : Il doit être placé AVANT les routes qui l'utilisent.
// C'est lui qui remplit `req.body`.
app.use(express.json());

// --- DÉFINITION DES ROUTES ---

// Route de base pour vérifier que le serveur est en vie
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes principales de l'application
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/meetings', meetingRoutes);
// Routes pour la messagerie (chat de projet)
app.use('/api/messages', require('./routes/messageRoutes'));
// Routes pour récupérer le chat (par projet)
app.use('/api/chats', require('./routes/chatRoutes'));

// Routes pour les tâches (modification/suppression)
app.use('/api/tasks', require('./routes/taskRoutes'));

// --- GESTION DES ERREURS ---
// Utiliser le middleware d'erreur. CELA DOIT ÊTRE APRÈS TOUTES VOS ROUTES.
app.use(errorHandler);

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));