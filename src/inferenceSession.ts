import { GenerationConfig, Session } from "./session.worker";
import * as Comlink from "comlink";
import { AvailableModels } from "./models";
import { Result } from "true-myth";

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

    //bit of a hack for now, should be recursive
    private convertInputs(input: Map<string, any>): Result<Map<string, Uint8Array>, Error> {
        const converted = new Map<string, Uint8Array>();
        for (const [key, value] of input) {
            if (typeof value === "string") {
                const encoder = new TextEncoder();
                converted.set(key, encoder.encode(value));
            } else if (value instanceof Float32Array) {
                converted.set(key, new Uint8Array(value.buffer));
            } else if (value instanceof Array) {
                if (value[0] instanceof Float32Array) {
                    let flattened = value
                        .map((a) => [...a])
                        .flat() as unknown as Float32Array;
                    converted.set(key, new Uint8Array(flattened.buffer));
                }
            }else {
                return Result.err(new Error("Unsupported input type"));
            }
        }
        return Result.ok(converted);
    }

    public async run(
        input: Map<string, any>,
        callback: (decoded: any) => void,
        generation_config?: GenerationConfig
    ): Promise<Result<void, Error>> {
        let convertResult = this.convertInputs(input);
        if (convertResult.isErr) {
            return Result.err(convertResult.error);
        }
        let converted = convertResult.value;
        if (this.session instanceof Session) {
            return await this.session.run(
                converted,
                callback,
                generation_config
            );
        } else {
            return await this.session!.run(
                converted,
                Comlink.proxy(callback),
                generation_config
            );
        }
    }

    public destroy(): void {
        this.session = null;
    }
}
