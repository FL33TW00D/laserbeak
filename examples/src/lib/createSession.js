"use strict";
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
exports.createSession = void 0;
const comlink_1 = require("comlink");
const session_1 = require("./session");
const createSession = (modelPath, proxy) => __awaiter(void 0, void 0, void 0, function* () {
    if (proxy && typeof document !== "undefined") {
        const worker = new Worker(new URL("./session.js", import.meta.url), { type: "module" });
        const exposedSession = (0, comlink_1.wrap)(worker);
        const session = yield new exposedSession();
        yield session.init(modelPath);
        return session;
    }
    else {
        const session = new session_1.Session();
        yield session.init(modelPath);
        return session;
    }
});
exports.createSession = createSession;
