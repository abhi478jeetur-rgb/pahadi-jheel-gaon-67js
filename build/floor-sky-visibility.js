/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e } from "./closed-room-CB0A9B5C.js";
import { buildWorld as t, cosineDirection as n, hashUnit as r, radicalInverse as i, sceneScale as a } from "./light-bake.js";
import { o } from "./probe-trace-ALKeQrQp.js";
import { t as s } from "./ray-query-CWJhfYYD.js";
import { partDiffuseAlbedo as c } from "./ground-bounce.js";
// src/fitted-closed-room.js
function l(e) {
	return e.geometry.indices.length / 3;
}
function u(e) {
	let t = /* @__PURE__ */ new Set(), n = 0;
	for (let r of [...e].sort((e, t) => l(e) - l(t))) {
		if (n += l(r), n > 15e4) break;
		t.add(r);
	}
	return e.filter((e) => t.has(e));
}
function d(e, t) {
	let { positions: n } = e.geometry, r = [
		Infinity,
		Infinity,
		Infinity
	], i = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let e = 0; e < n.length; e++) r[e % 3] = Math.min(r[e % 3], n[e]), i[e % 3] = Math.max(i[e % 3], n[e]);
	let a = r.map((e, t) => (e + i[t]) / 2);
	return [
		0,
		1,
		2
	].map((e) => t[e] * a[0] + t[4 + e] * a[1] + t[8 + e] * a[2] + t[12 + e]);
}
function f(e, t) {
	let n = e.map((e) => d(e, t.get(e.name))), r = [
		0,
		1,
		2
	].map((e) => {
		let t = n.map((t) => t[e]).sort((e, t) => e - t);
		return [t[Math.floor((t.length - 1) * .2)], t[Math.ceil((t.length - 1) * .8)]];
	}), i = 1.5 * Math.max(...r.map(([e, t]) => t - e));
	return e.filter((e, t) => r.every(([e, r], a) => n[t][a] >= e - i && n[t][a] <= r + i));
}
function p(t, n) {
	let r = u(t.filter((e) => !["blend", "add"].includes(e.material?.alphaMode))), i = e(r, n);
	return i === null || i >= .9 ? i : Math.max(i, e(f(r, n), n) ?? 0);
}
var m = 2e4, h = 5e3, g = 16, _ = .75, v = 6, y = 1, b = .3, x = .03, S = .001, C = /* @__PURE__ */ new Set([
	"liquid",
	"foam",
	"unlit",
	"fire",
	"smoke"
]);
function w(e) {
	return !["blend", "add"].includes(e.material?.alphaMode) && !((e.material?.emission ?? 0) > 0) && !C.has(e.material?.tag);
}
function T(e) {
	let t = e.keyColor ?? [
		1,
		1,
		1
	], n = e.keyIntensity ?? 1, r = Math.hypot(...e.lightDirection);
	return {
		irradiance: t.map((e) => e * n),
		direction: e.lightDirection.map((e) => e / r)
	};
}
function E(e) {
	let t = e.keyColor ?? [
		1,
		1,
		1
	];
	return !!e.lightDirection && (e.keyIntensity ?? 1) * (t[0] + t[1] + t[2]) > S;
}
function D(e, o) {
	let l = t(e), u = s(l), d = a(l.positions) * 1e-4, { positions: f, indices: p, triangleOwner: v } = l, y = e.map((e) => c(e.material ?? {})), b = p.length / 3, x = (e, t, n) => f[p[e * 3 + t] * 3 + n], S = new Float32Array(b * 3), C = new Float32Array(b), T = new Uint8Array(b);
	for (let t = 0; t < b; t++) {
		let n = [
			0,
			1,
			2
		].map((e) => x(t, 1, e) - x(t, 0, e)), r = [
			0,
			1,
			2
		].map((e) => x(t, 2, e) - x(t, 0, e)), i = [
			n[1] * r[2] - n[2] * r[1],
			n[2] * r[0] - n[0] * r[2],
			n[0] * r[1] - n[1] * r[0]
		], a = Math.hypot(...i);
		if (!(a < 1e-12)) {
			C[t] = a / 2;
			for (let e = 0; e < 3; e++) S[t * 3 + e] = i[e] / a;
			S[t * 3] * o.direction[0] + S[t * 3 + 1] * o.direction[1] + S[t * 3 + 2] * o.direction[2] > 0 && w(e[v[t]]) && (T[t] = 1);
		}
	}
	let E = [
		0,
		0,
		0
	];
	function D(e, t) {
		let a = 0;
		for (let t = 0; t < b; t++) e[t] && (a += C[t]);
		let s = [];
		if (a === 0) return s;
		let c = a / t, l = 0;
		for (let t = 0; t < b; t++) {
			if (!e[t]) continue;
			let a = [
				S[t * 3],
				S[t * 3 + 1],
				S[t * 3 + 2]
			], f = a[0] * o.direction[0] + a[1] * o.direction[1] + a[2] * o.direction[2];
			l += C[t] / c;
			for (let e = 0; l >= 1; e++, --l) {
				let l = r(t, e, 1), p = r(t, e, 2);
				l + p > 1 && (l = 1 - l, p = 1 - p);
				let m = [
					0,
					1,
					2
				].map((e) => x(t, 0, e) + l * (x(t, 1, e) - x(t, 0, e)) + p * (x(t, 2, e) - x(t, 0, e))), h = m.map((e, t) => e + a[t] * d);
				if (u.trace(h[0], h[1], h[2], o.direction[0], o.direction[1], o.direction[2], Infinity, !0).nearestTriangle >= 0) continue;
				let b = 0;
				for (let e = 0; e < g; e++) n(a, (e + .5) / g, i(e + 1), E), u.trace(h[0], h[1], h[2], E[0], E[1], E[2], Infinity, !0).nearestTriangle >= 0 && b++;
				if (b / g < _) continue;
				let S = y[v[t]];
				s.push({
					triangle: t,
					point: m,
					normal: a,
					flux: o.irradiance.map((e, t) => e * f * c * S[t])
				});
			}
		}
		return s;
	}
	let O = new Uint8Array(b);
	for (let e of D(T, h)) O[e.triangle] = 1;
	return {
		samples: D(O, m),
		tracer: u
	};
}
function O(e) {
	return e[0] + e[1] + e[2];
}
function k(e, t, n) {
	let r = e.map((e) => [...e.point, ...e.normal.map((e) => e * n)]), i = (e, t) => e.reduce((e, n, r) => e + (n - t[r]) ** 2, 0), a = [r[e.reduce((t, n, r) => O(n.flux) > O(e[t].flux) ? r : t, 0)]], o = r.map((e) => i(e, a[0]));
	for (; a.length < t;) {
		let t = 0;
		for (let n = 1; n < e.length; n++) o[n] * O(e[n].flux) > o[t] * O(e[t].flux) && (t = n);
		if (o[t] === 0) break;
		a.push(r[t]), r.forEach((e, n) => {
			o[n] = Math.min(o[n], i(e, r[t]));
		});
	}
	let s = new Int32Array(e.length);
	for (let t = 0; t < v; t++) {
		let t = a.map(() => ({
			weight: 0,
			total: [
				,
				,
				,
				,
				,
				,
			].fill(0)
		}));
		r.forEach((n, r) => {
			let o = 0;
			for (let e = 1; e < a.length; e++) i(n, a[e]) < i(n, a[o]) && (o = e);
			s[r] = o;
			let c = O(e[r].flux);
			t[o].weight += c, n.forEach((e, n) => {
				t[o].total[n] += e * c;
			});
		}), t.forEach((e, t) => {
			e.weight > 0 && (a[t] = e.total.map((t) => t / e.weight));
		});
	}
	return a.map((t, n) => e.filter((e, t) => s[t] === n)).filter((e) => e.length > 0);
}
function A(e, t, n, r, i) {
	let a = [
		0,
		0,
		0
	], o = [
		0,
		0,
		0
	], s = [
		0,
		0,
		0
	], c = 0;
	for (let t of e) {
		let e = O(t.flux);
		c += e;
		for (let n = 0; n < 3; n++) a[n] += t.flux[n], o[n] += t.point[n] * e, s[n] += t.normal[n] * e;
	}
	let l = Math.hypot(...s) || 1, u = s.map((e) => e / l), d = o.map((e) => e / c), f = Math.sqrt(e.reduce((e, t) => e + O(t.flux) * t.point.reduce((e, t, n) => e + (t - d[n]) ** 2, 0), 0) / c), p = r + n.trace(d[0] + u[0] * r, d[1] + u[1] * r, d[2] + u[2] * r, u[0], u[1], u[2], Infinity, !1).nearestDistance, m = i * x;
	if (p / 2 < m) return null;
	let h = Math.max(Math.min(f * y, p / 2), m), g = a.map((e) => t * b * e / (2 * Math.PI)), _ = Math.max(...g, 1e-9);
	return {
		position: d.map((e, t) => e + u[t] * h),
		color: g.map((e) => Math.min(e / _, 1)),
		intensity: Math.min(_, 1e5),
		radius: h
	};
}
function j(e, t, { strength: n = 1, maximumLights: r = 6 } = {}) {
	if (n <= 0 || r <= 0 || !E(t) || e.some((e) => e.material?.lightMap || e.material?.irradianceGrid)) return [];
	let i = p(e, new Map(e.map((e) => [e.name, e.matrix])));
	if (i === null || i < .9) return [];
	let a = e.filter(w), o = T(t), s;
	try {
		s = D(a, o);
	} catch {
		return [];
	}
	let { samples: c, tracer: l } = s;
	if (c.length === 0) return [];
	let u = Math.max(...[
		0,
		1,
		2
	].map((e) => Math.max(...c.map((t) => t.point[e])) - Math.min(...c.map((t) => t.point[e]))), .001);
	return k(c, r, u).map((e) => A(e, n, l, u * .001, u)).filter(Boolean);
}
var M = /* @__PURE__ */ new WeakMap();
function N(e, t) {
	let n = t.sunBounce ?? 1;
	if (n <= 0 || !E(t)) return t;
	let r = t.pointLights ?? [], i = Math.min(6, 16 - r.length), a = JSON.stringify([
		e.length,
		t.keyColor,
		t.keyIntensity,
		t.lightDirection,
		i
	]), o = M.get(e);
	return o?.key !== a && (o = {
		key: a,
		lights: j(e, t, {
			strength: 1,
			maximumLights: i
		}),
		scaled: /* @__PURE__ */ new Map()
	}, M.set(e, o)), o.lights.length === 0 ? t : (o.scaled.has(n) || o.scaled.set(n, o.lights.map((e) => ee(e, n))), {
		...t,
		pointLights: [...r, ...o.scaled.get(n)]
	});
}
function ee(e, t) {
	let n = e.intensity * t;
	return {
		...e,
		intensity: Math.min(n, 1e5)
	};
}
// src/floor-sky-visibility.js
var P = 64, F = 24e3, I = 20, L = 1, R = .2, z = .1, B = .02, V = .7, H = .3, U = 1e5, W = /* @__PURE__ */ new Set([
	"liquid",
	"foam",
	"unlit",
	"fire",
	"smoke",
	"floor",
	"water",
	"foliage",
	"grass",
	"terrain"
]), G = .37;
function K(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r of e) for (let e = 0; e < 3; e++) t[e] = Math.min(t[e], r.minimum[e]), n[e] = Math.max(n[e], r.maximum[e]);
	return {
		minimum: t,
		maximum: n
	};
}
function q(e) {
	let { geometry: t } = e, n = !e.skin && !e.morph && !e.crowd && !t.morphTargets && !t.skinIndices && !t.crowdJoints, r = t.skyVisibility || t.lightUvs || e.material?.lightMap;
	return n && !r && !!t.normals && t.indices.length > 0;
}
function te(e) {
	return !e || ![
		"blend",
		"add",
		"mask"
	].includes(e.alphaMode) && !(e.transmission > 0) && !W.has(e.tag);
}
function ne(e) {
	let { positions: t, indices: n } = e.geometry, r = 0, i = 0;
	for (let a = 0; a < n.length; a += 3) {
		let [o, s, c] = [
			n[a],
			n[a + 1],
			n[a + 2]
		].map((n) => re(e.matrix, t, n)), l = [
			s[0] - o[0],
			s[1] - o[1],
			s[2] - o[2]
		], u = [
			c[0] - o[0],
			c[1] - o[1],
			c[2] - o[2]
		], d = [
			l[1] * u[2] - l[2] * u[1],
			l[2] * u[0] - l[0] * u[2],
			l[0] * u[1] - l[1] * u[0]
		], f = Math.hypot(...d);
		i += f, f > 0 && d[1] / f >= V && (r += f);
	}
	return i > 0 ? r / i : 0;
}
function re(e, t, n) {
	let r = t[n * 3], i = t[n * 3 + 1], a = t[n * 3 + 2];
	return [
		0,
		1,
		2
	].map((t) => e[t] * r + e[4 + t] * i + e[8 + t] * a + e[12 + t]);
}
function J(e) {
	let t = e.map((e) => o(e)), n = K(t), r = (n.maximum[0] - n.minimum[0]) * (n.maximum[2] - n.minimum[2]), i = [];
	return e.forEach((e, n) => {
		let a = t[n], o = a.maximum[0] - a.minimum[0], s = a.maximum[2] - a.minimum[2], c = a.maximum[1] - a.minimum[1] <= z * Math.max(o, s), l = o * s >= B * r;
		c && l && te(e.material) && q(e) && ne(e) >= H && i.push(n);
	}), i;
}
function Y(e, t, n, r, i) {
	for (let a = 0; a < 3; a++) i[a] = e[a] * t + e[4 + a] * n + e[8 + a] * r;
	return i;
}
function ie(e, t, n, r) {
	let i = Y(e, t[r * 3] - t[n * 3], t[r * 3 + 1] - t[n * 3 + 1], t[r * 3 + 2] - t[n * 3 + 2], [
		0,
		0,
		0
	]);
	return Math.hypot(i[0], i[1], i[2]);
}
function ae(e) {
	let t = !!e.uvs, n = !!e.colors, r = [], i = [], a = [], o = [], s = /* @__PURE__ */ new Map();
	function c(e, c, l, u) {
		let d = [
			...e,
			...c,
			...l ?? [],
			...u ?? []
		].map((e) => Math.round(e * U)).join(",");
		return s.has(d) || (s.set(d, r.length / 3), r.push(...e), i.push(...c), t && a.push(...l), n && o.push(...u)), s.get(d);
	}
	function l(r) {
		return {
			position: [
				e.positions[r * 3],
				e.positions[r * 3 + 1],
				e.positions[r * 3 + 2]
			],
			normal: [
				e.normals[r * 3],
				e.normals[r * 3 + 1],
				e.normals[r * 3 + 2]
			],
			uv: t ? [e.uvs[r * 2], e.uvs[r * 2 + 1]] : null,
			color: n ? [
				e.colors[r * 3],
				e.colors[r * 3 + 1],
				e.colors[r * 3 + 2]
			] : null
		};
	}
	function u(e, t) {
		let n = (e, t) => e && t ? e.map((e, n) => (e + t[n]) / 2) : null, r = n(e.normal, t.normal), i = Math.hypot(...r) || 1;
		return {
			position: n(e.position, t.position),
			normal: r.map((e) => e / i),
			uv: n(e.uv, t.uv),
			color: n(e.color, t.color)
		};
	}
	return {
		positions: r,
		normals: i,
		uvs: a,
		colors: o,
		addVertex: c,
		readVertex: l,
		midpoint: u,
		hasUvs: t,
		hasColors: n
	};
}
function oe(e, t, n) {
	let [r, i, a] = n.map((e) => [
		t[e * 3],
		t[e * 3 + 1],
		t[e * 3 + 2]
	]), o = Y(e, i[0] - r[0], i[1] - r[1], i[2] - r[2], [
		0,
		0,
		0
	]), s = Y(e, a[0] - r[0], a[1] - r[1], a[2] - r[2], [
		0,
		0,
		0
	]), c = [
		o[1] * s[2] - o[2] * s[1],
		o[2] * s[0] - o[0] * s[2],
		o[0] * s[1] - o[1] * s[0]
	], l = Math.hypot(...c) || 1;
	return c.map((e) => e / l);
}
function se(e, t, n) {
	let r = ae(e), i = [], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), s = (e) => r.addVertex(e.position, e.normal, e.uv, e.color), c = [];
	for (let t = 0; t < e.positions.length / 3; t++) c.push(r.readVertex(t));
	let l = [];
	for (let n = 0; n < e.indices.length; n += 3) {
		let r = [
			0,
			1,
			2
		].map((t) => e.indices[n + t]);
		oe(t, e.positions, r)[1] >= V ? l.push(r.map((e) => c[e])) : i.push(...r.map((e) => s(c[e])));
	}
	let u = (e, n) => ie(t, [...e.position, ...n.position], 0, 1);
	for (; l.length > 0;) {
		let e = l.pop(), t = [
			u(e[0], e[1]),
			u(e[1], e[2]),
			u(e[2], e[0])
		], c = t.indexOf(Math.max(...t));
		if (t[c] <= n) {
			let t = e.map(s);
			i.push(...t), t.forEach((e) => a.add(e));
			continue;
		}
		let d = e[c], f = e[(c + 1) % 3], p = e[(c + 2) % 3], m = [d, f].map((e) => s(e)).sort((e, t) => e - t).join("|");
		o.has(m) || o.set(m, r.midpoint(d, f));
		let h = o.get(m);
		l.push([
			d,
			h,
			p
		], [
			h,
			f,
			p
		]);
	}
	return {
		builder: r,
		indices: i,
		upwardVertices: a
	};
}
function ce(e) {
	return Array.from({ length: e }, (t, n) => [(n + .5) / e, (i(n) + G) % 1]);
}
function X(r, { raysPerTexel: i = 64, maximumTexels: c = F, maxSeconds: l = 20, strength: u, includeClosedRooms: d = !1, onlyClosedRooms: f = !1 } = {}) {
	let p = u ?? (f ? .2 : 1), m = performance.now(), h = (e) => ({
		parts: r,
		report: {
			floors: [],
			texels: 0,
			rays: 0,
			seconds: (performance.now() - m) / 1e3,
			reason: e
		}
	}), g = J(r);
	if (g.length === 0) return h("no floor");
	let _ = r.filter((e) => !["blend", "add"].includes(e.material?.alphaMode));
	if (_.length < 2) return h("nothing above the floor");
	let v = e(r, new Map(r.map((e) => [e.name, e.matrix]))), y = v !== null && v >= .9;
	if (y && !d && !f) return h("closed room");
	if (f && !y) return h("open scene");
	let b;
	try {
		b = t(_);
	} catch {
		return h("too many triangles");
	}
	let x = g.reduce((e, t) => {
		let n = o(r[t]);
		return e + (n.maximum[0] - n.minimum[0]) * (n.maximum[2] - n.minimum[2]);
	}, 0), S = Math.sqrt(x / c) * 1.4, C = s(b), w = a(b.positions) * 1e-4, T = ce(i), E = [
		0,
		0,
		0
	], D = [
		0,
		0,
		0
	], O = [], k = 0, A = r.slice();
	for (let e of g) {
		let t = r[e], { geometry: a, matrix: o } = t, { builder: s, indices: c, upwardVertices: u } = se(a, o, S), d = s.positions.length / 3, f = new Float32Array(d).fill(1);
		for (let e of u) {
			if (performance.now() - m > l * 1e3) return h("passed maxSeconds");
			let t = s.positions.slice(e * 3, e * 3 + 3), r = [
				0,
				0,
				0
			];
			for (let e = 0; e < 3; e++) r[e] = o[e] * t[0] + o[4 + e] * t[1] + o[8 + e] * t[2] + o[12 + e];
			Y(o, s.normals[e * 3], s.normals[e * 3 + 1], s.normals[e * 3 + 2], D);
			let a = Math.hypot(...D) || 1;
			D[0] /= a, D[1] /= a, D[2] /= a;
			let c = 0;
			for (let [e, t] of T) n(D, e, t, E), C.trace(r[0] + D[0] * w, r[1] + D[1] * w, r[2] + D[2] * w, E[0], E[1], E[2], Infinity, !0).nearestTriangle < 0 && c++;
			f[e] = 1 - p * (1 - c / i), k += i;
		}
		let g = {
			...a,
			positions: new Float32Array(s.positions),
			normals: new Float32Array(s.normals),
			indices: new Uint32Array(c),
			skyVisibility: f
		};
		s.hasUvs && (g.uvs = new Float32Array(s.uvs)), s.hasColors && (g.colors = new Float32Array(s.colors)), A[e] = Object.freeze({
			...t,
			geometry: Object.freeze(g)
		});
		let _ = 0;
		for (let e of u) _ += f[e];
		O.push({
			name: t.name,
			texels: u.size,
			triangles: c.length / 3,
			meanVisibility: u.size ? _ / u.size : 1
		});
	}
	let j = O.reduce((e, t) => e + t.texels, 0), M = j ? O.reduce((e, t) => e + t.meanVisibility * t.texels, 0) / j : 1;
	return {
		parts: Object.freeze(A),
		report: {
			floors: O,
			texels: j,
			meanVisibility: M,
			rays: k,
			seconds: (performance.now() - m) / 1e3,
			reason: null
		}
	};
}
function Z(e) {
	let t = e?.keyColor ?? [
		1,
		1,
		1
	];
	return (e?.keyIntensity ?? 1) * (t[0] + t[1] + t[2]) > 0;
}
function Q(e, t, n = {}) {
	return t?.floorSkyTrace === !1 || !Z(t) ? {
		parts: e,
		report: null
	} : X(e, {
		onlyClosedRooms: !0,
		...n
	});
}
var $ = /* @__PURE__ */ new WeakMap();
function le(e, t) {
	if (e.floorSkyTrace === !1) return t;
	let n = $.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), $.set(t, n)), n.has(e) || n.set(e, Q(t, e).parts), n.get(e);
}
export { I as FLOOR_SKY_MAXIMUM_SECONDS, F as FLOOR_SKY_MAXIMUM_TEXELS, P as FLOOR_SKY_RAYS, R as FLOOR_SKY_ROOM_STRENGTH, L as FLOOR_SKY_STRENGTH, Q as applyDefaultFloorSky, X as applyFloorSkyVisibility, Z as environmentHasSun, J as findFloorParts, le as stageFloorSky, N as withSunBounce };
