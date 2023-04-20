import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import { Model } from "./models";

export class Session {
    rumbleSession: rumble.Session | undefined;

    private async initEncoderDecoder(models: Model[]): Promise<void> {
        await rumble.default();

        if (models.length !== 2) {
            throw Error(
                "Only encoder-decoder models with 2 models are supported"
            );
        }

        const session_builder = new rumble.SessionBuilder();
        const encoder = models[0].intoDefinition();
        const decoder = models[1].intoDefinition();
        const config = models[0].config;
        const tokenizer = models[0].tokenizer;

        this.rumbleSession = await session_builder
            .setEncoder(encoder)
            .setDecoder(decoder)
            .setConfig(config!)
            .setTokenizer(tokenizer!)
            .build();
    }

    public async initSession(models: Model[]): Promise<void> {
        if (this.rumbleSession) {
            throw new Error("This session is already initialized");
        }
        await this.initEncoderDecoder(models);
    }

    public async run(
        input: string,
        callback: (decoded: string) => void
    ): Promise<void> {
        if (!this.rumbleSession) {
            throw new Error(
                "The session is not initialized. Call `initSession()` method first."
            );
        }

        return await this.rumbleSession.stream(input, callback);
    }
}

if (typeof self !== "undefined") {
    Comlink.expose(Session);
}
