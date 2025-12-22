# Deployment Guide

This project has been built and is ready for deployment. The production build is located in the `dist/` folder.

## Quick Deploy Options

### Option 1: Tiiny.host (Easiest - No Account Needed)

1. **Zip the dist folder:**
   ```bash
   cd dist
   zip -r ../lumen-marketing-assets.zip .
   ```

2. **Go to [tiiny.host](https://tiiny.host)**
   - Drag and drop the `lumen-marketing-assets.zip` file
   - Choose a subdomain name (e.g., `lumen-marketing-assets`)
   - Click "Upload"
   - Your site will be live in seconds!

3. **Access your site:**
   - Your site will be available at: `https://your-chosen-name.tiiny.host`

### Option 2: Netlify Drop (Free, No Account Needed)

1. **Go to [Netlify Drop](https://app.netlify.com/drop)**
   - Drag and drop the entire `dist/` folder
   - Your site will be deployed automatically
   - You'll get a random URL like `https://random-name-123.netlify.app`

2. **To customize the URL:**
   - Sign up for a free Netlify account
   - Go to Site settings → Change site name
   - Choose a custom name

### Option 3: Vercel (Free, Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd dist
   vercel --prod
   ```

3. **Or use Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login
   - Click "New Project"
   - Import your Git repository OR drag and drop the `dist/` folder
   - Deploy!

### Option 4: GitHub Pages (Free, Open Source)

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Select source: `gh-pages` branch
   - Your site will be at: `https://yourusername.github.io/repo-name`

### Option 5: Surge.sh (Free, Command Line)

1. **Install Surge:**
   ```bash
   npm install -g surge
   ```

2. **Deploy:**
   ```bash
   cd dist
   surge
   ```
   - Follow the prompts to create an account and choose a domain

## Recommended: Tiiny.host (Fastest & Simplest)

For the quickest deployment without any setup:

1. **Create a zip file of the dist folder:**
   ```bash
   cd dist
   zip -r ../deploy.zip .
   cd ..
   ```

2. **Visit [tiiny.host](https://tiiny.host)**
   - Drag and drop `deploy.zip`
   - Choose a name
   - Done! Your site is live.

## Build Command

To rebuild the project:
```bash
npm run build
```

The production files will be in the `dist/` folder.

## Important Notes

- All hosting services above are **free** for basic usage
- The build is optimized and ready for production
- Your site will work on all modern browsers
- No backend required - this is a static site

## Troubleshooting

If you encounter issues:
1. Make sure the `dist/` folder contains `index.html` and the `assets/` folder
2. Some hosts require the files to be in the root - make sure you're uploading the contents of `dist/`, not the `dist/` folder itself
3. For SPA (Single Page Application) routing issues, configure your host to redirect all routes to `index.html`

