import { Sequelize } from 'sequelize';
import { Article } from './article';
import User from './user';
import Comment from './comment';
import { Category } from './category';
import dbconfig from '../config/config'; // Adjust the path to your config file

// Destructure the configuration for easier use
const { database, username, password, host, dialect, port } = dbconfig;

// Ensure dialect is of type `Dialect`
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect: dialect as 'mysql' | 'postgres' | 'sqlite' | 'mssql', // Cast dialect to valid types
  port,
});

// Initialize Models
Article.initialize(sequelize);
User.initialize(sequelize);
Comment.initialize(sequelize);
Category.initialize(sequelize);

// Define associations
Article.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Article, { foreignKey: 'authorId' });

Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'articleComments' }); // Use consistent alias
Article.hasMany(Comment, { foreignKey: 'articleId', as: 'articleComments' }); // Ensure alias consistency

Comment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

Category.belongsToMany(Article, { through: 'ArticleCategories' });
Article.belongsToMany(Category, { through: 'ArticleCategories' });

// Sync database
sequelize
  .sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

export default sequelize;
