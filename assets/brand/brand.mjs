/**
 * Approved-brand mounting layer for SOFT PIXEL v0.2.
 *
 * SAFETY GATE: approved remains false until the exact user-approved image
 * has been supplied, checked, and committed in the locations below.
 * Without approval this module makes no DOM changes and loads no images.
 * The existing wordmark, planning logic and storage remain untouched.
 */
export const BRAND_ASSETS = Object.freeze({
  approved: false,
  header: "./assets/brand/logo-compact.svg",
  home: "./assets/brand/logo-horizontal.svg",
  section: "./assets/brand/logo-compact.svg",
  complete: "./assets/brand/cat-done.png"
});

function loadDecorativeImage(src, alt) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.className = "approved-brand-image";
    img.alt = alt;
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Brand asset unavailable: " + src));
    img.src = src;
  });
}

async function mountImage(slotId, src, alt = "") {
  const slot = document.getElementById(slotId);
  if (!slot) return false;
  try {
    const img = await loadDecorativeImage(src, alt);
    slot.replaceChildren(img);
    slot.hidden = false;
    return true;
  } catch (error) {
    // A missing optional asset must never hide the existing branding or
    // interrupt task creation, planning, timers, or browser-stored plans.
    console.warn(error.message);
    return false;
  }
}

export async function mountApprovedBrand() {
  if (!BRAND_ASSETS.approved || typeof document === "undefined") return;
  const headerOk = await mountImage("brand-header-slot", BRAND_ASSETS.header, "");
  if (headerOk) {
    const existing = document.getElementById("brand-header-fallback");
    if (existing) existing.hidden = true;
  }
  await Promise.all([
    mountImage("brand-home-slot", BRAND_ASSETS.home, "Reverse Planner、ギャクサンプランナー"),
    mountImage("brand-setup-slot", BRAND_ASSETS.section),
    mountImage("brand-plan-slot", BRAND_ASSETS.section),
    mountImage("brand-run-slot", BRAND_ASSETS.section)
  ]);
  const doneOk = await mountImage("brand-done-slot", BRAND_ASSETS.complete);
  if (doneOk) {
    const doneSlot = document.getElementById("brand-done-slot");
    const focusTitle = document.getElementById("focus-task");
    if (!doneSlot || !focusTitle) return;
    const updateDone = () => {
      const finished = focusTitle.textContent.trim().startsWith("全部できた！");
      doneSlot.hidden = !finished;
      doneSlot.classList.toggle("brand-celebrate", finished);
    };
    new MutationObserver(updateDone).observe(focusTitle, {childList: true, characterData: true, subtree: true});
    updateDone();
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountApprovedBrand, {once: true});
  } else {
    mountApprovedBrand();
  }
}
