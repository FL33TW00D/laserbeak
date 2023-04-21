import * as Comlink from "comlink";
import { Remote, wrap } from "comlink";
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
        const worker = new Worker(new URL("./session.worker.js", import.meta.url), {
            type: "module",
        });
        console.log("Worker created");
        const session = wrap<Session>(worker);
        console.log("Session created");
        await session.initSession(model);
        console.log("Session initialized");
        return session;
    } else {
        throw new Error("Not implemented");
    }
};
