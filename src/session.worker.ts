import * as Comlink from "comlink";
import * as rumble from "@rumbl/rumble-wasm";
import { AvailableModels, Model } from "./models";
import ModelDB from "./db/modelDB";

export class Session {
    rumbleSession: rumble.Session | undefined;

    private async loadModel(model: AvailableModels): Promise<Model[]> {
        let db = await ModelDB.create();
        const dbModels = await db.getModels(model);
        if (!dbModels) {
            console.log(dbModels);
            throw new Error("Model not found");
        }
        if (dbModels.length === 2) {
            const models = await Promise.all(
                dbModels.map(async (m) => {
                    const model = await Model.fromDBModel(
                        m.model,
                        db,
                    );
                    return model;
                })
            );

            return models;
        }
        throw new Error("Only encoder-decoder models are supported currently.");
    }

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

    public async initSession(model: AvailableModels): Promise<void> {
        if (this.rumbleSession) {
            throw new Error("This session is already initialized");
        }
        let models = await this.loadModel(model);
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

if(typeof self !== 'undefined') {
    Comlink.expose(Session);
}
