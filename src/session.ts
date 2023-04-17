import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import { EncoderDecoder } from "./modelDB";

export class Session {
    rumbleSession: rumble.Session | undefined;

    _initEncoderDecoder = async (model: EncoderDecoder) => {
        await rumble.default();
        this.rumbleSession = await rumble.Session.fromComponents(
            model.encoder,
            model.decoder,
            model.config,
            model.tokenizer,
            model.tensors
        );
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
