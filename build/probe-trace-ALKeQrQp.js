/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { a as e, n as t } from "./environment-H0LjiCAj.js";
import { t as n } from "./ray-query-CWJhfYYD.js";
import { averageMapColor as r, buildWorld as i, createDirectIrradiance as a, createGatherer as o, emittedRadiance as s, hitNormal as c, normalizeLights as l, sceneScale as u, validatePart as d, withReach as f } from "./light-bake.js";
var p = 32, m = 2, h = 65536, g = .99, _ = 128, v = 16, y = 1, b = .5, x = .6;
function S(e) {
	let t = 1 - (e.metallic ?? 0) * .5, n = r(e.map);
	return e.color.map((e, r) => Math.max(e, 0) * t * n[r]);
}
function C(e, t, r, { width: p = 64, samples: m = 32, bounces: g = 2, rotation: _ = 0, missRadiance: v = null, skyIrradiance: y = null, maxSeconds: b = 60 } = {}) {
	let x = p / 2;
	if (!Number.isInteger(p) || p < 8 || p * x > h) throw RangeError(`Probe width must be an even integer from 8 whose map has at most ${h} pixels.`);
	if (!Array.isArray(e) || e.length === 0 || e.length > 256) throw RangeError("Probes take from 1 to 256 parts.");
	e.forEach(d);
	let C = l(t), E = i(e), D = u(E.positions), O = D * 1e-4, k = n(E), A = a(k, f(C, e), O, D), j = e.map((e) => S(e.material)), M = e.map((e) => s(e.material)), N = o({
		world: E,
		tracer: k,
		albedoOfPart: j,
		emissionOfPart: M,
		directIrradiance: A,
		offset: O,
		samples: m,
		bounces: g
	}), P = y ? w({
		tracer: k,
		offset: O,
		skyIrradiance: y,
		parts: e
	}) : null, F = performance.now(), I = Math.cos(_), L = Math.sin(_), R = [
		0,
		0,
		0
	], z = [
		0,
		0,
		0
	], B = [
		0,
		0,
		0
	], V = [
		0,
		0,
		0
	], H = [
		0,
		0,
		0
	], U = [
		0,
		0,
		0
	];
	return r.map((e, t) => {
		let n = new Float32Array(p * x * 3), r = 0;
		for (let i = 0; i < x; i++) {
			let a = (i + .5) / x * Math.PI;
			for (let o = 0; o < p; o++) {
				if (performance.now() - F > b * 1e3) throw Error(`Probe trace passed maxSeconds (${b}).`);
				let s = ((o + .5) / p - .5) * 2 * Math.PI, l = Math.sin(a) * Math.sin(s), u = -Math.sin(a) * Math.cos(s);
				R[0] = I * l + L * u, R[1] = Math.cos(a), R[2] = -L * l + I * u;
				let d = (i * p + o) * 3, f = k.trace(e[0], e[1], e[2], R[0], R[1], R[2], Infinity, !1);
				if (f.nearestTriangle < 0) {
					v && (v(R, U), n.set(U, d));
					continue;
				}
				r++;
				for (let t = 0; t < 3; t++) z[t] = e[t] + R[t] * f.nearestDistance;
				c(E, f.nearestTriangle, R, B);
				let m = E.triangleOwner[f.nearestTriangle], h = A(z, B, m);
				V[0] = h[0], V[1] = h[1], V[2] = h[2], N(z, B, (t + 7777) * 1000003 + i * p + o, H);
				let g = y ? y(B) : null, _ = P ? P(z, B, R, m) : null;
				for (let e = 0; e < 3; e++) {
					let t = g ? g[e] : 0, r = _ ? _[e] : 0;
					n[d + e] = M[m][e] + j[m][e] * (V[e] / Math.PI + H[e] + t) + r;
				}
			}
		}
		return {
			data: n,
			width: p,
			height: x,
			hitFraction: r / (p * x),
			floorHeight: T(E, k, e)
		};
	});
}
function w({ tracer: e, offset: t, skyIrradiance: n, parts: r }) {
	let i = [
		0,
		0,
		0
	], a = [
		0,
		0,
		0
	];
	return function(o, s, c, l) {
		let u = r[l].material, d = 1 - (u.metallic ?? 0), f = -(c[0] * s[0] + c[1] * s[1] + c[2] * s[2]);
		if (i[0] = 0, i[1] = 0, i[2] = 0, d <= 0 || f <= 0) return i;
		for (let e = 0; e < 3; e++) a[e] = c[e] + 2 * f * s[e];
		if (!(e.trace(o[0] + s[0] * t, o[1] + s[1] * t, o[2] + s[2] * t, a[0], a[1], a[2], Infinity, !0).nearestTriangle < 0)) return i;
		let p = 1 - (u.roughness ?? .5), m = Math.min(.04 + .96 * (1 - f) ** 5, Math.max(p, .04)) * d, h = n(a);
		for (let e = 0; e < 3; e++) i[e] = m * h[e] / Math.PI;
		return i;
	};
}
function T(e, t, n) {
	let r = t.trace(n[0], n[1], n[2], 0, -1, 0, Infinity, !1);
	if (r.nearestTriangle < 0) return null;
	let i = [
		0,
		0,
		0
	];
	return c(e, r.nearestTriangle, [
		0,
		-1,
		0
	], i), i[1] > g ? n[1] - r.nearestDistance : null;
}
function E(e) {
	if (!Array.isArray(e) || e.length > 4) throw RangeError("bake.probes must be false or a list of at most 4 probes.");
	return e.map((e, t) => {
		let n = `bake.probes[${t}]`;
		if (!(Array.isArray(e?.position) && e.position.length === 3 && e.position.every((e) => Number.isFinite(e) && Math.abs(e) <= 1e6))) throw TypeError(`${n} needs position [x, y, z].`);
		for (let t of Object.keys(e)) if (t !== "position" && t !== "radius") throw TypeError(`${n} has an unknown field ${t}; use position and radius.`);
		if (e.radius !== void 0 && !(Number.isFinite(e.radius) && e.radius > 0 && e.radius <= 1e6)) throw RangeError(`${n}.radius must be a number above 0.`);
		return {
			position: [...e.position],
			...e.radius === void 0 ? {} : { radius: e.radius }
		};
	});
}
function D(e) {
	let { positions: t } = e.geometry, { matrix: n } = e, [r, i, a, , o, s, c, , l, u, d, , f, p, m] = n, h = Infinity, g = Infinity, _ = Infinity, v = -Infinity, y = -Infinity, b = -Infinity;
	for (let e = 0; e < t.length; e += 3) {
		let n = t[e], x = t[e + 1], S = t[e + 2], C = r * n + o * x + l * S + f, w = i * n + s * x + u * S + p, T = a * n + c * x + d * S + m;
		h = Math.min(h, C), g = Math.min(g, w), _ = Math.min(_, T), v = Math.max(v, C), y = Math.max(y, w), b = Math.max(b, T);
	}
	return {
		minimum: [
			h,
			g,
			_
		],
		maximum: [
			v,
			y,
			b
		]
	};
}
function O({ minimum: e, maximum: t }) {
	return e.map((e, n) => (e + t[n]) / 2);
}
function k(e) {
	let t = {
		minimum: [
			Infinity,
			Infinity,
			Infinity
		],
		maximum: [
			-Infinity,
			-Infinity,
			-Infinity
		]
	};
	for (let n of e) {
		let e = D(n);
		for (let n = 0; n < 3; n++) t.minimum[n] = Math.min(t.minimum[n], e.minimum[n]), t.maximum[n] = Math.max(t.maximum[n], e.maximum[n]);
	}
	let n = Math.hypot(...t.maximum.map((e, n) => e - t.minimum[n]));
	return {
		position: O(t),
		radius: n / 2
	};
}
function A(e) {
	let t = Math.cos(e.rotation), n = Math.sin(e.rotation);
	return (r, i) => {
		let a = t * r[0] - n * r[2], o = n * r[0] + t * r[2], s = Math.min(e.width - 1, Math.floor((Math.atan2(a, -o) / (2 * Math.PI) + .5) * e.width)), c = (Math.min(e.height - 1, Math.floor(Math.acos(Math.min(Math.max(r[1], -1), 1)) / Math.PI * e.height)) * e.width + s) * e.channels;
		for (let t = 0; t < 3; t++) i[t] = e.data[c + t] * e.intensity;
	};
}
function j(n) {
	let r = t(n), i = Math.cos(n.rotation), a = Math.sin(n.rotation), o = [
		0,
		0,
		0
	];
	return (t) => (o[0] = i * t[0] - a * t[2], o[1] = t[1], o[2] = a * t[0] + i * t[2], e(r, o).map((e) => e * n.intensity));
}
function M(e) {
	let t = e.skyBottom ?? [
		.62,
		.7,
		.67
	], n = e.skyTop ?? [
		.2,
		.38,
		.52
	];
	return (e, r) => {
		let i = Math.min(Math.max((e[1] + .15) / .85, 0), 1), a = i * i * (3 - 2 * i);
		for (let e = 0; e < 3; e++) r[e] = t[e] + (n[e] - t[e]) * a;
	};
}
function N(e) {
	return (e.metallic ?? 0) >= b && (e.roughness ?? 1) <= x;
}
function P(e, t, n = {}) {
	let { environment: r = {}, environmentMap: i = null, rotation: a = 0, samples: o = v, bounces: s = y, width: c = _, maxSeconds: l = 60 } = n, u = [];
	e.forEach((e, t) => {
		N(e.material) && u.push(t);
	});
	let d = u.length > 8 ? [] : u, f = d.length > 0 ? null : u.length > 0 ? "more than 8 reflective parts" : "no reflective part";
	if (d.length === 0 || e.length < 2) return {
		traced: [],
		automatic: !0,
		requested: u.length,
		skipped: f,
		seconds: 0
	};
	let p = performance.now(), m = i ? A(i) : M(r), h = i ? j(i) : null;
	return {
		traced: d.map((n) => {
			let r = e.filter((e, t) => t !== n), i = O(D(e[n])), [u] = C(r, t, [i], {
				width: c,
				samples: o,
				bounces: s,
				rotation: a,
				missRadiance: m,
				skyIrradiance: h,
				maxSeconds: l
			});
			return {
				position: i,
				radius: null,
				part: n,
				...u
			};
		}),
		automatic: !0,
		requested: u.length,
		skipped: null,
		seconds: (performance.now() - p) / 1e3
	};
}
function F(e, t, n, r = {}) {
	let { environment: i = {}, environmentMap: a = null, rotation: o = 0, samples: s = p, bounces: c = m, maxSeconds: l = 60 } = r, u = n === "room", d = u ? [k(e)] : E(n), f = k(e).radius * 2, h = performance.now(), g = d.map((e) => e.position), _ = d.length === 0 ? [] : C(e, t, g, {
		width: 64,
		samples: s,
		bounces: c,
		rotation: o,
		missRadiance: a ? A(a) : M(i),
		maxSeconds: l
	}), v = [];
	return d.forEach((e, t) => {
		u && _[t].hitFraction < .9 || v.push({
			position: e.position,
			radius: e.radius ?? f,
			..._[t]
		});
	}), {
		traced: v,
		automatic: u,
		requested: d.length,
		skipped: u && v.length === 0 ? "open scene: under 90 percent of rays from the room centre hit a part" : null,
		seconds: (performance.now() - h) / 1e3
	};
}
export { F as a, P as i, E as n, D as o, S as r, O as t };
