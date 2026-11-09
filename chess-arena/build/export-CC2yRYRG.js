/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, r as t } from "./morph-CbizhGSZ.js";
import { n, r } from "./gltf-layers-GG4P9DPs.js";
import { a as i } from "./skinning-DjFQA5hH.js";
import { n as a, t as o } from "./export-box-uv-CcWmsskb.js";
import { d as s, h as c, l, n as u, o as d, p as f, u as p } from "./mat4-BCZClxna.js";
import { n as m } from "./quat-Bl7gjwWK.js";
import { a as h } from "./vec3-BRYC6f_g.js";
import { t as g } from "./animation-IxY9GETP.js";
// src/export-png.js
var _ = [
	137,
	80,
	78,
	71,
	13,
	10,
	26,
	10
], v = 65535, y = b();
function b() {
	let e = /* @__PURE__ */ new Uint32Array(256);
	for (let t = 0; t < 256; t++) {
		let n = t;
		for (let e = 0; e < 8; e++) n = n & 1 ? 3988292384 ^ n >>> 1 : n >>> 1;
		e[t] = n >>> 0;
	}
	return e;
}
function x(e) {
	let t = 4294967295;
	for (let n of e) t = y[(t ^ n) & 255] ^ t >>> 8;
	return (t ^ 4294967295) >>> 0;
}
function S(e) {
	let t = 1, n = 0;
	for (let r = 0; r < e.length; r++) t = (t + e[r]) % 65521, n = (n + t) % 65521;
	return (n << 16 | t) >>> 0;
}
function C(e) {
	let t = Math.max(1, Math.ceil(e.length / v)), n = new Uint8Array(2 + e.length + t * 5 + 4), r = new DataView(n.buffer);
	n[0] = 120, n[1] = 1;
	let i = 2;
	for (let a = 0; a < t; a++) {
		let o = a * v, s = Math.min(v, e.length - o);
		n[i] = +(a === t - 1), r.setUint16(i + 1, s, !0), r.setUint16(i + 3, ~s & 65535, !0), n.set(e.subarray(o, o + s), i + 5), i += 5 + s;
	}
	return r.setUint32(i, S(e)), n;
}
function w(e, t) {
	let n = new Uint8Array(12 + t.length), r = new DataView(n.buffer);
	r.setUint32(0, t.length);
	for (let t = 0; t < 4; t++) n[4 + t] = e.charCodeAt(t);
	return n.set(t, 8), r.setUint32(8 + t.length, x(n.subarray(4, 8 + t.length))), n;
}
function ee(e) {
	for (let t = 3; t < e.length; t += 4) if (e[t] !== 255) return !0;
	return !1;
}
function te(e, t, n, { flipRows: r = !1 } = {}) {
	let i = ee(e), a = i ? 4 : 3, o = t * a, s = new Uint8Array((o + 1) * n);
	for (let c = 0; c < n; c++) {
		let l = r ? n - 1 - c : c, u = c * (o + 1);
		s[u] = 0;
		for (let n = 0; n < t; n++) {
			let r = (l * t + n) * 4, o = u + 1 + n * a;
			s[o] = e[r], s[o + 1] = e[r + 1], s[o + 2] = e[r + 2], i && (s[o + 3] = e[r + 3]);
		}
	}
	let c = /* @__PURE__ */ new Uint8Array(13), l = new DataView(c.buffer);
	l.setUint32(0, t), l.setUint32(4, n), c[8] = 8, c[9] = i ? 6 : 2;
	let u = [
		Uint8Array.from(_),
		w("IHDR", c),
		w("IDAT", C(s)),
		w("IEND", /* @__PURE__ */ new Uint8Array())
	], d = new Uint8Array(u.reduce((e, t) => e + t.length, 0)), f = 0;
	for (let e of u) d.set(e, f), f += e.length;
	return d;
}
// src/export-textures.js
var ne = 2048, T = 16384, E = 10497, re = 9987, D = 9729;
function ie(e, t) {
	let n = e?.naturalWidth ?? e?.width, r = e?.naturalHeight ?? e?.height;
	if (!Number.isInteger(n) || !Number.isInteger(r) || n < 1 || r < 1) throw TypeError(`GLB ${t} needs an image with a whole width and height.`);
	if (e?.compressed) throw TypeError(`GLB ${t} is a GPU-compressed texture, which export cannot read back. Transcode KTX2 to RGBA8 to export it.`);
	if (e.data) {
		if (e.data.length < n * r * 4) throw RangeError(`GLB ${t} image data must hold RGBA8 pixels for every texel.`);
		return {
			width: n,
			height: r,
			pixels: e.data
		};
	}
	let i = typeof OffscreenCanvas == "function" ? new OffscreenCanvas(n, r) : globalThis.document?.createElement("canvas");
	if (!i) throw TypeError(`GLB ${t} needs RGBA pixel data ({ width, height, data }) outside a browser.`);
	i.width = n, i.height = r;
	let a = i.getContext("2d");
	return a.drawImage(e, 0, 0), {
		width: n,
		height: r,
		pixels: a.getImageData(0, 0, n, r).data
	};
}
function O(e, t = ne) {
	if (!Number.isInteger(t) || t < 1 || t > T) throw RangeError(`maxTextureSize must be a whole number from 1 to ${T}.`);
	let { document: n } = e;
	n.images = [], n.samplers = [], n.textures = [];
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
	function o(i, a) {
		let o = i.flipY === !0, s = r.get(i.image);
		if (s?.has(o)) return s.get(o);
		let { width: c, height: l, pixels: u } = ie(i.image, a);
		if (c > t || l > t) throw RangeError(`GLB ${a} image is ${c}x${l}, above maxTextureSize ${t}. Resize the image, or pass exportGlb(parts, { maxTextureSize }) up to ${T} if the file size is acceptable.`);
		let d = te(u, c, l, { flipRows: o });
		n.images.push({
			bufferView: e.addBufferView(d),
			mimeType: "image/png"
		});
		let f = n.images.length - 1;
		return r.set(i.image, (s ?? /* @__PURE__ */ new Map()).set(o, f)), f;
	}
	function s(e) {
		let t = {
			magFilter: e.magFilter ?? D,
			minFilter: e.minFilter ?? re,
			wrapS: e.wrapS ?? E,
			wrapT: e.wrapT ?? E
		}, r = JSON.stringify(t);
		return i.has(r) || (i.set(r, n.samplers.length), n.samplers.push(t)), i.get(r);
	}
	return { textureIndex(e, t) {
		if (![0, 1].includes(e.uvChannel ?? 0)) throw RangeError(`GLB ${t} uses UV channel ${e.uvChannel}; only channels 0 and 1 are supported.`);
		let r = o(e, t), i = s(e), c = `${r}:${i}`;
		return a.has(c) || (a.set(c, n.textures.length), n.textures.push({
			sampler: i,
			source: r
		})), a.get(c);
	} };
}
// src/export-writer.js
var k = {
	SCALAR: 1,
	VEC2: 2,
	VEC3: 3,
	VEC4: 4,
	MAT4: 16
}, A = [
	[Float32Array, 5126],
	[Uint32Array, 5125],
	[Uint16Array, 5123],
	[Uint8Array, 5121]
];
function j(e) {
	return Math.ceil(e / 4) * 4;
}
function ae(e) {
	let t = A.find(([t]) => e instanceof t);
	if (!t) throw TypeError("GLB accessors require Float32, Uint32, Uint16 or Uint8 arrays.");
	return t[1];
}
function oe(e, t) {
	let n = Array(t).fill(Infinity), r = Array(t).fill(-Infinity);
	for (let i = 0; i < e.length; i++) {
		let a = i % t;
		n[a] = Math.min(n[a], e[i]), r[a] = Math.max(r[a], e[i]);
	}
	return {
		min: n,
		max: r
	};
}
function se() {
	let e = {
		asset: {
			version: "2.0",
			generator: "67js"
		},
		scene: 0,
		scenes: [{ nodes: [] }],
		nodes: [],
		meshes: [],
		materials: [],
		accessors: [],
		bufferViews: [],
		buffers: []
	}, t = [], n = 0;
	function r(r, i) {
		let a = {
			buffer: 0,
			byteOffset: n,
			byteLength: r.byteLength
		};
		return i !== void 0 && (a.target = i), e.bufferViews.push(a), t.push({
			offset: n,
			data: r
		}), n += j(r.byteLength), e.bufferViews.length - 1;
	}
	function i(t, n, i, { bounds: a = n === "VEC3" } = {}) {
		let o = new Uint8Array(t.buffer, t.byteOffset, t.byteLength), s = k[n], c = {
			bufferView: r(o, i),
			componentType: ae(t),
			count: t.length / s,
			type: n
		};
		return a && Object.assign(c, oe(t, s)), e.accessors.push(c), e.accessors.length - 1;
	}
	function a(t, { required: n = !1 } = {}) {
		e.extensionsUsed = [.../* @__PURE__ */ new Set([...e.extensionsUsed ?? [], t])], n && (e.extensionsRequired = [.../* @__PURE__ */ new Set([...e.extensionsRequired ?? [], t])]);
	}
	function o() {
		e.buffers.push({ byteLength: n });
		for (let t of [
			"skins",
			"animations",
			"images",
			"samplers",
			"textures"
		]) e[t]?.length === 0 && delete e[t];
		let r = new TextEncoder().encode(JSON.stringify(e)), i = j(r.length), a = new ArrayBuffer(20 + i + 8 + n), o = new DataView(a);
		o.setUint32(0, 1179937895, !0), o.setUint32(4, 2, !0), o.setUint32(8, a.byteLength, !0), o.setUint32(12, i, !0), o.setUint32(16, 1313821514, !0);
		let s = new Uint8Array(a);
		s.fill(32, 20, 20 + i), s.set(r, 20);
		let c = 20 + i;
		o.setUint32(c, n, !0), o.setUint32(c + 4, 5130562, !0);
		for (let e of t) s.set(e.data, c + 8 + e.offset);
		return a;
	}
	return {
		document: e,
		addBufferView: r,
		addAccessor: i,
		addExtension: a,
		finish: o
	};
}
// src/export-skeleton.js
var ce = 32, le = {
	translation: "translation",
	rotation: "rotation",
	scale: "scale",
	weights: "weights"
}, ue = {
	translation: 3,
	rotation: 4,
	scale: 3
}, de = {
	translation: "VEC3",
	rotation: "VEC4",
	scale: "VEC3",
	weights: "SCALAR"
}, M = 2300, N = 2301, P = [
	0,
	0,
	0,
	1
];
function F(e, t, n) {
	let r = {};
	return e.some((e) => e !== 0) && (r.translation = Array.from(e)), t.some((e, t) => e !== P[t]) && (r.rotation = Array.from(t)), n.some((e) => e !== 1) && (r.scale = Array.from(n)), r;
}
function I(e) {
	let t = s(h(), e), n = p(h(), e);
	return F(t, l(m(), e), n);
}
function L(e) {
	return d(u(), e.rotation ?? P, e.translation ?? [
		0,
		0,
		0
	], e.scale ?? [
		1,
		1,
		1
	]);
}
function R(e, t, n) {
	if (n.has(e)) return n.get(e);
	let r = t[e], i = L(r), a = r.parent >= 0 ? c(u(), R(r.parent, t, n), i) : i;
	return n.set(e, a), a;
}
function z(e) {
	let t = new Map(e.map((e, t) => [e.id ?? e.name, t]));
	return e.map((e) => {
		if (typeof e.name != "string" || !e.name) throw TypeError("GLB nodes need a name.");
		let n = e.parent === null || e.parent === void 0 ? -1 : t.get(e.parent);
		if (n === void 0) throw RangeError(`GLB node ${e.name} names a parent that is not in the node list.`);
		return {
			name: e.name,
			parent: n,
			translation: e.translation,
			rotation: e.rotation,
			scale: e.scale,
			meshIds: e.meshIds ?? []
		};
	});
}
function B(e, t) {
	return e.jointWorldMatrices.subarray(t * 16, t * 16 + 16);
}
function V(e, t) {
	let n = e.joints?.length;
	if (!Array.isArray(e.joints) || e.inverseBindMatrices?.length !== n * 16 || e.jointWorldMatrices?.length !== n * 16) throw TypeError(`GLB part ${t} has a skin without joints, inverseBindMatrices and jointWorldMatrices. Use the skin that parseGltf returned, or give each joint a name and parent.`);
}
function H(e, t) {
	let n = t.joints.map((t) => {
		let n = e.findIndex((e) => e.name === t.name);
		return n >= 0 ? n : -1;
	});
	t.joints.forEach((r, i) => {
		if (n[i] >= 0) return;
		let a = r.parent ?? -1, o = B(t, i), s = a >= 0 ? B(t, a) : null, l = I(s ? c(u(), f(u(), s), o) : o);
		n[i] = e.length, e.push({
			name: r.name,
			parent: -1,
			...l,
			meshIds: [],
			derivedParentJoint: a
		});
	}), t.joints.forEach((t, r) => {
		let i = e[n[r]];
		i.derivedParentJoint !== void 0 && (i.parent = i.derivedParentJoint >= 0 ? n[i.derivedParentJoint] : -1);
	});
}
function fe(e, t) {
	let n = t ? z(t) : [];
	for (let r of e) {
		if (!r.skin) continue;
		V(r.skin, r.name);
		let e = r.skin.joints.find((e) => !n.some((t) => t.name === e.name));
		if (e && t) throw RangeError(`GLB skin joint ${e.name} of part ${r.name} is not in options.nodes. Pass the nodes of the same parsed asset.`);
		t || H(n, r.skin);
	}
	return n;
}
function U(e, t, n) {
	let r = t.findIndex((t) => t.meshIds.includes(`mesh-${e}`));
	return r < 0 ? null : {
		index: r,
		world: R(r, t, n)
	};
}
function W(e, t) {
	return c(u(), f(u(), t), e);
}
function pe(e) {
	return F(e.translation ?? [
		0,
		0,
		0
	], e.rotation ?? P, e.scale ?? [
		1,
		1,
		1
	]);
}
function me(e, t, n, r) {
	if (r.has(t)) return r.get(t);
	let i = t.joints.length, a = new Float32Array(i * 16), o = t.bindMatrix ?? u();
	for (let e = 0; e < i; e++) {
		let n = t.inverseBindMatrices.subarray(e * 16, e * 16 + 16);
		a.set(c(u(), n, o), e * 16);
	}
	return e.document.skins ??= [], e.document.skins.push({
		joints: t.joints.map((e) => n.get(e.name)),
		inverseBindMatrices: e.addAccessor(a, "MAT4", void 0, { bounds: !1 })
	}), r.set(t, e.document.skins.length - 1), e.document.skins.length - 1;
}
function he(e) {
	let t = new Float32Array(e.length);
	for (let n = 0; n < e.length; n += 4) {
		let r = e[n] + e[n + 1] + e[n + 2] + e[n + 3];
		for (let i = 0; i < 4; i++) t[n + i] = e[n + i] / r;
	}
	return t;
}
function ge(e) {
	if (e.property !== "weights") return ue[e.property];
	let t = e.keyframes[0].value.length, n = e.keyframes.every((e) => e.value.length === t && Array.from(e.value).every(Number.isFinite));
	if (!t || !n) throw RangeError(`GLB weights track on ${e.target} needs the same nonzero count of finite weights in every keyframe.`);
	return t;
}
function _e(e) {
	let t = Array(ge(e)).fill(0), n = [];
	for (let r of e.keyframes) {
		let i = Array.isArray(r.value) ? r.value : Array.from(r.value);
		e.interpolation === "CUBICSPLINE" ? n.push(Array.from(r.inTangent), i, Array.from(r.outTangent)) : e.interpolation === "SMOOTH" ? n.push(t, i, t) : n.push(i);
	}
	return Float32Array.from(n.flat());
}
var G = {
	LINEAR: "LINEAR",
	STEP: "STEP",
	SMOOTH: "CUBICSPLINE",
	CUBICSPLINE: "CUBICSPLINE"
};
function ve(e, t, n, r) {
	let i = g(n, ce), a = i === n.keyframes ? n : {
		...n,
		keyframes: i,
		interpolation: "LINEAR"
	}, o = le[a.property];
	if (!o) throw RangeError(`GLB export cannot write ${a.property} tracks (target ${a.target}). Only translation, rotation, scale and weights tracks are exported; remove the others from the clip.`);
	let s = Float32Array.from(a.keyframes, (e) => e.time);
	t.samplers.push({
		input: e.addAccessor(s, "SCALAR", void 0, { bounds: !0 }),
		output: e.addAccessor(_e(a), de[a.property], void 0, { bounds: !1 }),
		interpolation: G[a.interpolation ?? "LINEAR"]
	}), t.channels.push({
		sampler: t.samplers.length - 1,
		target: {
			node: r,
			path: o
		}
	});
}
function ye(e, t, n, r) {
	e.document.animations = [], t.forEach((t, i) => {
		if (!Array.isArray(t?.tracks) || !t.tracks.length) throw TypeError(`GLB clip ${i} needs tracks. Build it with createAnimationClip or clipFromGltfAnimation.`);
		let a = {
			name: t.name ?? `clip ${i}`,
			samplers: [],
			channels: []
		};
		for (let i of t.tracks) {
			let t = n.get(i.target);
			if (t === void 0) throw RangeError(`GLB clip ${a.name} targets ${i.target}, which is no exported node. Pass options.nodes from the parsed asset, or name a part or joint.`);
			r(t), ve(e, a, i, t);
		}
		e.document.animations.push(a);
	});
}
function be(e) {
	let t = [];
	for (let n of e.tracks) {
		let e = n.name.lastIndexOf(".");
		if (n.name.slice(e + 1) !== "morphTargetInfluences") continue;
		let r = n.name.slice(0, e), i = n.getInterpolation?.();
		if (i !== N && i !== M) throw RangeError(`GLB export cannot write cubic morph weights on ${r}. Re-key them as linear or step.`);
		let a = n.values.length / n.times.length;
		t.push({
			target: r,
			property: "weights",
			interpolation: i === M ? "STEP" : "LINEAR",
			keyframes: Array.from(n.times, (e, t) => ({
				time: e,
				value: Array.from(n.values.subarray(t * a, (t + 1) * a))
			}))
		});
	}
	return t;
}
// src/export.js
var K = "KHR_materials_emissive_strength";
function q(e, t, n, r = !1) {
	if (!(e instanceof Float32Array) || e.length !== t) throw TypeError(`${n} requires a Float32Array matching the vertex count.`);
	for (let t of e) if (!Number.isFinite(t) || r && (t < 0 || t > 1)) throw RangeError(`${n} requires finite values${r ? " within [0,1]" : ""}.`);
}
var J = {
	mask: "MASK",
	blend: "BLEND",
	add: "BLEND"
};
function xe(e, t) {
	let n = t.alphaMode ?? "opaque";
	if (n !== "opaque") {
		if (!Object.hasOwn(J, n)) throw Error("alphaMode must be 'opaque', 'mask', 'blend' or 'add'.");
		e.alphaMode = J[n], Y(t.opacity ?? 1, "opacity"), e.pbrMetallicRoughness.baseColorFactor[3] = t.opacity ?? 1;
	}
	n === "mask" && (Y(t.alphaCutoff ?? .5, "alphaCutoff"), e.alphaCutoff = t.alphaCutoff ?? .5), t.doubleSided === !0 && (e.doubleSided = !0);
}
function Y(e, t, n = 1) {
	if (!Number.isFinite(e) || !Number.isFinite(Math.fround(e)) || e < 0 || e > n) throw RangeError(`${t} requires a finite nonnegative Float32 value${n === 1 ? " within [0,1]" : ""}.`);
}
function X(e, t) {
	if (!e || e.length !== 3) throw TypeError(`${t} requires three linear RGB components.`);
	for (let n of e) Y(n, t);
}
function Se(e) {
	let t = e?.positions?.length;
	if (!Number.isSafeInteger(t) || t < 3 || t % 3 != 0) throw TypeError("GLB positions require a nonempty array of XYZ vertices.");
	q(e.positions, t, "GLB positions"), q(e.normals, t, "GLB normals");
	for (let n = 0; n < t; n += 3) {
		let t = Math.hypot(e.normals[n], e.normals[n + 1], e.normals[n + 2]);
		if (Math.abs(t - 1) > .001) throw RangeError("GLB normals require unit vectors.");
	}
	if (e.colors !== void 0 && q(e.colors, t, "GLB colors", !0), e.uvs !== void 0 && q(e.uvs, t / 3 * 2, "GLB UVs"), !(e.indices instanceof Uint32Array) || e.indices.length === 0 || e.indices.length % 3 != 0) throw TypeError("GLB indices require a nonempty Uint32Array of triangles.");
	for (let n of e.indices) if (n >= t / 3) throw RangeError("GLB index exceeds the vertex count.");
}
function Ce(e) {
	if (!e || e.length !== 16 || Array.from(e).some((e) => !Number.isFinite(e) || !Number.isFinite(Math.fround(e)))) throw RangeError("GLB matrix requires 16 finite components.");
	if (e[3] !== 0 || e[7] !== 0 || e[11] !== 0 || e[15] !== 1) throw RangeError("GLB matrix requires an affine transform.");
	Te(e);
}
function we(e) {
	let t = e.material;
	if (!t || typeof t != "object") throw TypeError("GLB parts require a material.");
	X(t.color, "GLB base color"), X(t.emissiveColor ?? t.color, "GLB emissive color"), Y(t.metallic, "GLB metallic factor"), Y(t.roughness, "GLB roughness factor"), Y(t.emission ?? 0, "GLB emission", Infinity);
}
function Te(e) {
	let t = [
		0,
		4,
		8
	].map((t) => {
		let n = [
			Math.fround(e[t]),
			Math.fround(e[t + 1]),
			Math.fround(e[t + 2])
		], r = Math.hypot(...n);
		if (r === 0) throw RangeError("GLB matrix requires nonzero scales.");
		return n.map((e) => e / r);
	}), n = 8 * 2 ** -23;
	for (let e = 0; e < 3; e++) for (let r = e + 1; r < 3; r++) {
		let i = 0;
		for (let n = 0; n < 3; n++) i += t[e][n] * t[r][n];
		if (Math.abs(i) > n) throw RangeError("GLB matrix cannot preserve shear. Use a transform with orthogonal rotation and scale columns.");
	}
}
var Z = [
	"map",
	"normalMap",
	"metallicRoughnessMap",
	"occlusionMap",
	"emissiveMap"
], Q = [
	"clips",
	"nodes",
	"maxTextureSize"
];
function Ee(e) {
	if (!e || typeof e != "object") throw TypeError("GLB export options must be an object.");
	for (let t of Object.keys(e)) if (!Q.includes(t)) throw TypeError(`GLB export does not take ${t}. Options: ${Q.join(", ")}.`);
	if (e.clips !== void 0 && !Array.isArray(e.clips)) throw TypeError("GLB export clips must be an array.");
	if (e.nodes !== void 0 && !Array.isArray(e.nodes)) throw TypeError("GLB export nodes must be an array.");
}
function De(e) {
	i(e.geometry, e.skin);
}
function Oe() {
	let e = /* @__PURE__ */ new WeakMap(), t = 0;
	return (n) => (e.has(n) || e.set(n, t++), e.get(n));
}
function ke(e, t) {
	let n = [...Z, "lightMap"].map((n) => e[n] ? t(e[n]) : null), r = Object.entries(e.layerMaps ?? {}).map(([e, n]) => [e, t(n)]), i = { ...e };
	for (let e of [
		...Z,
		"lightMap",
		"layerMaps",
		"pattern",
		"boxMapScale",
		"boxMapAxis"
	]) delete i[e];
	return JSON.stringify([
		i,
		n,
		r,
		e.boxMapScale ?? 0,
		e.boxMapAxis ?? 1
	]);
}
function Ae(e, t, r, i) {
	for (let [a, o] of n) {
		let n = r.layerMaps?.[o];
		n && (i[a] || (i[a] = {}, e.addExtension(a)), i[a][o] = $(t, n, o));
	}
}
function $(e, t, n) {
	let r = { index: e.textureIndex(t, n) };
	return t.uvChannel === 1 && (r.texCoord = 1), r;
}
function je(e, t, n, r) {
	if (!n.lightMap || n.emissiveMap || (n.emission ?? 0) !== 0) return;
	r.emissiveFactor = n.color.map((e) => e * (1 - n.metallic)), r.emissiveTexture = {
		index: t.textureIndex(n.lightMap, "lightMap"),
		texCoord: 1
	};
	let i = n.lightMapScale ?? 1;
	i !== 1 && (r.extensions = {
		...r.extensions,
		[K]: { emissiveStrength: i }
	}, e.addExtension(K, { required: !0 }));
}
function Me(e, t, n) {
	let i = {
		baseColorFactor: [...n.color, 1],
		metallicFactor: n.metallic,
		roughnessFactor: n.roughness
	}, a = {
		pbrMetallicRoughness: i,
		emissiveFactor: (n.emission ?? 0) === 0 ? [
			0,
			0,
			0
		] : Array.from(n.emissiveColor ?? n.color)
	};
	xe(a, n);
	let o = r(n);
	for (let t of Object.keys(o)) e.addExtension(t);
	Ae(e, t, n, o), Object.keys(o).length > 0 && (a.extensions = o);
	let s = n.emission ?? 0;
	s !== 0 && s !== 1 && (a.extensions = {
		...a.extensions,
		[K]: { emissiveStrength: s }
	}, e.addExtension(K, { required: !0 }));
	let c = (e) => $(t, n[e], e);
	return n.map && (i.baseColorTexture = c("map")), n.metallicRoughnessMap && (i.metallicRoughnessTexture = c("metallicRoughnessMap")), n.normalMap && (a.normalTexture = {
		...c("normalMap"),
		scale: n.normalScale?.[0] ?? 1
	}), n.occlusionMap && (a.occlusionTexture = {
		...c("occlusionMap"),
		strength: n.occlusionStrength ?? 1
	}), n.emissiveMap && (a.emissiveTexture = c("emissiveMap")), je(e, t, n, a), a;
}
function Ne(e, t) {
	let n = 34962, r = {
		POSITION: e.addAccessor(t.positions, "VEC3", n),
		NORMAL: e.addAccessor(t.normals, "VEC3", n)
	}, i = {
		attributes: r,
		indices: e.addAccessor(t.indices, "SCALAR", 34963)
	};
	return t.colors && (r.COLOR_0 = e.addAccessor(t.colors, "VEC3", n)), t.uvs && (r.TEXCOORD_0 = e.addAccessor(t.uvs, "VEC2", n)), t.lightUvs && (r.TEXCOORD_1 = e.addAccessor(t.lightUvs, "VEC2", n)), t.skinIndices && (r.JOINTS_0 = e.addAccessor(Uint16Array.from(t.skinIndices), "VEC4", n, { bounds: !1 }), r.WEIGHTS_0 = e.addAccessor(he(t.skinWeights), "VEC4", n, { bounds: !1 })), t.morphTargets && (i.targets = t.morphTargets.map((t) => {
		let r = {};
		return t.positions && (r.POSITION = e.addAccessor(t.positions, "VEC3", n)), t.normals && (r.NORMAL = e.addAccessor(t.normals, "VEC3", n)), r;
	})), i;
}
function Pe(e) {
	let t = Z.some((t) => e.material[t]), n = (e.material.boxMapScale ?? 0) > 0;
	if (t && !n && !e.geometry.uvs) throw RangeError(`GLB part ${e.name} has textures but its geometry has no uvs. Add a uv_unwrap node to the mesh stack, or set geometry.uvs.`);
}
function Fe(n, r = {}) {
	if (!Array.isArray(n) || n.length === 0) throw TypeError("GLB export requires a nonempty parts array.");
	Ee(r);
	let i = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
	for (let r of n) {
		i.has(r?.geometry) || (Se(r?.geometry), i.add(r.geometry)), we(r);
		let n = s.get(r.geometry);
		n ? t(r.morph, n) : s.set(r.geometry, e(r.geometry, r.morph)), De(r), Pe(r);
	}
	let c = fe(n, r.nodes), l = /* @__PURE__ */ new Map();
	n.forEach((e, t) => {
		if (e.skin) return;
		let n = e.matrix?.length === 16 ? U(t, c, l) : null;
		Ce(n ? W(e.matrix, n.world) : e.matrix);
	});
	let u = se(), { document: d } = u, f = O(u, r.maxTextureSize), p = new Map(c.map((e, t) => [e.name, t])), m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), v = Oe();
	function y(e) {
		let t = (e.material.boxMapScale ?? 0) > 0, n = a(e.matrix), r = t ? `box:${e.material.boxMapScale}:${e.material.boxMapAxis ?? 1}:${n.join(",")}` : "authored";
		m.has(e.geometry) || m.set(e.geometry, /* @__PURE__ */ new Map());
		let i = m.get(e.geometry);
		if (!i.has(r)) {
			let a = t ? o(e.geometry, n, e.material.boxMapScale, e.material.boxMapAxis ?? 1) : e.geometry;
			i.set(r, Ne(u, a));
		}
		return i.get(r);
	}
	for (let e of c) d.nodes.push({
		name: e.name,
		...pe(e)
	});
	c.forEach((e, t) => {
		e.parent >= 0 && (d.nodes[e.parent].children ??= []).push(t);
	});
	let b = c.flatMap((e, t) => e.parent < 0 ? [t] : []);
	if (n.forEach((e, t) => {
		let n = y(e), r = ke(e.material, v);
		h.has(r) || (h.set(r, d.materials.length), d.materials.push(Me(u, f, e.material)));
		let i = h.get(r), a = `${n.indices}:${i}`;
		if (!g.has(a)) {
			g.set(a, d.meshes.length);
			let t = e.geometry.morphTargetNames;
			d.meshes.push({
				primitives: [{
					...n,
					material: i
				}],
				...t ? { extras: { targetNames: t } } : {}
			});
		}
		let o = e.skin ? null : U(t, c, l), s = o && c[o.index].name === e.name && c[o.index].meshIds.length === 1, m = p.has(e.name) ? `${e.name} mesh` : e.name, x = s ? d.nodes[o.index] : { name: m };
		if (x.mesh = g.get(a), e.morph && (x.weights = Array.from(e.morph.weights)), e.skin ? x.skin = me(u, e.skin, p, _) : s || (x.matrix = Array.from(o ? W(e.matrix, o.world) : e.matrix)), s) return;
		d.nodes.push(x);
		let S = d.nodes.length - 1;
		o ? (d.nodes[o.index].children ??= []).push(S) : b.push(S);
	}), d.scenes[0].nodes = b, r.clips?.length) {
		for (let [e, t] of d.nodes.entries()) p.has(t.name) || p.set(t.name, e);
		ye(u, r.clips, p, (e) => {
			let t = d.nodes[e];
			t.matrix && (Object.assign(t, I(t.matrix)), delete t.matrix);
		});
	}
	return u.finish();
}
export { be as n, Fe as t };
