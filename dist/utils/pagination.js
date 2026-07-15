"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = void 0;
const getPagination = (page, limit) => {
    const currentPage = Math.max(Number(page || 1), 1);
    const perPage = Math.min(Math.max(Number(limit || 20), 1), 100);
    return {
        skip: (currentPage - 1) * perPage,
        take: perPage,
        page: currentPage,
        limit: perPage
    };
};
exports.getPagination = getPagination;
