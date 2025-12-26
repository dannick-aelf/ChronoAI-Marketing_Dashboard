# Cloudflare Deployment Guide

This guide explains how to deploy the frontend to Cloudflare Pages with KV and R2 storage using Pages Functions.

## Architecture

- **Frontend**: Deployed to Cloudflare Pages (serves the React app)
- **API**: Cloudflare Pages Functions (handles KV and R2 API requests)
- **Storage**: 
  - Cloudflare Workers KV (canvas metadata, persistent storage)
  - Cloudflare R2 (image storage, object storage)

## Step 1: Create KV Namespace and R2 Bucket

1. **Create KV Namespace**:
   ```bash
   pnpx wrangler kv namespace create "STORAGE_KV"
   ```
   Note the namespace ID from the output.

2. **Create Preview KV Namespace** (for local development):
   ```bash
   pnpx wrangler kv namespace create "STORAGE_KV" --preview
   ```
   Note the preview namespace ID from the output.

3. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard → R2 → Create bucket
   - Name: `chronoai-images` (or your preferred name)
   - Note: You can also create via CLI: `pnpx wrangler r2 bucket create chronoai-images`

## Step 2: Deploy to Cloudflare Pages

### Option A: Using Wrangler CLI (Recommended)

1. **Build the frontend**:
   ```bash
   pnpm run build
   ```

2. **Deploy to Pages**:
   ```bash
   pnpx wrangler pages deploy dist --project-name=chronoai-marketing-dashboard
   ```

3. **Configure KV Namespace Binding**:
   - Go to Cloudflare Dashboard → Workers & Pages → chronoai-marketing-dashboard → Settings → Functions
   - Scroll to "KV Namespace Bindings"
   - Click "Add binding"
   - Variable name: `STORAGE_KV`
   - KV namespace: Select your `STORAGE_KV` namespace
   - Click "Save"

4. **Configure R2 Bucket Binding**:
   - In the same Functions settings page
   - Scroll to "R2 Bucket Bindings"
   - Click "Add binding"
   - Variable name: `STORAGE_R2`
   - R2 bucket: Select your R2 bucket (e.g., `chronoai-images`)
   - Click "Save"

### Option B: Using Cloudflare Dashboard

1. **Build the frontend**:
   ```bash
   pnpm run build
   ```

2. **Go to Cloudflare Dashboard**:
   - Navigate to Workers & Pages → Create Application → Pages → Upload assets
   - Upload the `dist` folder contents
   - Name your project: `chronoai-marketing-dashboard`

3. **Configure KV Namespace Binding**:
   - Go to Settings → Functions → KV Namespace Bindings
   - Click "Add binding"
   - Variable name: `STORAGE_KV`
   - KV namespace: Select your `STORAGE_KV` namespace (or create one)
   - Click "Save"

### Option C: Connect Git Repository (Recommended for CI/CD)

1. **Go to Cloudflare Dashboard**:
   - Workers & Pages → Create Application → Pages → Connect to Git

2. **Select your repository** and configure:
   - **Build command**: `pnpm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave empty)

3. **Configure KV Namespace Binding**:
   - Go to Settings → Functions → KV Namespace Bindings
   - Click "Add binding"
   - Variable name: `STORAGE_KV`
   - KV namespace: Select your `STORAGE_KV` namespace (or create one)
   - Click "Save"

4. **Configure R2 Bucket Binding**:
   - Go to Settings → Functions → R2 Bucket Bindings
   - Click "Add binding"
   - Variable name: `STORAGE_R2`
   - R2 bucket: Select your R2 bucket (or create one)
   - Click "Save"

5. **Deploy**: Cloudflare will automatically build and deploy on every push to your main branch.

## Accessing Your Site

After deployment, your site will be available at:
```
https://chronoai-marketing-dashboard.pages.dev
```

The API endpoint will be available at:
```
https://chronoai-marketing-dashboard.pages.dev/api/storage
```

Or your custom domain if you've configured one.

## Troubleshooting

### Frontend shows but KV operations fail

1. Verify the KV namespace binding is configured correctly in Pages Settings → Functions
2. Check browser console for errors
3. Verify the Pages Function is deployed (check Functions tab in Pages dashboard)

### KV operations return errors

1. Check that the KV namespace binding name matches exactly: `STORAGE_KV`
2. Verify the KV namespace exists and is bound to your Pages project
3. Check function logs in Cloudflare Dashboard → Workers & Pages → Your Project → Functions → Logs

### R2 image upload fails

1. Verify the R2 bucket binding name matches exactly: `STORAGE_R2`
2. Check that the R2 bucket exists and is bound to your Pages project
3. Verify R2 bucket has public read access (for image URLs to work)
4. Check function logs for R2 upload errors
5. Test R2 API endpoint directly: `curl -X POST https://your-site.pages.dev/api/r2 -F "file=@test.jpg"`

### Build fails

1. Make sure all dependencies are installed: `pnpm install`
2. Check build output: `pnpm run build`
3. Verify `dist` folder contains `index.html` and `assets` folder
4. Verify `functions` folder contains `api/storage.ts`

## Local Development

For local development with Pages Functions:

1. **Create `.dev.vars` file** in the project root:
   ```
   STORAGE_KV_PREVIEW_ID=your-preview-kv-namespace-id
   STORAGE_R2_PREVIEW_BUCKET_NAME=your-r2-bucket-name
   ```

2. **Start Pages dev server**:
   ```bash
   pnpx wrangler pages dev dist --compatibility-date=2024-01-01
   ```

   Or use Vite dev server (which will proxy API requests):
   ```bash
   pnpm run dev
   ```

   Note: For full Pages Functions support in local dev, use `wrangler pages dev` instead of `vite`.

## Custom Domain

To use a custom domain:

1. Go to Pages → Your Project → Custom Domains
2. Add your domain
3. Follow DNS configuration instructions

## KV Namespace Management

### List KV namespaces:
```bash
pnpx wrangler kv namespace list
```

### Create a new KV namespace:
```bash
pnpx wrangler kv namespace create "STORAGE_KV"
```

### Delete a KV namespace (careful!):
```bash
pnpx wrangler kv namespace delete --namespace-id=your-namespace-id
```

### R2 Bucket Management

### List R2 buckets:
```bash
pnpx wrangler r2 bucket list
```

### Create a new R2 bucket:
```bash
pnpx wrangler r2 bucket create chronoai-images
```

### Delete an R2 bucket (careful!):
```bash
pnpx wrangler r2 bucket delete chronoai-images
```
