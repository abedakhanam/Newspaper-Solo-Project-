import { Sequelize } from 'sequelize';
import config from '../config/config';

const env =
  (process.env.NODE_ENV as 'development' | 'production') || 'development';
const sequelize = new Sequelize(config[env].url);

import User from './user';
import Article from './article';
import Category from './category';
import Comment from './comment';

// Define relationships
User.hasMany(Article);
Article.belongsTo(User);
Article.belongsTo(Category);
Category.hasMany(Article);
User.hasMany(Comment);
Comment.belongsTo(User);
Article.hasMany(Comment);
Comment.belongsTo(Article);

sequelize.sync({ force: false }).then(() => {
  console.log('Database & tables created!');
});

export default sequelize;
