/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { c as e, l as t } from "./shader-registry-DHYkwAg5.js";
import { r as n } from "./skinning-DjFQA5hH.js";
// src/morph.js
var r = /* @__PURE__ */ new WeakSet(), i = 2 ** -126;
function a(e) {
	let t = Math.fround(e);
	return t >= e || !Number.isFinite(t) ? t : Math.fround(t + Math.max(2 ** -149, t * 2 ** -23));
}
function o(e) {
	if (!Number.isSafeInteger(e) || e < 1 || e > 64) throw RangeError("Morph target count must be within one and 64.");
	return e;
}
function s(e) {
	return { weights: new Float32Array(o(e)) };
}
function c(e, t, n, r = !1) {
	if (!(e instanceof Float32Array) || e.length !== t) throw TypeError(`${n} requires one Float32 RGB vector per vertex.`);
	let a = [
		0,
		0,
		0
	];
	for (let o = 0; o < t; o += 3) {
		let t = 0;
		for (let r = 0; r < 3; r++) {
			let i = e[o + r];
			if (!Number.isFinite(i)) throw RangeError(`${n} must contain finite Float32 values.`);
			a[r] = Math.max(a[r], Math.abs(i)), t = Math.fround(t + Math.fround(i * i));
		}
		if (r && (!Number.isFinite(t) || t < i)) throw RangeError("Base morph normals require a finite normal Float32 squared length.");
	}
	return Object.freeze(a);
}
function l(e) {
	let t = e?.positions?.length;
	if (!Number.isSafeInteger(t) || t < 3 || t % 3 != 0) throw TypeError("Morph base positions require a nonempty RGB vertex array.");
	let n = c(e.positions, t, "Morph base positions"), i = c(e.normals, t, "Morph base normals", !0);
	if (!Array.isArray(e.morphTargets)) throw TypeError("Morph geometry requires a target array.");
	let a = o(e.morphTargets.length), s = [];
	for (let n = 0; n < a; n++) {
		let r = e.morphTargets[n];
		if (!r || typeof r != "object" || Array.isArray(r)) throw TypeError("Each morph target must be an object.");
		for (let e of Object.keys(r)) if (e !== "positions" && e !== "normals") throw TypeError(`Morph target ${e} is unsupported.`);
		if (r.positions === void 0 && r.normals === void 0) throw TypeError("Each morph target requires positions or normals.");
		let i = r.positions === void 0 ? Object.freeze([
			0,
			0,
			0
		]) : c(r.positions, t, "Morph position deltas"), a = r.normals === void 0 ? Object.freeze([
			0,
			0,
			0
		]) : c(r.normals, t, "Morph normal deltas");
		s.push(Object.freeze({
			target: r,
			positions: r.positions,
			normals: r.normals,
			positionMaxima: i,
			normalMaxima: a
		}));
	}
	let l = Object.freeze({
		geometry: e,
		positions: e.positions,
		normals: e.normals,
		morphTargets: e.morphTargets,
		vertexCount: t / 3,
		targetCount: a,
		texelCount: t / 3 * a * 2,
		basePositionMaxima: n,
		baseNormalMaxima: i,
		targets: Object.freeze(s)
	});
	return r.add(l), l;
}
function u(e) {
	if (!r.has(e)) throw TypeError("Use metadata from validateMorphGeometry().");
	let t = e.geometry;
	if (t.positions !== e.positions || t.normals !== e.normals || t.morphTargets !== e.morphTargets || t.morphTargets.length !== e.targetCount) throw Error("Morph geometry array identities must remain unchanged after preflight.");
	for (let n = 0; n < e.targetCount; n++) {
		let r = e.targets[n];
		if (t.morphTargets[n] !== r.target || r.target.positions !== r.positions || r.target.normals !== r.normals) throw Error("Morph target and channel identities must remain unchanged after preflight.");
	}
}
function d(e, t) {
	if (!t) {
		if (e?.morphTargets !== void 0) throw TypeError("Morph targets require a morph pose.");
		return;
	}
	let n = l(e);
	return f(t, n), n;
}
function f(e, t) {
	u(t);
	let n = e?.weights;
	if (!(n instanceof Float32Array) || n.length !== t.targetCount) throw TypeError("Morph pose requires one Float32 weight per target.");
	for (let e = 0; e < n.length; e++) if (!Number.isFinite(n[e])) throw RangeError("Morph weights must remain finite Float32 values.");
	let r = 0;
	for (let e = 0; e < 3; e++) {
		let i = t.basePositionMaxima[e], o = t.baseNormalMaxima[e];
		for (let r = 0; r < n.length; r++) {
			let s = Math.abs(n[r]);
			i = a(i + a(s * t.targets[r].positionMaxima[e])), o = a(o + a(s * t.targets[r].normalMaxima[e]));
		}
		if (!Number.isFinite(i) || !Number.isFinite(o)) throw RangeError("Morph weights exceed finite Float32 position or normal bounds.");
		r = a(r + a(o * o));
	}
	if (!Number.isFinite(r)) throw RangeError("Morph weights exceed a finite Float32 normal squared length bound.");
	return t;
}
function p(e, t, n, r) {
	f(e, t);
	for (let i = 0; i < 4; i++) {
		let o = 0;
		for (let s = 0; s < 4; s++) {
			let c = s === 3 ? 1 : t.basePositionMaxima[s];
			if (s < 3) for (let n = 0; n < t.targetCount; n++) c = a(c + a(Math.abs(e.weights[n]) * t.targets[n].positionMaxima[s]));
			let l = Math.abs(Math.fround(n[s * 4 + i]));
			if (r) {
				l = 0;
				for (let e = 0; e < 4; e++) {
					let t = 0;
					for (let n = s * 4 + e; n < r.jointMatrices.length; n += 16) t = Math.max(t, Math.abs(Math.fround(r.jointMatrices[n])));
					t = a(t * (1 + 2 ** -21)), l = a(l + a(Math.abs(Math.fround(n[e * 4 + i])) * t));
				}
			}
			if (!Number.isFinite(l)) throw RangeError("Morph world/skin matrix product exceeds finite Float32 bounds.");
			o = a(o + a(l * c));
		}
		if (!Number.isFinite(o)) throw RangeError("Morph world position exceeds finite Float32 bounds.");
	}
}
function m(e, t) {
	let n = l(e), r = t?.width, i = t?.height, a = r * i, o = a * 16;
	if (!Number.isSafeInteger(r) || r < 2 || r % 2 != 0 || !Number.isSafeInteger(i) || i < 1 || !Number.isSafeInteger(o) || o > 2 ** 31 - 1 || a < n.texelCount || t.bytes !== void 0 && t.bytes !== o) throw RangeError("Morph texture layout requires even width, sufficient capacity and a bounded byte length.");
	let s = new Float32Array(a * 4);
	for (let e = 0; e < n.targetCount; e++) {
		let t = n.targets[e];
		for (let r = 0; r < n.vertexCount; r++) {
			let i = (e * n.vertexCount + r) * 8;
			for (let e = 0; e < 3; e++) s[i + e] = t.positions?.[r * 3 + e] ?? 0, s[i + 4 + e] = t.normals?.[r * 3 + e] ?? 0;
		}
	}
	return s;
}
t("morph", { vertex: "\nuniform float morphEnabled;\nuniform int morphVertexCount;\nuniform int morphTargetCount;\nuniform float morphWeights[64];\nuniform highp sampler2D morphTargets;\nvec3 morphDelta(int target, int channel) {\n  int index = (target * morphVertexCount + gl_VertexID) * 2 + channel;\n  int width = textureSize(morphTargets, 0).x;\n  return texelFetch(morphTargets, ivec2(index % width, index / width), 0).xyz;\n}\nvec3 morphedPosition(vec3 base) {\n  if (morphEnabled < 0.5) return base;\n  vec3 result = base;\n  for (int target = 0; target < 64; target++) {\n    if (target >= morphTargetCount) break;\n    if (morphWeights[target] != 0.0) result += morphDelta(target, 0) * morphWeights[target];\n  }\n  return result;\n}\nvec3 morphedNormal(vec3 base) {\n  if (morphEnabled < 0.5) return base;\n  vec3 result = base;\n  for (int target = 0; target < 64; target++) {\n    if (target >= morphTargetCount) break;\n    if (morphWeights[target] != 0.0) result += morphDelta(target, 1) * morphWeights[target];\n  }\n  float largest = max(max(abs(result.x), abs(result.y)), abs(result.z));\n  return largest > 0.0 ? normalize(result / largest) : base;\n}\n" }), e({
	validateMorphGeometry: d,
	validateMorphPose: f,
	validateMorphTransform: p,
	packMorphTargets: m,
	skinTextureLayout: n
});
export { p as i, d as n, f as r, s as t };
