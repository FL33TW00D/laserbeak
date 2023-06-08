import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import { AvailableModels, Model } from "./models";
import ModelDB from "./db/modelDB";

export interface GenerationConfig {
    max_length: number;
    temperature: number;
    top_k: number;
    top_p: number;
    repetition_penalty: number;
}

export class Session {
    rumbleSession: rumble.Session | undefined;

    private async loadModel(model: AvailableModels): Promise<Model[]> {
        let db = await ModelDB.create();
        const dbModels = await db.getModels(model);
        if (!dbModels) {
            throw new Error("Model not found");
        }
        const models = await Promise.all(
            dbModels.map(async (m) => {
                const model = await Model.fromDBModel(m.model, db);
                return model;
            })
        );

        return models;
    }

    private async initStandalone(model: Model): Promise<void> {}

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
            .addModel(encoder)
            .addModel(decoder)
            .setConfig(config!)
            .setTokenizer(tokenizer!)
            .build();
    }

    public async initSession(model: AvailableModels): Promise<void> {
        if (this.rumbleSession) {
            throw new Error("This session is already initialized");
        }
        let models = await this.loadModel(model);
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
    }

    public async run(
        input: string,
        callback: (result: string) => void,
        generation_config?: GenerationConfig
    ): Promise<void> {
        if (!this.rumbleSession) {
            throw new Error(
                "The session is not initialized. Call `initSession()` method first."
            );
        }

        let sessionInput = new rumble.SessionInput(
            input,
            callback,
            generation_config
        );

        return await this.rumbleSession.run(sessionInput);
    }
}

if (typeof self !== "undefined") {
    Comlink.expose(Session);
}
