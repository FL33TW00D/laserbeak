import * as Comlink from 'comlink';
import { Remote, wrap } from 'comlink';
import { EncoderDecoder } from './modelDB';
import { Session } from './session';

export const createSession = async (
  proxy: boolean,
  model: EncoderDecoder,
): Promise<Session | Comlink.Remote<Session>> => {
  if (proxy && typeof document !== 'undefined') {
    const worker = new Worker(new URL('./session.js', import.meta.url), {
      type: 'module',
    });
    const exposedSession = wrap<typeof Session>(worker);
    const session: Remote<Session> = await new exposedSession();
    await session.init(model);
    return session;
  } else {
    const session = new Session();
    await session.init(model);
    return session;
  }
};
