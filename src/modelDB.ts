import { DBSchema, IDBPDatabase, openDB } from "idb";
import { v4 as uuidv4 } from "uuid";
import { FlateError, unzip, Unzipped } from "fflate";
import { AvailableModels } from "./modelManager";

export interface EncoderDecoder {
    name: string;
    models: StoredModel[];
    tensors: any; //todo type
    config: Uint8Array;
}

export interface StoredModel {
    name: string;
    modelID: string; //Non unique, same for encoder and decoder
    bytes: Blob;
}

interface StoredTensor {
    bytes: Blob;
    modelID: string;
}

interface ModelDBSchema extends DBSchema {
    models: {
        value: StoredModel;
        key: string;
        indexes: { modelID: string };
    };
    tensors: {
        value: StoredTensor;
        key: string;
        indexes: { modelID: string };
    };
    availableModels: {
        value: string;
        key: string; //AvailableModels
    };
}

/// This class provides an abstraction over IndexedDB to store models and their
/// associated metadata.
export default class ModelDB {
    private readonly remoteUrl = "https://rmbl.us";
    private db: IDBPDatabase<ModelDBSchema> | null;

    constructor() {
        this.db = null;
    }

    async init() {
        this.db = await openDB<ModelDBSchema>("models", 1, {
            upgrade(db) {
                db.createObjectStore("models");
                db.createObjectStore("tensors");
                db.createObjectStore("availableModels");
            },
        });
    }

    async _getTensors(modelID: string): Promise<StoredTensor[]> {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        const model = await this.db.get("models", modelID.toString());
        if (!model) {
            return [];
        }

        const tx = this.db.transaction("tensors", "readonly");
        const store = tx.objectStore("tensors");
        const index = store.index("modelID");

        const tensors: StoredTensor[] = [];
        for await (const cursor of index.iterate(model.modelID.toString())) {
            tensors.push(cursor.value);
        }

        await tx.done;

        return tensors;
    }

    async _getModels(modelID: string): Promise<StoredModel[]> {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        const tx = this.db.transaction("models", "readonly");
        const store = tx.objectStore("models");

        const models: StoredModel[] = [];
        for await (const cursor of store.iterate(modelID.toString())) {
            models.push(cursor.value);
        }

        await tx.done;

        return models;
    }

    //Takes in a modelName, e.g "flan_t5_small"
    async getModel(
        model: AvailableModels
    ): Promise<EncoderDecoder | undefined> {
        console.log("Get Model");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }
        const modelID = await this.db.get("availableModels", model);
        let models = null;
        if (!modelID) {
            console.log("Not in DB");
            await this._fetch(model);
            console.log(models);
            return;
        }

        if (!models) {
            console.log("Fetched but don't have");
            return;
        }

        const tensors = await this._getTensors(modelID);

        return {
            name: model,
            models: models,
            tensors: tensors,
            config: new Uint8Array(),
        };
    }

    async insertEncoderDecoder(err: FlateError | null, bundle: Unzipped) {
        if (err) {
            console.log(err);
            return;
        }
        let modelID = uuidv4(); //Encoder and Decoder have same ID
        console.log("inserting encoder decoder");
        console.log(bundle);
        for (let [key, entry] of bundle as any) {
            let extension = key.split(".").pop();
            if (extension === "onnx") {
                let storedModel = {
                    name: key,
                    modelID: modelID,
                    bytes: new Blob([entry.data]),
                };

                this.db!.put("models", storedModel, uuidv4());
            } else {
                let storedTensor = {
                    bytes: new Blob([entry.data]),
                    modelID: modelID,
                };

                this.db!.put("tensors", storedTensor, uuidv4());
            }
        }
    }

    //Fetches a resource from the remote server
    //and stores it in the database
    _fetch = async (modelName: AvailableModels) => {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }
        console.log("About to fetch");
        try {
            let bytes = await fetch(`${this.remoteUrl}/${modelName}.zip`)
                .then((resp) => resp.arrayBuffer())
                .then((buffer) => new Uint8Array(buffer));
            unzip(bytes, this.insertEncoderDecoder);
        } catch (e) {
            console.log(e);
        }
    };
}
