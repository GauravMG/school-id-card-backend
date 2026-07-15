"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeRefreshToken = exports.findActiveRefreshToken = exports.storeRefreshToken = exports.sha256 = void 0;
const crypto_1 = __importDefault(require("crypto"));
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_1 = require("../lib/prisma");
const sha256 = (value) => crypto_1.default.createHash('sha256').update(value).digest('hex');
exports.sha256 = sha256;
const storeRefreshToken = async (userId, rawToken, expiresInDays = 7) => {
    return prisma_1.prisma.refreshToken.create({
        data: {
            userId,
            tokenHash: (0, exports.sha256)(rawToken),
            expiresAt: (0, dayjs_1.default)().add(expiresInDays, 'day').toDate()
        }
    });
};
exports.storeRefreshToken = storeRefreshToken;
const findActiveRefreshToken = async (rawToken) => {
    return prisma_1.prisma.refreshToken.findUnique({
        where: { tokenHash: (0, exports.sha256)(rawToken) },
        include: { user: true }
    });
};
exports.findActiveRefreshToken = findActiveRefreshToken;
const revokeRefreshToken = async (rawToken) => {
    const tokenHash = (0, exports.sha256)(rawToken);
    return prisma_1.prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { status: 'REVOKED' }
    });
};
exports.revokeRefreshToken = revokeRefreshToken;
