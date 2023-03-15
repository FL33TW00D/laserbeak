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

  init = async (modelPath: string) => {
    await this.modelDB.init();
    const [encoderBytes, decoderBytes, configBytes, tokenizerBytes] =
      await Promise.all([
        this._fetchBytes(
          'https://rmbl.us/modified_flan-t5-base_encoder_decoder_init_fp32_sim.onnx.gz'
        ),
        this._fetchBytes(
          'https://rmbl.us/modified_flan-t5-base_decoder_fp32_sim.onnx.gz'
        ),
        this._fetchBytes('resources/flan-t5/base/config.json'),
        this._fetchBytes('resources/flan-t5/base/tokenizer.json'),
      ]);
    console.log('Initialized', {
      encoderBytes,
      decoderBytes,
      configBytes,
      tokenizerBytes,
    });
    await rumble.default();
    this.rumbleSession = await rumble.Session.fromComponents(
      encoderBytes,
      decoderBytes,
      configBytes,
      tokenizerBytes
    );
  };

  run = async (input: any): Promise<any> => {
    if (!this.rumbleSession) {
      throw Error(
        'the session is not initialized. Call `init()` method first.'
      );
    }
    return await this.rumbleSession.run(input);
  };
}

if (typeof self !== 'undefined') {
  Comlink.expose(Session);
}
