import { InferenceSession } from "./inferenceSession";
import * as Comlink from "comlink";
import { Session } from "./session.worker";
import { AvailableModels } from "./models";

export class SessionManager {
    /**
     * Loads a model and returns a Session instance.
     * @param model - The model to load.
     * @param onLoaded - A callback that is called when the model is loaded.
     * @returns A Promise that resolves with a Session instance.
     *
     */
    public async loadModel(
        model: AvailableModels,
        onLoaded: () => void
    ): Promise<InferenceSession> {
        let session = await this.createSession(true, model);
        onLoaded();
        return session;
    }

    /**
     * Creates a new session with the specified models.
     *
     * @param spawnWorker - Determines whether a Web Worker should be used for the session.
     * @param model - The model to use for the session.
     * @returns A Promise that resolves with a Session instance, or a Remote<Session> instance if a Web Worker was used.
     *
     */
    private async createSession(
        spawnWorker: boolean,
        model: AvailableModels
    ): Promise<InferenceSession> {
        if (spawnWorker && typeof document !== "undefined") {
            const SessionWorker = Comlink.wrap<typeof Session>(
                new Worker(new URL("./session.worker.js", import.meta.url), {
                    type: "module",
                })
            );
            const session = await new SessionWorker();
            await session.initSession(model);
            return new InferenceSession(session);
        } else {
            const session = new Session();
            await session.initSession(model);
            return new InferenceSession(session);
        }
    }
}
