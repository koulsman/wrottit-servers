// userModel.js
const mongoose = require('mongoose');
const fullDate = new Date();
      const day = fullDate.getDate();
      const month = fullDate.getMonth() + 1;
      const year = fullDate.getFullYear();
      const date = `${day}/${month}/${year}`
const postSchema = new mongoose.Schema({
  name: { type: String, required: false },
  date: {type: String, required: false},
  uid: { type: String, required: true},
  uname: {type: String, required: true},
  communityName: { type: String, required: true },
  communityId: { type: String, required: true },
  title: { type: String, required: true},
  content: { type: String, required: false},
  images: { type: Array, required: false },
  upvotes: {type: Number, default: 0},
  upvotesby: {type: Array, required: false},
  downvotesby: {type: Array, required: false},
  comments: {
    type: [
      {
        uid: { type: String, required: false }, // User ID of commenter
        uname: { type: String, required: false }, // Name of commenter
        comment: { type: String, required: false }, // The comment text
        date: { type: String, default: date, required: false }, // Timestamp for the comment
      }
    ],
    
    default: [], // Ensure default value is an empty array}
  },
  commentsNumber: { type: Number, required:true, default: 0},
  shares: { type: Number, required: false }
}, { 
  collection: 'posts' // Specify the collection name explicitly
});

const Post = mongoose.model('Post', postSchema);
console.log("database:posts_db, collection:posts")
module.exports = Post;


