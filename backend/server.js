const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const { errorHandler } = require('./middleware/errorMiddleware'); // 1. Importer le middleware


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
// (Ici viendront vos autres routes, ex: app.use('/api/projects', projectRoutes))

app.use('/api/projects', projectRoutes);

// --- GESTION DES ERREURS ---
// 2. Utiliser le middleware d'erreur. CELA DOIT ÊTRE APRÈS TOUTES VOS ROUTES.
app.use(errorHandler);

// AJOUTER CETTE LIGNE :
// On réutilise le préfixe /api/projects pour que les routes de tâches soient logiquement imbriquées
// Ex: POST /api/projects/PROJECT_ID/tasks
app.use('/api/projects', require('./routes/taskRoutes'));
// AJOUTER CETTE LIGNE pour les routes de modification/suppression de tâches
app.use('/api/tasks', require('./routes/taskRoutes'));
// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));