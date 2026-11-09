/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e } from "./camera-DqWdI22s.js";
import { n as t } from "./ray-query-CWJhfYYD.js";
import { r as n } from "./light-profile-BGXnJOGo.js";
import { i as r, n as i } from "./path-tracer-scene-DTz5cgiX.js";
import { t as a } from "./path-tracer-denoise-j_ATlMbO.js";
import { acesChannel as o, displayColor as s } from "./view-transform.js";
import { n as c } from "./view-transform-names-CDWKtFlr.js";
import { _ as l, a as u, c as d, d as f, f as p, g as m, h, i as g, l as _, m as v, n as y, o as b, p as x, s as S, t as C, u as w } from "./path-tracer-subsurface-Dyu5_MBA.js";
import { i as T, n as E, r as D } from "./path-tracer-light-tree-BZYzVWXO.js";
import { i as O, r as k, t as A } from "./path-tracer-volume-CWKqVztb.js";
// src/path-tracer.js
var j = Object.freeze({
	width: Object.freeze({
		minimum: 16,
		maximum: 4096,
		fallback: 960
	}),
	height: Object.freeze({
		minimum: 16,
		maximum: 4096,
		fallback: 540
	}),
	samples: Object.freeze({
		minimum: 1,
		maximum: 1024,
		fallback: 64
	}),
	bounces: Object.freeze({
		minimum: 1,
		maximum: 16,
		fallback: 8
	}),
	maxSeconds: Object.freeze({
		minimum: 1,
		maximum: 1800,
		fallback: 300
	}),
	fireflyClamp: Object.freeze({
		minimum: 1,
		maximum: 1e3,
		fallback: 20
	}),
	noiseThreshold: Object.freeze({
		minimum: 0,
		maximum: 1,
		fallback: 0
	}),
	seed: Object.freeze({
		minimum: 0,
		maximum: 2 ** 31 - 1,
		fallback: 0
	}),
	threads: Object.freeze({
		minimum: 1,
		maximum: 8,
		fallback: 4
	})
}), M = 2073600, N = 4e9, P = 64, F = 8, I = "./path-tracer-worker.js", ee = 3, L = 16, R = 8, z = .05, te = ["occlusionMap"], B = [
	["anisotropy", (e) => e.anisotropy > 0],
	["iridescence", (e) => e.iridescence > 0],
	["sheen", (e) => (e.sheenColor ?? []).some((e) => e !== 0)],
	["moss", (e) => e.moss > 0],
	["splat layers", (e) => !!(e.layers || Object.keys(e.layerMaps ?? {}).some((e) => e !== "clearcoatTexture"))],
	["lightMap", (e) => !!e.lightMap]
];
function V(e) {
	return e.pattern?.type === "graph" && Object.hasOwn(e.pattern.graph ?? {}, "opacity");
}
function H(e, t) {
	let n = j[t], r = e[t] ?? n.fallback;
	if (!Number.isInteger(r) || r < n.minimum || r > n.maximum) throw RangeError(`Path tracer ${t} must be an integer from ${n.minimum} to ${n.maximum}.`);
	return r;
}
function U(e, t) {
	let n = j[t], r = e[t] ?? n.fallback;
	if (typeof r != "number" || !Number.isFinite(r) || r < n.minimum || r > n.maximum) throw RangeError(`Path tracer ${t} must be a number from ${n.minimum} to ${n.maximum}.`);
	return r;
}
var W = Object.freeze([
	"wavelet",
	"oidn",
	"none"
]), ne = Object.freeze(["random", "blue-noise-first"]), G = Object.freeze([
	"auto",
	"uniform",
	"importance",
	"tree"
]);
function re(e) {
	if (e === !0) return "wavelet";
	if (e === !1) return "none";
	if (W.includes(e)) return e;
	throw TypeError(`Path tracer denoise must be a boolean or one of ${W.join(", ")}.`);
}
var ie = [
	"cpu",
	"gpu",
	"webgpu"
];
function ae(e = {}) {
	if (typeof e != "object" || !e) throw TypeError("Path tracer options must be an object.");
	let t = {
		width: H(e, "width"),
		height: H(e, "height"),
		samples: H(e, "samples"),
		bounces: H(e, "bounces"),
		seed: H(e, "seed"),
		threads: H(e, "threads"),
		maxSeconds: U(e, "maxSeconds"),
		fireflyClamp: U(e, "fireflyClamp"),
		noiseThreshold: U(e, "noiseThreshold"),
		denoiser: re(e.denoise ?? !0),
		viewTransform: e.viewTransform ?? "aces",
		look: e.look ?? null,
		backend: e.backend ?? "cpu",
		samplingPattern: e.samplingPattern ?? "random",
		lightSelection: e.lightSelection ?? "auto"
	};
	if (t.denoise = t.denoiser !== "none", !c.includes(t.viewTransform)) throw RangeError(`Path tracer viewTransform must be one of ${c.join(", ")}.`);
	if (!ie.includes(t.backend)) throw TypeError("Path tracer backend must be \"cpu\", \"gpu\" or \"webgpu\".");
	if (!ne.includes(t.samplingPattern)) throw RangeError(`Path tracer samplingPattern must be one of ${ne.join(", ")}.`);
	if (!G.includes(t.lightSelection)) throw RangeError(`Path tracer lightSelection must be one of ${G.join(", ")}.`);
	if (t.backend !== "gpu" && t.samplingPattern !== "random") throw RangeError("Path tracer samplingPattern \"blue-noise-first\" needs backend \"gpu\"; the CPU reference and the WebGPU tracer draw random samples.");
	if (t.lightSelection === "importance" && t.backend !== "gpu") throw RangeError("Path tracer lightSelection \"importance\" needs backend \"gpu\"; the CPU reference and the WebGPU tracer pick lights uniformly; \"tree\" also runs on the WebGPU tracer.");
	if (t.width * t.height > 2073600) throw RangeError(`A path trace takes at most ${M} pixels.`);
	if (t.width * t.height * t.samples * (t.bounces + 1) > 4e9) throw RangeError("This path trace would need too much ray work: lower the size, samples or bounces.");
	return t;
}
function oe(e, t) {
	if (!Array.isArray(e) || e.length !== 3 || e.some((e) => typeof e != "number" || !Number.isFinite(e))) throw TypeError(`Path tracer camera ${t} must be three finite numbers.`);
	return e;
}
function K(t, n, r) {
	let i = oe(t.eye, "eye"), a = oe(t.target, "target"), o = oe(t.up ?? [
		0,
		1,
		0
	], "up");
	if (t.projection === "orthographic" || t.shift) throw RangeError("The path tracer draws perspective cameras without lens shift. Render those without the renderer option.");
	let s = t.focalLength === void 0 ? t.fov : e(t, n / r);
	if (typeof s != "number" || !(s > 1 && s < 170)) throw RangeError("Path tracer camera fov must be between 1 and 170 degrees.");
	let c = [
		a[0] - i[0],
		a[1] - i[1],
		a[2] - i[2]
	], l = Math.hypot(...c);
	if (l === 0) throw RangeError("Path tracer camera eye and target must differ.");
	for (let e = 0; e < 3; e++) c[e] /= l;
	let u = [
		c[1] * o[2] - c[2] * o[1],
		c[2] * o[0] - c[0] * o[2],
		c[0] * o[1] - c[1] * o[0]
	], d = Math.hypot(...u);
	if (d === 0) throw RangeError("Path tracer camera up must not be parallel to its view.");
	for (let e = 0; e < 3; e++) u[e] /= d;
	let f = [
		u[1] * c[2] - u[2] * c[1],
		u[2] * c[0] - u[0] * c[2],
		u[0] * c[1] - u[1] * c[0]
	], p = Math.tan(s * Math.PI / 360);
	return {
		eye: i,
		forward: c,
		right: u,
		above: f,
		halfHeight: p,
		halfWidth: p * n / r
	};
}
function se() {
	let e = 1;
	return {
		reset(t, n, r) {
			let i = Math.imul(t + 2654435769, 2246822507) ^ Math.imul(n + 2135587861, 3266489909) ^ Math.imul(r + 374761393, 668265263);
			i = Math.imul(i ^ i >>> 15, 739982445), i = Math.imul(i ^ i >>> 12, 695872825), i ^= i >>> 15, e = i === 0 ? 1 : i;
		},
		next() {
			e = Math.imul(e, 747796405) + 2891336453 >>> 0;
			let t = Math.imul(e >>> (e >>> 28) + 4 ^ e, 277803737);
			return ((t >>> 22 ^ t) >>> 0) / 4294967296;
		}
	};
}
function ce() {
	return {
		distance: 0,
		material: null,
		point: /* @__PURE__ */ new Float64Array(3),
		normal: /* @__PURE__ */ new Float64Array(3),
		color: /* @__PURE__ */ new Float64Array(3),
		texel: /* @__PURE__ */ new Float64Array(4),
		mapTexel: /* @__PURE__ */ new Float64Array(4),
		emission: /* @__PURE__ */ new Float64Array(3),
		metallic: 0,
		roughness: 0,
		clearcoat: 0,
		transmission: 0
	};
}
var q = /* @__PURE__ */ new Float64Array(6), J = /* @__PURE__ */ new Float64Array(4);
function le(e, t, n, r) {
	let i = q[0], a = q[1], o = q[2], s = q[3], c = q[4], l = q[5], u = J[0], d = J[1], f = J[2], p = J[3], m = u * p - f * d;
	if (Math.abs(m) < 1e-12) return;
	let h = t.normal[0], g = t.normal[1], _ = t.normal[2], v = (i * p - s * d) / m, y = (a * p - c * d) / m, b = (o * p - l * d) / m, x = (s * u - i * f) / m, S = (c * u - a * f) / m, C = (l * u - o * f) / m, w = v * h + y * g + b * _;
	v -= h * w, y -= g * w, b -= _ * w;
	let T = Math.hypot(v, y, b);
	if (T === 0) return;
	v /= T, y /= T, b /= T;
	let E = g * b - _ * y, D = _ * v - h * b, O = h * y - g * v, k = Math.hypot(E, D, O) || 1, A = E * x + D * S + O * C < 0 ? -1 : 1;
	E *= A / k, D *= A / k, O *= A / k;
	let { mapTexel: j } = t;
	Y(e.normalTexture, n, r, j);
	let M = (j[0] * 2 - 1) * e.normalScale[0], N = (j[1] * 2 - 1) * e.normalScale[1], P = j[2] * 2 - 1, F = v * M + E * N + h * P, I = y * M + D * N + g * P, ee = b * M + O * N + _ * P, L = Math.hypot(F, I, ee);
	L > 1e-6 && (t.normal[0] = F / L, t.normal[1] = I / L, t.normal[2] = ee / L);
}
function Y(e, t, n, r) {
	let { width: i, height: a, data: o, colorLookup: s, repeat: c } = e, l = t * i - .5, u = n * a - .5, d = Math.floor(l), f = Math.floor(u), p = l - d, m = u - f;
	r[0] = 0, r[1] = 0, r[2] = 0, r[3] = 0;
	for (let e = 0; e < 4; e++) {
		let t = d + (e & 1), n = f + (e >> 1);
		t = c ? (t % i + i) % i : Math.max(0, Math.min(i - 1, t)), n = c ? (n % a + a) % a : Math.max(0, Math.min(a - 1, n));
		let l = (e & 1 ? p : 1 - p) * (e >> 1 ? m : 1 - m), u = (n * i + t) * 4;
		for (let e = 0; e < 3; e++) r[e] += l * (s ? s[o[u + e]] : o[u + e] / 255);
		r[3] += l * o[u + 3] / 255;
	}
}
var X = /* @__PURE__ */ new Uint32Array(3), Z = /* @__PURE__ */ new Float64Array(3);
function Q(e, t, n, r, i, a, o, s, c, l) {
	let { positions: u, normals: d, uvs: f, colors: p, indices: m } = e, h = m[t * 3], g = m[t * 3 + 1], _ = m[t * 3 + 2];
	l.distance = c, l.point[0] = n + a * c, l.point[1] = r + o * c, l.point[2] = i + s * c;
	let v = u[g * 3] - u[h * 3], y = u[g * 3 + 1] - u[h * 3 + 1], b = u[g * 3 + 2] - u[h * 3 + 2], x = u[_ * 3] - u[h * 3], S = u[_ * 3 + 1] - u[h * 3 + 1], C = u[_ * 3 + 2] - u[h * 3 + 2], w = l.point[0] - u[h * 3], T = l.point[1] - u[h * 3 + 1], E = l.point[2] - u[h * 3 + 2], D = v * v + y * y + b * b, O = v * x + y * S + b * C, k = x * x + S * S + C * C, A = w * v + T * y + E * b, j = w * x + T * S + E * C, M = D * k - O * O || 1, N = (k * A - O * j) / M, P = (D * j - O * A) / M, F = 1 - N - P, I = 0, ee = 0, L = 0, R = 0, z = 0, te = 0, B = 0, V = 0;
	X[0] = h, X[1] = g, X[2] = _, Z[0] = F, Z[1] = N, Z[2] = P;
	for (let e = 0; e < 3; e++) {
		let t = X[e], n = Z[e];
		I += n * d[t * 3], ee += n * d[t * 3 + 1], L += n * d[t * 3 + 2], R += n * p[t * 3], z += n * p[t * 3 + 1], te += n * p[t * 3 + 2], B += n * f[t * 2], V += n * f[t * 2 + 1];
	}
	let H = Math.hypot(I, ee, L) || 1;
	l.normal[0] = I / H, l.normal[1] = ee / H, l.normal[2] = L / H;
	let U = e.materials[e.triangleMaterial[t]];
	l.material = U;
	let W = 1;
	return l.color[0] = U.color[0] * R, l.color[1] = U.color[1] * z, l.color[2] = U.color[2] * te, U.texture && (Y(U.texture, B, V, l.texel), l.color[0] *= l.texel[0], l.color[1] *= l.texel[1], l.color[2] *= l.texel[2], W = l.texel[3]), l.emission[0] = U.emission[0], l.emission[1] = U.emission[1], l.emission[2] = U.emission[2], U.emissiveTexture && (Y(U.emissiveTexture, B, V, l.mapTexel), l.emission[0] *= l.mapTexel[0], l.emission[1] *= l.mapTexel[1], l.emission[2] *= l.mapTexel[2]), l.metallic = U.metallic, l.roughness = U.roughness, l.clearcoat = U.clearcoat, l.transmission = U.transmission, U.clearcoatTexture && (Y(U.clearcoatTexture, B, V, l.mapTexel), l.clearcoat *= l.mapTexel[0]), U.transmissionTexture && (Y(U.transmissionTexture, B, V, l.mapTexel), l.transmission *= l.mapTexel[0]), U.surfaceTexture && (Y(U.surfaceTexture, B, V, l.mapTexel), l.roughness *= l.mapTexel[1], l.metallic *= l.mapTexel[2]), U.normalTexture && (q[0] = v, q[1] = y, q[2] = b, q[3] = x, q[4] = S, q[5] = C, J[0] = f[g * 2] - f[h * 2], J[1] = f[g * 2 + 1] - f[h * 2 + 1], J[2] = f[_ * 2] - f[h * 2], J[3] = f[_ * 2 + 1] - f[h * 2 + 1], le(U, l, B, V)), W;
}
function ue(e, t, n, r, i, a, o, s) {
	let c = t, l = n, u = r, d = 0;
	for (let t = 0; t < P; t++) {
		let t = e.tracer.trace(c, l, u, i, a, o, e.farDistance, !1);
		if (t.nearestTriangle < 0) return !1;
		let n = Q(e, t.nearestTriangle, c, l, u, i, a, o, t.nearestDistance, s);
		if (s.material.alphaCutoff === 0 || n >= s.material.alphaCutoff) return s.distance += d, !0;
		let r = t.nearestDistance + e.surfaceOffset;
		d += r, c += i * r, l += a * r, u += o * r;
	}
	return !1;
}
function de(e, t, n, r, i, a, o, s, c) {
	let l = t, u = n, d = r, f = s, p = !0;
	for (let t = 0; t < P; t++) {
		let t = e.tracer.trace(l, u, d, i, a, o, f, p);
		if (t.nearestTriangle < 0) return !1;
		if (e.materials[e.triangleMaterial[t.nearestTriangle]].alphaCutoff === 0 || Q(e, t.nearestTriangle, l, u, d, i, a, o, t.nearestDistance, c) >= c.material.alphaCutoff) return !0;
		if (p) {
			p = !1;
			continue;
		}
		let n = t.nearestDistance + e.surfaceOffset;
		if (f -= n, f <= 0) return !1;
		l += i * n, u += a * n, d += o * n;
	}
	return !0;
}
function fe(e) {
	return e * e * (3 - 2 * e);
}
function pe(e, r) {
	let a = u(), o = ce(), s = ce(), c = /* @__PURE__ */ new Float64Array(3), _ = /* @__PURE__ */ new Float64Array(3), j = /* @__PURE__ */ new Float64Array(3), M = /* @__PURE__ */ new Float64Array(3), N = /* @__PURE__ */ new Float64Array(3), P = /* @__PURE__ */ new Float64Array(3), F = /* @__PURE__ */ new Float64Array(9), I = /* @__PURE__ */ new Float64Array(3), L = /* @__PURE__ */ new Float64Array(3), R = {
		albedo: /* @__PURE__ */ new Float64Array(3),
		normal: /* @__PURE__ */ new Float64Array(3),
		depth: 0
	}, z = se(), te = !1, { lights: B, environment: V } = e;
	B.sun && g(B.sun.direction, F);
	let H = Math.cos(B.sun?.angularRadius ?? i);
	function U(e, t, n, i) {
		let a = t, o = n, s = i;
		if (e > 0) {
			let e = Math.max(t, n, i);
			if (e > r.fireflyClamp) {
				let t = r.fireflyClamp / e;
				a *= t, o *= t, s *= t;
			}
		}
		_[0] += a, _[1] += o, _[2] += s;
	}
	let W = !1, ne = { pdf: 0 }, G = /* @__PURE__ */ new Float64Array(2), re = /* @__PURE__ */ new Float64Array(9), ie = /* @__PURE__ */ new Float64Array(3);
	function ae(t, n, r, i) {
		let { volume: a } = e;
		return !a || !O(a, t, n, r, M[0], M[1], M[2], i, G) ? 1 : Math.exp(-a.density * (G[1] - G[0]));
	}
	function oe(t, n, r) {
		let { volume: i } = e, a = M[0] * j[0] + M[1] * j[1] + M[2] * j[2], l = A(i.anisotropy, a), [u, d, f] = o.point;
		if (de(e, u, d, f, M[0], M[1], M[2], n, s)) return;
		ne.pdf = l;
		let p = l * ae(u, d, f, n) * r(ne);
		U(t + 1, c[0] * N[0] * p, c[1] * N[1] * p, c[2] * N[2] * p);
	}
	function K(t, n, r, i) {
		if (W) {
			oe(t, r, i);
			return;
		}
		let l = n[0] * M[0] + n[1] * M[1] + n[2] * M[2];
		if (l <= 0) return;
		d(a, M[0], M[1], M[2]);
		let u = a.value;
		if (u[0] + u[1] + u[2] <= 0) return;
		let f = o.point[0] + n[0] * e.surfaceOffset, p = o.point[1] + n[1] * e.surfaceOffset, m = o.point[2] + n[2] * e.surfaceOffset;
		if (de(e, f, p, m, M[0], M[1], M[2], r, s)) return;
		let h = l * i(a) * ae(f, p, m, r);
		U(t, c[0] * u[0] * N[0] * h, c[1] * u[1] * N[1] * h, c[2] * u[2] * N[2] * h);
	}
	let q = 1, J = () => 1 / q, le = (e) => W || (o.material.lightMask >> e.bit & 1) == 1;
	function Y(t, n) {
		if (!le(B.sun)) return;
		let r = 1 - z.next() * (1 - H), i = Math.sqrt(Math.max(0, 1 - r * r)), a = 2 * Math.PI * z.next(), o = i * Math.cos(a), s = i * Math.sin(a);
		for (let e = 0; e < 3; e++) M[e] = F[e] * o + F[3 + e] * s + F[6 + e] * r;
		for (let e = 0; e < 3; e++) N[e] = B.sun.color[e];
		K(t, n, e.farDistance, J);
	}
	function X(e, t, n) {
		let r = e - o.point[0], i = t - o.point[1], a = n - o.point[2], s = r * r + i * i + a * a, c = Math.sqrt(s);
		return M[0] = r / c, M[1] = i / c, M[2] = a / c, {
			distance: c,
			distanceSquared: s
		};
	}
	function Z(e, t) {
		let n = 2 * z.next() - 1, r = 2 * Math.PI * z.next(), i = Math.sqrt(1 - n * n);
		t[0] = e * i * Math.cos(r), t[1] = e * n, t[2] = e * i * Math.sin(r);
	}
	let Q = /* @__PURE__ */ new Float64Array(3);
	function pe(n, r, i) {
		if (!le(i)) return;
		Z(i.radius, Q);
		let { distance: a, distanceSquared: o } = X(i.position[0] + Q[0], i.position[1] + Q[1], i.position[2] + Q[2]);
		if (a < 1e-6) return;
		let s = i.intensity * t(o, i);
		for (let e = 0; e < 3; e++) N[e] = i.color[e] * s;
		K(n, r, a - e.surfaceOffset, J);
	}
	function me(r, i, a) {
		if (!le(a)) return;
		Z(a.radius, Q);
		let { distance: o, distanceSquared: s } = X(a.position[0] + Q[0], a.position[1] + Q[1], a.position[2] + Q[2]);
		if (o < 1e-6) return;
		let c = -(a.direction[0] * M[0] + a.direction[1] * M[1] + a.direction[2] * M[2]), l = c - a.cosineHalfAngle;
		if (l <= 0) return;
		let u = a.blend > 0 && l < a.blend ? fe(l / a.blend) : 1, d = a.intensity * t(s, a) * u * (a.profile ? n(a.profile, c) : 1);
		for (let e = 0; e < 3; e++) N[e] = a.color[e] * d;
		K(r, i, o - e.surfaceOffset, J);
	}
	function he(t, r, i) {
		if (!le(i)) return;
		let a = (z.next() - .5) * i.width, o = (z.next() - .5) * i.height, { distance: s, distanceSquared: c } = X(i.position[0] + i.across[0] * a + i.along[0] * o, i.position[1] + i.across[1] * a + i.along[1] * o, i.position[2] + i.across[2] * a + i.along[2] * o);
		if (s < 1e-6) return;
		let l = -(i.normal[0] * M[0] + i.normal[1] * M[1] + i.normal[2] * M[2]);
		if (l <= 0) return;
		let u = i.intensity * l / c * (i.profile ? n(i.profile, l) : 1);
		for (let e = 0; e < 3; e++) N[e] = i.color[e] * u;
		K(t, r, s - e.surfaceOffset, J);
	}
	let ge = 0, _e = (e) => {
		let t = ge * q, n = t * t + e.pdf * e.pdf;
		return t * t / n / t;
	};
	function ve(t, n) {
		ge = x(V, z.next(), z.next(), z.next(), z.next(), M), ge > 0 && (S(V, M[0], M[1], M[2], N), K(t, n, e.farDistance, _e));
	}
	let $ = +!!B.sun + B.points.length + B.spots.length + B.areas.length + +!!V;
	function ye(e, t) {
		q = 1, B.sun && Y(e, t);
		for (let n of B.points) pe(e, t, n);
		for (let n of B.spots) me(e, t, n);
		for (let n of B.areas) he(e, t, n);
		V && ve(e, t);
	}
	let be = B.points.length + B.spots.length + B.areas.length, xe = T(r.lightSelection, B) === "tree" && be > 1, Se = xe ? E(B) : null, Ce = () => z.next();
	function we(e, t, n) {
		return n < B.points.length ? pe(e, t, B.points[n]) : (n -= B.points.length, n < B.spots.length ? me(e, t, B.spots[n]) : he(e, t, B.areas[n - B.spots.length]));
	}
	function Te(e, t) {
		let n = be / $, r = Math.floor(z.next() * $);
		if (B.sun) {
			if (r === 0) return q = 1 / $, Y(e, t);
			r--;
		}
		if (r >= be) return q = 1 / $, ve(e, t);
		let i = D(Se, o.point[0], o.point[1], o.point[2], t[0], t[1], t[2], Ce);
		q = 1 / $, i.lightIndex < 0 || (q = n * i.probability, we(e, t, i.lightIndex), q = 1 / $);
	}
	function Ee(e, t) {
		q = 1 / $;
		let n = Math.floor(z.next() * $);
		if (B.sun) {
			if (n === 0) return Y(e, t);
			n--;
		}
		return n < B.points.length ? pe(e, t, B.points[n]) : (n -= B.points.length, n < B.spots.length ? me(e, t, B.spots[n]) : (n -= B.spots.length, n < B.areas.length ? he(e, t, B.areas[n]) : ve(e, t)));
	}
	function De(e, t) {
		e === 0 && !(xe && be > 16) || $ <= 1 ? ye(e, t) : xe ? Te(e, t) : Ee(e, t);
	}
	function Oe(e, t, n) {
		if (!V) return;
		S(V, j[0], j[1], j[2], P);
		let r = 1;
		if (!n) {
			let e = b(V, j[0], j[1], j[2]) * q;
			r = t * t / (t * t + e * e);
		}
		U(e, c[0] * P[0] * r, c[1] * P[1] * r, c[2] * P[2] * r);
	}
	function ke(e, t) {
		R.albedo[0] = t ? 1 : o.color[0], R.albedo[1] = t ? 1 : o.color[1], R.albedo[2] = t ? 1 : o.color[2], R.normal[0] = e[0], R.normal[1] = e[1], R.normal[2] = e[2], R.depth = o.distance;
	}
	function Ae(e) {
		if (e < ee) return !0;
		let t = Math.min(.95, Math.max(.05, Math.max(c[0], c[1], c[2])));
		if (z.next() >= t) return !1;
		for (let e = 0; e < 3; e++) c[e] /= t;
		return !0;
	}
	function je(t, n, r, i) {
		let { volume: a } = e;
		if (!O(a, t, n, r, j[0], j[1], j[2], i, G)) return !1;
		let s = G[0] - Math.log(1 - z.next()) / a.density;
		return s >= G[1] ? !1 : (o.point[0] = t + j[0] * s, o.point[1] = n + j[1] * s, o.point[2] = r + j[2] * s, !0);
	}
	function Me(t) {
		let { volume: n } = e;
		for (let e = 0; e < 3; e++) c[e] *= n.albedo[e];
		W = !0, De(t, L), W = !1;
		let r = k(n.anisotropy, z.next()), i = Math.sqrt(Math.max(0, 1 - r * r)), a = 2 * Math.PI * z.next();
		g(j, re);
		for (let e = 0; e < 3; e++) ie[e] = re[e] * i * Math.cos(a) + re[3 + e] * i * Math.sin(a) + re[6 + e] * r;
		for (let e = 0; e < 3; e++) j[e] = ie[e];
		return A(n.anisotropy, r);
	}
	let Ne = y(e, z, ue), Pe = /* @__PURE__ */ new Float64Array(3);
	function Fe(e, t) {
		let n = t.color ?? o.color;
		Pe.fill(1);
		let r = Ne(t, n, o.point[0], o.point[1], o.point[2], L, o.material, s, Pe);
		if (r === C.lost) return !1;
		let i = a.diffuseShare * t.weight / a.subsurfaceChance;
		if (r === C.exit) {
			let e = s.normal[0] * Ne.direction[0] + s.normal[1] * Ne.direction[1] + s.normal[2] * Ne.direction[2] < 0 ? -1 : 1;
			for (let t = 0; t < 3; t++) o.point[t] = s.point[t], L[t] = s.normal[t] * e;
			for (let e = 0; e < 3; e++) c[e] *= Pe[e] * i;
		} else {
			if (z.next() < .5) for (let e = 0; e < 3; e++) L[e] = -L[e];
			for (let e = 0; e < 3; e++) c[e] *= n[e] * i;
		}
		return m(a, L), De(e, L), !0;
	}
	function Ie(t, n, i, s, u, m, g, y) {
		z.reset(g, y, r.seed), _[0] = 0, _[1] = 0, _[2] = 0, c[0] = 1, c[1] = 1, c[2] = 1, R.albedo.fill(1), te = !1, R.normal[0] = 0, R.normal[1] = 0, R.normal[2] = 1, R.depth = 0, j[0] = s, j[1] = u, j[2] = m;
		let b = t, x = n, S = i, C = 0, T = !0;
		for (let t = 0; t <= r.bounces; t++) {
			let n = ue(e, b, x, S, j[0], j[1], j[2], o);
			if (e.volume && je(b, x, S, n ? o.distance : e.farDistance)) {
				if (C = Me(t), T = !1, b = o.point[0], x = o.point[1], S = o.point[2], !Ae(t)) break;
				continue;
			}
			if (!n) {
				Oe(t, C, T);
				break;
			}
			let r = o.material, i = o.normal[0] * j[0] + o.normal[1] * j[1] + o.normal[2] * j[2] < 0, s = i ? 1 : -1;
			L[0] = o.normal[0] * s, L[1] = o.normal[1] * s, L[2] = o.normal[2] * s;
			let u = o.transmission > 0 && z.next() < o.transmission;
			te ||= (ke(L, u), !0), U(t, c[0] * o.emission[0], c[1] * o.emission[1], c[2] * o.emission[2]);
			let m = -j[0], g = -j[1], _ = -j[2];
			if (u) {
				let e = p(o.roughness);
				if (!v(L, m, g, _, i, r.ior, e, z.next(), z.next(), z.next(), j)) break;
				j[0] * L[0] + j[1] * L[1] + j[2] * L[2] < 0 && (c[0] *= o.color[0], c[1] *= o.color[1], c[2] *= o.color[2]), T = !0;
			} else {
				f(a, r, o.metallic, o.roughness, o.color, L, m, g, _, o.clearcoat);
				let e = r.subsurface;
				e && l(a, e.weight), De(t, L);
				let n = z.next();
				if (e) {
					if (n < a.subsurfaceChance) {
						if (!Fe(t, e)) break;
						n = 0;
					} else n -= a.subsurfaceChance;
				}
				let i = h(a, n, z.next(), z.next(), j), s = j[0] * L[0] + j[1] * L[1] + j[2] * L[2];
				if (s <= 0) break;
				if (i) {
					w(a, I);
					for (let e = 0; e < 3; e++) c[e] *= I[e];
					T = !0;
				} else {
					if (d(a, j[0], j[1], j[2]), !(a.pdf > 0)) break;
					for (let e = 0; e < 3; e++) c[e] *= a.value[e] * s / a.pdf;
					C = a.pdf, T = !1;
				}
			}
			if (b = o.point[0] + j[0] * e.surfaceOffset, x = o.point[1] + j[1] * e.surfaceOffset, S = o.point[2] + j[2] * e.surfaceOffset, !Ae(t)) break;
		}
	}
	return {
		trace: Ie,
		radiance: _,
		features: R
	};
}
function me(e, t, n, { viewTransform: r = "aces", look: i = null } = {}) {
	let a = new Uint8ClampedArray(t * n * 4), c = r === "aces" && !i;
	for (let l = 0; l < t * n; l++) {
		let t = c ? [
			0,
			1,
			2
		].map((t) => o(e[l * 3 + t]) ** (1 / 2.2)) : s([
			e[l * 3],
			e[l * 3 + 1],
			e[l * 3 + 2]
		], {
			viewTransform: r,
			look: i
		});
		for (let e = 0; e < 3; e++) a[l * 4 + e] = Math.round(t[e] * 255);
		a[l * 4 + 3] = 255;
	}
	return a;
}
function he(e, t) {
	let n = /* @__PURE__ */ new Set(), r = t?.volumeFog;
	r?.density > 0 && (r.noiseAmount ?? .5) > 0 && n.add("volumeFog is traced as a uniform medium: noiseAmount, noiseScale and drift are ignored."), r?.density > 0 && r.ambient && n.add("volumeFog.ambient is not added: the fog is lit by the traced lights and sky."), t?.map || n.add("There is no environment map, so the sky is black and only the lights shine.");
	for (let t of e) {
		let e = t.material ?? {};
		for (let t of te) e[t] && n.add(`${t} is ignored.`);
		e.tag && e.tag !== "surface" && n.add(`${e.tag} materials are traced as plain surfaces.`), e.alphaMode === "blend" && n.add(V(e) ? "A graph opacity output is traced as a cutout at 0.5." : "Blended transparency is traced as opaque."), (e.layerMaps?.clearcoatTexture || e.transmissionMap) && n.add("Graph clearcoat and transmission masks are read by the CPU tracer; the GPU tracers use the factors.");
		for (let [t, r] of B) r(e) && n.add(`${t} is ignored.`);
	}
	return [...n];
}
function ge(e, t, n, r) {
	let i = e / n, a = Math.max(0, t / n - i * i) * n / (n - 1);
	return Math.sqrt(a / n) < r * (i + z);
}
function _e(e, t) {
	return !(t.noiseThreshold > 0) || e < L ? !1 : (e - L) % R === 0;
}
function ve(e, t, n, r, i, a = () => {}) {
	let o = pe(e, n), { width: s, height: c, samples: l } = n, u = (i - r) * s, d = new Float32Array(u * 3), f = new Float32Array(u * 3), p = new Float32Array(u * 3), m = new Float32Array(u), h = new Float32Array(u), g = new Uint16Array(u);
	for (let e = r; e < i; e++) {
		a();
		for (let i = 0; i < s; i++) {
			let a = e * s + i, u = (e - r) * s + i, v = 0, y = 0, b = 0;
			for (; b < l;) {
				let r = b, l = $(a, r, n.seed, 1), h = $(a, r, n.seed, 2), g = ((i + l) / s * 2 - 1) * t.halfWidth, x = (1 - (e + h) / c * 2) * t.halfHeight, S = t.forward[0] + t.right[0] * g + t.above[0] * x, C = t.forward[1] + t.right[1] * g + t.above[1] * x, w = t.forward[2] + t.right[2] * g + t.above[2] * x, T = Math.hypot(S, C, w);
				o.trace(t.eye[0], t.eye[1], t.eye[2], S / T, C / T, w / T, a, r);
				let { radiance: E, features: D } = o, O = _(E[0], E[1], E[2]);
				v += O, y += O * O;
				for (let e = 0; e < 3; e++) d[u * 3 + e] += E[e], f[u * 3 + e] += D.albedo[e], p[u * 3 + e] += D.normal[e];
				if (m[u] += D.depth, b++, _e(b, n) && ge(v, y, b, n.noiseThreshold)) break;
			}
			for (let e = 0; e < 3; e++) d[u * 3 + e] /= b, f[u * 3 + e] /= b, p[u * 3 + e] /= b;
			m[u] /= b;
			let x = v / b;
			h[u] = Math.max(0, y / b - x * x) / Math.max(b - 1, 1), g[u] = b;
		}
	}
	return {
		color: d,
		albedo: f,
		normal: p,
		depth: m,
		variance: h,
		samplesTaken: g
	};
}
function $(e, t, n, r) {
	let i = Math.imul(e ^ 1374496523, 2654435761) ^ Math.imul(t + r * 1663821227, 2246822507) ^ Math.imul(n + 461845907, 3266489909);
	return i = Math.imul(i ^ i >>> 16, 2146121005), i = Math.imul(i ^ i >>> 15, 2221713035), i ^= i >>> 16, (i >>> 0) / 4294967296;
}
function ye(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) t += e[n];
	return t;
}
function be(e, t) {
	for (let n = 0; n < t; n++) {
		let t = Math.hypot(e[n * 3], e[n * 3 + 1], e[n * 3 + 2]);
		if (t !== 0) for (let r = 0; r < 3; r++) e[n * 3 + r] /= t;
	}
}
function xe(e, t, n, r) {
	let i = n * r;
	for (let n of [
		"color",
		"albedo",
		"normal"
	]) e[n].set(t[n], i * 3);
	for (let n of [
		"depth",
		"variance",
		"samplesTaken"
	]) e[n].set(t[n], i);
}
function Se(e, t, n, r, i) {
	let a = Math.ceil(n.height / F), o = Math.min(n.threads, a), s = [], { tracer: c, ...l } = e;
	return new Promise((e, c) => {
		let u = 0, d = 0, f = !1, p = (t) => {
			if (!f) {
				f = !0, clearInterval(m);
				for (let e of s) e.terminate();
				t ? c(t) : e();
			}
		}, m = setInterval(() => {
			try {
				i();
			} catch (e) {
				p(e);
			}
		}, 250), h = (e) => {
			if (u >= a) return;
			let t = u * F;
			u++, e.postMessage({
				type: "band",
				rowStart: t,
				rowEnd: Math.min(t + F, n.height)
			});
		};
		for (let e = 0; e < o; e++) {
			let e = new Worker(new URL(I, import.meta.url), { type: "module" });
			s.push(e), e.onerror = (e) => p(/* @__PURE__ */ Error(`Path tracer worker failed: ${e.message}`)), e.onmessage = (t) => {
				t.data.type === "ready" ? h(e) : (xe(r, t.data.band, t.data.rowStart, n.width), d++, d === a ? p() : h(e));
			}, e.postMessage({
				type: "scene",
				scene: l,
				camera: t,
				options: n
			});
		}
	});
}
async function Ce({ parts: e, environment: t = {}, camera: n }, i = {}) {
	let o = ae(i), s = performance.now(), c = () => {
		if ((performance.now() - s) / 1e3 > o.maxSeconds) throw Error(`The path trace passed its ${o.maxSeconds} second limit and was stopped.`);
	}, { width: l, height: u } = o, d = K(n, l, u), f = r(e, t), p = l * u, m = {
		color: new Float32Array(p * 3),
		albedo: new Float32Array(p * 3),
		normal: new Float32Array(p * 3),
		depth: new Float32Array(p),
		variance: new Float32Array(p),
		samplesTaken: new Uint16Array(p)
	}, h = typeof Worker == "function" ? o.threads : 1, g = null, _ = 0, v = 0;
	if (o.backend === "gpu" || o.backend === "webgpu") {
		let { traceOnGpu: e, gpuKernelCompileCount: t } = await (o.backend === "webgpu" ? import("./path-tracer-webgpu-DrdzCEqK.js") : import("./path-tracer-gpu-6qSt8fAB.js").then((e) => e.c)), n = await e(f, d, o, c);
		g = n.gpu, _ = n.compileSeconds, v = t(), xe(m, n, 0, l);
	} else h > 1 ? await Se(f, d, {
		...o,
		threads: h
	}, m, c) : xe(m, ve(f, d, o, 0, u, c), 0, l);
	c();
	let y = (performance.now() - s) / 1e3;
	be(m.normal, p);
	let { samplesTaken: b, ...x } = m, S = o.denoiser === "wavelet" ? a({
		width: l,
		height: u,
		...x
	}) : m.color;
	return {
		width: l,
		height: u,
		linear: S,
		rgba: me(S, l, u, o),
		features: x,
		report: {
			width: l,
			height: u,
			samples: o.samples,
			bounces: o.bounces,
			seed: o.seed,
			denoised: o.denoiser === "wavelet",
			denoiser: o.denoiser,
			threads: h,
			backend: o.backend,
			...g ? {
				gpu: g,
				gpuCompileSeconds: _,
				gpuKernelCompiles: v
			} : {},
			averageSamples: ye(b) / p,
			noiseThreshold: o.noiseThreshold,
			triangles: f.indices.length / 3,
			tracedSeconds: y,
			seconds: (performance.now() - s) / 1e3,
			ignored: he(e, t)
		}
	};
}
var we = Ce;
export { we as Cook, G as LIGHT_SELECTIONS, M as MAX_TRACE_PIXELS, N as MAX_TRACE_RAY_WORK, W as PATH_TRACER_DENOISERS, j as PATH_TRACER_LIMITS, ne as SAMPLING_PATTERNS, K as createCamera, he as describeIgnoredFeatures, ae as normalizePathTracerOptions, ve as renderBand, Ce as renderPathTracedImage, me as toneMapToRgba8 };
