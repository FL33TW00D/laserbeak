"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const head_1 = __importDefault(require("next/head"));
const FLANExample_1 = require("../components/examples/FLANExample");
const Home = () => {
    return (<div className="p-0">
      <head_1.default>
        <title>Talk to FLAN-T5</title>
        <meta name="description" content="Next.JS with WebAssembly"/>
        <link rel="icon" href="/favicon.ico"/>
      </head_1.default>

      <main className="min-h-screen max-w-5xl mx-auto px-16 flex flex-1 flex-col justify-center content-center">
          <h1 className="text-3xl md:text-6xl font-semibold text-center mb-16">
          Welcome to <a href="https://en.wikipedia.org/wiki/Wikipedia:Large_language_models">LLMs</a> in the browser! 
        </h1>

        <div className="text-center">
          <FLANExample_1.FLANExample />
        </div>
      </main>
    </div>);
};
exports.default = Home;
