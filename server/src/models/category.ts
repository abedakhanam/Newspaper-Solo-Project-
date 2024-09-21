import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Article } from './article'; // Import Article model

interface CategoryAttributes {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryCreationAttributes
  extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Augment the Category model to include articles
class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: number;
  public name!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Adding articles property
  public readonly articles?: Article[];

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
        updatedAt: {
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
