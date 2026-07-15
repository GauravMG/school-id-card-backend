"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiResponse = void 0;
const apiResponse = (message, data) => ({
    success: true,
    message,
    data
});
exports.apiResponse = apiResponse;
