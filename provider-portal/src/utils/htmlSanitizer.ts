import DOMPurify from 'dompurify';

/**
 * HTML Sanitizer Configuration
 * Removes all CSS, JavaScript, and potentially dangerous HTML elements/attributes
 */

// Configuration for strict sanitization (removes CSS and JS)
const STRICT_CONFIG = {
  // Allow only basic HTML tags
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'
  ],

  // Allow only safe attributes
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'target', 'rel', 'width', 'height'
  ],

  // Remove all CSS
  FORBID_ATTR: [
    'style', 'class', 'id', 'onclick', 'onload', 'onerror', 'onmouseover',
    'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
    'onselect', 'onkeydown', 'onkeypress', 'onkeyup'
  ],

  // Remove script tags and their content
  FORBID_TAGS: [
    'script', 'object', 'embed', 'form', 'input', 'button', 'textarea',
    'select', 'option', 'iframe', 'frame', 'frameset', 'noframes',
    'applet', 'meta', 'link', 'base', 'style', 'noscript'
  ],


  // Remove data attributes
  ALLOW_DATA_ATTR: false,

  // Remove unknown protocols
  ALLOW_UNKNOWN_PROTOCOLS: false,

  // Keep content of forbidden tags (remove tag but keep text content)
  KEEP_CONTENT: true,

  // Return a document fragment instead of string for better performance
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM: false
};

// Configuration for basic sanitization (allows some CSS classes but no inline styles or JS)
const BASIC_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'small', 'sub', 'sup'
  ],

  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'target', 'rel', 'width', 'height', 'class'
  ],

  FORBID_ATTR: [
    'style', 'id', 'onclick', 'onload', 'onerror', 'onmouseover',
    'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
    'onselect', 'onkeydown', 'onkeypress', 'onkeyup'
  ],

  FORBID_TAGS: [
    'script', 'object', 'embed', 'form', 'input', 'button', 'textarea',
    'select', 'option', 'iframe', 'frame', 'frameset', 'noframes',
    'applet', 'meta', 'link', 'base', 'style', 'noscript'
  ],

  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  KEEP_CONTENT: true
};

/**
 * Sanitizes HTML content by removing all CSS, JavaScript, and potentially dangerous elements
 * @param html - The HTML string to sanitize
 * @param strict - Whether to use strict mode (removes all CSS classes) or basic mode (allows CSS classes)
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string, strict: boolean = true): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const config = strict ? STRICT_CONFIG : BASIC_CONFIG;

  // Additional preprocessing to remove CSS and JavaScript
  let cleanHtml = html
    // Remove CSS style blocks
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove JavaScript script blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove inline CSS styles
    .replace(/\sstyle\s*=\s*["'][^"']*["']/gi, '')
    // Remove JavaScript event handlers
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove JavaScript protocol links
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    // Remove data URLs that could contain JavaScript
    .replace(/src\s*=\s*["']data:(?!image\/)[^"']*["']/gi, '')
    // Remove CSS imports and expressions
    .replace(/@import[^;]+;/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '');

  // Use DOMPurify to sanitize the preprocessed HTML
  const sanitized = DOMPurify.sanitize(cleanHtml, config);

  return sanitized;
}

/**
 * Sanitizes HTML content strictly (removes all CSS and JavaScript)
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string with no CSS or JavaScript
 */
export function sanitizeHtmlStrict(html: string): string {
  return sanitizeHtml(html, true);
}

/**
 * Sanitizes HTML content with basic protection (allows CSS classes but removes inline styles and JavaScript)
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string with basic protection
 */
export function sanitizeHtmlBasic(html: string): string {
  return sanitizeHtml(html, false);
}

/**
 * Sanitizes text content by stripping all HTML tags
 * @param text - The text that may contain HTML
 * @returns Plain text with all HTML removed
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Use DOMPurify to strip all HTML tags
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  return sanitized.trim();
}

/**
 * Validates if HTML content is safe (contains no JavaScript or dangerous elements)
 * @param html - The HTML string to validate
 * @returns True if the HTML is safe, false otherwise
 */
export function isHtmlSafe(html: string): boolean {
  if (!html || typeof html !== 'string') {
    return true;
  }

  // Check for obvious dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /expression\s*\(/i,
    /@import/i,
    /data:\s*(?!image\/)/i
  ];

  return !dangerousPatterns.some(pattern => pattern.test(html));
}

/**
 * Configuration object for customizing sanitization
 */
export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  allowCssClasses?: boolean;
  allowImages?: boolean;
  allowLinks?: boolean;
  maxLength?: number;
}

/**
 * Advanced sanitization with custom options
 * @param html - The HTML string to sanitize
 * @param options - Custom sanitization options
 * @returns Sanitized HTML string
 */
export function sanitizeHtmlAdvanced(html: string, options: SanitizeOptions = {}): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Apply length limit if specified
  if (options.maxLength && html.length > options.maxLength) {
    html = html.substring(0, options.maxLength);
  }

  const config = {
    ALLOWED_TAGS: options.allowedTags || [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'div', 'span', 'pre', 'code', 'hr'
    ],

    ALLOWED_ATTR: options.allowedAttributes || ['title'],

    FORBID_ATTR: [
      'style', 'id', 'onclick', 'onload', 'onerror', 'onmouseover',
      'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
      'onselect', 'onkeydown', 'onkeypress', 'onkeyup'
    ],

    FORBID_TAGS: [
      'script', 'object', 'embed', 'form', 'input', 'button', 'textarea',
      'select', 'option', 'iframe', 'frame', 'frameset', 'noframes',
      'applet', 'meta', 'link', 'base', 'style', 'noscript'
    ],

    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    KEEP_CONTENT: true
  };

  // Add CSS class support if requested
  if (options.allowCssClasses) {
    config.ALLOWED_ATTR = [...(config.ALLOWED_ATTR || []), 'class'];
  }

  // Add image support if requested
  if (options.allowImages) {
    config.ALLOWED_TAGS = [...(config.ALLOWED_TAGS || []), 'img'];
    config.ALLOWED_ATTR = [...(config.ALLOWED_ATTR || []), 'src', 'alt', 'width', 'height'];
  }

  // Add link support if requested
  if (options.allowLinks) {
    config.ALLOWED_TAGS = [...(config.ALLOWED_TAGS || []), 'a'];
    config.ALLOWED_ATTR = [...(config.ALLOWED_ATTR || []), 'href', 'target', 'rel'];
  }

  return DOMPurify.sanitize(html, config);
}

// Export DOMPurify instance for advanced use cases
export { DOMPurify };