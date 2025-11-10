const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        nom: {
            type: String,
            required: [true, 'Veuillez entrer un nom pour la tâche'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        // Le projet auquel cette tâche appartient
        projet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        // Le créateur de la tâche
        createur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        // Le membre à qui la tâche est assignée
        assigneA: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        statut: {
            type: String,
            enum: ['À faire', 'En cours', 'Terminé', 'En attente'],
            default: 'À faire'
        },
        priorite: {
            type: String,
            enum: ['Basse', 'Moyenne', 'Haute'],
            default: 'Moyenne'
        },
        dateEcheance: {
            type: Date
        }
    },
    {
        timestamps: true // Ajoute automatiquement createdAt et updatedAt
    }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;