import "../styles/globals.css";
import type { AppProps } from 'next/app';
import { WASMContextProvider } from '../context/WASMCtx';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <WASMContextProvider>
        <Component {...pageProps} />
    </WASMContextProvider>
  )
}

export default App
