import { useState } from 'react';
import Modal from 'react-modal';

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

  const handleSubmit = () => {
    if (text.trim()) {
      onConfirm(text, fontSize, color, fontFamily);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add Text"
      className="bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-w-lg w-full p-6 mx-4 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
      ariaHideApp={false}
    >
          <h3 className="text-xl font-primary font-bold text-text-primary mb-4">
            Add Text
          </h3>
          
          {/* Divider */}
          <div className="border-b border-border mb-6 -mx-6" style={{ width: 'calc(100% + 3rem)' }}></div>

          <div className="mb-5">
            <label className="block text-sm font-secondary font-medium text-text-secondary mb-2">
              Text Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none resize-none"
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
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none"
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
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none"
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
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none"
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
              className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary hover:bg-grey-bg-4 transition-all duration-200 active:opacity-80"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-white text-black font-secondary hover:bg-white-90 transition-all duration-200 active:opacity-80"
              style={{ minHeight: '44px' }}
            >
              Add Text
            </button>
          </div>
    </Modal>
  );
};

export default TextEditorModal;

