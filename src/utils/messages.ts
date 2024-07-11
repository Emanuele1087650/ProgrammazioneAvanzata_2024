enum MESSAGES {

  NO_AUTH_HEADER = "The Authorization header is missing. Please include a valid Authorization header in your request.",
  NO_PAYLOAD_HEADER = "The payload header is invalid. Ensure that the payload header is correctly formatted.",
  NO_HEADER_BEARER = "The Authorization header format should be 'Bearer <token>'. Please check and correct the format.",
  MISSING_TOKEN = "The JWT Token is missing. Please provide a valid JWT Token.",
  INVALID_TOKEN = "The JWT Token provided is invalid. Please check the token and try again.",
  MALFORMED_PAYLOAD = "The payload is malformed. Ensure the payload structure is correct and complete.",
  MISSING_BODY = "The request body is empty. Please include the necessary data in the request body.",
  INVALID_BODY = "The request body is invalid. Verify the body content and format.",
  INVALID_FORMAT = "The file format is invalid. Please use a supported file format.",
  NO_USER = "No users were found. Ensure that there are users in the system.",
  UPDATE_COST_FAILED = "Failed to update the cost. Please check the inputs and try again.",
  NOT_OWNER_JOB = "You are not the owner of this job",

  ROUTE_NOT_FOUND = "The requested route was not found. Please check the URL and try again.",
  UNAUTHORIZED = "You are not authorized to access this resource. Please check your credentials.",
  BAD_REQUEST = "The request is malformed or invalid. Please check the request parameters and try again.",
  INTERNAL_ERROR = "An internal server error occurred. Please try again later.",

  WORKER_FAILED = '{"status": "FAILED", "message": "Inference failed. The tokens have been reloaded. Please try again."}',
  WORKER_ABORTED = '{"status": "ABORTED", "message": "Inference aborted due to insufficient balance. Please recharge your balance."}',
  WORKER_RUNNING = '{"status": "RUNNING", "message": "Inference is currently running. Please wait for completion."}',
  WORKER_PENDING = '{"status": "PENDING", "message": "Inference is pending. It will start shortly."}',
  UPLOAD_DATASET = "The dataset has been successfully uploaded.",
  DATASET_ALREADY_EXIST = "The dataset already exists. Please check the dataset name.",
  DATASET_EMPTY = "The dataset is empty. Please upload a dataset with data.",
  INFERENCE_FAILED = "The inference process failed. Please check the input data and try again.",
  INFERENCE_ABORTED = "The inference process was aborted. Please try again.",
  ADD_QUEUE_FAILED = "Failed to add to the queue. Please check the queue settings and try again.",
  JOB_NOT_FOUND = "The specified job was not found. Please verify the job ID and try again.",
  INSUFFICIENT_BALANCE = "You have insufficient balance to complete this operation. Please recharge your balance.",

  USER_NOT_FOUND = "The specified user was not found. Please verify the user details and try again.",
  NO_DATASETS = "No datasets are available. Please upload a dataset to continue.",
  NO_DATASET_NAME = "No dataset found with the specified name. Please check the dataset name and try again.",
  DATASET_DELETED = "The dataset has been successfully deleted.",
  DATASET_DELETION_FAILED = "An error occurred during dataset deletion. Please try again.",
  DATASET_UPDATED = "The dataset has been successfully updated.",
  FILE_UPLOADED = "The file has been successfully uploaded.",
  NOT_COMPLETED_JOB = "The job is not completed or has failed. Please check the job status.",
  RECHARGED = "User balance has been successfully recharged.",
  
  ADMIN_NOT_FOUND = "The specified admin was not found. Please verify the admin details and try again.",
  INVALID_IMPORT = "The import value is invalid. It must be greater than 0. Please correct and try again.",
  TOKENS_RECHARGED = "Tokens have been successfully recharged.",
  RECHARGE_FAIL = "Failed to recharge tokens. Please try again later.",
}
  
export default MESSAGES;
  