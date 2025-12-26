# Quick Start - Cloudflare Deployment

## ✅ Current Status

- ✅ **Frontend Deployed**: Available at https://chronoai-marketing-dashboard.pages.dev
- ⚠️ **Action Required**: Configure KV Namespace binding in Pages Settings

## Configure KV Namespace Binding

1. **Go to Cloudflare Dashboard**:
   - Navigate to Workers & Pages → chronoai-marketing-dashboard → Settings → Functions

2. **Add KV Namespace Binding**:
   - Scroll to "KV Namespace Bindings"
   - Click "Add binding"
   - Variable name: `STORAGE_KV`
   - KV namespace: Select your `STORAGE_KV` namespace (or create one if needed)
   - Click "Save"

3. **Create KV Namespace** (if you don't have one):
   ```bash
   pnpx wrangler kv namespace create "STORAGE_KV"
   ```

## Access Your Site

Your frontend is live at:
**https://chronoai-marketing-dashboard.pages.dev**

The API endpoint is available at:
**https://chronoai-marketing-dashboard.pages.dev/api/storage**

## Test the Setup

1. Visit your Pages URL
2. Open browser DevTools → Console
3. Try using the app - KV operations should work
4. If you see errors, check that the KV namespace binding is configured correctly

## Troubleshooting

### Site loads but KV doesn't work
- Check browser console for errors
- Verify KV namespace binding is configured in Pages Settings → Functions
- Check function logs in Cloudflare Dashboard → Workers & Pages → Your Project → Functions → Logs

### Need to redeploy after binding change
The KV binding change takes effect immediately - no redeployment needed. However, if you made code changes:
```bash
pnpm run build
pnpx wrangler pages deploy dist --project-name=chronoai-marketing-dashboard
```
