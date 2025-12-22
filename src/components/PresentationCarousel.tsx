import { useState, useEffect, useCallback, useMemo } from 'react';
import { type CanvasObject } from './CanvasEditor';

interface PresentationCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  objects: CanvasObject[];
  initialCanvasId?: string;
  key?: string | number;
}

const PresentationCarousel = ({ isOpen, onClose, objects }: PresentationCarouselProps) => {
  // Filter only image and video objects - memoize to prevent unnecessary recalculations
  const mediaObjects = useMemo(() => {
    return objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
  }, [objects]);
  
  // Initialize to 0 - will reset when component remounts via key prop
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when modal opens or objects change
  useEffect(() => {
    if (isOpen && mediaObjects.length > 0) {
      setCurrentIndex(0);
    }
  }, [isOpen, mediaObjects.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (mediaObjects.length === 0) return prev;
      return (prev + 1) % mediaObjects.length;
    });
  }, [mediaObjects.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (mediaObjects.length === 0) return prev;
      return (prev - 1 + mediaObjects.length) % mediaObjects.length;
    });
  }, [mediaObjects.length]);

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

  if (!isOpen || mediaObjects.length === 0) return null;

  const currentObject = mediaObjects[currentIndex];

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
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-grey-bg-4 hover:bg-white-40 text-white flex items-center justify-center transition-all duration-200 pointer-events-auto"
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
            disabled={mediaObjects.length <= 1}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-grey-bg-4 hover:bg-white-60 text-white flex items-center justify-center transition-all duration-200 shadow-lg pointer-events-auto ${
              mediaObjects.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''
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
            disabled={mediaObjects.length <= 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-grey-bg-4 hover:bg-white-60 text-white flex items-center justify-center transition-all duration-200 shadow-lg pointer-events-auto ${
              mediaObjects.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''
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
          {mediaObjects.length > 1 && (
            <div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-grey-bg-4 bg-opacity-80 text-white font-secondary text-sm pointer-events-auto"
              style={{ zIndex: 100 }}
            >
              {currentIndex + 1} / {mediaObjects.length}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PresentationCarousel;

