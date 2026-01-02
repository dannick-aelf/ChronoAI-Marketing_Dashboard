# Design Specifications

This directory contains the design tokens and specifications extracted from the ChronoAI Marketing Dashboard project.

## Files

- **`design-tokens.md`** - Comprehensive markdown documentation of all design tokens
- **`design-tokens.json`** - Machine-readable JSON format of design tokens for programmatic use

## Usage

### For Designers
Refer to `design-tokens.md` for complete documentation of colors, typography, spacing, and component specifications.

### For Developers
Use `design-tokens.json` to:
- Generate TypeScript types
- Create design token utilities
- Integrate with design tools
- Build theme switching logic

## Quick Reference

### Colors
- **Primary Background:** `#010100` (dark) / `#FFFFFF` (light)
- **Primary Text:** `#FFFFFF` (dark) / `#171717` (light)
- **Border:** `#333333` (dark) / `#D4D4D4` (light)

### Typography
- **Font Family:** SF Pro Display/Text (system fallback)
- **Base Font Size:** `16px`
- **Line Height:** `1.5` (body), `1.2` (headings)

### Spacing
- **Base Unit:** `8px`
- **Mobile Padding:** `20px`
- **Canvas Padding:** `24px`

### Border Radius
- **Button:** `10px`
- **Card:** `12px`
- **Modal:** `16px`

## Theme System

The design system supports dark and light themes via the `data-theme` attribute:

```javascript
document.documentElement.setAttribute('data-theme', 'light');
```

All color tokens automatically adapt based on the theme.

## Accessibility

All color combinations meet WCAG AA standards:
- Body text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

## Contributing

When updating design tokens:
1. Update both `design-tokens.md` and `design-tokens.json`
2. Update the version number
3. Add changelog entry
4. Test theme switching in both modes

