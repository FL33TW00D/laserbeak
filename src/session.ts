import pako from 'pako';
import * as Comlink from 'comlink';
import * as rumble from '@rumbl/rumble-wasm';
import ModelDB from './db';

export class Session {
  rumbleSession: rumble.Session | undefined;
  modelDB: ModelDB;

  constructor() {
    let modelDB = new ModelDB();
    this.modelDB = modelDB;
  }

  _fetchBytes = async (url: string): Promise<Uint8Array> => {
    try {
        const cachedModel = await this.modelDB.get(url);
        console.log('cachedModel', cachedModel);
        if (cachedModel) {
            return new Uint8Array(await cachedModel.bytes.arrayBuffer()); 
        }else {
            let bytes = await fetch(url).then((resp) => resp.arrayBuffer());
            const extension = url.split('.').pop();
            if (extension === 'gz') {
              bytes = pako.inflate(bytes);
            }
            const data = new Uint8Array(bytes);
            await this.modelDB.set(url, new Blob([data]));
            return data;
        }
    } catch (e) {
        console.log(e);
        return new Uint8Array();
    }
  };

  init = async (encoderPath?: string, decoderPath?:string) => {
    await this.modelDB.init();
    const [encoderBytes, decoderBytes, configBytes] =
      await Promise.all([
        this._fetchBytes(
          `https://rmbl.us/${encoderPath}`
        ),
        this._fetchBytes(
          `https://rmbl.us/${decoderPath}`
        ),
        this._fetchBytes('resources/flan-t5/small/config.json'),
      ]);
    console.log('Initialized', {
      encoderBytes,
      decoderBytes,
      configBytes,
    });
    await rumble.default();
    this.rumbleSession = await rumble.Session.fromComponents(
      encoderBytes,
      decoderBytes,
      configBytes,
    );
  };

  run = async (input: Uint32Array, callback: (token: string) => void): Promise<any> => {
    if (!this.rumbleSession) {
      throw Error(
        'the session is not initialized. Call `init()` method first.'
      );
    }

    return await this.rumbleSession.stream(input, callback);
  };
}

if (typeof self !== 'undefined') {
  Comlink.expose(Session);
}
