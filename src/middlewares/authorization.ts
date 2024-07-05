require("dotenv").config();
import jwt from "jsonwebtoken";
import { getUserByUsername } from "../models/users";

export function verifyHeader(req: any, res: any, next: any): void {
  if (req.headers.authorization) next();
  else {
    res.status(401).json({message: "Authorization header is missing"});
  }
}

export function verifyToken(req: any, res: any, next: any): void {
  const bearerHeader: string = req.headers.authorization;
  const bearer = bearerHeader.split(" ");
  if (bearer.length === 2 && bearer[0] === "Bearer") {
    req.token = bearer[1];
    next();
  } else {
    res.status(401).json({message: "Authorization header format is 'Bearer <token>'"});
  }
}

export function verifyJWT(req: any, res: any, next: any): void {
  try {
    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      throw new Error("JWT_KEY is not defined");
    }
    const decoded = jwt.verify(req.token, jwtKey) as jwt.JwtPayload;
    if (decoded && typeof decoded !== "string" && decoded.username) {
      req.username = decoded.username; // Aggiungi il nome utente alla richiesta
      next();
    } else {
      res.status(401).json({message: "Invalid token"});
    }
  } catch (error) {
    res.status(401).json({message: "Failed to authenticate token"});
  }
}

export function verifyPayload(req: any, res: any, next: any): void {
  try {
    req.body = JSON.parse(JSON.stringify(req.body));
    next();
  } catch (error) {
    res.status(400).json({message: "Invalid payload"});
  }
}

export async function verifyUser(req: any, res: any, next: any) {
  try {
    const user = await getUserByUsername(req.username);
    if (!user) {
      res.status(404).json({message: "User not found"});
      return;
    }
    req.user = user; 
    next();
  } catch (error) {
    res.status(500).json({message: "Internal server error"});
  }
}
