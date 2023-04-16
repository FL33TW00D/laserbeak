import ModelDB from "./modelDB";
import { createSession } from "./createSession";

export enum AvailableModels {
    FLAN_T5_SMALL = "flan_t5_small",
    FLAN_T5_BASE = "flan_t5_base",
    FLAN_T5_LARGE = "flan_t5_large",
}

export class ModelManager {
    modelDB: ModelDB;

    constructor() {
        let modeldb = new ModelDB();
        this.modelDB = modeldb;
    }

    init = async () => {
        await this.modelDB.init();
    }

    loadModel = async (model: AvailableModels, onLoaded: () => void) => {
        const model_data = await this.modelDB.getModel(model);
        if (!model_data) {
            console.log(model_data);
            throw new Error("Model not found");
        }
        let session = await createSession(false, model_data);
        onLoaded();
        return session;
    }
}
