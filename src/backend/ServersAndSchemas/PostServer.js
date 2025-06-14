const mongoose = require('mongoose');
const express = require("express");
const Post = require("./PostModel"); // Assuming Post model is defined properly
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = 'mongodb+srv://stevekoulas:asfalisa1@wrotit.mxylu.mongodb.net/users_db?retryWrites=true&w=majority&appName=wrotit&ssl=true';
const cloudinary_url = 'cloudinary://238832425628676:q2qEiXD1AnxixxgdHhvvqoBRRcA@ddakpw9jf';
app.use(cors({
  origin: 'https://wrottit-yovc.onrender.com',
  //  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log('MongoDB connection error:', error);
  });

// Handling post creation

// app.post("/posts", upload.none(), async (req, res) => {
  
app.post("/posts", upload.none(), async (req, res) => {
  

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


app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post('/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { uid, uname, comment } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: { uid, uname, comment } } }, // Push the new comment into the array
      { new: true } // Return the updated document
    );
    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }
    res.status(200).send(post); // Send updated post
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
  console.log(uid,uname,comment)
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
    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }
    res.status(200).send(post);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
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
