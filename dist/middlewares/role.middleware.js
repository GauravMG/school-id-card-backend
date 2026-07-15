"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = void 0;
const ApiError_1 = require("../utils/ApiError");
const allowRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError_1.ApiError(403, 'Forbidden'));
        }
        next();
    };
};
exports.allowRoles = allowRoles;
