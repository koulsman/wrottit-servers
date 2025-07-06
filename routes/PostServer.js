const express = require('express');
const router = express.Router();
const multer = require('multer');
const Post = require('../PostModel'); // Σωστή διαδρομή μοντέλου

const upload = multer({ dest: 'uploads/' });

// Δημιουργία post
router.post('/posts', upload.none(), async (req, res) => {
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

// Όλα τα posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Προσθήκη comment
router.post('/posts/:id/comments', async (req, res) => {
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

// Upvote
router.post('/:id/upvotes', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Posts by user
router.get('/posts/postsby/:uid', async (req, res) => {
  try {
    const posts = await Post.find({ uid: req.params.uid });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Posts by community
router.get('/posts/communityPosts/:communityId', async (req, res) => {
  try {
    const communityPosts = await Post.find({ communityId: String(req.params.communityId) });
    res.json(communityPosts);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/posts/searchedPosts/:term',async (req,res) => {
  const {term} = req.params;
  try {
    const searchedTitles = await Post.find({
      title: { $regex: term, $options: 'i' } // 'i' for case-insensitive
    });
    const searchedContent = await Post.find({
      content: {$regex: term, $options: 'i'}
    });
   const merged = [...searchedTitles, ...searchedContent];
const uniquePosts = Array.from(new Map(merged.map(item => [item._id.toString(), item])).values());
res.json(uniquePosts);

  }
  catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
})

module.exports = router;
