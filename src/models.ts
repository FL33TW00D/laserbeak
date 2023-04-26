import * as rumble from "@rumbl/rumble-wasm";
import ModelDB from "./db/modelDB";
import { DBModel } from "./db/types";

export enum AvailableModels {
    FLAN_T5_SMALL = "flan_t5_small",
    FLAN_T5_BASE = "flan_t5_base",
    FLAN_T5_LARGE = "flan_t5_large",
    LAMINI_FLAN_T5_BASE = "lamini_flan_base",
}

export class Model {
    name: string;
    definition: Uint8Array; //ONNX file bytes
    tensors: Map<string, Uint8Array>;
    config?: Uint8Array;
    tokenizer?: Uint8Array;

    constructor(
        name: string,
        definition: Uint8Array,
        tensors: Map<string, Uint8Array>,
        config?: Uint8Array,
        tokenizer?: Uint8Array
    ) {
        this.name = name;
        this.definition = definition;
        this.tensors = tensors;
        this.config = config;
        this.tokenizer = tokenizer;
    }

    intoDefinition(): rumble.ModelDefinition {
        return new rumble.ModelDefinition(this.definition, this.tensors);
    }

    static async fromDBModel(dbModel: DBModel, db: ModelDB): Promise<Model> {
        let tensors = await db._getTensors(dbModel.tensorIDs);
        let config = await db._getConfig(dbModel.parentID);
        let tokenizer = await db._getTokenizer(dbModel.parentID);

        return new Model(
            dbModel.name,
            dbModel.bytes,
            tensors,
            config.bytes,
            tokenizer.bytes
        );
    }
}

export interface EncoderDecoder {
    name: string;
    encoder: Model;
    decoder: Model;
    config: Uint8Array;
    tokenizer: Uint8Array;
}
