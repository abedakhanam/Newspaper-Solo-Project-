import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';

interface CommentAttributes {
  id?: number;
  content: string;
  userId?: number;
  articleId?: number;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> {
  public id!: number;
  public content!: string;
  public userId?: number;
  public articleId?: number;
}

Comment.init(
  {
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: 'Comment' }
);

export default Comment;
