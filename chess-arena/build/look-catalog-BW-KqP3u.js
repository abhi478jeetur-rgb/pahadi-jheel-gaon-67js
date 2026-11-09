/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/look-catalog.js
var e = Object.freeze(["sky-clouds", "studio-softbox"]), t = Object.freeze(["teal-orange", "noir"]), n = /^[a-f0-9]{64}$/, r = /* @__PURE__ */ new Map(), i = 0, a = /* @__PURE__ */ new Map();
function o(t) {
	return e.includes(t) || n.test(t);
}
function s(e) {
	return t.includes(e) || n.test(e);
}
function c(t, n) {
	if (!o(t)) throw RangeError(`environment.hdri must be one of ${e.join(", ")} or the 64-character ID of a .hdr file in the asset catalog.`);
	r.set(t, n), i++;
}
function l(e, n) {
	if (!s(e)) throw RangeError(`A .cube look must be one of ${t.join(", ")} or the 64-character ID of a .cube file in the asset catalog.`);
	a.set(e, n);
}
function u(e) {
	let t = a.get(e);
	if (!t) throw Error(`The .cube look ${e.slice(0, 16)} is not loaded: the host registers it with registerCatalogLook (the MCP runtime does this from the asset catalog).`);
	return t;
}
function d() {
	return i;
}
function f(e) {
	let t = r.get(e);
	if (!t) throw Error(`The HDRI ${e.slice(0, 16)} is not loaded: the host registers it with registerCatalogEnvironment (the MCP runtime does this from assets/looks or the asset catalog).`);
	return t;
}
export { d as a, c, u as i, l, e as n, s as o, f as r, o as s, t };
