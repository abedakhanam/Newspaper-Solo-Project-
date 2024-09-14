import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';

interface CategoryAttributes {
  id?: number;
  name: string;
}

interface CategoryCreationAttributes
  extends Optional<CategoryAttributes, 'id'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
  public id!: number;
  public name!: string;
}

Category.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: 'Category' }
);

export default Category;
