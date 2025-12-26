// Storage implementation using Cloudflare Workers KV

import { kvService } from './kv';
import type { StoredCanvases, StoredCanvasObjects } from './types';

export const storageService = {
  // Canvas operations with tab support
  async saveCanvases(canvases: StoredCanvases, tab?: string): Promise<void> {
    await kvService.saveCanvases(canvases, tab);
  },

  async loadCanvases(tab?: string): Promise<StoredCanvases | undefined> {
    return await kvService.loadCanvases(tab);
  },

  // Canvas objects operations with tab support
  async saveCanvasObjects(canvasObjects: StoredCanvasObjects, tab?: string): Promise<void> {
    await kvService.saveCanvasObjects(canvasObjects, tab);
  },

  async loadCanvasObjects(tab?: string): Promise<StoredCanvasObjects | undefined> {
    return await kvService.loadCanvasObjects(tab);
  },
};

