import * as Authorization from "./authorization";
//import * as validation from "./validation";

export const AUTH = [
  Authorization.verifyHeader,
  Authorization.verifyToken,
  Authorization.verifyJWT,
  Authorization.verifyPayload,
  Authorization.verifyUser
];