import { Response } from 'express';
import HttpStatusCode from './status_code';

class ResponseSender {
  send(res: Response, status: HttpStatusCode, data: Object): void {
    res.status(status).json(data);
    return;
  }
}

export default ResponseSender;
