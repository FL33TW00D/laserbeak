import { useContext, useEffect, useRef, useState } from "react";
import type { WASM } from "../../types";
import { WASMContext } from "../../context/WASMCtx";
import { useMountEffectOnce } from "../../hooks/useMountEffectOnce";
import samples from "./samples.json";
import { createSession } from "../../lib/createSession";

export const FLANExample = () => {
    const ctx = useContext(WASMContext);

    if (!ctx.wasm) {
        return <>...</>;
    }

    return <FLAN wasm={ctx.wasm} />;
};

const FLAN: React.FC<FLANProps> = ({ wasm }) => {
    const [session, setSession] = useState<any | null>(null);
    const [inputText, setInputText] = useState<string>("");
    const [outputText, setOutputText] = useState<string>("");
    const [run, setRun] = useState<boolean>(false);

    function randomSample() {
        setInputText(samples[Math.floor(Math.random() * samples.length)]);
    }

    async function runSample() {
        try {
            if (!session || !inputText || inputText.length < 2) {
                return;
            }
            const start = performance.now();
            let output = await session.run(inputText);
            const duration = performance.now() - start;
            console.log("Inference time:", duration.toFixed(2), "ms");
            setOutputText(output);
        } catch (e: any) {
            console.log(e.toString());
        }
    }

    useMountEffectOnce(() => {
        (async () => {
            let session = await createSession();
            setSession(session);
        })();
    });

    return (
        <>
            <div>
                <textarea
                    id="inp"
                    rows={8}
                    className="mt-8 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={session === null}
                ></textarea>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row gap-2 mt-4">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 "
                            onClick={() => runSample()}
                        >
                            {session === null ? (
                                <div className="inline-flex">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Loading...{" "}
                                </div>
                            ) : (
                                <p>Run</p>
                            )}
                        </button>
                        <button
                            className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 "
                            onClick={() => randomSample()}
                        >
                            I'm feeling lucky
                        </button>
                    </div>
                    <div className="first-letter:uppercase">{outputText}</div>
                </div>
            </div>
        </>
    );
};

interface FLANProps {
    wasm: WASM;
}