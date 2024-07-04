import express from "express";
//import * as Controller from "../controllers/controller";
//import * as Middleware from "../middlewares/middleware";

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
