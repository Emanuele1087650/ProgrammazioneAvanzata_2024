import { Response } from 'express';
import Messages from './messages';
import HttpStatusCode from './status_code';

class ErrorSender {
  send(res: Response, status: HttpStatusCode, message: Messages): void {
    res.status(status).json({message: message});
    return;
  }
}

export default ErrorSender;
