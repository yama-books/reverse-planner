/** APP-004 M2 draft-only icon candidates, isolated from planning and storage. */
export function mountOptionalActionIcons(root=document) {
  for (const image of root.querySelectorAll("img[data-m2-icon]")) {
    const fallback=image.parentElement.querySelector("[data-m2-fallback]");
    const sync=()=>{
      const ok=image.complete && image.naturalWidth>0;
      image.hidden=!ok;
      if(fallback)fallback.hidden=ok;
      image.dataset.m2Ready=String(ok);
    };
    image.addEventListener("load",sync);
    image.addEventListener("error",sync);
    sync();
  }
}
if (typeof document!=="undefined") {
  if(document.readyState==="loading")
    document.addEventListener("DOMContentLoaded",()=>mountOptionalActionIcons(),{once:true});
  else mountOptionalActionIcons();
}
