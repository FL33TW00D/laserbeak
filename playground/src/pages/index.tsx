import type { NextPage } from "next";
import { Open_Sans } from "@next/font/google";
import ChromeDownloadModal from "../components/modal";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
    SessionManager,
    AvailableModels,
    InferenceSession,
    GenerationConfig,
} from "@rumbl/laserbeak";
import Layout from "../components/layout";
import Sidebar from "../components/sidebar";

const open_sans = Open_Sans({ subsets: ["latin"] });

const Home: NextPage = () => {
    const session = useRef<InferenceSession | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const loadingToastId = useRef<string | null>(null);
    const [output, setOutput] = useState("");
    const [prompt, setPrompt] = useState("");
    const [selectedModel, setSelectedModel] = useState<AvailableModels | null>(
        null
    );
    const [noneSelected, setNoneSelected] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
        max_length: 512,
        temperature: 1.0,
        top_k: 0.0,
        top_p: 0.0,
        repetition_penalty: 1.0,
    });

    useEffect(() => {
        if (loaded) {
            if (loadingToastId.current) {
                toast.dismiss(loadingToastId!.current);
            }
            toast.success("Model loaded!");
            setLoaded(false);
        }
    }, [loaded]);

    useEffect(() => {
        if (loading) {
            loadingToastId.current = toast.loading("Loading model...");
        }
    }, [loading]);

    useEffect(() => {
        if (selectedModel !== null && !loading) {
            console.log("Selected model:", selectedModel);
            const loadModel = async () => {
                if (session.current) {
                    session.current.destroy();
                }
                setLoading(true);
                const manager = new SessionManager();
                const loadResult = await manager.loadModel(selectedModel, () =>
                    setLoaded(true)
                );
                if (loadResult.isErr) {
                    toast.error(loadResult.error.message);
                } else {
                    session.current = loadResult.value;
                }
                setLoading(false);
            };

            loadModel();
        }
    }, [selectedModel]);

    //Hack to format the output
    function splitNumbered(text: string) {
        const splits = text.split(/\s(?=\d+\.)/);
        return splits.map((split) => split + "\n").join("");
    }

    async function runSample(
        session: InferenceSession | null,
        prompt: string,
        generation_config: GenerationConfig
    ) {
        try {
            if (!session || !prompt || prompt.length < 2 || generating) {
                return;
            }
            setGenerating(true);
            const inputs_map = new Map<string, any>();
            inputs_map.set("input_text", prompt);
            const start = performance.now();
            const runResult = await session.run(
                inputs_map,
                (output: string) => {
                    console.log("Output:", output);
                    setOutput(splitNumbered(output));
                },
                generation_config
            );
            const duration = performance.now() - start;
            setGenerating(false);
            if(runResult.isErr) {
                toast.error(runResult.error.message);
                return;
            }
            console.log("Inference time:", duration.toFixed(2), "ms");
        } catch (e: any) {
            console.log(e.toString());
        }
    }

    return (
        <Layout title={"AI Playground"}>
            <div className={`p-0 ${open_sans.className}`}>
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-row h-screen">
                        <Sidebar
                            setSelectedModel={setSelectedModel}
                            selectedModel={selectedModel}
                            noneSelected={noneSelected}
                            generationConfig={generationConfig}
                            setGenerationConfig={setGenerationConfig}
                        />
                        <div className="flex flex-col p-12 w-full mx-auto">
                            <textarea
                                className="w-full h-48 bg-zinc-900 text-white p-3 rounded-md border-2 border-zinc-600"
                                placeholder="Type here..."
                                onChange={(e) => {
                                    setPrompt(e.target.value);
                                }}
                            ></textarea>
                            <div className="flex flex-row w-full justify-between items-center my-4">
                                <button
                                    className="bg-rose-400 text-white font-semibold py-2 px-4 h-12 rounded"
                                    onClick={() => {
                                        if (!selectedModel) {
                                            setNoneSelected(true);
                                            setTimeout(() => {
                                                setNoneSelected(false);
                                            }, 1000);
                                            return;
                                        }
                                        runSample(
                                            session.current,
                                            prompt,
                                            generationConfig
                                        );
                                    }}
                                >
                                    {generating ? (
                                        <div className="flex inline-flex items-center font-normal">
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                                            <p>Generating</p>
                                        </div>
                                    ) : (
                                        <p>Run</p>
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-col w-full bg-zinc-900 py-2 px-4 border border-zinc-700 rounded-md">
                                <h1 className="text-white text-lg font-semibold">
                                    Output
                                </h1>
                                <div className="py-2">
                                    <p className="text-white whitespace-pre-wrap">
                                        {output}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ChromeDownloadModal />
        </Layout>
    );
};

export default Home;
