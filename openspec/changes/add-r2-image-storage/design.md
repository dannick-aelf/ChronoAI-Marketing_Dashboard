# Design: R2 Image Storage

## Context

The application currently stores images as base64-encoded data URLs in IndexedDB/KV storage. This works for small images but becomes problematic as:
- Image count grows
- Image sizes increase
- Storage costs scale
- Performance degrades with large base64 strings

Cloudflare R2 provides S3-compatible object storage optimized for binary data, with no egress fees and unlimited storage.

## Goals / Non-Goals

### Goals
- Store images in R2 instead of base64 in KV
- Maintain existing image upload/display functionality
- Support image deletion
- Provide migration path for existing base64 images
- Optimize for performance and cost

### Non-Goals
- Video storage in R2 (can be added later)
- Image transformation/resizing (can be added later)
- CDN integration (R2 URLs can be used directly)
- Image versioning (can be added later)

## Decisions

### Decision 1: Use Pages Functions for R2 Operations
**What**: Create `/api/r2` Pages Function endpoint for R2 operations
**Why**: 
- Consistent with existing Pages Functions architecture
- R2 bindings available in Pages Functions
- No separate worker needed
- Same deployment model as KV storage

**Alternatives Considered**:
- Direct R2 SDK in frontend: Not possible due to CORS and credentials
- Separate Worker: Adds complexity, Pages Functions sufficient

### Decision 2: Object Key Format
**What**: Use UUID-based keys: `images/{uuid}.{ext}`
**Why**:
- Ensures uniqueness
- Prevents collisions
- Easy to extract file extension
- Organized in R2 bucket

**Format**: `images/{uuid}-{timestamp}.{ext}` or `images/{uuid}.{ext}`
**Example**: `images/550e8400-e29b-41d4-a716-446655440000.jpg`

**Alternatives Considered**:
- User-provided names: Risk of collisions, harder to manage
- Hash-based: Good for deduplication but harder to debug

### Decision 3: Image Upload Flow
**What**: Upload image → Get R2 URL → Store URL in canvas object
**Why**:
- Decouples upload from canvas object creation
- Allows retry logic
- Better error handling
- Can show upload progress

**Flow**:
1. User selects image file
2. Frontend uploads to `/api/r2` (POST)
3. Pages Function uploads to R2, returns URL
4. Frontend stores R2 URL in canvas object `content` field
5. Canvas renders image from R2 URL

**Alternatives Considered**:
- Upload during canvas object save: Less flexible, harder error handling
- Client-side R2 SDK: Not possible due to CORS

### Decision 4: Migration Strategy
**What**: Incremental migration - detect base64 on load, migrate lazily
**Why**:
- Non-breaking for existing data
- Can be done in background
- Users don't need to wait for migration
- Can migrate on-demand when images are accessed

**Migration Process**:
1. Detect base64 data URL in `content` field
2. Upload to R2
3. Replace `content` with R2 URL
4. Save updated canvas object

**Alternatives Considered**:
- Bulk migration script: Requires downtime, complex
- No migration: Breaking change, loses existing images

### Decision 5: R2 Bucket Configuration
**What**: Single bucket for all images, organized by prefix
**Why**:
- Simpler configuration
- Single binding in Pages Functions
- Can organize with prefixes if needed later

**Bucket Structure**:
```
images/
  ├── {uuid}.jpg
  ├── {uuid}.png
  └── {uuid}.webp
```

**Alternatives Considered**:
- Multiple buckets per tab: More complex, no clear benefit
- Date-based organization: Adds complexity, not needed yet

## Risks / Trade-offs

### Risk 1: Offline Functionality Lost
**Risk**: Images stored in R2 require internet connection
**Mitigation**: 
- Document this limitation
- Consider caching strategy (Service Worker) for offline access
- Base64 fallback for critical images (optional)

### Risk 2: Migration Complexity
**Risk**: Existing base64 images need migration
**Mitigation**:
- Incremental migration strategy
- Graceful fallback to base64 if R2 unavailable
- Clear migration documentation

### Risk 3: R2 Costs
**Risk**: R2 storage costs scale with usage
**Mitigation**:
- R2 has no egress fees (unlike S3)
- Monitor usage
- Consider lifecycle policies for old images

### Risk 4: CORS Configuration
**Risk**: R2 bucket needs proper CORS configuration
**Mitigation**:
- Configure CORS in R2 bucket settings
- Test CORS in development
- Use Pages Function proxy if needed

### Trade-off: Performance vs Offline
**Trade-off**: Better performance and scalability vs offline functionality
**Decision**: Prioritize performance and scalability. Offline can be added later with Service Worker caching.

## Migration Plan

### Phase 1: Infrastructure Setup
1. Create R2 bucket
2. Configure R2 binding in Pages Functions
3. Test R2 access

### Phase 2: Backend Implementation
1. Create `/api/r2` Pages Function
2. Implement upload/download/delete endpoints
3. Test endpoints

### Phase 3: Frontend Integration
1. Create R2 storage service
2. Update image upload flow
3. Update canvas object handling
4. Test end-to-end flow

### Phase 4: Migration (Optional)
1. Implement migration detection
2. Add migration UI/background process
3. Migrate existing images incrementally

### Rollback Plan
- Keep base64 support as fallback
- Feature flag to switch between R2 and base64
- Can revert to base64 storage if issues arise

## Open Questions

1. **Video Storage**: Should videos also be stored in R2? (Deferred - can add later)
2. **Image Optimization**: Should we resize/optimize images on upload? (Deferred)
3. **CDN Integration**: Should we use Cloudflare CDN for R2 URLs? (R2 URLs work directly)
4. **Access Control**: Do we need R2 bucket access controls? (Currently public read, write via Pages Function)
5. **Lifecycle Policies**: Should we implement R2 lifecycle policies for old images? (Deferred)

## Implementation Notes

### R2 Binding Configuration
In Cloudflare Pages Dashboard:
- Settings → Functions → R2 Bucket Bindings
- Add binding: `STORAGE_R2`
- Select R2 bucket

### Pages Function Endpoint Structure
```
POST /api/r2          - Upload image, returns URL
GET  /api/r2/:key     - Retrieve image
DELETE /api/r2/:key   - Delete image
```

### Frontend Service API
```typescript
r2Service.uploadImage(file: File): Promise<string>
r2Service.getImageUrl(key: string): string
r2Service.deleteImage(key: string): Promise<void>
```

### Canvas Object Format
```typescript
{
  content: string; // R2 URL: "https://pub-xxx.r2.dev/images/uuid.jpg"
  // or base64 fallback: "data:image/jpeg;base64,..."
}
```
