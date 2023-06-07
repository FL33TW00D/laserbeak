import * as rumble from "@rumbl/rumble-wasm";
import { Result } from "true-myth";
import ModelDB from "./db/modelDB";
import { DBModel } from "./db/types";

export enum AvailableModels {
    E5_SMALL = "e5_small",
    E5_SMALL_INT8 = "e5_small_int8",
    E5_AUX = "e5_aux",
    FLAN_T5_SMALL = "flan_t5_small_int8",
    FLAN_T5_BASE = "flan_t5_base_int8",
    LAMINI_FLAN_T5_BASE = "lamini_flan_base_int8",
    ALPACA_FLAN_T5_BASE = "alpaca_flan_base_int8",
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

    static async fromDBModel(dbModel: DBModel, db: ModelDB): Promise<Result<Model, Error>> {
        let tensorsResult = await db.getTensors(dbModel.tensorIDs);
        if(tensorsResult.isErr) {
            return Result.err(tensorsResult.error);
        }
        let tensors = tensorsResult.value;

        let configResult = await db.getConfig(dbModel.parentID);
        if(configResult.isErr) {
            return Result.err(configResult.error);
        }
        let config = configResult.value;

        let tokenizerResult = await db.getTokenizer(dbModel.parentID);
        if(tokenizerResult.isErr) {
            return Result.err(tokenizerResult.error);
        }
        let tokenizer = tokenizerResult.value;

        return Result.ok(new Model(
            dbModel.name,
            dbModel.bytes,
            tensors,
            config.bytes,
            tokenizer.bytes
        ));
    }
}

export interface EncoderDecoder {
    name: string;
    encoder: Model;
    decoder: Model;
    config: Uint8Array;
    tokenizer: Uint8Array;
}
