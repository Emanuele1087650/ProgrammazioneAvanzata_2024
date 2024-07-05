import { Response } from 'express';
import HttpStatusCode from './status_code';
import Messages from './messages';

class ResponseSender {
  send(res: Response, status: HttpStatusCode, data: Object | Messages): void {
    if (data instanceof Object){
      res.status(status).json(data);
      return;
    }
    res.status(status).json({message: data});
      return; 
  }
}

export default ResponseSender;
