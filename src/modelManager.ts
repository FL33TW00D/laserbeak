import ModelDB from "./db/modelDB";
import { createSession } from "./createSession";
import { Model } from "./models";

export enum AvailableModels {
    FLAN_T5_SMALL = "flan_t5_small",
    FLAN_T5_BASE = "flan_t5_base",
    FLAN_T5_LARGE = "flan_t5_large",
}

/**
 * A class that manages loading and running models.
 *
 * @remarks
 * The `ModelManager` class provides a high-level API for loading and running models. It uses a `ModelDB` instance to store and retrieve model data.
 *
 * To use the `ModelManager` class, first create an instance by calling the constructor. Then call the `init` method to initialize the underlying `ModelDB` instance. Once the `ModelDB` is initialized, you can call the `loadModel` method to load a model and start a new session.
 *
 * Example usage:
 *
 * ```typescript
 * const modelManager = new ModelManager();
 * await modelManager.init();
 * await modelManager.loadModel(AvailableModels.FLAN_T5_BASE, () => console.log("Model loaded"));
 * ```
 */
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
        console.log("Only encoder-decoder models are supported currently.");
    };
}
