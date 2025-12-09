document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const els = {
    enabled: document.getElementById("enabled"),
    size: document.getElementById("size"),
    duration: document.getElementById("duration"),
    opacity: document.getElementById("opacity"),
    color: document.getElementById("color"),
    // Value labels
    sizeVal: document.getElementById("sizeVal"),
    durVal: document.getElementById("durVal"),
    opVal: document.getElementById("opVal"),
  };

  // Defaults (must match content.js)
  const defaults = {
    enabled: true,
    size: 8,
    duration: 375,
    opacity: 0.25,
    color: "#a8a8a8",
  };

  // Load saved settings
  chrome.storage.sync.get(defaults, (items) => {
    els.enabled.checked = items.enabled;
    els.size.value = items.size;
    els.duration.value = items.duration;
    els.opacity.value = items.opacity;
    els.color.value = items.color;

    updateLabels();
  });

  // Event Listeners for all inputs
  Object.keys(els).forEach((key) => {
    if (key.includes("Val")) return; // skip labels

    els[key].addEventListener("input", () => {
      updateLabels();
      saveSettings();
    });
  });

  function updateLabels() {
    els.sizeVal.textContent = els.size.value;
    els.durVal.textContent = els.duration.value;
    els.opVal.textContent = els.opacity.value;
  }

  function saveSettings() {
    const settings = {
      enabled: els.enabled.checked,
      size: parseInt(els.size.value),
      duration: parseInt(els.duration.value),
      opacity: parseFloat(els.opacity.value),
      color: els.color.value,
    };

    chrome.storage.sync.set(settings);
  }
});
