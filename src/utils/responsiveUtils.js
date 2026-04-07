// Responsive Design Utilities
// Provides utilities for mobile optimization and responsive behavior

export class ResponsiveUtils {
  // Breakpoints (matching Tailwind CSS)
  static BREAKPOINTS = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  };

  // Check if viewport matches breakpoint
  static isBreakpoint(breakpoint) {
    const width = window.innerWidth;
    const nextBreakpoint = Object.keys(this.BREAKPOINTS)
      .filter((k) => this.BREAKPOINTS[k] > this.BREAKPOINTS[breakpoint])
      .sort((a, b) => this.BREAKPOINTS[a] - this.BREAKPOINTS[b])[0];

    const minWidth = this.BREAKPOINTS[breakpoint];
    const maxWidth = nextBreakpoint ? this.BREAKPOINTS[nextBreakpoint] - 1 : Infinity;

    return width >= minWidth && width <= maxWidth;
  }

  // Check if viewport is mobile
  static isMobile() {
    return window.innerWidth < this.BREAKPOINTS.md;
  }

  // Check if viewport is tablet
  static isTablet() {
    return (
      window.innerWidth >= this.BREAKPOINTS.md &&
      window.innerWidth < this.BREAKPOINTS.lg
    );
  }

  // Check if viewport is desktop
  static isDesktop() {
    return window.innerWidth >= this.BREAKPOINTS.lg;
  }

  // Get current viewport size
  static getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  // Check if touch device
  static isTouchDevice() {
    return (
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      window.ontouchstart !== undefined
    );
  }

  // Handle viewport orientation
  static getOrientation() {
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }

  // Throttle resize events
  static onWindowResize(callback, delay = 250) {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };

    window.addEventListener("resize", handleResize);

    // Return cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }

  // Disable body scroll (useful for modals)
  static disableBodyScroll() {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${this.getScrollbarWidth()}px`;
  }

  // Enable body scroll
  static enableBodyScroll() {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  // Get scrollbar width
  static getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  // Detect if device supports pointer events
  static supportsPointerEvents() {
    return window.PointerEvent && typeof window.PointerEvent !== "undefined";
  }

  // Safe area insets for notched devices
  static getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue("--safe-area-inset-top") || "0",
      right: style.getPropertyValue("--safe-area-inset-right") || "0",
      bottom: style.getPropertyValue("--safe-area-inset-bottom") || "0",
      left: style.getPropertyValue("--safe-area-inset-left") || "0",
    };
  }

  // Check for sticky positioning support
  static supportsStickyPositioning() {
    const element = document.createElement("div");
    element.style.position = "sticky";
    return element.style.position === "sticky";
  }

  // Check for grid support
  static supportsGrid() {
    const element = document.createElement("div");
    element.style.display = "grid";
    return element.style.display === "grid";
  }

  // Check for flexbox support
  static supportsFlexbox() {
    const element = document.createElement("div");
    element.style.display = "flex";
    return element.style.display === "flex";
  }

  // Responsive image loading
  static getNativeLazyLoadingSupport() {
    return "loading" in HTMLImageElement.prototype;
  }

  // Request idle callback with fallback
  static scheduleIdleTask(callback, options = {}) {
    if ("requestIdleCallback" in window) {
      return window.requestIdleCallback(callback, options);
    } else {
      return setTimeout(callback, 1);
    }
  }

  // Cancel idle callback
  static cancelIdleTask(id) {
    if ("cancelIdleCallback" in window) {
      window.cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  }

  // Intersection Observer for lazy loading
  static observeElement(element, callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
      ...options,
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry);
          }
        });
      }, defaultOptions);

      observer.observe(element);
      return observer;
    }
    return null;
  }

  // Responsive font size calculation
  static calculateResponsiveFontSize(minSize, maxSize, minWidth = 320, maxWidth = 1920) {
    const minVW = (minSize / minWidth) * 100;
    const maxVW = (maxSize / maxWidth) * 100;
    return `clamp(${minSize}px, ${minVW}vw, ${maxSize}px)`;
  }

  // Check if user prefers reduced motion
  static prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Get device pixel ratio
  static getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
  }

  // Check for high DPI screens
  static isHighDPI() {
    return this.getDevicePixelRatio() > 1;
  }

  // Orientation lock (for mobile)
  static lockOrientation(orientation = "portrait") {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock(orientation).catch((error) => {
        console.error("Failed to lock orientation:", error);
      });
    }
  }
}

export default ResponsiveUtils;
