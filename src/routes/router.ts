import express from "express";
import * as Middleware from "../middlewares/middleware";
import * as Controller from "../controllers/controller";
import multer from 'multer';

const router = express.Router();
const upload = multer().any();

router.post(
    "/createDataset",
    Middleware.DATASET,
    async function (req: any, res: any) {
        Controller.createDatasets(req, res);
    }
);

router.post(
    "/deleteDataset",
    Middleware.DATASET,
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
    Middleware.UPDATE,
    async function (req: any, res: any) {
        Controller.updateDataset(req, res);
    }
);

router.post(
    "/upload",
    upload,
    Middleware.UPLOAD,
    async function (req: any, res: any) {
        Controller.upload(req, res);
    }
);

router.post(
    "/inference",
    Middleware.INFERENCE,
    async function (req: any, res: any) {
        Controller.addQueue(req, res);
    }
);

router.post(
    "/job",
    Middleware.JOB,
    async function (req: any, res: any) {
        Controller.getJob(req, res);
    }
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
