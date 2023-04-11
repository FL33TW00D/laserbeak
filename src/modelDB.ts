import { DBSchema, IDBPDatabase, openDB } from "idb/with-async-ittr";
import { v4 as uuidv4 } from "uuid";
import { AvailableModels } from "./modelManager";
import { Unzipped, unzipSync } from "fflate";

export interface EncoderDecoder {
    name: string;
    models: StoredModel[];
    tensors: Map<string, Uint8Array>;
    config: Uint8Array;
    tokenizer: Uint8Array;
}

export interface StoredModel {
    name: string;
    modelID: string; //Non unique, same for encoder and decoder
    bytes: Blob;
    encoder: boolean;
}

interface StoredTensor {
    name: string;
    bytes: Uint8Array;
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
        key: AvailableModels;
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
                let model_store = db.createObjectStore("models");
                model_store.createIndex("modelID", "modelID");
                let tensor_store = db.createObjectStore("tensors");
                tensor_store.createIndex("modelID", "modelID");
                db.createObjectStore("availableModels");
            },
        });
    }

    async _getTensors(modelID: string): Promise<Map<string, Uint8Array>> {
        console.log("Attempting to get tensors");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        const tx = this.db.transaction("tensors", "readonly");
        const index = tx.store.index("modelID");

        let tensorMap = new Map<string, Uint8Array>();
        console.log("Searching for tensors for Model ID: ", modelID);
        let totalBytes = 0;
        for await (const cursor of index.iterate(modelID.toString())) {
            let bytes = cursor.value.bytes;
            tensorMap.set(cursor.value.name, bytes);
            totalBytes += bytes.length;
        }
        console.log("Found tensors: ", tensorMap);
        console.log("Total tensor bytes: ", totalBytes);

        await tx.done;

        return tensorMap;
    }

    async _getModels(modelID: string): Promise<StoredModel[]> {
        console.log("Attempting to get models");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        const tx = this.db.transaction("models", "readonly");
        const index = tx.store.index("modelID");

        const models: StoredModel[] = [];
        for await (const cursor of index.iterate(modelID.toString())) {
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
        let modelID = await this.db.get("availableModels", model);
        console.log("Found existing model ID: ", modelID);
        if (!modelID) {
            await this._fetch(model);
            modelID = await this.db.get("availableModels", model);
        }

        let models = await this._getModels(modelID!);
        let tensors = await this._getTensors(modelID!);

        //TODO: fix
        let hf_key = model.replaceAll("_", "-");
        let config = await fetch(
            `https://huggingface.co/google/${hf_key}/raw/main/config.json`
        )
            .then((resp) => resp.arrayBuffer())
            .then((buffer) => new Uint8Array(buffer));
        let tokenizer = await fetch(
            `https://huggingface.co/google/${hf_key}/raw/main/tokenizer.json`
        )
            .then((resp) => resp.arrayBuffer())
            .then((buffer) => new Uint8Array(buffer));
        return {
            name: model,
            models: models,
            tensors: tensors,
            config: config,
            tokenizer: tokenizer,
        };
    }

    async insertEncoderDecoder(modelName: AvailableModels, bundle: Unzipped) {
        let modelID = uuidv4(); //Encoder and Decoder have same ID
        this.db!.put("availableModels", modelID, modelName);
        for (let [key, bytes] of Object.entries(bundle)) {
            let extension = key.split(".").pop();
            if (extension === "onnx") {
                let storedModel = {
                    name: key,
                    modelID: modelID,
                    bytes: new Blob([bytes]),
                    encoder: key.includes("encoder"),
                };

                this.db!.put("models", storedModel, uuidv4());
            } else {
                console.log("Stored tensor key: ", key);
                let tensor_name = key.split("/").pop();
                if (!tensor_name) {
                    throw new Error("Could not parse tensor name");
                }
                let storedTensor = {
                    name: tensor_name,
                    bytes: bytes,
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
            let zip_bytes = await fetch(`${this.remoteUrl}/${modelName}.zip`)
                .then((resp) => resp.arrayBuffer())
                .then((buffer) => new Uint8Array(buffer));
            //TODO: work out why unzip async doesn't work
            let bytes = unzipSync(zip_bytes, {
                filter(file) {
                    //Filter directory
                    return file.size > 0;
                },
            });
            this.insertEncoderDecoder(modelName, bytes);
        } catch (e) {
            console.log(e);
        }
    };
}
