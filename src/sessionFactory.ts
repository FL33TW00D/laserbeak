import ModelDB from "./db/modelDB";
import { AvailableModels } from "./modelManager";
import { Model } from "./models";
import { Session } from "./session";
import * as Comlink from "comlink";

export class SessionFactory {
    private async loadModel(model: AvailableModels): Promise<Model[]> {
        const db = await ModelDB.create();
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
                        db
                    );
                    return model;
                })
            );
            return models;
        }
        console.log("Only encoder-decoder models are supported currently.");
        return [];
    }

    public async createSession(model: AvailableModels): Promise<Session> {
        let models = await this.loadModel(model);
        let session = new Session();
        await session.initSession(models);
        console.log("Worker session created: ", session);
        return session;
    }

}

if (typeof self !== "undefined") {
    Comlink.expose(SessionFactory);
}
