# HTML Sanitizer Usage Guide

This document explains how to use the HTML sanitizer utility to protect your application from XSS attacks and malicious content.

## Overview

The HTML sanitizer uses DOMPurify to remove dangerous HTML, CSS, and JavaScript from user input while preserving safe formatting.

## Functions Available

### `sanitizeHtml(html, strict)`
Main sanitization function with configurable strictness levels.

```typescript
import { sanitizeHtml } from '@/utils/htmlSanitizer';

// Strict mode - removes all CSS and JavaScript
const cleanHtml = sanitizeHtml(userInput, true);

// Basic mode - allows CSS classes but removes inline styles and JavaScript
const cleanHtml = sanitizeHtml(userInput, false);
```

### `sanitizeHtmlStrict(html)`
Removes ALL CSS, JavaScript, and potentially dangerous content.

```typescript
import { sanitizeHtmlStrict } from '@/utils/htmlSanitizer';

const cleanHtml = sanitizeHtmlStrict(userInput);
// Output: Only basic HTML tags with safe attributes
```

### `sanitizeHtmlBasic(html)`
Allows CSS classes but removes inline styles and JavaScript.

```typescript
import { sanitizeHtmlBasic } from '@/utils/htmlSanitizer';

const cleanHtml = sanitizeHtmlBasic(userInput);
// Output: HTML with CSS classes preserved, but no inline styles or JS
```

### `sanitizeText(text)`
Strips ALL HTML tags, returning plain text only.

```typescript
import { sanitizeText } from '@/utils/htmlSanitizer';

const plainText = sanitizeText(htmlContent);
// Output: Plain text with all HTML removed
```

### `isHtmlSafe(html)`
Validates if HTML content is safe.

```typescript
import { isHtmlSafe } from '@/utils/htmlSanitizer';

if (isHtmlSafe(userInput)) {
  // Content is safe to use
} else {
  // Content contains dangerous patterns
}
```

### `sanitizeHtmlAdvanced(html, options)`
Advanced sanitization with custom configuration.

```typescript
import { sanitizeHtmlAdvanced, type SanitizeOptions } from '@/utils/htmlSanitizer';

const options: SanitizeOptions = {
  allowedTags: ['p', 'strong', 'em'],
  allowedAttributes: ['title'],
  allowCssClasses: false,
  allowImages: true,
  allowLinks: false,
  maxLength: 1000
};

const cleanHtml = sanitizeHtmlAdvanced(userInput, options);
```

## What Gets Removed

### Always Removed (All Functions)
- `<script>` tags and JavaScript code
- Event handlers (`onclick`, `onload`, etc.)
- `javascript:` protocol links
- `<iframe>`, `<object>`, `<embed>` tags
- Form elements (`<form>`, `<input>`, `<button>`)
- Meta tags and link tags
- Data URLs (except images)

### Strict Mode Additionally Removes
- All CSS styles and classes
- All `id` attributes
- Background and color styling

### Basic Mode Preserves
- CSS classes (but not inline styles)
- Basic HTML structure
- Safe attributes like `href`, `src`, `alt`

## Where It's Currently Implemented

### 1. Editor Component
Location: `src/components/editor/Editor.tsx`
- Sanitizes content as users type in rich text editor
- Uses `sanitizeHtmlBasic()` to preserve formatting while removing dangerous content

### 2. Company Profile Form
Location: `src/pages/company-profile/add-company-profile/blocks/AddCompanyProfileForm.tsx`
- Sanitizes company description before submission (where Editor component is used)
- Uses `sanitizeHtmlStrict()` for maximum security on form submission
- Uses the improved `stripHtml()` function for validation

## Implementation Examples

### For Rich Text Editors
```typescript
import { sanitizeHtmlBasic } from '@/utils/htmlSanitizer';

// In your editor component
onChange={(newContent) => {
  const sanitizedContent = sanitizeHtmlBasic(newContent);
  setContent(sanitizedContent);
  onChange(sanitizedContent);
}}
```

### For Form Submissions
```typescript
import { sanitizeHtmlStrict } from '@/utils/htmlSanitizer';

// Before sending to API
const handleSubmit = async (values) => {
  const submissionData = {
    ...values,
    description: sanitizeHtmlStrict(values.description)
  };

  await api.post('/endpoint', submissionData);
};
```

### For Display Content
```typescript
import { sanitizeHtmlBasic } from '@/utils/htmlSanitizer';

// Before rendering user content
const DisplayContent = ({ htmlContent }) => {
  const cleanHtml = sanitizeHtmlBasic(htmlContent);

  return (
    <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
  );
};
```

## Best Practices

### 1. Choose the Right Function
- **Rich text editors**: Use `sanitizeHtmlBasic()`
- **Form submissions**: Use `sanitizeHtmlStrict()`
- **Plain text fields**: Use `sanitizeText()`
- **User-generated content display**: Use `sanitizeHtmlBasic()`

### 2. Sanitize at Multiple Points
- **Input**: Sanitize as users type (in editors)
- **Submission**: Sanitize before sending to API
- **Display**: Sanitize before rendering (defense in depth)

### 3. Validate Before Sanitizing
```typescript
import { isHtmlSafe, sanitizeHtml } from '@/utils/htmlSanitizer';

const processUserInput = (input: string) => {
  if (!isHtmlSafe(input)) {
    console.warn('Potentially dangerous content detected');
  }

  return sanitizeHtml(input);
};
```

### 4. Handle Errors Gracefully
```typescript
try {
  const cleanHtml = sanitizeHtml(userInput);
  return cleanHtml;
} catch (error) {
  console.error('Sanitization failed:', error);
  return ''; // Return empty string or default content
}
```

## Security Notes

1. **Always sanitize user input** before storing or displaying
2. **Use strict mode** for sensitive content or when in doubt
3. **Don't rely solely on client-side sanitization** - implement server-side validation too
4. **Test with malicious payloads** to ensure your sanitization is working
5. **Keep DOMPurify updated** to get the latest security fixes

## Testing

Test your sanitization with these sample malicious inputs:

```typescript
const maliciousInputs = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert(1)">',
  '<div style="background: url(javascript:alert(1))">',
  '<a href="javascript:alert(1)">Click me</a>',
  '<iframe src="javascript:alert(1)"></iframe>'
];

maliciousInputs.forEach(input => {
  console.log('Original:', input);
  console.log('Sanitized:', sanitizeHtmlStrict(input));
});
```

All these should be sanitized to safe HTML or removed entirely.