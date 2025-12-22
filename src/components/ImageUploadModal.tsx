import { useState, useRef, useEffect } from 'react';

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
}

interface MediaFile {
  url: string;
  type: 'image' | 'video';
  tags?: string[];
  comments?: string;
  id?: string; // Unique identifier for stable keys
}

const ImageUploadModal = ({ isOpen, onClose, onConfirm, onConfirmMultiple, initialMediaUrl, initialMediaType, initialTags, initialComments, initialFiles, allowMultiple }: MediaUploadModalProps) => {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when initial values change (when modal opens with existing image)
  useEffect(() => {
    if (isOpen) {
      // If initialFiles is provided (carousel editing), use those files
      if (initialFiles && initialFiles.length > 0) {
        // Add unique IDs to files if they don't have them
        const filesWithIds = initialFiles.map((file, idx) => ({
          ...file,
          id: file.id || `${file.url}-${idx}-${Date.now()}`,
        }));
        setSelectedFiles(filesWithIds);
        setCurrentPreviewIndex(0);
        // Set form fields from first file
        setMediaUrl(initialFiles[0].url);
        setMediaType(initialFiles[0].type);
        setTags(initialFiles[0].tags || []);
        setComments(initialFiles[0].comments || '');
      } else {
        // Single file mode
        setMediaUrl(initialMediaUrl || '');
        setMediaType(initialMediaType || null);
        setTags(initialTags || []);
        setComments(initialComments || '');
        setSelectedFiles([]);
        setCurrentPreviewIndex(0);
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
    }
  }, [isOpen, initialMediaUrl, initialMediaType, initialTags, initialComments, initialFiles]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // If multiple files and onConfirmMultiple is provided, load files for preview
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
        setSelectedFiles(results);
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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
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
    if (selectedFiles.length > 0 && onConfirmMultiple) {
      // Apply current tags and comments to all files if they were set after file selection
      const filesWithMetadata = selectedFiles.map(file => ({
        ...file,
        tags: tags.length > 0 ? tags : file.tags,
        comments: comments.trim() || file.comments,
      }));
      onConfirmMultiple(filesWithMetadata);
      setSelectedFiles([]);
      setCurrentPreviewIndex(0);
      setTags([]);
      setTagInput('');
      setComments('');
      setError('');
      onClose();
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
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-[100]"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-w-lg w-full p-6 my-auto max-h-[90vh] overflow-y-auto relative z-[101]"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-primary text-text-primary mb-4">
            Add Image or Video
          </h3>

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
            <p className="text-sm text-white mb-4 font-secondary">{error}</p>
          )}

          {/* Tags Section */}
          <div className="mb-4">
            <label className="block text-sm font-secondary text-text-secondary mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Enter a tag and press Enter"
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:border-border"
              />
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
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-2 rounded-lg bg-grey-bg-3 border border-border cursor-move transition-all ${
                      draggedIndex === index ? 'opacity-50' : ''
                    } ${
                      dragOverIndex === index ? 'border-border bg-grey-bg-4' : ''
                    }`}
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
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-grey-bg-4 active:opacity-80 text-text-secondary hover:text-text-primary transition-all"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary font-medium hover:bg-grey-bg-4 transition-all duration-200 active:opacity-80"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
            {selectedFiles.length > 0 ? (
              <button
                onClick={handleConfirmMultiple}
                className="px-4 py-2 rounded-lg bg-white text-black font-secondary font-medium hover:bg-white-80 transition-all duration-200 active:opacity-80"
                style={{ minHeight: '44px' }}
              >
                {initialFiles && initialFiles.length > 0 ? 'Save' : 'Add'} {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
              </button>
            ) : (
              <button
                onClick={mediaUrl ? handleUrlSubmit : () => setError('Please select a file')}
                className="px-4 py-2 rounded-lg bg-white text-black font-secondary font-medium hover:bg-white-80 transition-all duration-200 active:opacity-80"
                style={{ minHeight: '44px' }}
              >
                {initialMediaUrl ? 'Save' : 'Add'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUploadModal;


