import { getAllUser } from "../models/users";
import ErrorSender from "../utils/error_sender";
import MESSAGES from "../utils/messages";
import ResponseSender from "../utils/response_sender";
import HttpStatusCode from "../utils/status_code";

const sendResponse = new ResponseSender()
const sendError = new ErrorSender()

export async function getAllDatasets(req: any, res: any) {
      try {
            sendResponse.send(res, HttpStatusCode.OK, await getAllUser());
      } catch(error: any) {
            sendError.send(res, error.code, error.message);
      }
} 