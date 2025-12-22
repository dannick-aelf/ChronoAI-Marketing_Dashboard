// Data interfaces for storage

export interface CanvasItem {
  id: string;
  aspectRatio: '4:5' | '9:16';
}

export interface StoredCanvases {
  '4:5': CanvasItem[];
  '9:16': CanvasItem[];
}

export interface StoredCanvasObjects {
  [key: string]: any[];
}

