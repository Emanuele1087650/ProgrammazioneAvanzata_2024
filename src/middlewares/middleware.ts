import * as Authorization from "./authorization";
import * as Validation from "./validation";

export const AUTH = [
  Authorization.verifyHeader,
  Authorization.verifyToken,
  Authorization.verifyJWT,
  Authorization.verifyPayload,
  Authorization.verifyUser
];

export const DATASET = [
  Validation.validateBody,
  Validation.validateDataset,
];

export const UPDATE = [
  Validation.validateBody,
  Validation.validateUpdate,
];

export const INFERENCE = [
  Validation.validateBody,
  Validation.validateInference,
]

export const UPLOAD = [
  Validation.validateBody,
  Validation.validateDataset,
  Validation.validateFile,
];