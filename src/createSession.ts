import * as Comlink from 'comlink';
import { Remote, wrap } from 'comlink';
import { Session } from './session';

export const createSession = async (
  modelPath: string,
  proxy: boolean
): Promise<Session | Comlink.Remote<Session>> => {
  if (proxy && typeof document !== 'undefined') {
    const worker = new Worker(new URL('./session.js', import.meta.url), {
      type: 'module',
    });
    const exposedSession = wrap<typeof Session>(worker);
    const session: Remote<Session> = await new exposedSession();
    await session.init(modelPath);
    return session;
  } else {
    const session = new Session();
    await session.init(modelPath);
    return session;
  }
};
