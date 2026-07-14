import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, IconButton, Alert, CircularProgress } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckIcon from '@mui/icons-material/Check';
import toast from 'react-hot-toast';

import { removeBackground } from '@imgly/background-removal';
import { getUniformImage } from 'utils/uniforms';

export default function StepCamera({ photo, onCapture, onNext, onBack, uniformBoyUrl,
  uniformGirlUrl,
  gender, studentId,
  schoolId, school }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(photo);
  const [validating, setValidating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [proProcessing, setProProcessing] = useState(false);

  // Adjustment State
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [rawPhoto, setRawPhoto] = useState(null);
  const [adjustScale, setAdjustScale] = useState(1);
  const [adjustPos, setAdjustPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getOverlayUrl = () => {
    if (gender?.toLowerCase() === 'female') {
      if (uniformGirlUrl) return uniformGirlUrl;
      return school?.uniformTypeGirl && school.uniformTypeGirl !== 'none' ? getUniformImage(school.uniformTypeGirl) : '';
    } else {
      if (uniformBoyUrl) return uniformBoyUrl;
      return school?.uniformTypeBoy && school.uniformTypeBoy !== 'none' ? getUniformImage(school.uniformTypeBoy) : '';
    }
  };
  const uniformUrl = getOverlayUrl();

  useEffect(() => {
    let currentStream = null;

    const initCamera = async () => {
      if (!capturedImage && !isAdjusting) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
          });
          currentStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setError('');
        } catch (err) {
          console.error('Error accessing camera:', err);
          setError('Unable to access camera. Please allow camera permissions and try again.');
        }
      }
    };

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage, isAdjusting]);

  const captureRawFrame = (video, canvas) => {
    return new Promise((resolve) => {
      const targetWidth = 250;
      const targetHeight = 320;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      // Just mirror horizontally since camera feed is mirrored
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = targetWidth;
      outputCanvas.height = targetHeight;
      const outputCtx = outputCanvas.getContext('2d');

      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = targetWidth / targetHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (videoRatio > targetRatio) {
        drawHeight = targetHeight;
        drawWidth = drawHeight * videoRatio;
        offsetX = (targetWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = targetWidth;
        drawHeight = drawWidth / videoRatio;
        offsetX = 0;
        offsetY = (targetHeight - drawHeight) / 2;
      }

      // Draw covering the target area cleanly without squeezing
      outputCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, offsetX, offsetY, drawWidth, drawHeight);

      resolve(outputCanvas.toDataURL('image/png', 1));
    });
  };

  // The AI composite + ID card render now runs as a background job on the
  // server (see job-queue.service.ts) instead of blocking this request, so we
  // only need to confirm the upload succeeded — not wait for the final card.
  // The locally-adjusted photo (already set as `capturedImage` by the caller)
  // is used as the preview on the next step; the official card finishes
  // generating on the backend shortly after this request returns.
  const uploadFinalImage = async (dataUrl) => {
    if (!studentId || !schoolId) return;

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const uploadFormData = new FormData();
    uploadFormData.append('photo', blob, `student_${studentId}.png`);

    const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/schools/${schoolId}/students/${studentId}/photo`, {
      method: 'POST',
      body: uploadFormData
    });

    if (!uploadResponse.ok) throw new Error('Photo upload failed');

    toast.success('Photo uploaded successfully!');
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setProcessing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const rawDataUrl = await captureRawFrame(video, canvas);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      let finalRawDataUrl = rawDataUrl;
      try {
        const config = {
          publicPath: 'https://unpkg.com/@imgly/background-removal@1.7.0/dist/',
          debug: false,
          model: 'small',
          fetchArgs: { mode: 'cors' }
        };
        const responseUrl = await fetch(rawDataUrl);
        const imageBlob = await responseUrl.blob();
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000));
        const bgRemovedBlob = await Promise.race([removeBackground(imageBlob, config), timeoutPromise]);
        
        finalRawDataUrl = await new Promise(r => {
           const reader = new FileReader();
           reader.onload = e => r(e.target.result);
           reader.readAsDataURL(bgRemovedBlob);
        });
        toast.success('Background removed! Now please adjust your photo.');
      } catch (err) {
        console.error('AI BG removal failed:', err);
        toast.error('AI Background Removal unavailable. You can still adjust your photo manually.');
      }

      setRawPhoto(finalRawDataUrl);
      setIsAdjusting(true);
      setAdjustScale(1);
      setAdjustPos({ x: 0, y: 0 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to process photo');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmAdjustment = () => {
    setProcessing(true);
    const ovalWidth = 250;
    const ovalHeight = 320;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = ovalWidth;
    outputCanvas.height = ovalHeight;
    const outputCtx = outputCanvas.getContext('2d');

    outputCtx.clearRect(0, 0, ovalWidth, ovalHeight);

    outputCtx.fillStyle = '#ffffff';
    outputCtx.fillRect(0, 0, ovalWidth, ovalHeight);

    const img = new Image();
    img.onload = async () => {
      outputCtx.translate(ovalWidth / 2, ovalHeight / 2);
      outputCtx.translate(adjustPos.x, adjustPos.y);
      outputCtx.scale(adjustScale, adjustScale);
      outputCtx.translate(-ovalWidth / 2, -ovalHeight / 2);

      outputCtx.drawImage(img, 0, 0, ovalWidth, ovalHeight);

      // Restore transform before drawing uniform
      outputCtx.setTransform(1, 0, 0, 1, 0, 0);

      // Capture face-only BEFORE the uniform is drawn — backend composites the uniform itself
      const faceOnlyDataUrl = outputCanvas.toDataURL('image/png', 1);

      const processFinalAndUpload = async (displayDataUrl) => {
        setCapturedImage(displayDataUrl);
        onCapture(displayDataUrl);
        setIsAdjusting(false);
        try {
          await uploadFinalImage(faceOnlyDataUrl);
          onNext();
        } catch (err) {
          console.error(err);
          toast.error('Failed to upload photo');
        }
        setProcessing(false);
      };

      if (uniformUrl) {
        const uniformImg = new Image();
        uniformImg.crossOrigin = "anonymous";
        uniformImg.onload = () => {
          const uWidth = ovalWidth * 1.6666;
          const uHeight = ovalHeight * 1.9047;
          const uX = -ovalWidth * 0.3333;
          const uY = -ovalHeight * 0.1666;
          outputCtx.drawImage(uniformImg, uX, uY, uWidth, uHeight);
          processFinalAndUpload(outputCanvas.toDataURL('image/png', 1));
        };
        uniformImg.onerror = () => {
          console.error("Failed to load uniform for composition");
          processFinalAndUpload(faceOnlyDataUrl);
        };
        uniformImg.src = uniformUrl;
      } else {
        processFinalAndUpload(faceOnlyDataUrl);
      }
    };
    img.src = rawPhoto;
  };

  const handleRetake = () => {
    setIsAdjusting(false);
    setRawPhoto(null);
    setCapturedImage(null);
    onCapture(null);
    setError('');
  };

  const removeBackgroundCanvas = (imageUrl) => {
    return new Promise((resolve) => {
      // const img = new Image();
      // img.crossOrigin = 'anonymous';
      const img = new Image();

      localStorage.setItem(
        'final_student_photo',
        cacheBustedUrl
      );

      setCapturedImage(cacheBustedUrl);

      onCapture(cacheBustedUrl);

      toast.success(
        'Background removed & uniform adjusted'
      );

      img.onerror = () => {
        resolve(imageUrl);
      };

      img.src = imageUrl;
    });
  };

  // const removeBackgroundCanvas = (imageUrl) => {
  //   return new Promise((resolve) => {
  //     const img = new Image();
  //     img.crossOrigin = 'anonymous';
  //     img.onload = () => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = img.width;
  //       canvas.height = img.height;
  //       const ctx = canvas.getContext('2d');

  //       ctx.drawImage(img, 0, 0);
  //       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  //       const data = imageData.data;
  //       const width = canvas.width;
  //       const height = canvas.height;

  //       // Sample background from all 4 corners for better accuracy
  //       const cornerSamples = [
  //         [data[0], data[1], data[2]], // TL
  //         [data[(width - 1) * 4], data[(width - 1) * 4 + 1], data[(width - 1) * 4 + 2]], // TR
  //         [data[data.length - 4], data[data.length - 3], data[data.length - 2]], // BR
  //         [data[(height - 1) * width * 4], data[(height - 1) * width * 4 + 1], data[(height - 1) * width * 4 + 2]] // BL
  //       ];

  //       const bgR = cornerSamples.reduce((acc, s) => acc + s[0], 0) / 4;
  //       const bgG = cornerSamples.reduce((acc, s) => acc + s[1], 0) / 4;
  //       const bgB = cornerSamples.reduce((acc, s) => acc + s[2], 0) / 4;

  //       ctx.fillStyle = '#ffffff';
  //       ctx.fillRect(0, 0, width, height);

  //       const centerX = width / 2;
  //       const centerY = height / 2;
  //       const safeZoneRadius = width * 0.35; // Don't remove anything in this central radius

  //       for (let i = 0; i < data.length; i += 4) {
  //         const x = (i / 4) % width;
  //         const y = Math.floor((i / 4) / width);

  //         const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

  //         const r = data[i];
  //         const g = data[i + 1];
  //         const b = data[i + 2];

  //         const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);

  //         // Protection logic:
  //         // 1. If inside safe zone (middle of face), NEVER remove.
  //         // 2. If outside, remove if color matches background.
  //         if (distFromCenter > safeZoneRadius) {
  //           const edgeTolerance = distFromCenter > (width * 0.45) ? 70 : 40;
  //           if (diff < edgeTolerance) {
  //             data[i + 3] = 0;
  //           }
  //         }
  //       }

  //       ctx.putImageData(imageData, 0, 0);
  //       resolve(canvas.toDataURL('image/jpeg', 0.95));
  //     };
  //     img.src = imageUrl;
  //   });
  // };

  return (
    <Box>
      <Typography variant="h5" color="primary" gutterBottom align="center">
        Capture Your Photo
      </Typography>

      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
          <strong>Note:</strong> Align ONLY your face within the frame. Do not include shoulders. Stand against a plain background.
        </Typography>
      </Box>

      {error && <Alert severity="info" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 400,
            height: 400,
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: capturedImage || isAdjusting ? '#f5f5f5' : '#000'
          }}
        >
          
          {(processing || proProcessing) && (
            <Box sx={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CircularProgress size={60} thickness={4} />
              <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
                {proProcessing ? 'Pro AI Removing Background...' : 'Processing...'}
              </Typography>
            </Box>
          )}

          {isAdjusting ? (
            <Box
              sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Box
                sx={{ width: 250, height: 320, position: 'relative', cursor: isDragging ? 'grabbing' : 'grab', overflow: 'hidden', borderRadius: '16px' }}
                onMouseDown={e => { setIsDragging(true); setDragStart({ x: e.clientX - adjustPos.x, y: e.clientY - adjustPos.y }) }}
                onMouseMove={e => { if (isDragging) setAdjustPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }) }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onWheel={e => {
                  e.preventDefault();
                  const scaleAdjust = e.deltaY * -0.001;
                  setAdjustScale(prev => Math.min(Math.max(0.5, prev + scaleAdjust), 3));
                }}
              >
                <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', position: 'absolute', bgcolor: '#fff' }}>
                  <img 
                    src={rawPhoto} 
                    alt="Adjust" 
                    draggable={false}
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      transform: `translate(${adjustPos.x}px, ${adjustPos.y}px) scale(${adjustScale})`,
                      transformOrigin: 'center center',
                    }}
                  />
                </Box>
                <img 
                  src={uniformUrl} 
                  alt="Uniform" 
                  draggable={false}
                  style={{
                    position: 'absolute',
                    width: '166.66%', height: '190.47%',
                    left: '-33.33%', top: '-16.66%',
                    pointerEvents: 'none'
                  }}
                />
              </Box>
            </Box>
          ) : capturedImage ? (
            <Box
              sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Box
                sx={{
                  width: 250,
                  height: 320,
                  borderRadius: '50%', // Oval shape
                  overflow: 'hidden',
                  border: '3px solid #1976d2',
                  boxShadow: 3,
                  bgcolor: '#ffffff'
                }}
              >

                  <img
                    src={capturedImage}
                    alt="Captured"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      background: '#fff'
                    }}
                  />
              </Box>
            </Box>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectPosition: 'center top', background: '#fff' }}
              />
              {/* Face Guide Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)' // Dim the outside
                }}
              >
                <Box
                  sx={{
                    width: 250,
                    height: 320,
                    border: '3px dashed rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%', // Oval shape
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    position: 'relative'
                  }}
                >
                </Box>
              </Box>
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>
      </Box>

      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 4 }}>
        {isAdjusting ? (
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<ReplayIcon />}
            onClick={handleRetake}
            disabled={processing}
          >
            Retake Photo
          </Button>
        ) : !capturedImage ? (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<PhotoCameraIcon />}
            onClick={handleCapture}
            disabled={!stream || validating || processing || proProcessing}
          >
            {proProcessing ? 'Using Pro AI...' : processing ? 'Processing AI...' : validating ? 'Validating...' : 'Capture Photo'}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<ReplayIcon />}
            onClick={handleRetake}
            disabled={processing}
          >
            Retake Photo
          </Button>
        )}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} disabled={processing}>Back</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (isAdjusting) {
              handleConfirmAdjustment();
            } else {
              onNext();
            }
          }}
          disabled={(!isAdjusting && !capturedImage) || processing}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}
