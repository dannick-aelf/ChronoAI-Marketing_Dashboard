# ChronoAI Marketing Dashboard

A monorepo for ChronoAI marketing tools and dashboards.

## Workspaces

- **dashboard** - Marketing dashboard application for managing marketing assets
- **authentication** - Authentication service for ChronoAI

## Getting Started

### Installation

Install all workspace dependencies:

```bash
npm install
```

### Development

Run the dashboard development server:

```bash
npm run dev
```

Run the authentication development server:

```bash
npm run dev:auth
```

Or run from a specific workspace:

```bash
npm run dev --workspace=dashboard
npm run dev --workspace=authentication
```

### Build

Build all workspaces:

```bash
npm run build
```

Or build a specific workspace:

```bash
npm run build --workspace=dashboard
```

## Project Structure

```
.
├── dashboard/          # Marketing dashboard application
│   ├── src/           # Source code
│   ├── public/        # Public assets
│   └── package.json   # Dashboard dependencies
├── authentication/     # Authentication service
│   ├── src/           # Source code
│   ├── public/        # Public assets
│   └── package.json   # Authentication dependencies
├── package.json       # Root workspace configuration
└── README.md         # This file
```

## License

Private

