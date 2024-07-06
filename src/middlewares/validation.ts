import { ErrorFactory, ErrorType } from "../factory/errFactory";

const errFactory = new ErrorFactory();

function validateKeys(dataset: any, requiredKeys: string[], res: any): boolean {
    const datasetKeys = Object.keys(dataset);
    const hasAllRequiredKeys = requiredKeys.every(key => datasetKeys.includes(key));
    const areValuesValid = requiredKeys.every(key => typeof dataset[key] === 'string' && dataset[key].trim() !== '');

    if (!hasAllRequiredKeys || !areValuesValid) {
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
