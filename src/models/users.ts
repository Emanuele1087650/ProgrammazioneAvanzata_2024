import { DataTypes, Model, Transaction } from 'sequelize';
import { SequelizeDB } from '../singleton/sequelize';
import { ErrorFactory, ErrorType } from '../factory/errFactory';

const sequelize = SequelizeDB.getConnection();
const errorHandler = new ErrorFactory();

class User extends Model {
  private idUser!: number;
  private username!: string;
  private email!: string;
  private role!: 'ADMIN' | 'USER';
  private tokens!: number;

  async getUserId() {
    return this.idUser;
  }

  async getUsername() {
    return this.username;
  }

  async getRole() {
    return this.role;
  }

  async getBalance() {
    return this.tokens;
  }

  async addTokens(tokens: number, transaction: Transaction) {
    const data = { tokens: this.tokens + tokens };
    await this.update(data, {
      transaction,
    }).catch(() => {
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    });
  }

  async removeTokens(tokens: number, transaction: Transaction) {
    const data = { tokens: this.tokens - tokens };
    await this.update(data, {
      transaction,
    }).catch(() => {
      throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
    });
  }
}

User.init(
  {
    idUser: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "id_user",
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
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
    freezeTableName: true,
  },
);

async function getUserById(idUser: number): Promise<User> {
  const user = await User.findByPk(idUser).catch(() => {
    throw errorHandler.createError(ErrorType.INTERNAL_ERROR);
  });
  if (!user) {
    throw errorHandler.createError(ErrorType.USER_NOT_FOUND);
  }
  return user;
}

async function getUserByUsername(username: string): Promise<User> {
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
