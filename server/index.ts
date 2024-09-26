import express from 'express';
import sequelize from './src/models'; // Import the initialized Sequelize instance
import cors from 'cors';
import path from 'path';
import { Server } from 'socket.io';

// Import route files
import userRoutes from './src/routes/userRoutes';
import commentRoutes from './src/routes/commentRoutes';
import authRoutes from './src/routes/authRoutes';
import articleRoutes from './src/routes/articleRoutes';
import categoryRoutes from './src/routes/categoryRoutes';
import visitorRoutes from './src/routes/visitorRoutes';

const app = express();
const PORT = process.env.PORT || 3000;
const server = require('http').createServer(app);

// Configure Socket.io with CORS
export const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins, you can adjust this to limit CORS if necessary
    methods: ['GET', 'POST'],
  },
});

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io Event Handling
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Emit welcome message on connection
  socket.emit('welcome', { message: 'Welcome to the Socket.IO server!' });

  // Handle article deletion event from the client
  socket.on('articleDeleted', (articleId) => {
    console.log(`Article deleted: ${articleId}`);
    io.emit('articleDeleted', articleId); // Notify all clients to remove the article
  });

  // Handle article update event from the client
  socket.on('articleUpdated', (article) => {
    console.log('Article updated:', article);
    io.emit('articleUpdated', article); // Broadcast article update event
  });

  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

// Your API routes go here
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Use route files
app.use('/api', userRoutes); // Routes for user-related operations
app.use('/api', commentRoutes); // Routes for comment-related operations
app.use('/api', authRoutes); // Routes for authentication operations
app.use('/api', articleRoutes); // Routes for article-related operations
app.use('/api', categoryRoutes); // Routes for category-related operations
app.use('/api', visitorRoutes);

// Connect to the database and start the server
const startServer = async () => {
  console.log('Attempting to connect to the database...');
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models with the database
    await sequelize.sync({ alter: true });
    console.log('Models synced with the database.');

    // Start both HTTP server and Socket.io
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
