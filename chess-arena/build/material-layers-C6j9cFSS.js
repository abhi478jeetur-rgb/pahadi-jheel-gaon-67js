/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/material-layers.js
var e = Object.freeze([0, 1]), t = Object.freeze({
	clearcoat: 0,
	clearcoatRoughness: 0,
	transmission: 0,
	thickness: 0,
	ior: 1.5,
	attenuationColor: Object.freeze([
		1,
		1,
		1
	]),
	attenuationDistance: Infinity,
	sheenColor: Object.freeze([
		0,
		0,
		0
	]),
	sheenRoughness: 0,
	specular: 1,
	specularColor: Object.freeze([
		1,
		1,
		1
	]),
	anisotropy: 0,
	anisotropyRotation: 0,
	iridescence: 0,
	iridescenceIor: 1.3,
	iridescenceThickness: 400,
	toon: 0
}), n = Object.freeze(Object.keys(t)), r = Object.freeze({
	clearcoat: e,
	clearcoatRoughness: e,
	transmission: e,
	thickness: Object.freeze([0, 1e3]),
	ior: Object.freeze([1, 2.5]),
	sheenRoughness: e,
	specular: Object.freeze([0, 4]),
	anisotropy: e,
	anisotropyRotation: Object.freeze([-2 * Math.PI, 2 * Math.PI]),
	iridescence: e,
	iridescenceIor: Object.freeze([1, 3]),
	iridescenceThickness: Object.freeze([0, 1200]),
	toon: Object.freeze([0, 8])
}), i = Object.freeze({
	attenuationColor: e,
	sheenColor: e,
	specularColor: Object.freeze([0, 4])
});
function a([e, t]) {
	return `between ${e} and ${t}`;
}
function o(e, t) {
	let [n, i] = r[e];
	if (typeof t != "number" || !Number.isFinite(t) || t < n || t > i) throw RangeError(`${e} must be ${a(r[e])}, got ${t}. Use a number inside that range.`);
}
function s(e, t) {
	let [n, r] = i[e];
	if (!(Array.isArray(t) && t.length === 3 && t.every((e) => typeof e == "number" && Number.isFinite(e) && e >= n && e <= r))) throw RangeError(`${e} must be three linear RGB numbers ${a(i[e])}. Pass [red, green, blue].`);
}
function c(e) {
	if (!(typeof e == "number" && e > 0 && Number.isFinite(e))) throw RangeError(`attenuationDistance must be a finite number above 0 (metres), got ${e}. Leave it out for no absorption.`);
}
function l(e) {
	for (let t of Object.keys(r)) e[t] !== void 0 && o(t, e[t]);
	for (let t of Object.keys(i)) e[t] !== void 0 && s(t, e[t]);
	if (e.attenuationDistance !== void 0 && e.attenuationDistance !== Infinity && c(e.attenuationDistance), e.transmission > 0 && e.tag !== void 0 && e.tag !== "surface" && e.tag !== "gltf" && e.tag !== "liquid") throw RangeError(`transmission needs a standard PBR material tag, got ${e.tag}. Use the surface tag.`);
}
function u(e, n) {
	return e[n] ?? t[n];
}
function d(e) {
	let t = u(e, "ior"), n = ((t - 1) / (t + 1)) ** 2, r = u(e, "specular");
	return u(e, "specularColor").map((e) => Math.min(n * e, 1) * r);
}
function f(e) {
	return l(e), [
		...d(e),
		u(e, "clearcoat"),
		u(e, "clearcoatRoughness"),
		...u(e, "sheenColor"),
		u(e, "sheenRoughness"),
		u(e, "transmission"),
		u(e, "ior"),
		u(e, "thickness"),
		u(e, "attenuationDistance"),
		...u(e, "attenuationColor"),
		u(e, "anisotropy"),
		u(e, "anisotropyRotation"),
		u(e, "iridescence"),
		u(e, "iridescenceIor"),
		u(e, "iridescenceThickness"),
		e.lightMask ?? -1,
		u(e, "toon"),
		e.subsurface ? JSON.stringify(e.subsurface) : ""
	];
}
export { f as a, r as i, t as n, u as o, n as r, l as s, i as t };
