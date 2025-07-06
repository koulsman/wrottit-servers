const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../UserModel');

// Middleware to get user by ID
async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Cannot find user' });
    res.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// Create user with hashed password
router.post('/', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      userImage: req.body.userImage
    });
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Push to user's arrays
router.post('/:uid/commented', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.uid,
      { $push: { commented: { id: req.body.id } } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:uid/liked', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.uid,
      { $push: { liked: { id: req.body.id } } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:uid/posts', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.uid,
      { $push: { posts: { id: req.body.id } } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:uid/joined', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.uid,
      { $push: { joined: { id: req.body.id } } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET endpoints
router.get('/id/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', getUser, (req, res) => {
  res.json(res.user);
});

router.get('/:id/joined', getUser, (req, res) => {
  res.json(res.user.joined);
});

router.get('/:id/saved', getUser, (req, res) => {
  res.json(res.user.saved);
});

// Unsupported GETs (name/email/password/userImage) -- should be changed ideally to query-based
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
