/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/volumetric.js
var e = Object.freeze([
	-100,
	0,
	-100
]), t = Object.freeze([
	100,
	20,
	100
]), n = Object.freeze([
	.8,
	.85,
	.9
]), r = Object.freeze([
	.03,
	.035,
	.04
]), i = Object.freeze([
	.03,
	0,
	0
]);
function a(e, t, n, r) {
	if (typeof e != "number" || !Number.isFinite(e) || e < t || e > n) throw RangeError(`${r} must be between ${t} and ${n}`);
	return e;
}
function o(e, t, n, r) {
	if (e?.length !== 3) throw TypeError(`${r} requires three components`);
	for (let i = 0; i < 3; i++) a(e[i], t, n, r);
	return e;
}
var s = 2048, c = Object.freeze(["exponential", "smoothstep"]);
function l(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError("Fog field must be an object with width, height and data");
	for (let t of ["width", "height"]) {
		let n = e[t];
		if (!Number.isInteger(n) || n < 1 || n > 2048) throw RangeError(`Fog field ${t} must be an integer between 1 and ${s}`);
	}
	if (!(e.data instanceof Float32Array)) throw TypeError("Fog field data must be a Float32Array of RGBA values");
	if (e.data.length !== e.width * e.height * 4) throw RangeError(`Fog field data must hold width * height * 4 = ${e.width * e.height * 4} values, got ${e.data.length}`);
	for (let t = 0; t < e.data.length; t++) if (!Number.isFinite(e.data[t])) throw RangeError(`Fog field data must be finite; index ${t} is not`);
	return e;
}
function u(s = {}) {
	if (!s || typeof s != "object" || Array.isArray(s)) throw TypeError("volumeFog must be an object");
	let u = a(s.density ?? 0, 0, 10, "Volume density"), d = o(s.minimum ?? e, -1e5, 1e5, "Volume minimum"), f = o(s.maximum ?? t, -1e5, 1e5, "Volume maximum");
	for (let e = 0; e < 3; e++) if (Math.fround(f[e]) <= Math.fround(d[e])) throw RangeError("Volume bounds must remain ordered after Float32 rounding");
	let p = o(s.color ?? n, 0, 1, "Volume color"), m = o(s.ambient ?? r, 0, 10, "Volume ambient"), h = o(s.drift ?? i, -100, 100, "Volume drift"), g = a(s.steps ?? 16, 8, 48, "Volume steps");
	if (!Number.isInteger(g)) throw RangeError("Volume steps must be an integer");
	let _ = a(s.anisotropy ?? .3, -.9, .9, "Volume anisotropy"), v = a(s.noiseAmount ?? .5, 0, 1, "Volume noise amount"), y = a(s.noiseScale ?? .3, .001, 100, "Volume noise scale"), b = a(s.maxDistance ?? 100, .01, 1e4, "Volume maximum distance"), x = a(s.heightFalloff ?? 0, 0, 1e5, "Volume height falloff"), S = {
		...s,
		density: u,
		minimum: d,
		maximum: f,
		color: p,
		ambient: m,
		drift: h,
		steps: g,
		anisotropy: _,
		noiseAmount: v,
		noiseScale: y,
		maxDistance: b,
		heightFalloff: x
	};
	if (s.shadowAmbient !== void 0 && (S.shadowAmbient = a(s.shadowAmbient, 0, 1, "Volume shadow ambient")), s.field !== void 0 && (S.field = l(s.field)), s.flowStrength !== void 0 && (S.flowStrength = a(s.flowStrength, 0, 100, "Volume flow strength")), s.flowPeriod !== void 0 && (S.flowPeriod = a(s.flowPeriod, .01, 1e3, "Volume flow period")), s.profile !== void 0) {
		if (!c.includes(s.profile)) throw RangeError(`Volume profile must be one of ${c.join(", ")}`);
		S.profile = s.profile;
	}
	return S;
}
export { u as n, l as r, a as t };
