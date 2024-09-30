import { Sequelize } from 'sequelize';
import { Article } from './article';
import User from './user';
import Comment from './comment';
import { Category } from './category';
import VisitorActivity from './VisitorActivity'; // Import VisitorActivity model
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
VisitorActivity.initialize(sequelize); // Initialize VisitorActivity model

// Define associations
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(Article, { foreignKey: 'authorId' });

Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'articleComments' });
Article.hasMany(Comment, {
  foreignKey: 'articleId',
  as: 'articleComments',
  onDelete: 'CASCADE',
});

Comment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

// Associations between Category and Article
Category.belongsToMany(Article, {
  through: 'ArticleCategories',
  as: 'articles',
});
Article.belongsToMany(Category, {
  through: 'ArticleCategories',
  as: 'categories',
});

// Define associations for VisitorActivity
VisitorActivity.belongsTo(Article, {
  foreignKey: 'articleId',
  as: 'article',
  onDelete: 'CASCADE',
});
VisitorActivity.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

// Sync database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

export default sequelize;
