enum MESSAGES {

    NO_AUTH_HEADER = "Bad Request - Authorization header missing",
    NO_PAYLOAD_HEADER = "Bad Request - JSON payload header missing",
    MISSING_TOKEN = "Bad Request - JWT Token missing",
    INVALID_TOKEN = "Forbidden - JWT Token invalid",
    MALFORMED_PAYLOAD = "Bad Request - Payload malformed",
    MISSING_BODY = "Empty request body",
    INVALID_BODY = "invalid request body",
  
    ROUTE_NOT_FOUND = "Not Found - Route not found",
    UNAUTHORIZED = "Error - Unauthorized",
    BAD_REQUEST = "Error - Bad request",
    INTERNAL_ERROR = "Internal server error",
  

    UPLOAD_DATASET = "OK - Dataset loaded",
    DATASET_ALREADY_EXIST = "Bad Request - Dataset already exist",
  
    // For users
    USER_NOT_FOUND = "User not found",
    NO_DATASETS = "There are no datasets",
    NO_DATASET_NAME = "There is no dataset with this name",
    DATASET_DELETED = "Dataset deleted succesfully",
    DATASET_DELETION_FAILED = "Error during dataset deletion",
    DATASET_UPDATED = "Dataset updated succesfully",
  
    // For requests
    REQUEST_ACCEPTED = "Request accepted",
    REQUESTS_DENIED = "Requests accepted/denied",
    PENDING_REQUEST = "Request pending for acceptance/denial",
    REQUEST_CREATION_ERROR = "Error - Could not create the request",
    REQUEST_USER_UNAUTHORIZED_GRAPH = "Unauthorized - You are not the creator of the graph",
    REQUEST_NOT_FOUND = "Request not found or already accepted/denied",
    NO_PENDING_REQUEST = "No pending request",
  
    // For admin
    ADMIN_NOT_FOUND = "Admin not found",
    INVALID_IMPORT = "Invalid import, it must be > 0",
    TOKENS_RECHARGED = "Tokens successfully recharged",
    RECHARGE_FAIL = "Error - Could not recharge tokens",

  }
  
  export default MESSAGES;
  