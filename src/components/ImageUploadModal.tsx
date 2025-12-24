import { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, type: 'image' | 'video', tags?: string[], comments?: string) => void;
  onConfirmMultiple?: (files: Array<{ url: string; type: 'image' | 'video'; tags?: string[]; comments?: string }>) => void;
  initialMediaUrl?: string;
  initialMediaType?: 'image' | 'video';
  initialTags?: string[];
  initialComments?: string;
  initialFiles?: MediaFile[]; // Array of existing files (for carousel editing)
  aspectRatio?: string;
  allowMultiple?: boolean;
  availableTags?: string[]; // All available tags from all canvases for autocomplete
}

interface MediaFile {
  url: string;
  type: 'image' | 'video';
  tags?: string[];
  comments?: string;
  id?: string; // Unique identifier for stable keys
}

const ImageUploadModal = ({ isOpen, onClose, onConfirm, onConfirmMultiple, initialMediaUrl, initialMediaType, initialTags, initialComments, initialFiles, allowMultiple, availableTags = [] }: MediaUploadModalProps) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [tagInput, setTagInput] = useState('');
  const [comments, setComments] = useState<string>(initialComments || '');
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagsManuallySetRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Only initialize on first open, not on subsequent updates
      if (!hasInitializedRef.current) {
        tagsManuallySetRef.current = false;
        
        if (initialFiles && initialFiles.length > 0) {
          const filesWithIds = initialFiles.map((file, idx) => ({
            ...file,
            id: file.id || `${file.url}-${idx}-${Date.now()}`,
          }));
          setSelectedFiles(filesWithIds);
          setCurrentPreviewIndex(0);
          setMediaUrl(initialFiles[0].url);
          setMediaType(initialFiles[0].type);
          setTags(initialFiles[0].tags || []);
          setComments(initialFiles[0].comments || '');
        } else {
          setMediaUrl(initialMediaUrl || '');
          setMediaType(initialMediaType || null);
          setTags(initialTags || []);
          setComments(initialComments || '');
          setSelectedFiles([]);
          setCurrentPreviewIndex(0);
        }
        hasInitializedRef.current = true;
      }
    } else {
      // Reset when modal closes
      setMediaUrl('');
      setMediaType(null);
      setTags([]);
      setTagInput('');
      setComments('');
      setError('');
      setSelectedFiles([]);
      setCurrentPreviewIndex(0);
      setDraggedIndex(null);
      setDragOverIndex(null);
      setShowTagSuggestions(false);
      tagsManuallySetRef.current = false;
      hasInitializedRef.current = false;
    }
  }, [isOpen, initialMediaUrl, initialMediaType, initialTags, initialComments, initialFiles]);

  // react-modal handles Escape key automatically via onRequestClose

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (allowMultiple && onConfirmMultiple && files.length >= 1) {
      setError('');
      
      const filePromises = Array.from(files).map((file) => {
        return new Promise<MediaFile>((resolve, reject) => {
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');

          if (!isImage && !isVideo) {
            reject(new Error(`Invalid file type: ${file.name}`));
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              resolve({
                url: result,
                type: isImage ? 'image' : 'video',
                tags: tags.length > 0 ? tags : undefined,
                comments: comments.trim() || undefined,
                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              });
            } else {
              reject(new Error(`Failed to read file: ${file.name}`));
            }
          };
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      try {
        const results = await Promise.all(filePromises);
        setSelectedFiles(prev => [...prev, ...results]);
        setCurrentPreviewIndex(0);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to load some files');
      }
      return;
    }

    // Single file handling (existing behavior)
    const file = files[0];
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setMediaUrl(result);
        setMediaType(isImage ? 'image' : 'video');
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (tagToAdd?: string) => {
    const tag = tagToAdd || tagInput.trim();
    if (tag) {
      // Case-insensitive check to avoid duplicates
      const tagLower = tag.toLowerCase();
      if (!tags.some(t => t.toLowerCase() === tagLower)) {
        setTags([...tags, tag]);
        tagsManuallySetRef.current = true;
        setTagInput('');
        setShowTagSuggestions(false);
      } else {
        // Clear input even if tag already exists
        setTagInput('');
        setShowTagSuggestions(false);
      }
    }
  };

  // Filter available tags based on input and exclude already added tags
  const getTagSuggestions = () => {
    if (!tagInput.trim()) {
      // If input is empty, show all available tags that aren't already added
      return availableTags.filter(tag => {
        const tagLower = tag.toLowerCase();
        return !tags.some(t => t.toLowerCase() === tagLower);
      }).slice(0, 5); // Limit to 5 suggestions
    }
    
    const inputLower = tagInput.toLowerCase();
    return availableTags
      .filter(tag => {
        const tagLower = tag.toLowerCase();
        // Show tags that match the input and aren't already added
        return tagLower.includes(inputLower) && !tags.some(t => t.toLowerCase() === tagLower);
      })
      .sort((a, b) => {
        // Prioritize tags that start with the input
        const aStarts = a.toLowerCase().startsWith(inputLower);
        const bStarts = b.toLowerCase().startsWith(inputLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 5); // Limit to 5 suggestions
  };

  const tagSuggestions = getTagSuggestions();

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
  };

  const handleUrlSubmit = () => {
    if (mediaUrl.trim()) {
      // Determine type from URL or use detected type
      const type = mediaType || (mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image');
      onConfirm(mediaUrl, type, tags.length > 0 ? tags : undefined, comments.trim() || undefined);
      setMediaUrl('');
      setMediaType(null);
      setTags([]);
      setTagInput('');
      setError('');
      onClose();
    } else {
      setError('Please select a file');
    }
  };

  const handleClose = () => {
    setMediaUrl('');
    setMediaType(null);
    setTags([]);
    setTagInput('');
    setComments('');
    setError('');
    setSelectedFiles([]);
    setCurrentPreviewIndex(0);
    onClose();
  };

  const handleConfirmMultiple = () => {
    if (!onConfirmMultiple) {
      setError('Save function not available');
      return;
    }

    // Allow saving even with empty selectedFiles if we're editing existing files
    // This handles the case where user just wants to update tags/comments
    if (selectedFiles.length === 0 && initialFiles && initialFiles.length > 0) {
      // User removed all files but we still want to save tags/comments to existing files
      const filesWithMetadata = initialFiles.map(file => ({
        ...file,
        tags: tags.length > 0 ? [...tags] : undefined,
        comments: comments.trim() || undefined,
      }));
      onConfirmMultiple(filesWithMetadata);
      setSelectedFiles([]);
      setCurrentPreviewIndex(0);
      setTags([]);
      setTagInput('');
      setComments('');
      setError('');
      onClose();
      return;
    }

    if (selectedFiles.length > 0) {
      // Apply current tags and comments to all files
      const filesWithMetadata = selectedFiles.map(file => ({
        ...file,
        tags: tags.length > 0 ? [...tags] : undefined,
        comments: comments.trim() || undefined,
      }));
      onConfirmMultiple(filesWithMetadata);
      setSelectedFiles([]);
      setCurrentPreviewIndex(0);
      setTags([]);
      setTagInput('');
      setComments('');
      setError('');
      onClose();
    } else {
      setError('Please select at least one file or add new files');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the element (not just moving to a child)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Check if we're moving to a child element (like the remove button)
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget) {
      // Check if the related target is a child of the current target
      if (e.currentTarget.contains(relatedTarget)) {
        return; // Don't clear if moving to a child element
      }
      // Check if the related target is the remove button or its children
      const removeButton = relatedTarget.closest('button[title="Remove"]');
      if (removeButton) {
        // Ensure the button stays visible
        (removeButton as HTMLElement).style.opacity = '1';
        (removeButton as HTMLElement).style.visibility = 'visible';
        return; // Don't clear if moving to the remove button
      }
    }
    
    // Only clear if we're truly leaving the bounds
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    if (draggedIndex === null) {
      return;
    }
    
    if (draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newFiles = [...selectedFiles];
    const [draggedFile] = newFiles.splice(draggedIndex, 1);
    
    // Calculate the correct insertion index
    let insertIndex = dropIndex;
    if (draggedIndex < dropIndex) {
      // Dragging down: adjust because we removed an item before the drop position
      insertIndex = dropIndex - 1;
    }
    
    newFiles.splice(insertIndex, 0, draggedFile);
    setSelectedFiles(newFiles);
    
    // Update preview index to follow the moved item
    setCurrentPreviewIndex(insertIndex);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (currentPreviewIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentPreviewIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setCurrentPreviewIndex(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Add Image or Video"
      className="bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-w-lg w-full p-6 mx-4 my-auto max-h-[90vh] overflow-y-auto outline-none relative"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      ariaHideApp={false}
    >
          <h3 className="text-xl font-primary font-bold text-text-primary mb-4">
            Add Image or Video
          </h3>
          
          {/* Divider */}
          <div className="border-b border-border mb-4 -mx-6" style={{ width: 'calc(100% + 3rem)' }}></div>

          <div className="mb-4">
            <label className="block text-sm font-secondary text-text-secondary mb-2">
              Upload Media
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple={allowMultiple}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 rounded-lg border border-border bg-grey-bg-3 hover:bg-grey-bg-4 text-text-primary font-secondary transition-all duration-200"
            >
              {allowMultiple ? 'Choose Files (Image or Video)' : 'Choose File (Image or Video)'}
            </button>
          </div>


          {error && (
            <p className="text-sm text-error mb-4 font-secondary">{error}</p>
          )}

          {/* Tags Section */}
          <div className="mb-4">
            <label className="block text-sm font-secondary text-text-secondary mb-2">
              Tags
            </label>
            <div className="relative flex gap-2 mb-2">
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => {
                  if (tagSuggestions.length > 0) {
                    setShowTagSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding to allow clicking on suggestions
                  setTimeout(() => setShowTagSuggestions(false), 200);
                }}
                placeholder="Enter a tag and press Enter"
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:border-border"
              />
              {/* Tag Suggestions Dropdown */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-grey-bg-2 border border-border rounded-lg shadow-elevated z-50 max-h-48 overflow-y-auto">
                  {tagSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAddTag(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm font-secondary text-text-primary hover:bg-grey-bg-4 transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-grey-bg-4 text-white text-xs font-secondary"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white-60 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mb-4">
            <label className="block text-sm font-secondary text-text-secondary mb-2">
              Comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter comments..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:border-border resize-none"
            />
          </div>

          {/* File List with Reorder Controls */}
          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={file.id || file.url || index}
                    draggable
                    onDragStart={(e) => {
                      // Don't start drag if clicking on the remove button
                      const target = e.target as HTMLElement;
                      if (target.closest('button[title="Remove"]')) {
                        e.preventDefault();
                        return;
                      }
                      handleDragStart(e, index);
                    }}
                    onDragOver={(e) => {
                      // Don't handle drag over if over the remove button
                      const target = e.target as HTMLElement;
                      if (target.closest('button[title="Remove"]')) {
                        return;
                      }
                      handleDragOver(e, index);
                    }}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      // Don't handle drop if over the remove button
                      const target = e.target as HTMLElement;
                      if (target.closest('button[title="Remove"]')) {
                        return;
                      }
                      handleDrop(e, index);
                    }}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-2 rounded-lg bg-grey-bg-3 border border-border cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    } ${
                      dragOverIndex === index ? 'border-border bg-grey-bg-4' : ''
                    }`}
                    style={{
                      transition: draggedIndex === index ? 'opacity 0.2s ease' : 'background-color 0.2s ease, border-color 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      // Ensure button stays visible when hovering over parent
                      const button = e.currentTarget.querySelector('button[title="Remove"]') as HTMLElement;
                      if (button) {
                        button.style.setProperty('opacity', '1', 'important');
                        button.style.setProperty('visibility', 'visible', 'important');
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Ensure button stays visible when leaving parent
                      const button = e.currentTarget.querySelector('button[title="Remove"]') as HTMLElement;
                      if (button) {
                        button.style.setProperty('opacity', '1', 'important');
                        button.style.setProperty('visibility', 'visible', 'important');
                      }
                    }}
                  >
                    <div className="cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-opacity pointer-events-none">
                      <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        {file.type === 'video' ? (
                          <video src={file.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={file.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-sm font-secondary text-text-primary">
                        {file.type === 'image' ? 'Image' : 'Video'} {index + 1}
                      </span>
                    </div>
                    <div className="relative flex-shrink-0" style={{ zIndex: 100 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRemoveFile(index);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          // Force visibility on hover
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.visibility = 'visible';
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          // Force visibility on leave
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.visibility = 'visible';
                        }}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onDragOver={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        draggable={false}
                        className="w-10 h-10 rounded-lg bg-button-bg text-button-text transition-all duration-200 active:opacity-80 flex items-center justify-center"
                        title="Remove"
                        style={{
                          opacity: 1,
                          visibility: 'visible',
                          display: 'flex',
                          pointerEvents: 'auto',
                          position: 'relative',
                          zIndex: 100
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary hover:bg-grey-bg-4 transition-all duration-200 active:opacity-80"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
            {(selectedFiles.length > 0 || (initialFiles && initialFiles.length > 0 && allowMultiple)) && onConfirmMultiple ? (
              <button
                onClick={handleConfirmMultiple}
                disabled={selectedFiles.length === 0 && (!initialFiles || initialFiles.length === 0)}
                className={`px-4 py-2 rounded-lg bg-white text-black font-secondary hover:bg-white-80 transition-all duration-200 active:opacity-80 ${
                  selectedFiles.length === 0 && (!initialFiles || initialFiles.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ minHeight: '44px' }}
              >
                {initialFiles && initialFiles.length > 0 ? 'Save' : 'Add'} {selectedFiles.length > 0 ? `${selectedFiles.length} ${selectedFiles.length === 1 ? 'File' : 'Files'}` : (initialFiles && initialFiles.length > 0 ? `${initialFiles.length} ${initialFiles.length === 1 ? 'File' : 'Files'}` : '')}
              </button>
            ) : (
              <button
                onClick={mediaUrl ? handleUrlSubmit : () => setError('Please select a file')}
                className="px-4 py-2 rounded-lg bg-white text-black font-secondary hover:bg-white-80 transition-all duration-200 active:opacity-80"
                style={{ minHeight: '44px' }}
              >
                {initialMediaUrl ? 'Save' : 'Add'}
              </button>
            )}
          </div>
    </Modal>
  );
};

export default ImageUploadModal;


