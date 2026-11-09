/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import "./world-material-shader.js";
// src/terrain-sky.js
var e = 16, t = 2, n = 1.3, r = Math.PI / 2, i = 160;
function a(e, t, n) {
	return t * Math.sin(e) ** 2 / 2 + n * (e / 2 + Math.sin(2 * e) / 4);
}
function o({ heights: o, gridCells: s, spacing: c, highest: l, normalAt: u }) {
	let d = s + 1, f = new Float32Array(d * d).fill(NaN), p = s * c, m = Math.max(1, Math.round(s / i)), h = /* @__PURE__ */ new Float32Array(3), g = Array.from({ length: e }, (t, n) => Math.cos(n / e * 2 * Math.PI)), _ = Array.from({ length: e }, (t, n) => Math.sin(n / e * 2 * Math.PI));
	function v(e, t) {
		let n = Math.min(Math.floor(e), s - 1), r = Math.min(Math.floor(t), s - 1), i = e - n, a = t - r, c = r * d + n, l = o[c] * (1 - i) + o[c + 1] * i, u = o[c + d] * (1 - i) + o[c + d + 1] * i;
		return l * (1 - a) + u * a;
	}
	function y(e, r, i, a, o) {
		let u = -Infinity;
		for (let d = c * t; d <= p && !((l - i) / d <= u); d *= n) {
			let t = e + a * d / c, n = r + o * d / c;
			if (t < 0 || n < 0 || t > s || n > s) break;
			u = Math.max(u, (v(t, n) - i) / d);
		}
		return u;
	}
	function b(t, n) {
		let i = o[n * d + t];
		if (l - i <= 0) return 1;
		u(t, n, h);
		let s = Math.max(h[1], 1e-6), c = 0, f = 0;
		for (let o = 0; o < e; o++) {
			let e = h[0] * g[o] + h[2] * _[o], l = Math.atan(y(t, n, i, g[o], _[o])), u = Math.atan(-e / s), d = a(r, s, e);
			f += d - a(u, s, e), c += d - a(Math.max(l, u), s, e);
		}
		return f > 0 ? Math.min(1, Math.max(0, c / f)) : 1;
	}
	function x(e, t) {
		let n = t * d + e;
		return Number.isNaN(f[n]) && (f[n] = b(e, t)), f[n];
	}
	return function(e, t) {
		let n = Math.floor(e / m) * m, r = Math.floor(t / m) * m, i = Math.min(n + m, s), a = Math.min(r + m, s), o = i === n ? 0 : (e - n) / (i - n), c = a === r ? 0 : (t - r) / (a - r), l = x(n, r) * (1 - o) + x(i, r) * o, u = x(n, a) * (1 - o) + x(i, a) * o;
		return l * (1 - c) + u * c;
	};
}
// src/terrain.js
var s = Object.freeze({
	amplitude: 14,
	mountainAmplitude: 46,
	featureSize: 160,
	octaves: 6,
	gain: .5,
	lacunarity: 2,
	warp: 36,
	warpFeatureSize: 90,
	baseHeight: 0
}), c = Object.freeze({
	cosine: .8,
	sine: .6
}), l = Object.freeze({
	color: [
		1,
		1,
		1
	],
	metallic: 0,
	roughness: 1,
	emission: 0
});
function u(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function d(e, t, n) {
	let r = u((n - e) / (t - e), 0, 1);
	return r * r * (3 - 2 * r);
}
function f(e, t, n) {
	let r = Math.imul(e, 374761393) ^ Math.imul(t, 668265263) ^ Math.imul(n | 0, 1597334677);
	return r = Math.imul(r ^ r >>> 13, 1274126177), r ^= r >>> 16, (r >>> 0) / 4294967296;
}
function p(e, t, n, r) {
	let i = Math.floor(e), a = Math.floor(t), o = e - i, s = t - a, c = o * o * o * (o * (o * 6 - 15) + 10), l = s * s * s * (s * (s * 6 - 15) + 10), u = 30 * o * o * (o - 1) * (o - 1), d = 30 * s * s * (s - 1) * (s - 1), p = f(i, a, n), m = f(i + 1, a, n), h = f(i, a + 1, n), g = f(i + 1, a + 1, n), _ = p - m - h + g;
	r[0] = (p + (m - p) * c + (h - p) * l + _ * c * l) * 2 - 1, r[1] = 2 * u * (m - p + _ * l), r[2] = 2 * d * (h - p + _ * c);
}
function m(e, t, n, r, i) {
	let a = e / n.featureSize, o = t / n.featureSize, s = 0, l = 1, u = 0, d = 0, f = 0;
	for (let e = 0; e < n.octaves; e++) {
		p(a, o, r + e * 17, i), d += i[1], f += i[2], s += l * i[0] / (1 + d * d + f * f), u += l, l *= n.gain;
		let t = (c.cosine * a - c.sine * o) * n.lacunarity;
		o = (c.sine * a + c.cosine * o) * n.lacunarity, a = t;
	}
	return s / u;
}
function h(e, t, n, r, i) {
	let a = e / n.featureSize, o = t / n.featureSize, s = 0, l = 1, d = 0, f = 1;
	for (let e = 0; e < n.octaves; e++) {
		p(a, o, r + 101 + e * 13, i);
		let t = (1 - Math.abs(i[0])) ** 2 * f;
		f = u(t * 2, 0, 1), s += t * l, d += l, l *= n.gain;
		let m = (c.cosine * a - c.sine * o) * n.lacunarity;
		o = (c.sine * a + c.cosine * o) * n.lacunarity, a = m;
	}
	return s / d;
}
function g(e = {}, t = 1) {
	let n = {
		...s,
		...e
	}, r = /* @__PURE__ */ new Float64Array(3), i = /* @__PURE__ */ new Float64Array(3), a = {
		...n,
		featureSize: n.featureSize * 2.6,
		octaves: 2
	}, o = e.mountainMask ?? ((e, n) => d(.05, .4, m(e, n, a, t + 7, r)));
	return (e, a) => {
		p(e / n.warpFeatureSize, a / n.warpFeatureSize, t + 31, i);
		let s = e + i[0] * n.warp, c = a + i[0] * n.warp * .7 + i[1] * n.warp * .2, l = m(s, c, n, t, r) * n.amplitude, u = o(e, a);
		if (u <= 0) return n.baseHeight + l;
		let d = h(s, c, {
			...n,
			featureSize: n.featureSize * 1.3
		}, t, r) * n.mountainAmplitude;
		return n.baseHeight + l * (1 - u) + (l * .4 + d) * u;
	};
}
function _(e, t = 1) {
	if (e.width !== e.height) throw RangeError("Heightmap images must be square.");
	let n = new Float32Array(e.width * e.height);
	for (let r = 0; r < n.length; r++) n[r] = e.data[r * 4] / 255 * t;
	return n;
}
function v(e, t) {
	let n = Math.round(Math.sqrt(e.length));
	if (n * n !== e.length || n < 2) throw RangeError("A height array must be square with at least 2 by 2 samples.");
	return (r, i) => {
		let a = u((r / t + .5) * (n - 1), 0, n - 1), o = u((i / t + .5) * (n - 1), 0, n - 1), s = Math.min(Math.floor(a), n - 2), c = Math.min(Math.floor(o), n - 2), l = a - s, d = o - c, f = e[c * n + s] * (1 - l) + e[c * n + s + 1] * l, p = e[(c + 1) * n + s] * (1 - l) + e[(c + 1) * n + s + 1] * l;
		return f * (1 - d) + p * d;
	};
}
function y(e, t, n) {
	return typeof e == "function" ? e : e instanceof Float32Array ? v(e, t) : g(e ?? {}, n);
}
function b({ size: e, resolution: t, chunks: n, levels: r, mirrorLevels: i }) {
	if (!(e > 0) || !Number.isFinite(e)) throw RangeError("size must be a positive number of metres.");
	if (!Number.isInteger(n) || n < 1) throw RangeError("chunks must be a positive integer.");
	if (!Number.isInteger(r) || r < 1) throw RangeError("levels must be a positive integer.");
	if (!Number.isInteger(t) || t < 1 || t % 2 ** (r - 1) != 0) throw RangeError(`resolution must be a positive integer divisible by 2^(levels - 1) = ${2 ** (r - 1)}.`);
	if (!Number.isInteger(i) || i < 0 || t % 2 ** (r - 1 + i) != 0) throw RangeError("mirrorLevels must be a whole number of extra halvings that the resolution divides by (2^(levels - 1 + mirrorLevels)).");
}
var x = 2, S = Object.freeze([
	"west",
	"east",
	"north",
	"south"
]), C = 64;
function w(e) {
	if (e === void 0) return null;
	if (!Array.isArray(e) || e.length > C) throw RangeError(`holes must be a list of at most ${C} circles.`);
	return e.length === 0 ? null : e.map((e) => {
		let t = e?.center;
		if (!(Array.isArray(t) && t.length === 2 && t.every(Number.isFinite)) || !(e.radius > 0) || !Number.isFinite(e.radius)) throw RangeError("Each hole needs center [x, z] in metres and a positive radius.");
		return {
			center: [t[0], t[1]],
			radius: e.radius
		};
	});
}
function T(e, t, n) {
	for (let r of e) if (Math.hypot(t - r.center[0], n - r.center[1]) < r.radius) return !0;
	return !1;
}
function E({ size: e = 512, resolution: t = 32, chunks: n = 8, levels: r = 4, height: i, seed: a = 1, material: s = l, lodDistance: c, eye: d, holes: f, mirrorLevels: p } = {}) {
	let m = p !== void 0, h = m ? p : 0;
	b({
		size: e,
		resolution: t,
		chunks: n,
		levels: r,
		mirrorLevels: h
	});
	let g = w(f), _ = (e, t) => g !== null && T(g, e, t), v = y(i, e, a), C = e / n, E = n * t, O = E + 1, k = e / E, A = -e / 2, j = new Float32Array(O * O), M = Infinity, N = -Infinity;
	for (let e = 0; e < O; e++) for (let t = 0; t < O; t++) {
		let n = v(A + t * k, A + e * k);
		if (!Number.isFinite(n)) throw RangeError("Height function returned a non-finite value.");
		j[e * O + t] = n, M = Math.min(M, j[e * O + t]), N = Math.max(N, j[e * O + t]);
	}
	let ee = {
		min: [
			A,
			M,
			A
		],
		max: [
			-A,
			N,
			-A
		]
	}, P = c ?? C * 1.6, F = (e, t) => j[u(t, 0, E) * O + u(e, 0, E)];
	function I(e, t, n, r, i) {
		let a = (F(e + n, t) - F(e - n, t)) / (2 * n * k), o = (F(e, t + n) - F(e, t - n)) / (2 * n * k), s = 1 / Math.hypot(a, 1, o);
		r[i] = -a * s, r[i + 1] = s, r[i + 2] = -o * s;
	}
	let L = o({
		heights: j,
		gridCells: E,
		spacing: k,
		highest: N,
		normalAt: (e, t, n) => I(e, t, 1, n, 0)
	});
	function R(e, t) {
		let n = u((e - A) / k, 0, E), r = u((t - A) / k, 0, E), i = Math.min(Math.floor(n), E - 1), a = Math.min(Math.floor(r), E - 1);
		return {
			column: i,
			row: a,
			fractionX: n - i,
			fractionZ: r - a
		};
	}
	function z(e, t) {
		let { column: n, row: r, fractionX: i, fractionZ: a } = R(e, t), o = F(n, r), s = F(n + 1, r), c = F(n, r + 1), l = F(n + 1, r + 1);
		return i >= a ? o + i * (s - o) + a * (l - s) : o + i * (l - c) + a * (c - o);
	}
	function B(e, t) {
		let { column: n, row: r, fractionX: i, fractionZ: a } = R(e, t), o = /* @__PURE__ */ new Float32Array(12);
		I(n, r, 1, o, 0), I(n + 1, r, 1, o, 3), I(n, r + 1, 1, o, 6), I(n + 1, r + 1, 1, o, 9);
		let s = [
			0,
			0,
			0
		];
		for (let e = 0; e < 3; e++) {
			let t = o[e] * (1 - i) + o[3 + e] * i, n = o[6 + e] * (1 - i) + o[9 + e] * i;
			s[e] = t * (1 - a) + n * a;
		}
		let c = Math.hypot(...s);
		return s.map((e) => e / c);
	}
	function V(e, n, r, i) {
		let a = 2 ** r, o = t / a, s = o + 1, c = new Float32Array(s * s * 3), l = new Float32Array(s * s * 3), d = new Float32Array(s * s * 2), f = new Float32Array(s * s), p = e * t, m = n * t;
		for (let e = 0; e < s; e++) for (let t = 0; t < s; t++) {
			let n = e * s + t, o = p + t * a, h = m + e * a, g = A + o * k, _ = A + h * k;
			c.set([
				g,
				H(t, e, s, a, o, h, i, r),
				_
			], n * 3), I(o, h, a, l, n * 3), d.set([g, _], n * 2), f[n] = L(u(o, 0, E), u(h, 0, E));
		}
		let h = new Uint32Array(o * o * 6), g = 0;
		for (let e = 0; e < o; e++) for (let t = 0; t < o; t++) {
			let n = A + (p + (t + .5) * a) * k, r = A + (m + (e + .5) * a) * k;
			if (_(n, r)) continue;
			let i = e * s + t, o = i + 1, c = i + s, l = c + 1;
			h.set([
				i,
				l,
				o,
				i,
				c,
				l
			], g), g += 6;
		}
		return {
			positions: c,
			normals: l,
			uvs: d,
			skyVisibility: f,
			indices: g === h.length ? h : h.slice(0, g)
		};
	}
	function H(e, t, n, r, i, a, o, s) {
		let c = n - 1, l = t === 0 ? "north" : t === c ? "south" : null, u = e === 0 ? "west" : e === c ? "east" : null;
		return l && e % 2 ** (o[l] - s) != 0 ? U(e, 2 ** (o[l] - s), (t) => F(i + (t - e) * r, a)) : u && t % 2 ** (o[u] - s) != 0 ? U(t, 2 ** (o[u] - s), (e) => F(i, a + (e - t) * r)) : F(i, a);
	}
	function U(e, t, n) {
		let r = Math.floor(e / t) * t, i = (e - r) / t;
		return n(r) * (1 - i) + n(r + t) * i;
	}
	let W = [], G = [];
	for (let e = 0; e < n; e++) for (let t = 0; t < n; t++) {
		let n = {
			chunkColumn: t,
			chunkRow: e,
			level: -1,
			edgeLevels: null,
			centerX: A + (t + .5) * C,
			centerZ: A + (e + .5) * C
		};
		n.part = {
			name: `Terrain chunk ${t},${e}`,
			geometry: null,
			matrix: D(),
			material: s
		}, Object.defineProperty(n.part, "prepareMirrorLevels", { value: Z }), W.push(n), G.push(n.part);
	}
	let K = (e, t) => e < 0 || t < 0 || e >= n || t >= n ? null : W[t * n + e];
	function q(e, t) {
		let n = z(u(t[0], A, -A), u(t[2], A, -A)), i = Math.hypot(t[0] - e.centerX, t[1] - n, t[2] - e.centerZ) - C * .5;
		return i <= P ? 0 : Math.min(r - 1, Math.floor(Math.log2(i / P)) + 1);
	}
	function J(e, n) {
		let r = 2 ** n, i = 0;
		for (let n = 0; n <= t; n += r) for (let a = 0; a <= t; a += r) {
			let o = e.chunkColumn * t + a, s = e.chunkRow * t + n, c = F(o, s);
			i = Math.max(i, Math.abs(F(o - r, s) + F(o + r, s) - 2 * c) / 2, Math.abs(F(o, s - r) + F(o, s + r) - 2 * c) / 2);
		}
		return i;
	}
	function Y(e, n, r) {
		let i = 2 ** r, a = t / i, o = a + 1, s = e * t, c = n * t, l = [], d = [], f = [], p = [], m = [], h = /* @__PURE__ */ new Float32Array(3);
		function g(e, t) {
			let n = A + e * k, r = A + t * k;
			return I(e, t, 1, h, 0), l.push(n, F(e, t), r), d.push(h[0], h[1], h[2]), f.push(n, r), p.push(L(u(e, 0, E), u(t, 0, E))), p.length - 1;
		}
		for (let e = 0; e < o; e++) for (let t = 0; t < o; t++) g(s + t * i, c + e * i);
		let v = /* @__PURE__ */ new Map();
		function y(e, n) {
			if (e % i === 0 && n % i === 0) return e / i * o + n / i;
			let r = e * (t + 1) + n;
			return v.has(r) || v.set(r, g(s + n, c + e)), v.get(r);
		}
		for (let e = 0; e < a; e++) for (let t = 0; t < a; t++) {
			let n = e * i, r = n + i, l = t * i, u = l + i;
			if (_(A + (s + l + i / 2) * k, A + (c + n + i / 2) * k)) continue;
			let d = {
				north: e === 0,
				south: e === a - 1,
				west: t === 0,
				east: t === a - 1
			};
			if (!d.north && !d.south && !d.west && !d.east) {
				let n = e * o + t;
				m.push(n, n + o + 1, n + 1, n, n + o, n + o + 1);
				continue;
			}
			let f = [];
			for (let e = l; e < (d.north ? u : l + 1); e++) f.push(y(n, e));
			for (let e = n; e < (d.east ? r : n + 1); e++) f.push(y(e, u));
			for (let e = u; e > (d.south ? l : u - 1); e--) f.push(y(r, e));
			for (let e = r; e > (d.west ? n : r - 1); e--) f.push(y(e, l));
			let p = g(s + l + i / 2, c + n + i / 2);
			for (let e = 0; e < f.length; e++) m.push(p, f[(e + 1) % f.length], f[e]);
		}
		return {
			positions: new Float32Array(l),
			normals: new Float32Array(d),
			uvs: new Float32Array(f),
			skyVisibility: new Float32Array(p),
			indices: new Uint32Array(m),
			mirrorOnly: !0
		};
	}
	function X(e) {
		let t = [{
			geometry: e.part.geometry,
			error: 0
		}];
		for (let n = 1; n <= h; n++) {
			let r = e.targetLevel + n, i = Math.max(t[n - 1].error, J(e, r));
			t.push({
				geometry: Y(e.chunkColumn, e.chunkRow, r),
				error: i,
				mirrorOnly: !0
			});
		}
		return t;
	}
	function Z() {
		if (!(m || h > 0)) {
			for (; h < x && t % 2 ** (r + h) == 0;) h++;
			if (h !== 0) for (let e of W) e.part.geometry && (e.part.lods = X(e));
		}
	}
	let Q = 0;
	function $(e) {
		if (!Array.isArray(e) && !(e instanceof Float32Array)) throw TypeError("update needs an eye position [x, y, z].");
		for (let t of W) t.targetLevel = q(t, e);
		let t = [];
		for (let e of W) {
			let n = [
				K(e.chunkColumn - 1, e.chunkRow),
				K(e.chunkColumn + 1, e.chunkRow),
				K(e.chunkColumn, e.chunkRow - 1),
				K(e.chunkColumn, e.chunkRow + 1)
			], r = Object.fromEntries(S.map((t, r) => [t, Math.max(e.targetLevel, n[r]?.targetLevel ?? e.targetLevel)]));
			e.level === e.targetLevel && S.every((t) => e.edgeLevels?.[t] === r[t]) || (e.part.geometry && (Q -= e.part.geometry.indices.length / 3), e.part.geometry = V(e.chunkColumn, e.chunkRow, e.targetLevel, r), h > 0 && (e.part.lods = X(e)), Q += e.part.geometry.indices.length / 3, e.level = e.targetLevel, e.edgeLevels = r, t.push(e.part));
		}
		return t;
	}
	return $(d ?? [
		0,
		N + e * .5,
		0
	]), {
		parts: G,
		heightAt: z,
		normalAt: B,
		isHole: _,
		bounds: ee,
		update: $,
		get triangleCount() {
			return Q;
		},
		chunkSize: C,
		resolution: t,
		levels: r,
		chunkLevels: () => W.map((e) => e.level)
	};
}
function D() {
	return new Float32Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
}
export { w as i, E as n, _ as r, g as t };
