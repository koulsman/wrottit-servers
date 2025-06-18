// userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userImage: {type: String, required: false},
  liked: {type: Array,required: false },
  commented: {type: Array, required: false},
  posts: {type: Array, required: false}
}, { 
  collection: 'users' // Specify the collection name explicitly
});

const User = mongoose.model('User', userSchema);
console.log("database:users_db, collection:users")
module.exports = User;
