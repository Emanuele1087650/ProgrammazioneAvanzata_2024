import { getAllUser } from "../models/users";

export async function getAllDatasets(req: any, res: any) {
      return res.status(200).json(await getAllUser());
}