import { Model, DataTypes, Sequelize } from 'sequelize';

class Article extends Model {
  public id!: number;
  public title!: string;
  public content!: string;
  public thumbnailUrl!: string;
  public authorId!: number; // Ensure this matches with your association
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize): void {
    Article.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        thumbnailUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        authorId: {
          // Make sure this matches with the association
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
        tableName: 'articles',
        timestamps: true,
      }
    );
  }
}

export default Article;
