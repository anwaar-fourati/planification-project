const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

// @desc    Envoyer un message dans un chat
// @route   POST /api/messages/:chatId
// @access  Private
const envoyerMessage = async (req, res) => {
	try {
		const { chatId } = req.params;
		const { contenu } = req.body;

		if (!contenu) return res.status(400).json({ message: 'Le contenu du message est requis' });

		const chat = await Chat.findById(chatId);
		if (!chat) return res.status(404).json({ message: 'Chat introuvable' });

		// Vérifier que l'utilisateur fait partie du chat
		const userId = req.user._id.toString();
		const estMembre = chat.membres.some(m => m.utilisateur.toString() === userId);
		if (!estMembre && chat.projet.toString() !== undefined) {
			return res.status(403).json({ message: 'Vous n\'êtes pas membre de ce chat' });
		}

		const message = await Message.create({
			chat: chatId,
			expediteur: req.user._id,
			contenu
		});

		res.status(201).json({ message: 'Message envoyé', data: message });

	} catch (error) {
		console.error('Erreur envoyerMessage:', error);
		res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du message' });
	}
};

// @desc    Récupérer les messages d'un chat
// @route   GET /api/messages/:chatId
// @access  Private
const getMessages = async (req, res) => {
	try {
		const { chatId } = req.params;

		const chat = await Chat.findById(chatId).populate('membres.utilisateur', 'nom prenom email');
		if (!chat) return res.status(404).json({ message: 'Chat introuvable' });

		const userId = req.user._id.toString();
		const estMembre = chat.membres.some(m => m.utilisateur._id.toString() === userId);
		if (!estMembre) return res.status(403).json({ message: 'Accès refusé' });

		const messages = await Message.find({ chat: chatId })
			.populate('expediteur', 'nom prenom email')
			.sort({ createdAt: 1 });

		res.status(200).json({ nombre: messages.length, messages });

	} catch (error) {
		console.error('Erreur getMessages:', error);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};

module.exports = {
	envoyerMessage,
	getMessages
};

// Récupérer (ou créer) le chat lié à un projet
const getChatByProject = async (req, res) => {
	try {
		const { projectId } = req.params;
		let chat = await Chat.findOne({ projet: projectId }).populate('membres.utilisateur', 'nom prenom email');
		if (!chat) {
			return res.status(404).json({ message: 'Aucun chat trouvé pour ce projet' });
		}
		res.status(200).json(chat);
	} catch (error) {
		console.error('Erreur getChatByProject:', error);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};

module.exports.getChatByProject = getChatByProject;

// @desc    Récupérer les chats dont l'utilisateur est membre
// @route   GET /api/chats/me
// @access  Private
const getMyChats = async (req, res) => {
	try {
		const userId = req.user._id;
		const chats = await Chat.find({ 'membres.utilisateur': userId })
			.populate('projet', 'nom')
			.populate('membres.utilisateur', 'nom prenom email');

		res.status(200).json({ nombre: chats.length, chats });
	} catch (error) {
		console.error('Erreur getMyChats:', error);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};

module.exports.getMyChats = getMyChats;
