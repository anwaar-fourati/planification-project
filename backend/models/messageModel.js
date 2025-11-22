const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    expediteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contenu: {
        type: String,
        trim: true,
        required: true
    },
    luPar: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
