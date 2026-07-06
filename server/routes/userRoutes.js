const express = require('express');
const router  = express.Router();
const { protect, optionalProtect } = require('../middleware/auth');
const {
  getProfile,
  getUserPosts,
  toggleFollow,
  toggleSavePost,
  toggleFavouriteChannel,
  getSavedPosts
} = require('../controllers/userController');

// Public routes (with optional auth for isFollowing flag)
router.get('/:username',       optionalProtect, getProfile);
router.get('/:username/posts', optionalProtect, getUserPosts);

// Protected routes
router.post('/:username/follow',   protect, toggleFollow);
router.post('/saved/:postId',      protect, toggleSavePost);
router.post('/channels/favourite', protect, toggleFavouriteChannel);
router.get('/me/saved',            protect, getSavedPosts);

module.exports = router;
