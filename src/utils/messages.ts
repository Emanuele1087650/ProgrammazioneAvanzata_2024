enum MESSAGES {

    NO_AUTH_HEADER = "Bad Request - Authorization header missing",
    NO_PAYLOAD_HEADER = "Bad Request - JSON payload header missing",
    MISSING_TOKEN = "Bad Request - JWT Token missing",
    INVALID_TOKEN = "Forbidden - JWT Token invalid",
    MALFORMED_PAYLOAD = "Bad Request - Payload malformed",
    MISSING_BODY = "Empty request body",
    INVALID_BODY = "invalid request body",
    INVALID_FORMAT = "Bad request - Invalid file format",
  
    ROUTE_NOT_FOUND = "Not Found - Route not found",
    UNAUTHORIZED = "Error - Unauthorized",
    BAD_REQUEST = "Error - Bad request",
    INTERNAL_ERROR = "Internal server error",
  
    WORKER_FAILED = '{"status": "FAILED", "message": "Inference failed. The tokens have been reloaded"}',
    WORKER_ABORTED = '{"status": "ABORTED", "message": "Insufficient balance"}',
    WORKER_RUNNING = '{"status": "RUNNING", "message": "Inference running"}',
    WORKER_PENDING = '{"status": "PENDING", "message": "Inference pending"}',
    UPLOAD_DATASET = "OK - Dataset loaded",
    DATASET_ALREADY_EXIST = "Bad Request - Dataset already exist",
    DATASET_EMPTY = "Bad Request - This dataset is empty",
    INFERENCE_FAILED = "Bad Request - Inference failed",
    INFERENCE_ABORTED = "Bad Request - Inference aborted",
    ADD_QUEUE_FAILED = "Bad Request - Failed to added queue",
    JOB_NOT_FOUND = "Bad Request - Job nont found",
    INSUFFICIENT_BALANCE = "Bad Request - Insufficient balance",
  
    // For users
    USER_NOT_FOUND = "User not found",
    NO_DATASETS = "There are no datasets",
    NO_DATASET_NAME = "There is no dataset with this name",
    DATASET_DELETED = "Dataset deleted succesfully",
    DATASET_DELETION_FAILED = "Error during dataset deletion",
    DATASET_UPDATED = "Dataset updated succesfully",
    FILE_UPLOADED = "File uploaded succesfully",
    NOT_COMPLETED_JOB = "Job is non completed or failed",
    RECHARGED = "User balance recharged succesfully",
  
    // For requests
    REQUEST_ACCEPTED = "Request accepted",
    REQUESTS_DENIED = "Requests accepted/denied",
    PENDING_REQUEST = "Request pending for acceptance/denial",
    REQUEST_CREATION_ERROR = "Error - Could not create the request",
    REQUEST_NOT_FOUND = "Request not found or already accepted/denied",
    NO_PENDING_REQUEST = "No pending request",
  
    // For admin
    ADMIN_NOT_FOUND = "Admin not found",
    INVALID_IMPORT = "Invalid import, it must be > 0",
    TOKENS_RECHARGED = "Tokens successfully recharged",
    RECHARGE_FAIL = "Error - Could not recharge tokens",

  }
  
  export default MESSAGES;
  