import { getAllUser } from "../models/users";
import HttpStatusCode from "../utils/status_code"
import { Request, Response } from 'express';
import { myQueue } from '../singleton/queueManager';

export async function getAllDatasets(req: any, res: any) {
      return res.status(HttpStatusCode.OK).json(await getAllUser());
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