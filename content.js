(() => {
  "use strict";

  // State Management
  let canvas,
    ctx,
    ripples = [];
  let animationId = null;
  let lastFrameTime = 0;

  // Default Settings
  let config = {
    enabled: true,
    size: 8, // Max Radius
    duration: 375, // ms
    opacity: 0.25, // Base Opacity
    color: "#a8a8a8", // Hex Color
  };

  // derived color for rgba manipulation
  let rgbColor = { r: 168, g: 168, b: 168 };

  const MAX_RIPPLES = 32;
  const TARGET_FPS = 120;
  const FRAME_TIME = 1000 / TARGET_FPS;

  // --- Helper: Hex to RGB ---
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 168, g: 168, b: 168 };
  }

  // --- Initialization Logic ---
  function init() {
    // Load settings from storage
    chrome.storage.sync.get(config, (items) => {
      updateConfig(items);
      if (config.enabled) {
        setupCanvas();
        addListeners();
      }
    });

    // Listen for changes from the Popup
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "sync") {
        const newSettings = {};
        for (let key in changes) {
          newSettings[key] = changes[key].newValue;
        }
        updateConfig(newSettings);
      }
    });
  }

  function updateConfig(newConfig) {
    // Merge new settings
    config = { ...config, ...newConfig };
    rgbColor = hexToRgb(config.color);

    // Handle Enable/Disable toggle
    if (config.enabled && !canvas) {
      setupCanvas();
      addListeners();
    } else if (!config.enabled && canvas) {
      cleanup();
    }

    // Update opacity live if canvas exists
    if (canvas) {
      canvas.style.opacity = config.opacity;
    }
  }

  // --- Canvas Logic ---
  function setupCanvas() {
    if (canvas) return; // Already exists

    try {
      canvas = document.createElement("canvas");
      canvas.id = "ripple-fx-canvas";
      canvas.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          pointer-events: none !important;
          z-index: 2147483647 !important;
          opacity: ${config.opacity} !important;
          visibility: visible !important;
          display: block !important;
          transform: none !important;
        `;

      ctx = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

      if (!ctx) return;

      const targetParent = document.body || document.documentElement;
      if (targetParent.firstChild) {
        targetParent.insertBefore(canvas, targetParent.firstChild);
      } else {
        targetParent.appendChild(canvas);
      }

      resizeCanvas();
    } catch (e) {
      console.warn("RippleFX: Init failed", e);
    }
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
  }

  // --- Animation Loop ---
  function addRipple(x, y) {
    if (!config.enabled || !ctx) return;

    if (ripples.length >= MAX_RIPPLES) ripples.shift();

    ripples.push({
      x: x,
      y: y,
      startTime: performance.now(),
      maxRadius: Number(config.size), // Ensure it's a number
    });

    if (animationId === null) {
      lastFrameTime = performance.now();
      animationId = requestAnimationFrame(drawRipples);
    }
  }

  function drawRipples(timestamp) {
    if (!ctx || !canvas) return;

    const elapsed = timestamp - lastFrameTime;
    if (elapsed < FRAME_TIME - 1) {
      animationId = requestAnimationFrame(drawRipples);
      return;
    }

    lastFrameTime = timestamp - (elapsed % FRAME_TIME);
    const now = performance.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      const elapsedTime = now - ripple.startTime;
      const progress = Math.min(elapsedTime / Number(config.duration), 1);

      if (progress >= 1) {
        ripples.splice(i, 1);
        continue;
      }

      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRadius = ripple.maxRadius * eased * 2;
      const currentOpacity = 1 - progress;

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, currentRadius, 0, Math.PI * 2);
      // Use dynamic color settings
      ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${currentOpacity})`;
      ctx.fill();
    }

    if (ripples.length > 0) {
      animationId = requestAnimationFrame(drawRipples);
    } else {
      animationId = null;
    }
  }

  // --- Event Handling ---
  function handleClick(event) {
    if (!event.isTrusted) return;
    addRipple(event.clientX, event.clientY);
  }

  function addListeners() {
    document.addEventListener("click", handleClick, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", resizeCanvas, { passive: true });
  }

  function cleanup() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (canvas) {
      canvas.remove();
      canvas = null;
      ctx = null;
    }
    ripples = [];
    document.removeEventListener("click", handleClick, { capture: true });
    window.removeEventListener("resize", resizeCanvas);
  }

  // --- Bootstrap ---
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
