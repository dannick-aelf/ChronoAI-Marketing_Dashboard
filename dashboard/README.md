# Lumen Marketing Assets

A modern canvas-based marketing asset editor for creating social media content with multiple aspect ratios.

## Features

- 📐 Multiple aspect ratios (4:5 and 9:16)
- 🖼️ Image and video upload support
- ✏️ Text editing with custom fonts and colors
- 📱 Instagram-style grid layout
- 💾 Persistent storage with IndexedDB
- 🎨 Responsive canvas editor
- 🖥️ Presentation carousel view

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- IndexedDB for persistence

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Architecture

This project follows a clean architecture pattern:

- `src/components/` - React components
- `src/services/` - External APIs & storage
- `src/hooks/` - Custom React hooks
- `src/db.ts` - Low-level IndexedDB operations

### State Management

- **Persisted State**: Canvas data and objects are saved to IndexedDB and survive page refreshes
- **UI State**: Temporary UI state (modals, selections) uses React useState
- **Storage**: All user data is automatically persisted via IndexedDB

## Project Structure

```
src/
├── components/           # React components
│   ├── Canvas.tsx
│   ├── CanvasEditor.tsx
│   ├── Dashboard.tsx
│   └── ...
├── hooks/                # Custom React hooks
│   └── usePersistedState.ts
├── services/             # External APIs & storage
│   └── storage/
│       ├── indexedDB.ts
│       └── types.ts
├── db.ts                 # Low-level IndexedDB operations
└── ...
```

## License

Private
