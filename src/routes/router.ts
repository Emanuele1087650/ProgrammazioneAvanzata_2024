import express from "express";
import * as Controller from "../controllers/controller";
import * as Middleware from "../middlewares/middleware";

const router = express.Router();

router.post(
    "/createDataset",
    async function (req: any, res: any) {
        Controller.createDataset(req, res);
    }
);

router.post(
    "/deleteDataset"
);

router.post(
    "/datasets",
    async function (req: any, res: any) {
        Controller.getAllDatasets(req, res);
    }
);

router.post(
    "/updateDataset"
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
