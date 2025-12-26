// Cloudflare Pages Functions KV client service

import type { StoredCanvases, StoredCanvasObjects } from './types';

// Pages Function endpoint
const API_URL = '/api/storage';

interface KVResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function kvRequest<T>(
  operation: 'get' | 'put' | 'delete' | 'list',
  key: string,
  value?: any,
  tab?: string
): Promise<T | undefined> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        key,
        value,
        tab,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`KV request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: KVResponse<T> = await response.json();

    if (!result.success) {
      const errorMsg = result.error || 'KV operation failed';
      console.error(`KV ${operation} failed:`, errorMsg);
      throw new Error(errorMsg);
    }

    return result.data;
  } catch (error) {
    console.error(`KV ${operation} error for key "${key}":`, error);
    throw error;
  }
}

export const kvService = {
  // Canvas operations with tab support
  async saveCanvases(canvases: StoredCanvases, tab?: string): Promise<void> {
    await kvRequest('put', 'canvases', canvases, tab);
  },

  async loadCanvases(tab?: string): Promise<StoredCanvases | undefined> {
    const result = await kvRequest<StoredCanvases>('get', 'canvases', undefined, tab);
    // Type guard to ensure result matches StoredCanvases structure
    if (result && '4:5' in result && '9:16' in result) {
      return result as StoredCanvases;
    }
    return undefined;
  },

  // Canvas objects operations with tab support
  async saveCanvasObjects(canvasObjects: StoredCanvasObjects, tab?: string): Promise<void> {
    await kvRequest('put', 'canvasObjects', canvasObjects, tab);
  },

  async loadCanvasObjects(tab?: string): Promise<StoredCanvasObjects | undefined> {
    return await kvRequest<StoredCanvasObjects>('get', 'canvasObjects', undefined, tab);
  },
};
