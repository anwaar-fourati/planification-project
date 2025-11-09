const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
    {
        nom: {
            type: String,
            required: [true, 'Veuillez entrer un nom de projet'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        // Code unique pour rejoindre le projet
        codeAcces: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },
        // Le créateur du projet (Chef de projet)
        createur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        // Liste des membres du projet
        membres: [{
            utilisateur: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['chef_projet', 'membre'],
                default: 'membre'
            },
            dateAjout: {
                type: Date,
                default: Date.now
            }
        }],
        // Statut du projet
        statut: {
            type: String,
            enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
            default: 'Planning'
        },
        // Priorité
        priorite: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        // Date limite
        dateEcheance: {
            type: Date
        },
        // Progression (0-100)
        progression: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        // Invitations en attente (par email)
        invitationsPendantes: [{
            email: {
                type: String,
                required: true
            },
            dateInvitation: {
                type: Date,
                default: Date.now
            }
        }]
    },
    {
        timestamps: true
    }
);

// Méthode pour générer un code d'accès unique
projectSchema.statics.genererCodeAcces = function() {
    // Génère un code de 6 caractères alphanumériques
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return code;
};

// Méthode pour vérifier si un utilisateur est membre du projet
projectSchema.methods.estMembre = function(userId) {
    return this.membres.some(m => m.utilisateur.toString() === userId.toString()) || 
           this.createur.toString() === userId.toString();
};

// Méthode pour vérifier si un utilisateur est le créateur
projectSchema.methods.estCreateur = function(userId) {
    return this.createur.toString() === userId.toString();
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;