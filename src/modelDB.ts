import { DBSchema, IDBPDatabase, openDB } from "idb";
import { v4 as uuidv4 } from "uuid";
import * as rumble from "@rumbl/rumble-wasm";
import { unzip } from "fflate";

interface ModelBundle {
    name: string;
    model: StoredModel;
    tensors: any;
}

interface StoredModel {
    name: string;
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
    };
    tensors: {
        value: StoredTensor;
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
                db.createObjectStore("models");
            },
        });
    }

    async get_model(bundleName: string): Promise<StoredModel | undefined> {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }

        const cachedModel = await this.db.get("models", bundleName);
        if (cachedModel) {
            return cachedModel;
        } else {
            const model = await this._fetchBundle(bundleName);
            return model;
        }
    }

    async insert_bundle(err, bundle) {
        if (err) {
            console.log(err);
            return;
        }
        //here bundle is a map
        for (let [key, entry] of bundle) {
            let extension = key.split(".").pop();
            console.log(key, entry);
            console.log(extension);
            if (extension === "onnx") {
                //We have a model
                let storedModel = {
                    name: key,
                    bytes: new Blob([entry.data]),
                };

                this.db!.put("models", storedModel, uuidv4());
            } else {
                let storedTensor = {
                    bytes: new Blob([entry.data]),
                    modelID: "MODEL", //TODO: get modelID
                };

                this.db!.put("tensors", storedTensor, uuidv4());
            }
        }
    }

    // Fetches a bundled model from the R2 bucket and extracts it
    _fetchBundle = async (
        bundleName: string
    ): Promise<StoredModel | undefined | any> => {
        if (!this.db) {
            throw new Error("ModelDB not initialized");
        }
        try {
            let bytes = await fetch(`${this.remoteUrl}/${bundleName}`).then(
                (resp) => resp.arrayBuffer()
            );
            const extension = bundleName.split(".").pop();
            if (extension === "zip") {
                let unzipped = unzip(new Uint8Array(bytes), this.insert_bundle);
                console.log(unzipped);
            }

            // Extract the model from the tarball
            /*
            untar(data)
                .progress((file: any) => {
                    let extension = file.name.split(".").pop();
                    if (extension === "onnx" ) {
                        //We have a model
                        let storedModel = {
                            name: bundleName,
                            bytes: new Blob([file.data]),
                        };

                        this.db!.put("models", storedModel, uuidv4());
                    } else {
                        let storedTensor = {
                            bytes: new Blob([file.data]),
                            modelID: bundleName,
                        };

                        this.db!.put("tensors", storedTensor, uuidv4());
                    }
                })
                .then((allFiles: any) => {
                    console.log(allFiles);
                });
                */
        } catch (e) {
            console.log(e);
        }
    };
}
