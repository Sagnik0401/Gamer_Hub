const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

// GET /api/users/:username — public profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-passwordHash -email')
      .populate('followers', 'username')
      .populate('following', 'username')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Count posts
    const postCount = await Post.countDocuments({ userId: user._id });

    // Is the caller following this user?
    const isFollowing = req.user
      ? req.user.following.some(id => id.toString() === user._id.toString())
      : false;

    res.status(200).json({ ...user, postCount, isFollowing });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:username/posts — posts by a specific user
const getUserPosts = async (req, res, next) => {
  try {
    const target = await User.findOne({ username: req.params.username }).select('_id').lean();
    if (!target) return res.status(404).json({ message: 'User not found' });

    const { page = 1, limit = 15 } = req.query;
    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(Math.max(1, Number(limit)), 50);

    const posts = await Post.find({ userId: target._id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'username')
      .lean();

    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:username/follow — toggle follow/unfollow
const toggleFollow = async (req, res, next) => {
  try {
    const target = await User.findOne({ username: req.params.username }).select('_id username');
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const alreadyFollowing = req.user.following.some(
      id => id.toString() === target._id.toString()
    );

    if (alreadyFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id,  { $pull: { following: target._id } });
      await User.findByIdAndUpdate(target._id, { $pull: { followers: req.user._id } });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id,  { $addToSet: { following: target._id } });
      await User.findByIdAndUpdate(target._id, { $addToSet: { followers: req.user._id } });
    }

    const updated = await User.findById(target._id)
      .select('followers')
      .populate('followers', 'username')
      .lean();
    res.status(200).json({
      following: !alreadyFollowing,
      followers: updated.followers
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/saved/:postId — toggle bookmark
const toggleSavePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const alreadySaved = req.user.savedPosts.some(
      id => id.toString() === postId
    );

    const update = alreadySaved
      ? { $pull:     { savedPosts: postId } }
      : { $addToSet: { savedPosts: postId } };

    await User.findByIdAndUpdate(req.user._id, update);
    res.status(200).json({ saved: !alreadySaved, postId });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/channels/favourite — toggle favourite channel (tag)
const toggleFavouriteChannel = async (req, res, next) => {
  try {
    const { channel } = req.body;
    if (!channel || typeof channel !== 'string') {
      return res.status(400).json({ message: 'channel is required' });
    }

    const tag = channel.toLowerCase().trim();
    const alreadyFav = req.user.favoriteChannels.includes(tag);

    const update = alreadyFav
      ? { $pull:     { favoriteChannels: tag } }
      : { $addToSet: { favoriteChannels: tag } };

    const updated = await User.findByIdAndUpdate(req.user._id, update, { new: true })
      .select('favoriteChannels');

    res.status(200).json({
      favourited: !alreadyFav,
      favoriteChannels: updated.favoriteChannels
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/saved — get saved posts for the logged-in user
const getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('savedPosts')
      .populate({
        path: 'savedPosts',
        populate: { path: 'userId', select: 'username' }
      })
      .lean();

    res.status(200).json(user.savedPosts.reverse()); // most recently saved first
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  getUserPosts,
  toggleFollow,
  toggleSavePost,
  toggleFavouriteChannel,
  getSavedPosts
};
