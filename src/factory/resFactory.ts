import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';
import { Response } from 'express';

interface GoodResponse {
    code: number;
    message: string | JSON;
}

export enum ResponseType {
    UPLOAD_DATASET,
    DATASET_DELETED,
    DATASET_UPDATED,
    FILE_UPLOADED,
    WORKER_FAILED,
    WORKER_ABORTED,
    WORKER_RUNNING,
    WORKER_PENDING,
    RECHARGED,
}

export class ResponseFactory {
    private responseMap: Record<ResponseType, GoodResponse> = {
        [ResponseType.UPLOAD_DATASET]: { code: HttpStatusCode.OK, message: Messages.UPLOAD_DATASET },
        [ResponseType.DATASET_DELETED]: { code: HttpStatusCode.OK, message: Messages.DATASET_DELETED },
        [ResponseType.DATASET_UPDATED]: { code: HttpStatusCode.OK, message: Messages.DATASET_UPDATED },
        [ResponseType.FILE_UPLOADED]: { code: HttpStatusCode.OK, message: Messages.FILE_UPLOADED },
        [ResponseType.WORKER_FAILED]: { code: HttpStatusCode.OK, message: JSON.parse(Messages.WORKER_FAILED) },
        [ResponseType.WORKER_ABORTED]: { code: HttpStatusCode.OK, message: JSON.parse(Messages.WORKER_ABORTED) },
        [ResponseType.WORKER_RUNNING]: { code: HttpStatusCode.OK, message: JSON.parse(Messages.WORKER_RUNNING) },
        [ResponseType.WORKER_PENDING]: { code: HttpStatusCode.OK, message: JSON.parse(Messages.WORKER_PENDING) },
        [ResponseType.RECHARGED]: { code: HttpStatusCode.OK, message: Messages.RECHARGED },
    };

    getResponse(type: ResponseType): GoodResponse {
        return this.responseMap[type];
    }

    send(res: Response, type?: ResponseType, data?: Object | Messages): void {
        if(type !== undefined) {
            const { code, message } = this.getResponse(type);
            if (message instanceof String)
                res.status(code).json({message: message});
            else
                res.status(code).json(message);
            return; 
        }
        res.status(HttpStatusCode.OK).json(data);
        return;
    }
}