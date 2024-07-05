import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';

interface GoodResponse {
    code: number;
    message: string;
}

export enum ResponseType {
    UPLOAD_DATASET,
   
}

export class ResponseFactory {
    private responseMap: Record<ResponseType, GoodResponse> = {
        [ResponseType.UPLOAD_DATASET]: { code: HttpStatusCode.OK, message: Messages.UPLOAD_DATASET },
    };

    createResponse(type: ResponseType): GoodResponse {
        return this.responseMap[type];
    }
}