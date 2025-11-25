const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const Project = require('../models/projectModel');

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

		// Mark messages as read by this user (excluding sender's own messages)
		try {
			await Message.updateMany({ chat: chatId, expediteur: { $ne: req.user._id }, luPar: { $ne: req.user._id } }, { $push: { luPar: req.user._id } });
		} catch (err) {
			console.error('Erreur lors du marquage des messages comme lus:', err);
		}

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
			// If chat doesn't exist, try to create it from project members (if user has access)
			const project = await Project.findById(projectId).populate('membres.utilisateur', 'nom prenom email');
			if (!project) return res.status(404).json({ message: 'Aucun projet trouvé' });

			const userId = req.user._id.toString();
			const isCreator = project.createur.toString() === userId;
			const isMember = project.membres.some(m => m.utilisateur._id.toString() === userId);

			if (!isCreator && !isMember) {
				return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas membre de ce projet.' });
			}

			// Create chat for the project using project members
			try {
				chat = await Chat.create({
					projet: project._id,
					nom: `${project.nom} - Chat`,
					membres: project.membres.map(m => ({ utilisateur: m.utilisateur }))
				});
				await chat.populate('membres.utilisateur', 'nom prenom email');
			} catch (err) {
				console.error('Erreur création chat pour projet dans getChatByProject:', err);
				return res.status(500).json({ message: 'Erreur création du chat de projet' });
			}
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

		// Fetch projects where the user is creator or member
		const projets = await Project.find({
			$or: [
				{ createur: userId },
				{ 'membres.utilisateur': userId }
			]
		}).populate('membres.utilisateur', 'nom prenom email');

		// Ensure a Chat exists for each project and that this user is a member
		await Promise.all(projets.map(async (p) => {
			try {
				let chat = await Chat.findOne({ projet: p._id });
				if (!chat) {
					// create chat with project's members
					chat = await Chat.create({
						projet: p._id,
						nom: `${p.nom} - Chat`,
						membres: p.membres.map(m => ({ utilisateur: m.utilisateur }))
					});
				}
				// if user is not in chat, add them
				const isMember = chat.membres.some(m => m.utilisateur.toString() === userId.toString());
				if (!isMember) {
					chat.membres.push({ utilisateur: userId });
					await chat.save();
				}
			} catch (err) {
				console.error('Erreur lors de la synchronisation du chat de projet:', err);
			}
		}));

		// Return all chats where user is a member, include lastMessage and unread count
		let chats = await Chat.find({ 'membres.utilisateur': userId })
			.populate('projet', 'nom')
			.populate('membres.utilisateur', 'nom prenom email')
			.lean();

		// fetch last message and unread count for each chat
		const chatPromises = chats.map(async (chat) => {
			const lastMessage = await Message.findOne({ chat: chat._id }).populate('expediteur', 'nom prenom email').sort({ createdAt: -1 }).lean();
			const unreadCount = await Message.countDocuments({ chat: chat._id, expediteur: { $ne: userId }, luPar: { $ne: userId } });
			return {
				...chat,
				lastMessage,
				unread: unreadCount
			};
		});

		chats = await Promise.all(chatPromises);

		res.status(200).json({ nombre: chats.length, chats });
	} catch (error) {
		console.error('Erreur getMyChats:', error);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};

module.exports.getMyChats = getMyChats;
