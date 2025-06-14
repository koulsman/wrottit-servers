const mongoose = require('mongoose');
const { Schema } = mongoose;

const communitySchema = new Schema({
    name: {type: String, required: true},
   
    description: {type: String, required: true},
    isPrivate: {type: Boolean, default: false},
    // moderators: [{
    //       id: {type: String, required: true},
    //       name: {type: String, required: true}
    // }],
    rules: {type: String, required: false},
    iconImage: { type: Array, required: false },
    bannerImage: { type: Array, required: false }, 
    members: {type: Number, default: 1}

}, { 
    collection: 'communities' // Specify the collection name explicitly
  })

const Community = mongoose.model('Community', communitySchema);
console.log("database:communities_db, collection:communities")
module.exports = Community;
