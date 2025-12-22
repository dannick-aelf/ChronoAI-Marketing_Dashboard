import { useRef, useEffect, useState } from 'react';
import CanvasEditor, { type CanvasObject } from './CanvasEditor';
import ImageUploadModal from './ImageUploadModal';
import PresentationCarousel from './PresentationCarousel';

type AspectRatio = '4:5' | '9:16';

export interface CanvasMediaGroup {
  canvasId: string;
  mediaObjects: CanvasObject[];
}

interface CanvasProps {
  aspectRatio: AspectRatio;
  canvasId: string;
  objects: CanvasObject[];
  allCategoryObjects: CanvasObject[];
  canvasGroups?: CanvasMediaGroup[];
  onObjectsChange: (objects: CanvasObject[]) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  totalCanvases?: number;
  isSelected?: boolean;
  onToggleSelection?: (canvasId: string) => void;
  selectionMode?: boolean;
}

// Canvas dimensions
const canvasSizes = {
  '4:5': { width: 1080, height: 1350 },
  '9:16': { width: 1080, height: 1920 },
} as const;

const Canvas = ({ aspectRatio, canvasId, objects, allCategoryObjects, canvasGroups, onObjectsChange, onDelete, canDelete, totalCanvases, isSelected, onToggleSelection, selectionMode }: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);

  const handleObjectsChangeWithTracking = (newObjects: CanvasObject[]) => {
    onObjectsChange(newObjects);
  };

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

  const handleAddMedia = (url: string, type: 'image' | 'video', tags?: string[], comments?: string) => {
    // Always create a new media object to allow multiple images per canvas
    const newObject: CanvasObject = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: 0,
      y: 0,
      width: actualWidth,
      height: actualHeight,
      content: url,
      dateUploaded: new Date().toISOString(),
      aspectRatio: aspectRatio,
      tags: tags,
      comments: comments,
    };
    onObjectsChange([...objects, newObject]);
  };


  return (
    <div ref={wrapperRef} className="relative w-full" style={{ minHeight: '1px' }}>
      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`bg-grey-bg-2 shadow-elevated relative overflow-hidden w-full group transition-all duration-200 box-border ${
          isSelected ? 'border-selected bg-selected border-[5px]' : 'border-2 border-border'
        }`}
        style={{
          aspectRatio: `${actualWidth} / ${actualHeight}`,
          minWidth: '320px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Delete Canvas Button */}
        {canDelete && (
          <button
            onClick={() => onDelete(canvasId)}
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-button-bg text-button-text flex items-center justify-center transition-all duration-200 active:opacity-80 active:scale-[0.95] shadow-lg z-30 opacity-0 group-hover:opacity-100"
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
          <div 
            className="absolute w-full h-full" 
            style={{ 
              top: isSelected ? '-5px' : '-2px',
              left: isSelected ? '-5px' : '-2px',
              right: isSelected ? '-5px' : '-2px',
              bottom: isSelected ? '-5px' : '-2px',
              width: isSelected ? 'calc(100% + 10px)' : 'calc(100% + 4px)',
              height: isSelected ? 'calc(100% + 10px)' : 'calc(100% + 4px)',
              margin: 0,
              padding: 0,
            }}
          >
              <CanvasEditor
                width={actualWidth}
                height={actualHeight}
                scale={scale}
                objects={objects}
                onObjectsChange={handleObjectsChangeWithTracking}
                onAddImage={() => setShowMediaModal(true)}
                onPresent={() => setShowPresentation(true)}
                aspectRatio={aspectRatio}
                isSelected={isSelected}
                onToggleSelection={onToggleSelection ? () => onToggleSelection(canvasId) : undefined}
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
        onConfirmMultiple={(files) => {
          // Replace all existing media objects with the new files
          const nonMediaObjects = objects.filter(obj => obj.type !== 'image' && obj.type !== 'video');
          const newMediaObjects = files.map((file, index) => {
            const { width: actualWidth, height: actualHeight } = canvasSizes[aspectRatio];
            return {
              id: `${file.type}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
              type: file.type,
              x: 0,
              y: 0,
              width: actualWidth,
              height: actualHeight,
              content: file.url,
              dateUploaded: new Date().toISOString(),
              aspectRatio: aspectRatio,
              tags: file.tags,
              comments: file.comments,
            };
          });
          onObjectsChange([...nonMediaObjects, ...newMediaObjects]);
        }}
        initialMediaUrl={objects.find(obj => obj.type === 'image' || obj.type === 'video')?.content}
        initialMediaType={objects.find(obj => obj.type === 'image' || obj.type === 'video')?.type as 'image' | 'video' | undefined}
        initialTags={objects.find(obj => obj.type === 'image' || obj.type === 'video')?.tags}
        initialComments={objects.find(obj => obj.type === 'image' || obj.type === 'video')?.comments}
        initialFiles={objects
          .filter(obj => obj.type === 'image' || obj.type === 'video')
          .map(obj => ({
            url: obj.content,
            type: obj.type as 'image' | 'video',
            tags: obj.tags,
            comments: obj.comments,
          }))}
        aspectRatio={aspectRatio}
        allowMultiple={true}
      />
      <PresentationCarousel
        key={showPresentation ? 'open' : 'closed'}
        isOpen={showPresentation}
        onClose={() => setShowPresentation(false)}
        objects={allCategoryObjects}
        canvasGroups={canvasGroups}
        initialCanvasId={canvasId}
        totalCanvases={totalCanvases}
      />

    </div>
  );
};

export default Canvas;

