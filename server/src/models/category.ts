// src/models/category.ts
import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import { Article } from './article'; // Import Article model

interface CategoryAttributes {
  id?: number;
  name: string;
  createdAt?: Date;
}

class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public createdAt!: Date;

  public addArticles!: (articles: Article | Article[]) => Promise<void>;
  public removeArticles!: (articles: Article | Article[]) => Promise<void>;
  public setArticles!: (articles: Article | Article[]) => Promise<void>;

  public static associations: {
    articles: Association<Category, Article>;
  };

  public static initialize(sequelize: Sequelize): void {
    Category.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'categories',
        timestamps: true,
      }
    );
  }
}

export { Category };
