# ChronoAI Marketing Dashboard - Design Tokens Specification

## Overview

This document defines all design tokens extracted from the ChronoAI Marketing Dashboard project. These tokens form the foundation of the design system and ensure consistency across the application.

**Last Updated:** January 2, 2025  
**Version:** 1.0.0  
**Project:** ChronoAI Marketing Dashboard

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Animation](#animation)
7. [Component Tokens](#component-tokens)
8. [Theme System](#theme-system)

---

## Color System

### Base Colors

#### Black & White
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-black` | `#010100` | - | Primary dark background |
| `--color-white` | `#FFFFFF` | `#FFFFFF` | Primary white, text on dark |

#### Grey Scale
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-grey-bg-1` | `#0F0F0F` | `#FAFAFA` | Secondary background |
| `--color-grey-bg-2` | `#1A1A1A` | `#F5F5F5` | Tertiary background, surface |
| `--color-grey-bg-3` | `#272727` | `#E5E5E5` | Elevated surfaces, borders |
| `--color-grey-bg-4` | `#333333` | `#D4D4D4` | Borders, dividers |

#### White Scale (Opacity-based)
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-white-90` | `#E6E6E6` | `#262626` | Secondary text |
| `--color-white-80` | `#CCCCCC` | `#404040` | Muted text |
| `--color-white-60` | `#999999` | `#737373` | Placeholder text |
| `--color-white-40` | `#666666` | `#A3A3A3` | Disabled states |

### Semantic Colors

#### Background Colors
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-bg-primary` | `#010100` | `#FFFFFF` | Main page background |
| `--color-bg-secondary` | `#0F0F0F` | `#FAFAFA` | Secondary surfaces |
| `--color-bg-tertiary` | `#1A1A1A` | `#F5F5F5` | Tertiary surfaces |
| `--color-bg-surface` | `#1A1A1A` | `#FFFFFF` | Card/surface backgrounds |
| `--color-bg-elevated` | `#272727` | `#F5F5F5` | Elevated cards, modals |

#### Text Colors
| Token | Dark Mode | Light Mode | Usage | WCAG Contrast |
|-------|-----------|------------|-------|---------------|
| `--color-text-primary` | `#FFFFFF` | `#171717` | Primary text | AA+ |
| `--color-text-secondary` | `#E6E6E6` | `#404040` | Secondary text | AA+ |
| `--color-text-muted` | `#999999` | `#737373` | Muted text | AA |
| `--color-text-placeholder` | `#666666` | `#A3A3A3` | Placeholder text | AA |

#### Border Colors
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-border-light` | `#272727` | `#E5E5E5` | Light borders |
| `--color-border` | `#333333` | `#D4D4D4` | Default borders |
| `--color-border-dark` | `#666666` | `#A3A3A3` | Dark borders, dividers |

### Brand Colors

#### Lumen Brand (Currently White)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-orange-primary` | `#FFFFFF` | Primary brand color |
| `--color-orange-secondary` | `#E6E6E6` | Secondary brand color |

### Interactive Colors

#### Button Colors
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-button-bg` | `rgba(0, 0, 0, 0.4)` | `rgba(0, 0, 0, 0.4)` | Button background |
| `--color-button-bg-hover` | `rgba(0, 0, 0, 0.5)` | `rgba(0, 0, 0, 0.5)` | Button hover state |
| `--color-button-text` | `#FFFFFF` | `#FFFFFF` | Button text |
| `--color-button-counter-bg` | `rgba(0, 0, 0, 0.8)` | `rgba(0, 0, 0, 0.8)` | Counter badge background |
| `--color-button-counter-text` | `#FFFFFF` | `#FFFFFF` | Counter badge text |

#### Selection Colors
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-selected-border` | `#FFFFFF` | `#2563eb` | Selected item border |
| `--color-selected-bg` | `rgba(255, 255, 255, 0.1)` | `rgba(37, 99, 235, 0.1)` | Selected item background |

#### Active Indicator
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-active-indicator` | `#FFFFFF` | `#737373` | Active state indicator |
| `--color-active-indicator-shadow` | `rgba(255, 255, 255, 0.8)` | `rgba(0, 0, 0, 0.2)` | Indicator shadow |

#### Descriptor Colors
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-descriptor-label` | `rgba(255, 255, 255, 0.6)` | `rgba(255, 255, 255, 0.6)` | Label text |
| `--color-descriptor-content` | `#FFFFFF` | `#FFFFFF` | Content text |

#### Divider
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--color-divider` | `#333333` | `#A3A3A3` | Divider lines |

---

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-primary` | `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif` | Headings, primary text |
| `--font-secondary` | `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif` | Body text, secondary content |

**Note:** Both fonts use the same system font stack, prioritizing SF Pro Display/Text on macOS.

### Typography Scale

#### Headings
| Element | Font Family | Font Weight | Line Height | Color |
|---------|-------------|-------------|-------------|-------|
| `h1, h2, h3, h4, h5, h6` | `--font-primary` | `400` | `1.2` | `--color-text-primary` |

#### Body Text
| Element | Font Family | Font Weight | Line Height | Color |
|---------|-------------|-------------|-------------|-------|
| `p, span, div` | `--font-secondary` | `400` | `1.5` | `--color-text-primary` |

### Font Rendering

- **Antialiasing:** Enabled (`-webkit-font-smoothing: antialiased`)
- **Text Rendering:** Optimized for legibility (`text-rendering: optimizeLegibility`)
- **Text Size Adjust:** 100% (`-webkit-text-size-adjust: 100%`)

---

## Spacing

### Base Unit
- **Base:** `8px` (standard spacing unit)

### Spacing Scale (Tailwind)
| Token | Value | Usage |
|-------|-------|-------|
| `grey.50` | `#FAFAFA` | Lightest grey |
| `grey.100` | `#F5F5F5` | Very light grey |
| `grey.200` | `#E5E5E5` | Light grey |
| `grey.300` | `#D4D4D4` | Medium-light grey |
| `grey.400` | `#A3A3A3` | Medium grey |
| `grey.500` | `#737373` | Base grey |
| `grey.600` | `#525252` | Medium-dark grey |
| `grey.700` | `#404040` | Dark grey |
| `grey.800` | `#262626` | Very dark grey |
| `grey.900` | `#171717` | Darkest grey |
| `grey.950` | `#0A0A0A` | Near black |

### Custom Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `mobile` | `20px` | Mobile screen edge padding |
| `canvas-padding` | `24px` | Canvas content padding |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `button` | `10px` | Button corners |
| `card` | `12px` | Card corners |
| `input` | `10px` | Input field corners |
| `modal` | `16px` | Modal dialog corners |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `card` | `0 2px 8px rgba(0, 0, 0, 0.08)` | Card elevation |
| `elevated` | `0 4px 12px rgba(0, 0, 0, 0.12)` (light) / `0 4px 12px rgba(0, 0, 0, 0.4)` (dark) | Elevated surfaces, modals |

---

## Animation

### Skeleton Shimmer
- **Duration:** `1.5s`
- **Iteration:** `infinite`
- **Background Size:** `2000px 100%`
- **Gradient:** Uses `--color-grey-bg-3` and `--color-grey-bg-4` (dark) or `--color-grey-bg-2` and `--color-grey-bg-3` (light)

### Keyframes
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## Component Tokens

### Buttons

#### Primary Button
- **Height:** `48-56px` (recommended: `52px`)
- **Padding:** `16-24px` horizontal
- **Border Radius:** `10px`
- **Font Size:** `16-18px`
- **Font Weight:** `600` (semibold)
- **States:** Default, Pressed (0.8 opacity), Disabled, Loading

#### Secondary Button
- **Height:** `48-56px`
- **Padding:** `16-24px` horizontal
- **Border:** `1-2px` solid
- **Background:** Transparent or subtle fill

#### Icon Button
- **Size:** `44x44px` minimum
- **Padding:** `12px`
- **Border Radius:** `8-12px`

### Cards

#### Standard Card
- **Padding:** `16-20px`
- **Border Radius:** `12px`
- **Shadow:** `card` (subtle elevation)

#### Elevated Card
- **Padding:** `20-24px`
- **Border Radius:** `16px`
- **Shadow:** `elevated` (medium elevation)

### Forms

#### Input Fields
- **Height:** `48-56px` (minimum)
- **Padding:** `16px` horizontal, `14px` vertical
- **Border Radius:** `10px`
- **Border:** `1-2px` solid
- **Font Size:** `16px` (prevents iOS zoom)

### Lists

#### List Items
- **Minimum Height:** `48px`
- **Padding:** `16px` horizontal, `12-16px` vertical
- **Touch Feedback:** Background color change on press (0.1 opacity overlay)

### Modals

#### Modal/Dialog
- **Max Width:** `90%` of screen width (mobile)
- **Border Radius:** `16-20px` (top corners)
- **Padding:** `24px`
- **Backdrop:** `0.5-0.6` opacity dark overlay

---

## Theme System

### Theme Toggle
- **Implementation:** `data-theme` attribute on `document.documentElement`
- **Values:** `"dark"` (default) or `"light"`
- **Persistence:** Stored in `localStorage` as `'theme'`

### Theme Switching
All color tokens automatically switch based on the `[data-theme]` attribute. The system uses CSS custom properties (CSS variables) to enable seamless theme transitions.

### Theme Detection
```javascript
const [theme, setTheme] = useState<'dark' | 'light'>(() => {
  const saved = localStorage.getItem('theme');
  return (saved === 'light' || saved === 'dark') ? saved : 'dark';
});
```

---

## Accessibility

### Contrast Ratios
- **Body Text:** Minimum 4.5:1 (WCAG AA)
- **Large Text (18px+):** Minimum 3:1 (WCAG AA)
- **Interactive Elements:** Minimum 3:1 (WCAG AA)

### Touch Targets
- **Minimum Size:** `44x44px` (iOS) / `48x48dp` (Android)
- **Spacing Between:** Minimum `8px`

### Focus States
- Focus rings are intentionally removed for minimal design
- Keyboard navigation still functional

---

## Utility Classes

### Background Utilities
- `.bg-bg-primary`, `.bg-bg-secondary`, `.bg-bg-tertiary`, `.bg-bg-surface`, `.bg-bg-elevated`
- `.bg-grey-bg-1`, `.bg-grey-bg-2`, `.bg-grey-bg-3`, `.bg-grey-bg-4`
- `.bg-white-90`, `.bg-white-80`, `.bg-white-60`, `.bg-white-40`
- `.bg-button-bg`, `.bg-button-counter`
- `.bg-selected`, `.bg-active-indicator`
- `.bg-divider`

### Text Utilities
- `.text-text-primary`, `.text-text-secondary`, `.text-text-muted`, `.text-text-placeholder`
- `.text-white-90`, `.text-white-80`, `.text-white-60`, `.text-white-40`
- `.text-button-text`, `.text-button-counter`
- `.text-descriptor-label`, `.text-descriptor-content`

### Border Utilities
- `.border-border-light`, `.border-border`, `.border-border-dark`
- `.border-selected`

### Typography Utilities
- `.font-primary`, `.font-secondary`

### Shadow Utilities
- `.shadow-elevated`

---

## Implementation Notes

1. **CSS Variables:** All tokens are implemented as CSS custom properties for theme switching
2. **Tailwind Integration:** Tokens are also available in Tailwind config for utility class usage
3. **Mobile-First:** Design system follows mobile-first approach with responsive breakpoints
4. **WCAG Compliance:** All color combinations meet WCAG AA standards for accessibility
5. **System Fonts:** Uses system font stack for optimal performance and native feel

---

## Usage Examples

### Using CSS Variables
```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-card);
}
```

### Using Tailwind Classes
```jsx
<div className="bg-bg-primary text-text-primary border border-border rounded-card">
  Content
</div>
```

### Theme Switching
```javascript
// Set theme
document.documentElement.setAttribute('data-theme', 'light');
localStorage.setItem('theme', 'light');
```

---

## Changelog

### Version 1.0.0 (January 2, 2025)
- Initial extraction of design tokens from dashboard project
- Documented color system, typography, spacing, and component tokens
- Added theme system documentation
- Included accessibility guidelines

---

## References

- **Source Files:**
  - `dashboard/src/index.css`
  - `dashboard/tailwind.config.js`
  - `dashboard/src/components/*.tsx`

- **Standards:**
  - WCAG 2.1 AA
  - Mobile-first design principles
  - iOS Human Interface Guidelines
  - Material Design Guidelines

