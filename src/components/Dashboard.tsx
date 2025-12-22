import { useState } from 'react';
import Canvas from './Canvas';
import DeleteConfirmModal from './DeleteConfirmModal';
import ImageUploadModal from './ImageUploadModal';
import { type CanvasObject } from './CanvasEditor';
import { usePersistedCanvases, usePersistedCanvasObjects } from '../hooks/usePersistedState';
import type { CanvasItem } from '../services/storage/types';

type Category = '4:5' | '9:16';
type TabType = 'GodGPT' | 'Lumen';

const Dashboard = () => {
  // UI state (temporary) - stays as useState
  const [selectedTab, setSelectedTab] = useState<TabType>('Lumen');
  const [selectedCategory, setSelectedCategory] = useState<Category>('4:5');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'date' | 'tags'>('tags');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; canvasId: string | null }>({
    isOpen: false,
    canvasId: null,
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Persisted state (survives refresh) - uses IndexedDB
  const [canvases, setCanvases, canvasesLoading] = usePersistedCanvases({
    '4:5': [{ id: 'canvas-1', aspectRatio: '4:5' }],
    '9:16': [{ id: 'canvas-1', aspectRatio: '9:16' }],
  });
  const [canvasObjects, setCanvasObjects, canvasObjectsLoading] = usePersistedCanvasObjects({});

  const categories: { id: Category; label: string; ratio: string }[] = [
    { id: '4:5', label: '4:5 Statics', ratio: '4:5' },
    { id: '9:16', label: '9:16 Videos', ratio: '9:16' },
  ];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'GodGPT', label: 'GodGPT' },
    { id: 'Lumen', label: 'Lumen' },
  ];

  // addCanvas function removed - now using upload modal with multiple file support

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

    // Create objects for each canvas
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
    const currentCanvases = canvases[selectedCategory];
    
    // Prevent deleting the last canvas
    if (currentCanvases.length <= 1) {
      return;
    }

    // Open confirmation modal
    setDeleteModal({ isOpen: true, canvasId });
  };

  const confirmDelete = () => {
    if (deleteModal.canvasId) {
      const canvasKey = `${selectedCategory}-${deleteModal.canvasId}`;
      setCanvases((prev) => {
        return {
          ...prev,
          [selectedCategory]: prev[selectedCategory].filter(
            (canvas) => canvas.id !== deleteModal.canvasId
          ),
        };
      });
      // Remove objects for deleted canvas
      setCanvasObjects((prev) => {
        const updated = { ...prev };
        delete updated[canvasKey];
        return updated;
      });
    }
    setDeleteModal({ isOpen: false, canvasId: null });
  };

  const getCanvasKey = (category: Category, canvasId: string) => {
    return `${category}-${canvasId}`;
  };

  const handleObjectsChange = (category: Category, canvasId: string, objects: CanvasObject[]) => {
    const key = getCanvasKey(category, canvasId);
    setCanvasObjects((prev) => ({
      ...prev,
      [key]: objects,
    }));
  };

  // Show loading state while data is being loaded from IndexedDB
  if (canvasesLoading || canvasObjectsLoading) {
    return (
      <div className="flex h-screen bg-bg-primary overflow-hidden items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-grey-bg-3 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white-60 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <p className="text-text-secondary text-sm font-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, canvasId: null });
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
          
          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-secondary transition-all duration-200
                  ${
                    selectedTab === tab.id
                      ? 'bg-grey-bg-3 text-text-primary font-medium'
                      : 'text-text-secondary hover:bg-grey-bg-3 hover:text-text-primary'
                  }
                  active:opacity-80 active:scale-[0.98]
                `}
                style={{ minHeight: '44px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter Section */}
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setSearchType('tags')}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-xs font-secondary transition-all duration-200
                  ${
                    searchType === 'tags'
                      ? 'bg-grey-bg-3 text-text-primary font-medium'
                      : 'text-text-secondary hover:bg-grey-bg-3'
                  }
                `}
              >
                Tags
              </button>
              <button
                onClick={() => setSearchType('date')}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-xs font-secondary transition-all duration-200
                  ${
                    searchType === 'date'
                      ? 'bg-grey-bg-3 text-text-primary font-medium'
                      : 'text-text-secondary hover:bg-grey-bg-3'
                  }
                `}
              >
                Date
              </button>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === 'tags' ? 'Search by tags...' : 'Search by date...'}
              className="w-full px-3 py-2 rounded-lg border border-border bg-grey-bg-3 text-text-primary font-secondary text-sm focus:outline-none focus:border-white"
              style={{ minHeight: '44px' }}
            />
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
                      ? 'bg-grey-bg-3 text-text-primary font-medium'
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
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-bg-primary">
        <div className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
            <h2 className="text-xl font-primary text-text-primary mb-1">
              {selectedCategory === '4:5' ? '4:5 Statics' : '9:16 Videos'}
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
                className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-white-60 bg-grey-bg-2 hover:bg-grey-bg-3 flex items-center justify-center transition-all duration-200 active:opacity-80 active:scale-[0.98] flex-shrink-0"
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

          {/* Canvas Container - Instagram Grid Layout */}
          <div className="pb-6">
            {/* Collect all objects from all canvases in the current category once */}
            {(() => {
              const allCategoryObjects = currentCanvases.flatMap((c) => {
                const key = getCanvasKey(selectedCategory, c.id);
                return canvasObjects[key] || [];
              });
              
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                  {currentCanvases.map((canvas, index) => {
                    const canvasKey = getCanvasKey(selectedCategory, canvas.id);
                    const objects = canvasObjects[canvasKey] || [];
                    return (
                      <div
                        key={canvasKey}
                        className="w-full cursor-move transition-opacity duration-200"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', index.toString());
                          (e.currentTarget as HTMLElement).style.opacity = '0.5';
                        }}
                        onDragEnd={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = '1';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          (e.currentTarget as HTMLElement).style.border = '2px dashed rgba(255, 255, 255, 0.5)';
                        }}
                        onDragLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.border = 'none';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          (e.currentTarget as HTMLElement).style.border = 'none';
                          const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                          if (draggedIndex !== index) {
                            handleCanvasReorder(draggedIndex, index);
                          }
                        }}
                      >
                        <Canvas
                          key={canvasKey}
                          aspectRatio={canvas.aspectRatio}
                          canvasId={canvas.id}
                          objects={objects}
                          allCategoryObjects={allCategoryObjects}
                          onObjectsChange={(newObjects) => handleObjectsChange(selectedCategory, canvas.id, newObjects)}
                          onDelete={handleDeleteClick}
                          canDelete={currentCanvases.length > 1}
                          totalCanvases={currentCanvases.length}
                        />
                      </div>
                    );
                  })}
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
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default Dashboard;

