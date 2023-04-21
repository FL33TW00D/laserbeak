import ModelDB from "./db/modelDB";
import { createSession } from "./createSession";
import { Model } from "./models";

export enum AvailableModels {
    FLAN_T5_SMALL = "flan_t5_small",
    FLAN_T5_BASE = "flan_t5_base",
    FLAN_T5_LARGE = "flan_t5_large",
}

export class ModelManager {
    modelDB: ModelDB;

    private constructor(modeldb: ModelDB) {
        this.modelDB = modeldb;
    }

    static async create() {
        const db = await ModelDB.create();
        return new ModelManager(db);
    }

    // Use proper method declaration
    async loadModel(model: AvailableModels, onLoaded: () => void) {
        console.log("Loading model: ", model);
        let session = await createSession(true, model);
        onLoaded();
        return session;
    }
}
