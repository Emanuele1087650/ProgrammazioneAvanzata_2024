import { getAllUser } from "../models/users";

export async function getAllDatasets(req: any, res: any) {
      await getAllUser();
      return;
  }