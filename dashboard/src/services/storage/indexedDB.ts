// Storage implementation using IndexedDB

import {
  saveCanvases as dbSaveCanvases,
  getCanvases as dbGetCanvases,
  saveCanvasObjects as dbSaveCanvasObjects,
  getCanvasObjects as dbGetCanvasObjects,
} from '../../db';
import type { StoredCanvases, StoredCanvasObjects } from './types';

export const storageService = {
  // Canvas operations with tab support
  async saveCanvases(canvases: StoredCanvases, tab?: string): Promise<void> {
    await dbSaveCanvases(canvases, tab);
  },

  async loadCanvases(tab?: string): Promise<StoredCanvases | undefined> {
    const result = await dbGetCanvases(tab);
    // Type guard to ensure result matches StoredCanvases structure
    if (result && '4:5' in result && '9:16' in result) {
      return result as StoredCanvases;
    }
    return undefined;
  },

  // Canvas objects operations with tab support
  async saveCanvasObjects(canvasObjects: StoredCanvasObjects, tab?: string): Promise<void> {
    await dbSaveCanvasObjects(canvasObjects, tab);
  },

  async loadCanvasObjects(tab?: string): Promise<StoredCanvasObjects | undefined> {
    return await dbGetCanvasObjects(tab);
  },
};

