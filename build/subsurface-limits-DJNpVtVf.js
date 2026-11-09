/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/subsurface-limits.js
var e = Object.freeze([0, 1]), t = Object.freeze({
	weight: 0,
	radius: Object.freeze([
		1,
		.2,
		.1
	]),
	scale: .05
}), n = Object.freeze({
	weight: e,
	radius: Object.freeze([0, 100]),
	scale: Object.freeze([0, 10]),
	color: e
});
function r([e, t]) {
	return `between ${e} and ${t}`;
}
function i(e, t) {
	let [i, a] = n[e];
	if (!(Array.isArray(t) && t.length === 3 && t.every((e) => typeof e == "number" && Number.isFinite(e) && e >= i && e <= a))) throw RangeError(`subsurface.${e} must be three numbers ${r(n[e])}. Pass [red, green, blue].`);
}
function a(e, t = "surface") {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError("subsurface must be an object: { weight, radius, scale, color }.");
	for (let t of Object.keys(e)) if (!(t in n)) throw RangeError(`Unknown subsurface field ${t}. Use weight, radius, scale or color.`);
	for (let t of ["weight", "scale"]) {
		let i = e[t];
		if (i !== void 0 && (typeof i != "number" || !Number.isFinite(i) || i < n[t][0] || i > n[t][1])) throw RangeError(`subsurface.${t} must be ${r(n[t])}, got ${i}.`);
	}
	if (e.radius !== void 0 && i("radius", e.radius), e.color !== void 0 && i("color", e.color), (e.weight ?? 0) > 0 && t !== "surface" && t !== "gltf") throw RangeError(`subsurface needs a standard PBR material tag, got ${t}. Use the surface tag.`);
}
function o(e) {
	let { weight: n = t.weight, radius: r = t.radius, scale: i = t.scale, color: a = [
		-1,
		-1,
		-1
	] } = e;
	return [
		n,
		...r.map((e) => e * i),
		...a
	];
}
export { a as n, o as t };
