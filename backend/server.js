const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Importer notre fonction de connexion

// Charger les variables d'environnement du fichier .env
dotenv.config();

// Lancer la connexion à la base de données
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));