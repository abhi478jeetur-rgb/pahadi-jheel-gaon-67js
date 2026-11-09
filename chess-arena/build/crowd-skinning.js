/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t } from "./mat4-BCZClxna.js";
import { l as n } from "./shaders-BfxaqrIb.js";
import "./skinning-DjFQA5hH.js";
// src/crowd-skinning.js
var r = 16, i = 4, a = 30, o = Object.freeze([.02, .05]), s = 4096, c = 4095;
n("\nuniform float crowdEnabled;\nmat4 crowdJoint(int frameTexel, int joint) {\n  int texel = frameTexel + joint * 4;\n  return mat4(skinTexel(jointPalette, texel), skinTexel(jointPalette, texel + 1),\n    skinTexel(jointPalette, texel + 2), skinTexel(jointPalette, texel + 3));\n}\nmat4 crowdInfluence(float packedInfluence) {\n  float joint = floor(packedInfluence / 4096.0);\n  float weight = (packedInfluence - joint * 4096.0) / 4095.0;\n  int firstFrame = int(assemblyOffset.x + 0.5);\n  int secondFrame = int(assemblyOffset.y + 0.5);\n  int jointIndex = int(joint + 0.5);\n  return (crowdJoint(firstFrame, jointIndex) * (1.0 - assemblyOffset.z) + crowdJoint(secondFrame, jointIndex) * assemblyOffset.z) * weight;\n}\nmat4 crowdTransform() {\n  return crowdInfluence(vertexColor.x) + crowdInfluence(vertexColor.y) + crowdInfluence(vertexColor.z) + crowdInfluence(vertexColor.w);\n}");
function l(n, { morphs: i = !1 } = {}) {
	if (!Array.isArray(n) || n.length === 0) throw TypeError("A crowd rig needs a list of parts.");
	let a = [], o = 0;
	for (let e of n) {
		if (!e.geometry?.positions || !e.geometry.indices || !e.material) throw TypeError(`A crowd part needs a geometry and a material: ${e.name}`);
		if (e.skin && !e.geometry.skinIndices) throw TypeError(`A skinned crowd part needs skin indices and weights: ${e.name}`);
		a.push(o), o += e.skin ? e.skin.jointMatrices.length / r : 1;
	}
	if (o > s) throw RangeError(`A crowd rig holds at most ${s} joints; this one has ${o}.`);
	let c = /* @__PURE__ */ new Map(), l = [];
	n.forEach((e, t) => {
		i && e.morph && e.geometry.morphTargets ? l.push(t) : (c.has(e.material) || c.set(e.material, []), c.get(e.material).push(t));
	});
	let d = t(), f = (e) => ({
		part: n[e],
		jointOffset: a[e]
	}), p = [...c].map(([e, t]) => ({
		name: n[t[0]].name,
		material: e,
		geometry: u(t.map(f))
	}));
	for (let e of l) {
		let t = n[e], r = u([f(e)]);
		r.morphTargets = t.geometry.morphTargets, p.push({
			name: t.name,
			material: t.material,
			geometry: r,
			morph: { weights: new Float32Array(t.morph.weights) }
		});
	}
	return {
		jointCount: o,
		parts: p,
		readJointMatrices(t) {
			return n.forEach((n, i) => {
				let o = a[i] * r;
				if (!n.skin) t.set(n.matrix, o);
				else for (let i = 0; i < n.skin.jointMatrices.length / r; i++) e(d, n.matrix, n.skin.jointMatrices.subarray(i * r, (i + 1) * r)), t.set(d, o + i * r);
			}), t;
		}
	};
}
function u(e) {
	let t = e.reduce((e, { part: t }) => e + t.geometry.positions.length / 3, 0), n = e.reduce((e, { part: t }) => e + t.geometry.indices.length, 0), r = {
		positions: new Float32Array(t * 3),
		normals: new Float32Array(t * 3),
		indices: new Uint32Array(n),
		crowdJoints: new Float32Array(t * 4),
		crowdWeights: new Float32Array(t * 4)
	};
	e.some(({ part: e }) => e.geometry.uvs) && (r.uvs = new Float32Array(t * 2));
	let i = 0, a = 0;
	for (let { part: t, jointOffset: n } of e) {
		let e = t.geometry, o = e.positions.length / 3;
		r.positions.set(e.positions, i * 3), r.normals.set(e.normals, i * 3), e.uvs && r.uvs.set(e.uvs, i * 2);
		for (let t = 0; t < e.indices.length; t++) r.indices[a + t] = e.indices[t] + i;
		for (let a = 0; a < o; a++) {
			let o = (i + a) * 4;
			if (!t.skin) {
				r.crowdJoints[o] = n, r.crowdWeights[o] = 1;
				continue;
			}
			let s = 0;
			for (let t = 0; t < 4; t++) s += e.skinWeights[a * 4 + t];
			for (let t = 0; t < 4; t++) r.crowdJoints[o + t] = e.skinIndices[a * 4 + t] + n, r.crowdWeights[o + t] = Math.round(e.skinWeights[a * 4 + t] / s * c) / c;
		}
		i += o, a += e.indices.length;
	}
	return d(r), r;
}
function d(e) {
	e.crowdPacked = new Float32Array(e.crowdJoints.length);
	for (let t = 0; t < e.crowdJoints.length; t++) e.crowdPacked[t] = e.crowdJoints[t] * s + Math.round(e.crowdWeights[t] * c);
}
function f(e, t, n, i, a = [
	0,
	0,
	0
]) {
	let o = e.positions[t * 3], s = e.positions[t * 3 + 1], c = e.positions[t * 3 + 2];
	a[0] = 0, a[1] = 0, a[2] = 0;
	for (let l = 0; l < 4; l++) {
		let u = e.crowdWeights[t * 4 + l];
		if (u <= 0) continue;
		let d = (i + e.crowdJoints[t * 4 + l]) * r;
		a[0] += u * (n[d] * o + n[d + 4] * s + n[d + 8] * c + n[d + 12]), a[1] += u * (n[d + 1] * o + n[d + 5] * s + n[d + 9] * c + n[d + 13]), a[2] += u * (n[d + 2] * o + n[d + 6] * s + n[d + 10] * c + n[d + 14]);
	}
	return a;
}
function p(e, t, { duration: n, loop: i = !0, frameRate: o = a } = {}) {
	if (!Number.isFinite(n) || n <= 0) throw RangeError("Crowd duration must be positive.");
	if (!Number.isFinite(o) || o <= 0) throw RangeError("Crowd frame rate must be positive.");
	let s = Math.max(2, Math.round(n * o) + +!i), c = i ? n / s : n / (s - 1), l = e.jointCount * r, u = new Float32Array(s * l);
	for (let n = 0; n < s; n++) t(n * c), e.readJointMatrices(u.subarray(n * l, (n + 1) * l));
	let d = {
		data: u,
		jointCount: e.jointCount,
		frameCount: s,
		frameStep: c,
		duration: n,
		loop: i
	};
	return d.bounds = m(e, d), d;
}
function m(e, t) {
	let n = [
		Infinity,
		Infinity,
		Infinity
	], r = [
		-Infinity,
		-Infinity,
		-Infinity
	], i = [
		0,
		0,
		0
	], a = [];
	for (let { geometry: o } of e.parts) for (let e = 0; e < t.frameCount; e++) for (let s = 0; s < o.positions.length / 3; s++) {
		f(o, s, t.data, e * t.jointCount, i), a.push(i[0], i[1], i[2]);
		for (let e = 0; e < 3; e++) n[e] = Math.min(n[e], i[e]), r[e] = Math.max(r[e], i[e]);
	}
	let o = n.map((e, t) => (e + r[t]) / 2), s = 0;
	for (let e = 0; e < a.length; e += 3) s = Math.max(s, (a[e] - o[0]) ** 2 + (a[e + 1] - o[1]) ** 2 + (a[e + 2] - o[2]) ** 2);
	return Object.freeze({
		center: Object.freeze(o),
		radius: Math.sqrt(s)
	});
}
function h(e, t, n = [
	0,
	0,
	0
]) {
	let r = e.frameCount - 1, a;
	a = e.loop ? (t - Math.floor(t / e.duration) * e.duration) / e.frameStep : Math.min(Math.max(t, 0), e.duration) / e.frameStep;
	let o = Math.floor(a), s = a - o, c = o + 1;
	e.loop ? (o %= e.frameCount, c %= e.frameCount) : o >= r && (o = r, c = r, s = 0);
	let l = e.jointCount * i;
	return n[0] = o * l, n[1] = c * l, n[2] = s, n;
}
function g(e, t, n, r, a = [
	0,
	0,
	0
]) {
	let o = h(e, r), s = f(t, n, e.data, o[0] / i), c = f(t, n, e.data, o[1] / i);
	for (let e = 0; e < 3; e++) a[e] = s[e] * (1 - o[2]) + c[e] * o[2];
	return a;
}
function _(e, { cells: t = o } = {}) {
	let n = v(e.positions);
	return [{
		geometry: e,
		error: 0
	}, ...t.map((t) => {
		let r = t * n;
		return {
			geometry: y(e, r),
			error: r * Math.sqrt(3) / 2
		};
	})];
}
function v(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < e.length; r += 3) for (let i = 0; i < 3; i++) t[i] = Math.min(t[i], e[r + i]), n[i] = Math.max(n[i], e[r + i]);
	return Math.max(...n.map((e, n) => e - t[n]));
}
function y(e, t) {
	let n = e.positions.length / 3, r = new Uint32Array(n), i = /* @__PURE__ */ new Map(), a = [];
	for (let o = 0; o < n; o++) {
		let n = 0;
		for (let t = 1; t < 4; t++) e.crowdWeights[o * 4 + t] > e.crowdWeights[o * 4 + n] && (n = t);
		let s = [
			0,
			1,
			2
		].map((n) => Math.floor(e.positions[o * 3 + n] / t)).join(",") + `:${e.crowdJoints[o * 4 + n]}`;
		i.has(s) || (i.set(s, a.length), a.push({
			vertex: o,
			count: 0,
			position: [
				0,
				0,
				0
			],
			normal: [
				0,
				0,
				0
			],
			uv: [0, 0]
		}));
		let c = i.get(s), l = a[c];
		r[o] = c, l.count++;
		for (let t = 0; t < 3; t++) l.position[t] += e.positions[o * 3 + t], l.normal[t] += e.normals[o * 3 + t];
		e.uvs && (l.uv[0] += e.uvs[o * 2], l.uv[1] += e.uvs[o * 2 + 1]);
	}
	let o = {
		positions: new Float32Array(a.length * 3),
		normals: new Float32Array(a.length * 3),
		...e.uvs ? { uvs: new Float32Array(a.length * 2) } : {},
		crowdJoints: new Float32Array(a.length * 4),
		crowdWeights: new Float32Array(a.length * 4)
	};
	a.forEach((t, n) => {
		let r = Math.hypot(...t.normal) || 1;
		for (let e = 0; e < 3; e++) o.positions[n * 3 + e] = t.position[e] / t.count, o.normals[n * 3 + e] = t.normal[e] / r;
		e.uvs && (o.uvs[n * 2] = t.uv[0] / t.count, o.uvs[n * 2 + 1] = t.uv[1] / t.count), o.crowdJoints.set(e.crowdJoints.subarray(t.vertex * 4, t.vertex * 4 + 4), n * 4), o.crowdWeights.set(e.crowdWeights.subarray(t.vertex * 4, t.vertex * 4 + 4), n * 4);
	});
	let s = [];
	for (let t = 0; t < e.indices.length; t += 3) {
		let n = r[e.indices[t]], i = r[e.indices[t + 1]], a = r[e.indices[t + 2]];
		n !== i && i !== a && n !== a && s.push(n, i, a);
	}
	return o.indices = Uint32Array.from(s), d(o), o;
}
function b({ rig: e, palette: t, instances: n, lods: r = !0, cells: i, farPose: a = null, name: o = "crowd" }) {
	if (!n?.length) throw TypeError("A crowd needs a list of instances.");
	if (a && !(a.distance > 0 && a.rate > 0)) throw RangeError("farPose needs a positive distance and rate.");
	let s = e.parts.map((e) => ({
		...e,
		levels: r && !e.morph ? _(e.geometry, { cells: i }) : null
	})), c = [], l = [];
	return n.forEach((e, n) => {
		let r = [
			0,
			0,
			0
		];
		c.push(r);
		for (let i of s) l.push({
			name: `${o}-${n}-${i.name}`,
			geometry: i.geometry,
			matrix: e.matrix,
			material: i.material,
			crowd: t,
			assembly: {
				offset: r,
				detailOffset: [
					0,
					0,
					0
				]
			},
			...i.morph ? { morph: i.morph } : {},
			...i.levels ? { lods: i.levels } : {}
		});
	}), {
		parts: l,
		setTimes(e, r = null) {
			c.forEach((i, o) => {
				let s = typeof e == "function" ? e(o) : e[o];
				if (a && r) {
					let e = n[o].matrix;
					Math.hypot(e[12] - r[0], e[13] - r[1], e[14] - r[2]) > a.distance && (s = Math.floor(s * a.rate) / a.rate);
				}
				h(t, s, i);
			});
		}
	};
}
export { p as bakeCrowdPalette, _ as createCrowdLods, b as createCrowdParts, l as createCrowdRig, h as crowdFrameBlend, g as crowdVertexAt };
