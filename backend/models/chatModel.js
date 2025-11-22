const mongoose = require('mongoose');

const membreSchema = mongoose.Schema({
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateAjout: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const chatSchema = mongoose.Schema({
    projet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    nom: {
        type: String,
        trim: true
    },
    membres: [membreSchema]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
