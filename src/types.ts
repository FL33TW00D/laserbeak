import { Session } from "inspector";
import * as Comlink from "comlink";

export type InferenceSession = Session | Comlink.Remote<Session>;
