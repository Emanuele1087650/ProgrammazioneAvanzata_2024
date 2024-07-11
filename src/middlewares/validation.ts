import { ErrorFactory, ErrorType } from '../factory/errFactory';
import ErrorSender from '../utils/error_sender';

const errFactory = new ErrorFactory();
const sendError = new ErrorSender();

function validateRequiredKeys(body: any, requiredKeys: string[], res: any): boolean {
  const bodyKeys = Object.keys(body);
  const hasAllRequiredKeys = requiredKeys.every((key) => bodyKeys.includes(key));
  const hasExactKeys = bodyKeys.length === requiredKeys.length;
  if (!hasAllRequiredKeys || !hasExactKeys) {
    const error = errFactory.createError(ErrorType.INVALID_BODY);
    sendError.send(res, error);
    return false;
  }
  return true;
}

function validateStringKeys(body: any, requiredKeys: string[], res: any): boolean {
  const areValuesValid = requiredKeys.every((key) => typeof body[key] === 'string' && body[key].trim() !== '');
  if (!areValuesValid) {
    const error = errFactory.createError(ErrorType.INVALID_BODY);
    sendError.send(res, error);
    return false;
  }
  return true;
}

function validateNumberKeys(body: any, requiredKeys: string[], res: any): boolean {
  const areValuesValid = requiredKeys.every((key) => typeof body[key] === 'number' && body[key] >= 0);
  if (!areValuesValid) {
    const error = errFactory.createError(ErrorType.INVALID_BODY);
    sendError.send(res, error);
    return false;
  }
  return true;
}

export function validateBody(req: any, res: any, next: any): void {
  const body = req.body;
  const bodyKeys = Object.keys(body);
  if (bodyKeys.length === 0) {
    const error = errFactory.createError(ErrorType.MISSING_BODY);
    sendError.send(res, error);
    return;
  }
  next();
}

export function validateDataset(req: any, res: any, next: any): void {
  const requiredKeys = ['name'];
  if (validateStringKeys(req.body, requiredKeys, res) && validateRequiredKeys(req.body, requiredKeys, res)) {
    next();
  }
  return;
}

export function validateUpdate(req: any, res: any, next: any): void {
  const requiredKeys = ['name', 'new_name'];
  if (validateStringKeys(req.body, requiredKeys, res) && validateRequiredKeys(req.body, requiredKeys, res)) {
    next();
  }
  return;
}

export function validateInference(req: any, res: any, next: any): void {
  const requiredKeys = ['dataset', 'model', 'cam_det', 'cam_cls'];
  if (validateStringKeys(req.body, requiredKeys, res) && validateRequiredKeys(req.body, requiredKeys, res)) {
    next();
  }
  return;
}

export function validateFile(req: any, res: any, next: any): void {
  for (const file of req.files) {
    if (!(file.fieldname === 'dataset')) {
      const error = errFactory.createError(ErrorType.BAD_REQUEST);
      sendError.send(res, error);
      return;
    }

    const mimetype = file.mimetype;
    const isImage = mimetype.startsWith('image/');
    const isVideo = mimetype === 'video/mp4';
    const isZip = mimetype === 'application/zip';

    if (!isImage && !isZip && !isVideo) {
      const error = errFactory.createError(ErrorType.INVALID_FORMAT);
      sendError.send(res, error);
      return;
    }
  }
  next();
}

export function validateJob(req: any, res: any, next: any): void {
  const requiredKeys = ['jobId'];
  if (validateNumberKeys(req.body, requiredKeys, res) && validateRequiredKeys(req.body, requiredKeys, res)) {
    next();
  }
  return;
}

export function validateRecharge(req: any, res: any, next: any): void {
  const requiredKeys = ['user', 'tokens'];
  const requiredStringKeys = ['user'];
  const requiredNumberKeys = ['tokens'];
  if (validateStringKeys(req.body, requiredStringKeys, res) &&
    validateNumberKeys(req.body, requiredNumberKeys, res) &&
    validateRequiredKeys(req.body, requiredKeys, res)
  ) {
    next();
  }
  return;
}
