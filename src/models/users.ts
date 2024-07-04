import { DataTypes, Transaction } from 'sequelize';
import { SequelizeDB } from '../singleton/sequelize'

const sequelize = SequelizeDB.getConnection();

export const User = sequelize.define(
    "users",
    {
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
        values: ["ADMIN", "USER"],
        defaultValue: "USER",
        allowNull: false,
      },
      tokens: {
        type: DataTypes.REAL,
        defaultValue: 10,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      freezeTableName: true,
    }
);

export async function getUserById(id_user: number) {
  const user = await User.findByPk(id_user, {
    raw: true,
  });
  if (!user) {
    throw new Error(`User with username ${id_user} not found`);
  }
  return user;
}

export async function getUserByUsername(username: string) {
  const user = await User.findOne({
    raw: true,
    where: {username},
  });
  if (!user) {
    throw new Error(`User with username ${username} not found`);
  }
  return user;
}

export async function getAllUser() {
  const users = await User.findAll()
  if(!users) {
    throw new Error('No users found');
  }
}

export async function getBalance(id_user: number) {
  const tokens = await User.findByPk(id_user, {
    raw: true,
    attributes: ['tokens']
  });
  if (!tokens) {
    throw new Error(`User with username ${id_user} not found`);
  }
  return tokens;
}

export async function updateBalance(id_user: number, new_balance: number, transaction: Transaction) {
  try {
    await User.update({
      tokens: new_balance
    }, {
      where: {id_user: id_user},
      transaction: transaction
    });
  } catch {
    throw new Error('Error during balance update');
  }
}

export async function createUser(user: any, transaction: Transaction) {
  await User.create(user, 
    { 
      transaction: transaction 
    }
  ).catch((error) => {
    error;
  });
}
