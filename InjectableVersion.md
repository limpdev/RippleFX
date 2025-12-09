# Just Some JavaScript

> _Injectable version of the extension's ripple logic_

```js
// Universal Canvas Ripple Effect - 120Hz Optimized
(() => {
  'use strict';

  // Prevent multiple initializations
  if (window.canvasRippleInitialized) return;
  window.canvasRippleInitialized = true;

  let canvas,
    ctx,
    ripples = [];

  const MAX_RIPPLES = 32;
  const RIPPLE_DURATION = 375;
  const MAX_RADIUS = 12;
  const TARGET_FPS = 120;
  const FRAME_TIME = 1000 / TARGET_FPS; // ~8.33ms per frame

  let lastFrameTime = 0;
  let animationId = null;
  let ripOpacity = 0.35;

  function createCanvasOverlay() {
    try {
      // Create canvas element
      canvas = document.createElement('canvas');
      canvas.id = 'universal-ripple-canvas';
      canvas.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        opacity: ${ripOpacity} !important;
        visibility: visible !important;
        display: block !important;
        transform: none !important;
      `;

      // Test canvas support
      ctx = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true, // Hint for better performance
      });

      if (!ctx) {
        console.warn('[Ripple] Canvas 2D not supported');
        return false;
      }

      // Insert as first child of body (or documentElement as fallback)
      const targetParent = document.body || document.documentElement;
      if (targetParent.firstChild) {
        targetParent.insertBefore(canvas, targetParent.firstChild);
      } else {
        targetParent.appendChild(canvas);
      }

      return true;
    } catch (error) {
      console.warn('[Ripple] Canvas creation failed:', error);
      return false;
    }
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    try {
      // Get viewport dimensions
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      );
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      );

      // Set canvas size (cap DPR for performance)
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;

      // Scale context for high DPI
      ctx.scale(dpr, dpr);

      // Ensure canvas styling matches viewport
      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';
    } catch (error) {
      console.warn('[Ripple] Canvas resize failed:', error);
    }
  }

  function addRipple(x, y) {
    if (!ctx) return;

    // Remove oldest ripple if at capacity
    if (ripples.length >= MAX_RIPPLES) {
      ripples.shift();
    }

    ripples.push({
      x: x,
      y: y,
      startTime: performance.now(),
      maxRadius: MAX_RADIUS,
    });

    // Start animation loop if not running
    if (animationId === null) {
      lastFrameTime = performance.now();
      animationId = requestAnimationFrame(drawRipples);
    }
  }

  function drawRipples(timestamp) {
    if (!ctx || !canvas) return;

    // Frame rate limiting for 120Hz
    const elapsed = timestamp - lastFrameTime;

    // Skip frame if we're running too fast (allow slight tolerance)
    if (elapsed < FRAME_TIME - 1) {
      animationId = requestAnimationFrame(drawRipples);
      return;
    }

    lastFrameTime = timestamp - (elapsed % FRAME_TIME);
    const now = performance.now();

    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw active ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        const elapsedTime = now - ripple.startTime;
        const progress = Math.min(elapsedTime / RIPPLE_DURATION, 1);

        // Remove completed ripples
        if (progress >= 1) {
          ripples.splice(i, 1);
          continue;
        }

        // Easing: ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentRadius = ripple.maxRadius * eased * 2;
        const opacity = (1 - progress) * 0.4;

        // Draw ripple circle
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 168, 168, ${opacity})`;
        ctx.fill();
      }
    } catch (error) {
      console.warn('[Ripple] Draw error:', error);
    }

    // Continue animation loop if ripples exist, otherwise stop
    if (ripples.length > 0) {
      animationId = requestAnimationFrame(drawRipples);
    } else {
      animationId = null;
      console.log('[Ripple] Animation loop paused (no active ripples)');
    }
  }

  function handleClick(event) {
    if (!event.isTrusted) return; // Ignore programmatic clicks

    // Get click coordinates
    const x = event.clientX;
    const y = event.clientY;

    addRipple(x, y);
  }

  function initialize() {
    // Wait for body to exist
    if (!document.body && document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize, { once: true });
      return;
    }

    // Create canvas overlay
    if (!createCanvasOverlay()) {
      console.warn('[Ripple] Initialization failed');
      return;
    }

    // Set initial size
    resizeCanvas();

    // Set up event listeners
    document.addEventListener('click', handleClick, {
      passive: true,
      capture: true, // Capture phase to catch all clicks
    });

    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Handle viewport changes (mobile orientation, etc.)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resizeCanvas, {
        passive: true,
      });
    }

    console.log('[Ripple] 120Hz canvas ripple effect initialized');
  }

  // Handle different document states
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    // DOM already ready, initialize immediately
    setTimeout(initialize, 0);
  }

  // Cleanup function (optional - for debugging)
  window.cleanupRippleEffect = function () {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    window.canvasRippleInitialized = false;
    ripples.length = 0;
  };
})();

```