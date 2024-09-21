import { Model, DataTypes, Sequelize, Optional, Association } from 'sequelize';
import { Category } from './category'; // Import Category model
import User from './user'; // Import User model
import Comment from './comment'; // Import Comment model

interface ArticleAttributes {
  id: number;
  title: string;
  description: string;
  content: string;
  thumbnailUrl?: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
  articleComments?: Comment[]; // Add this line to include comments
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
  public getCategories!: (options?: any) => Promise<Category[]>;

  public readonly categories?: Category[];
  public readonly author?: User; // Add this line

  // Add the articleComments property
  public readonly articleComments?: Comment[];

  public static associations: {
    categories: Association<Article, Category>;
    author: Association<Article, User>;
    articleComments: Association<Article, Comment>; // Add this line
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
          type: DataTypes.TEXT,
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
