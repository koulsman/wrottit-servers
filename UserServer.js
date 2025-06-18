// UserServer.js
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const User = require('./UserModel');

const app = express();
const port = process.env.PORT || 3001;

// MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(bodyParser.json());
console.log('MongoDB URI being used:', uri);
// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
// Routes

// Create new user with hashed password
app.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      userImage: req.body.userImage,
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Middleware to get user by ID
async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get user by ID
app.get('/users/id/:id', getUserById, (req, res) => {
  res.json(res.user);
});

// Add to user's commented array
app.post('/users/:uid/commented', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.uid,
      { $push: { commented: { id: req.body.id } } },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add to user's liked array
app.post('/users/:uid/liked', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.uid,
      { $push: { liked: { id: req.body.id } } },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add to user's posts array
app.post('/users/:uid/posts', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.uid,
      { $push: { posts: { id: req.body.id } } },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User login with password check
app.post('/users/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const userObj = user.toObject();
    delete userObj.password; // Remove password before sending
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = app;
