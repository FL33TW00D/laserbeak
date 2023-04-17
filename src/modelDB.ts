import { DBSchema, IDBPDatabase, openDB } from "idb/with-async-ittr";
import { v4 as uuidv4 } from "uuid";
import { AvailableModels } from "./modelManager";

export interface EncoderDecoder {
    name: string;
    encoder: Uint8Array;
    decoder: Uint8Array;
    tensors: Map<string, Uint8Array>;
    config: Uint8Array;
    tokenizer: Uint8Array;
}

interface StoredModel {
    name: string;
    modelID: string; //Non unique, same for encoder and decoder
    bytes: Blob;
    index: number; //Encoder 0, Decoder 1, etc
}

interface StoredTensor {
    name: string;
    bytes: Uint8Array;
    modelID: string;
}

interface StoredConfig {
    bytes: Uint8Array;
    modelID: string;
}

interface StoredTokenizer {
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
        value: string; //modelID
        key: AvailableModels;
    };
    config: {
        value: StoredConfig;
        key: string;
        indexes: { modelID: string };
    };
    tokenizer: {
        value: StoredTokenizer;
        key: string;
        indexes: { modelID: string };
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
                let config_store = db.createObjectStore("config");
                config_store.createIndex("modelID", "modelID");
                let tokenizer_store = db.createObjectStore("tokenizer");
                tokenizer_store.createIndex("modelID", "modelID");
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

        models.sort((a, b) => a.index - b.index);
        return models;
    }

    async _getConfig(modelID: string): Promise<StoredConfig> {
        console.log("Attempting to get config");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        let config = await this.db.getAllFromIndex(
            "config",
            "modelID",
            modelID.toString()
        );
        if (config.length !== 1) {
            throw new Error("Expected 1 config, got " + config.length);
        }

        return config[0];
    }

    async _getTokenizer(modelID: string): Promise<StoredTokenizer> {
        console.log("Attempting to get tokenizer");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        let tokenizer = await this.db.getAllFromIndex(
            "tokenizer",
            "modelID",
            modelID.toString()
        );
        if (tokenizer.length !== 1) {
            throw new Error("Expected 1 tokenizer, got " + tokenizer.length);
        }

        return tokenizer[0];
    }

    //TODO: generalize
    async getModel(
        model: AvailableModels
    ): Promise<EncoderDecoder | undefined> {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }
        let modelID = await this.db.get("availableModels", model);
        console.log("Found existing model ID: ", modelID);
        if (!modelID) {
            await this._fetchBundle(model);
            modelID = await this.db.get("availableModels", model);
        }

        let models = await this._getModels(modelID!);
        if (models.length !== 2) {
            throw new Error("Expected 2 models, got " + models.length);
        }

        let encoder = await models[0].bytes.arrayBuffer().then((buffer) => {
            return new Uint8Array(buffer);
        });
        let decoder = await models[1].bytes.arrayBuffer().then((buffer) => {
            return new Uint8Array(buffer);
        });
        let tensors = await this._getTensors(modelID!);
        let config = await this._getConfig(modelID!);
        let tokenizer = await this._getTokenizer(modelID!);

        return {
            name: model,
            encoder: encoder,
            decoder: decoder,
            tensors: tensors,
            config: config.bytes,
            tokenizer: tokenizer.bytes,
        };
    }

    async insertModel(
        name: string,
        index: number,
        modelID: string,
        bytes: Uint8Array
    ) {
        let storedModel = {
            name: name,
            modelID: modelID,
            bytes: new Blob([bytes]),
            index: index,
        };

        this.db!.put("models", storedModel, uuidv4());
    }

    async insertTensor(key: string, modelID: string, bytes: Uint8Array) {
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

    //Fetches a resource from the remote server
    //and stores it in the database
    _fetchBundle = async (modelName: AvailableModels) => {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }
        try {
            let modelID = uuidv4(); //Encoder and Decoder have same ID
            this.db!.put("availableModels", modelID, modelName);

            let model_definition = await fetch(
                `${this.remoteUrl}/${modelName}/model_definition.json`
            ).then((resp) => resp.json());

            for (let [index, model] of model_definition.models.entries()) {
                let bytes = await fetch(
                    `${this.remoteUrl}/${modelName}/${model}`
                )
                    .then((resp) => resp.arrayBuffer())
                    .then((buffer) => new Uint8Array(buffer));
                console.log("Storing model: ", model);
                this.insertModel(model, index, modelID, bytes);
            }

            for (let tensor of model_definition.tensors) {
                let bytes = await fetch(
                    `${this.remoteUrl}/${modelName}/${tensor}`
                )
                    .then((resp) => resp.arrayBuffer())
                    .then((buffer) => new Uint8Array(buffer));
                console.log("Storing tensor: ", tensor);
                this.insertTensor(tensor, modelID, bytes);
            }

            let config = await fetch(
                `${this.remoteUrl}/${modelName}/config.json`
            )
                .then((resp) => resp.arrayBuffer())
                .then((buffer) => new Uint8Array(buffer));

            this.db!.put(
                "config",
                {
                    bytes: config,
                    modelID: modelID,
                },
                modelID
            );

            let tokenizer = await fetch(
                `${this.remoteUrl}/${modelName}/tokenizer.json`
            )
                .then((resp) => resp.arrayBuffer())
                .then((buffer) => new Uint8Array(buffer));
            this.db!.put(
                "tokenizer",
                {
                    bytes: tokenizer,
                    modelID: modelID,
                },
                modelID
            );
        } catch (e) {
            console.log(e);
        }
    };
}
