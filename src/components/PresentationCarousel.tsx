import { useState, useEffect, useCallback, useMemo } from 'react';
import { type CanvasObject } from './CanvasEditor';
import { type CanvasMediaGroup } from './Canvas';

interface PresentationCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  objects: CanvasObject[];
  canvasGroups?: CanvasMediaGroup[]; // Grouped by canvas for hierarchical navigation
  initialCanvasId?: string;
  totalCanvases?: number;
  key?: string | number;
}

const PresentationCarousel = ({ isOpen, onClose, objects, canvasGroups, initialCanvasId, totalCanvases }: PresentationCarouselProps) => {
  // If canvasGroups is provided, use hierarchical navigation (within canvas + between canvases)
  // Otherwise, use flat navigation (backward compatibility)
  const useHierarchicalNavigation = canvasGroups && canvasGroups.length > 0;
  
  // Flat list for backward compatibility
  const mediaObjects = useMemo(() => {
    if (useHierarchicalNavigation) return [];
    return objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
  }, [objects, useHierarchicalNavigation]);

  // Hierarchical navigation state
  const [currentCanvasIndex, setCurrentCanvasIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Initialize based on initialCanvasId if provided
  useEffect(() => {
    if (isOpen && useHierarchicalNavigation && canvasGroups) {
      if (initialCanvasId) {
        const canvasIndex = canvasGroups.findIndex(g => g.canvasId === initialCanvasId);
        if (canvasIndex >= 0) {
          setCurrentCanvasIndex(canvasIndex);
          setCurrentMediaIndex(0);
        } else {
          setCurrentCanvasIndex(0);
          setCurrentMediaIndex(0);
        }
      } else {
        setCurrentCanvasIndex(0);
        setCurrentMediaIndex(0);
      }
    } else if (isOpen && !useHierarchicalNavigation && mediaObjects.length > 0) {
      setCurrentMediaIndex(0);
    }
  }, [isOpen, useHierarchicalNavigation, canvasGroups, initialCanvasId, mediaObjects.length]);

  // Get current canvas group and media objects
  const currentCanvasGroup = useHierarchicalNavigation && canvasGroups 
    ? canvasGroups[currentCanvasIndex] 
    : null;
  const currentCanvasMedia = currentCanvasGroup?.mediaObjects || [];
  
  // Get current object to display
  const currentObject = useHierarchicalNavigation
    ? (currentCanvasMedia[currentMediaIndex] || null)
    : (mediaObjects[currentMediaIndex] || null);

  const handleNext = useCallback(() => {
    if (useHierarchicalNavigation && canvasGroups) {
      // Navigate within current canvas first
      if (currentMediaIndex < currentCanvasMedia.length - 1) {
        setCurrentMediaIndex(prev => prev + 1);
      } else {
        // Move to next canvas
        if (currentCanvasIndex < canvasGroups.length - 1) {
          setCurrentCanvasIndex(prev => prev + 1);
          setCurrentMediaIndex(0);
        } else {
          // Loop back to first canvas
          setCurrentCanvasIndex(0);
          setCurrentMediaIndex(0);
        }
      }
    } else {
      // Flat navigation
      setCurrentMediaIndex((prev) => {
        if (mediaObjects.length === 0) return prev;
        return (prev + 1) % mediaObjects.length;
      });
    }
  }, [useHierarchicalNavigation, canvasGroups, currentMediaIndex, currentCanvasMedia.length, currentCanvasIndex, mediaObjects.length]);

  const handlePrevious = useCallback(() => {
    if (useHierarchicalNavigation && canvasGroups) {
      // Navigate within current canvas first
      if (currentMediaIndex > 0) {
        setCurrentMediaIndex(prev => prev - 1);
      } else {
        // Move to previous canvas
        if (currentCanvasIndex > 0) {
          setCurrentCanvasIndex(prev => prev - 1);
          const prevCanvasMedia = canvasGroups[currentCanvasIndex - 1]?.mediaObjects || [];
          setCurrentMediaIndex(prevCanvasMedia.length - 1);
        } else {
          // Loop to last canvas
          const lastCanvasIndex = canvasGroups.length - 1;
          const lastCanvasMedia = canvasGroups[lastCanvasIndex]?.mediaObjects || [];
          setCurrentCanvasIndex(lastCanvasIndex);
          setCurrentMediaIndex(Math.max(0, lastCanvasMedia.length - 1));
        }
      }
    } else {
      // Flat navigation
      setCurrentMediaIndex((prev) => {
        if (mediaObjects.length === 0) return prev;
        return (prev - 1 + mediaObjects.length) % mediaObjects.length;
      });
    }
  }, [useHierarchicalNavigation, canvasGroups, currentMediaIndex, currentCanvasIndex, mediaObjects.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose]);

  // Check if we have content to display
  const hasContent = useHierarchicalNavigation
    ? (currentObject !== null)
    : (mediaObjects.length > 0);

  if (!isOpen || !hasContent || !currentObject) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-button-bg text-button-text flex items-center justify-center transition-all duration-200 pointer-events-auto border-0 outline-none"
            style={{ zIndex: 100 }}
            aria-label="Close presentation"
          >
            <svg
              className="w-6 h-6"
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

          {/* Previous Button - Always visible */}
          <button
            onClick={handlePrevious}
            disabled={useHierarchicalNavigation 
              ? (canvasGroups?.length === 1 && currentCanvasMedia.length <= 1)
              : (mediaObjects.length <= 1)
            }
            className={`absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-button-bg text-button-text flex items-center justify-center transition-all duration-200 shadow-lg pointer-events-auto border-0 outline-none ${
              (useHierarchicalNavigation 
                ? (canvasGroups?.length === 1 && currentCanvasMedia.length <= 1)
                : (mediaObjects.length <= 1)) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ zIndex: 100 }}
            aria-label="Previous"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Media Display */}
          <div className="w-full h-full flex items-center justify-center relative" style={{ zIndex: 1 }}>
            {currentObject.type === 'image' ? (
              <img
                src={currentObject.content}
                alt="Presentation"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={currentObject.content}
                className="max-w-full max-h-full object-contain"
                autoPlay
                loop
                muted
                playsInline
                controls
                style={{ zIndex: 1 }}
              />
            )}
          </div>

          {/* Next Button - Always visible */}
          <button
            onClick={handleNext}
            disabled={useHierarchicalNavigation 
              ? (canvasGroups?.length === 1 && currentCanvasMedia.length <= 1)
              : (mediaObjects.length <= 1)
            }
            className={`absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-button-bg text-button-text flex items-center justify-center transition-all duration-200 shadow-lg pointer-events-auto border-0 outline-none ${
              (useHierarchicalNavigation 
                ? (canvasGroups?.length === 1 && currentCanvasMedia.length <= 1)
                : (mediaObjects.length <= 1)) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ zIndex: 100 }}
            aria-label="Next"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Counter */}
          {useHierarchicalNavigation && canvasGroups ? (
            <div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-button-counter text-button-counter font-secondary text-sm pointer-events-auto"
              style={{ zIndex: 100 }}
            >
              <span className="text-button-counter">{currentCanvasIndex + 1} / {canvasGroups.length}</span>
              {currentCanvasMedia.length > 1 && (
                <span className="ml-2 text-button-counter opacity-90">
                  • {currentMediaIndex + 1} / {currentCanvasMedia.length}
                </span>
              )}
            </div>
          ) : totalCanvases !== undefined && totalCanvases > 0 ? (
            <div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-button-counter text-button-counter font-secondary text-sm pointer-events-auto"
              style={{ zIndex: 100 }}
            >
              {Math.min(Math.floor(currentMediaIndex / Math.max(1, Math.ceil(mediaObjects.length / totalCanvases))) + 1, totalCanvases)} / {totalCanvases}
            </div>
          ) : (
            mediaObjects.length > 1 && (
              <div 
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-button-counter text-button-counter font-secondary text-sm pointer-events-auto"
                style={{ zIndex: 100 }}
              >
                {currentMediaIndex + 1} / {mediaObjects.length}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default PresentationCarousel;

