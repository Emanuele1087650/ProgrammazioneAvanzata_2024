import { Sequelize } from 'sequelize';
import { ErrorFactory, ErrorType } from '../factory/errFactory';
import * as dotenv from 'dotenv';

dotenv.config();

const errFactory = new ErrorFactory();

/**
 * Class that manages the database connection using Sequelize.
 */
export class SequelizeDB {
  private static instance: SequelizeDB;
  private connection: Sequelize;

  /**
   * Private constructor to prevent multiple instantiations.
   * Checks that all required environment variables are present.
   */
  private constructor() {
    if (
      !process.env.DB_NAME ||
      !process.env.DB_USER ||
      !process.env.DB_PASS ||
      !process.env.DB_HOST ||
      !process.env.DB_PORT
    ) {
      throw errFactory.createError(ErrorType.MISSING_ENV_VARIABLE);
    }

    this.connection = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: 'postgres',
        dialectOptions: {
          useUTC: false, // for reading from database
        },
        timezone: process.env.TZ,
      },
    );
  }

  /**
   * Returns the singleton connection to Sequelize.
   * @returns {Sequelize} Instance of Sequelize for the database connection.
   */
  public static getConnection(): Sequelize {
    if (!SequelizeDB.instance) {
      SequelizeDB.instance = new SequelizeDB();
    }
    return SequelizeDB.instance.connection;
  }
}
