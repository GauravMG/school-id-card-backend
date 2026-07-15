"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCardsPdf = exports.renderSingleCardHtml = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const template_renderer_1 = require("./template-renderer");
const puppeteer_1 = require("../lib/puppeteer");
const file_1 = require("../utils/file");
(0, file_1.ensureDir)('uploads/exports');
const renderSingleCardHtml = async (templateId, payload) => {
    const render = await (0, template_renderer_1.getTemplateRenderer)(templateId);
    return render(payload);
};
exports.renderSingleCardHtml = renderSingleCardHtml;
const renderCardsPdf = async (html, format) => {
    const fileName = `export-${Date.now()}.pdf`;
    const outputPath = path_1.default.join('uploads/exports', fileName);
    await (0, puppeteer_1.generatePdfFromHtml)(html, format, outputPath);
    return {
        path: outputPath,
        publicUrl: `/${outputPath.replace(/\\/g, '/')}`,
        fileName,
        size: fs_1.default.statSync(outputPath).size
    };
};
exports.renderCardsPdf = renderCardsPdf;
