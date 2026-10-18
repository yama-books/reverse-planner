import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {BRAND_ASSETS, mountApprovedBrand} from "../assets/brand/brand.mjs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../assets/app.css", import.meta.url), "utf8");

test("missing approved image never triggers a load or a DOM change", async () => {
  assert.equal(BRAND_ASSETS.approved, false,
    "Only switch to true after approved source, derivative files and visual QA exist");
  assert.equal(await mountApprovedBrand(), undefined);
});

test("brand slots are unique across header, four screens and completion", () => {
  for (const name of ["header", "home", "setup", "plan", "run", "done"]) {
    const id = 'id="brand-' + name + '-slot"';
    assert.equal(html.split(id).length - 1, 1, "expected exactly one " + id);
  }
});

test("old home link branding remains as a readable fallback", () => {
  assert.ok(html.includes('id="brand-header-fallback"'));
  assert.ok(html.includes('aria-label="Reverse Planner ホームへ"'));
  assert.ok(html.includes('REVERSE<span>★</span>PLANNER'));
  assert.ok(html.includes('assets/brand/brand.mjs'));
  assert.ok(css.includes('.brand-slot-header'));
});

test("logo, cat and responsive motion cannot modify storage or planning code", () => {
  const source = readFileSync(new URL("../assets/brand/brand.mjs", import.meta.url), "utf8");
  for (const banned of ["localStorage", "sessionStorage", "STORE_KEY", "persist("]) {
    assert.ok(!source.includes(banned), "unexpected state mutation reference: " + banned);
  }
  assert.ok(css.includes(".brand-slot-home"));
  assert.ok(css.includes("@media(max-width:350px)"));
  assert.ok(css.includes("prefers-reduced-motion:reduce"));
});
