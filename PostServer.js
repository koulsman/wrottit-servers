require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const Post = require('./PostModel'); // Make sure this is your Post model path

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = process.env.PORT || 3002;

const uri = process.env.MONGODB_URI;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

console.log('MongoDB URI being used:', uri);

// Connect to MongoDB and start server
mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Create a post
app.post('/posts', upload.none(), async (req, res) => {
  const post = new Post({
    title: req.body.title,
    communityName: req.body.communityName,
    communityId: req.body.communityId,
    uid: req.body.uid,
    uname: req.body.uname,
    content: req.body.content,
    upvotes: req.body.upvotes || 0,
    date: 'date',
    comments: [],
    images: req.body.images,
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Get all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get post by id
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment to post
app.post('/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { uid, uname, comment } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: { uid, uname, comment } } },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upvote a post
app.post('/:id/upvotes', async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get posts by UID
app.get('/posts/postsby/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const posts = await Post.find({ uid });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get posts by communityId
app.get('/posts/communityPosts/:communityId', async (req, res) => {
  const { communityId } = req.params;
  try {
    const communityPosts = await Post.find({ communityId: String(communityId) });
    res.json(communityPosts);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = app;
