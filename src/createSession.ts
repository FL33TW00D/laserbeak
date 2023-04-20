import * as Comlink from "comlink";
import { Remote, wrap } from "comlink";
import { Model } from "./models";
import { Session } from "./session";

/**
 * Creates a new session with the specified models.
 *
 * @param spawnWorker - Determines whether a Web Worker should be used for the session.
 * @param models - An array of models to be used in the session.
 * @returns A Promise that resolves with a Session instance, or a Remote<Session> instance if a Web Worker was used.
 *
 */
export const createSession = async (
    spawnWorker: boolean,
    models: Model[]
): Promise<Session | Comlink.Remote<Session>> => {
    // Workers don't work right now
    if (false && spawnWorker && typeof document !== "undefined") {
        const worker = new Worker(new URL("./session.js", import.meta.url), {
            type: "module",
        });
        const exposedSession = wrap<typeof Session>(worker);
        const session: Remote<Session> = await new exposedSession();
        await session.initSession(models);
        return session;
    } else {
        const session = new Session();
        await session.initSession(models);
        return session;
    }
};
