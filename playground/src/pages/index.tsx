import type { NextPage } from "next";
import { Open_Sans } from "@next/font/google";
import ChromeDownloadModal from "../components/modal";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
    SessionManager,
    AvailableModels,
    InferenceSession,
} from "@rumbl/laserbeak";
import Layout from "../components/layout";

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
    const [accepted, setAccepted] = useState(false);
    const [noneSelected, setNoneSelected] = useState(false);

    useEffect(() => {
        if (loaded) {
            if (loadingToastId.current) {
                toast.dismiss(loadingToastId!.current);
            }
            toast.success("Model loaded!");
        }
    }, [loaded]);

    useEffect(() => {
        if (loadingToastId.current) {
            return;
        }
        if (loading) {
            loadingToastId.current = toast.loading("Loading model...");
        }
    }, [loading]);

    useEffect(() => {
        if (selectedModel !== null && !loading && accepted) {
            const loadModel = async () => {
                setLoading(true);
                let manager = new SessionManager();
                let modelSession = await manager.loadModel(selectedModel, () =>
                    setLoaded(true)
                );
                session.current = modelSession;
                setLoading(false);
            };

            loadModel();
        }
    }, [selectedModel]);

    //Hack to format the output
    function splitNumbered(text: string) {
        let splits = text.split(/\s(?=\d+\.)/);
        return splits.map((split) => split + "\n").join("");
    }

    async function runSample(session: InferenceSession | null, prompt: string) {
        try {
            if (!session || !prompt || prompt.length < 2) {
                return;
            }
            const start = performance.now();
            await session.run(prompt, (output: string) => {
                setOutput(splitNumbered(output));
            });
            const duration = performance.now() - start;
            console.log("Inference time:", duration.toFixed(2), "ms");
        } catch (e: any) {
            console.log(e.toString());
        }
    }

    return (
        <Layout title={"AI Playground"}>
            <div className={`p-0 ${open_sans.className}`}>
                <div className="flex-1 flex flex-col ">
                    <div className="flex flex-row w-full justify-between bg-dark py-2 px-4 items-center">
                        <h1 className="text-white text-xl font-semibold">
                            Playground
                        </h1>
                        <h3 className="font-bold text-transparent text-xl bg-clip-text bg-gradient-to-tr from-violet-500 to-orange-300">
                            <a
                                href="https://fleetwood.dev/posts/running-llms-in-the-browser"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Learn more here
                            </a>
                        </h3>
                    </div>
                    <div className="flex flex-col p-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
                        <textarea
                            className="w-full h-48 bg-dark text-white p-2 rounded-md border border-slate-800"
                            placeholder="Type here..."
                            onChange={(e) => {
                                setPrompt(e.target.value);
                            }}
                        ></textarea>
                        <div className="flex flex-row w-full justify-between items-center my-4">
                            <button
                                className="w-16 bg-gradient-to-tr from-violet-500 to-orange-300 text-white font-semibold py-2 px-4 h-12 rounded"
                                onClick={() => {
                                    if (!selectedModel) {
                                        setNoneSelected(true);
                                        setTimeout(() => {
                                            setNoneSelected(false);
                                        }, 2000);
                                        return;
                                    }
                                    runSample(session.current, prompt);
                                }}
                            >
                                Run
                            </button>
                            <div className="flex flex-col w-full justify-end text-sm">
                                <label
                                    htmlFor="model"
                                    className="mr-2 mb-1 text-white text-sm font-light ml-auto"
                                >
                                    Select Model
                                </label>
                                <select
                                    id="model"
                                    value={
                                        selectedModel ? selectedModel : "None"
                                    }
                                    onChange={(e) => {
                                        if (e.target.value !== selectedModel) {
                                            setSelectedModel(
                                                e.target
                                                    .value as AvailableModels
                                            );
                                        }
                                    }}
                                    className={`transition ease-in-out delay-150 bg-dark text-white ml-auto p-2 rounded-md border ${
                                        noneSelected
                                            ? "border-red-500"
                                            : "border-slate-800"
                                    }`}
                                >
                                    <option value="None">None</option>
                                    {Object.values(AvailableModels).map(
                                        (model) => (
                                            <option key={model} value={model}>
                                                {model}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col w-full bg-dark py-2 px-4 border border-slate-800 rounded-md">
                            <h1 className="text-white text-xl font-semibold">
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

            <ChromeDownloadModal onAccept={() => setAccepted(true)} />
        </Layout>
    );
};

export default Home;
