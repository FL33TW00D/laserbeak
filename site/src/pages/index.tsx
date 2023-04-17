import type { NextPage } from "next";
import Head from "next/head";
import SummizeEditor from "../components/editor/editor";
import { Inter } from "@next/font/google";
import ChromeDownloadModal from "../components/modals/modal";
import React, { useEffect, useState } from "react";
import { ModelManager, AvailableModels } from "laserbeak";
import SuccessToast from "../components/toasts/successToast";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

const Home: NextPage = () => {
    const [model, setModel] = useState<any | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (loaded) {
            toast.custom((t) => (
                <SuccessToast
                    message={"The model has been loaded successfully!"}
                    toast={t}
                />
            ));
        }
    }, [loaded]);

    return (
        <div className={`p-0 ${inter.className}`}>
            <Head>
                <title>Summize</title>
                <meta name="description" content="AI Text Editor" />
                <link rel="icon" href="/favicon.ico" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                ></link>
            </Head>

            <ChromeDownloadModal
                onAccept={() => {
                    (async () => {
                        let modelManager = new ModelManager();
                        await modelManager.init();
                        let loadedModel = await modelManager.loadModel(
                            AvailableModels.FLAN_T5_BASE,
                            () => setLoaded(true)
                        );
                        setModel(loadedModel);
                    })();
                }}
            />

            <main className="min-h-screen flex flex-1 flex-col">
                <Toaster />
                <div className="flex-1">
                    <div className="flex flex-col text-center bg-dark py-2">
                        <h1 className="font-black">summize</h1>
                    </div>
                    <div className="mx-auto flex flex-1 flex-col justify-center content-center align-center h-full w-full">
                        <div className="text-center bg-stone-50 flex flex-1 py-16">
                            <div className="flex flex-1 max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto bg-white py-12 px-8 rounded-t-md shadow-lg h-full border">
                                <SummizeEditor model={model} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col text-center bg-dark">
                        <div className="flex h-full flex-col justify-between gap-y-4 py-8 text-sm md:col-span-1">
                            <span className="font-extralight text-white">
                                Built by{" "}
                                <a
                                    className="font-light text-blue-500 hover:text-blue-700"
                                    href="https://fleetwood.dev"
                                >
                                    Christopher Fleetwood
                                </a>
                            </span>
                            <span className="font-extralight text-white">
                                Learn more{" "}
                                <a
                                    className="font-light text-blue-500 hover:text-blue-700"
                                    href="https://fleetwood.dev"
                                >
                                    here
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
