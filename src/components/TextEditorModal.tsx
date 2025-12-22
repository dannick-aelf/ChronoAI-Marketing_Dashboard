import { useState } from 'react';

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string, fontSize: number, color: string, fontFamily: string) => void;
  initialText?: string;
  initialFontSize?: number;
  initialColor?: string;
  initialFontFamily?: string;
  key?: string | number;
}

const TextEditorModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialText = 'Text',
  initialFontSize = 24,
  initialColor = '#FFFFFF',
  initialFontFamily = 'Space Grotesk',
}: TextEditorModalProps) => {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [color, setColor] = useState(initialColor);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (text.trim()) {
      onConfirm(text, fontSize, color, fontFamily);
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-primary text-text-primary mb-6">
            Add Text
          </h3>

          <div className="mb-5">
            <label className="block text-sm font-secondary font-medium text-text-secondary mb-2">
              Text Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary resize-none"
              rows={3}
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col">
              <label className="block text-sm font-secondary font-medium text-text-secondary mb-2">
                Font Size
              </label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(8, Math.min(200, parseInt(e.target.value) || 24)))}
                min="8"
                max="200"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary"
                style={{ minHeight: '44px' }}
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-secondary font-medium text-text-secondary mb-2">
                Color
              </label>
              <div className="flex gap-2 items-stretch">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-11 rounded-lg border border-border cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary"
                  style={{ minHeight: '44px', width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-secondary font-medium text-text-secondary mb-2">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary"
              style={{ minHeight: '44px' }}
            >
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="Didot">Didot</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          </div>

          <div className="mb-6 p-4 rounded-lg border border-border bg-grey-bg-3 min-h-[100px] flex flex-col justify-center">
            <p className="text-sm font-secondary text-text-secondary mb-3">Preview:</p>
            <div
              style={{
                fontSize: `${fontSize}px`,
                color: color,
                fontFamily: fontFamily,
              }}
              className="text-center"
            >
              {text || 'Text'}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary font-medium hover:bg-grey-bg-4 transition-all duration-200 active:opacity-80"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-orange-primary text-white font-secondary font-medium hover:bg-orange-secondary transition-all duration-200 active:opacity-80"
              style={{ minHeight: '44px' }}
            >
              Add Text
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TextEditorModal;

