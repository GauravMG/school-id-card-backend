import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  Stack,
  IconButton
} from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';

// Standard "read image, crop it on a canvas, rotate it, export as blob" recipe.
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImageBlob(imageSrc, croppedAreaPixels, rotation) {
  const image = await createImage(imageSrc);
  const rotRad = getRadianAngle(rotation);

  // Canvas large enough to hold the rotated source image without clipping
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));
  const rotatedWidth = image.width * cos + image.height * sin;
  const rotatedHeight = image.width * sin + image.height * cos;

  const rotateCanvas = document.createElement('canvas');
  rotateCanvas.width = rotatedWidth;
  rotateCanvas.height = rotatedHeight;
  const rotateCtx = rotateCanvas.getContext('2d');
  rotateCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
  rotateCtx.rotate(rotRad);
  rotateCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = croppedAreaPixels.width;
  outputCanvas.height = croppedAreaPixels.height;
  const outputCtx = outputCanvas.getContext('2d');
  outputCtx.drawImage(
    rotateCanvas,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    outputCanvas.toBlob((blob) => resolve(blob), 'image/png', 1);
  });
}

/**
 * Reusable crop/rotate/zoom/reposition dialog. Give it an image source (File,
 * Blob, or URL) and an aspect ratio; it returns a cropped PNG Blob via onSave
 * that the caller uploads through whichever endpoint it already uses — no
 * backend changes are needed for this adjustment step itself.
 */
export default function ImageAdjustDialog({ open, onClose, imageSrc, aspect, title = 'Adjust Image', onSave }) {
  const [resolvedSrc, setResolvedSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !imageSrc) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);

    if (typeof imageSrc === 'string') {
      setResolvedSrc(imageSrc);
    } else {
      const url = URL.createObjectURL(imageSrc);
      setResolvedSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!resolvedSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(resolvedSrc, croppedAreaPixels, rotation);
      onSave(blob);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: 360, bgcolor: '#333', borderRadius: 1, overflow: 'hidden' }}>
          {resolvedSrc && (
            <Cropper
              image={resolvedSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          )}
        </Box>

        <Stack spacing={2} sx={{ mt: 3 }}>
          <Box>
            <Typography variant="body2" gutterBottom>Zoom</Typography>
            <Slider min={1} max={4} step={0.05} value={zoom} onChange={(_, v) => setZoom(v)} />
          </Box>

          <Box>
            <Typography variant="body2" gutterBottom>Rotate</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={() => setRotation((r) => r - 90)} size="small">
                <RotateLeftIcon />
              </IconButton>
              <Slider min={-180} max={180} step={1} value={rotation} onChange={(_, v) => setRotation(v)} sx={{ flex: 1 }} />
              <IconButton onClick={() => setRotation((r) => r + 90)} size="small">
                <RotateRightIcon />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !croppedAreaPixels}>
          {saving ? 'Saving...' : 'Apply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
