import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { getUserByUsername, User } from '../models/users';
import { ErrorFactory, ErrorType } from '../factory/errFactory';
import ErrorSender from '../utils/error_sender';

dotenv.config();

const errFactory = new ErrorFactory();
const sendError = new ErrorSender();

export function verifyHeader(req: any, res: any, next: any): void {
  try {
    if (req.headers.authorization) next();
    else throw errFactory.createError(ErrorType.NO_AUTH_HEADER);
  } catch (err: any) {
    sendError.send(res, err);
  }
}

export function verifyToken(req: any, res: any, next: any): void {
  try {
    const bearerHeader: string = req.headers.authorization;
    const bearer = bearerHeader.split(' ');
    if (bearer.length === 2 && bearer[0] === 'Bearer') {
      req.token = bearer[1];
      next();
    } else throw errFactory.createError(ErrorType.NO_HEADER_BEARER);
  } catch (err: any) {
    sendError.send(res, err);
  }
}

export function verifyJWT(req: any, res: any, next: any): void {
  try {
    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      throw errFactory.createError(ErrorType.MISSING_TOKEN);
    }
    const decoded = jwt.verify(req.token, jwtKey) as jwt.JwtPayload;
    if (decoded && typeof decoded !== 'string' && decoded.username) {
      req.username = decoded.username;
      next();
    } else {
      throw errFactory.createError(ErrorType.INVALID_TOKEN);
    }
  } catch (err: any) {
    sendError.send(res, err);
  }
}

export function verifyPayload(req: any, res: any, next: any): void {
  try {
    req.body = JSON.parse(JSON.stringify(req.body));
    if (req.body) next();
    else throw errFactory.createError(ErrorType.NO_PAYLOAD_HEADER);
  } catch (err: any) {
    sendError.send(res, err);
  }
}

export async function verifyUser(req: any, res: any, next: any) {
  try {
    const user: User = await getUserByUsername(req.username);
    if (!user) {
      throw errFactory.createError(ErrorType.NO_USER);
    }
    req.user = user;
    next();
  } catch (err: any) {
    sendError.send(res, err);
  }
}

export async function checkAdmin(req: any, res: any, next: any) {
  try {
    const user: User = req.user;
    if (!user || (await user.getRole()) != 'ADMIN') {
      throw errFactory.createError(ErrorType.UNAUTHORIZED);
    } else next();
  } catch (err: any) {
    sendError.send(res, err);
  }
}
