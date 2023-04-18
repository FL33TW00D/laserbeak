import * as Comlink from "comlink";
import { Remote, wrap } from "comlink";
import ModelDB, { EncoderDecoder, ModelWithKey } from "./modelDB";
import { Session } from "./session";

export const createSession = async (
    proxy: boolean,
    model: ModelWithKey[],
    modelDB: ModelDB
): Promise<Session | Comlink.Remote<Session>> => {
    const session = new Session();
    await session.initEncoderDecoder(model, modelDB);
    return session;
    /*
  if (proxy && typeof document !== 'undefined') {
    const worker = new Worker(new URL('./session.js', import.meta.url), {
      type: 'module',
    });
    const exposedSession = wrap<typeof Session>(worker);
    const session: Remote<Session> = await new exposedSession();
    await session.initEncoderDecoder(model, modelDB);
    return session;
  } else {
    const session = new Session();
    await session.initEncoderDecoder(model, modelDB);
    return session;
  }
  */
};
