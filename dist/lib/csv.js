"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsvText = void 0;
const sync_1 = require("csv-parse/sync");
const parseCsvText = (text) => {
    return (0, sync_1.parse)(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });
};
exports.parseCsvText = parseCsvText;
