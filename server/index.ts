import express from 'express';
import sequelize from './src/models'; // Import the initialized Sequelize instance
const cors = require('cors');
import path from 'path';

// Import route files
import userRoutes from './src/routes/userRoutes';
import commentRoutes from './src/routes/commentRoutes';
import authRoutes from './src/routes/authRoutes';
import articleRoutes from './src/routes/articleRoutes';
import categoryRoutes from './src/routes/categoryRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Connect to the database and start the server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models with the database
    await sequelize.sync({ force: false }); // force: true will drop the tables on each start
    console.log('Models synced with the database.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
