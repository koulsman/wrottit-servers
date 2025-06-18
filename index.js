require('dotenv').config(); // Load environment variables from .env

// Import the UserServer module, which handles DB connection and starts the server
require('./UserServer');
require('./PostServer');
require('./CommunityServer');

console.log('Server initialization started...');