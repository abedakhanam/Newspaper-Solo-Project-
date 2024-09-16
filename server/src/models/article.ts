import { Model, DataTypes, Sequelize, Optional, Association } from 'sequelize';
import { Category } from './category'; // Import Category model

interface ArticleAttributes {
  id: number;
  title: string;
  description: string;
  content: string;
  thumbnailUrl?: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ArticleCreationAttributes
  extends Optional<ArticleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Article
  extends Model<ArticleAttributes, ArticleCreationAttributes>
  implements ArticleAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public content!: string;
  public thumbnailUrl?: string;
  public authorId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association methods
  public addCategories!: (categories: Category | Category[]) => Promise<void>;
  public removeCategories!: (
    categories: Category | Category[]
  ) => Promise<void>;
  public setCategories!: (categories: Category | Category[]) => Promise<void>;

  public readonly categories?: Category[]; // Add this to include associated categories

  public static associations: {
    categories: Association<Article, Category>;
  };

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
        description: {
          type: DataTypes.STRING,
          allowNull: true,
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

export { Article, ArticleCreationAttributes };
