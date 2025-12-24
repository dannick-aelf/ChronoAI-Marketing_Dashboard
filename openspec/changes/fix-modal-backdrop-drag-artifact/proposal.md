# Change: Fix Modal Backdrop Drag Artifact

## Why

When users click and drag on modal backdrops, the browser creates a visual artifact (afterimage) that follows the cursor. This is caused by the browser's default text selection and drag behavior on the backdrop element. This creates a poor user experience and visual glitch that should not occur.

Instead of manually fixing drag artifacts with custom event handlers and CSS, we're replacing custom modal implementations with the well-tested `react-modal` library, which handles these edge cases properly out of the box.

## What Changes

- **REFACTORED**: Replaced custom modal implementations with `react-modal` library
- **ADDED**: `react-modal` and `@types/react-modal` dependencies
- **MODIFIED**: All modal components now use `Modal` component from `react-modal`
- Removed custom backdrop and modal wrapper code
- Removed manual drag prevention handlers (no longer needed)
- Removed custom Escape key handling (react-modal handles this)
- Maintained all existing modal functionality and styling

**Affected Components:**
- `DeleteConfirmModal.tsx` - Refactored to use `react-modal`
- `ImageUploadModal.tsx` - Refactored to use `react-modal`
- `TextEditorModal.tsx` - Refactored to use `react-modal`
- `PresentationCarousel.tsx` - Refactored to use `react-modal`

## Impact

- **Affected specs**: `modals` capability (new spec to document modal behavior)
- **Affected code**: 
  - `src/components/DeleteConfirmModal.tsx`
  - `src/components/ImageUploadModal.tsx`
  - `src/components/TextEditorModal.tsx`
  - `src/components/PresentationCarousel.tsx`
  - `package.json` (added dependencies)
- **Dependencies**: Added `react-modal@3.16.3` and `@types/react-modal@3.16.3`
- **User Impact**: 
  - Improved UX - no more visual artifacts when interacting with modal backdrops
  - Better accessibility (react-modal handles ARIA attributes)
  - Consistent modal behavior across the application
- **Breaking Changes**: None - all modal APIs remain the same
- **Code Quality**: Reduced code complexity by using a well-maintained library instead of custom implementations
