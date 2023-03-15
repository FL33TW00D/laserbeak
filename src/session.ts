import * as pako from 'pako';
import * as Comlink from 'comlink';
import * as rumble from '@rumbl/rumble-wasm';

export class Session {
  rumbleSession: rumble.Session | undefined;

  constructor() {}

  _fetchBytes = async (url: string): Promise<Uint8Array> => {
    const extension = url.split('.').pop();
    let bytes = await fetch(url).then((resp) => resp.arrayBuffer());
    if (extension === 'gz') {
      bytes = pako.inflate(bytes);
    }
    const data = new Uint8Array(bytes);
    return data;
  };

  init = async (modelPath: string) => {
    const [encoderBytes, decoderBytes, configBytes, tokenizerBytes] =
      await Promise.all([
        this._fetchBytes(
          'https://rmbl.us/modified_flan-t5-small_encoder_decoder_init_fp32_sim.onnx.gz'
        ),
        this._fetchBytes(
          'https://rmbl.us/modified_flan-t5-small_decoder_fp32_sim.onnx.gz'
        ),
        this._fetchBytes('resources/flan-t5/small/config.json'),
        this._fetchBytes('resources/flan-t5/small/tokenizer.json'),
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
