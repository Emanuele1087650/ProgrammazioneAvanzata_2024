import { Response } from 'express';
import Messages from './messages';
import HttpStatusCode from './status_code';

interface ResponseObject {
  message?: Messages;
  data?: object;
}

class ResponseSender {
  static send(res: Response, status: HttpStatusCode, responseObject: ResponseObject = {}): void {
    const { message, data } = responseObject;

    if (message && data) {
      res.status(status).json({message: message, data: data});
      return;
    }

    if (message) {
      res.status(status).json({message: message});
      return;
    }

    if (data) {
      res.status(status).json(data);
      return;
    }

    res.status(status).send();
  }
}

export default ResponseSender;
