// Storage implementation using IndexedDB

import {
  saveCanvases as dbSaveCanvases,
  getCanvases as dbGetCanvases,
  saveCanvasObjects as dbSaveCanvasObjects,
  getCanvasObjects as dbGetCanvasObjects,
} from '../../db';
import type { StoredCanvases, StoredCanvasObjects } from './types';

export const storageService = {
  // Canvas operations
  async saveCanvases(canvases: StoredCanvases): Promise<void> {
    await dbSaveCanvases(canvases);
  },

  async loadCanvases(): Promise<StoredCanvases | undefined> {
    const result = await dbGetCanvases();
    // Type guard to ensure result matches StoredCanvases structure
    if (result && '4:5' in result && '9:16' in result) {
      return result as StoredCanvases;
    }
    return undefined;
  },

  // Canvas objects operations
  async saveCanvasObjects(canvasObjects: StoredCanvasObjects): Promise<void> {
    await dbSaveCanvasObjects(canvasObjects);
  },

  async loadCanvasObjects(): Promise<StoredCanvasObjects | undefined> {
    return await dbGetCanvasObjects();
  },
};

