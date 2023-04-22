import { Session } from "./session.worker";
import * as Comlink from "comlink";
import { AvailableModels } from "./modelManager";

export class SessionWrapper {
    private session: Comlink.Remote<Session> | Session;

    constructor(session: Comlink.Remote<Session> | Session) {
        this.session = session;
    }

    async initSession(model: AvailableModels): Promise<void> {
        await this.session.initSession(model);
    }

    public async run(
        input: string,
        callback: (decoded: string) => void
    ): Promise<void> {
        if (this.session instanceof Session) {
            return await this.session.run(input, callback);
        }else {
            return await this.session.run(input, Comlink.proxy(callback));
        }
    }
}
