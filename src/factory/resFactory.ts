import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';

interface GoodResponse {
    code: number;
    message: string;
}

export enum ResponseType {
    NO_AUTH_HEADER,
}

export class ResponseFactory {
    private responseMap: Record<ResponseType, GoodResponse> = {
        [ResponseType.NO_AUTH_HEADER]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.NO_AUTH_HEADER },
    };

    createResponse(type: ResponseType): GoodResponse {
        return this.responseMap[type] || { code: 500, message: "Internal Server Error" };
    }
}