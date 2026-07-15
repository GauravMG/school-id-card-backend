"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const ApiError_1 = require("../utils/ApiError");
const errorMiddleware = (err, _req, res, _next) => {
    const statusCode = err instanceof ApiError_1.ApiError ? err.statusCode : 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({
        success: false,
        message,
        details: err instanceof ApiError_1.ApiError ? err.details : undefined
    });
};
exports.errorMiddleware = errorMiddleware;
