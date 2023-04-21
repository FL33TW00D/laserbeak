import * as Comlink from "comlink";
import { Remote, wrap } from "comlink";
import { AvailableModels } from "./modelManager";
import { Model } from "./models";
import { Session } from "./session";
import { SessionFactory } from "./sessionFactory";

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
    model: AvailableModels
): Promise<Session | Comlink.Remote<Session>> => {
    if (spawnWorker && typeof document !== "undefined") {
        const worker = new Worker(new URL("./sessionFactory.js", import.meta.url), {
            type: "module",
        });
        console.log("Created worker");
        const exposedFactory = wrap<typeof SessionFactory>(worker);
        const factory: Remote<SessionFactory> = await new exposedFactory();
        const session = await factory.createSession(model);
        console.log("Created session with worker");
        return session;
    } else {
        const factory = new SessionFactory();
        const session = await factory.createSession(model);
        return session;
    }
};
