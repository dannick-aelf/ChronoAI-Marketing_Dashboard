import { useState, useRef, useEffect } from 'react';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, type: 'image' | 'video') => void;
  initialMediaUrl?: string;
  initialMediaType?: 'image' | 'video';
}

const ImageUploadModal = ({ isOpen, onClose, onConfirm, initialMediaUrl, initialMediaType }: MediaUploadModalProps) => {
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl || '');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(initialMediaType || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when initial values change (when modal opens with existing image)
  useEffect(() => {
    if (isOpen) {
      setMediaUrl(initialMediaUrl || '');
      setMediaType(initialMediaType || null);
    }
  }, [isOpen, initialMediaUrl, initialMediaType]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleUrlSubmit = () => {
    if (mediaUrl.trim()) {
      // Determine type from URL or use detected type
      const type = mediaType || (mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image');
      onConfirm(mediaUrl, type);
      setMediaUrl('');
      setMediaType(null);
      setError('');
      onClose();
    } else {
      setError('Please provide a media URL or select a file');
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
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 rounded-lg border border-border bg-grey-bg-3 hover:bg-grey-bg-4 text-text-primary font-secondary transition-all duration-200"
            >
              Choose File (Image or Video)
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-secondary text-text-secondary mb-2">
              Or Enter Media URL
            </label>
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => {
                setMediaUrl(e.target.value);
                setError('');
                // Auto-detect type from URL
                if (e.target.value.match(/\.(mp4|webm|ogg|mov)$/i)) {
                  setMediaType('video');
                } else if (e.target.value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                  setMediaType('image');
                }
              }}
              placeholder="https://example.com/image.jpg or video.mp4"
              className="w-full px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-orange-primary mb-4 font-secondary">{error}</p>
          )}

          {mediaUrl && (
            <div className="mb-4">
              <div className="w-full rounded-lg border-2 border-border bg-grey-bg-3 overflow-hidden relative" style={{ aspectRatio: mediaType === 'video' ? '9/16' : '4/5', minHeight: '300px', maxHeight: '500px' }}>
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
              className="px-4 py-2 rounded-lg bg-orange-primary text-white font-secondary font-medium hover:bg-orange-secondary transition-all duration-200 active:opacity-80"
              style={{ minHeight: '44px' }}
            >
              Add {mediaType === 'video' ? 'Video' : 'Image'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUploadModal;


