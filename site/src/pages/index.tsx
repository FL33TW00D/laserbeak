import type { NextPage } from "next";
import Head from "next/head";
import { FLANExample } from "../components/FLANExample";

const Home: NextPage = () => {
    return (
        <div className="p-0">
            <Head>
                <title>Talk to FLAN-T5</title>
                <meta name="description" content="Talk to FLAN-T5" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen flex flex-1 flex-col bg-dark">
                <div className="max-w-5xl m-auto p-16 flex-col justify-center content-center align-center">
                    <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-center mb-16 text-white ">
                        Welcome to LLMs in the browser!
                    </h1>

                    <div className="text-center">
                        <FLANExample />
                    </div>
                </div>

                <div className="flex flex-col text-center">
                    <div className="flex h-full flex-col justify-between gap-y-4 pt-8 pb-6 text-sm md:col-span-1">
                        <span className="font-extralight text-white">
                            Devised by{" "}
                            <a
                                className="font-light text-blue-500 hover:text-blue-700"
                                href="https://fleetwood.dev"
                            >
                                Christopher Fleetwood
                            </a>
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
