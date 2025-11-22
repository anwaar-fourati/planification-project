const express = require('express');
const router = express.Router();
const { getChatByProject } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/chats/project/:projectId
router.get('/project/:projectId', protect, getChatByProject);

// GET /api/chats/me - chats of current user
const { getMyChats } = require('../controllers/messageController');
router.get('/me', protect, getMyChats);

module.exports = router;
