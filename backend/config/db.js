// Importer Mongoose
const mongoose = require('mongoose');

// Créer la fonction de connexion asynchrone
const connectDB = async () => {
    try {
        // Tenter de se connecter à la base de données avec la chaîne de connexion du fichier .env
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // Si la connexion réussit, afficher un message dans la console
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Si une erreur survient, afficher l'erreur et arrêter le processus
        console.error(`Error: ${error.message}`);
        process.exit(1); // Arrête l'application avec un code d'échec
    }
};

// Exporter la fonction pour qu'elle puisse être utilisée ailleurs
module.exports = connectDB;