/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e } from "./mat3-BUCH0Dej.js";
import { i as t, n, r } from "./morph-CbizhGSZ.js";
import { a as i, o as a } from "./skinning-DjFQA5hH.js";
// src/surface-attachment.js
var o = /* @__PURE__ */ new Set([
	"triangle",
	"barycentric",
	"clearance",
	"rotation",
	"maxVertices",
	"maxTriangles"
]), s = /* @__PURE__ */ new Set([
	"water",
	"foliage",
	"grass",
	"fire",
	"smoke"
]), c = /* @__PURE__ */ new Set([
	"water",
	"foliage",
	"grass",
	"terrain",
	"floor",
	"fire",
	"smoke"
]);
function l(e, t) {
	if (typeof e != "number" || !Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw RangeError(`${t} must be finite and Float32-representable.`);
	return e;
}
function u(e, t) {
	if (!Number.isSafeInteger(e) || e < 1 || e > 1e6) throw RangeError(`${t} must be an integer from 1 through 1000000.`);
	return e;
}
function d(e, t = 0) {
	return e[t] * (e[t + 5] * e[t + 10] - e[t + 9] * e[t + 6]) - e[t + 4] * (e[t + 1] * e[t + 10] - e[t + 9] * e[t + 2]) + e[t + 8] * (e[t + 1] * e[t + 6] - e[t + 5] * e[t + 2]);
}
function f(e, t, n, r = 0) {
	for (let r = 0; r < 16; r++) l(e[t + r], n);
	if (e[t + 3] !== 0 || e[t + 7] !== 0 || e[t + 11] !== 0 || e[t + 15] !== 1) throw RangeError(`${n} must remain affine.`);
	let i = d(e, t);
	if (!Number.isFinite(i) || i === 0 || Math.abs(i) < r) throw RangeError(`${n} must remain nonsingular.`);
	return i;
}
function ee(e) {
	if (e.assembly !== void 0 && e.assembly !== null) throw RangeError("Surface attachments cannot follow assembly shader offsets.");
	let t = e.material?.tag;
	if (s.has(t) || (e.skin || e.morph) && c.has(t)) throw RangeError("Surface attachment target uses unsupported procedural deformation or a deformed procedural material.");
}
function p(e, t, n) {
	let { positions: r, normals: i, indices: a } = e ?? {};
	if (!(r instanceof Float32Array) || r.length < 9 || r.length % 3 != 0 || !(i instanceof Float32Array) || i.length !== r.length || !(a instanceof Uint32Array) || a.length < 3 || a.length % 3 != 0) throw TypeError("Surface attachments require indexed Float32 positions/normals and Uint32 triangles.");
	let o = r.length / 3, s = a.length / 3;
	if (o > t || s > n) throw RangeError("Attachment target exceeds maxVertices or maxTriangles.");
	for (let e of r) l(e, "Target position");
	for (let e = 0; e < i.length; e += 3) {
		let t = Math.hypot(i[e], i[e + 1], i[e + 2]);
		if (!Number.isFinite(t) || Math.abs(t - 1) > .001) throw RangeError("Target normals must remain finite unit vectors.");
	}
	for (let e of a) if (e >= o) throw RangeError("Target triangle index exceeds the vertex count.");
	for (let e = 0; e < a.length; e += 3) {
		let t = a[e] * 3, n = a[e + 1] * 3, i = a[e + 2] * 3, o = r[n] - r[t], s = r[n + 1] - r[t + 1], c = r[n + 2] - r[t + 2], l = r[i] - r[t], u = r[i + 1] - r[t + 1], d = r[i + 2] - r[t + 2];
		if (Math.hypot(s * d - c * u, c * l - o * d, o * u - s * l) === 0) throw RangeError("Attachment target contains a degenerate triangle.");
	}
	return {
		vertexCount: o,
		triangleCount: s
	};
}
function m(e) {
	let t = Math.fround(e);
	if (!Number.isFinite(t)) throw RangeError("Attachment deformation exceeds finite Float32 arithmetic.");
	return t;
}
function h(s, c = {}) {
	if (!s || typeof s != "object") throw TypeError("Surface attachments require a target part.");
	if (!c || typeof c != "object" || Array.isArray(c)) throw TypeError("Attachment options require an object.");
	for (let e of Object.keys(c)) if (!o.has(e)) throw TypeError(`Unsupported attachment option ${e}.`);
	let h = u(c.maxVertices ?? 25e4, "maxVertices"), g = u(c.maxTriangles ?? 25e4, "maxTriangles"), _ = s.geometry, v = p(_, h, g), y = c.triangle;
	if (!Number.isSafeInteger(y) || y < 0 || y >= v.triangleCount) throw RangeError("Attachment triangle must reference an original target triangle.");
	let b = c.barycentric;
	if (!Array.isArray(b) && !ArrayBuffer.isView(b) || b.length !== 3) throw TypeError("Attachment barycentric coordinates require three components.");
	let x = /* @__PURE__ */ new Float64Array(3), S = 0;
	for (let e = 0; e < 3; e++) {
		let t = l(b[e], "Barycentric coordinate");
		if (t < 0) throw RangeError("Barycentric coordinates must be nonnegative.");
		x[e] = t, S += t;
	}
	if (Math.abs(S - 1) > 1e-6) throw RangeError("Barycentric coordinates must sum to one within 1e-6.");
	for (let e = 0; e < 3; e++) x[e] /= S;
	let C = l(c.clearance ?? 0, "Clearance");
	if (C < 0) throw RangeError("Clearance must be nonnegative.");
	let w = l(c.rotation ?? 0, "Rotation"), T = Math.cos(w), E = Math.sin(w), D = s.matrix;
	if (!(D instanceof Float32Array) || D.length !== 16) throw TypeError("Target matrix requires a retained Float32Array of 16 components.");
	ee(s), f(D, 0, "Target matrix");
	let O = s.skin ?? null, k = s.morph ?? null;
	i(_, O), O && a(O, _, D);
	let A = n(_, k);
	k && t(k, A, D, O);
	let j = _.positions, M = _.normals, N = _.indices, P = _.skinIndices, F = _.skinWeights, I = O?.jointMatrices, te = I?.length, ne = k?.weights, re = /* @__PURE__ */ new Float32Array(9), ie = new Float32Array((A?.targetCount ?? 0) * 9), L = /* @__PURE__ */ new Uint32Array(12), ae = /* @__PURE__ */ new Float32Array(12);
	for (let e = 0; e < 3; e++) {
		let t = _.indices[y * 3 + e];
		re.set(_.positions.subarray(t * 3, t * 3 + 3), e * 3);
		for (let n = 0; n < (A?.targetCount ?? 0); n++) {
			let r = A.targets[n].positions;
			r && ie.set(r.subarray(t * 3, t * 3 + 3), n * 9 + e * 3);
		}
		if (O) {
			let n = 0;
			for (let e = 0; e < 4; e++) n += _.skinWeights[t * 4 + e];
			for (let r = 0; r < 4; r++) L[e * 4 + r] = _.skinIndices[t * 4 + r], ae[e * 4 + r] = Math.fround(_.skinWeights[t * 4 + r] / n);
		}
	}
	let R = /* @__PURE__ */ new Float32Array(16), z = /* @__PURE__ */ new Float32Array(16);
	z[15] = 1;
	let B = /* @__PURE__ */ new Float32Array(4);
	B[3] = 1;
	let V = /* @__PURE__ */ new Float32Array(16), H = /* @__PURE__ */ new Float32Array(16), U = /* @__PURE__ */ new Float64Array(9), oe = /* @__PURE__ */ new Float32Array(9);
	function W() {
		if (s.geometry !== _ || _.positions !== j || _.normals !== M || _.indices !== N || j.length !== v.vertexCount * 3 || M.length !== v.vertexCount * 3 || N.length !== v.triangleCount * 3 || s.matrix !== D || D.length !== 16 || (s.skin ?? null) !== O || (s.morph ?? null) !== k || _.skinIndices !== P || _.skinWeights !== F || O?.jointMatrices !== I || I?.length !== te || k?.weights !== ne) throw Error("Attachment target buffer or pose identities changed. Bind a new attachment.");
		if (O && (P.length !== v.vertexCount * 4 || F.length !== v.vertexCount * 4)) throw Error("Attachment skin channel lengths changed. Bind a new attachment.");
		ee(s);
		let t = f(D, 0, "Target matrix");
		if (!e(oe, D)) throw RangeError("Target matrix has no finite normal transform.");
		for (let e = 0; e < 9; e++) l(oe[e], "Target normal transform");
		if (k) {
			r(k, A);
			for (let e = 0; e < A.targetCount; e++) {
				let t = A.targets[e];
				if (t.positions && t.positions.length !== v.vertexCount * 3 || t.normals && t.normals.length !== v.vertexCount * 3) throw Error("Attachment morph channel lengths changed. Bind a new attachment.");
			}
		}
		if (O) for (let e = 0; e < 12; e++) f(I, L[e] * 16, "Referenced joint palette", 1e-10);
		for (let e = 0; e < 3; e++) {
			for (let t = 0; t < 3; t++) {
				let n = re[e * 3 + t];
				for (let r = 0; r < (A?.targetCount ?? 0); r++) n = m(n + m(ie[r * 9 + e * 3 + t] * ne[r]));
				B[t] = n;
			}
			if (O) {
				for (let t = 0; t < 16; t++) {
					let n = 0;
					for (let r = 0; r < 4; r++) {
						let i = e * 4 + r;
						n = m(n + m(I[L[i] * 16 + t] * ae[i]));
					}
					V[t] = n;
				}
				let n = d(V);
				if (!Number.isFinite(n) || Math.abs(n) < 1e-8) throw RangeError("Attachment has a singular weighted skin transform.");
				if (n * t < 0) throw RangeError("A surface attachment cannot sit on a mirrored weighted skin vertex. Move it to a face whose joints do not turn opposite ways.");
				for (let e = 0; e < 4; e++) for (let t = 0; t < 4; t++) {
					let n = 0;
					for (let r = 0; r < 4; r++) n = m(n + m(D[r * 4 + t] * V[e * 4 + r]));
					H[e * 4 + t] = n;
				}
			} else H.set(D);
			let n = 0;
			for (let e = 0; e < 4; e++) n = m(n + m(H[e * 4 + 3] * B[e]));
			if (!(n > 0)) throw RangeError("Attachment has an invalid homogeneous vertex coordinate.");
			for (let t = 0; t < 3; t++) {
				let r = 0;
				for (let e = 0; e < 4; e++) r = m(r + m(H[e * 4 + t] * B[e]));
				U[e * 3 + t] = l(r / n, "Posed world vertex");
			}
		}
		let n = U[3] - U[0], i = U[4] - U[1], a = U[5] - U[2], o = U[6] - U[0], c = U[7] - U[1], u = U[8] - U[2], p = i * u - a * c, h = a * o - n * u, g = n * c - i * o, y = Math.hypot(n, i, a), b = Math.hypot(p, h, g), S = Math.max(y, Math.hypot(o, c, u), Math.hypot(o - n, c - i, u - a)), w = 0;
		for (let e = 0; e < 9; e++) w = Math.max(w, Math.abs(U[e]));
		let W = b / S;
		if (!Number.isFinite(W) || W <= w * 2 ** -21 + 2 ** -149) throw RangeError("Attachment triangle collapses within Float32 world precision.");
		let G = n / y, K = i / y, q = a / y, J = p / b, Y = h / b, X = g / b, se = Y * q - X * K, ce = X * G - J * q, le = J * K - Y * G;
		z[0] = G * T + se * E, z[1] = K * T + ce * E, z[2] = q * T + le * E, z[4] = se * T - G * E, z[5] = ce * T - K * E, z[6] = le * T - q * E, z[8] = J, z[9] = Y, z[10] = X;
		let Z = 0, Q = 0, $ = 0;
		for (let e = 0; e < 3; e++) Z += U[e * 3] * x[e], Q += U[e * 3 + 1] * x[e], $ += U[e * 3 + 2] * x[e];
		if (z[12] = l(Z + J * C, "Attachment translation"), z[13] = l(Q + Y * C, "Attachment translation"), z[14] = l($ + X * C, "Attachment translation"), C > 0) {
			let e = (z[12] - Z) * J + (z[13] - Q) * Y + (z[14] - $) * X, t = (z[12] - Math.fround(Z)) * J + (z[13] - Math.fround(Q)) * Y + (z[14] - Math.fround($)) * X;
			if (!(e > 0 && t > 0)) throw RangeError("Attachment clearance collapses against the geometric face at Float32 precision.");
		}
		return R.set(z), R;
	}
	return W(), Object.freeze({
		matrix: R,
		update: W
	});
}
export { h as createSurfaceAttachment };
