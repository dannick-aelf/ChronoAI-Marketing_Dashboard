# Project Context

## Purpose

**Lumen Marketing Assets** is a modern canvas-based marketing asset editor for creating social media content. The application enables users to:

- Create and edit marketing assets with multiple aspect ratios (4:5 and 9:16)
- Upload and manage images and videos
- Edit text with custom fonts and colors
- Organize assets in an Instagram-style grid layout
- Export assets as ZIP files
- Manage multiple projects/tabs (currently supports "Lumen" and "GodGPT" tabs)
- Tag and filter assets by metadata (tags, dates, products)
- Persist all data locally using IndexedDB

The application follows a mobile-first design approach with strict accessibility standards (WCAG 2.1 AA compliance).

## Tech Stack

### Core Framework
- **React 19.2.0** - UI framework with latest React features
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Build tool and dev server

### Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Storage & Data
- **IndexedDB** - Browser-based persistent storage (no external database)
- Custom storage service layer for abstraction

### Utilities
- **JSZip 3.10.1** - ZIP file generation for asset exports

### Development Tools
- **ESLint 9.39.1** - Code linting with TypeScript and React plugins
- **TypeScript ESLint** - TypeScript-specific linting rules

## Project Conventions

### Code Style

#### TypeScript
- **Strict typing**: Use explicit types, avoid `any` when possible
- **Type imports**: Use `import type` for type-only imports
- **Type definitions**: Define interfaces/types in dedicated files (`types.ts`)
- **Error handling**: Use `unknown` type for error catches, then narrow with type guards

#### React Patterns
- **Functional components**: Use function components exclusively (no class components)
- **Hooks**: Prefer custom hooks for reusable logic (`usePersistedState.ts`)
- **Component organization**: One component per file, named exports
- **State management**: 
  - Persisted state via custom hooks (`usePersistedCanvases`, `usePersistedCanvasObjects`)
  - UI state via `useState` for temporary/interactive state
  - No external state management library (Redux, Zustand, etc.)

#### Naming Conventions
- **Components**: PascalCase (e.g., `Dashboard.tsx`, `CanvasEditor.tsx`)
- **Files**: Match component name (e.g., `Dashboard.tsx` for `Dashboard` component)
- **Hooks**: camelCase starting with "use" (e.g., `usePersistedState.ts`)
- **Services**: camelCase (e.g., `indexedDB.ts`, `storageService`)
- **Types/Interfaces**: PascalCase (e.g., `CanvasItem`, `StoredCanvases`)
- **Constants**: UPPER_SNAKE_CASE for module-level constants (e.g., `DB_NAME`, `STORE_CANVASES`)

#### Code Organization
- **File structure**: Group by feature/domain, not by file type
- **Imports**: Group imports: external libraries → internal components → hooks → services → types
- **Comments**: Use comments for complex logic, avoid obvious comments

### Architecture Patterns

#### Clean Architecture Layers
```
src/
├── components/        # Presentation layer (React components)
├── hooks/            # Business logic hooks (state management, side effects)
├── services/         # External interfaces (storage, APIs)
│   └── storage/      # Storage abstraction layer
└── db.ts            # Low-level IndexedDB operations
```

#### Separation of Concerns
- **Components**: Handle UI rendering and user interactions only
- **Hooks**: Encapsulate stateful logic and side effects
- **Services**: Abstract external dependencies (storage, APIs)
- **DB Layer**: Low-level IndexedDB operations, no business logic

#### State Management Strategy
- **Persisted State**: Canvas data and objects automatically saved to IndexedDB
  - Uses custom hooks (`usePersistedCanvases`, `usePersistedCanvasObjects`)
  - Auto-saves on every change
  - Loads on component mount
  - Supports tab-based isolation (e.g., "Lumen" vs "GodGPT")
- **UI State**: Temporary state (modals, selections, dropdowns) uses React `useState`
- **No Global State**: No Redux/Zustand - state is component-local or passed via props

#### Storage Architecture
- **IndexedDB Stores**:
  - `canvases`: Stores canvas metadata (id, aspectRatio) organized by tab
  - `canvasObjects`: Stores canvas content objects (images, text, etc.) organized by tab
- **Storage Service**: Abstraction layer (`storageService`) provides high-level API
- **DB Module**: Low-level operations (`openDB`, `saveItem`, `getItem`, etc.)

### Testing Strategy

**Current Status**: No testing framework configured yet.

**Recommended Approach** (when implemented):
- Unit tests for hooks and utilities
- Component tests for UI components
- Integration tests for storage operations
- E2E tests for critical user flows

### Git Workflow

**Current Status**: Standard Git workflow (no specific conventions documented).

**Recommended Practices**:
- Feature branches for new features
- Descriptive commit messages
- Main branch for production-ready code

## Domain Context

### Marketing Asset Management
- **Aspect Ratios**: Supports 4:5 (Instagram post) and 9:16 (Instagram Story/Reels)
- **Canvas System**: Each canvas is a separate editable asset
- **Canvas Objects**: Elements on a canvas (images, text, shapes, etc.)
- **Tabs/Projects**: Multiple project contexts (currently "Lumen" and "GodGPT")

### Asset Organization
- **Categories**: Assets grouped by aspect ratio (4:5, 9:16)
- **Tags**: User-defined tags for filtering and organization
- **Metadata**: Assets can have tags, dates, and product associations
- **Search**: Full-text search across canvas metadata

### Canvas Editor Features
- **Image Upload**: Support for image and video files
- **Text Editing**: Custom fonts, colors, positioning
- **Grid Layout**: Instagram-style grid for browsing assets
- **Presentation Mode**: Carousel view for reviewing assets
- **Export**: Download multiple assets as ZIP file

### User Experience
- **Mobile-First**: Designed for mobile devices first, scales to desktop
- **Touch-Optimized**: All interactions optimized for touch input
- **Dark Mode**: Theme switching with persistence
- **Responsive**: Adapts to different screen sizes

## Important Constraints

### Technical Constraints
- **Browser-Only**: No backend server - all data stored in IndexedDB
- **No External APIs**: Fully client-side application (except for file operations)
- **Storage Limits**: IndexedDB storage limits vary by browser (typically 50MB-1GB)
- **File Size**: Large image/video uploads may impact performance

### Design Constraints
- **Mobile-First**: All UI must work on mobile devices (320px+ width)
- **Accessibility**: WCAG 2.1 AA compliance required
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Performance**: Optimize for 60fps animations and fast load times

### Business Constraints
- **Privacy**: All data stored locally - no cloud sync
- **Offline-First**: Application must work without internet connection
- **Data Persistence**: User data must survive page refreshes and browser restarts

### UI/UX Constraints
- **Spacing**: Standard mobile padding of 20-24px
- **Typography**: Minimum 16px font size for body text
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text
- **Animation**: Respect `prefers-reduced-motion` media query

## External Dependencies

### Runtime Dependencies
- **react/react-dom**: UI framework
- **jszip**: ZIP file generation for asset exports

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking and compilation
- **tailwindcss**: CSS framework
- **eslint**: Code linting
- **@vitejs/plugin-react**: React support for Vite

### Browser APIs Used
- **IndexedDB**: Persistent storage
- **File API**: File uploads and reading
- **Canvas API**: Canvas rendering (via HTML5 canvas)
- **localStorage**: Theme preference storage

### No External Services
- No backend API
- No authentication service
- No cloud storage
- No analytics (currently)
- No third-party libraries for state management, routing, or UI components
