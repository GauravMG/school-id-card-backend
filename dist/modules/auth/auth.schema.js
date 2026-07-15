"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAsSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6)
    })
});
exports.loginAsSchema = zod_1.z.object({
    body: zod_1.z.object({
        schoolId: zod_1.z.string().min(1)
    })
});
