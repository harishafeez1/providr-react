# Styling Conventions

This document covers Tailwind CSS patterns, Metronic-specific classes, dark mode implementation, and responsive design for the Providr Provider Portal.

## Tailwind CSS Patterns

### Layout Utilities

**Flexbox:**
```tsx
// Horizontal layout
<div className="flex items-center justify-between">
  <span>Left content</span>
  <span>Right content</span>
</div>

// Vertical layout
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Center content
<div className="flex items-center justify-center min-h-screen">
  <div>Centered content</div>
</div>
```

**Grid:**
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// Fixed columns
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-8">Main content</div>
  <div className="col-span-4">Sidebar</div>
</div>
```

### Spacing

**Padding:**
```tsx
<div className="p-4">Padding all sides</div>
<div className="px-6">Horizontal padding</div>
<div className="py-8">Vertical padding</div>
<div className="pt-4 pb-6">Top and bottom padding</div>
```

**Margin:**
```tsx
<div className="m-4">Margin all sides</div>
<div className="mt-6 mb-4">Top and bottom margin</div>
<div className="mx-auto">Centered with auto horizontal margin</div>
```

**Gap (for Flex/Grid):**
```tsx
<div className="flex gap-2">Small gap</div>
<div className="flex gap-4">Medium gap</div>
<div className="flex gap-6">Large gap</div>

// Space-y for vertical spacing (alternative to gap)
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Typography

**Text Size:**
```tsx
<h1 className="text-3xl font-bold">Large Heading</h1>
<h2 className="text-2xl font-semibold">Medium Heading</h2>
<h3 className="text-xl font-semibold">Small Heading</h3>
<p className="text-base">Body text</p>
<span className="text-sm">Small text</span>
<span className="text-xs">Extra small text</span>
```

**Font Weight:**
```tsx
<span className="font-light">Light (300)</span>
<span className="font-normal">Normal (400)</span>
<span className="font-medium">Medium (500)</span>
<span className="font-semibold">Semibold (600)</span>
<span className="font-bold">Bold (700)</span>
```

**Text Color:**
```tsx
<p className="text-gray-900 dark:text-gray-100">Primary text</p>
<p className="text-gray-600 dark:text-gray-400">Secondary text</p>
<p className="text-gray-400 dark:text-gray-500">Muted text</p>
```

**Text Alignment:**
```tsx
<p className="text-left">Left aligned</p>
<p className="text-center">Center aligned</p>
<p className="text-right">Right aligned</p>
```

### Colors

**Contextual Colors:**
```tsx
// Brand color (#FF6F1E)
<div className="text-brand bg-brand/10">Brand</div>

// Success
<div className="text-success bg-success/10">Success</div>

// Danger
<div className="text-danger bg-danger/10">Danger</div>

// Warning
<div className="text-warning bg-warning/10">Warning</div>

// Info
<div className="text-info bg-info/10">Info</div>

// Primary
<div className="text-primary bg-primary/10">Primary</div>
```

**Background Colors:**
```tsx
<div className="bg-white dark:bg-gray-800">White background</div>
<div className="bg-gray-50 dark:bg-gray-900">Light gray background</div>
<div className="bg-gray-100 dark:bg-gray-800">Gray background</div>
```

**Border Colors:**
```tsx
<div className="border border-gray-200 dark:border-gray-700">
  Default border
</div>

<div className="border-2 border-primary">
  Primary border
</div>
```

### Borders & Radius

**Border:**
```tsx
<div className="border">All sides border</div>
<div className="border-t">Top border only</div>
<div className="border-b">Bottom border only</div>
<div className="border-2">Thicker border</div>
```

**Border Radius:**
```tsx
<div className="rounded">Small radius (0.25rem)</div>
<div className="rounded-md">Medium radius (0.375rem)</div>
<div className="rounded-lg">Large radius (0.5rem)</div>
<div className="rounded-xl">Extra large radius (0.75rem)</div>
<div className="rounded-full">Full circle</div>
```

### Shadows

```tsx
<div className="shadow-sm">Small shadow</div>
<div className="shadow">Default shadow</div>
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow</div>
<div className="shadow-xl">Extra large shadow</div>
```

### Opacity

```tsx
<div className="opacity-50">50% opacity</div>
<div className="opacity-75">75% opacity</div>

// With hover
<div className="opacity-100 hover:opacity-75">
  Hover to fade
</div>

// Background opacity
<div className="bg-black/50">50% transparent black</div>
<div className="bg-primary/10">10% transparent primary color</div>
```

## Dark Mode Implementation

Always implement dark mode support using Tailwind's `dark:` prefix.

### Background & Text

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content with dark mode support
</div>
```

### Cards

```tsx
<Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <CardBody className="text-gray-900 dark:text-gray-100">
    Card content
  </CardBody>
</Card>
```

### Inputs

```tsx
<Input className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600" />
```

### Hover States

```tsx
<button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
  Hover me
</button>
```

### Complete Dark Mode Example

```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Card Title
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Card description
      </p>
    </CardHeader>
    <CardBody>
      <p className="text-gray-700 dark:text-gray-300">
        Card content goes here
      </p>
    </CardBody>
  </Card>
</div>
```

## Responsive Design

Tailwind uses mobile-first breakpoints.

### Breakpoints

| Prefix | Min Width | Description |
|--------|-----------|-------------|
| `sm:` | 640px | Small screens |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

### Responsive Layouts

**Mobile-First Approach:**
```tsx
// Stack on mobile, row on tablet+
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>

// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**Responsive Spacing:**
```tsx
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

<div className="text-base md:text-lg lg:text-xl">
  Responsive text size
</div>
```

**Responsive Visibility:**
```tsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">
  Desktop only content
</div>

// Show on mobile, hide on desktop
<div className="block lg:hidden">
  Mobile only content
</div>
```

**Responsive Container:**
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  Responsive container with padding
</div>

<div className="max-w-7xl mx-auto px-4">
  Max width container
</div>
```

## Metronic-Specific Classes

Metronic provides additional utility classes.

### Button Classes

```tsx
// Using Metronic classes (when needed)
<button className="btn btn-primary btn-sm">
  Metronic Button
</button>

// Button variants
<button className="btn btn-light">Light</button>
<button className="btn btn-primary">Primary</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-danger">Danger</button>

// Button sizes
<button className="btn btn-sm">Small</button>
<button className="btn">Default</button>
<button className="btn btn-lg">Large</button>
```

**Note:** Prefer Shadcn UI Button component over Metronic classes when possible.

### Card Classes

```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Title</h3>
  </div>
  <div className="card-body">
    Content
  </div>
  <div className="card-footer">
    Footer
  </div>
</div>
```

### Alert Classes

```tsx
<div className="alert alert-success">
  <div className="alert-text">Success message</div>
</div>

<div className="alert alert-danger">
  <div className="alert-text">Error message</div>
</div>

<div className="alert alert-warning">
  <div className="alert-text">Warning message</div>
</div>

<div className="alert alert-info">
  <div className="alert-text">Info message</div>
</div>
```

### Menu Classes

```tsx
<div className="menu">
  <div className="menu-item">
    <a href="#" className="menu-link">
      <span className="menu-icon">
        <KeenIcon icon="home" />
      </span>
      <span className="menu-title">Home</span>
    </a>
  </div>
</div>
```

## Common Patterns

### Card with Header Actions

```tsx
<Card>
  <CardHeader className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Title
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Subtitle
      </p>
    </div>
    <Button variant="light" size="sm">
      <KeenIcon icon="gear" className="ki-outline" />
      Settings
    </Button>
  </CardHeader>
  <CardBody className="pt-6">
    Content
  </CardBody>
</Card>
```

### Stats Card

```tsx
<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
  <CardBody>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Total Tasks
        </p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          1,234
        </h3>
      </div>
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
        <KeenIcon icon="chart" className="ki-filled text-primary text-2xl" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-success mr-2">+12%</span>
      <span className="text-gray-600 dark:text-gray-400">from last month</span>
    </div>
  </CardBody>
</Card>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
    <KeenIcon icon="folder" className="ki-outline text-gray-400 text-3xl" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
    No items found
  </h3>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
    Get started by creating your first item
  </p>
  <Button variant="primary">
    <KeenIcon icon="plus" className="ki-filled" />
    Create New
  </Button>
</div>
```

### Loading State

```tsx
<div className="flex items-center justify-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
</div>

// With text
<div className="flex flex-col items-center justify-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
  <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
</div>
```

### Form Layout

```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        First Name
      </label>
      <Input />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Last Name
      </label>
      <Input />
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Email
    </label>
    <Input type="email" />
  </div>

  <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
    <Button type="button" variant="light">Cancel</Button>
    <Button type="submit" variant="primary">Save</Button>
  </div>
</form>
```

## Best Practices

1. **Mobile-First:** Always design for mobile first, then enhance for larger screens
2. **Dark Mode:** Always include `dark:` variants for all color-related classes
3. **Consistent Spacing:** Use Tailwind's spacing scale (4, 6, 8, etc.) for consistency
4. **Semantic Colors:** Use contextual colors (success, danger, warning) appropriately
5. **Reusable Classes:** Extract common patterns into components rather than repeating classes
6. **Accessibility:** Ensure sufficient color contrast in both light and dark modes
7. **Performance:** Avoid excessive nesting and unnecessary wrapper divs

---

**Remember:** When in doubt, check existing components in the codebase for real-world styling examples.
