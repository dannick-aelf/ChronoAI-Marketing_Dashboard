import { useState, useRef, useCallback, useEffect } from 'react';

export type CanvasObjectType = 'image' | 'video' | 'text';

export interface CanvasObject {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // URL for images, text content for text
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  dateUploaded?: string; // Date when content was uploaded
  aspectRatio?: string; // Aspect ratio of the canvas
  tags?: string[]; // Tags for the content
  comments?: string; // Comments for the content
}

interface CanvasEditorProps {
  width: number;
  height: number;
  scale: number; // Scale factor between display and actual size
  objects: CanvasObject[];
  onObjectsChange: (objects: CanvasObject[]) => void;
  onAddImage: () => void;
  onPresent: () => void;
  aspectRatio?: string; // Canvas aspect ratio for description
}

const CanvasEditor = ({
  width,
  height,
  scale: initialScale,
  objects,
  onObjectsChange,
  onAddImage,
  onPresent,
  aspectRatio,
}: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [actualScale, setActualScale] = useState(initialScale);

  // Calculate actual scale based on rendered canvas size
  useEffect(() => {
    const updateScale = () => {
      if (!canvasRef.current || width === 0 || height === 0) return;
      
      const renderedWidth = canvasRef.current.clientWidth || canvasRef.current.offsetWidth;
      const renderedHeight = canvasRef.current.clientHeight || canvasRef.current.offsetHeight;
      
      if (renderedWidth > 0 && renderedHeight > 0) {
        // Calculate scale based on actual rendered size
        // Use width as primary since canvas uses aspect-ratio CSS
        const widthScale = renderedWidth / width;
        const heightScale = renderedHeight / height;
        
        // Use width scale as primary (since CSS aspect-ratio maintains height based on width)
        // But verify height matches expected aspect ratio
        const expectedHeight = renderedWidth / (width / height);
        const heightMatches = Math.abs(renderedHeight - expectedHeight) < 2; // Allow 2px tolerance
        
        if (heightMatches) {
          setActualScale(widthScale);
        } else {
          // If height doesn't match, use the smaller scale to fit
          setActualScale(Math.min(widthScale, heightScale));
        }
      }
    };

    // Use multiple RAFs to ensure CSS has applied
    let rafId1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateScale();
      });
    });
    
    // Watch for resize
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateScale);
    });
    
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }
    
    window.addEventListener('resize', updateScale);
    
    return () => {
      cancelAnimationFrame(rafId1);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [width, height, initialScale]);

  const scale = actualScale;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, objectId: string) => {
      e.stopPropagation();
      const object = objects.find((obj) => obj.id === objectId);
      if (!object) return;

      setSelectedId(objectId);
      setIsDragging(true);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - object.x * scale,
          y: e.clientY - rect.top - object.y * scale,
        });
      }
    },
    [objects, scale]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedId || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - dragOffset.x) / scale;
      const newY = (e.clientY - rect.top - dragOffset.y) / scale;

      // Constrain to canvas bounds
      const object = objects.find((obj) => obj.id === selectedId);
      if (!object) return;

      const constrainedX = Math.max(0, Math.min(newX, width - object.width));
      const constrainedY = Math.max(0, Math.min(newY, height - object.height));

      onObjectsChange(
        objects.map((obj) =>
          obj.id === selectedId
            ? { ...obj, x: constrainedX, y: constrainedY }
            : obj
        )
      );
    },
    [isDragging, selectedId, dragOffset, scale, objects, width, height, onObjectsChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null);
    }
  };

  const deleteSelected = useCallback(() => {
    if (selectedId) {
      onObjectsChange(objects.filter((obj) => obj.id !== selectedId));
      setSelectedId(null);
    }
  }, [selectedId, objects, onObjectsChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteSelected]);

  // Find the media object (image or video) for description
  const mediaObject = objects.find(obj => obj.type === 'image' || obj.type === 'video');

  return (
    <div className="relative w-full h-full group">
      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className="relative w-full h-full overflow-hidden bg-grey-bg-2"
        style={{ 
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
        }}
        onClick={handleCanvasClick}
      >
        {/* Render Objects */}
        {objects.map((object) => (
          <div
            key={object.id}
            className="absolute cursor-move overflow-hidden group/object"
            style={{
              left: `${object.x * scale}px`,
              top: `${object.y * scale}px`,
              width: `${object.width * scale}px`,
              height: `${object.height * scale}px`,
              margin: 0,
              padding: 0,
            }}
            onMouseDown={(e) => handleMouseDown(e, object.id)}
          >
            {object.type === 'image' ? (
              <img
                src={object.content}
                alt="Canvas image"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
                style={{ objectFit: 'cover' }}
              />
            ) : object.type === 'video' ? (
              <video
                src={object.content}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
                autoPlay
                loop
                muted
                playsInline
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center pointer-events-none select-none overflow-hidden"
                style={{
                  fontSize: `${(object.fontSize || 24) * scale}px`,
                  color: object.color || '#FFFFFF',
                  fontFamily: object.fontFamily || 'var(--font-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {object.content || 'Text'}
              </div>
            )}
            
          </div>
        ))}
        
        {/* Description Tooltip - Bottom Left, 30px from edges, only on hover */}
        {mediaObject && (
          <div className="absolute bottom-[30px] left-[30px] bg-grey-bg-3 text-white font-secondary text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 max-w-[300px]">
            <div className="space-y-1">
              {mediaObject.dateUploaded && (
                <div>
                  <span className="text-white-60">Date uploaded: </span>
                  <span>{new Date(mediaObject.dateUploaded).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </div>
              )}
              {mediaObject.comments && mediaObject.comments.trim() && (
                <div>
                  <span className="text-white-60">Comments: </span>
                  <span className="text-white">{mediaObject.comments}</span>
                </div>
              )}
              {aspectRatio && (
                <div>
                  <span className="text-white-60">Aspect Ratio: </span>
                  <span>{aspectRatio}</span>
                </div>
              )}
              {mediaObject.tags && mediaObject.tags.length > 0 && (
                <div>
                  <span className="text-white-60">Tags: </span>
                  <span>{mediaObject.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar - Only visible on hover */}
      <div className="absolute top-2 left-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={onAddImage}
          className="w-10 h-10 rounded-lg bg-grey-bg-3 hover:bg-grey-bg-4 text-text-primary border border-border transition-all duration-200 active:opacity-80 flex items-center justify-center"
          title="Add Image or Video"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        {objects.filter((obj) => obj.type === 'image' || obj.type === 'video').length > 0 && (
          <button
            onClick={onPresent}
            className="w-10 h-10 rounded-lg bg-grey-bg-3 hover:bg-white text-text-primary hover:text-black border border-border transition-all duration-200 active:opacity-80 flex items-center justify-center"
            title="Present (View all images/videos)"
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}
        {(() => {
          const mediaObject = objects.find(obj => obj.type === 'image' || obj.type === 'video');
          if (!mediaObject) return null;

          const handleDownload = async () => {
            try {
              const url = mediaObject.content;
              
              // Handle data URLs (base64)
              if (url.startsWith('data:')) {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `canvas-${mediaObject.type === 'image' ? 'image' : 'video'}-${Date.now()}.${mediaObject.type === 'image' ? 'png' : 'mp4'}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              } else {
                // Handle regular URLs - fetch and download
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                
                // Try to get filename from URL
                try {
                  const urlPath = new URL(url).pathname;
                  const filename = urlPath.split('/').pop() || `canvas-${mediaObject.type === 'image' ? 'image' : 'video'}-${Date.now()}.${mediaObject.type === 'image' ? 'png' : 'mp4'}`;
                  
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(blobUrl);
                } catch {
                  // If URL parsing fails, use generic filename
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = `canvas-${mediaObject.type === 'image' ? 'image' : 'video'}-${Date.now()}.${mediaObject.type === 'image' ? 'png' : 'mp4'}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(blobUrl);
                }
              }
            } catch (error) {
              console.error('Failed to download:', error);
              // Fallback: open in new tab
              window.open(mediaObject.content, '_blank');
            }
          };

          return (
            <button
              onClick={handleDownload}
              className="w-10 h-10 rounded-lg bg-grey-bg-3 hover:bg-grey-bg-4 text-text-primary border border-border transition-all duration-200 active:opacity-80 flex items-center justify-center"
              title="Download Original Image/Video"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          );
        })()}
        {selectedId && (
          <button
            onClick={deleteSelected}
            className="w-10 h-10 rounded-lg bg-grey-bg-3 hover:bg-white text-text-primary hover:text-black border border-border transition-all duration-200 active:opacity-80 flex items-center justify-center"
            title="Delete Selected (Del)"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CanvasEditor;

