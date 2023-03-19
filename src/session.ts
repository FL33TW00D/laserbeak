import * as Comlink from 'comlink';
import * as rumble from '@rumbl/rumble-wasm';
import ModelDB from './modelDB';

export class Session {
  rumbleSession: rumble.Session | undefined;
  modelDB: ModelDB;

  constructor() {
    let modelDB = new ModelDB();
    this.modelDB = modelDB;
  }

  //TODO: generalize this
  init = async (bundleName: string) => {
    await this.modelDB.init();
    let storedModel = await this.modelDB.get_model(bundleName);
    console.log("storedModel", storedModel);

    /*
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
    */
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
