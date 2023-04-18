import { DBSchema, IDBPDatabase, openDB } from "idb/with-async-ittr";
import { v4 as uuidv4 } from "uuid";
import { AvailableModels } from "./modelManager";

export interface Model {
    name: string;
    definition: Uint8Array;
    tensors: Map<string, Uint8Array>;
    config?: Uint8Array;
    tokenizer?: Uint8Array;
}

export interface EncoderDecoder {
    name: string;
    encoder: Model;
    decoder: Model;
    config: Uint8Array;
    tokenizer: Uint8Array;
}

///A model represents a single ONNX model
///It may be a sub-component of a larger model
interface StoredModel {
    name: string;
    parentID: string; //Non unique, same for encoder and decoder
    bytes: Uint8Array;
    index: number; //Encoder 0, Decoder 1, etc
    tensorIDs: string[]; //IDs of the tensors associated with this model
}

export interface ModelWithKey {
    id: string; //id of the model sub-component
    model: StoredModel;
}

interface StoredTensor {
    name: string;
    bytes: Uint8Array;
}

interface StoredConfig {
    bytes: Uint8Array;
    parentID: string;
}

interface StoredTokenizer {
    bytes: Uint8Array;
    parentID: string;
}

interface ModelDBSchema extends DBSchema {
    models: {
        value: StoredModel;
        key: string;
        indexes: { parentID: string; tensorsIDs: string[] };
    };
    tensors: {
        value: StoredTensor;
        key: string;
    };
    availableModels: {
        value: string; //parentID
        key: AvailableModels;
    };
    config: {
        value: StoredConfig;
        key: string;
        indexes: { parentID: string };
    };
    tokenizer: {
        value: StoredTokenizer;
        key: string;
        indexes: { parentID: string };
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
                db.createObjectStore("tensors");
                db.createObjectStore("availableModels");

                let model_store = db.createObjectStore("models");
                model_store.createIndex("parentID", "parentID");
                let config_store = db.createObjectStore("config");
                config_store.createIndex("parentID", "parentID");
                let tokenizer_store = db.createObjectStore("tokenizer");
                tokenizer_store.createIndex("parentID", "parentID");
            },
        });
    }

    async _getTensors(tensorIDs: string[]): Promise<Map<string, Uint8Array>> {
        console.log("Attempting to get tensors");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        const tx = this.db.transaction("tensors", "readonly");
        let tensorMap = new Map<string, Uint8Array>();
        let totalBytes = 0;
        for (let id of tensorIDs) {
            let tensor = await tx.store.get(id);
            if (!tensor) {
                throw new Error("Could not find tensor with ID: " + id);
            }
            tensorMap.set(tensor.name, tensor.bytes);
            totalBytes += tensor.bytes.length;
        }

        console.log("Found tensors: ", tensorMap);
        console.log("Total tensor bytes: ", totalBytes);

        await tx.done;

        return tensorMap;
    }

    async _getModels(parentID: string): Promise<ModelWithKey[]> {
        console.log("Attempting to get models");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        const tx = this.db.transaction("models", "readonly");
        const index = tx.store.index("parentID");

        let models: ModelWithKey[] = [];
        for await (const cursor of index.iterate(parentID.toString())) {
            models.push({ id: cursor.key, model: cursor.value });
        }

        await tx.done;

        models.sort((a, b) => a.model.index - b.model.index);
        return models;
    }

    async _getConfig(parentID: string): Promise<StoredConfig> {
        console.log("Attempting to get config");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        let config = await this.db.getAllFromIndex(
            "config",
            "parentID",
            parentID.toString()
        );
        if (config.length !== 1) {
            throw new Error("Expected 1 config, got " + config.length);
        }

        return config[0];
    }

    async _getTokenizer(parentID: string): Promise<StoredTokenizer> {
        console.log("Attempting to get tokenizer");
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        let tokenizer = await this.db.getAllFromIndex(
            "tokenizer",
            "parentID",
            parentID.toString()
        );
        if (tokenizer.length !== 1) {
            throw new Error("Expected 1 tokenizer, got " + tokenizer.length);
        }

        return tokenizer[0];
    }

    /*
    async getModels(
        model: AvailableModels
    ): Promise<Model[] | undefined> {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }
        let parentID = await this.db.get("availableModels", model);
        console.log("Found existing model ID: ", parentID);
        if (!parentID) {
            await this._fetchBundle(model);
            parentID = await this.db.get("availableModels", model);
        }

        let storedModels = await this._getModels(parentID!);
        if (storedModels.length !== 2) {
            throw new Error("Expected 2 models, got " + storedModels.length);
        }

        let models: Model[] = [];
        for (let stored of storedModels) {
            let tensors = await this._getTensors(stored.model.tensorIDs);
            let modelDef = await stored.model.bytes
                .arrayBuffer()
                .then((buffer) => new Uint8Array(buffer));
            let config = await this._getConfig(parentID!);
            let tokenizer = await this._getTokenizer(parentID!);
            models.push({
                name: stored.model.name,
                definition: modelDef,
                tensors: tensors,
                config: config.bytes,
                tokenizer: tokenizer.bytes,
            });
        }

        return models;
    }
    */

    async getModels(
        model: AvailableModels
    ): Promise<ModelWithKey[] | undefined> {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }
        let parentID = await this.db.get("availableModels", model);
        console.log("Found existing model ID: ", parentID);
        if (!parentID) {
            await this._fetchBundle(model);
            parentID = await this.db.get("availableModels", model);
        }

        let storedModels = await this._getModels(parentID!);
        if (storedModels.length !== 2) {
            throw new Error("Expected 2 models, got " + storedModels.length);
        }

        return storedModels;
    }

    async insertModel(
        definition: string,
        tensorIDs: string[],
        index: number,
        parentID: string,
        bytes: Uint8Array
    ): Promise<string> {
        let storedModel = {
            name: definition,
            tensorIDs: tensorIDs,
            parentID: parentID,
            bytes: bytes,
            index: index,
        };

        let componentID = uuidv4();
        this.db!.put("models", storedModel, componentID);
        return componentID;
    }

    async insertTensor(key: string, bytes: Uint8Array): Promise<string> {
        let tensor_name = key.split("/").pop();
        if (!tensor_name) {
            throw new Error("Could not parse tensor name");
        }
        let storedTensor = {
            name: tensor_name,
            bytes: bytes,
        };

        let tensorID = uuidv4();
        this.db!.put("tensors", storedTensor, tensorID);
        return tensorID;
    }

    //Fetches a resource from the remote server
    //and stores it in the database
    _fetchBundle = async (modelName: AvailableModels) => {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }
        try {
            let parentID = uuidv4();
            this.db!.put("availableModels", parentID, modelName);

            let model_definition = await fetch(
                `${this.remoteUrl}/${modelName}/model_definition.json`
            ).then((resp) => resp.json());

            for (let [index, model] of model_definition.models.entries()) {
                let tensorIDs: string[] = [];
                for (let tensor of model.tensors) {
                    let bytes = await fetch(
                        `${this.remoteUrl}/${modelName}/${tensor}`
                    )
                        .then((resp) => resp.arrayBuffer())
                        .then((buffer) => new Uint8Array(buffer));
                    console.log("Storing tensor: ", tensor);
                    let tensorID = await this.insertTensor(tensor, bytes);
                    tensorIDs.push(tensorID);
                }

                let bytes = await fetch(
                    `${this.remoteUrl}/${modelName}/${model.definition}`
                )
                    .then((resp) => resp.arrayBuffer())
                    .then((buffer) => new Uint8Array(buffer));
                console.log("Storing model: ", model);
                let modelID = await this.insertModel(
                    model.definition,
                    tensorIDs,
                    index,
                    parentID,
                    bytes
                );
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
                    parentID: parentID,
                },
                parentID
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
                    parentID: parentID,
                },
                parentID
            );
        } catch (e) {
            console.log(e);
        }
    };
}
