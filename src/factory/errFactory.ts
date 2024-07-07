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
    INVALID_BODY,
    ROUTE_NOT_FOUND,
    UNAUTHORIZED,
    BAD_REQUEST,
    INTERNAL_ERROR,
    USER_NOT_FOUND,
    NO_DATASETS,
    NO_DATASET_NAME,
    DATASET_DELETION_FAILED,
    REQUEST_ACCEPTED,
    REQUESTS_DENIED,
    PENDING_REQUEST,
    REQUEST_NOT_FOUND,
    NO_PENDING_REQUEST,
    ADMIN_NOT_FOUND,
    INVALID_IMPORT,
    RECHARGE_FAIL,
    DATASET_ALREADY_EXIST,
    DATASET_EMPTY,
    INFERENCE_FAILED,
    INFERENCE_ABORTED,
    ADD_QUEUE_FAILED,
    JOB_NOT_FOUND
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
        [ErrorType.INVALID_BODY]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.INVALID_BODY },

        [ErrorType.ROUTE_NOT_FOUND]: { code: HttpStatusCode.NOT_FOUND, message: Messages.ROUTE_NOT_FOUND },
        [ErrorType.UNAUTHORIZED]: { code: HttpStatusCode.UNAUTHORIZED, message: Messages.UNAUTHORIZED },
        [ErrorType.BAD_REQUEST]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.BAD_REQUEST },
        [ErrorType.INTERNAL_ERROR]: { code: HttpStatusCode.INTERNAL_SERVER_ERROR, message: Messages.INTERNAL_ERROR },

        [ErrorType.USER_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.USER_NOT_FOUND },
        [ErrorType.NO_DATASETS]: { code: HttpStatusCode.NOT_FOUND, message: Messages.NO_DATASETS },
        [ErrorType.NO_DATASET_NAME]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.NO_DATASET_NAME },
        [ErrorType.DATASET_DELETION_FAILED]: { code: HttpStatusCode.INTERNAL_SERVER_ERROR, message: Messages.DATASET_DELETION_FAILED },

        [ErrorType.REQUEST_ACCEPTED]: { code: HttpStatusCode.OK, message: Messages.REQUEST_ACCEPTED },
        [ErrorType.REQUESTS_DENIED]: { code: HttpStatusCode.OK, message: Messages.REQUESTS_DENIED },
        [ErrorType.PENDING_REQUEST]: { code: HttpStatusCode.OK, message: Messages.PENDING_REQUEST },
        [ErrorType.REQUEST_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.REQUEST_NOT_FOUND },
        [ErrorType.NO_PENDING_REQUEST]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.NO_PENDING_REQUEST },

        [ErrorType.ADMIN_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.ADMIN_NOT_FOUND },
        [ErrorType.INVALID_IMPORT]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.INVALID_IMPORT },
        [ErrorType.RECHARGE_FAIL]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.RECHARGE_FAIL },
        [ErrorType.DATASET_ALREADY_EXIST]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.DATASET_ALREADY_EXIST },
        [ErrorType.DATASET_EMPTY]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.DATASET_EMPTY },
        [ErrorType.INFERENCE_FAILED]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.INFERENCE_FAILED },
        [ErrorType.INFERENCE_ABORTED]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.INFERENCE_ABORTED },
        [ErrorType.ADD_QUEUE_FAILED]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.ADD_QUEUE_FAILED },
        [ErrorType.JOB_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, message: Messages.JOB_NOT_FOUND }
    };

    createError(type: ErrorType): CustomError {
        const errorResponse = ErrorFactory.errorMap[type] || {code : 200, message: "ciao"}
        return new CustomError(errorResponse.code, errorResponse.message)
    }

}

export { ErrorFactory, ErrorType, CustomError, ErrorResponse }