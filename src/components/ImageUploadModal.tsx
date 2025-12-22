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
  aspectRatio?: string;
  allowMultiple?: boolean;
}

const ImageUploadModal = ({ isOpen, onClose, onConfirm, onConfirmMultiple, initialMediaUrl, initialMediaType, initialTags, initialComments, allowMultiple }: MediaUploadModalProps) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [tagInput, setTagInput] = useState('');
  const [comments, setComments] = useState<string>(initialComments || '');
  const [error, setError] = useState('');
  // Uploading state for future use (e.g., showing loading indicator)
  // const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when initial values change (when modal opens with existing image)
  useEffect(() => {
    if (isOpen) {
      setMediaUrl(initialMediaUrl || '');
      setMediaType(initialMediaType || null);
      setTags(initialTags || []);
      setComments(initialComments || '');
    } else {
      // Reset when modal closes
      setMediaUrl('');
      setMediaType(null);
      setTags([]);
      setTagInput('');
      setComments('');
      setError('');
    }
  }, [isOpen, initialMediaUrl, initialMediaType, initialTags, initialComments]);

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

    // If multiple files and onConfirmMultiple is provided, handle multiple uploads
    if (allowMultiple && onConfirmMultiple && files.length >= 1) {
      // setUploading(true);
      setError('');
      
      const filePromises = Array.from(files).map((file) => {
        return new Promise<{ url: string; type: 'image' | 'video'; tags?: string[]; comments?: string }>((resolve, reject) => {
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
        onConfirmMultiple(results);
        // setUploading(false);
        setTags([]);
        setTagInput('');
        setComments('');
        setError('');
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to upload some files');
        // setUploading(false);
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
      onConfirm(mediaUrl, type, tags.length > 0 ? tags : undefined);
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
    setError('');
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-w-lg w-full p-6"
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
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:border-white"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary hover:bg-grey-bg-4 transition-all duration-200"
              >
                Add
              </button>
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
              className="w-full px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:border-white resize-none"
            />
          </div>

          {mediaUrl && (
            <div className="mb-4">
              <div className="w-full rounded-lg border-2 border-border bg-grey-bg-3 overflow-hidden relative" style={{ aspectRatio: '4/5', minHeight: '300px', maxHeight: '500px' }}>
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    controls
                    onError={() => setError('Invalid video URL')}
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setError('Invalid image URL')}
                  />
                )}
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
            <button
              onClick={handleUrlSubmit}
              className="px-4 py-2 rounded-lg bg-white text-black font-secondary font-medium hover:bg-white-90 transition-all duration-200 active:opacity-80"
              style={{ minHeight: '44px' }}
            >
              {initialMediaUrl ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUploadModal;


