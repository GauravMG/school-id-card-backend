"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPdfLayout = void 0;
const constants_1 = require("../config/constants");
const getPdfLayout = (size) => constants_1.PDF_LAYOUTS[size];
exports.getPdfLayout = getPdfLayout;
