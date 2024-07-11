import HttpStatusCode from '../utils/status_code';
import Messages from '../utils/messages';

interface ErrorResponse {
    code: number;
    name: string;
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
    INVALID_FORMAT,
    ROUTE_NOT_FOUND,
    UNAUTHORIZED,
    BAD_REQUEST,
    INTERNAL_ERROR,
    USER_NOT_FOUND,
    NO_DATASETS,
    NO_DATASET_NAME,
    DATASET_DELETION_FAILED,
    ADMIN_NOT_FOUND,
    INVALID_IMPORT,
    RECHARGE_FAIL,
    DATASET_ALREADY_EXIST,
    DATASET_EMPTY,
    INFERENCE_FAILED,
    INFERENCE_ABORTED,
    ADD_QUEUE_FAILED,
    JOB_NOT_FOUND,
    INSUFFICIENT_BALANCE,
    NOT_COMPLETED_JOB,
    NO_USER,
    UPDATE_COST_FAILED,
    NO_HEADER_BEARER,
    NOT_OWNER_JOB
}

class CustomError extends Error {
    code: number;
    constructor (code: number, name: string, message: string) {
        super(message);
        this.name = name;
        this.code = code;
    }
}
  
class ErrorFactory {

    private static errorMap: Record<ErrorType, ErrorResponse> = {
        [ErrorType.NO_AUTH_HEADER]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.NO_AUTH_HEADER], message: Messages.NO_AUTH_HEADER },
        [ErrorType.NO_PAYLOAD_HEADER]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.NO_PAYLOAD_HEADER], message: Messages.NO_PAYLOAD_HEADER },
        [ErrorType.MISSING_TOKEN]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.MISSING_TOKEN], message: Messages.MISSING_TOKEN },
        [ErrorType.INVALID_TOKEN]: { code: HttpStatusCode.FORBIDDEN, name: ErrorType[ErrorType.INVALID_TOKEN], message: Messages.INVALID_TOKEN },
        [ErrorType.MALFORMED_PAYLOAD]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.MALFORMED_PAYLOAD], message: Messages.MALFORMED_PAYLOAD },
        [ErrorType.MISSING_BODY]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.MISSING_BODY], message: Messages.MISSING_BODY },
        [ErrorType.INVALID_BODY]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.INVALID_BODY], message: Messages.INVALID_BODY },
        [ErrorType.INVALID_FORMAT]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.INVALID_FORMAT], message: Messages.INVALID_FORMAT },
        [ErrorType.ROUTE_NOT_FOUND]: { code: HttpStatusCode.NOT_FOUND, name: ErrorType[ErrorType.ROUTE_NOT_FOUND], message: Messages.ROUTE_NOT_FOUND },
        [ErrorType.UNAUTHORIZED]: { code: HttpStatusCode.UNAUTHORIZED, name: ErrorType[ErrorType.UNAUTHORIZED], message: Messages.UNAUTHORIZED },
        [ErrorType.BAD_REQUEST]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.BAD_REQUEST], message: Messages.BAD_REQUEST },
        [ErrorType.INTERNAL_ERROR]: { code: HttpStatusCode.INTERNAL_SERVER_ERROR, name: ErrorType[ErrorType.INTERNAL_ERROR], message: Messages.INTERNAL_ERROR },
        [ErrorType.USER_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.USER_NOT_FOUND], message: Messages.USER_NOT_FOUND },
        [ErrorType.NO_DATASETS]: { code: HttpStatusCode.NOT_FOUND, name: ErrorType[ErrorType.NO_DATASETS], message: Messages.NO_DATASETS },
        [ErrorType.NO_DATASET_NAME]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.NO_DATASET_NAME], message: Messages.NO_DATASET_NAME },
        [ErrorType.DATASET_DELETION_FAILED]: { code: HttpStatusCode.INTERNAL_SERVER_ERROR, name: ErrorType[ErrorType.DATASET_DELETION_FAILED], message: Messages.DATASET_DELETION_FAILED },
        [ErrorType.ADMIN_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.ADMIN_NOT_FOUND], message: Messages.ADMIN_NOT_FOUND },
        [ErrorType.INVALID_IMPORT]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.INVALID_IMPORT], message: Messages.INVALID_IMPORT },
        [ErrorType.RECHARGE_FAIL]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.RECHARGE_FAIL], message: Messages.RECHARGE_FAIL },
        [ErrorType.DATASET_ALREADY_EXIST]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.DATASET_ALREADY_EXIST], message: Messages.DATASET_ALREADY_EXIST },
        [ErrorType.DATASET_EMPTY]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.DATASET_EMPTY], message: Messages.DATASET_EMPTY },
        [ErrorType.INFERENCE_FAILED]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.INFERENCE_FAILED], message: Messages.INFERENCE_FAILED },
        [ErrorType.INFERENCE_ABORTED]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.INFERENCE_ABORTED], message: Messages.INFERENCE_ABORTED },
        [ErrorType.ADD_QUEUE_FAILED]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.ADD_QUEUE_FAILED], message: Messages.ADD_QUEUE_FAILED },
        [ErrorType.JOB_NOT_FOUND]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.JOB_NOT_FOUND], message: Messages.JOB_NOT_FOUND },
        [ErrorType.INSUFFICIENT_BALANCE]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.INSUFFICIENT_BALANCE], message: Messages.INSUFFICIENT_BALANCE },
        [ErrorType.NOT_COMPLETED_JOB]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.NOT_COMPLETED_JOB], message: Messages.NOT_COMPLETED_JOB },
        [ErrorType.NO_USER]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.NO_USER], message: Messages.NO_USER },
        [ErrorType.UPDATE_COST_FAILED]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.UPDATE_COST_FAILED], message: Messages.UPDATE_COST_FAILED },
        [ErrorType.NO_HEADER_BEARER]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.NO_HEADER_BEARER], message: Messages.NO_HEADER_BEARER },
        [ErrorType.NOT_OWNER_JOB]: { code: HttpStatusCode.BAD_REQUEST, name: ErrorType[ErrorType.NOT_OWNER_JOB], message: Messages.NOT_OWNER_JOB }
    };

    createError(type: ErrorType): CustomError {
        const errorResponse = ErrorFactory.errorMap[type]
        return new CustomError(errorResponse.code, errorResponse.name, errorResponse.message)
    }

}

export { ErrorFactory, ErrorType, CustomError, ErrorResponse }