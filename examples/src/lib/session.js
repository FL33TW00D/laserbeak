"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const pako = __importStar(require("pako"));
const Comlink = __importStar(require("comlink"));
const rumble = __importStar(require("@rumbl/rumble-wasm"));
class Session {
    constructor() {
        this._fetchBytes = (url) => __awaiter(this, void 0, void 0, function* () {
            const extension = url.split(".").pop();
            let bytes = yield fetch(url).then((resp) => resp.arrayBuffer());
            if (extension === "gz") {
                bytes = pako.inflate(bytes);
            }
            const data = new Uint8Array(bytes);
            return data;
        });
        this.init = (modelPath) => __awaiter(this, void 0, void 0, function* () {
            const [encoderBytes, decoderBytes, tokenizerBytes] = yield Promise.all([
                fetchBytes("https://rmbl.us/modified_flan-t5-small_encoder_decoder_init_fp32_sim.onnx.gz"),
                fetchBytes("https://rmbl.us/modified_flan-t5-small_decoder_fp32_sim.onnx.gz"),
                fetchBytes("resources/flan-t5/small/config.json"),
                fetchBytes("resources/flan-t5/small/tokenizer.json"),
            ]);
            console.log("Initialized", {
                encoderBytes,
                decoderBytes,
                configBytes,
                tokenizerBytes,
            });
            yield rumble.default();
            this.rumbleSession = yield rumble.Session.fromComponents(encoderBytes, decoderBytes, configBytes, tokenizerBytes);
        });
        this.fetchData = (modelPath) => __awaiter(this, void 0, void 0, function* () {
            const extension = modelPath.split(".").pop();
            let modelData = yield fetch(modelPath).then((resp) => resp.arrayBuffer());
            if (extension === "gz") {
                modelData = pako.inflate(modelData);
            }
            localforage.setItem(modelPath, modelData);
            return modelData;
        });
        this.run = (input) => __awaiter(this, void 0, void 0, function* () {
            if (!this.rumbleSession) {
                throw Error("the session is not initialized. Call `init()` method first.");
            }
            return yield this.ortSession.run(input);
        });
    }
}
exports.Session = Session;
if (typeof self !== "undefined") {
    Comlink.expose(Session);
}
