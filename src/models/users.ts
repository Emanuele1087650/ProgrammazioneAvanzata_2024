import { Sequelize, DataTypes, Model, Transaction } from 'sequelize';
import { SequelizeDB } from '../singleton/sequelize';
import { ErrorFactory, ErrorType } from '../factory/errFactory';

const sequelize = SequelizeDB.getConnection();
const errorHandler = new ErrorFactory();

interface UserData {
  username: string;
  email: string;
  role?: 'ADMIN' | 'USER';
  tokens?: number;
}

class User extends Model {
  public id_user!: number;
  public username!: string;
  public email!: string;
  public role!: 'ADMIN' | 'USER';
  public tokens!: number;

  static async createUser(data: any, transaction: Transaction) {
    try {
      const result = await User.create(data, { transaction });
      return result;
    } catch (error) {
      await transaction.rollback();
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    }
  }

  static async getUserById(id_user: number) {
    const user = await User.findByPk(id_user, {
      raw: true,
    });
    if (!user) {
      throw new Error(`User with id ${id_user} not found`);
    }
    return user;
  }

  static async getUserByUsername(username: string) {
    const user = await User.findOne({
      where: { username },
    });
    if (!user) {
      throw new Error(`User with username ${username} not found`);
    }
    return user;
  }

  static async getAllUsers() {
    const users = await User.findAll();
    if (!users || users.length === 0) {
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    }
    return users;
  }

  static async getBalance(id_user: number) {
    const user = await User.findByPk(id_user, {
      raw: true,
      attributes: ['tokens'],
    });
    if (!user) {
      throw new Error(`User with id ${id_user} not found`);
    }
    return user.tokens;
  }

  static async updateBalance(id_user: number, new_balance: number, transaction: Transaction) {
    try {
      const result = await User.update({ tokens: new_balance }, {
        where: { id_user },
        transaction
      });
      if (result[0] === 0) {
        throw errorHandler.createError(ErrorType.BAD_REQUEST);
      }
    } catch (error) {
      await transaction.rollback();
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    }
  }
}

User.init({
  id_user: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM,
    values: ['ADMIN', 'USER'],
    defaultValue: 'USER',
    allowNull: false,
  },
  tokens: {
    type: DataTypes.REAL,
    defaultValue: 10,
  },
}, {
  sequelize,
  tableName: 'users',
  timestamps: false,
  freezeTableName: true,
});

export { User };
