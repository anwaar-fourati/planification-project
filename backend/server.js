const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Importer notre fonction de connexion
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
// 2. Ajouter un middleware pour accepter les données JSON dans le corps des requêtes
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.json('API is running...');
});

// 3. Dire à l'application d'utiliser les routes définies dans userRoutes
// pour toute URL commençant par /api/users
app.use('/api/users', userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


