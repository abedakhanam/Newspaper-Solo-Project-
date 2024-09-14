import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';

interface ArticleAttributes {
  id?: number;
  title: string;
  description: string;
  content: string;
  thumbnail_url?: string;
  userId?: number;
  categoryId?: number;
}

interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id'> {}

class Article extends Model<ArticleAttributes, ArticleCreationAttributes> {
  public id!: number;
  public title!: string;
  public description!: string;
  public content!: string;
  public thumbnail_url?: string;
  public userId?: number;
  public categoryId?: number;
}

Article.init(
  {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    thumbnail_url: { type: DataTypes.STRING },
  },
  { sequelize, modelName: 'Article' }
);

export default Article;
