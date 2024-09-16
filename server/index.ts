import express from 'express';
import sequelize from './src/models'; // Import the initialized Sequelize instance
const cors = require('cors');
// Import route files
import userRoutes from './src/routes/userRoutes';
import commentRoutes from './src/routes/commentRoutes';
import authRoutes from './src/routes/authRoutes';
import articleRoutes from './src/routes/articleRoutes';
import categoryRoutes from './src/routes/categoryRoutes';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON requests
app.use(cors());
// Your API routes go here
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Use route files
app.use('/api', userRoutes); // Routes for user-related operations
app.use('/api', commentRoutes); // Routes for comment-related operations
app.use('/api', authRoutes); // Routes for authentication operations
app.use('/api', articleRoutes); // Routes for article-related operations
app.use('/api', categoryRoutes); // Routes for categroy-related operations

// Connect to the database and start the server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync models with the database
    await sequelize.sync({ force: false }); // force: true will drop the tables on each start
    console.log('Models synced with the database.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT || 3000}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
