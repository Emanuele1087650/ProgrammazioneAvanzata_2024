import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';

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
    WORKER_PENDING
}

export class ResponseFactory {
    private responseMap: Record<ResponseType, GoodResponse> = {
        [ResponseType.UPLOAD_DATASET]: { code: HttpStatusCode.OK, message: Messages.UPLOAD_DATASET },
        [ResponseType.DATASET_DELETED]: { code: HttpStatusCode.OK, message: Messages.DATASET_DELETED },
        [ResponseType.DATASET_UPDATED]: { code: HttpStatusCode.OK, message: Messages.DATASET_UPDATED },
        [ResponseType.FILE_UPLOADED]: { code: HttpStatusCode.OK, message: Messages.FILE_UPLOADED },
        [ResponseType.WORKER_FAILED]: { code: HttpStatusCode.BAD_REQUEST, message: JSON.parse(Messages.WORKER_FAILED) },
        [ResponseType.WORKER_ABORTED]: { code: HttpStatusCode.BAD_REQUEST, message: JSON.parse(Messages.WORKER_ABORTED) },
        [ResponseType.WORKER_RUNNING]: { code: HttpStatusCode.OK, message: JSON.parse(Messages.WORKER_RUNNING) },
        [ResponseType.WORKER_PENDING]: { code: HttpStatusCode.OK, message: JSON.parse(Messages.WORKER_PENDING) }
    };

    createResponse(type: ResponseType): GoodResponse {
        return this.responseMap[type];
    }
}