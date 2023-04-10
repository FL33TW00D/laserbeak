import { useState } from "react";
import { useMountEffectOnce } from "../hooks/useMountEffectOnce";
import samples from "./samples.json";
import { ModelManager, AvailableModels } from "laserbeak";
export const FLANExample = () => {
    return <FLAN />;
};

const FLAN = () => {
    const [model, setModel] = useState<any | null>(null);
    const [inputText, setInputText] = useState<string>("");
    const [outputText, setOutputText] = useState<string>("");

    function randomSample() {
        setInputText(samples[Math.floor(Math.random() * samples.length)]);
    }

    async function runSample() {
        setOutputText("");
        try {
            if (!model || !inputText || inputText.length < 2) {
                return;
            }
            const start = performance.now();
            await model.run(inputText, (input: string) => {
                setOutputText(input);
            });
            const duration = performance.now() - start;
            console.log("Inference time:", duration.toFixed(2), "ms");
        } catch (e: any) {
            console.log(e.toString());
        }
    }

    useMountEffectOnce(() => {
        (async () => {
            let modelManager = new ModelManager();
            await modelManager.init();
            let loadedModel = await modelManager.loadModel(
                AvailableModels.FLAN_T5_BASE
            );
            setModel(loadedModel);
        })();
    });

    return (
        <>
            <div>
                <textarea
                    id="inp"
                    rows={8}
                    className="mt-8 block p-2.5 w-full text-sm text-gray-100 font-light bg-zinc-800 rounded-lg border-zinc-600 border focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-transparent focus:duration-75 transition-all ease-in"
                    placeholder=""
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={model === null}
                ></textarea>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row gap-2 mt-4">
                        <button
                            className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-purple-800"
                            onClick={() => runSample()}
                        >
                            {model === null ? (
                                <div className="inline-flex px-4">
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
                                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                    Run
                                </span>
                            )}
                        </button>
                        <button
                            className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-purple-800"
                            onClick={() => randomSample()}
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                I&#39;m feeling lucky
                            </span>
                        </button>
                    </div>
                    <div className="first-letter:uppercase text-white font-light text-lg">
                        {outputText}
                    </div>
                </div>
            </div>
        </>
    );
};
