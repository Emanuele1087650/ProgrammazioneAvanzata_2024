import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';

interface GoodResponse {
    code: number;
    message: string;
}

export enum ResponseType {
    DATASET_DELETED,
    DATASET_UPDATED,
}

export class ResponseFactory {
    private responseMap: Record<ResponseType, GoodResponse> = {
        [ResponseType.DATASET_DELETED]: { code: HttpStatusCode.OK, message: Messages.DATASET_DELETED },
        [ResponseType.DATASET_UPDATED]: { code: HttpStatusCode.OK, message: Messages.DATASET_UPDATED },
    };

    createResponse(type: ResponseType): GoodResponse {
        return this.responseMap[type] || { code: 500, message: "Internal Server Error" };
    }
}