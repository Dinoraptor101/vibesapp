/**
 * ImageViewer Component
 *
 * Full-screen image viewer modal with zoom and pan functionality.
 * Used for viewing post images in detail.
 */

import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Dialog, DialogContent } from '@/components/ui-next';

interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

export function ImageViewer({ imageUrl, alt = 'Image', open, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset on open
  useEffect(() => {
    if (open) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, 0.5);
      // Reset position if zooming out to 1x
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, onClose, handleZoomIn, handleZoomOut]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none"
        showClose={false}
      >
        {/* Header with controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Image container */}
        <button
          type="button"
          className="w-full h-full flex items-center justify-center overflow-hidden cursor-move focus:outline-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            draggable={false}
          />
        </button>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-xs text-center bg-black/50 px-4 py-2 rounded-full">
          Scroll or use +/- to zoom • Drag to pan • ESC to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
