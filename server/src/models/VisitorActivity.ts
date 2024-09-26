// src/models/visitorActivity.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import { Article } from './article';

interface VisitorActivityAttributes {
  id?: number; // Make this optional
  visitorId: string;
  articleId: number;
  categoryId?: number;
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
