# Change: Store Images in Cloudflare R2

## Why

Currently, images are stored as base64 data URLs in IndexedDB/KV storage. This approach has several limitations:

1. **Storage Size Limits**: Base64 encoding increases file size by ~33%, and KV has size limits (25MB per value, even with chunking)
2. **Performance**: Large base64 strings slow down JSON parsing and network transfer
3. **Cost Efficiency**: Storing binary data as text in KV is inefficient compared to object storage
4. **Scalability**: As users upload more images, KV storage will become prohibitively expensive and slow

Cloudflare R2 is an S3-compatible object storage service that:
- Provides unlimited storage with no egress fees
- Optimized for binary data (images, videos)
- Better performance for large files
- More cost-effective for media storage

## What Changes

- **ADDED**: Cloudflare R2 bucket for image storage
- **ADDED**: Pages Function endpoint `/api/r2` for R2 operations (upload, download, delete)
- **ADDED**: R2 storage service in frontend (`src/services/storage/r2.ts`)
- **MODIFIED**: Image upload flow to upload to R2 instead of storing as data URLs
- **MODIFIED**: Canvas objects to store R2 URLs instead of base64 data URLs
- **MODIFIED**: Image rendering to fetch from R2 URLs
- **ADDED**: Migration logic to handle existing base64 images (optional, can be done incrementally)

**BREAKING**: Canvas objects with `content` field will change from base64 data URLs to R2 object URLs. Existing data will need migration.

## Impact

- **Affected specs**: `storage` capability (new spec for R2 storage)
- **Affected code**:
  - `src/components/ImageUploadModal.tsx` - Upload flow
  - `src/components/Canvas.tsx` - Image rendering
  - `src/components/CanvasEditor.tsx` - Canvas object handling
  - `src/services/storage/kv.ts` - May need updates for metadata
  - `src/services/storage/types.ts` - Type definitions
  - `functions/api/r2.ts` - New Pages Function for R2 operations
  - `functions/api/storage.ts` - May need updates for R2 URL references
- **Dependencies**: 
  - Cloudflare R2 bucket (to be created)
  - R2 bindings in Pages Functions configuration
- **User Impact**:
  - Faster image loading (no base64 parsing)
  - Better performance with large images
  - No storage size limits for images
  - Requires internet connection for image access (breaking offline-first for images)
- **Breaking Changes**: 
  - Canvas objects will reference R2 URLs instead of data URLs
  - Existing base64 images will need migration to R2
- **Migration Complexity**: Medium - need to migrate existing images from base64 to R2
