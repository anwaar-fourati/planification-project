
// 1️⃣ Importer les modules nécessaires
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 2️⃣ Définir le schéma de l'utilisateur
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
      unique: true, // Chaque utilisateur doit avoir un email unique
      match: [/.+\@.+\..+/, 'Veuillez entrer un email valide'], // Vérifie le format de l'email
    },
    mot_de_passe: {
      type: String,
      required: [true, 'Veuillez entrer un mot de passe'],
    },
    role: {
      type: String,
      enum: ['admin', 'chef_projet', 'membre'], // Valeurs possibles pour le rôle
      default: 'membre', // Valeur par défaut
      required: true,
    },
    // Champs pour la réinitialisation du mot de passe
    resetToken: {
      type: String,
    },
    resetTokenExpire: {
      type: Date,
    },
  },
  {
    // Ajoute automatiquement createdAt et updatedAt
    timestamps: true,
  }
);

// 3️⃣ Hachage du mot de passe avant la sauvegarde
userSchema.pre('save', async function (next) {
  // Si le mot de passe n’a pas été modifié, on passe à la suite
  if (!this.isModified('mot_de_passe')) {
    return next();
  }

  // Génération d’un “sel” pour renforcer le hachage
  const salt = await bcrypt.genSalt(10);
  // Hachage du mot de passe
  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
  next();
});

// 4️⃣ Méthode pour comparer le mot de passe saisi avec le mot de passe haché
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.mot_de_passe);
};

// 5️⃣ Compiler le modèle à partir du schéma
const User = mongoose.model('User', userSchema);

// 6️⃣ Exporter le modèle pour pouvoir l'utiliser ailleurs
module.exports = User;
