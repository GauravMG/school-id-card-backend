"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const not_found_middleware_1 = require("./middlewares/not-found.middleware");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
exports.app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true
}));
exports.app.use((0, compression_1.default)());
exports.app.use((0, morgan_1.default)('dev'));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use('/uploads', express_1.default.static(path_1.default.resolve('uploads')));
exports.app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Server is healthy' });
});
exports.app.use('/api', routes_1.default);
exports.app.use(not_found_middleware_1.notFoundMiddleware);
exports.app.use(error_middleware_1.errorMiddleware);
