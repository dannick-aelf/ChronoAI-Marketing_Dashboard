import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';

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
  isSelected?: boolean;
  onToggleSelection?: () => void;
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
  isSelected,
  onToggleSelection,
}: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [actualScale, setActualScale] = useState(initialScale);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

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

  // Find all media objects (images or videos) for carousel
  const mediaObjects = objects.filter(obj => obj.type === 'image' || obj.type === 'video');
  const mediaObject = mediaObjects[currentMediaIndex] || mediaObjects[0];
  
  // Reset index when media objects change
  useEffect(() => {
    if (currentMediaIndex >= mediaObjects.length && mediaObjects.length > 0) {
      setCurrentMediaIndex(0);
    }
  }, [mediaObjects.length, currentMediaIndex]);

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
        {objects.map((object) => {
          // For media objects, only show the current one in carousel
          if ((object.type === 'image' || object.type === 'video') && mediaObjects.length > 1) {
            const objectIndex = mediaObjects.findIndex(obj => obj.id === object.id);
            if (objectIndex !== currentMediaIndex) {
              return null; // Hide non-current media objects
            }
          }
          
          return (
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
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
          );
        })}
        
        {/* Carousel Navigation - Only show when multiple media objects */}
        {mediaObjects.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMediaIndex((prev) => (prev - 1 + mediaObjects.length) % mediaObjects.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-button-bg text-button-text flex items-center justify-center transition-all duration-200 z-30 pointer-events-auto opacity-0 group-hover:opacity-100 border-0 outline-none"
              title="Previous image"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            
            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMediaIndex((prev) => (prev + 1) % mediaObjects.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-button-bg text-button-text flex items-center justify-center transition-all duration-200 z-30 pointer-events-auto opacity-0 group-hover:opacity-100 border-0 outline-none"
              title="Next image"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            
            {/* Carousel Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 pointer-events-auto">
              {mediaObjects.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-200 opacity-60 ${
                    index === currentMediaIndex
                      ? 'bg-white w-4'
                      : 'bg-white-60 hover:bg-white-80 w-1.5'
                  }`}
                  title={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Description Tooltip - Bottom Left, 30px from edges, only on hover */}
        {mediaObject && (
          <div className="absolute bottom-4 left-4 bg-button-bg font-secondary text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40 max-w-[300px]">
            <div className="space-y-1">
              {mediaObject.dateUploaded && (
                <div>
                  <span className="text-descriptor-label">Date uploaded: </span>
                  <span className="text-descriptor-content">{new Date(mediaObject.dateUploaded).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </div>
              )}
              {mediaObject.comments && mediaObject.comments.trim() && (
                <div>
                  <span className="text-descriptor-label">Comments: </span>
                  <span className="text-descriptor-content">{mediaObject.comments}</span>
                </div>
              )}
              {mediaObject.tags && mediaObject.tags.length > 0 && (
                <div>
                  <span className="text-descriptor-label">Tags: </span>
                  <span className="text-descriptor-content">{mediaObject.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar - Only visible on hover */}
      <div className="absolute top-4 left-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center">
        {/* Selection Checkbox - Same style as toolbar buttons, appears on hover */}
        {onToggleSelection && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
            className={`w-10 h-10 rounded-lg transition-all duration-200 active:opacity-80 flex items-center justify-center ${
              isSelected
                ? 'bg-white text-black hover:bg-white-90'
                : 'bg-button-bg text-button-text'
            }`}
            aria-label={isSelected ? 'Deselect canvas' : 'Select canvas'}
            title={isSelected ? 'Deselect canvas' : 'Select canvas'}
          >
            {isSelected ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        )}
        <button
          onClick={onAddImage}
          className="w-10 h-10 rounded-lg bg-button-bg text-button-text transition-all duration-200 active:opacity-80 flex items-center justify-center"
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
            className="w-10 h-10 rounded-lg bg-button-bg text-button-text transition-all duration-200 active:opacity-80 flex items-center justify-center"
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
          const mediaObjects = objects.filter(obj => obj.type === 'image' || obj.type === 'video');
          if (mediaObjects.length === 0) return null;

          const downloadSingleFile = async (mediaObject: CanvasObject, index: number) => {
            try {
              const url = mediaObject.content;
              
              // Handle data URLs (base64)
              if (url.startsWith('data:')) {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = blobUrl;
                const extension = mediaObject.type === 'image' ? 'png' : 'mp4';
                link.download = `canvas-${mediaObject.type}-${index + 1}-${Date.now()}.${extension}`;
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
                  const originalFilename = urlPath.split('/').pop() || '';
                  const extension = mediaObject.type === 'image' ? 'png' : 'mp4';
                  const filename = originalFilename || `canvas-${mediaObject.type}-${index + 1}-${Date.now()}.${extension}`;
                  
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
                  const extension = mediaObject.type === 'image' ? 'png' : 'mp4';
                  link.download = `canvas-${mediaObject.type}-${index + 1}-${Date.now()}.${extension}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(blobUrl);
                }
              }
            } catch (error) {
              console.error(`Failed to download file ${index + 1}:`, error);
              // Fallback: open in new tab
              window.open(mediaObject.content, '_blank');
            }
          };

          const handleDownload = async () => {
            if (mediaObjects.length === 1) {
              // Single file - download immediately
              await downloadSingleFile(mediaObjects[0], 0);
            } else {
              // Multiple files - zip all files together
              try {
                const zip = new JSZip();
                
                // Fetch all files and add them to the ZIP
                for (let i = 0; i < mediaObjects.length; i++) {
                  const mediaObject = mediaObjects[i];
                  const url = mediaObject.content;
                  
                  if (!url) {
                    console.warn(`Media object ${i + 1} has no content URL`);
                    continue;
                  }
                  
                  try {
                    let blob: Blob;
                    if (url.startsWith('data:')) {
                      // Handle data URLs (base64)
                      const response = await fetch(url);
                      if (!response.ok) {
                        throw new Error(`Failed to fetch data URL: ${response.statusText}`);
                      }
                      blob = await response.blob();
                    } else {
                      // Handle regular URLs
                      const response = await fetch(url);
                      if (!response.ok) {
                        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
                      }
                      blob = await response.blob();
                    }
                    
                    // Determine filename
                    const extension = mediaObject.type === 'image' ? 'png' : 'mp4';
                    let filename = `${mediaObject.type}-${i + 1}.${extension}`;
                    
                    // Try to extract filename from URL if it's not a data URL
                    if (!url.startsWith('data:')) {
                      try {
                        const urlPath = new URL(url).pathname;
                        const originalFilename = urlPath.split('/').pop() || '';
                        if (originalFilename && originalFilename.includes('.')) {
                          filename = originalFilename;
                        }
                      } catch {
                        // Use default filename
                      }
                    }
                    
                    // Add file to ZIP root (no folders)
                    zip.file(filename, blob);
                  } catch (error) {
                    console.error(`Failed to fetch file ${i + 1}:`, error);
                    // Continue with other files even if one fails
                  }
                }
                
                // Generate ZIP file
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                
                // Download the ZIP file
                const zipUrl = window.URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = zipUrl;
                link.download = `canvas-${Date.now()}.zip`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                setTimeout(() => window.URL.revokeObjectURL(zipUrl), 100);
              } catch (error) {
                console.error('Error creating ZIP file:', error);
                // Fallback: download files sequentially
                for (let i = 0; i < mediaObjects.length; i++) {
                  await downloadSingleFile(mediaObjects[i], i);
                  if (i < mediaObjects.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                  }
                }
              }
            }
          };

          return (
            <button
              onClick={handleDownload}
              className="w-10 h-10 rounded-lg bg-button-bg text-button-text transition-all duration-200 active:opacity-80 flex items-center justify-center"
              title={mediaObjects.length > 1 ? `Download All ${mediaObjects.length} Files as ZIP` : 'Download Original Image/Video'}
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
            className="w-10 h-10 rounded-lg bg-button-bg text-button-text transition-all duration-200 active:opacity-80 flex items-center justify-center"
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

