import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from './index';

interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;

  public static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: 'User' }
);

User.beforeCreate(async (user) => {
  user.password = await User.hashPassword(user.password);
});

export default User;
