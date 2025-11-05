const express = require('express');
const router = express.Router();
const { adminLogin, updateBalance, deletePosts } = require('../controllers/admin');

// Admin login (no auth required)
router.post('/login', adminLogin);

// Update Vibes balance
router.put('/vibes', updateBalance);

// Delete posts in bulk
router.delete('/posts', deletePosts);

module.exports = router;
