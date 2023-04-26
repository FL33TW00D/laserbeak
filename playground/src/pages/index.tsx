import type { NextPage } from "next";
import Head from "next/head";
import { Open_Sans } from "@next/font/google";
import ChromeDownloadModal from "../components/modal";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {
    SessionManager,
    AvailableModels,
    InferenceSession,
} from "@rumbl/laserbeak";
import Layout from "@/components/layout";

const open_sans = Open_Sans({ subsets: ["latin"] });

const Home: NextPage = () => {
    const session = useRef<InferenceSession | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const loadingToastId = useRef<string | null>(null); // Store the loading toast id

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

    return (
        <>
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
                    </div>
                </div>

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
        </>
    );
};

export default Home;
