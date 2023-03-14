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
exports.WASMContextProvider = exports.WASMContext = void 0;
const react_1 = require("react");
const useMountEffectOnce_1 = require("../hooks/useMountEffectOnce");
const wasm = __importStar(require("@rumbl/rumble-wasm"));
const initial = {};
exports.WASMContext = (0, react_1.createContext)(initial);
const WASMContextProvider = ({ children, }) => {
    const [state, setState] = (0, react_1.useState)(initial);
    // This has to run only once: https://github.com/rustwasm/wasm-bindgen/issues/3153
    // Though, in development React renders twice when Strict Mode is enabled: https://reactjs.org/docs/strict-mode.html
    // That's why it must be limited to a single mount run
    (0, useMountEffectOnce_1.useMountEffectOnce)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            yield wasm.default();
            setState({ wasm });
        }))();
    });
    return <exports.WASMContext.Provider value={state}>{children}</exports.WASMContext.Provider>;
};
exports.WASMContextProvider = WASMContextProvider;
