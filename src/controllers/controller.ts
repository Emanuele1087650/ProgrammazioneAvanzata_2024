import { getAllUser } from "../models/users";
import ErrorSender from "../utils/error_sender";
import MESSAGES from "../utils/messages";
import ResponseSender from "../utils/response_sender";
import HttpStatusCode from "../utils/status_code"
import { Request, Response } from 'express';
import { myQueue } from '../singleton/queueManager';
import { ResponseFactory, ResponseType } from "../factory/resFactory";

const sendResponse = new ResponseSender()
const sendError = new ErrorSender()
const resFactory = new ResponseFactory()

export async function getAllDatasets(req: any, res: any) {
  try {
    sendResponse.send(res, HttpStatusCode.OK, await getAllUser());
    //const response = resFactory.createResponse(ResponseType.NO_AUTH_HEADER)
    //sendResponse.send(res, response.code, response.message);
  } catch(error: any) {
    sendError.send(res, error.code, error.message);
  }
}

export const addJob = async (req: Request, res: Response) => {
  try {
    const jobData = req.body;
    await myQueue.add('my-job', jobData);
    res.status(200).json({ message: 'Job added to queue' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add job to queue', error });
  }
}; 