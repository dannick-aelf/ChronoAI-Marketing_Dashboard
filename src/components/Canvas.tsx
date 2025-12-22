import { useRef, useEffect, useState } from 'react';
import CanvasEditor, { type CanvasObject } from './CanvasEditor';
import ImageUploadModal from './ImageUploadModal';
import TextEditorModal from './TextEditorModal';
import PresentationCarousel from './PresentationCarousel';

type AspectRatio = '4:5' | '9:16';

interface CanvasProps {
  aspectRatio: AspectRatio;
  canvasId: string;
  objects: CanvasObject[];
  allCategoryObjects: CanvasObject[];
  onObjectsChange: (objects: CanvasObject[]) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

// Canvas dimensions
const canvasSizes = {
  '4:5': { width: 1080, height: 1350 },
  '9:16': { width: 1080, height: 1920 },
} as const;

const Canvas = ({ aspectRatio, canvasId, objects, allCategoryObjects, onObjectsChange, onDelete, canDelete }: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);

  const { width: actualWidth, height: actualHeight } = canvasSizes[aspectRatio];

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      // Wait for canvas element to be rendered and sized by CSS
      if (!canvasRef.current) return;

      // Get the actual rendered dimensions from the canvas element
      // CSS aspect-ratio will have already calculated the height based on width
      const renderedWidth = canvasRef.current.clientWidth || canvasRef.current.offsetWidth;
      const renderedHeight = canvasRef.current.clientHeight || canvasRef.current.offsetHeight;

      if (renderedWidth > 0 && renderedHeight > 0) {
        // Use the actual rendered size
        setDimensions({ width: renderedWidth, height: renderedHeight });
      } else if (wrapperRef.current) {
        // Fallback: calculate from wrapper width
        const containerWidth = wrapperRef.current.clientWidth;
        if (containerWidth > 0) {
          const aspectRatioValue = actualWidth / actualHeight;
          const displayWidth = containerWidth;
          const displayHeight = displayWidth / aspectRatioValue;
          setDimensions({ width: displayWidth, height: displayHeight });
        }
      }
    };

    // Initial calculation - use multiple RAFs to ensure CSS has applied
    let rafId1 = requestAnimationFrame(() => {
      let rafId2 = requestAnimationFrame(() => {
        updateDimensions();
      });
      return () => cancelAnimationFrame(rafId2);
    });
    
    // Watch for resize events
    const handleResize = () => {
      requestAnimationFrame(updateDimensions);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver to watch for canvas size changes (most reliable)
    let resizeObserver: ResizeObserver | null = null;
    if (canvasRef.current) {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDimensions);
      });
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId1);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [aspectRatio, actualWidth, actualHeight]);

  const scale = dimensions.width > 0 ? dimensions.width / actualWidth : 0;

  const handleAddMedia = (url: string, type: 'image' | 'video') => {
    // Calculate dimensions to fill the entire canvas
    const newObject: CanvasObject = {
      id: `${type}-${Date.now()}`,
      type,
      x: 0,
      y: 0,
      width: actualWidth,
      height: actualHeight,
      content: url,
    };
    onObjectsChange([...objects, newObject]);
  };

  const handleAddText = (text: string, fontSize: number, color: string, fontFamily: string) => {
    const newObject: CanvasObject = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: fontSize * 1.5,
      content: text,
      fontSize,
      color,
      fontFamily,
    };
    onObjectsChange([...objects, newObject]);
  };

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ minHeight: '1px' }}>
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="bg-grey-bg-2 border-2 border-border rounded-lg shadow-elevated relative overflow-hidden w-full"
        style={{
          aspectRatio: `${actualWidth} / ${actualHeight}`,
          minWidth: '320px',
          width: '100%',
        }}
      >
        {/* Delete Canvas Button */}
        {canDelete && (
          <button
            onClick={() => onDelete(canvasId)}
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-grey-bg-4 hover:bg-white-40 text-white flex items-center justify-center transition-all duration-200 active:opacity-80 active:scale-[0.95] shadow-lg z-30"
            aria-label="Delete canvas"
            style={{
              minWidth: '40px',
              minHeight: '40px',
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Canvas Editor */}
        {dimensions.width > 0 && scale > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            <CanvasEditor
              width={actualWidth}
              height={actualHeight}
              scale={scale}
              objects={objects}
              onObjectsChange={onObjectsChange}
              onAddImage={() => setShowMediaModal(true)}
              onAddText={() => setShowTextModal(true)}
              onPresent={() => setShowPresentation(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-grey-bg-3 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p className="text-text-secondary text-sm mb-1 font-secondary">Loading Canvas</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ImageUploadModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onConfirm={handleAddMedia}
        initialMediaUrl={objects.find(obj => obj.type === 'image' || obj.type === 'video')?.content}
        initialMediaType={objects.find(obj => obj.type === 'image' || obj.type === 'video')?.type as 'image' | 'video' | undefined}
      />
      <TextEditorModal
        key={showTextModal ? 'open' : 'closed'}
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
        onConfirm={handleAddText}
      />
      <PresentationCarousel
        key={showPresentation ? 'open' : 'closed'}
        isOpen={showPresentation}
        onClose={() => setShowPresentation(false)}
        objects={allCategoryObjects}
        initialCanvasId={canvasId}
      />

    </div>
  );
};

export default Canvas;

