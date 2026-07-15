"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderExportPageHtml = void 0;
const renderExportPageHtml = (cardsHtml, columns) => `
<!doctype html>
<html>
<head>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    .grid {
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: 12px;
      padding: 10px;
    }
    .card-wrap {
      break-inside: avoid;
    }
    iframe, .card-html {
      width: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <div class="grid">
    ${cardsHtml.map((html) => `<div class="card-wrap">${html}</div>`).join('')}
  </div>
</body>
</html>
`;
exports.renderExportPageHtml = renderExportPageHtml;
