const express = require('express');
const router = express.Router();
const { updateBalance, deletePosts } = require('../controllers/admin');

// Update Vibes balance
router.put('/vibes', updateBalance);

// Delete posts in bulk
router.delete('/posts', deletePosts);

module.exports = router;
