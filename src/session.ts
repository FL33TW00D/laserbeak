import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import { EncoderDecoder } from "./modelDB";

export class Session {
    rumbleSession: rumble.Session | undefined;

    _initEncoderDecoder = async (model: EncoderDecoder) => {
        if (model.models.length !== 2) {
            throw Error(
                "The model should have 2 components: encoder and decoder"
            );
        }

        let encoder = await model.models[0].bytes
            .arrayBuffer()
            .then((buffer) => new Uint8Array(buffer));
        let decoder = await model.models[1].bytes
            .arrayBuffer()
            .then((buffer) => new Uint8Array(buffer));

        await rumble.default();
        this.rumbleSession = await rumble.Session.fromComponents(
            encoder,
            decoder,
            model.config,
            model.tensors
        );
    };

    //TODO: generalize this
    init = async (model: EncoderDecoder) => {
        await this._initEncoderDecoder(model);
    };

    run = async (
        input: Uint32Array,
        callback: (token: number) => void
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
