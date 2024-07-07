import { ErrorFactory, ErrorType } from "../factory/errFactory";

const errFactory = new ErrorFactory();

function validateKeys(dataset: any, requiredKeys: string[], res: any): boolean {
    const datasetKeys = Object.keys(dataset);
    const hasAllRequiredKeys = requiredKeys.every(key => datasetKeys.includes(key));
    const hasExactKeys = datasetKeys.length === requiredKeys.length;
    const areValuesValid = requiredKeys.every(key => typeof dataset[key] === 'string' && dataset[key].trim() !== '');
    if (!hasAllRequiredKeys || !hasExactKeys || !areValuesValid) {
        const error = errFactory.createError(ErrorType.INVALID_BODY);
        res.status(error.code).json({ message: error.message });
        return false;
    }
    return true;
}

export function validateBody(req: any, res: any, next: any): void {
    const dataset = req.body;
    const datasetKeys = Object.keys(dataset);
    if (datasetKeys.length === 0) {
        const error = errFactory.createError(ErrorType.MISSING_BODY);
        res.status(error.code).json({ message: error.message });
        return;
    }
    next();
}

export function validateDataset(req: any, res: any, next: any): void {
    const requiredKeys = ["name"];
    if (validateKeys(req.body, requiredKeys, res)) {
        next();
    }
}

export function validateUpdate(req: any, res: any, next: any): void {
    const requiredKeys = ["name", "new_name"];
    if (validateKeys(req.body, requiredKeys, res)) {
        next();
    }
}

export function validateInference(req: any, res: any, next: any): void {
    const requiredKeys = ["dataset", "model", "cam_det", "cam_cls"];
    if (validateKeys(req.body, requiredKeys, res)) {
        next();
    }
}

export function validateFile(req: any, res: any, next: any): void {
    if (!(req.files.length === 1)){
        const error = errFactory.createError(ErrorType.BAD_REQUEST);
        res.status(error.code).json({ message: error.message });
    }
    const file = req.files[0];
    if(!(file.fieldname === 'dataset')){
        const error = errFactory.createError(ErrorType.BAD_REQUEST);
        res.status(error.code).json({ message: error.message });
    }
    
    const mimetype = file.mimetype;
    const isImage = mimetype.startsWith('image/');
    const isZip = mimetype === 'application/zip';

    if (!isImage && !isZip) {
        const error = errFactory.createError(ErrorType.INVALID_FORMAT);
        res.status(error.code).json({ message: error.message });
        return;
    }
    
    next();
}
