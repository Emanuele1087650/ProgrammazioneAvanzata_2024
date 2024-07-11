import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';
import { Response } from 'express';

interface GoodResponse {
  code: number;
  status: string;
  message: string | JSON;
}

export enum ResponseType {
  UPLOAD_DATASET,
  DATASET_DELETED,
  DATASET_UPDATED,
  FILE_UPLOADED,
  FAILED,
  ABORTED,
  RUNNING,
  PENDING,
  RECHARGED,
}

export class ResponseFactory {
  private responseMap: Record<ResponseType, GoodResponse> = {
    [ResponseType.UPLOAD_DATASET]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.UPLOAD_DATASET],
      message: Messages.UPLOAD_DATASET,
    },
    [ResponseType.DATASET_DELETED]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.DATASET_DELETED],
      message: Messages.DATASET_DELETED,
    },
    [ResponseType.DATASET_UPDATED]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.DATASET_UPDATED],
      message: Messages.DATASET_UPDATED,
    },
    [ResponseType.FILE_UPLOADED]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.FILE_UPLOADED],
      message: Messages.FILE_UPLOADED,
    },
    [ResponseType.FAILED]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.FAILED],
      message: Messages.FAILED,
    },
    [ResponseType.ABORTED]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.ABORTED],
      message: Messages.ABORTED,
    },
    [ResponseType.RUNNING]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.RUNNING],
      message: Messages.RUNNING,
    },
    [ResponseType.PENDING]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.PENDING],
      message: Messages.PENDING,
    },
    [ResponseType.RECHARGED]: {
      code: HttpStatusCode.OK,
      status: ResponseType[ResponseType.RECHARGED],
      message: Messages.RECHARGED,
    },
  };

  getResponse(type: ResponseType): GoodResponse {
    return this.responseMap[type];
  }

  send(res: Response, type?: ResponseType, data?: any | Messages): void {
    if (type !== undefined) {
      const { code, status, message } = this.getResponse(type);
      res.status(code).json({ status: status, message: message });
      return;
    }
    res.status(HttpStatusCode.OK).json(data);
    return;
  }
}
