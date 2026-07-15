"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareValue = exports.hashValue = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashValue = (value) => bcrypt_1.default.hash(value, 10);
exports.hashValue = hashValue;
const compareValue = (value, hash) => bcrypt_1.default.compare(value, hash);
exports.compareValue = compareValue;
