/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/cloth.js
var e = Object.freeze({
	maxParticles: 5e3,
	maxFrameParticles: 3e6,
	maxWork: 15e7,
	substeps: 4,
	iterations: 8
}), t = 1.2, n = 5, r = Object.freeze([
	0,
	-9.81,
	0
]);
function i(e, t) {
	let r = /* @__PURE__ */ new Map(), i = new Uint32Array(e.length / 3), a = [];
	for (let t = 0; t < i.length; t++) {
		let o = t * 3, s = `${e[o].toFixed(n)},${e[o + 1].toFixed(n)},${e[o + 2].toFixed(n)}`, c = r.get(s);
		c === void 0 && (c = a.length, r.set(s, c), a.push(t)), i[t] = c;
	}
	let o = [];
	for (let e = 0; e < t.length; e += 3) {
		let n = i[t[e]], r = i[t[e + 1]], a = i[t[e + 2]];
		n !== r && r !== a && n !== a && o.push(n, r, a);
	}
	return {
		particleOfVertex: i,
		representatives: a,
		triangles: Uint32Array.from(o)
	};
}
function a(e, t, n) {
	return e < t ? e * n + t : t * n + e;
}
function o(e, t, n, r, i) {
	let o = /* @__PURE__ */ new Map();
	for (let e = 0; e < t.length; e += 3) for (let r = 0; r < 3; r++) {
		let i = t[e + r], s = t[e + (r + 1) % 3], c = t[e + (r + 2) % 3], l = a(i, s, n), u = o.get(l) ?? {
			first: Math.min(i, s),
			second: Math.max(i, s),
			opposites: []
		};
		u.opposites.push(c), o.set(l, u);
	}
	let s = [], c = [], l = [], u = (e, t, n) => {
		s.push(e), c.push(t), l.push(n);
	}, d = [...o.entries()].sort((e, t) => e[0] - t[0]);
	for (let [, e] of d) u(e.first, e.second, i);
	let f = s.length, p = new Int32Array(f).fill(-1);
	r > 0 && d.forEach(([, e], t) => {
		e.opposites.length === 2 && e.opposites[0] !== e.opposites[1] && (p[t] = s.length, u(e.opposites[0], e.opposites[1], r));
	});
	let m = new Float64Array(s.length);
	for (let t = 0; t < s.length; t++) {
		let n = s[t] * 3, r = c[t] * 3;
		m[t] = Math.hypot(e[n] - e[r], e[n + 1] - e[r + 1], e[n + 2] - e[r + 2]);
	}
	return {
		count: s.length,
		stretchCount: f,
		bendOfEdge: p,
		firsts: Uint32Array.from(s),
		seconds: Uint32Array.from(c),
		stiffnesses: Float64Array.from(l),
		restLengths: m
	};
}
function s(e, t, n) {
	let r = new Float64Array(n);
	for (let n = 0; n < t.length; n += 3) {
		let i = c(e, t[n], t[n + 1], t[n + 2], [
			0,
			0,
			0
		]) / 2;
		for (let e = 0; e < 3; e++) r[t[n + e]] += i / 3;
	}
	return r;
}
function c(e, t, n, r, i) {
	let a = t * 3, o = n * 3, s = r * 3, c = [
		e[o] - e[a],
		e[o + 1] - e[a + 1],
		e[o + 2] - e[a + 2]
	], l = [
		e[s] - e[a],
		e[s + 1] - e[a + 1],
		e[s + 2] - e[a + 2]
	], u = c[1] * l[2] - c[2] * l[1], d = c[2] * l[0] - c[0] * l[2], f = c[0] * l[1] - c[1] * l[0], p = Math.sqrt(u * u + d * d + f * f);
	return p > 0 && (i[0] = u / p, i[1] = d / p, i[2] = f / p), p;
}
function l(e, n, r, i, a, o) {
	let { positions: s, velocities: l, particleCount: u } = e, d = e.windScratch;
	d.fill(0);
	let f = [
		0,
		0,
		0
	];
	for (let e = 0; e < i.length; e += 3) {
		let r = i[e], a = i[e + 1], o = i[e + 2], u = c(s, r, a, o, f);
		if (u === 0) continue;
		let p = 0;
		for (let e = 0; e < 3; e++) {
			let t = (l[r * 3 + e] + l[a * 3 + e] + l[o * 3 + e]) / 3;
			p += (n[e] - t) * f[e];
		}
		let m = .5 * t * p * Math.abs(p) * u / 2 / 3;
		for (let e of [
			r,
			a,
			o
		]) for (let t = 0; t < 3; t++) d[e * 3 + t] += m * f[t];
	}
	for (let e = 0; e < u; e++) {
		let t = Math.max(r[e], 1e-9) * o;
		for (let n = 0; n < 3; n++) l[e * 3 + n] += d[e * 3 + n] / t * a;
	}
}
function u(e, t, n, r, i) {
	let { count: a, firsts: o, seconds: s, stiffnesses: c, restLengths: l } = n;
	for (let n = 0; n < a; n++) {
		if (c[n] === 0) continue;
		let a = o[n], u = s[n], d = t[a] + t[u];
		if (d === 0) continue;
		let f = a * 3, p = u * 3, m = e[p] - e[f], h = e[p + 1] - e[f + 1], g = e[p + 2] - e[f + 2], _ = Math.sqrt(m * m + h * h + g * g);
		if (_ < 1e-12) continue;
		let v = c[n] * (_ - l[n]) / d, y = v / _;
		r[n] += v, t[a] === 0 && (i[f] += m * y, i[f + 1] += h * y, i[f + 2] += g * y), t[u] === 0 && (i[p] -= m * y, i[p + 1] -= h * y, i[p + 2] -= g * y), e[f] += m * y * t[a], e[f + 1] += h * y * t[a], e[f + 2] += g * y * t[a], e[p] -= m * y * t[u], e[p + 1] -= h * y * t[u], e[p + 2] -= g * y * t[u];
	}
}
function d(e, t, n, r) {
	let i = e[0] - t.center[0], a = e[1] - t.center[1], o = e[2] - t.center[2], s = Math.sqrt(i * i + a * a + o * o), c = t.radius + n;
	if (s >= c) return !1;
	s > 1e-12 ? (r[0] = i / s, r[1] = a / s, r[2] = o / s) : (r[0] = 0, r[1] = 1, r[2] = 0);
	for (let n = 0; n < 3; n++) e[n] = t.center[n] + r[n] * c;
	return !0;
}
var f = {
	center: [
		0,
		0,
		0
	],
	radius: 0
};
function p(e, t, n, r) {
	let { start: i, end: a } = t, o = a[0] - i[0], s = a[1] - i[1], c = a[2] - i[2], l = o * o + s * s + c * c, u = (e[0] - i[0]) * o + (e[1] - i[1]) * s + (e[2] - i[2]) * c, p = l > 0 ? Math.min(Math.max(u / l, 0), 1) : 0, m = i[0] + o * p, h = i[1] + s * p, g = i[2] + c * p, _ = t.radius + n, v = e[0] - m, y = e[1] - h, b = e[2] - g;
	return v * v + y * y + b * b >= _ * _ ? !1 : (f.center[0] = m, f.center[1] = h, f.center[2] = g, f.radius = t.radius, d(e, f, n, r));
}
function m(e, t, n, r) {
	let { center: i, axes: a, halfExtents: o } = t, s = [
		e[0] - i[0],
		e[1] - i[1],
		e[2] - i[2]
	], c = a.map((e) => s[0] * e[0] + s[1] * e[1] + s[2] * e[2]), l = c.map((e, t) => Math.min(Math.max(e, -o[t]), o[t])), u = c.map((e, t) => e - l[t]), d = Math.hypot(...u), f = [...c], p = [
		0,
		0,
		0
	];
	if (d > 1e-12) {
		if (d >= n) return !1;
		for (let e = 0; e < 3; e++) p[e] = u[e] / d, f[e] = l[e] + p[e] * n;
	} else {
		let e = 0;
		for (let t = 1; t < 3; t++) o[t] - Math.abs(c[t]) < o[e] - Math.abs(c[e]) && (e = t);
		let t = c[e] >= 0 ? 1 : -1;
		p[e] = t, f[e] = t * (o[e] + n);
	}
	for (let t = 0; t < 3; t++) {
		r[t] = 0, e[t] = i[t];
		for (let n = 0; n < 3; n++) r[t] += a[n][t] * p[n], e[t] += a[n][t] * f[n];
	}
	return !0;
}
var h = {
	ball: d,
	capsule: p,
	box: m
};
function g(e, t, n, r, i) {
	let { positions: a, inverseMasses: o, particleCount: s } = e, c = [
		0,
		0,
		0
	], l = [
		0,
		0,
		0
	];
	for (let e = 0; e < s; e++) {
		if (o[e] === 0) continue;
		let s = e * 3;
		c[0] = a[s], c[1] = a[s + 1], c[2] = a[s + 2];
		for (let e of n) {
			if (!h[e.kind](c, e, r, l)) continue;
			let n = [
				c[0] - t[s],
				c[1] - t[s + 1],
				c[2] - t[s + 2]
			], a = n[0] * l[0] + n[1] * l[1] + n[2] * l[2];
			for (let e = 0; e < 3; e++) c[e] -= (n[e] - a * l[e]) * i;
		}
		a[s] = c[0], a[s + 1] = c[1], a[s + 2] = c[2];
	}
}
var _ = 7;
function v(e, t, n) {
	let r = [];
	for (let i = 0; i < n; i++) {
		let n = t + i * _;
		r.push({
			kind: "capsule",
			start: e.subarray(n, n + 3),
			end: e.subarray(n + 3, n + 6),
			radius: e[n + 6]
		});
	}
	return r;
}
function y(e, t, n, r) {
	let { anchorParticles: i, anchorWeights: a } = t;
	for (let t = 0; t < i.length; t++) {
		let o = a[t];
		if (!(r && o >= 1)) for (let r = 0; r < 3; r++) {
			let a = i[t] * 3 + r;
			e[a] += (n[t * 3 + r] - e[a]) * o;
		}
	}
}
function b(t, n, r, i, a) {
	let o = a * e.substeps * (e.iterations * n + r + t * (i + 1));
	if (t > e.maxParticles) throw RangeError(`Cloth has ${t} particles; the limit is ${e.maxParticles}. Use a coarser grid.`);
	if (t * a > e.maxFrameParticles) throw RangeError(`Cloth would record ${t * a} particle positions; the limit is ${e.maxFrameParticles}. Use a shorter duration or a coarser grid.`);
	if (o > e.maxWork) throw RangeError(`Cloth needs ${Math.round(o)} solver operations; the limit is ${e.maxWork}. Use a shorter duration or a coarser grid.`);
}
function x(e, t) {
	let { inverseMasses: n, pinned: r, trackFixed: i, extraMasses: a, baseMass: o } = e;
	n[t] = r[t] || i[t] ? 0 : o / (o + a[t]);
}
function S(e, t) {
	let { constraints: n, broken: r } = e;
	if (n.stiffnesses[t] === 0) return;
	let i = n.bendOfEdge[t];
	for (let [e, a] of [[t, "stretch"], [i, "bend"]]) e < 0 || n.stiffnesses[e] === 0 || (n.stiffnesses[e] = 0, r.push(Object.freeze({
		constraint: e,
		first: n.firsts[e],
		second: n.seconds[e],
		kind: a
	})));
}
function C(e, t) {
	let { constraints: n, positions: r, tearStretch: i, tearForce: a, baseMass: o, impulses: s } = e, { firsts: c, seconds: l, stiffnesses: u, restLengths: d, stretchCount: f } = n, p = o / (t * t);
	for (let t = 0; t < f; t++) {
		if (u[t] === 0) continue;
		let n = c[t] * 3, o = l[t] * 3;
		(Math.hypot(r[o] - r[n], r[o + 1] - r[n + 1], r[o + 2] - r[n + 2]) > d[t] * i || s[t] * p > a) && S(e, t);
	}
}
function w(t, n, i = {}) {
	let a = t.length / 3, c = i.colliders ?? [], d = i.moving ?? null;
	for (let e of c) if (!Object.hasOwn(h, e?.kind ?? "")) throw TypeError(`Cloth collider kind must be one of ${Object.keys(h).join(", ")}.`);
	for (let e of i.pinned ?? []) if (!Number.isInteger(e) || e < 0 || e >= a) throw RangeError(`Cloth pinned particle ${e} does not exist; there are ${a}.`);
	let f = o(t, n, a, i.bend ?? .1, i.stiffness ?? .9);
	b(a, f.count, n.length / 3, c.length + (d?.colliderCount ?? 0), i.frameCount ?? 1);
	let p = i.density ?? .2, m = s(t, n, a), w = m.reduce((e, t) => e + t, 0), T = {
		constraints: f,
		baseMass: Math.max(w * p / a, 1e-9),
		inverseMasses: new Float64Array(a).fill(1),
		extraMasses: new Float64Array(a),
		pinned: new Uint8Array(a),
		trackFixed: new Uint8Array(a),
		pinTargets: Float64Array.from(t),
		pinForces: new Float64Array(t.length),
		impulses: new Float64Array(f.count),
		broken: [],
		positions: Float64Array.from(t),
		tearStretch: i.tearStretch ?? Infinity,
		tearForce: i.tearForce ?? Infinity
	};
	for (let e of i.pinned ?? []) T.pinned[e] = 1;
	d?.anchorParticles.forEach((e, t) => {
		d.anchorWeights[t] >= 1 && (T.trackFixed[e] = 1);
	});
	for (let e = 0; e < a; e++) x(T, e);
	let E = {
		particleCount: a,
		inverseMasses: T.inverseMasses,
		positions: T.positions,
		velocities: new Float64Array(t.length),
		windScratch: new Float64Array(t.length)
	}, D = i.gravity ?? r, O = i.damping ?? .3, k = i.friction ?? .3, A = i.thickness ?? .01, j = new Float64Array(t.length), M = new Float64Array(t.length), N = new Float64Array(t.length), P = Float32Array.from(t), F = (d?.anchorParticles.length ?? 0) * 3, I = (d?.colliderCount ?? 0) * _, L = 0;
	function R(r, o = {}) {
		let s = o.wind ?? i.wind ?? [
			0,
			0,
			0
		], h = s.some((e) => e !== 0), _ = o.colliders ?? c, b = e.substeps, x = r / b, S = Math.exp(-O * x), w = T.tearStretch !== Infinity || T.tearForce !== Infinity, { inverseMasses: R, pinned: z, pinTargets: B } = T;
		M.set(E.positions), N.fill(0);
		for (let r = 0; r < b; r++) {
			h && l(E, s, m, n, x, p), i.applyFields?.(E.positions, E.velocities, L * x, x), j.set(E.positions);
			let o = _, c = null;
			d && (c = d.anchorTrack.subarray(L * F, (L + 1) * F), o = _.concat(v(d.colliderTrack, L * I, d.colliderCount)), y(E.positions, d, c, !1));
			let O = (r + 1) / b;
			for (let e = 0; e < a; e++) {
				if (z[e]) for (let t = 0; t < 3; t++) {
					let n = e * 3 + t;
					E.positions[n] = M[n] + (B[n] - M[n]) * O;
				}
				if (R[e] !== 0) for (let t = 0; t < 3; t++) {
					let n = e * 3 + t;
					E.velocities[n] += D[t] * x, E.positions[n] += E.velocities[n] * x;
				}
			}
			for (let t = 0; t < e.iterations; t++) u(E.positions, R, f, T.impulses, N), d && y(E.positions, d, c, !0), g(E, j, o, A, k);
			w && C(T, x), T.impulses.fill(0);
			for (let e = 0; e < t.length; e++) E.velocities[e] = (E.positions[e] - j[e]) / x * S;
			L++;
		}
		if (!E.positions.every(Number.isFinite)) throw RangeError("Cloth became unstable (non-finite positions). Lower the wind, raise density or use a finer grid.");
		let V = T.baseMass / (b * x * x);
		for (let e = 0; e < t.length; e++) T.pinForces[e] = N[e] * V;
		P.set(E.positions);
	}
	function z(e) {
		if (!Number.isInteger(e) || e < 0 || e >= a) throw RangeError(`Cloth particle ${e} does not exist; there are ${a}.`);
	}
	return {
		positions: P,
		particleCount: a,
		constraintCount: f.count,
		particleMass: T.baseMass,
		broken: T.broken,
		step: R,
		pin(e, t) {
			z(e);
			let n = t ?? [
				E.positions[e * 3],
				E.positions[e * 3 + 1],
				E.positions[e * 3 + 2]
			];
			T.pinTargets[e * 3] = n[0], T.pinTargets[e * 3 + 1] = n[1], T.pinTargets[e * 3 + 2] = n[2], T.pinned[e] = 1, x(T, e);
		},
		unpin(e) {
			z(e), T.pinned[e] = 0, x(T, e);
		},
		isPinned(e) {
			return z(e), T.pinned[e] === 1;
		},
		pinForce(e, t = [
			0,
			0,
			0
		]) {
			return z(e), t[0] = T.pinForces[e * 3], t[1] = T.pinForces[e * 3 + 1], t[2] = T.pinForces[e * 3 + 2], t;
		},
		setExtraMass(e, t) {
			z(e), T.extraMasses[e] = Math.max(t, 0), x(T, e);
		},
		breakConstraint(e) {
			if (!Number.isInteger(e) || e < 0 || e >= f.stretchCount) throw RangeError(`Cloth stretch constraint ${e} does not exist; there are ${f.stretchCount}.`);
			S(T, e);
		}
	};
}
function T(e, t, n) {
	let r = w(e, t, n), i = n.framesPerSecond ?? 60, a = new Float32Array(n.frameCount * e.length);
	a.set(Float32Array.from(e), 0);
	for (let t = 1; t < n.frameCount; t++) r.step(1 / i), a.set(r.positions, t * e.length);
	return Object.freeze({
		particleCount: r.particleCount,
		frameCount: n.frameCount,
		framesPerSecond: i,
		frames: a,
		constraintCount: r.constraintCount
	});
}
function E(e, t, n) {
	let r = e.particleCount * 3, i = Math.min(Math.max(t * e.framesPerSecond, 0), e.frameCount - 1), a = Math.floor(i), o = Math.min(a + 1, e.frameCount - 1), s = i - a;
	for (let t = 0; t < r; t++) {
		let i = e.frames[a * r + t], c = e.frames[o * r + t];
		n[t] = i + (c - i) * s;
	}
	return n;
}
export { e as CLOTH_LIMITS, T as bakeCloth, w as createCloth, E as sampleClothFrames, i as weldVertices };
