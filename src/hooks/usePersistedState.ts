// Custom hook for persisted state using IndexedDB

import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storage/indexedDB';
import type { StoredCanvases, StoredCanvasObjects } from '../services/storage/types';

export const usePersistedCanvases = (initialValue: StoredCanvases, tab?: string) => {
  const [canvases, setCanvases] = useState<StoredCanvases>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadCanvases = async () => {
      try {
        const stored = await storageService.loadCanvases(tab);
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
  }, [tab]);

  // Save to IndexedDB whenever canvases change
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await storageService.saveCanvases(canvases, tab);
          console.log('Canvases saved successfully');
        } catch (error: unknown) {
          console.error('Failed to save canvases:', error);
          // Don't throw - we don't want to break the UI if save fails
        }
      };
      
      saveData();
    }
  }, [canvases, isLoading, tab]);

  const updateCanvases = useCallback((updater: (prev: StoredCanvases) => StoredCanvases) => {
    setCanvases(updater);
  }, []);

  return [canvases, updateCanvases, isLoading] as const;
};

export const usePersistedCanvasObjects = (initialValue: StoredCanvasObjects, tab?: string) => {
  const [canvasObjects, setCanvasObjects] = useState<StoredCanvasObjects>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadCanvasObjects = async () => {
      try {
        const stored = await storageService.loadCanvasObjects(tab);
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
  }, [tab]);

  // Save to IndexedDB whenever canvasObjects change
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          // Calculate approximate size for debugging
          const jsonString = JSON.stringify(canvasObjects);
          const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
          
          if (sizeInMB > 20) {
            console.warn(`Large canvas objects detected: ${sizeInMB.toFixed(2)}MB. This may take longer to save.`);
          }
          
          await storageService.saveCanvasObjects(canvasObjects, tab);
          console.log(`Canvas objects saved successfully (${sizeInMB.toFixed(2)}MB)`);
        } catch (error: unknown) {
          console.error('Failed to save canvas objects:', error);
          // Don't throw - we don't want to break the UI if save fails
        }
      };
      
      saveData();
    }
  }, [canvasObjects, isLoading, tab]);

  const updateCanvasObjects = useCallback((updater: (prev: StoredCanvasObjects) => StoredCanvasObjects) => {
    setCanvasObjects(updater);
  }, []);

  return [canvasObjects, updateCanvasObjects, isLoading] as const;
};

