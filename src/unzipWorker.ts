import * as Comlink from 'comlink';
import { unzip } from "fflate";

// Thin wrapper around fflate's unzip function to run in a web worker.
export default class UnzipWorker {
    async unzip(zipped) {
        console.log("Unzipping");
        unzip(zipped, (result) => { console.log("done") }); 
    }
}

Comlink.expose(UnzipWorker);
