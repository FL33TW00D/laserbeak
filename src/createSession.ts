import * as Comlink from "comlink";
import { AvailableModels } from "./modelManager";
import { Session } from "./session.worker";

/**
 * Creates a new session with the specified models.
 *
 * @param spawnWorker - Determines whether a Web Worker should be used for the session.
 * @param model - The model to use for the session.
 * @returns A Promise that resolves with a Session instance, or a Remote<Session> instance if a Web Worker was used.
 *
 */
export const createSession = async (
    spawnWorker: boolean,
    model: AvailableModels
): Promise<Session | Comlink.Remote<Session>> => {
    if (spawnWorker && typeof document !== "undefined") {
        const MyWorker  = Comlink.wrap<typeof Session>(new Worker(new URL("./session.worker.js", import.meta.url), {
            type: "module",
        }));
        const session = await new MyWorker();
        await session.initSession(model);
        return session;
    } else {
        throw new Error("Not implemented");
    }
};
