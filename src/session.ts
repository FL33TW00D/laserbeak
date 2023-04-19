import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import { Model } from "./models";

export class Session {
    rumbleSession: rumble.Session | undefined;

    initEncoderDecoder = async (models: Model[]) => {
        await rumble.default();

        let session_builder = new rumble.SessionBuilder();
        let encoder = models[0].intoDefinition();
        let decoder = models[1].intoDefinition();
        let config = models[0].config;
        let tokenizer = models[0].tokenizer;

        this.rumbleSession = await session_builder
            .setEncoder(encoder)
            .setDecoder(decoder)
            .setConfig(config!)
            .setTokenizer(tokenizer!)
            .build();
    };

    initSession = async (models: Model[]) => {
        if (models.length !== 2) {
            throw Error("Only encoder-decoder models are supported");
        }
        await this.initEncoderDecoder(models);
    };

    run = async (
        input: string,
        callback: (decoded: string) => void
    ): Promise<void> => {
        if (!this.rumbleSession) {
            throw Error(
                "the session is not initialized. Call `init()` method first."
            );
        }

        return await this.rumbleSession.stream(input, callback);
    };
}

if (typeof self !== "undefined") {
    Comlink.expose(Session);
}
