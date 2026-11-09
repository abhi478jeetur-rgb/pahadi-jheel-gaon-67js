/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, p as t } from "./mat4-BCZClxna.js";
import { c as n, l as r } from "./shader-registry-DHYkwAg5.js";
// src/skinning.js
var i = /* @__PURE__ */ new WeakMap(), a = e(), o = 1.000001;
function s(e) {
	return Number.isFinite(e) && Number.isFinite(Math.fround(e));
}
function c(e) {
	for (let t = 0; t < 16; t++) if (e[t] !== a[t]) return !1;
	return !0;
}
function l(e, t, n, r, i, a) {
	let o = n[r], s = n[r + 1], c = n[r + 2], l = n[r + 3], u = n[r + 4], d = n[r + 5], f = n[r + 6], p = n[r + 7], m = n[r + 8], h = n[r + 9], g = n[r + 10], _ = n[r + 11], v = n[r + 12], y = n[r + 13], b = n[r + 14], x = n[r + 15];
	for (let n = 0; n < 16; n += 4) {
		let r = i[a + n], S = i[a + n + 1], C = i[a + n + 2], w = i[a + n + 3];
		e[t + n] = r * o + S * u + C * m + w * v, e[t + n + 1] = r * s + S * d + C * h + w * y, e[t + n + 2] = r * c + S * f + C * g + w * b, e[t + n + 3] = r * l + S * p + C * _ + w * x;
	}
}
function u(e, t) {
	let n = Math.fround(e[t]), r = Math.fround(e[t + 1]), i = Math.fround(e[t + 2]), a = Math.fround(e[t + 4]), o = Math.fround(e[t + 5]), s = Math.fround(e[t + 6]), c = Math.fround(e[t + 8]), l = Math.fround(e[t + 9]), u = Math.fround(e[t + 10]);
	return n * (o * u - l * s) - a * (r * u - l * i) + c * (r * s - o * i);
}
function d(e, t, n) {
	if (e?.length !== t * 16) throw Error(`${n} must contain one matrix per joint.`);
	if (e instanceof Float32Array) {
		for (let t = 0; t < e.length; t++) if (!Number.isFinite(e[t])) throw Error(`${n} must contain finite floats.`);
	} else for (let t of e) if (!s(t)) throw Error(`${n} must contain finite floats.`);
	for (let t = 0; t < e.length; t += 16) {
		if (e[t + 3] !== 0 || e[t + 7] !== 0 || e[t + 11] !== 0 || e[t + 15] !== 1) throw Error(`${n} must contain affine matrices.`);
		if (Math.abs(u(e, t)) < 1e-10) throw Error(`${n} contains a singular joint transform.`);
	}
}
function f(t) {
	if (!Number.isSafeInteger(t) || t < 1 || t > 65536) throw Error("Joint count must be within one and 65536.");
	let n = new Float32Array(t * 16);
	for (let e = 0; e < t; e++) n.set(a, e * 16);
	let r = { jointMatrices: n };
	return i.set(r, {
		jointMatrices: n,
		pending: new Float32Array(n.length),
		meshWorld: e(),
		meshInverse: e(),
		bind: e(),
		world: e(),
		inverseBind: e(),
		product: e()
	}), r;
}
function p(e, n, r, o = a, s = a, u = !0) {
	let f = i.get(e);
	if (!f || e.jointMatrices !== f.jointMatrices) throw Error("Use an unchanged pose from createSkinPose().");
	let p = e.jointMatrices.length / 16;
	if (u && (d(n, p, "Joint world matrices"), d(r, p, "Inverse bind matrices"), d(o, 1, "Mesh world matrix"), d(s, 1, "Bind matrix")), f.meshWorld.set(o), f.bind.set(s), !t(f.meshInverse, f.meshWorld)) throw Error("Mesh world matrix cannot be inverted.");
	u && d(f.meshInverse, 1, "Inverse mesh world matrix");
	let m = c(f.bind), h = c(f.meshInverse), g = f.product;
	for (let e = 0; e < p; e++) {
		let t = e * 16;
		l(g, 0, n, t, r, t), m || l(g, 0, g, 0, f.bind, 0), h ? f.pending.set(g, t) : l(f.pending, t, f.meshInverse, 0, g, 0);
	}
	return u && d(f.pending, p, "Joint palette"), e.jointMatrices.set(f.pending), e;
}
function m(e, t, n = 1) {
	if (!Number.isSafeInteger(e) || e < 1 || !Number.isInteger(t) || t < n) throw Error("Invalid skin texture dimensions.");
	let r = Math.min(Math.floor(t / n) * n, Math.max(n, Math.ceil(Math.sqrt(e) / n) * n)), i = Math.ceil(e / r);
	if (i > t) throw Error("Skin texture exceeds MAX_TEXTURE_SIZE.");
	return {
		width: r,
		height: i,
		bytes: r * i * 16
	};
}
function h(e, t) {
	if (!t) {
		if (e.skinIndices || e.skinWeights) throw Error("Skin attributes require a skin pose.");
		return;
	}
	let n = t.jointMatrices?.length / 16;
	if (!Number.isInteger(n) || n < 1 || n > 65536 || !(t.jointMatrices instanceof Float32Array)) throw Error("Skin pose requires a Float32 joint palette.");
	let r = e.positions.length / 3;
	if (e.skinIndices?.length !== r * 4 || e.skinWeights?.length !== r * 4) throw Error("Skin indices and weights require four values per vertex.");
	for (let t = 0; t < r; t++) {
		let r = 0;
		for (let i = 0; i < 4; i++) {
			let a = t * 4 + i, c = e.skinIndices[a], l = e.skinWeights[a];
			if (!Number.isInteger(c) || c < 0 || c >= n) throw Error("Skin joint index is out of range.");
			if (!s(l) || l < 0 || l > o) throw Error("Skin weights must be finite values within zero and one.");
			r += l;
		}
		if (r <= 1e-8) throw Error("Skin vertex weights must have a positive total.");
	}
	b(t, e);
}
var g = /* @__PURE__ */ new WeakMap();
function _(e) {
	let t = g.get(e.skinWeights);
	if (t && t.skinIndices === e.skinIndices) return t;
	let n = e.skinWeights.length / 4, r = /* @__PURE__ */ new Map(), i = [], a = [];
	for (let t = 0; t < n; t++) {
		let n = 0;
		for (let r = 0; r < 4; r++) n += e.skinWeights[t * 4 + r];
		let o = [], s = [];
		for (let r = 0; r < 4; r++) o.push(e.skinIndices[t * 4 + r]), s.push(Math.fround(e.skinWeights[t * 4 + r] / n));
		let c = `${o.join(",")}|${s.join(",")}`;
		r.has(c) || (r.set(c, !0), i.push(...o), a.push(...s));
	}
	let o = {
		skinIndices: e.skinIndices,
		joints: Int32Array.from(i),
		weights: Float32Array.from(a)
	};
	return g.set(e.skinWeights, o), o;
}
var v = /* @__PURE__ */ new WeakMap();
function y(e) {
	return v.get(e) ?? null;
}
function b(e, t, n) {
	let r = e.jointMatrices;
	if (d(r, r.length / 16, "Joint palette"), !t) return;
	let { joints: i, weights: a } = _(t), o = n ? u(n, 0) : 0, s = 0, c = -1;
	for (let e = 0; e < i.length / 4; e++) {
		let t = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0, h = 0, g = 0;
		for (let n = 0; n < 4; n++) {
			let o = a[e * 4 + n], s = i[e * 4 + n] * 16;
			t += r[s] * o, l += r[s + 1] * o, u += r[s + 2] * o, d += r[s + 4] * o, f += r[s + 5] * o, p += r[s + 6] * o, m += r[s + 8] * o, h += r[s + 9] * o, g += r[s + 10] * o;
		}
		let _ = t * (f * g - h * p) - d * (l * g - h * u) + m * (l * p - f * u);
		if (!Number.isFinite(_) || Math.abs(_) < 1e-8) throw Error("Skin pose produces a singular weighted vertex transform.");
		n && _ * o < 0 && (c < 0 && (c = e), s++);
	}
	if (!n) return;
	if (s === 0) {
		v.delete(e);
		return;
	}
	let l = {
		sets: s,
		joints: [],
		weights: []
	};
	for (let e = 0; e < 4; e++) {
		let t = a[c * 4 + e];
		t <= 0 || (l.joints.push(i[c * 4 + e]), l.weights.push(Math.round(t * 100) / 100));
	}
	v.set(e, l);
}
function x(e, t) {
	let n = new Float32Array(t.width * t.height * 4);
	for (let t = 0; t < e.skinWeights.length / 4; t++) {
		let r = 0;
		for (let n = 0; n < 4; n++) r += e.skinWeights[t * 4 + n];
		for (let i = 0; i < 4; i++) n[t * 8 + i] = e.skinIndices[t * 4 + i], n[t * 8 + 4 + i] = Math.fround(e.skinWeights[t * 4 + i] / r);
	}
	return n;
}
r("skin", {
	vertexHead: "\nuniform float skinEnabled;\nuniform highp sampler2D skinInfluences;\nuniform highp sampler2D jointPalette;\nvec4 skinTexel(sampler2D source, int index) {\n  int width = textureSize(source, 0).x;\n  return texelFetch(source, ivec2(index % width, index / width), 0);\n}\nmat4 jointMatrix(int joint) {\n  int offset = joint * 4;\n  return mat4(skinTexel(jointPalette, offset), skinTexel(jointPalette, offset + 1),\n    skinTexel(jointPalette, offset + 2), skinTexel(jointPalette, offset + 3));\n}\n",
	vertexTail: "mat4 skinTransform() {\n  if (skinEnabled < 0.5) return mat4(1.0);\n  ivec4 joints = ivec4(skinTexel(skinInfluences, gl_VertexID * 2));\n  vec4 weights = skinTexel(skinInfluences, gl_VertexID * 2 + 1);\n  return jointMatrix(joints.x) * weights.x + jointMatrix(joints.y) * weights.y\n    + jointMatrix(joints.z) * weights.z + jointMatrix(joints.w) * weights.w;\n}\n"
});
var S = /* @__PURE__ */ new WeakMap();
function C(e) {
	let t = S.get(e);
	t || (t = [...e].filter(([, e]) => e.skin), S.set(e, t));
	let n = [];
	for (let [e, r] of t) {
		let t = y(r.skin);
		if (!t) continue;
		let i = e.name ?? "a skinned part", a = t.joints.map((e, n) => `joint ${e} at ${t.weights[n]}`).join(", ");
		n.push({
			kind: "skin-reflected-vertices",
			severity: "warning",
			target: i,
			message: `${t.sets} vertex weight set(s) of ${i} mirror in this pose and draw pinched. First: ${a}.`,
			fix: "Move the weights of joints that turn opposite ways onto one joint, such as finger weights onto the hand."
		});
	}
	return n;
}
n({
	validateSkinGeometry: h,
	validateSkinPose: b,
	reflectedSkinDiagnostics: C,
	skinTextureLayout: m,
	packSkinInfluences: x
});
export { h as a, p as i, u as n, b as o, m as r, f as t };
