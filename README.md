# Lumen Marketing Assets

A modern canvas-based marketing asset editor for creating social media content with multiple aspect ratios.

## Features

- 📐 Multiple aspect ratios (4:5 and 9:16)
- 🖼️ Image and video upload support
- ✏️ Text editing with custom fonts and colors
- 📱 Instagram-style grid layout
- 💾 Persistent storage with Cloudflare Workers KV
- 🎨 Responsive canvas editor
- 🖥️ Presentation carousel view

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Cloudflare Workers KV for persistence

## Getting Started

### Installation

```bash
pnpm install
```

### Cloudflare Pages Functions Setup

1. **Create KV Namespaces**:
   ```bash
   pnpx wrangler kv namespace create "STORAGE_KV"
   pnpx wrangler kv namespace create "STORAGE_KV" --preview
   ```

2. **Create R2 Bucket**:
   ```bash
   pnpx wrangler r2 bucket create chronoai-images
   ```

3. **Configure KV Binding in Cloudflare Dashboard**:
   - Go to Workers & Pages → Your Project → Settings → Functions
   - Scroll to "KV Namespace Bindings"
   - Click "Add binding"
   - Variable name: `STORAGE_KV`
   - KV namespace: Select your `STORAGE_KV` namespace
   - Click "Save"

4. **Configure R2 Binding in Cloudflare Dashboard**:
   - In the same Functions settings page
   - Scroll to "R2 Bucket Bindings"
   - Click "Add binding"
   - Variable name: `STORAGE_R2`
   - R2 bucket: Select your R2 bucket
   - Click "Save"

5. **For Local Development**:
   Create a `.dev.vars` file in the project root:
   ```
   STORAGE_KV_PREVIEW_ID=your-preview-kv-namespace-id
   STORAGE_R2_PREVIEW_BUCKET_NAME=chronoai-images
   ```

### Development

```bash
# Start the Vite dev server
pnpm run dev

# For full Pages Functions support, use wrangler pages dev instead:
pnpx wrangler pages dev dist --compatibility-date=2024-01-01
```

### Build

```bash
pnpm run build
```

## Architecture

This project follows a clean architecture pattern:

- `src/components/` - React components
- `src/services/` - External APIs & storage
- `src/hooks/` - Custom React hooks
- `src/db.ts` - Low-level IndexedDB operations

### State Management

- **Persisted State**: Canvas data and objects are saved to Cloudflare Workers KV and survive page refreshes
- **UI State**: Temporary UI state (modals, selections) uses React useState
- **Storage**: Canvas metadata stored in Cloudflare Workers KV, images stored in Cloudflare R2

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
│       ├── indexedDB.ts  # Storage service (uses KV)
│       ├── kv.ts         # Cloudflare Pages Functions KV client
│       └── types.ts
├── functions/            # Cloudflare Pages Functions
│   └── api/
│       └── storage.ts    # Pages Function KV API handler
└── ...
```

## License

Private
