"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../lib/jwt");
const ApiError_1 = require("../utils/ApiError");
const requireAuth = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new ApiError_1.ApiError(401, 'Unauthorized'));
    }
    const token = authHeader.split(' ')[1];
    const payload = (0, jwt_1.verifyAccessToken)(token);
    req.user = payload;
    next();
};
exports.requireAuth = requireAuth;
