"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../styles/globals.css");
const WASMCtx_1 = require("../context/WASMCtx");
const App = ({ Component, pageProps }) => {
    return (<WASMCtx_1.WASMContextProvider>
        <Component {...pageProps}/>
    </WASMCtx_1.WASMContextProvider>);
};
exports.default = App;
