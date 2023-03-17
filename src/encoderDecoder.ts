import { Session } from "./session";

export class EncoderDecoder {
    session: Session | undefined;
    tokenizer: Tokenizer;

    constructor() {
        this.session = new Session();
    }
        

    async init() {
        await this.tokenizer.initialize();
    }

    async encode(input: string) {
        const encoded = await this.tokenizer.encode(input);
        return encoded.ids;
    }

    async decode(input: number[]) {
        const decoded = await this.tokenizer.decode(input);
        return decoded;
    }
}
