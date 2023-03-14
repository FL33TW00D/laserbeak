import type { WASM } from "../types";
import { useState, createContext } from "react";
import type { ReactNode } from "react";
import { useMountEffectOnce } from "../hooks/useMountEffectOnce";
import * as wasm from "@rumbl/rumble-wasm";

const initial: IWASMContext = {};

export const WASMContext = createContext(initial);

export const WASMContextProvider: React.FC<WASMContextProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<IWASMContext>(initial);

  // This has to run only once: https://github.com/rustwasm/wasm-bindgen/issues/3153
  // Though, in development React renders twice when Strict Mode is enabled: https://reactjs.org/docs/strict-mode.html
  // That's why it must be limited to a single mount run
  useMountEffectOnce(() => {
    (async () => {
      await wasm.default();
      setState({ wasm });
    })();
  });

  return <WASMContext.Provider value={state}>{children}</WASMContext.Provider>;
};

interface IWASMContext {
  wasm?: WASM;
}

interface WASMContextProviderProps {
  children: ReactNode;
}
