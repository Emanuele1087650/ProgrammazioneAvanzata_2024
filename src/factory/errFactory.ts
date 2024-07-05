import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';

interface ErrorResponse {
    code: number;
    message: string;
}

enum ErrorType {
    NO_AUTH_HEADER,
    NO_PAYLOAD_HEADER,
    MISSING_TOKEN,
    INVALID_TOKEN,
    MALFORMED_PAYLOAD,
    MISSING_BODY,
    ROUTE_NOT_FOUND,
    UNAUTHORIZED,
    BAD_REQUEST,
    USER_NOT_FOUND,
    REQUEST_ACCEPTED,
    REQUESTS_DENIED,
    PENDING_REQUEST,
    REQUEST_NOT_FOUND,
    NO_PENDING_REQUEST,
    ADMIN_NOT_FOUND,
    INVALID_IMPORT,
    RECHARGE_FAIL,
}

class CustomError extends Error {
    code: number
    constructor (code: number, message: string) {
        super(message)
        this.code = code
    }
}
  
class ErrorFactory {

    private static errorMap: Record<ErrorType, ErrorResponse> = {
        [ErrorType.NO_AUTH_HEADER]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.NO_AUTH_HEADER },
        [ErrorType.NO_PAYLOAD_HEADER]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.NO_PAYLOAD_HEADER },
        [ErrorType.MISSING_TOKEN]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.MISSING_TOKEN },
        [ErrorType.INVALID_TOKEN]: { code: HttpStatusCode.FORBIDDEN, message: Messages.INVALID_TOKEN },
        [ErrorType.MALFORMED_PAYLOAD]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.MALFORMED_PAYLOAD },
        [ErrorType.MISSING_BODY]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.MISSING_BODY },

        [ErrorType.ROUTE_NOT_FOUND]: { code: HttpStatusCode.NOT_FOUND, message: Messages.ROUTE_NOT_FOUND },
        [ErrorType.UNAUTHORIZED]: { code: HttpStatusCode.UNAUTHORIZED, message: Messages.UNAUTHORIZED },
        [ErrorType.BAD_REQUEST]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.BAD_REQUEST },

        [ErrorType.USER_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.USER_NOT_FOUND },

        [ErrorType.REQUEST_ACCEPTED]: { code: HttpStatusCode.OK, message: Messages.REQUEST_ACCEPTED },
        [ErrorType.REQUESTS_DENIED]: { code: HttpStatusCode.OK, message: Messages.REQUESTS_DENIED },
        [ErrorType.PENDING_REQUEST]: { code: HttpStatusCode.OK, message: Messages.PENDING_REQUEST },
        [ErrorType.REQUEST_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.REQUEST_NOT_FOUND },
        [ErrorType.NO_PENDING_REQUEST]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.NO_PENDING_REQUEST },

        [ErrorType.ADMIN_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.ADMIN_NOT_FOUND },
        [ErrorType.INVALID_IMPORT]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.INVALID_IMPORT },
        [ErrorType.RECHARGE_FAIL]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.RECHARGE_FAIL },
    };

    createError(type: ErrorType): CustomError {
        const errorResponse = ErrorFactory.errorMap[type]
        return new CustomError(errorResponse.code, errorResponse.message)
    }

}

export { ErrorFactory, ErrorType, CustomError, ErrorResponse }