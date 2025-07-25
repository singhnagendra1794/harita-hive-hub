import DOMPurify from 'dompurify';

// Security-focused HTML sanitization utility
export class HTMLSanitizer {
  private static instance: HTMLSanitizer;
  private purify: typeof DOMPurify;

  private constructor() {
    this.purify = DOMPurify;
    this.configurePurify();
  }

  public static getInstance(): HTMLSanitizer {
    if (!HTMLSanitizer.instance) {
      HTMLSanitizer.instance = new HTMLSanitizer();
    }
    return HTMLSanitizer.instance;
  }

  private configurePurify() {
    // Configure DOMPurify with strict security settings
    this.purify.addHook('beforeSanitizeElements', (node) => {
      // Remove any script tags completely
      if ((node as Element).tagName === 'SCRIPT') {
        (node as Element).remove();
      }
    });

    this.purify.addHook('beforeSanitizeAttributes', (node) => {
      // Remove any event handlers
      const element = node as Element;
      if (element.hasAttributes && element.hasAttributes()) {
        const attrs = Array.from(element.attributes);
        attrs.forEach(attr => {
          if (attr.name.startsWith('on')) {
            element.removeAttribute(attr.name);
          }
        });
      }
    });
  }

  /**
   * Sanitize HTML content for newsletter previews
   * Allows basic formatting tags but removes all scripts and event handlers
   */
  public sanitizeNewsletterHTML(html: string): string {
    return this.purify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'span', 'br',
        'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'td', 'th',
        'style'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'style',
        'width', 'height', 'target', 'rel'
      ],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      KEEP_CONTENT: true
    });
  }

  /**
   * Sanitize markdown-rendered HTML content
   * More restrictive for user-generated content
   */
  public sanitizeMarkdownHTML(html: string): string {
    return this.purify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'span', 'br',
        'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'code', 'pre'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'style'],
      FORBID_ATTR: ['style'],
      KEEP_CONTENT: true
    });
  }

  /**
   * Sanitize chart/analytics CSS
   * Only allow safe CSS properties
   */
  public sanitizeCSS(css: string): string {
    // Remove any potentially dangerous CSS
    return css
      .replace(/javascript:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/@import/gi, '')
      .replace(/url\s*\(/gi, '');
  }

  /**
   * Validate and sanitize user input
   */
  public sanitizeUserInput(input: string): string {
    return this.purify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }
}

// Export singleton instance
export const htmlSanitizer = HTMLSanitizer.getInstance();