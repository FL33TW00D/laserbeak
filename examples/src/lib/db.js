"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demo = void 0;
const idb_1 = require("idb");
function demo() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield (0, idb_1.openDB)('model-db', 1, {
            upgrade(db) {
                db.createObjectStore('favourite-number');
                const productStore = db.createObjectStore('products', {
                    keyPath: 'productCode',
                });
                productStore.createIndex('by-price', 'price');
            },
        });
        // This works
        yield db.put('favourite-number', 7, 'Jen');
        console.log(yield db.get('favourite-number', 'Jen'));
    });
}
exports.demo = demo;
