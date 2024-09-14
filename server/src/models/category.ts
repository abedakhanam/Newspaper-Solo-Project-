import { Model, DataTypes, Sequelize } from 'sequelize';

class Category extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public createdAt!: Date;

  public static initialize(sequelize: Sequelize) {
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
        description: {
          type: DataTypes.STRING,
          allowNull: true,
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

export default Category;
