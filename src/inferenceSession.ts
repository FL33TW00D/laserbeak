import { GenerationConfig, Session } from "./session.worker";
import * as Comlink from "comlink";
import { AvailableModels } from "./models";

/// Abstracts over a session running in a web worker
/// or in the main thread.
export class InferenceSession {
    private session: Comlink.Remote<Session> | Session | null;

    constructor(session: Comlink.Remote<Session> | Session) {
        this.session = session;
    }

    async initSession(model: AvailableModels): Promise<void> {
        await this.session!.initSession(model);
    }

    public async run(
        input: string,
        callback: (decoded: string) => void,
        generation_config?: GenerationConfig
    ): Promise<void> {
        if (this.session instanceof Session) {
            return await this.session.run(input, callback, generation_config);
        } else {
            return await this.session!.run(
                input,
                Comlink.proxy(callback),
                generation_config
            );
        }
    }

    public destroy(): void {
        this.session = null;
    }
}
