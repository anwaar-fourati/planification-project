const express = require('express');
const router = express.Router();
const { envoyerMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:chatId', protect, envoyerMessage);
router.get('/:chatId', protect, getMessages);

module.exports = router;
