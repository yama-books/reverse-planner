/**
 * APP-004 M1. Display-only HQ-v5 cat loader.
 * A broken/unavailable image leaves the existing UI intact.
 * Each screen state shows at most one cat; readiness is based on explicit
 * render-state attributes, never headline text.
 */
function mountDecorativeCats() {
  const run = document.getElementById("screen-run");
  const plan = document.getElementById("screen-plan");
  const slots = [...document.querySelectorAll("[data-cat-slot]")];
  const sync = slot => {
    const img = slot.querySelector("img");
    const loaded = Boolean(img?.complete && img.naturalWidth > 0);
    const which = slot.dataset.catSlot;
    const eligible = which === "done" ? run?.dataset.catComplete === "true" :
      which === "run" ? run?.dataset.catComplete !== "true" :
      which === "plan" ? plan?.dataset.catPlanReady === "true" : true;
    slot.hidden = !loaded || !eligible;
    slot.dataset.catLoaded = String(loaded);
  };
  for (const slot of slots) {
    const img = slot.querySelector("img");
    if (!img) continue;
    img.addEventListener("load", () => sync(slot));
    img.addEventListener("error", () => sync(slot));
    sync(slot);
  }
  const resyncRun = () => slots.filter(slot => ["run", "done"].includes(slot.dataset.catSlot)).forEach(sync);
  const resyncPlan = () => slots.filter(slot => slot.dataset.catSlot === "plan").forEach(sync);
  if (run) new MutationObserver(resyncRun)
    .observe(run, {attributes: true, attributeFilter: ["data-cat-complete"]});
  if (plan) new MutationObserver(resyncPlan)
    .observe(plan, {attributes: true, attributeFilter: ["data-cat-plan-ready"]});
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mountDecorativeCats, {once: true});
  else mountDecorativeCats();
}
