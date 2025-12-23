import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import Canvas from './Canvas';
import DeleteConfirmModal from './DeleteConfirmModal';
import ImageUploadModal from './ImageUploadModal';
import { SkeletonDashboard } from './Skeleton';
import { type CanvasObject } from './CanvasEditor';
import { usePersistedCanvases, usePersistedCanvasObjects } from '../hooks/usePersistedState';
import { storageService } from '../services/storage/indexedDB';
import type { CanvasItem } from '../services/storage/types';

type Category = '4:5' | '9:16';
type TabType = 'GodGPT' | 'Lumen';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>('Lumen');
  const [selectedCategory, setSelectedCategory] = useState<Category>('4:5');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCanvases, setSelectedCanvases] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showAddTagsModal, setShowAddTagsModal] = useState(false);
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; canvasId: string | null }>({
    isOpen: false,
    canvasId: null,
  });
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [lumenCanvases, setLumenCanvases, lumenCanvasesLoading] = usePersistedCanvases({
    '4:5': [{ id: 'canvas-1', aspectRatio: '4:5' }],
    '9:16': [{ id: 'canvas-1', aspectRatio: '9:16' }],
  }, 'Lumen');
  const [lumenCanvasObjects, setLumenCanvasObjects, lumenCanvasObjectsLoading] = usePersistedCanvasObjects({}, 'Lumen');
  
  const [godgptCanvases, setGodgptCanvases, godgptCanvasesLoading] = usePersistedCanvases({
    '4:5': [{ id: 'canvas-1', aspectRatio: '4:5' }],
    '9:16': [{ id: 'canvas-1', aspectRatio: '9:16' }],
  }, 'GodGPT');
  const [godgptCanvasObjects, setGodgptCanvasObjects, godgptCanvasObjectsLoading] = usePersistedCanvasObjects({}, 'GodGPT');

  useEffect(() => {
    const migrateData = async () => {
      try {
        const lumenData = await storageService.loadCanvases('Lumen');
        if (!lumenData) {
          const oldData = await storageService.loadCanvases();
          if (oldData && ('4:5' in oldData || '9:16' in oldData)) {
            await storageService.saveCanvases(oldData, 'Lumen');
            const oldObjects = await storageService.loadCanvasObjects();
            if (oldObjects) {
              await storageService.saveCanvasObjects(oldObjects, 'Lumen');
            }
          }
        }
      } catch (error) {
        console.error('Error during data migration:', error);
      }
    };
    migrateData();
  }, []);

  useEffect(() => {
    setSelectedCanvases(new Set());
    setSearchQuery('');
    setSelectedTags(new Set());
    setShowTagDropdown(false);
    setShowDateDropdown(false);
    setShowProductDropdown(false);
  }, [selectedTab]);

  const canvases = selectedTab === 'Lumen' ? lumenCanvases : godgptCanvases;
  const setCanvases = selectedTab === 'Lumen' ? setLumenCanvases : setGodgptCanvases;
  const canvasesLoading = selectedTab === 'Lumen' ? lumenCanvasesLoading : godgptCanvasesLoading;
  const canvasObjects = selectedTab === 'Lumen' ? lumenCanvasObjects : godgptCanvasObjects;
  const setCanvasObjects = selectedTab === 'Lumen' ? setLumenCanvasObjects : setGodgptCanvasObjects;
  const canvasObjectsLoading = selectedTab === 'Lumen' ? lumenCanvasObjectsLoading : godgptCanvasObjectsLoading;

  const categories: { id: Category; label: string; ratio: string }[] = [
    { id: '4:5', label: '4:5', ratio: '4:5' },
    { id: '9:16', label: '9:16', ratio: '9:16' },
  ];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'GodGPT', label: 'GodGPT' },
    { id: 'Lumen', label: 'Lumen' },
  ];

  const handleMultipleUploads = (files: Array<{ url: string; type: 'image' | 'video'; tags?: string[]; comments?: string }>) => {
    const baseTime = Date.now();
    const newCanvases: CanvasItem[] = files.map((_, index) => ({
      id: `canvas-${baseTime}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      aspectRatio: selectedCategory,
    }));

    setCanvases((prev) => {
      return {
        ...prev,
        [selectedCategory]: [...newCanvases, ...prev[selectedCategory]],
      };
    });

    files.forEach((file, index) => {
      const canvasId = newCanvases[index].id;
      const canvasKey = getCanvasKey(selectedCategory, canvasId);
      const { width: actualWidth, height: actualHeight } = selectedCategory === '4:5' 
        ? { width: 1080, height: 1350 }
        : { width: 1080, height: 1920 };
      
      const newObject: CanvasObject = {
        id: `${file.type}-${Date.now()}-${index}`,
        type: file.type,
        x: 0,
        y: 0,
        width: actualWidth,
        height: actualHeight,
        content: file.url,
        dateUploaded: new Date().toISOString(),
        aspectRatio: selectedCategory,
        tags: file.tags,
        comments: file.comments,
      };

      setCanvasObjects((prev) => ({
        ...prev,
        [canvasKey]: [newObject],
      }));
    });
  };

  const handleCanvasReorder = (draggedIndex: number, targetIndex: number) => {
    setCanvases((prev) => {
      const currentCanvases = [...prev[selectedCategory]];
      const [draggedCanvas] = currentCanvases.splice(draggedIndex, 1);
      currentCanvases.splice(targetIndex, 0, draggedCanvas);
      return {
        ...prev,
        [selectedCategory]: currentCanvases,
      };
    });
  };


  const handleDeleteClick = (canvasId: string) => {
    setDeleteModal({ isOpen: true, canvasId });
  };

  const handleToggleCanvasSelection = (canvasId: string) => {
    setSelectedCanvases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(canvasId)) {
        newSet.delete(canvasId);
      } else {
        newSet.add(canvasId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const currentCanvases = canvases[selectedCategory];
    if (selectedCanvases.size === currentCanvases.length) {
      setSelectedCanvases(new Set());
    } else {
      setSelectedCanvases(new Set(currentCanvases.map(c => c.id)));
    }
  };



  const handleBulkDownload = async () => {
    if (selectedCanvases.size === 0) return;
    if (isDownloading) return;

    setIsDownloading(true);
    
    try {
      const selectedArray = Array.from(selectedCanvases);
      const zip = new JSZip();
      const allFiles: Array<{ url: string; filename: string; canvasId: string }> = [];

      for (const canvasId of selectedArray) {
        const canvasKey = getCanvasKey(selectedCategory, canvasId);
        const objects = canvasObjects[canvasKey] || [];
        const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
        
        for (let i = 0; i < mediaObjects.length; i++) {
          const mediaObject = mediaObjects[i];
          const url = mediaObject.content;
          
          if (!url) continue;
          
          const extension = mediaObject.type === 'image' ? 'png' : 'mp4';
          let filename = `${canvasId}-${mediaObject.type}-${i + 1}.${extension}`;
          
          if (!url.startsWith('data:')) {
            try {
              const urlPath = new URL(url).pathname;
              const originalFilename = urlPath.split('/').pop() || '';
              if (originalFilename && originalFilename.includes('.')) {
                const nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
                const ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
                filename = `${canvasId}-${nameWithoutExt}${ext}`;
              }
            } catch {
              // Fallback to default filename
            }
          }
          
          allFiles.push({ url, filename, canvasId });
        }
      }
      
      if (allFiles.length === 0) {
        setIsDownloading(false);
        return;
      }
      
      for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i];
        try {
          let blob: Blob;
          if (file.url.startsWith('data:')) {
            const response = await fetch(file.url);
            if (!response.ok) {
              throw new Error(`Failed to fetch data URL: ${response.statusText}`);
            }
            blob = await response.blob();
          } else {
            const response = await fetch(file.url);
            if (!response.ok) {
              throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
            }
            blob = await response.blob();
          }
          
          zip.file(file.filename, blob);
        } catch (error) {
          console.error(`Failed to fetch file ${file.filename}:`, error);
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `canvases-${selectedCategory}-${Date.now()}.zip`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(zipUrl), 100);
    } catch (error) {
      console.error('Error during bulk download:', error);
    } finally {
      setIsDownloading(false);
    }
  };


  const getCanvasKey = (category: Category, canvasId: string) => {
    return `${selectedTab}-${category}-${canvasId}`;
  };

  const confirmDelete = () => {
    if (!deleteModal.canvasId) {
      setDeleteModal({ isOpen: false, canvasId: null });
      return;
    }

    const canvasKey = getCanvasKey(selectedCategory, deleteModal.canvasId);
    setCanvases((prev) => {
      return {
        ...prev,
        [selectedCategory]: prev[selectedCategory].filter(
          (canvas) => canvas.id !== deleteModal.canvasId
        ),
      };
    });
      setCanvasObjects((prev) => {
      const updated = { ...prev };
      delete updated[canvasKey];
      return updated;
    });
    setDeleteModal({ isOpen: false, canvasId: null });
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, canvasId: null });
  };

  const handleObjectsChange = (category: Category, canvasId: string, objects: CanvasObject[]) => {
    const key = getCanvasKey(category, canvasId);
    
    if (objects.length === 0) {
      setCanvases((prev) => ({
        ...prev,
        [category]: prev[category].filter((canvas) => canvas.id !== canvasId),
      }));
      // Remove canvas objects
      setCanvasObjects((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      return;
    }
    
    // Otherwise, update the objects
    setCanvasObjects((prev) => ({
      ...prev,
      [key]: objects,
    }));
  };

  // Show loading state while data is being loaded from IndexedDB
  if (canvasesLoading || canvasObjectsLoading) {
    return <SkeletonDashboard />;
  }


  // Get available tags for autocomplete
  const getAvailableTags = () => {
    const allTags = new Set<string>();
    const currentCanvases = canvases[selectedCategory];
    currentCanvases.forEach((canvas) => {
      const canvasKey = getCanvasKey(selectedCategory, canvas.id);
      const objects = canvasObjects[canvasKey] || [];
      const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
      mediaObjects.forEach((obj) => {
        if (obj.tags && obj.tags.length > 0) {
          obj.tags.forEach((tag: string) => allTags.add(tag));
        }
      });
    });
    return Array.from(allTags).sort();
  };

  // Get tag suggestions based on input
  const getTagSuggestions = () => {
    const availableTags = getAvailableTags();
    if (!tagInput.trim()) {
      return availableTags
        .filter(tag => {
          const tagLower = tag.toLowerCase();
          return !tagsToAdd.some(t => t.toLowerCase() === tagLower);
        })
        .slice(0, 5);
    }
    
    const inputLower = tagInput.toLowerCase();
    return availableTags
      .filter(tag => {
        const tagLower = tag.toLowerCase();
        return tagLower.includes(inputLower) && !tagsToAdd.some(t => t.toLowerCase() === tagLower);
      })
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(inputLower);
        const bStarts = b.toLowerCase().startsWith(inputLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 5);
  };

  const tagSuggestions = getTagSuggestions();

  const handleAddTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTag = tagInput.trim();
      const tagLower = newTag.toLowerCase();
      if (!tagsToAdd.some(t => t.toLowerCase() === tagLower)) {
        setTagsToAdd([...tagsToAdd, newTag]);
      }
      setTagInput('');
      setShowTagSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
  };

  const handleAddTagFromSuggestion = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (!tagsToAdd.some(t => t.toLowerCase() === tagLower)) {
      setTagsToAdd([...tagsToAdd, tag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsToAdd(tagsToAdd.filter(tag => tag !== tagToRemove));
  };

  const handleBulkAddTags = () => {
    if (tagsToAdd.length === 0 || selectedCanvases.size === 0) {
      setShowAddTagsModal(false);
      setTagsToAdd([]);
      setTagInput('');
      return;
    }

    // Add tags to all selected canvases
    selectedCanvases.forEach((canvasId) => {
      const canvasKey = getCanvasKey(selectedCategory, canvasId);
      const objects = canvasObjects[canvasKey] || [];
      
      // Update all media objects (images/videos) with new tags
      const updatedObjects = objects.map((obj) => {
        if (obj.type === 'image' || obj.type === 'video') {
          const existingTags = obj.tags || [];
          // Merge tags, avoiding duplicates (case-insensitive)
          const mergedTags = [...existingTags];
          tagsToAdd.forEach((newTag) => {
            const tagLower = newTag.toLowerCase();
            if (!mergedTags.some(t => t.toLowerCase() === tagLower)) {
              mergedTags.push(newTag);
            }
          });
          return { ...obj, tags: mergedTags };
        }
        return obj;
      });

      setCanvasObjects((prev) => ({
        ...prev,
        [canvasKey]: updatedObjects,
      }));
    });

    setShowAddTagsModal(false);
    setTagsToAdd([]);
    setTagInput('');
  };

  const currentCanvases = canvases[selectedCategory];

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-grey-bg-2 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 
            className="font-primary text-text-primary w-full"
            style={{
              fontSize: 'clamp(0.75rem, 8vw, 1.5rem)',
              lineHeight: '1.2',
            }}
          >
            <div className="italic">ChronoAI</div>
            <div className="font-bold" style={{ fontSize: '18px' }}>Marketing Dashboard</div>
          </h1>
          
          {/* Filter Section */}
          <div className="mt-4 space-y-4">
            {/* Product Selector */}
            <div>
              <label className="block text-sm font-secondary text-text-secondary mb-2">
                Product
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductDropdown(!showProductDropdown);
                    setShowDateDropdown(false);
                    setShowTagDropdown(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary font-bold text-sm focus:outline-none focus:border-border flex items-center justify-between hover:bg-grey-bg-4 transition-colors duration-200"
                  style={{ minHeight: '44px' }}
                >
                  <span>
                    {selectedTab === 'Lumen' ? 'Lumen' : 'GodGPT'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showProductDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Product Dropdown */}
                {showProductDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-grey-bg-2 border border-border rounded-lg shadow-elevated">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setSelectedTab(tab.id);
                          setShowProductDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm font-secondary font-bold transition-colors duration-200 ${
                          selectedTab === tab.id
                            ? 'bg-grey-bg-3 text-text-primary'
                            : 'text-text-primary hover:!bg-grey-bg-4'
                        }`}
                        style={{ width: '100%' }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Date Search */}
            <div>
              <label className="block text-sm font-secondary text-text-secondary mb-2">
                Date
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDateDropdown(!showDateDropdown);
                    setShowProductDropdown(false);
                    setShowTagDropdown(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary text-sm focus:outline-none focus:border-border flex items-center justify-between hover:bg-grey-bg-4 transition-colors duration-200"
                  style={{ minHeight: '44px' }}
                >
                  <span className={searchQuery ? '' : 'text-text-secondary'}>
                    {searchQuery || 'Select a date...'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Date Dropdown */}
                {showDateDropdown && (() => {
                    // Collect all unique dates from all canvases
                    const dateSet = new Set<string>();
                    currentCanvases.forEach((canvas) => {
                      const canvasKey = getCanvasKey(selectedCategory, canvas.id);
                      const objects = canvasObjects[canvasKey] || [];
                      const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
                      
                      if (mediaObjects.length === 0) return;
                      
                      const dates = mediaObjects
                        .map(obj => obj.dateUploaded ? new Date(obj.dateUploaded) : null)
                        .filter((date): date is Date => date !== null);
                      
                      if (dates.length === 0) return;
                      
                      const canvasDate = new Date(Math.min(...dates.map(d => d.getTime())));
                      const dateKey = canvasDate.toDateString();
                      dateSet.add(dateKey);
                    });
                    
                    const formatDateHeader = (date: Date): string => {
                      const today = new Date();
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      
                      const dateStr = date.toDateString();
                      const todayStr = today.toDateString();
                      const yesterdayStr = yesterday.toDateString();
                      
                      if (dateStr === todayStr) return 'Today';
                      if (dateStr === yesterdayStr) return 'Yesterday';
                      
                      return date.toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      });
                    };
                    
                    const datesArray = Array.from(dateSet)
                      .map(dateStr => new Date(dateStr))
                      .sort((a, b) => b.getTime() - a.getTime()); // Most recent first
                    
                    if (datesArray.length === 0) {
                      return (
                        <div className="absolute z-50 w-full mt-1 bg-grey-bg-2 border border-border rounded-lg shadow-elevated p-3">
                          <p className="text-sm font-secondary text-text-secondary">No dates available</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="absolute z-50 w-full mt-1 bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setShowDateDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm font-secondary text-text-secondary hover:!bg-grey-bg-4 hover:text-text-primary transition-colors duration-200"
                          style={{ width: '100%' }}
                        >
                          Clear filter
                        </button>
                        {datesArray.map((date) => {
                          const dateLabel = formatDateHeader(date);
                          const dateKey = date.toDateString();
                          return (
                            <button
                              key={dateKey}
                              type="button"
                              onClick={() => {
                                setSearchQuery(dateLabel);
                                setShowDateDropdown(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm font-secondary transition-colors duration-200 ${
                                searchQuery === dateLabel
                                  ? 'bg-grey-bg-3 text-text-primary'
                                  : 'text-text-primary hover:!bg-grey-bg-4'
                              }`}
                              style={{ width: '100%' }}
                            >
                              {dateLabel}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
              </div>
            </div>

            {/* Tags Search */}
            <div>
              <label className="block text-sm font-secondary text-text-secondary mb-2">
                Tags
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowTagDropdown(!showTagDropdown);
                    setShowProductDropdown(false);
                    setShowDateDropdown(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary text-sm focus:outline-none focus:border-border flex items-center justify-between hover:bg-grey-bg-4 transition-colors duration-200"
                  style={{ minHeight: '44px' }}
                >
                  <span className={selectedTags.size > 0 ? '' : 'text-text-secondary'}>
                    {selectedTags.size > 0 
                      ? `${selectedTags.size} ${selectedTags.size === 1 ? 'tag' : 'tags'} selected`
                      : 'Select tags...'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Tag Dropdown */}
                {showTagDropdown && (() => {
                    // Collect all unique tags from all canvases
                    const allTags = new Set<string>();
                    currentCanvases.forEach((canvas) => {
                      const canvasKey = getCanvasKey(selectedCategory, canvas.id);
                      const objects = canvasObjects[canvasKey] || [];
                      const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
                      mediaObjects.forEach((obj) => {
                        if (obj.tags && obj.tags.length > 0) {
                          obj.tags.forEach((tag: string) => allTags.add(tag));
                        }
                      });
                    });
                    
                    const tagsArray = Array.from(allTags).sort();
                    
                    if (tagsArray.length === 0) {
                      return (
                        <div className="absolute z-50 w-full mt-1 bg-grey-bg-2 border border-border rounded-lg shadow-elevated p-3">
                          <p className="text-sm font-secondary text-text-secondary">No tags available</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="absolute z-50 w-full mt-1 bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTags(new Set());
                            setShowTagDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm font-secondary text-text-secondary hover:!bg-grey-bg-4 hover:text-text-primary transition-colors duration-200"
                          style={{ width: '100%' }}
                        >
                          Clear filter
                        </button>
                        {tagsArray.map((tag) => {
                          const isSelected = selectedTags.has(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const newSelectedTags = new Set(selectedTags);
                                if (isSelected) {
                                  newSelectedTags.delete(tag);
                                } else {
                                  newSelectedTags.add(tag);
                                }
                                setSelectedTags(newSelectedTags);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm font-secondary transition-colors duration-200 flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-grey-bg-3 text-text-primary'
                                  : 'text-text-primary hover:!bg-grey-bg-4'
                              }`}
                              style={{ width: '100%' }}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'bg-white border-border'
                                  : 'bg-transparent border-border'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span>{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
              </div>
            </div>
          </div>
        </div>

        {/* Type Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="mb-4">
            <h2 className="text-sm font-secondary font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Type
            </h2>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-secondary
                  ${
                    selectedCategory === category.id
                      ? 'bg-grey-bg-3 text-text-primary'
                      : 'text-text-secondary hover:bg-grey-bg-3 hover:text-text-primary'
                  }
                  active:opacity-80 active:scale-[0.98]
                `}
                style={{
                  minHeight: '48px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{category.label}</span>
                  {selectedCategory === category.id && (
                    <div className="w-2 h-2 rounded-full bg-active-indicator" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Theme Toggle Button - Bottom Left */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-lg bg-button-bg text-button-text border border-border hover:bg-button-bg-hover transition-all duration-200 active:opacity-80 flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              // Sun icon for light mode
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-bg-primary">
        <div className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
            <h2 className="text-xl font-primary text-text-primary mb-1">
              {selectedCategory === '4:5' ? '4:5' : '9:16'}
            </h2>
            <p className="text-sm font-secondary text-text-secondary">
              {selectedCategory === '4:5'
                ? '1080 × 1350 px'
                : '1080 × 1920 px'}
            </p>
          </div>
              {/* Add Canvas Button - Opens upload modal for multiple files */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-border bg-grey-bg-2 hover:bg-grey-bg-3 flex items-center justify-center transition-all duration-200 active:opacity-80 active:scale-[0.98] flex-shrink-0"
                aria-label="Add new canvas"
              >
                <svg
                  className="w-6 h-6 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>

          {/* Selection Toolbar */}
          {selectedCanvases.size > 0 && (
            <div className="sticky top-0 z-40 mb-4 p-4 rounded-lg bg-grey-bg-3 border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-secondary text-text-primary">
                  {selectedCanvases.size} {selectedCanvases.size === 1 ? 'canvas' : 'canvases'} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm font-secondary text-text-secondary hover:text-text-primary transition-colors"
                >
                  {selectedCanvases.size === canvases[selectedCategory].length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddTagsModal(true)}
                  className="px-4 py-2 rounded-lg bg-grey-bg-4 hover:bg-white text-text-primary hover:text-black border border-border transition-all duration-200 active:opacity-80 flex items-center gap-2"
                  style={{ minHeight: '44px' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Add Tags
                </button>
                <button
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className={`px-4 py-2 rounded-lg font-secondary transition-all duration-200 active:opacity-80 flex items-center gap-2 ${
                    isDownloading 
                      ? 'bg-grey-bg-4 text-text-primary opacity-50 cursor-not-allowed border border-border' 
                      : 'bg-white text-black hover:bg-white-80'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedCanvases(new Set())}
                  className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary hover:bg-grey-bg-4 hover:text-text-primary transition-all duration-200 active:opacity-80"
                  style={{ minHeight: '44px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Canvas Container - Instagram Grid Layout */}
          <div className="pb-6">
            {/* Collect all objects from all canvases in the current category once */}
            {(() => {
              // Filter canvases based on search query - apply both date and tags filters (AND logic)
              let filteredCanvases = currentCanvases;
              
              // Apply date filter if selected
              if (searchQuery.trim()) {
                filteredCanvases = filteredCanvases.filter((canvas) => {
                  const canvasKey = getCanvasKey(selectedCategory, canvas.id);
                  const objects = canvasObjects[canvasKey] || [];
                  const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
                  
                  if (mediaObjects.length === 0) return false;
                  
                  // Get all dates from media objects
                  const dates = mediaObjects
                    .map(obj => obj.dateUploaded ? new Date(obj.dateUploaded) : null)
                    .filter((date): date is Date => date !== null);
                  
                  if (dates.length === 0) return false;
                  
                  // Get the earliest date (canvas date)
                  const canvasDate = new Date(Math.min(...dates.map(d => d.getTime())));
                  
                  // Parse search query - try different date formats
                  const queryLower = searchQuery.toLowerCase().trim();
                  
                  // Try to match common date formats
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  
                  // Check for "today" or "yesterday"
                  if (queryLower === 'today') {
                    return canvasDate.toDateString() === today.toDateString();
                  }
                  if (queryLower === 'yesterday') {
                    return canvasDate.toDateString() === yesterday.toDateString();
                  }
                  
                  // Try to parse as date
                  const searchDate = new Date(searchQuery);
                  if (!isNaN(searchDate.getTime())) {
                    // Match by date (ignore time)
                    return canvasDate.toDateString() === searchDate.toDateString();
                  }
                  
                  // Try to match date string formats
                  const canvasDateStr = canvasDate.toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }).toLowerCase();
                  
                  const canvasDateStrShort = canvasDate.toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  }).toLowerCase();
                  
                  const canvasDateStrNumeric = canvasDate.toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  });
                  
                  return canvasDateStr.includes(queryLower) || 
                         canvasDateStrShort.includes(queryLower) ||
                         canvasDateStrNumeric.includes(queryLower);
                });
              }
              
              if (selectedTags.size > 0) {
                filteredCanvases = filteredCanvases.filter((canvas) => {
                  const canvasKey = getCanvasKey(selectedCategory, canvas.id);
                  const objects = canvasObjects[canvasKey] || [];
                  const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
                  
                  return mediaObjects.some((obj) => {
                    if (!obj.tags || obj.tags.length === 0) return false;
                    const objTagsLower = obj.tags.map((t: string) => t.toLowerCase());
                    return Array.from(selectedTags).every(selectedTag => 
                      objTagsLower.includes(selectedTag.toLowerCase())
                    );
                  });
                });
              }
              
              const allCategoryObjects = filteredCanvases.flatMap((c) => {
                const key = getCanvasKey(selectedCategory, c.id);
                return canvasObjects[key] || [];
              });
              
              const canvasGroups = filteredCanvases.map((canvas) => {
                const key = getCanvasKey(selectedCategory, canvas.id);
                const objects = canvasObjects[key] || [];
                const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
                return {
                  canvasId: canvas.id,
                  mediaObjects: mediaObjects,
                };
              }).filter(group => group.mediaObjects.length > 0);
              
              const getCanvasDate = (canvasId: string): Date | null => {
                const key = getCanvasKey(selectedCategory, canvasId);
                const objects = canvasObjects[key] || [];
                const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
                if (mediaObjects.length === 0) return null;
                
                const dates = mediaObjects
                  .map(obj => obj.dateUploaded ? new Date(obj.dateUploaded) : null)
                  .filter((date): date is Date => date !== null);
                
                if (dates.length === 0) return null;
                return new Date(Math.min(...dates.map(d => d.getTime())));
              };

              const formatDateHeader = (date: Date): string => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                const dateStr = date.toDateString();
                const todayStr = today.toDateString();
                const yesterdayStr = yesterday.toDateString();
                
                if (dateStr === todayStr) return 'Today';
                if (dateStr === yesterdayStr) return 'Yesterday';
                
                return date.toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                });
              };

              // Group canvases by date
              const canvasesWithDates = filteredCanvases.map(canvas => ({
                canvas,
                date: getCanvasDate(canvas.id),
              }));

              const groupedCanvases: Array<{ date: Date; dateLabel: string; canvases: typeof filteredCanvases }> = [];
              let currentGroup: typeof groupedCanvases[0] | null = null;

              canvasesWithDates.forEach(({ canvas, date }) => {
                if (!date) {
                  // Canvases without dates go into a separate group
                  if (!currentGroup || currentGroup.dateLabel !== 'No Date') {
                    currentGroup = { date: new Date(0), dateLabel: 'No Date', canvases: [] };
                    groupedCanvases.push(currentGroup);
                  }
                  currentGroup.canvases.push(canvas);
                } else {
                  const dateLabel = formatDateHeader(date);
                  
                  if (!currentGroup || currentGroup.dateLabel !== dateLabel) {
                    currentGroup = { date, dateLabel, canvases: [] };
                    groupedCanvases.push(currentGroup);
                  }
                  currentGroup.canvases.push(canvas);
                }
              });
              
              return (
                <div className="space-y-6">
                  {groupedCanvases.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {/* Date Divider */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-sm font-secondary text-text-secondary whitespace-nowrap">
                          {group.dateLabel}
                        </span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                      
                      {/* Canvas Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                        {group.canvases.map((canvas) => {
                          const canvasKey = getCanvasKey(selectedCategory, canvas.id);
                          const objects = canvasObjects[canvasKey] || [];
                          const globalIndex = filteredCanvases.findIndex(c => c.id === canvas.id);
                          
                          return (
                            <div
                              key={canvasKey}
                              className={`w-full transition-opacity duration-200 ${selectedCanvases.size === 0 ? 'cursor-move' : ''}`}
                              draggable={selectedCanvases.size === 0}
                              onDragStart={selectedCanvases.size === 0 ? (e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', globalIndex.toString());
                                (e.currentTarget as HTMLElement).style.opacity = '0.5';
                              } : undefined}
                              onDragEnd={selectedCanvases.size === 0 ? (e) => {
                                (e.currentTarget as HTMLElement).style.opacity = '1';
                              } : undefined}
                              onDragOver={selectedCanvases.size === 0 ? (e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                (e.currentTarget as HTMLElement).style.border = '2px dashed rgba(255, 255, 255, 0.5)';
                              } : undefined}
                              onDragLeave={selectedCanvases.size === 0 ? (e) => {
                                (e.currentTarget as HTMLElement).style.border = 'none';
                              } : undefined}
                              onDrop={selectedCanvases.size === 0 ? (e) => {
                                e.preventDefault();
                                (e.currentTarget as HTMLElement).style.border = 'none';
                                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                if (draggedIndex !== globalIndex) {
                                  handleCanvasReorder(draggedIndex, globalIndex);
                                }
                              } : undefined}
                            >
                              <Canvas
                                key={canvasKey}
                                aspectRatio={canvas.aspectRatio}
                                canvasId={canvas.id}
                                objects={objects}
                                allCategoryObjects={allCategoryObjects}
                                canvasGroups={canvasGroups}
                                onObjectsChange={(newObjects) => handleObjectsChange(selectedCategory, canvas.id, newObjects)}
                                onDelete={handleDeleteClick}
                                totalCanvases={filteredCanvases.length}
                                isSelected={selectedCanvases.has(canvas.id)}
                                onToggleSelection={handleToggleCanvasSelection}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </main>

      {/* Multiple Upload Modal */}
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirm={() => {}} // Not used when allowMultiple is true
        onConfirmMultiple={handleMultipleUploads}
        allowMultiple={true}
        aspectRatio={selectedCategory}
        availableTags={(() => {
          // Collect all unique tags from all canvases for autocomplete
          const allTags = new Set<string>();
          currentCanvases.forEach((canvas) => {
            const canvasKey = getCanvasKey(selectedCategory, canvas.id);
            const objects = canvasObjects[canvasKey] || [];
            const mediaObjects = objects.filter((obj) => obj.type === 'image' || obj.type === 'video');
            mediaObjects.forEach((obj) => {
              if (obj.tags && obj.tags.length > 0) {
                obj.tags.forEach((tag: string) => allTags.add(tag));
              }
            });
          });
          return Array.from(allTags).sort();
        })()}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        count={1}
      />

      {/* Add Tags Modal */}
      {showAddTagsModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[100]"
            onClick={() => {
              setShowAddTagsModal(false);
              setTagsToAdd([]);
              setTagInput('');
              setShowTagSuggestions(false);
            }}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="bg-grey-bg-2 border border-border rounded-lg shadow-elevated max-w-md w-full p-6 relative z-[101]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-primary font-bold text-text-primary mb-4">
                Add Tags to {selectedCanvases.size} {selectedCanvases.size === 1 ? 'Canvas' : 'Canvases'}
              </h3>
              
              {/* Divider */}
              <div className="border-b border-border mb-4 -mx-6" style={{ width: 'calc(100% + 3rem)' }}></div>
              
              <div className="mb-4">
                <label className="block text-sm font-secondary text-text-secondary mb-2">
                  Tags
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onKeyDown={handleAddTagInput}
                    onFocus={() => {
                      if (tagSuggestions.length > 0) {
                        setShowTagSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowTagSuggestions(false), 200);
                    }}
                    placeholder="Enter a tag and press Enter"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary focus:outline-none focus:border-border"
                    style={{ minHeight: '44px' }}
                  />
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-grey-bg-2 border border-border rounded-lg shadow-elevated z-50 max-h-48 overflow-y-auto">
                      {tagSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAddTagFromSuggestion(suggestion)}
                          className="w-full px-3 py-2 text-left text-sm font-secondary text-text-primary hover:bg-grey-bg-4 transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {tagsToAdd.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tagsToAdd.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-grey-bg-4 text-white text-xs font-secondary"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white-60 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddTagsModal(false);
                    setTagsToAdd([]);
                    setTagInput('');
                    setShowTagSuggestions(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary hover:bg-grey-bg-4 transition-all duration-200 active:opacity-80"
                  style={{ minHeight: '44px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAddTags}
                  disabled={tagsToAdd.length === 0}
                  className={`px-4 py-2 rounded-lg bg-white text-black font-secondary hover:bg-white-90 transition-all duration-200 active:opacity-80 ${
                    tagsToAdd.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  Add Tags
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;


