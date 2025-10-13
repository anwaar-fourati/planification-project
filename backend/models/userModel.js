// Importer les outils nécessaires
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Définir le schéma de l'utilisateur (la structure)
const userSchema = mongoose.Schema(
    {
        nom: {
            type: String,
            required: [true, 'Veuillez entrer un nom'],
        },
        prenom: {
            type: String,
            required: [true, 'Veuillez entrer un prénom'],
        },
        email: {
            type: String,
            required: [true, 'Veuillez entrer un email'],
            unique: true, // L'email doit être unique
            match: [/.+\@.+\..+/, 'Veuillez entrer un email valide'], // Valide le format de l'email
        },
        mot_de_passe: {
            type: String,
            required: [true, 'Veuillez entrer un mot de passe'],
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'chef_projet', 'membre'], // Le rôle ne peut être que l'une de ces valeurs
            default: 'membre', // Valeur par défaut si aucun rôle n'est fourni
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        // 2. Ajouter automatiquement les champs `createdAt` et `updatedAt`
        timestamps: true,
    }
);

// 3. HACHAGE DU MOT DE PASSE AVANT LA SAUVEGARDE (TRÈS IMPORTANT)
// On exécute cette fonction "pre" (avant) l'événement "save"
userSchema.pre('save', async function (next) {
    // Si le mot de passe n'a pas été modifié, on ne le hache pas à nouveau
    if (!this.isModified('mot_de_passe')) {
        return next();
    }

    // Générer un "sel" pour renforcer le hachage
    const salt = await bcrypt.genSalt(10);
    // Hacher le mot de passe avec le sel
    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
    next();
});

// 4. Compiler le schéma en un modèle
const User = mongoose.model('User', userSchema);

// 5. Exporter le modèle pour l'utiliser ailleurs
module.exports = User;