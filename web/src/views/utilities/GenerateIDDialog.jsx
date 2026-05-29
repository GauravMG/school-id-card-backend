import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  Stack, Typography, Box, CircularProgress, LinearProgress, Divider, Chip
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { jsPDF } from 'jspdf';
import { useGetActiveExportSettingsQuery } from 'store/api/exportSettingApi';

const PAGE_DIMENSIONS = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
};

const DEFAULT_LAYOUTS = {
  A4: { width: 210, height: 297, cols: 2, rows: 2, cardsPerPage: 4 },
  A3: { width: 297, height: 420, cols: 2, rows: 3, cardsPerPage: 6 },
};

const MARGIN = 10;
const GAP = 5;

function buildLayouts(settings) {
  if (!settings || settings.length === 0) return DEFAULT_LAYOUTS;
  const layouts = {};
  settings.forEach((s) => {
    const dims = PAGE_DIMENSIONS[s.pageSize];
    if (!dims) return;
    const cols = 2;
    const rows = Math.ceil(s.cardsPerPage / cols);
    layouts[s.pageSize] = { ...dims, cols, rows, cardsPerPage: s.cardsPerPage };
  });
  return Object.keys(layouts).length > 0 ? layouts : DEFAULT_LAYOUTS;
}

export default function GenerateIDDialog({ open, onClose, students, school }) {
  const { data: settingsResponse } = useGetActiveExportSettingsQuery();
  const activeSettings = settingsResponse?.data || [];
  const LAYOUTS = buildLayouts(activeSettings);

  const [paperSize, setPaperSize] = useState('A4');
  const [action, setAction] = useState('download');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset paper size if the current one isn't in the fetched layouts
  React.useEffect(() => {
    if (!LAYOUTS[paperSize]) {
      const first = Object.keys(LAYOUTS)[0];
      if (first) setPaperSize(first);
    }
  }, [LAYOUTS, paperSize]);

  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  const getCardUrl = (student) => {
    if (student.generatedCardFile?.publicUrl) return `${apiBase}${student.generatedCardFile.publicUrl}`;
    return null;
  };

  const fetchAsBase64 = async (url) => {
    const res = await fetch(`${url}?t=${Date.now()}`);
    if (!res.ok) throw new Error('Failed to fetch image');
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getImageNaturalSize = (b64) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = b64;
    });

  // Scale imgW×imgH to fit inside cellW×cellH, maintaining aspect ratio (contain)
  const containDimensions = (imgW, imgH, cellW, cellH) => {
    const imgAspect = imgW / imgH;
    const cellAspect = cellW / cellH;
    if (imgAspect > cellAspect) {
      const w = cellW;
      const h = cellW / imgAspect;
      return { w, h, offsetX: 0, offsetY: (cellH - h) / 2 };
    } else {
      const h = cellH;
      const w = cellH * imgAspect;
      return { w, h, offsetX: (cellW - w) / 2, offsetY: 0 };
    }
  };

  const handleExport = async () => {
    setIsGenerating(true);
    setProgress(0);

    const layout = LAYOUTS[paperSize];
    const { width, height, cols, rows, cardsPerPage } = layout;
    const cellW = (width - MARGIN * 2 - GAP * (cols - 1)) / cols;
    const cellH = (height - MARGIN * 2 - GAP * (rows - 1)) / rows;

    if (action === 'print') {
      const pageStyle = `
        @page { size: ${paperSize} portrait; margin: ${MARGIN}mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: sans-serif; }
        .grid {
          display: grid;
          grid-template-columns: repeat(${cols}, 1fr);
          gap: ${GAP}mm;
        }
        .cell {
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${cellH}mm;
        }
        .cell img {
          max-width: 100%;
          max-height: ${cellH}mm;
          object-fit: contain;
          display: block;
        }
      `;

      let imgTags = '';
      for (let i = 0; i < students.length; i++) {
        const url = getCardUrl(students[i]);
        if (url) {
          try {
            const b64 = await fetchAsBase64(url);
            imgTags += `<div class="cell"><img src="${b64}" /></div>`;
          } catch {
            imgTags += `<div class="cell" style="background:#f0f0f0;padding:8px;text-align:center;">${students[i].firstName} ${students[i].lastName}</div>`;
          }
        }
        setProgress(Math.round(((i + 1) / students.length) * 80));
      }

      const printWin = window.open('', '_blank');
      printWin.document.write(
        `<!DOCTYPE html><html><head><style>${pageStyle}</style></head><body><div class="grid">${imgTags}</div></body></html>`
      );
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        setProgress(100);
        setIsGenerating(false);
      }, 600);
      return;
    }

    // Download PDF
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: paperSize.toLowerCase() });

    try {
      for (let i = 0; i < students.length; i++) {
        const posInPage = i % cardsPerPage;
        if (posInPage === 0 && i !== 0) pdf.addPage();

        const col = posInPage % cols;
        const row = Math.floor(posInPage / cols);
        const cellX = MARGIN + col * (cellW + GAP);
        const cellY = MARGIN + row * (cellH + GAP);

        const url = getCardUrl(students[i]);
        if (url) {
          try {
            const imgData = await fetchAsBase64(url);
            const { w: natW, h: natH } = await getImageNaturalSize(imgData);
            const { w, h, offsetX, offsetY } = containDimensions(natW, natH, cellW, cellH);
            pdf.addImage(imgData, 'PNG', cellX + offsetX, cellY + offsetY, w, h);
          } catch {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(cellX, cellY, cellW, cellH, 'F');
            pdf.setFontSize(8);
            pdf.text(`${students[i].firstName} ${students[i].lastName}`, cellX + 2, cellY + cellH / 2);
          }
        }

        setProgress(Math.round(((i + 1) / students.length) * 100));
      }

      pdf.save(`ID_Cards_${(school?.name || 'Students').replace(/\s+/g, '_')}_${paperSize}.pdf`);
      setTimeout(() => onClose(), 800);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onClose={isGenerating ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Export ID Cards</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
          {students.length} student{students.length !== 1 ? 's' : ''} selected
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1 }}>Sheet Size</FormLabel>
              <RadioGroup value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
                {Object.entries(LAYOUTS).map(([key, val]) => (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>{key}</span>
                        <Chip
                          label={`${val.cardsPerPage} cards / page`}
                          size="small"
                          color={paperSize === key ? 'primary' : 'default'}
                        />
                      </Stack>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider />

          <Box>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1 }}>Action</FormLabel>
              <RadioGroup value={action} onChange={(e) => setAction(e.target.value)}>
                <FormControlLabel value="download" control={<Radio />} label="Download as PDF" />
                <FormControlLabel value="print" control={<Radio />} label="Print" />
              </RadioGroup>
            </FormControl>
          </Box>

          {isGenerating && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom fontWeight={700}>
                  {action === 'print' ? `Preparing... ${progress}%` : `Generating PDF: ${progress}%`}
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
        <Button onClick={onClose} disabled={isGenerating} sx={{ fontWeight: 700 }}>Cancel</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          size="large"
          disabled={isGenerating || students.length === 0}
          startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : action === 'print' ? <PrintIcon /> : <DownloadIcon />}
          sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
        >
          {isGenerating
            ? action === 'print' ? 'Preparing...' : 'Generating...'
            : action === 'print' ? 'Print' : 'Download PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
