# Design Tokens

## Color Palette

### Brand Colors (Blue)
- `brand-50`: #F5F9FF - Lightest background
- `brand-100`: #EEF6FF - Light background
- `brand-300`: #BFE3FF - Light accent
- `brand-500`: #0B6CF1 - Primary brand color
- `brand-700`: #055BB5 - Dark brand color

### Neutral Colors
- `neutral-100`: #F6F9FF - Page background
- `neutral-300`: #E6EEF9 - Borders, dividers
- `neutral-600`: #6B7280 - Secondary text
- `neutral-900`: #1F2937 - Primary text

### Status Colors
- Draft: Gray (`neutral-200` bg, `neutral-700` text)
- Sent: Blue (`blue-100` bg, `blue-700` text)
- Paid: Green (`green-100` bg, `green-700` text)
- Overdue: Red (`red-100` bg, `red-700` text)

## Typography

### Font Family
- Primary: Inter (system fallback: -apple-system, sans-serif)

### Font Sizes
- Base: 16px
- Small: 14px (0.875rem)
- Large headings: 48px-60px (3-3.75rem)
- Section headings: 24-32px (1.5-2rem)
- Card titles: 18-20px (1.125-1.25rem)

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing

- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 24px, 32px, 48px
- Container padding: 24px (1.5rem)
- Card padding: 24px (1.5rem)
- Section gaps: 32px (2rem)

## Border Radius

- Small: 8px (0.5rem)
- Medium: 12px (0.75rem) - Default for cards, buttons
- Large: 16px (1rem)
- Full: 9999px - Pills, badges

## Shadows

- Soft: `0 2px 8px rgba(11, 108, 241, 0.08)` - Default cards
- Medium: `0 4px 16px rgba(11, 108, 241, 0.12)` - Hover states
- Large: `0 8px 32px rgba(11, 108, 241, 0.16)` - Modals, elevated cards

## Animations

### Transitions
- Duration: 150-300ms
- Easing: ease-in-out

### Hover Effects
- Buttons: scale(1.02), slight shadow increase
- Cards: translateY(-4px), shadow increase
- Links: color change

### Loading States
- Skeleton: Gradient shimmer animation (1.5s infinite)
- Spinner: Rotate animation

## Component Patterns

### Buttons
- Primary: Filled brand-500, white text, hover brand-600
- Secondary: White bg, brand-500 border and text, hover brand-50 bg
- Ghost: Transparent, neutral-700 text, hover neutral-200 bg
- Padding: 12px 16px (py-3 px-4)
- Border radius: 12px

### Cards
- Background: White
- Shadow: soft
- Border radius: 12px
- Padding: 24px
- Hover: Lift effect with shadow increase

### Badges
- Padding: 4px 10px
- Border radius: Full (pill shape)
- Font size: 12px (0.75rem)
- Font weight: 500

### Form Inputs
- Border: 1px solid neutral-300
- Border radius: 8px
- Padding: 8px 16px
- Focus: 2px ring brand-500

### Tables
- Header: neutral-100 background
- Row hover: neutral-50 background
- Border: neutral-200
- Cell padding: 16px 24px

## Layout

### Container
- Max width: 1280px (container mx-auto)
- Padding: 24px (px-6)

### Grid
- Dashboard metrics: 4 columns on desktop, 2 on tablet, 1 on mobile
- Invoice list: Full width table
- Forms: 2 columns on desktop, 1 on mobile

### Breakpoints (Tailwind defaults)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## Accessibility

- Minimum contrast ratio: 4.5:1 for text
- Focus indicators: 2px ring in brand-500
- Keyboard navigation: All interactive elements accessible
- ARIA labels: Present on icon buttons and complex components
