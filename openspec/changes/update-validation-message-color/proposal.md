# Change: Update Validation Message Color to Red

## Why

Validation error messages currently use white text (`text-white`), which doesn't clearly indicate an error state to users. Using red for validation messages is a standard UI pattern that improves visual hierarchy and makes errors more immediately recognizable.

## What Changes

- **ADDED**: Semantic error color to the design system
- **MODIFIED**: Validation error messages now display in red instead of white
- Add error color definitions to `tailwind.config.js` and `src/index.css`
- Update `ImageUploadModal.tsx` to use red color for error messages
- Ensure red color works in both light and dark themes with proper contrast

**Affected Components:**
- `ImageUploadModal.tsx` - Error message styling
- `tailwind.config.js` - Add error color to theme
- `src/index.css` - Add error color CSS variables

## Impact

- **Affected specs**: `validation` capability (new spec to document validation behavior)
- **Affected code**: 
  - `src/components/ImageUploadModal.tsx`
  - `tailwind.config.js`
  - `src/index.css`
- **User Impact**: Improved UX - validation errors are more visually distinct and recognizable
- **Breaking Changes**: None
- **Accessibility**: Must ensure red color meets WCAG contrast requirements in both themes
