/**
 * APP-004 M1. Presentation-only loader for selected HQ-v5 cats.
 * Missing images leave existing headings, actions and storage untouched.
 * DONE is controlled by the app's explicit render state, not text matching.
 */
function mountDecorativeCats() {
  const run = document.getElementById("screen-run");
  const slots = [...document.querySelectorAll("[data-cat-slot]")];
  const sync = slot => {
    const img = slot.querySelector("img");
    const loaded = Boolean(img && img.complete && img.naturalWidth > 0);
    const doneOnly = slot.dataset.catSlot === "done";
    slot.hidden = !loaded || (doneOnly && run?.dataset.catComplete !== "true");
    slot.dataset.catLoaded = String(loaded);
  };
  for (const slot of slots) {
    const img = slot.querySelector("img");
    if (!img) continue;
    img.addEventListener("load", () => sync(slot));
    img.addEventListener("error", () => sync(slot));
    sync(slot);
  }
  if (run) {
    const completedSlot = slots.find(slot => slot.dataset.catSlot === "done");
    if (completedSlot) {
      new MutationObserver(() => sync(completedSlot))
        .observe(run, {attributes: true, attributeFilter: ["data-cat-complete"]});
    }
  }
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mountDecorativeCats, {once: true});
  else mountDecorativeCats();
}
