import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import ModelDB, { EncoderDecoder, Model, ModelWithKey } from "./modelDB";

export class Session {
    rumbleSession: rumble.Session | undefined;

    initEncoderDecoder = async (models: ModelWithKey[], modelDB: ModelDB) => {
        await rumble.default();

        let session_builder = new rumble.SessionBuilder();

        let encoder = models[0];
        let encoderTensors = await modelDB._getTensors(encoder.model.tensorIDs);
        let encoderDefinition = encoder.model.bytes;

        let encoderModel = new rumble.ModelDefinition(
            encoderDefinition,
            encoderTensors
        );
        session_builder = await session_builder.setEncoder(encoderModel);

        let decoder = models[1];
        let decoderTensors = await modelDB._getTensors(decoder.model.tensorIDs);
        let decoderDefinition = decoder.model.bytes;

        let decoderModel = new rumble.ModelDefinition(
            decoderDefinition,
            decoderTensors
        );

        session_builder = await session_builder.setDecoder(decoderModel);
        let config = await modelDB._getConfig(encoder.model.parentID);
        let tokenizer = await modelDB._getTokenizer(encoder.model.parentID);
        session_builder = await session_builder.setConfig(config.bytes);
        session_builder = session_builder.setTokenizer(tokenizer.bytes);

        let session = await session_builder.build();

        this.rumbleSession = session;
    };

    initModel = async (model: ModelWithKey[]) => {
        //todo
        model;
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
