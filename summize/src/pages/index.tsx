import type { NextPage } from "next";
import Head from "next/head";
import SummizeEditor from "../components/editor/editor";
import { Open_Sans } from "@next/font/google";
import ChromeDownloadModal from "../components/modals/modal";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {
    SessionManager,
    AvailableModels,
    InferenceSession,
} from "@rumbl/laserbeak";

const open_sans = Open_Sans({ subsets: ["latin"] });

const Home: NextPage = () => {
    const session = useRef<InferenceSession | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const loadingToastId = useRef<string | null>(null); // Store the loading toast id
    const [editorDimensions, setEditorDimensions] = useState({
        width: 0,
        height: 0,
    });

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

    const updateDimensions = () => {
        let scaledInner = window.innerWidth * 0.8;
        const width = scaledInner > 800 ? 800 : scaledInner;
        const height = width * Math.sqrt(2);
        setEditorDimensions({ width, height });
    };

    useEffect(() => {
        updateDimensions();
        window.addEventListener("resize", updateDimensions);

        return () => {
            window.removeEventListener("resize", updateDimensions);
        };
    }, []);

    return (
        <div className={`p-0 ${open_sans.className}`}>
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
                        setLoading(true);
                        let manager = new SessionManager();
                        let modelSession = await manager.loadModel(
                            AvailableModels.FLAN_T5_BASE,
                            () => setLoaded(true)
                        );
                        session.current = modelSession;
                    })();
                }}
            />

            <main className="min-h-screen max-h-screen flex flex-col overflow-auto">
                <Toaster />
                <div className="flex-1 flex flex-col ">
                    <div className="flex flex-row w-full justify-between bg-dark py-2 px-4 items-center">
                        <h1 className="text-white text-xl font-semibold">
                            Summize
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
                    <div className="flex-grow flex items-center justify-center bg-stone-50">
                        <div className="flex flex-1 py-16">
                            <div
                                className="flex flex-1 max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto bg-white py-12 px-8 rounded-t-md shadow-lg min-h-max border"
                                style={{
                                    minHeight: `${editorDimensions.height}px`,
                                    minWidth: `${editorDimensions.width}px`,
                                }}
                            >
                                <SummizeEditor session={session.current} />
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="flex flex-col text-center bg-dark">
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
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Home;
