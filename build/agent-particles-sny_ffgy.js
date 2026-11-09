/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e, t } from "./mat3-BUCH0Dej.js";
import { n, o as r, p as i } from "./mat4-BCZClxna.js";
import { n as a, t as o } from "./force-fields-DH4YNmiz.js";
import { a as s, i as c, n as l, o as u, r as d, t as f } from "./agent-recipe-checks-FwGjwFIr.js";
// src/particle-collision.js
var p = 1e-12;
function m(e) {
	let t = e.reduce((e, t) => e + t.indices.length / 3, 0), n = new Float64Array(t * 9), r = [], i = 0;
	for (let t of e) {
		let e = [
			Infinity,
			Infinity,
			Infinity,
			-Infinity,
			-Infinity,
			-Infinity
		], a = i;
		for (let r = 0; r < t.indices.length; r += 3) {
			let a = i * 9, [o, s, c] = [
				0,
				1,
				2
			].map((e) => t.indices[r + e] * 3);
			for (let r = 0; r < 3; r++) {
				n[a + r] = t.positions[o + r], n[a + 3 + r] = t.positions[s + r] - t.positions[o + r], n[a + 6 + r] = t.positions[c + r] - t.positions[o + r];
				for (let n of [
					o,
					s,
					c
				]) e[r] = Math.min(e[r], t.positions[n + r]), e[3 + r] = Math.max(e[3 + r], t.positions[n + r]);
			}
			i++;
		}
		r.push({
			first: a,
			end: i,
			bounds: e
		});
	}
	return Object.freeze({
		triangles: n,
		groups: r,
		triangleCount: t
	});
}
function h(e, t, n) {
	for (let r = 0; r < 3; r++) if (Math.max(t[r], n[r]) < e[r] || Math.min(t[r], n[r]) > e[3 + r]) return !0;
	return !1;
}
function g(e, t, n, r) {
	let i = n[0] - t[0], a = n[1] - t[1], o = n[2] - t[2], s = !1;
	for (let c of e.groups) if (!h(c.bounds, t, n)) for (let n = c.first; n < c.end; n++) {
		let c = n * 9, l = e.triangles[c + 3], u = e.triangles[c + 4], d = e.triangles[c + 5], f = e.triangles[c + 6], m = e.triangles[c + 7], h = e.triangles[c + 8], g = a * h - o * m, _ = o * f - i * h, v = i * m - a * f, y = l * g + u * _ + d * v;
		if (Math.abs(y) < p) continue;
		let b = t[0] - e.triangles[c], x = t[1] - e.triangles[c + 1], S = t[2] - e.triangles[c + 2], C = (b * g + x * _ + S * v) / y;
		if (C < 0 || C > 1) continue;
		let w = x * d - S * u, T = S * l - b * d, E = b * u - x * l, D = (i * w + a * T + o * E) / y;
		if (D < 0 || C + D > 1) continue;
		let O = (f * w + m * T + h * E) / y;
		if (O < 0 || O > 1 || O >= r.fraction) continue;
		let k = u * h - d * m, A = d * f - l * h, j = l * m - u * f, M = Math.hypot(k, A, j), N = k * i + A * a + j * o > 0 ? -1 : 1;
		r.fraction = O, r.normal[0] = N * k / M, r.normal[1] = N * A / M, r.normal[2] = N * j / M, r.onFloor = !1, s = !0;
	}
	return s;
}
// src/particles.js
var _ = Object.freeze({
	maxSystems: 4,
	maxParticlesPerSystem: 2e3,
	maxParticles: 4e3,
	maxVertices: 1e5,
	maxLifetime: 60,
	landingIterations: 32,
	fieldStepSeconds: 1 / 120,
	maxColliders: 8,
	maxColliderTriangles: 4096
}), v = 1e-6, y = .4, b = 20, x = 1e-4, S = 2654435761;
function C(e, t) {
	let n = (Math.imul(t + 1, S) ^ Math.floor(e)) >>> 0;
	return () => {
		n = n + 1831565813 >>> 0;
		let e = Math.imul(n ^ n >>> 15, n | 1);
		return e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function w(e, t) {
	return e[0] + (e[1] - e[0]) * t;
}
function T(e) {
	let t = Math.hypot(e[0], e[1], e[2]) || 1;
	return [
		e[0] / t,
		e[1] / t,
		e[2] / t
	];
}
function E(e, t) {
	return [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	];
}
function D(e, t, n, r) {
	let i = 1 - n * (1 - Math.cos(t)), a = Math.sqrt(Math.max(0, 1 - i * i)), o = r * Math.PI * 2, s = T(E(e, Math.abs(e[1]) < .99 ? [
		0,
		1,
		0
	] : [
		1,
		0,
		0
	])), c = E(e, s);
	return [
		0,
		1,
		2
	].map((t) => e[t] * i + (s[t] * Math.cos(o) + c[t] * Math.sin(o)) * a);
}
function O(e, t) {
	let [n, r, i] = t;
	if (e.shape === "box") return e.halfExtents.map((e, n) => (t[n] * 2 - 1) * e);
	if (e.shape === "sphere") {
		let t = e.radius * Math.cbrt(n), a = r * 2 - 1, o = Math.sqrt(1 - a * a);
		return [
			t * o * Math.cos(i * Math.PI * 2),
			t * a,
			t * o * Math.sin(i * Math.PI * 2)
		];
	}
	if (e.shape === "disc") {
		let t = e.radius * Math.sqrt(n);
		return [
			t * Math.cos(r * Math.PI * 2),
			0,
			t * Math.sin(r * Math.PI * 2)
		];
	}
	return [
		0,
		0,
		0
	];
}
function k(e) {
	let { count: t, seed: n, emitter: r, lifetime: i, speed: a, direction: o, spreadRadians: s, size: c, rate: l, forces: u } = e, d = e.spin ?? [0, 0], f = T(o), p = new Float64Array(t), m = new Float64Array(t), h = new Float64Array(t * 3), g = new Float64Array(t * 3), _ = new Float64Array(t), v = new Float64Array(t * 3), y = new Float64Array(t), b = new Float64Array(t);
	for (let e = 0; e < t; e++) {
		let t = C(n, e);
		t();
		let o = O(r, [
			t(),
			t(),
			t()
		]), u = D(f, s, t(), t()), x = w(a, t());
		for (let t = 0; t < 3; t++) h[e * 3 + t] = r.position[t] + o[t], g[e * 3 + t] = u[t] * x;
		m[e] = w(i, t()), _[e] = w(c, t()), p[e] = l ? e / l : 0;
		let S = D([
			0,
			1,
			0
		], Math.PI, t(), t());
		v.set(S, e * 3), y[e] = w(d, t()) * Math.PI / 180, b[e] = t() * Math.PI * 2;
	}
	let x = {
		count: t,
		birth: p,
		life: m,
		origin: h,
		velocity: g,
		size: _,
		spinAxis: v,
		spinRate: y,
		spinStart: b,
		hasSpin: d[0] !== 0 || d[1] !== 0,
		landing: new Float64Array(t).fill(Infinity)
	};
	if (u.fields?.length || u.colliders || u.bounce > 0) return x.track = {
		position: Float64Array.from(h),
		velocity: Float64Array.from(g),
		steps: new Int32Array(t),
		resting: new Uint8Array(t),
		spin: Float64Array.from({ length: t * 2 }, (e, t) => t % 2 ? y[t >> 1] : b[t >> 1])
	}, x;
	for (let e = 0; e < t; e++) x.landing[e] = N(x, e, u);
	return x;
}
function A(e, t, n, r, i) {
	if (r < v) return e * i + .5 * t * i * i;
	let a = n + t / r;
	return a * i + (e - a) * (1 - Math.exp(-r * i)) / r;
}
function j(e, t, n, r) {
	return e.origin[t * 3 + 1] + A(e.velocity[t * 3 + 1], n.gravity[1], n.wind[1], n.drag, r);
}
function M(e, t, n, r) {
	if (r < v) {
		let n = t === 0 ? Infinity : -e / t;
		return n > 0 ? n : Infinity;
	}
	let i = n + t / r, a = i / (i - e);
	return a > 0 && a < 1 ? -Math.log(a) / r : Infinity;
}
function N(e, t, n) {
	let r = e.life[t], i = n.floor;
	if (i === void 0 || j(e, t, n, 0) < i) return Infinity;
	let a = M(e.velocity[t * 3 + 1], n.gravity[1], n.wind[1], n.drag), o = r;
	if (j(e, t, n, r) > i) {
		if (!(a < r) || j(e, t, n, a) > i) return Infinity;
		o = a;
	}
	let s = 0;
	for (let r = 0; r < _.landingIterations; r++) {
		let r = (s + o) / 2;
		j(e, t, n, r) > i ? s = r : o = r;
	}
	return o;
}
var P = [
	0,
	0,
	0
], F = [
	0,
	0,
	0
], I = [
	0,
	0,
	0
], L = {
	fraction: Infinity,
	normal: [
		0,
		1,
		0
	],
	onFloor: !1
};
function ee(e, t, n) {
	return L.fraction = Infinity, e.floor !== void 0 && n[1] <= e.floor && (L.fraction = t[1] > e.floor ? (t[1] - e.floor) / (t[1] - n[1]) : 0, L.normal[0] = 0, L.normal[1] = 1, L.normal[2] = 0, L.onFloor = !0), e.colliders && g(e.colliders, t, n, L), L.fraction <= 1;
}
function te(e, t, n, r, i, a, o) {
	for (let e = 0; e < 3; e++) t[e] = r[e] + (i[e] - r[e]) * L.fraction;
	if (L.onFloor && (t[1] = e.floor), !(e.bounce > 0)) return a[1] = 0, !0;
	let s = L.normal, c = n[0] * s[0] + n[1] * s[1] + n[2] * s[2], l = c < 0 ? -c * e.bounce : 0, u = l < y ? 0 : l, d = [
		0,
		0,
		0
	], f = 0;
	for (let e = 0; e < 3; e++) d[e] = n[e] - s[e] * c, f += d[e] * d[e];
	f = Math.sqrt(f);
	let p = Math.abs(Math.min(c, 0)) + u, m = f > 0 ? Math.max(0, 1 - e.friction * p / f) : 0, h = 0;
	for (let e = 0; e < 3; e++) {
		let r = d[e] * m;
		n[e] = r + s[e] * u, t[e] += s[e] * x, h += r * r;
	}
	a[1] *= u > 0 ? 1 - e.friction : Math.max(0, 1 - e.friction * b * o);
	let g = u === 0 && Math.sqrt(h) < y;
	if (g && (a[1] = 0), !g) for (let e = 0; e < 3; e++) t[e] += n[e] * o * (1 - L.fraction);
	return g;
}
function R(e, t, n, r, i, a) {
	r[0] += r[1] * i;
	for (let t = 0; t < 3; t++) I[t] = e.gravity[t] + e.drag * (e.wind[t] - n[t]);
	for (let r of e.fields) o(r, t, n, a, I);
	for (let e = 0; e < 3; e++) n[e] += I[e] * i, P[e] = t[e], F[e] = t[e] + n[e] * i;
	if (ee(e, P, F)) return te(e, t, n, P, F, r, i);
	for (let e = 0; e < 3; e++) t[e] = F[e];
	return !1;
}
function ne(e, t, n, r, i) {
	let a = e.track, o = _.fieldStepSeconds, s = Math.floor(r / o);
	if (a.steps[t] > s) {
		for (let n = 0; n < 3; n++) a.position[t * 3 + n] = e.origin[t * 3 + n], a.velocity[t * 3 + n] = e.velocity[t * 3 + n];
		a.steps[t] = 0, a.resting[t] = 0, a.spin[t * 2] = e.spinStart[t], a.spin[t * 2 + 1] = e.spinRate[t];
	}
	let c = a.position.subarray(t * 3, t * 3 + 3), l = a.velocity.subarray(t * 3, t * 3 + 3), u = a.spin.subarray(t * 2, t * 2 + 2);
	for (; a.steps[t] < s && !a.resting[t];) R(n, c, l, u, o, e.birth[t] + a.steps[t] * o) && (a.resting[t] = 1, e.landing[t] = (a.steps[t] + 1) * o), a.steps[t]++;
	if (a.resting[t]) {
		a.steps[t] = s;
		for (let e = 0; e < 3; e++) i.position[e] = c[e];
		i.angle = u[0];
		return;
	}
	let d = [
		c[0],
		c[1],
		c[2]
	], f = [
		l[0],
		l[1],
		l[2]
	], p = [u[0], u[1]], m = r - s * o;
	m > 1e-9 && R(n, d, f, p, m, e.birth[t] + s * o);
	for (let e = 0; e < 3; e++) i.position[e] = d[e];
	i.angle = p[0];
}
function re(e, t) {
	return e === "shrink" ? 1 - t : e === "grow" ? t : 1;
}
function ie(e, t, n, r, i, a) {
	let o = i - e.birth[t], s = e.life[t];
	if (a.fraction = Math.min(Math.max(o / s, 0), 1), o < 0 || o >= s) {
		a.scale = 0, a.motionAge = 0;
		for (let n = 0; n < 3; n++) a.position[n] = e.origin[t * 3 + n];
		return a;
	}
	if (a.scale = e.size[t] * re(r, o / s), e.track) return ne(e, t, n, o, a), a.motionAge = Math.min(o, e.landing[t]), a;
	let c = e.landing[t], l = Math.min(o, c);
	a.motionAge = l, a.angle = e.hasSpin ? e.spinStart[t] + e.spinRate[t] * l : 0;
	for (let r = 0; r < 3; r++) a.position[r] = e.origin[t * 3 + r] + A(e.velocity[t * 3 + r], n.gravity[r], n.wind[r], n.drag, l);
	return c <= o && (a.position[1] = n.floor), a;
}
function ae(e, t, n) {
	let r = Math.cos(t), i = Math.sin(t), [a, o, s] = e, c = 1 - r;
	n[0] = r + a * a * c, n[1] = a * o * c - s * i, n[2] = a * s * c + o * i, n[3] = o * a * c + s * i, n[4] = r + o * o * c, n[5] = o * s * c - a * i, n[6] = s * a * c - o * i, n[7] = s * o * c + a * i, n[8] = r + s * s * c;
}
function z(e, t, n, r, i, a) {
	for (let o = 0; o < 3; o++) r[i + o] = (e[o * 3] * t[n] + e[o * 3 + 1] * t[n + 1] + e[o * 3 + 2] * t[n + 2]) * a;
}
function oe(e, t, n, r, i, a = {}) {
	let o = e.positions.length / 3, s = e.indices.length, c = new Float32Array(o * t.count * 3), l = new Float32Array(o * t.count * 3), u = new Uint32Array(s * t.count), d = e.uvs ? new Float32Array(o * t.count * 2) : void 0, f = a.color || a.alpha ? new Float32Array(o * t.count * 3) : void 0, p = {
		position: [
			0,
			0,
			0
		],
		scale: 0
	}, m = /* @__PURE__ */ new Float64Array(9), h = [
		1,
		1,
		1
	];
	for (let g = 0; g < t.count; g++) {
		if (ie(t, g, n, r, i, p), t.hasSpin && ae(t.spinAxis.subarray(g * 3, g * 3 + 3), p.angle, m), f) {
			let e = a.alpha ? a.alpha[0] + (a.alpha[1] - a.alpha[0]) * p.fraction : 1;
			for (let t = 0; t < 3; t++) {
				let n = a.color ? a.color[0][t] : 1, r = a.color ? a.color[1][t] : 1;
				h[t] = (n + (r - n) * p.fraction) * e;
			}
		}
		let _ = g * o;
		for (let n = 0; n < o; n++) {
			let r = (_ + n) * 3;
			t.hasSpin && (z(m, e.positions, n * 3, c, r, p.scale), z(m, e.normals, n * 3, l, r, 1));
			for (let i = 0; i < 3; i++) c[r + i] = p.position[i] + (t.hasSpin ? c[r + i] : e.positions[n * 3 + i] * p.scale), f && (f[r + i] = h[i] * (e.colors ? e.colors[n * 3 + i] : 1));
		}
		t.hasSpin || l.set(e.normals, _ * 3), d?.set(e.uvs, _ * 2);
		for (let t = 0; t < s; t++) u[g * s + t] = e.indices[t] + _;
	}
	return {
		...e,
		positions: c,
		normals: l,
		indices: u,
		...d ? { uvs: d } : {},
		...f ? { colors: f } : {}
	};
}
// src/hair.js
var B = Object.freeze({
	maxSegments: 8,
	ringSides: 3,
	taperAtTip: .15
});
function se(e, t, n) {
	let r = [], i = 0;
	for (let t = 0; t < n.length; t += 3) {
		let a = [
			n[t],
			n[t + 1],
			n[t + 2]
		], o = a.map((t) => [
			e[t * 3],
			e[t * 3 + 1],
			e[t * 3 + 2]
		]), s = o[1].map((e, t) => e - o[0][t]), c = o[2].map((e, t) => e - o[0][t]), l = Math.hypot(...E(s, c)) / 2;
		l > 0 && (i += l, r.push({
			vertices: a,
			points: o,
			area: l,
			cumulativeArea: i
		}));
	}
	return {
		triangles: r,
		totalArea: i,
		normals: t
	};
}
function ce(e, t) {
	let n = t * e.totalArea, r = 0, i = e.triangles.length - 1;
	for (; r < i;) {
		let t = r + i >> 1;
		e.triangles[t].cumulativeArea >= n ? i = t : r = t + 1;
	}
	return e.triangles[r];
}
function le(e, t, n, r) {
	let i = se(t, n, r);
	if (!i.triangles.length) throw RangeError("Hair surface has no triangle with area.");
	let a = new Float64Array(e.count * 3), o = new Float64Array(e.count * 3), s = new Float64Array(e.count), c = new Float64Array(e.count);
	for (let t = 0; t < e.count; t++) {
		let r = C(e.seed, t);
		r();
		let l = ce(i, r()), u = r(), d = r();
		u + d > 1 && (u = 1 - u, d = 1 - d);
		let f = [
			1 - u - d,
			u,
			d
		], p = [
			0,
			0,
			0
		];
		for (let e = 0; e < 3; e++) {
			let r = l.vertices[e];
			for (let i = 0; i < 3; i++) a[t * 3 + i] += l.points[e][i] * f[e], p[i] += n[r * 3 + i] * f[e];
		}
		let m = [
			r() * 2 - 1,
			r() * 2 - 1,
			r() * 2 - 1
		].map((t) => t * e.spread), h = T(T(p).map((e, t) => e + m[t]));
		o.set(h, t * 3), s[t] = e.length[0] + (e.length[1] - e.length[0]) * r(), c[t] = r() * Math.PI * 2;
	}
	return {
		count: e.count,
		roots: a,
		directions: o,
		lengths: s,
		phases: c
	};
}
var ue = .02, V = Object.freeze([
	0,
	0,
	0
]);
function de(e, t, n, r) {
	let i = [
		0,
		0,
		0
	], a = [
		e.roots[t * 3],
		e.roots[t * 3 + 1],
		e.roots[t * 3 + 2]
	];
	for (let e of n) o(e, a, V, r, i);
	let s = Math.hypot(...i), c = s > 0 ? Math.min(ue, e.lengths[t] / s) : 0;
	return i.map((e) => e * c);
}
function fe(e, t, n, r) {
	let i = [], a = e.lengths[t] / n.segments, o = [
		e.directions[t * 3],
		e.directions[t * 3 + 1],
		e.directions[t * 3 + 2]
	], s = [
		e.roots[t * 3],
		e.roots[t * 3 + 1],
		e.roots[t * 3 + 2]
	], c = n.sway ? n.sway.amplitude * Math.sin(Math.PI * 2 * n.sway.rate * r + e.phases[t]) : 0, l = n.fields?.length ? de(e, t, n.fields, r) : V;
	for (let e = 0; e <= n.segments; e++) {
		let t = e / n.segments, r = n.sway?.direction ?? [
			0,
			0,
			0
		];
		i.push({
			center: s.map((e, n) => e + (r[n] * c + l[n]) * t * t),
			direction: o
		}), o = T([
			o[0],
			o[1] - n.droop / n.segments,
			o[2]
		]), s = s.map((e, t) => e + o[t] * a);
	}
	return i;
}
function H(e, t, n) {
	let r = t.segments + 1, i = B.ringSides, a = r * i, o = new Float32Array(e.count * a * 3), s = new Float32Array(o.length), c = new Uint32Array(e.count * t.segments * i * 6), l = 0;
	for (let r = 0; r < e.count; r++) {
		fe(e, r, t, n).forEach(({ center: e, direction: n }, c) => {
			let l = T(E(n, Math.abs(n[1]) < .99 ? [
				0,
				1,
				0
			] : [
				1,
				0,
				0
			])), u = E(n, l), d = t.width / 2 * (1 - (1 - B.taperAtTip) * c / t.segments);
			for (let t = 0; t < i; t++) {
				let n = t / i * Math.PI * 2, f = (r * a + c * i + t) * 3;
				for (let t = 0; t < 3; t++) {
					let r = l[t] * Math.cos(n) + u[t] * Math.sin(n);
					o[f + t] = e[t] + r * d, s[f + t] = r;
				}
			}
		});
		for (let e = 0; e < t.segments; e++) for (let t = 0; t < i; t++) {
			let n = (t + 1) % i, o = r * a + e * i, s = [
				o + t,
				o + n,
				o + i + t,
				o + i + n
			];
			c.set([
				s[0],
				s[1],
				s[2],
				s[1],
				s[3],
				s[2]
			], l), l += 6;
		}
	}
	return {
		positions: o,
		normals: s,
		indices: c
	};
}
// src/agent-particles.js
var pe = [
	"gravity",
	"wind",
	"fields",
	"systems"
], U = ["emitter", "hair"], me = [
	"type",
	"node",
	"seed",
	"count",
	"rate",
	"lifetime",
	"speed",
	"direction",
	"spread",
	"emitter",
	"size",
	"scale",
	"drag",
	"floor",
	"bounce",
	"friction",
	"colliders",
	"spin",
	"color",
	"alpha"
], he = [
	"type",
	"node",
	"surface",
	"seed",
	"count",
	"length",
	"segments",
	"width",
	"droop",
	"lean",
	"sway",
	"swayRate"
], ge = [
	"shape",
	"position",
	"halfExtents",
	"radius"
], W = [
	"point",
	"box",
	"sphere",
	"disc"
], G = [
	"constant",
	"shrink",
	"grow"
], _e = Object.freeze([
	0,
	-9.81,
	0
]), ve = .3, ye = .5, K = 1e4, q = 4294967295;
function J(e, t, n, r) {
	if (typeof e == "number") return [d(e, t, n, r), e];
	if (!Array.isArray(e) || e.length !== 2) throw TypeError(`${t} must be a number or [minimum, maximum].`);
	let i = e.map((e) => d(e, t, n, r));
	if (i[0] > i[1]) throw RangeError(`${t} minimum must not exceed its maximum.`);
	return i;
}
function be(e) {
	c(e, ge, "particle emitter");
	let t = e.shape ?? "point";
	if (!W.includes(t)) throw RangeError(`Particle emitter shape must be one of ${W.join(", ")}.`);
	return {
		shape: t,
		position: e.position === void 0 ? [
			0,
			0,
			0
		] : u(e.position, "Particle emitter position", K),
		halfExtents: e.halfExtents === void 0 ? [
			.5,
			.5,
			.5
		] : u(e.halfExtents, "Particle emitter halfExtents", K).map(Math.abs),
		radius: e.radius === void 0 ? .5 : d(e.radius, "Particle emitter radius", 0, K)
	};
}
function Y(e) {
	let t = e.count ?? 100;
	if (!Number.isInteger(t) || t < 1 || t > _.maxParticlesPerSystem) throw RangeError(`Particle count must be an integer from 1 to ${_.maxParticlesPerSystem}.`);
	return t;
}
function X(e) {
	let t = e.seed ?? 1;
	if (!Number.isInteger(t) || t < 0 || t > q) throw RangeError(`Particle seed must be an integer from 0 to ${q}.`);
	return t;
}
function xe(e) {
	if (!Array.isArray(e) || e.length !== 2) throw TypeError("Particle color must be [start, end], each [r, g, b] from 0 to 1.");
	return e.map((e) => u(e, "Particle color", 1e3).map((e) => d(e, "Particle color", 0, 1e3)));
}
function Se(e) {
	if (typeof e == "number") return [d(e, "Particle alpha", 0, 1), e];
	if (!Array.isArray(e) || e.length !== 2) throw TypeError("Particle alpha must be a number or [start, end] from 0 to 1.");
	return e.map((e) => d(e, "Particle alpha", 0, 1));
}
function Ce(e, t) {
	let n = l(e, _.maxColliders, "Particle colliders");
	for (let e of n) s(e, t.recipeNodes, /* @__PURE__ */ new Set(), t.motionNodeIds, t.physicsNodeIds, "Particle collider", "particles");
	return n;
}
function we(e, t) {
	c(e, me, "particle system"), s(e.node, t.recipeNodes, t.claimedNodes, t.motionNodeIds, t.physicsNodeIds, "Particle system", "particles");
	let n = {
		type: "emitter",
		node: e.node,
		seed: X(e),
		count: Y(e),
		lifetime: J(e.lifetime ?? 1, "Particle lifetime", .01, _.maxLifetime),
		speed: J(e.speed ?? 1, "Particle speed", 0, 1e3),
		size: J(e.size ?? .05, "Particle size", 1e-4, 100),
		direction: e.direction === void 0 ? [
			0,
			1,
			0
		] : u(e.direction, "Particle direction", 1e3),
		spread: e.spread === void 0 ? 30 : d(e.spread, "Particle spread", 0, 180),
		emitter: be(e.emitter ?? {}),
		scale: e.scale ?? "constant",
		drag: e.drag === void 0 ? 0 : d(e.drag, "Particle drag", 0, 100)
	};
	if (Math.hypot(...n.direction) === 0) throw RangeError("Particle direction must not be the zero vector.");
	if (!G.includes(n.scale)) throw RangeError(`Particle scale must be one of ${G.join(", ")}.`);
	if (e.rate !== void 0 && (n.rate = d(e.rate, "Particle rate", .01, _.maxParticlesPerSystem * 100)), e.bounce !== void 0 && (n.bounce = d(e.bounce, "Particle bounce", 0, 1)), e.friction !== void 0 && (n.friction = d(e.friction, "Particle friction", 0, 1)), e.spin !== void 0 && (n.spin = J(e.spin, "Particle spin", -1e5, 1e5)), e.color !== void 0 && (n.color = xe(e.color)), e.alpha !== void 0 && (n.alpha = Se(e.alpha)), e.colliders !== void 0 && (n.colliders = Ce(e.colliders, t), n.colliders.includes(n.node))) throw RangeError("A particle system node cannot be its own collider.");
	return e.floor !== void 0 && (n.floor = d(e.floor, "Particle floor", -1e4, K)), n;
}
function Te(e, t) {
	if (c(e, he, "hair system"), s(e.node, t.recipeNodes, t.claimedNodes, t.motionNodeIds, t.physicsNodeIds, "Hair system", "particles"), s(e.surface, t.recipeNodes, /* @__PURE__ */ new Set(), t.motionNodeIds, t.physicsNodeIds, "Hair surface", "particles"), e.surface === e.node) throw RangeError("Hair surface and hair node must be different nodes.");
	let n = e.segments ?? 4;
	if (!Number.isInteger(n) || n < 1 || n > B.maxSegments) throw RangeError(`Hair segments must be an integer from 1 to ${B.maxSegments}.`);
	let r = {
		type: "hair",
		node: e.node,
		surface: e.surface,
		seed: X(e),
		count: Y(e),
		segments: n,
		length: J(e.length ?? .1, "Hair length", .001, 100),
		width: d(e.width ?? .004, "Hair width", 1e-4, 10),
		droop: d(e.droop ?? .5, "Hair droop", 0, 10),
		lean: d(e.lean ?? .2, "Hair lean", 0, 2)
	};
	return e.sway !== void 0 && (r.sway = d(e.sway, "Hair sway", 0, 10), r.swayRate = d(e.swayRate ?? .5, "Hair swayRate", .01, 20)), r;
}
function Ee(e, t) {
	let n = e?.type ?? "emitter";
	if (!U.includes(n)) throw RangeError(`Particle system type must be one of ${U.join(", ")}.`);
	return n === "hair" ? Te(e, t) : we(e, t);
}
function De(e, t) {
	if (e == null) return null;
	c(e, pe, "particles");
	let n = f(t, ["cloth"]), r = {};
	if (r.systems = l(e.systems, _.maxSystems, "Particle systems").map((e) => Ee(e, n)), !r.systems.length) throw RangeError("Particles need at least one system. Use null to clear it.");
	let i = new Set(r.systems.map((e) => e.node));
	for (let e of r.systems) {
		let t = e.colliders?.find((e) => i.has(e));
		if (t) throw RangeError(`Particle collider ${t} is a particle system node; its own geometry is replaced by particles.`);
	}
	let o = r.systems.reduce((e, t) => e + t.count, 0);
	if (o > _.maxParticles) throw RangeError(`Particle systems hold ${o} particles; the limit is ${_.maxParticles} in total.`);
	return e.gravity !== void 0 && (r.gravity = u(e.gravity, "Particle gravity", 1e3)), e.wind !== void 0 && (r.wind = u(e.wind, "Particle wind", 100)), e.fields !== void 0 && (r.fields = a(e.fields, "Particle force field")), r;
}
function Z(e) {
	return r(n(), e.rotation, e.translation, e.scale);
}
function Oe(e, t) {
	let r = i(n(), t), a = new Float32Array(e.positions.length), o = new Float32Array(e.normals.length);
	for (let n = 0; n < a.length; n += 3) {
		let i = e.positions[n], s = e.positions[n + 1], c = e.positions[n + 2];
		for (let l = 0; l < 3; l++) a[n + l] = r[l] * i + r[4 + l] * s + r[8 + l] * c + r[12 + l], o[n + l] = t[l * 4] * e.normals[n] + t[l * 4 + 1] * e.normals[n + 1] + t[l * 4 + 2] * e.normals[n + 2];
		let l = Math.hypot(o[n], o[n + 1], o[n + 2]) || 1;
		for (let e = 0; e < 3; e++) o[n + e] /= l;
	}
	return Object.freeze({
		...e,
		positions: a,
		normals: o
	});
}
function Q(e) {
	let t = [];
	for (let n = 0; n < e.count; n++) t.push([e.birth[n], 1], [e.birth[n] + e.life[n], -1]);
	t.sort((e, t) => e[0] - t[0] || e[1] - t[1]);
	let n = 0, r = 0;
	for (let [, e] of t) n += e, r = Math.max(r, n);
	return {
		maxAlive: r,
		endsAt: Number(t.at(-1)[0].toFixed(4))
	};
}
function $(n, r) {
	let i = new Float64Array(n.positions.length), a = new Float64Array(n.normals.length), o = e(t(), r);
	for (let e = 0; e < i.length; e += 3) for (let t = 0; t < 3; t++) i[e + t] = r[t] * n.positions[e] + r[4 + t] * n.positions[e + 1] + r[8 + t] * n.positions[e + 2] + r[12 + t], a[e + t] = o[t] * n.normals[e] + o[3 + t] * n.normals[e + 1] + o[6 + t] * n.normals[e + 2];
	return {
		positions: i,
		normals: a
	};
}
function ke(e, t, n) {
	if (e > _.maxVertices || t > _.maxVertices) throw RangeError(`Particle node ${n} would draw ${t} vertices (shape vertices times count); the limit is ${_.maxVertices}. Use a shape with fewer segments or a lower count.`);
}
function Ae(e) {
	let t = Math.hypot(e[0], e[2]);
	return t > 1e-6 ? [
		e[0] / t,
		0,
		e[2] / t
	] : [
		1,
		0,
		0
	];
}
function je(e, t, n) {
	if (!e.colliders) return;
	let r = m(e.colliders.map((e) => {
		let r = t.get(e), i = n.get(r.geometry);
		return {
			positions: $(i, Z(r)).positions,
			indices: i.indices
		};
	}));
	if (r.triangleCount > _.maxColliderTriangles) throw RangeError(`Particle colliders of ${e.node} hold ${r.triangleCount} triangles; the limit is ${_.maxColliderTriangles}.`);
	return r;
}
function Me(e, t, n, r, i) {
	let a = {
		...r,
		drag: e.drag,
		floor: e.floor,
		bounce: e.bounce ?? (i ? ve : 0),
		friction: e.friction ?? ye,
		colliders: i
	}, o = k({
		...e,
		spreadRadians: e.spread * Math.PI / 180,
		forces: a
	});
	return {
		node: t,
		report: () => ({
			node: e.node,
			type: "emitter",
			particles: e.count,
			verticesPerParticle: n.positions.length / 3,
			...Q(o)
		}),
		build: (t) => oe(n, o, a, e.scale, t, e)
	};
}
function Ne(e, t, n, r, i) {
	let a = $(r, Z(n)), o = le({
		...e,
		spread: e.lean
	}, a.positions, a.normals, r.indices), s = {
		segments: e.segments,
		width: e.width,
		droop: e.droop,
		fields: i.fields,
		sway: e.sway ? {
			amplitude: e.sway,
			rate: e.swayRate,
			direction: Ae(i.wind)
		} : void 0
	}, c = (e.segments + 1) * B.ringSides, l = null;
	return {
		node: t,
		report: () => ({
			node: e.node,
			type: "hair",
			surface: e.surface,
			strands: e.count,
			segments: e.segments,
			verticesPerStrand: c
		}),
		build: (e) => s.sway || s.fields.some((e) => e.type === "turbulence") ? H(o, s, e) : (l ??= H(o, s, 0), l)
	};
}
function Pe(e, t, n) {
	let r = new Map(t.nodes.map((e) => [e.id, e])), i = {
		gravity: e.gravity ?? _e,
		wind: e.wind ?? [
			0,
			0,
			0
		],
		fields: e.fields ?? []
	}, a = 0, o = e.systems.map((e) => {
		let t = r.get(e.node), o = e.type === "hair" ? (e.segments + 1) * B.ringSides : n.get(t.geometry).positions.length / 3;
		if (a += o * e.count, ke(o * e.count, a, e.node), e.type === "hair") {
			let a = r.get(e.surface);
			return Ne(e, t, a, n.get(a.geometry), i);
		}
		return Me(e, t, n.get(t.geometry), i, je(e, r, n));
	});
	return Object.freeze({
		sample(e) {
			return new Map(o.map(({ node: t, build: n }) => [t.id, Oe(n(e), Z(t))]));
		},
		report() {
			return {
				gravity: [...i.gravity],
				wind: [...i.wind],
				fields: i.fields.map((e) => ({ ...e })),
				vertices: a,
				systems: o.map((e) => e.report())
			};
		}
	});
}
export { Pe as bakeAgentParticles, De as normalizeAgentParticles };
