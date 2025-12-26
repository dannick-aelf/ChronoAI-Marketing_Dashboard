## 1. Infrastructure Setup

- [ ] 1.1 Create R2 bucket in Cloudflare Dashboard
- [ ] 1.2 Configure R2 bucket binding in Pages Functions settings
- [ ] 1.3 Update `wrangler.toml` or Pages dashboard with R2 binding configuration
- [ ] 1.4 Test R2 bucket access from Pages Function

## 2. Backend Implementation (Pages Functions)

- [ ] 2.1 Create `functions/api/r2.ts` Pages Function
- [ ] 2.2 Implement `PUT /api/r2` endpoint for image uploads
  - [ ] Accept multipart/form-data or base64 image data
  - [ ] Generate unique object key (UUID-based)
  - [ ] Upload to R2 bucket
  - [ ] Return R2 object URL
- [ ] 2.3 Implement `GET /api/r2/:key` endpoint for image retrieval
  - [ ] Fetch object from R2
  - [ ] Return image with proper Content-Type headers
  - [ ] Handle CORS
- [ ] 2.4 Implement `DELETE /api/r2/:key` endpoint for image deletion
- [ ] 2.5 Add error handling and validation
- [ ] 2.6 Add CORS headers for all endpoints

## 3. Frontend Storage Service

- [ ] 3.1 Create `src/services/storage/r2.ts`
- [ ] 3.2 Implement `uploadImage(file: File): Promise<string>` - returns R2 URL
- [ ] 3.3 Implement `getImageUrl(key: string): string` - returns R2 URL
- [ ] 3.4 Implement `deleteImage(key: string): Promise<void>`
- [ ] 3.5 Add error handling and retry logic
- [ ] 3.6 Add TypeScript types for R2 operations

## 4. Update Image Upload Flow

- [ ] 4.1 Update `ImageUploadModal.tsx` to use R2 upload service
- [ ] 4.2 Replace base64 conversion with R2 upload
- [ ] 4.3 Update `onConfirm` callback to pass R2 URL instead of data URL
- [ ] 4.4 Add upload progress indicator
- [ ] 4.5 Add error handling for upload failures
- [ ] 4.6 Update image preview to show R2 URL

## 5. Update Canvas Object Storage

- [ ] 5.1 Update `CanvasObject` interface to document R2 URL format
- [ ] 5.2 Update `Canvas.tsx` to handle R2 URLs in `content` field
- [ ] 5.3 Update `CanvasEditor.tsx` to use R2 URLs
- [ ] 5.4 Ensure image rendering works with R2 URLs
- [ ] 5.5 Update image deletion to also delete from R2

## 6. Migration (Optional - can be incremental)

- [ ] 6.1 Create migration utility to detect base64 images
- [ ] 6.2 Implement migration function to convert base64 → R2
- [ ] 6.3 Add migration UI or background process
- [ ] 6.4 Test migration with sample data
- [ ] 6.5 Document migration process

## 7. Testing

- [ ] 7.1 Test image upload to R2
- [ ] 7.2 Test image retrieval from R2
- [ ] 7.3 Test image deletion from R2
- [ ] 7.4 Test with large images (>10MB)
- [ ] 7.5 Test error scenarios (network failures, invalid files)
- [ ] 7.6 Test CORS configuration
- [ ] 7.7 Verify images persist across page refreshes

## 8. Documentation

- [ ] 8.1 Update `DEPLOYMENT-CLOUDFLARE.md` with R2 setup instructions
- [ ] 8.2 Update `README.md` with R2 storage information
- [ ] 8.3 Document R2 bucket configuration
- [ ] 8.4 Document migration process (if implemented)
