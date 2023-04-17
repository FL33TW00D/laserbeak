import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import { EncoderDecoder } from "./modelDB";

export class Session {
    rumbleSession: rumble.Session | undefined;

    _initEncoderDecoder = async (model: EncoderDecoder) => {
        await rumble.default();

        let session_builder = new rumble.SessionBuilder();

        let encoderModel = new rumble.ModelDefinition(
            model.encoder.definition,
            model.encoder.tensors
        );
        let decoderModel = new rumble.ModelDefinition(
            model.decoder.definition,
            model.decoder.tensors
        );

        session_builder = await session_builder.setEncoder(encoderModel);
        session_builder = await session_builder.setDecoder(decoderModel);
        session_builder = await session_builder.setConfig(model.config);
        session_builder = session_builder.setTokenizer(model.tokenizer);
        let session = await session_builder.build();

        this.rumbleSession = session;
    };

    //TODO: generalize this
    init = async (model: EncoderDecoder) => {
        await this._initEncoderDecoder(model);
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
