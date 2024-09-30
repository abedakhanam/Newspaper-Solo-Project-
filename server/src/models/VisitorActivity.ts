import { Model, DataTypes, Sequelize } from 'sequelize';
import { Article } from './article';

interface VisitorActivityAttributes {
  id?: number; // Make this optional
  visitorId: string;
  articleId: number;
  categoryId?: number;
  viewCount?: number; // Track how many times a specific visitor viewed a particular article
  lastViewedAt?: Date; // Track when the visitor last viewed the article
  createdAt?: Date; // Make these optional as well
  updatedAt?: Date;
}

class VisitorActivity
  extends Model<VisitorActivityAttributes>
  implements VisitorActivityAttributes
{
  public id!: number;
  public visitorId!: string;
  public articleId!: number;
  public categoryId?: number;
  public viewCount!: number; // New field to track view count
  public lastViewedAt!: Date; // New field to track last view time
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize): void {
    VisitorActivity.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        visitorId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        articleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: Article,
            key: 'id',
          },
        },
        categoryId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        viewCount: {
          type: DataTypes.INTEGER,
          defaultValue: 1, // Initialize to 1 for first view
        },
        lastViewedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW, // Set to current time when viewed
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
        tableName: 'visitor_activities',
        timestamps: true,
      }
    );
  }
}

export default VisitorActivity;
