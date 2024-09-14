import { Model, DataTypes, Sequelize } from 'sequelize';

class Comment extends Model {
  public id!: number;
  public content!: string;
  public articleId!: number;
  public userId!: number;
  public createdAt!: Date;
  public updatedAt!: Date; // Add this if you want to use it in associations

  public static initialize(sequelize: Sequelize) {
    Comment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        articleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'comments',
        timestamps: true,
      }
    );
  }
}

export default Comment;
