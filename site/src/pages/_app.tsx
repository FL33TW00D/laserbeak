import '../styles/globals.css';
import type { AppProps } from 'next/app';
import "react-responsive-modal/styles.css";

const App = ({ Component, pageProps }: AppProps) => {
  return (
      <Component {...pageProps} />
  );
};

export default App;
