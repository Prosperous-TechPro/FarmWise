# FarmWise UI/UX Guidelines

## Design Philosophy

FarmWise is designed to be:
- **Intuitive** - Farmers should understand the UI without training
- **Accessible** - Works for all users regardless of ability
- **Responsive** - Functions perfectly on all devices
- **Practical** - Focuses on agricultural workflows
- **Professional** - Builds confidence in the platform

## Color Scheme

### Primary Colors
- **Green (#22c55e)** - Primary action, success, healthy status
- **White (#ffffff)** - Background, clarity
- **Black (#000000)** - Text, contrast

### Status Indicators
- **Gold/Yellow** - Attention needed, manageable issues
- **Red (#ef4444)** - Loss, critical issues, errors
- **Green (#10b981)** - Profit, success
- **Blue (#3b82f6)** - Information, secondary actions
- **Gray** - Disabled, neutral

### Important Rule
**Never use color alone** to convey status. Always include text labels or icons.

### Example - BAD
```html
<!-- ❌ Color-only status (not accessible) -->
<div style="background: red"></div>
```

### Example - GOOD
```html
<!-- ✅ Color + Icon + Text (accessible) -->
<div style="background: #fee2e2; border-left: 4px solid #ef4444;">
  <span>⚠️ Loss Status</span>
</div>
```

## Typography

### Font Family
- System fonts for performance: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`

### Sizes
- **Base:** 16px
- **Small:** 14px
- **Large:** 18px
- **XL:** 24px
- **2XL:** 32px

### Hierarchy
- Page titles: 32px, bold
- Section titles: 24px, bold
- Subsections: 18px, bold
- Body text: 16px, regular
- Labels: 14px, regular

## Layout & Spacing

### Grid System
- Responsive grid layout
- Mobile-first approach
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Spacing Units
- XS: 0.5rem (8px)
- SM: 1rem (16px)
- MD: 1.5rem (24px)
- LG: 2rem (32px)
- XL: 3rem (48px)

### Margins & Padding
- Use consistent spacing units
- Maintain visual hierarchy
- White space for clarity

## Components

### Forms
- Clear labels for every input
- Inline validation feedback
- Disabled state for submit during processing
- Accessibility: proper `<label>` elements, ARIA attributes

### Buttons
- Primary: Green background, white text
- Secondary: White background, green border
- Danger: Red background, white text
- Disabled: Gray, cursor not-allowed

### Cards
- White background
- Subtle shadow
- Border for separation
- Hover state with shadow increase

### Navigation
- Clear, consistent menu structure
- Current page indication
- Mobile hamburger menu
- Keyboard accessible

### Tables
- Sortable columns
- Pagination for large datasets
- Responsive: stack on mobile
- Alternating row colors for readability

## Accessibility (WCAG 2.1 Level AA)

### Color Contrast
- Text: Minimum 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 ratio

### Keyboard Navigation
- All interactive elements accessible via Tab key
- Focus indicators visible
- Logical tab order

### Screen Readers
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`
- ARIA labels for icons: `aria-label="Delete"`
- ARIA descriptions: `aria-describedby="error-message"`
- Link text descriptive: "View farm details" not "Click here"

### Images
- Alt text for all images
- Decorative images: `alt=""`
- Descriptive for functional images

### Videos & Audio
- Captions for videos
- Transcripts for audio

## Financial Display

### Profit/Loss Indicator
```
Status: Gold (Profit)
Color:  #22c55e (Green)
Icon:   ✓ or 📈
Label:  "Profitable"
Amount: $1,234.56
```

### Breakdown
```
Total Revenue:    $10,000.00
Total Costs:      $8,765.44
Gross Profit:     $1,234.56
Net Profit:       $1,000.00
Profit Margin:    10%
```

## Mobile Considerations

### Responsiveness
- Touch-friendly button size: minimum 44x44px
- Font size: 16px minimum (prevents zoom on iOS)
- No hover-only interactions

### Offline Indicators
- Sync status indicator
- "Pending" badge for offline changes
- Retry buttons for failed syncs

### Performance
- Lazy loading images
- Minimal animations
- Efficient asset loading

## Common Patterns

### Confirmation Dialogs
```
Title: "Are you sure?"
Message: "This action cannot be undone."
Buttons: [Cancel] [Delete]
```

### Empty States
```
Icon: Relevant to the section
Heading: "No [items] yet"
Message: "Get started by creating your first [item]"
Button: "Create [item]"
```

### Loading States
```
Spinner + "Loading..."
For longer operations: Progress bar
```

### Error Messages
```
Icon: ⚠️ or ❌
Color: Red background
Message: "What went wrong" + "How to fix it"
```

### Success Messages
```
Icon: ✓
Color: Green background
Message: "Action completed"
Auto-dismiss: 3 seconds
```

## Dark Mode (Future)

When implemented:
- Respect `prefers-color-scheme`
- Maintain accessibility ratios
- High-contrast text
- Softer backgrounds (not pure black)

## Testing Design

### User Testing
- Test with real farmers
- Test on actual devices and networks
- Test with slow connections
- Test on assistive technology

### Automated Testing
- Accessibility audit tools
- Visual regression testing
- Performance monitoring
- Cross-browser testing

## Brand Guidelines

### Logo Usage
- Never distort or rotate
- Minimum size: 40px
- Clear space: 10px on all sides
- Don't use brand colors as logo tint

### Voice & Tone
- Professional but approachable
- Clear and jargon-free
- Supportive and helpful
- Action-oriented

### Writing Style
- Short sentences
- Active voice
- Present tense
- Consistent terminology

## Component Library

### Planned Components (Future)
- Button (variants: primary, secondary, danger, disabled)
- Input field (text, number, date, select)
- Checkbox and Radio
- Card
- Modal
- Toast notification
- Breadcrumb
- Pagination
- Table
- Form
- Loading spinner
- Empty state

---

**Last Updated:** Prompt 0
**Next Update:** Sprint 1 - Component implementation
