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
  totalCanvases?: number;
  isSelected?: boolean;
  onToggleSelection?: (canvasId: string) => void;
}

// Canvas dimensions
const canvasSizes = {
  '4:5': { width: 1080, height: 1350 },
  '9:16': { width: 1080, height: 1920 },
} as const;

const Canvas = ({ aspectRatio, canvasId, objects, allCategoryObjects, canvasGroups, onObjectsChange, onDelete, totalCanvases, isSelected, onToggleSelection }: CanvasProps) => {
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
      tags: tags && tags.length > 0 ? tags : undefined,
      comments: comments && comments.trim() ? comments.trim() : undefined,
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
        {/* Delete Canvas Button - appears on hover only */}
        <button
          onClick={() => onDelete(canvasId)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-button-bg text-button-text flex items-center justify-center transition-all duration-200 active:opacity-80 active:scale-[0.95] shadow-lg z-30 opacity-0 group-hover:opacity-100 focus:opacity-0"
          aria-label="Delete canvas"
          onMouseLeave={(e) => {
            // Force hide on mouse leave to prevent staying visible after click
            e.currentTarget.style.opacity = '0';
          }}
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
                isSelected={isSelected}
                onToggleSelection={onToggleSelection ? () => onToggleSelection(canvasId) : undefined}
              />
          </div>
        ) : (
          <div className="w-full h-full skeleton-shimmer" />
        )}
      </div>

      {/* Modals */}
      <ImageUploadModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onConfirm={handleAddMedia}
        onConfirmMultiple={(files) => {
          // Get all existing media objects
          const existingMediaObjects = objects.filter(obj => obj.type === 'image' || obj.type === 'video');
          const existingMediaMap = new Map(
            existingMediaObjects.map(obj => [obj.content, obj])
          );
          
          // Get URLs of files being saved
          const savedFileUrls = new Set(files.map(f => f.url));
          
          // Separate new files from existing files
          const newFiles: typeof files = [];
          const updatedExistingObjects: typeof objects = [];
          
          files.forEach(file => {
            const existingObj = existingMediaMap.get(file.url);
            if (existingObj) {
              // Update existing object with new tags/comments
              updatedExistingObjects.push({
                ...existingObj,
                tags: file.tags && Array.isArray(file.tags) && file.tags.length > 0 ? [...file.tags] : undefined,
                comments: file.comments && file.comments.trim() ? file.comments.trim() : undefined,
              });
            } else {
              // New file to add
              newFiles.push(file);
            }
          });
          
          // Create new media objects for new files
          const newMediaObjects = newFiles.map((file, index) => {
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
              tags: file.tags && Array.isArray(file.tags) && file.tags.length > 0 ? [...file.tags] : undefined,
              comments: file.comments && file.comments.trim() ? file.comments.trim() : undefined,
            };
          });
          
          // Create a map of updated objects by URL for quick lookup
          const updatedObjectsMap = new Map(
            updatedExistingObjects.map(obj => [obj.content, obj])
          );
          
          // Filter existing media objects: keep only those that are in the saved files
          // This removes files that were deleted in the modal
          const remainingMediaObjects = existingMediaObjects
            .filter(obj => savedFileUrls.has(obj.content))
            .map(obj => {
              const updated = updatedObjectsMap.get(obj.content);
              return updated || obj;
            });
          
          // Get non-media objects (text, etc.)
          const nonMediaObjects = objects.filter(obj => obj.type !== 'image' && obj.type !== 'video');
          
          // Combine: non-media objects, remaining/updated media objects, new media objects
          onObjectsChange([...nonMediaObjects, ...remainingMediaObjects, ...newMediaObjects]);
        }}
        initialMediaUrl={undefined}
        initialMediaType={undefined}
        initialTags={undefined}
        initialComments={undefined}
        initialFiles={objects
          .filter(obj => obj.type === 'image' || obj.type === 'video')
          .map(obj => ({
            url: obj.content,
            type: obj.type as 'image' | 'video',
            tags: obj.tags,
            comments: obj.comments,
            id: obj.id,
          }))}
        aspectRatio={aspectRatio}
        allowMultiple={true}
        availableTags={(() => {
          // Collect all unique tags from all category objects for autocomplete
          const allTags = new Set<string>();
          allCategoryObjects.forEach((obj) => {
            if (obj.tags && obj.tags.length > 0) {
              obj.tags.forEach((tag: string) => allTags.add(tag));
            }
          });
          return Array.from(allTags).sort();
        })()}
      />
      <PresentationCarousel
        key={showPresentation ? 'open' : 'closed'}
        isOpen={showPresentation}
        onClose={() => setShowPresentation(false)}
        objects={allCategoryObjects}
        canvasGroups={canvasGroups}
        initialCanvasId={canvasId}
        totalCanvases={totalCanvases}
        aspectRatio={aspectRatio}
      />

    </div>
  );
};

export default Canvas;

