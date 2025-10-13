const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

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


// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));