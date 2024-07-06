import express from "express";
//import * as Controller from "../controllers/controller_vecchio";
import * as Middleware from "../middlewares/middleware";

import * as Controller from "../controllers/controller";

const router = express.Router();

router.post(
    "/createDataset",
    async function (req: any, res: any) {
        Controller.createDatasets(req, res);
    }
);

router.post(
    "/deleteDataset",
    async function (req: any, res: any) {
        Controller.deleteDataset(req, res);
    }
);

router.post(
    "/datasets",
    async function (req: any, res: any) {
        Controller.getAllDatasets(req, res);
    }
);

router.post(
    "/updateDataset",
    async function (req: any, res: any) {
        Controller.updateDataset(req, res);
    }
);

router.post(
    "/upload"
);

router.post(
    "/inference"
);

router.post(
    "/status"
);

router.post(
    "/results"
);

router.post(
    "/token"
);

router.post(
    "/recharge"
);

export default router;
