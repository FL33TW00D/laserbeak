import * as Comlink from "comlink";
import { Remote, wrap } from "comlink";
import { Model } from "./models";
import { Session } from "./session";

export const createSession = async (
    spawnWorker: boolean,
    models: Model[],
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
