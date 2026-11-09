/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/depth-layer.js
var e = /* @__PURE__ */ new WeakMap();
function t(t) {
	for (let [n, r] of t) e.set(n, r);
}
function n(t) {
	return t.depthLayer ?? (t.decal ? 1 : e.get(t) ?? 0);
}
export { t as n, n as t };
