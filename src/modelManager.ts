import { createSession } from "./createSession";
import { SessionWrapper } from "./session-wrapper";

export enum AvailableModels {
    FLAN_T5_SMALL = "flan_t5_small",
    FLAN_T5_BASE = "flan_t5_base",
    FLAN_T5_LARGE = "flan_t5_large",
}

export class ModelManager {
    public async loadModel(model: AvailableModels, onLoaded: () => void): Promise<SessionWrapper> {
        let session = await createSession(true, model);
        onLoaded();
        return session;
    }
}
