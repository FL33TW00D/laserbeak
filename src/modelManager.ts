import ModelDB from "./db/modelDB";
import { createSession } from "./createSession";
import { Model } from "./models";

export enum AvailableModels {
    FLAN_T5_SMALL = "flan_t5_small",
    FLAN_T5_BASE = "flan_t5_base",
    FLAN_T5_LARGE = "flan_t5_large",
}

//ModelManager abstracts over the DB
export class ModelManager {
    modelDB: ModelDB;

    constructor() {
        let modeldb = new ModelDB();
        this.modelDB = modeldb;
    }

    init = async () => {
        await this.modelDB.init();
    };

    loadModel = async (model: AvailableModels, onLoaded: () => void) => {
        const dbModels = await this.modelDB.getModels(model);
        if (!dbModels) {
            console.log(dbModels);
            throw new Error("Model not found");
        }
        if (dbModels.length === 2) {
            const models = await Promise.all(
                dbModels.map(async (m) => {
                    const model = await Model.fromDBModel(
                        m.model,
                        this.modelDB
                    );
                    return model;
                })
            );

            let session = await createSession(true, models);
            onLoaded();
            return session;
        }
        console.log("Only encoder-decoder models are supported");
    };
}
