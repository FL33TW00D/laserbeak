import * as pako from "pako";
import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";

export class Session {
    rumbleSession: rumble.Session | undefined;

    constructor() {}

    _fetchBytes = async (url: string): Uint8Array => {
        const extension = url.split(".").pop();
        let bytes = await fetch(url).then((resp) => resp.arrayBuffer());
        if (extension === "gz") {
            bytes = pako.inflate(bytes);
        }
        const data = new Uint8Array(bytes);
        return data;
    };

    init = async (modelPath: string) => {
        const [encoderBytes, decoderBytes, tokenizerBytes] = await Promise.all([
            fetchBytes(
                "https://rmbl.us/modified_flan-t5-small_encoder_decoder_init_fp32_sim.onnx.gz"
            ),
            fetchBytes(
                "https://rmbl.us/modified_flan-t5-small_decoder_fp32_sim.onnx.gz"
            ),
            fetchBytes("resources/flan-t5/small/config.json"),
            fetchBytes("resources/flan-t5/small/tokenizer.json"),
        ]);
        console.log("Initialized", {
            encoderBytes,
            decoderBytes,
            configBytes,
            tokenizerBytes,
        });
        await rumble.default();
        this.rumbleSession = await rumble.Session.fromComponents(
            encoderBytes,
            decoderBytes,
            configBytes,
            tokenizerBytes
        );
    };

    fetchData = async (modelPath: string): Promise<ArrayBuffer> => {
        const extension = modelPath.split(".").pop();
        let modelData = await fetch(modelPath).then((resp) =>
            resp.arrayBuffer()
        );
        if (extension === "gz") {
            modelData = pako.inflate(modelData);
        }
        localforage.setItem(modelPath, modelData);
        return modelData;
    };

    run = async (
        input: any 
    ): Promise<any> => {
        if (!this.rumbleSession) {
            throw Error(
                "the session is not initialized. Call `init()` method first."
            );
        }
        return await this.ortSession.run(input);
    };
}

if (typeof self !== "undefined") {
    Comlink.expose(Session);
}

