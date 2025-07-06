

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Community = require('../CommunitySchema'); // Your mongoose model


require('dotenv').config();
const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 3003;



const allowedOrigins = [
  'http://localhost:3000', // local frontend
  'https://wrottit-yovc.onrender.com' // deployed frontend
];

router.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
router.use(bodyParser.json());

console.log('MongoDB URI being used:', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB Connected!');
    router.listen(port, () => {
      console.log(`Community server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Create a new community
router.post('/communities', async (req, res) => {
  const community = new Community({
    name: req.body.name,
    description: req.body.description,
    rules: req.body.rules,
    isPrivate: req.body.isPrivate,
    // moderators: req.body.moderators, // Uncomment if you add moderators field
    iconImage: req.body.iconImage,
    bannerImage: req.body.bannerImage,
    members: req.body.members,
    flags: req.body.flags
  });

  try {
    const newCommunity = await community.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all communities
router.get('/communities', async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get community by ID
router.get('/communities/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/communities/searchedCommunities/:term', async (req,res) => {
   const {term} = req.params;
   try {
     const communitiesMatched = await Community.find({
      name: {$regex: term, $options: 'i'} 
     })
     res.json(communitiesMatched)
   }
   catch {
       res.status(500).json({ message: err.message });
   }
})
module.exports = router;
