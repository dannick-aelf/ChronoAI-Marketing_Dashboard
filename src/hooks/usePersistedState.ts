// Custom hook for persisted state using IndexedDB

import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storage/indexedDB';
import type { StoredCanvases, StoredCanvasObjects } from '../services/storage/types';

export const usePersistedCanvases = (initialValue: StoredCanvases) => {
  const [canvases, setCanvases] = useState<StoredCanvases>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadCanvases = async () => {
      try {
        const stored = await storageService.loadCanvases();
        if (stored) {
          setCanvases(stored);
        }
      } catch (error: unknown) {
        console.error('Failed to load canvases:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCanvases();
  }, []);

  // Save to IndexedDB whenever canvases change
  useEffect(() => {
    if (!isLoading) {
      storageService.saveCanvases(canvases).catch((error: unknown) => {
        console.error('Failed to save canvases:', error);
      });
    }
  }, [canvases, isLoading]);

  const updateCanvases = useCallback((updater: (prev: StoredCanvases) => StoredCanvases) => {
    setCanvases(updater);
  }, []);

  return [canvases, updateCanvases, isLoading] as const;
};

export const usePersistedCanvasObjects = (initialValue: StoredCanvasObjects) => {
  const [canvasObjects, setCanvasObjects] = useState<StoredCanvasObjects>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadCanvasObjects = async () => {
      try {
        const stored = await storageService.loadCanvasObjects();
        if (stored) {
          setCanvasObjects(stored);
        }
      } catch (error: unknown) {
        console.error('Failed to load canvas objects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCanvasObjects();
  }, []);

  // Save to IndexedDB whenever canvasObjects change
  useEffect(() => {
    if (!isLoading) {
      storageService.saveCanvasObjects(canvasObjects).catch((error: unknown) => {
        console.error('Failed to save canvas objects:', error);
      });
    }
  }, [canvasObjects, isLoading]);

  const updateCanvasObjects = useCallback((updater: (prev: StoredCanvasObjects) => StoredCanvasObjects) => {
    setCanvasObjects(updater);
  }, []);

  return [canvasObjects, updateCanvasObjects, isLoading] as const;
};

