export const renderExportPageHtml = (cardsHtml: string[], columns: number, showCropMarks = false) => `
<!doctype html>
<html>
<head>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    .grid {
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${showCropMarks ? '20px' : '12px'};
      padding: 10px;
    }
    .card-wrap {
      break-inside: avoid;
      position: relative;
    }
    iframe, .card-html {
      width: 100%;
      border: none;
    }
    ${showCropMarks ? `
    /* Corner crop marks — printed just outside each card to guide manual cutting on Epson-printed sheets */
    .crop-mark { position: absolute; width: 8px; height: 8px; border-color: #000; border-style: solid; }
    .crop-tl { top: -9px; left: -9px; border-width: 1px 0 0 1px; }
    .crop-tr { top: -9px; right: -9px; border-width: 1px 1px 0 0; }
    .crop-bl { bottom: -9px; left: -9px; border-width: 0 0 1px 1px; }
    .crop-br { bottom: -9px; right: -9px; border-width: 0 1px 1px 0; }
    ` : ''}
  </style>
</head>
<body>
  <div class="grid">
    ${cardsHtml
        .map(
            (html) => `<div class="card-wrap">${html}${
                showCropMarks
                    ? '<span class="crop-mark crop-tl"></span><span class="crop-mark crop-tr"></span><span class="crop-mark crop-bl"></span><span class="crop-mark crop-br"></span>'
                    : ''
            }</div>`
        )
        .join('')}
  </div>
</body>
</html>
`;
