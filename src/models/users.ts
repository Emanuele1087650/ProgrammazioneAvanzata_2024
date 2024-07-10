import { DataTypes, Model, Transaction } from 'sequelize';
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

class User extends Model implements UserData{
  public id_user!: number;
  public username!: string;
  public email!: string;
  public role!: 'ADMIN' | 'USER';
  public tokens!: number;

  async getBalance() {
    return this.tokens
  }

  async updateBalance(new_balance: number, transaction: Transaction) {
    const data = {tokens: new_balance}
    await this.update(data, {
      transaction
    }).catch(() => {
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    });
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

async function getUserById(id_user: number) {
  const user = await User.findByPk(id_user, {
    raw: true,
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (!user) {
    throw errorHandler.createError(ErrorType.USER_NOT_FOUND);
  }
  return user;
}

async function getUserByUsername(username: string) {
  const user = await User.findOne({
    where: { username },
  }).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (!user) {
    throw errorHandler.createError(ErrorType.USER_NOT_FOUND);
  }
  return user;
}

async function getAllUsers() {
  const users = await User.findAll().catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (!users || users.length === 0) {
    throw errorHandler.createError(ErrorType.NO_USER);
  }
  return users;
}

export { User, getUserById, getUserByUsername, getAllUsers };
