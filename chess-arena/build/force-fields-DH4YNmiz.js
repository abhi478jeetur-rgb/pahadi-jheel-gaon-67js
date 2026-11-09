/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/force-fields.js
var e = Object.freeze([
	"wind",
	"turbulence",
	"vortex",
	"drag",
	"magnet"
]), t = Object.freeze({
	maxFields: 8,
	maxStrength: 1e3,
	maxRange: 1e4
}), n = [
	"type",
	"strength",
	"position",
	"direction",
	"axis",
	"falloff",
	"radius",
	"seed",
	"scale",
	"rate"
], r = 2654435761, i = [
	73856093,
	19349663,
	83492791
];
function a(e, t, n, r) {
	if (typeof e != "number" || !Number.isFinite(e) || e < n || e > r) throw RangeError(`${t} must be a number from ${n} to ${r}.`);
	return e;
}
function o(e, t, n) {
	if (!Array.isArray(e) || e.length !== 3) throw TypeError(`${t} must be [x, y, z].`);
	return e.map((e) => a(e, t, -n, n));
}
function s(e, t) {
	let n = Math.hypot(e[0], e[1], e[2]);
	if (n === 0) throw RangeError(`${t} must not be the zero vector.`);
	return e.map((e) => e / n);
}
function c(r, i = "Force fields") {
	if (!Array.isArray(r) || r.length > t.maxFields) throw RangeError(`${i} must be a list of at most ${t.maxFields} fields.`);
	return r.map((r, c) => {
		let l = `${i} ${c + 1}`;
		if (typeof r != "object" || !r || Array.isArray(r)) throw TypeError(`${l} must be an object.`);
		let u = Object.keys(r).filter((e) => !n.includes(e));
		if (u.length) throw RangeError(`${l} has unknown fields: ${u.join(", ")}. Known: ${n.join(", ")}.`);
		if (!e.includes(r.type)) throw RangeError(`${l} type must be one of ${e.join(", ")}.`);
		let d = r.seed ?? 1;
		if (!Number.isInteger(d) || d < 0 || d > 4294967295) throw RangeError(`${l} seed must be an integer from 0 to 4294967295.`);
		let f = {
			type: r.type,
			strength: a(r.strength ?? 1, `${l} strength`, -t.maxStrength, t.maxStrength),
			position: o(r.position ?? [
				0,
				0,
				0
			], `${l} position`, t.maxRange),
			falloff: a(r.falloff ?? 0, `${l} falloff`, 0, 8),
			radius: a(r.radius ?? 0, `${l} radius`, 0, t.maxRange),
			seed: d
		};
		return r.type === "wind" && (f.direction = s(o(r.direction ?? [
			1,
			0,
			0
		], `${l} direction`, 1e3), `${l} direction`)), r.type === "vortex" && (f.axis = s(o(r.axis ?? [
			0,
			1,
			0
		], `${l} axis`, 1e3), `${l} axis`)), r.type === "turbulence" && (f.scale = a(r.scale ?? 1, `${l} scale`, .001, 1e3), f.rate = a(r.rate ?? .5, `${l} rate`, 0, 100)), Object.freeze(f);
	});
}
function l(e, t, n, a, o) {
	let s = Math.imul(e ^ r, 2246822507) ^ Math.imul(o + 1, 3266489909);
	return s ^= Math.imul(t, i[0]) ^ Math.imul(n, i[1]) ^ Math.imul(a, i[2]), s = Math.imul(s ^ s >>> 16, 2146121005), s = Math.imul(s ^ s >>> 15, 2221713035), ((s ^ s >>> 16) >>> 0) / 4294967296 * 2 - 1;
}
function u(e) {
	return e * e * (3 - 2 * e);
}
function d(e, t, n, r, i) {
	let a = Math.floor(t), o = Math.floor(n), s = Math.floor(r), c = u(t - a), d = u(n - o), f = u(r - s), p = 0;
	for (let t = 0; t < 8; t++) {
		let n = t & 1, r = t >> 1 & 1, u = t >> 2 & 1, m = (n ? c : 1 - c) * (r ? d : 1 - d) * (u ? f : 1 - f);
		p += m * l(e, a + n, o + r, s + u, i);
	}
	return p;
}
function f(e, t, n, r) {
	if (e.falloff === 0 && e.radius === 0) return 1;
	let i = Math.hypot(t, n, r);
	return e.radius > 0 && i > e.radius ? 0 : e.falloff === 0 ? 1 : (1 + i) ** -e.falloff;
}
function p(e, t, n, r, i, a = 0) {
	let o = t[0] - e.position[0], s = t[1] - e.position[1], c = t[2] - e.position[2], l = f(e, o, s, c) * e.strength;
	if (l !== 0) {
		if (e.type === "wind") for (let t = 0; t < 3; t++) i[a + t] += e.direction[t] * l;
		else if (e.type === "drag") for (let e = 0; e < 3; e++) i[a + e] -= n[e] * l;
		else if (e.type === "magnet") {
			let e = Math.hypot(o, s, c);
			if (e < 1e-9) return;
			i[a] -= o / e * l, i[a + 1] -= s / e * l, i[a + 2] -= c / e * l;
		} else if (e.type === "vortex") {
			let [t, n, r] = e.axis, u = n * c - r * s, d = r * o - t * c, f = t * s - n * o, p = Math.hypot(u, d, f);
			if (p < 1e-9) return;
			i[a] += u / p * l, i[a + 1] += d / p * l, i[a + 2] += f / p * l;
		} else {
			let n = e.scale, o = r * e.rate;
			for (let r = 0; r < 3; r++) i[a + r] += l * d(e.seed, t[0] * n + o, t[1] * n + o, t[2] * n + o, r);
		}
	}
}
export { c as n, p as t };
