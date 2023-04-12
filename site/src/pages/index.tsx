import type { NextPage } from "next";
import Head from "next/head";
import HoveringMenuExample from "../components/editor";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

const Home: NextPage = () => {
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

            <main className="min-h-screen flex flex-1 flex-col bg-dark">
                <h1 className="text-xl md:text-2xl font-medium tracking-tight text-white pl-4 py-4">
                    Summize
                </h1>
                <div className="mx-auto flex flex-1 flex-col justify-center content-center align-center h-full w-full">
                    <div className="text-center bg-white flex flex-1 px-4 py-8">
                        <div className="flex flex-1 max-w-5xl mx-auto">
                            <HoveringMenuExample />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col text-center">
                    <div className="flex h-full flex-col justify-between gap-y-4 pt-4 pb-6 text-sm md:col-span-1">
                        <span className="font-extralight text-white">
                            Built by {" "}
                            <a
                                className="font-light text-blue-500 hover:text-blue-700"
                                href="https://fleetwood.dev"
                            >
                                Christopher Fleetwood
                            </a>
                        </span>
                        <span className="font-extralight text-white">
                            Learn more {" "} 
                            <a
                                className="font-light text-blue-500 hover:text-blue-700"
                                href="https://fleetwood.dev"
                            >
                                here
                            </a>
                        </span>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
