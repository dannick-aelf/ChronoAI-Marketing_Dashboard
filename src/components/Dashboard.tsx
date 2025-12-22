import { useState } from 'react';
import Canvas from './Canvas';
import DeleteConfirmModal from './DeleteConfirmModal';
import { type CanvasObject } from './CanvasEditor';
import { usePersistedCanvases, usePersistedCanvasObjects } from '../hooks/usePersistedState';
import type { CanvasItem } from '../services/storage/types';

type Category = '4:5' | '9:16';

const Dashboard = () => {
  // UI state (temporary) - stays as useState
  const [selectedCategory, setSelectedCategory] = useState<Category>('4:5');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; canvasId: string | null }>({
    isOpen: false,
    canvasId: null,
  });

  // Persisted state (survives refresh) - uses IndexedDB
  const [canvases, setCanvases, canvasesLoading] = usePersistedCanvases({
    '4:5': [{ id: 'canvas-1', aspectRatio: '4:5' }],
    '9:16': [{ id: 'canvas-1', aspectRatio: '9:16' }],
  });
  const [canvasObjects, setCanvasObjects, canvasObjectsLoading] = usePersistedCanvasObjects({});

  const categories: { id: Category; label: string; ratio: string }[] = [
    { id: '4:5', label: '4:5', ratio: '4:5' },
    { id: '9:16', label: '9:16', ratio: '9:16' },
  ];

  const addCanvas = () => {
    setCanvases((prev) => {
      const currentCanvases = prev[selectedCategory];
      const newCanvas: CanvasItem = {
        id: `canvas-${Date.now()}`,
        aspectRatio: selectedCategory,
      };
      return {
        ...prev,
        [selectedCategory]: [newCanvas, ...currentCanvases],
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
          <h1 className="text-2xl font-primary text-text-primary">
            Lumen Marketing Assets
          </h1>
        </div>

        {/* Category Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="mb-4">
            <h2 className="text-sm font-secondary font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Categories
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
                    <div className="w-2 h-2 rounded-full bg-orange-primary" />
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
                {selectedCategory === '4:5' ? '4:5 Format' : '9:16 Format'}
              </h2>
              <p className="text-sm font-secondary text-text-secondary">
                {selectedCategory === '4:5'
                  ? '1080 × 1350 px'
                  : '1080 × 1920 px'}
              </p>
            </div>
            {/* Add Canvas Button */}
            <button
              onClick={addCanvas}
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
                  {currentCanvases.map((canvas) => {
                    const canvasKey = getCanvasKey(selectedCategory, canvas.id);
                    const objects = canvasObjects[canvasKey] || [];
                    return (
                      <div key={canvasKey} className="w-full">
                        <Canvas
                          key={canvasKey}
                          aspectRatio={canvas.aspectRatio}
                          canvasId={canvas.id}
                          objects={objects}
                          allCategoryObjects={allCategoryObjects}
                          onObjectsChange={(newObjects) => handleObjectsChange(selectedCategory, canvas.id, newObjects)}
                          onDelete={handleDeleteClick}
                          canDelete={currentCanvases.length > 1}
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

