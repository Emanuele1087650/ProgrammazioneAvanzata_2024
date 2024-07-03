import express from "express";
import * as Controller from "../controller/controller";
import * as Middleware from "../middleware/middleware";

const router = express.Router();

router.post(
    "/createDataset"
);

router.post(
    "/deleteDataset"
);

router.post(
    "/datasets"
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
