import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import { AvailableModels, Model } from "./models";
import ModelDB from "./db/modelDB";
import { Result } from "true-myth";

export interface GenerationConfig {
    max_length: number;
    temperature: number;
    top_k: number;
    top_p: number;
    repetition_penalty: number;
}

export class Session {
    rumbleSession: rumble.Session | undefined;

    private async loadModel(
        model: AvailableModels
    ): Promise<Result<Model[], Error[]>> {
        let db = await ModelDB.create();
        const dbModelsResult = await db.getModels(model);
        if (dbModelsResult.isErr) {
            return Result.err([new Error("Model not found")]);
        }
        const dbModels = dbModelsResult.value;

        let failedModels: Error[] = [];
        const modelResults = await Promise.all(
            dbModels.map(async (m) => {
                const model = await Model.fromDBModel(m.model, db);
                if (model.isErr) {
                    failedModels.push(model.error);
                }
                return model;
            })
        );
        if (failedModels.length > 0) {
            return Result.err(failedModels);
        }
        const models = modelResults.map((r) => r.unwrapOr(undefined)!);

        return Result.ok(models);
    }

    private async initStandalone(model: Model): Promise<void> {
        await rumble.default();

        const session_builder = new rumble.SessionBuilder();
        const rumbleModel = model.intoDefinition();
        const config = model.config;
        const tokenizer = model.tokenizer;

        this.rumbleSession = await session_builder
            .addModel(rumbleModel)
            .setConfig(config!)
            .setTokenizer(tokenizer!)
            .build();
    }

    private async initEncoderDecoder(
        models: Model[]
    ): Promise<Result<void, Error>> {
        await rumble.default();

        if (models.length !== 2) {
            return Result.err(
                new Error(
                    "Failed to construct encoder-decoder session. Requires 2 models, got " +
                        models.length
                )
            );
        }

        const session_builder = new rumble.SessionBuilder();
        const encoder = models[0].intoDefinition();
        const decoder = models[1].intoDefinition();
        const config = models[0].config;
        const tokenizer = models[0].tokenizer;

        this.rumbleSession = await session_builder
            .addModel(encoder)
            .addModel(decoder)
            .setConfig(config!)
            .setTokenizer(tokenizer!)
            .build();

        return Result.ok(undefined);
    }

    public async initSession(
        model: AvailableModels
    ): Promise<Result<void, Error[]>> {
        if (this.rumbleSession) {
            return Result.err(
                [new Error(
                    "Session already initialized. Call `destroy()` first."
                )]
            );
        }
        let modelResult = await this.loadModel(model);
        if (modelResult.isErr) {
            return Result.err(modelResult.error);
        }
        let models = modelResult.value;

        switch (models.length) {
            case 1:
                await this.initStandalone(models[0]);
                break;
            case 2:
                await this.initEncoderDecoder(models);
                break;
            default:
                throw new Error("Invalid number of models");
        }
        return Result.ok(undefined);
    }

    public async run(
        input: string,
        callback: (result: string) => void,
        generation_config?: GenerationConfig
    ): Promise<Result<void, Error>> {
        if (!this.rumbleSession) {
            return Result.err(
                new Error(
                    "The session is not initialized. Call `initSession()` method first."
                )
            );
        }

        let sessionInput = new rumble.SessionInput(
            input,
            callback,
            generation_config
        );

        return Result.ok(await this.rumbleSession.run(sessionInput));
    }
}

if (typeof self !== "undefined") {
    Comlink.expose(Session);
}
