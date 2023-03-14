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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLANExample = void 0;
const react_1 = require("react");
const WASMCtx_1 = require("../../context/WASMCtx");
const useMountEffectOnce_1 = require("../../hooks/useMountEffectOnce");
const samples_json_1 = __importDefault(require("./samples.json"));
const createSession_1 = require("../../lib/createSession");
const FLANExample = () => {
    const ctx = (0, react_1.useContext)(WASMCtx_1.WASMContext);
    if (!ctx.wasm) {
        return <>...</>;
    }
    return <FLAN wasm={ctx.wasm}/>;
};
exports.FLANExample = FLANExample;
const FLAN = ({ wasm }) => {
    const [session, setSession] = (0, react_1.useState)(null);
    const [inputText, setInputText] = (0, react_1.useState)("");
    const [outputText, setOutputText] = (0, react_1.useState)("");
    const [run, setRun] = (0, react_1.useState)(false);
    function randomSample() {
        setInputText(samples_json_1.default[Math.floor(Math.random() * samples_json_1.default.length)]);
    }
    function runSample() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!session || !inputText || inputText.length < 2) {
                    return;
                }
                const start = performance.now();
                let output = yield session.run(inputText);
                const duration = performance.now() - start;
                console.log("Inference time:", duration.toFixed(2), "ms");
                setOutputText(output);
            }
            catch (e) {
                console.log(e.toString());
            }
        });
    }
    (0, useMountEffectOnce_1.useMountEffectOnce)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            let session = yield (0, createSession_1.createSession)();
            setSession(session);
        }))();
    });
    return (<>
            <div>
                <textarea id="inp" rows={8} className="mt-8 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="" value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={session === null}></textarea>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row gap-2 mt-4">
                        <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 " onClick={() => runSample()}>
                            {session === null ? (<div className="inline-flex">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...{" "}
                                </div>) : (<p>Run</p>)}
                        </button>
                        <button className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 " onClick={() => randomSample()}>
                            I'm feeling lucky
                        </button>
                    </div>
                    <div className="first-letter:uppercase">{outputText}</div>
                </div>
            </div>
        </>);
};
