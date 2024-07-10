import { Response } from 'express';
import HttpStatusCode from './status_code';
import { CustomError } from '../factory/errFactory';

class ErrorSender {
  send(res: Response, err: CustomError | Error): void {
    if (err instanceof CustomError)
      res.status(err.code).json({message: err.message});
    else 
      res.status(HttpStatusCode.BAD_REQUEST).json({type:err.name, message: err.message});
    return;
  }
}

export default ErrorSender;
