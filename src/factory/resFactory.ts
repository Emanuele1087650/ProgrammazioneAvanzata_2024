import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';

interface GoodResponse {
    code: number;
    message: string;
}

export enum ResponseType {
    UPLOAD_DATASET,
    DATASET_DELETED,
    DATASET_UPDATED,
}

export class ResponseFactory {
    private responseMap: Record<ResponseType, GoodResponse> = {
        [ResponseType.UPLOAD_DATASET]: { code: HttpStatusCode.OK, message: Messages.UPLOAD_DATASET },
        [ResponseType.DATASET_DELETED]: { code: HttpStatusCode.OK, message: Messages.DATASET_DELETED },
        [ResponseType.DATASET_UPDATED]: { code: HttpStatusCode.OK, message: Messages.DATASET_UPDATED },
    };

    createResponse(type: ResponseType): GoodResponse {
        return this.responseMap[type];
    }
}