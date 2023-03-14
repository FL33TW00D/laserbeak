"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMountEffectOnce = void 0;
const react_1 = require("react");
const useMountEffectOnce = (fn) => {
    const wasExecutedRef = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        if (!wasExecutedRef.current) {
            fn();
        }
        wasExecutedRef.current = true;
    }, [fn]);
};
exports.useMountEffectOnce = useMountEffectOnce;
