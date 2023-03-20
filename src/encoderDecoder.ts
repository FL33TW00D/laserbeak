import { Session } from "./session";
import { Tokenizer } from "@rumbl/wokenizers";

export class EncoderDecoder {
    session: Session | undefined;
    tokenizer: Tokenizer | undefined;

    constructor() {
        this.session = new Session();
    }

    async init() {
        let bytes = await fetch("https://huggingface.co/google/flan-t5-small/raw/main/tokenizer.json");
        let json = await bytes.json();
        this.tokenizer = new Tokenizer(json);
    }  

    encode(input: string) {
        if (!this.tokenizer) {
            throw new Error("Tokenizer not initialized");
        }
         return this.tokenizer.encode(input);
    }

    decode(input: Uint32Array) {
        if (!this.tokenizer) {
            throw new Error("Tokenizer not initialized");
        }
        return this.tokenizer.decode(input);
    }
}
