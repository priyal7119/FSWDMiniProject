// Accessibility Utilities
// Provides helper functions for improving accessibility throughout the app

export class AccessibilityUtils {
  // Check if element is keyboard focusable
  static isFocusable(element) {
    const focusableElements = [
      "BUTTON",
      "A",
      "INPUT",
      "TEXTAREA",
      "SELECT",
      "SUMMARY",
      "[tabindex]:not([tabindex='-1'])",
    ];
    return focusableElements.some((selector) => {
      if (selector.includes("[")) {
        return element.matches(selector);
      }
      return element.tagName === selector;
    });
  }

  // Focus management - set focus with visual indication
  static focusElement(element, options = {}) {
    if (element && typeof element.focus === "function") {
      element.focus({ preventScroll: options.preventScroll || false });
      return true;
    }
    return false;
  }

  // Keyboard event handling
  static handleKeyDown = (callback) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback(e);
    }
  };

  // Announce message to screen readers
  static announceToScreenReader(message, priority = "polite") {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 3000);
  }

  // Generate unique IDs for form elements
  static generateId(prefix = "element") {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create accessible button for non-button elements
  static makeKeyboardAccessible(element, callback) {
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback(e);
      }
    });
  }

  // Skip to main content link
  static createSkipLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "sr-only focus:not-sr-only";
    skipLink.textContent = "Skip to main content";
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Check color contrast ratio (WCAG AAA)
  static getColorContrast(foreground, background) {
    const getLuminance = (color) => {
      const rgb = parseInt(color.replace("#", ""), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Validate WCAG color contrast
  static isValidContrast(foreground, background, level = "AA") {
    const contrast = this.getColorContrast(foreground, background);
    return level === "AAA" ? contrast >= 7 : contrast >= 4.5;
  }

  // Make dialogs accessible
  static makeDialogAccessible(dialogElement, triggerElement) {
    const dialogId = this.generateId("dialog");
    dialogElement.setAttribute("id", dialogId);
    dialogElement.setAttribute("role", "dialog");
    triggerElement?.setAttribute("aria-haspopup", "dialog");
    triggerElement?.setAttribute("aria-controls", dialogId);
  }

  // Handle keyboard navigation in lists
  static setupListNavigation(containerElement) {
    const items = containerElement.querySelectorAll("[role='option'], button, a");

    items.forEach((item, index) => {
      item.addEventListener("keydown", (e) => {
        let nextIndex;
        switch (e.key) {
          case "ArrowDown":
            nextIndex = (index + 1) % items.length;
            e.preventDefault();
            this.focusElement(items[nextIndex]);
            break;
          case "ArrowUp":
            nextIndex = (index - 1 + items.length) % items.length;
            e.preventDefault();
            this.focusElement(items[nextIndex]);
            break;
          case "Home":
            e.preventDefault();
            this.focusElement(items[0]);
            break;
          case "End":
            e.preventDefault();
            this.focusElement(items[items.length - 1]);
            break;
        }
      });
    });
  }

  // Format numbers for screen readers
  static formatNumberForSpeech(number) {
    return new Intl.NumberFormat("en-US").format(number);
  }

  // Format dates for accessibility
  static formatDateForAccessibility(date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  }

  // Create accessible table
  static makeTableAccessible(table) {
    // Add table role
    table.setAttribute("role", "table");

    // Add headers scope
    const headers = table.querySelectorAll("th");
    headers.forEach((th) => {
      if (!th.getAttribute("scope")) {
        th.setAttribute("scope", "col");
      }
    });

    // Add row headers
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((tr) => {
      const firstTd = tr.querySelector("td");
      if (firstTd && !firstTd.hasAttribute("scope")) {
        firstTd.setAttribute("scope", "row");
      }
    });
  }

  // Detect reduced motion preference
  static prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Detect dark mode preference
  static prefersDarkMode() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Detect high contrast preference
  static prefersHighContrast() {
    return window.matchMedia("(prefers-contrast: more)").matches;
  }
}

// CSS class for screen reader only content
export const srOnlyStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`;

export default AccessibilityUtils;
