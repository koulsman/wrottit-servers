require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
const allowedOrigins = [
  'http://localhost:3000', // Dev frontend
  'https://wrottit-yovc.onrender.com' // Deployed frontend
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(bodyParser.json());

// Import routes (from the old UserServer/PostServer/CommunityServer)
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/PostServer');
// const communityRoutes = require('./routes/communities');

// Mount routes
app.use('/users', userRoutes);
app.use('/PostServer', postRoutes);
// app.use('/communities', communityRoutes);

app.get('/', (req, res) => {
  res.send('🌍 Wrottit unified backend is running');
});


app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});