import { createSession } from "./createSession";
import * as Comlink from "comlink";

export enum AvailableModels {
    FLAN_T5_SMALL = "flan_t5_small",
    FLAN_T5_BASE = "flan_t5_base",
    FLAN_T5_LARGE = "flan_t5_large",
}

export class ModelManager {
    public async loadModel(model: AvailableModels, onLoaded: () => void) {
        console.log("Loading model: ", model);
        const callback = Comlink.proxy(onLoaded);
        let session = await createSession(true, model);
        callback();
        console.log("Model loaded: ", session);
        return session;
    }
}
