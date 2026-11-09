/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import "./shader-registry-DHYkwAg5.js";
import { f as e, h as t, l as n, o as r, r as i } from "./mat4-BCZClxna.js";
import { a, i as o, t as s } from "./gltf-layers-GG4P9DPs.js";
import { c } from "./quat-Bl7gjwWK.js";
import { a as l, i as u, n as d, o as f, t as p } from "./skinning-DjFQA5hH.js";
import { n as m } from "./renderer-GTkED2u-.js";
import { i as h, n as g, r as _, t as v } from "./morph-CbizhGSZ.js";
// src/gltf-accessors.js
var y = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
}, b = {
	SCALAR: 1,
	VEC2: 2,
	VEC3: 3,
	VEC4: 4,
	MAT2: 4,
	MAT3: 9,
	MAT4: 16
}, x = {
	5120: 127,
	5121: 255,
	5122: 32767,
	5123: 65535
};
function S(e) {
	let t = e.count * e.itemSize, n = new Float32Array(t), r = e.normalized ? x[e.componentType] : 1;
	for (let i = 0; i < t; i++) {
		let t = e.array[i];
		n[i] = r === 1 ? t : Math.max(t / r, -1);
	}
	return n;
}
function C(e) {
	return y[e.componentType].BYTES_PER_ELEMENT * b[e.type];
}
function w(e, t, n, r, i) {
	if (r > 0 && t + (r - 1) * n + i > e.length) throw Error("glTF accessor exceeds its buffer view.");
	let a = new Uint8Array(r * i);
	for (let o = 0; o < r; o++) {
		let r = t + o * n;
		a.set(e.subarray(r, r + i), o * i);
	}
	return a;
}
function ee(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	function i(e) {
		let n = t(e.buffer), r = e.byteOffset ?? 0, i = e.byteLength;
		if (!n || !Number.isSafeInteger(i) || i < 0 || r < 0 || r + i > n.length) throw Error("glTF buffer view exceeds its buffer.");
		return n.subarray(r, r + i);
	}
	async function a() {
		let i = e.bufferViews ?? [];
		if (!i.some((e) => e.extensions?.EXT_meshopt_compression)) return;
		let { decodeMeshoptViews: a } = await import("./gltf-meshopt-BGQViuu9.js");
		for (let [e, o] of await a(i, t, n)) r.set(e, o);
	}
	function o(t) {
		let n = e.bufferViews?.[t];
		if (!n) throw Error("Invalid glTF buffer view index.");
		return r.has(t) || r.set(t, i(n)), r.get(t);
	}
	function s(t) {
		let n = e.accessors?.[t];
		if (!n) throw Error("Invalid glTF accessor index.");
		let r = y[n.componentType];
		if (!r) throw Error("Unsupported glTF accessor component type.");
		let i = b[n.type], a = C(n), s;
		if (n.bufferView === void 0) s = new Uint8Array(n.count * a);
		else {
			let t = e.bufferViews[n.bufferView].byteStride || a;
			s = w(o(n.bufferView), n.byteOffset ?? 0, t, n.count, a);
		}
		let l = new r(s.buffer);
		return n.sparse && c(n, l, i), {
			array: l,
			itemSize: i,
			count: n.count,
			normalized: n.normalized === !0,
			componentType: n.componentType
		};
	}
	function c(e, t, n) {
		let { count: r, indices: i, values: a } = e.sparse, s = y[i.componentType];
		if (!s) throw Error("Unsupported sparse index component type.");
		let c = new s(w(o(i.bufferView), i.byteOffset ?? 0, s.BYTES_PER_ELEMENT, r, s.BYTES_PER_ELEMENT).buffer), l = t.BYTES_PER_ELEMENT * n, u = w(o(a.bufferView), a.byteOffset ?? 0, l, r, l), d = new t.constructor(u.buffer);
		for (let i = 0; i < r; i++) {
			if (c[i] >= e.count) throw Error("Sparse accessor index is out of range.");
			t.set(d.subarray(i * n, (i + 1) * n), c[i] * n);
		}
	}
	return {
		prepare: a,
		readAccessor: s,
		viewBytes: o
	};
}
// src/gltf-animation.js
var T = 2300, E = 2301, D = 2302, O = {
	STEP: T,
	LINEAR: E,
	CUBICSPLINE: D
}, k = {
	translation: "position",
	rotation: "quaternion",
	scale: "scale",
	weights: "morphTargetInfluences"
}, A = /* @__PURE__ */ new WeakMap();
function j(e, t) {
	let n = 0, r = e.length - 1;
	for (; r - n > 1;) {
		let i = n + r >> 1;
		e[i] <= t ? n = i : r = i;
	}
	return n;
}
function te(e, t, n, r, i) {
	let [a, o, s, c] = [
		t[n],
		t[n + 1],
		t[n + 2],
		t[n + 3]
	], [l, u, d, f] = [
		t[r],
		t[r + 1],
		t[r + 2],
		t[r + 3]
	], p = 1 - i, m = i, h = a * l + o * u + s * d + c * f, g = h >= 0 ? 1 : -1, _ = 1 - h * h;
	if (_ > 2 ** -52) {
		let e = Math.sqrt(_), t = Math.atan2(e, h * g);
		p = Math.sin(p * t) / e, m = Math.sin(m * t) / e;
	}
	let v = m * g;
	if (a = a * p + l * v, o = o * p + u * v, s = s * p + d * v, c = c * p + f * v, p === 1 - i) {
		let e = 1 / Math.hypot(a, o, s, c);
		a *= e, o *= e, s *= e, c *= e;
	}
	e[0] = a, e[1] = o, e[2] = s, e[3] = c;
}
function M(e, t, n, r) {
	for (let i = 0; i < r; i++) n[i] = e.values[t * r + i];
}
function N(e, t, n, r, i, a) {
	let o = e.times[t], s = e.times[t + 1], c = (n - o) / (s - o);
	if (a) te(r, e.values, t * 4, (t + 1) * 4, c);
	else for (let n = 0; n < i; n++) {
		let a = e.values[t * i + n], o = e.values[(t + 1) * i + n];
		r[n] = a * (1 - c) + o * c;
	}
}
function ne(e, t, n, r, i, a) {
	let o = e.times[t], s = e.times[t + 1] - o, c = (n - o) / s, l = c * c, u = l * c, d = -2 * u + 3 * l, f = u - l, p = 1 - d, m = f - l + c, h = i * 3, g = t * h, _ = (t + 1) * h;
	for (let t = 0; t < i; t++) {
		let n = e.values[g + i + t], a = e.values[g + 2 * i + t] * s, o = e.values[_ + i + t], c = e.values[_ + t] * s;
		r[t] = p * n + m * a + d * o + f * c;
	}
	if (a) {
		let e = 1 / Math.hypot(r[0], r[1], r[2], r[3]);
		for (let t = 0; t < 4; t++) r[t] *= e;
	}
}
function P(e, t, n) {
	let r = e.interpolation === D, i = e.values.length / e.times.length / (r ? 3 : 1), a = e.times.length - 1, o = t <= e.times[0] ? 0 : t >= e.times[a] ? a : -1;
	if (o >= 0) {
		let t = (r ? o * 3 + 1 : o) * i;
		for (let r = 0; r < i; r++) n[r] = e.values[t + r];
		return n;
	}
	let s = j(e.times, t), c = e.name.endsWith(".quaternion");
	return e.interpolation === 2300 ? M(e, s, n, i) : r ? ne(e, s, t, n, i, c) : N(e, s, t, n, i, c), n;
}
function F(e, t, n, r) {
	let i = {
		name: e,
		times: t,
		values: n,
		interpolation: r,
		getInterpolation() {
			return r;
		},
		getValueSize() {
			return n.length / t.length;
		},
		createInterpolant(e) {
			let t = i.getValueSize() / (r === 2302 ? 3 : 1);
			return { evaluate: (n) => P(i, n, e.subarray(0, t)) };
		}
	};
	return i;
}
function I(e) {
	for (let t = 0; t < e.length; t++) if (e[t] < 0 || t && e[t] <= e[t - 1]) throw Error("Animation times must be nonnegative and strictly increasing.");
}
function L(e, t) {
	let n = t === D;
	for (let t = n ? 4 : 0; t < e.length; t += n ? 12 : 4) {
		let n = Math.hypot(e[t], e[t + 1], e[t + 2], e[t + 3]);
		if (Math.abs(n - 1) > .01) throw Error("Animation rotation values require unit quaternions.");
	}
}
function R(e) {
	return e.name ? e.name : e.association?.nodes === void 0 ? e.uuid : `node-${e.association.nodes}`;
}
function z(e, t, n, r) {
	let i = O[t.interpolation ?? "LINEAR"], a = S(r(t.input));
	I(a);
	let o = S(r(t.output));
	if (!a.every(Number.isFinite) || !o.every(Number.isFinite)) throw Error("Animation times and values must be finite.");
	let s = e.target.path;
	s === "rotation" && L(o, i);
	let c = k[s];
	if (s !== "weights") {
		let e = F(`${R(n)}.${c}`, a, o, i);
		return A.set(e, n), [e];
	}
	return [n, ...n.children].filter((e) => e.morphTargetInfluences).map((e) => {
		let t = F(`${R(e)}.${c}`, a, o, i);
		return A.set(t, e), t;
	});
}
function re(e, t, n) {
	return (e.animations ?? []).map((e, r) => {
		let i = [];
		for (let r of e.channels ?? []) {
			if (r.target.node === void 0) continue;
			let a = e.samplers[r.sampler];
			i.push(...z(r, a, t(r.target.node), n));
		}
		let a = Math.max(0, ...i.map((e) => e.times[e.times.length - 1]));
		return {
			name: e.name ? e.name : `animation_${r}`,
			duration: a,
			tracks: i
		};
	});
}
function ie(e, t) {
	let n = Math.max(0, Math.min(t, e.duration));
	for (let t of e.tracks) {
		let e = A.get(t), r = P(t, n, new Float64Array(t.getValueSize() / (t.interpolation === 2302 ? 3 : 1))), i = t.name.slice(t.name.lastIndexOf(".") + 1);
		if (i === "morphTargetInfluences") for (let t = 0; t < r.length; t++) e.morphTargetInfluences[t] = r[t];
		else e[i].fromArray(r);
	}
}
// src/compressed-texture.js
var ae = "EXT_texture_compression_bptc", B = "WEBGL_compressed_texture_s3tc", V = "WEBGL_compressed_texture_s3tc_srgb", H = "WEBGL_compressed_texture_astc", U = "WEBGL_compressed_texture_etc", oe = /* @__PURE__ */ new Map([
	[36492, {
		name: "bc7",
		extension: ae,
		srgbFormat: 36493,
		blockBytes: 16
	}],
	[33776, {
		name: "bc1-rgb",
		extension: B,
		srgbExtension: V,
		srgbFormat: 35916,
		blockBytes: 8,
		strictBlocks: !0
	}],
	[33777, {
		name: "bc1-rgba",
		extension: B,
		srgbExtension: V,
		srgbFormat: 35917,
		blockBytes: 8,
		strictBlocks: !0
	}],
	[33779, {
		name: "bc3",
		extension: B,
		srgbExtension: V,
		srgbFormat: 35919,
		blockBytes: 16,
		strictBlocks: !0
	}],
	[37808, {
		name: "astc-4x4",
		extension: H,
		srgbFormat: 37840,
		blockBytes: 16
	}],
	[37492, {
		name: "etc2-rgb",
		extension: U,
		srgbFormat: 37493,
		blockBytes: 8
	}],
	[37496, {
		name: "etc2-rgba",
		extension: U,
		srgbFormat: 37497,
		blockBytes: 16
	}]
]), se = 4;
function ce(e) {
	return Math.ceil(e / se);
}
function le(e, t, n) {
	return ce(e) * ce(t) * n;
}
function ue(e, t) {
	return Math.floor(Math.log2(Math.max(e, t))) + 1;
}
function de(e) {
	return oe.get(e) ?? null;
}
function W(e, t, n, r) {
	let i = de(e);
	if (!i) throw Error(`${n} decoded to GPU format ${e}, which 67js does not upload. Use BC7, BC1, BC3, ASTC 4x4 or ETC2, or transcode to RGBA8 (see docs/gltf.md).`);
	if (!Array.isArray(t) || !t.length) throw Error(`${n} compressed texture has no mip levels.`);
	let [a] = t;
	if (i.strictBlocks && (a.width % se || a.height % se)) throw Error(`${n} ${i.name} texture must have width and height in multiples of 4.`);
	let o = t.length === ue(a.width, a.height) ? t : [a];
	for (let e of o) if (!(e.data instanceof Uint8Array) || e.data.length !== le(e.width, e.height, i.blockBytes)) throw Error(`${n} ${i.name} mip level data does not match its size.`);
	let s = o.reduce((e, t) => e + t.data.length, 0), c = r !== "linear", l = c && i.srgbExtension ? i.srgbExtension : i.extension, u = c ? i.srgbFormat : e;
	return {
		width: a.width,
		height: a.height,
		compressed: {
			name: i.name,
			levels: o,
			bytes: s,
			minFilter: fe(o.length),
			upload: (e) => pe(e, o, u, l)
		}
	};
}
function fe(e) {
	return (t) => e === 1 && t >= 9984 ? 9728 + (t & 1) : t;
}
function pe(e, t, n, r) {
	if (!e.getExtension(r)) throw Error(`This context lacks ${r}, which the compressed texture needs. Transcode KTX2 for this context with ktx2WorkerConfigFor(context) (see docs/gltf.md).`);
	e.texStorage2D(e.TEXTURE_2D, t.length, n, t[0].width, t[0].height), t.forEach((t, r) => {
		e.compressedTexSubImage2D(e.TEXTURE_2D, r, 0, 0, t.width, t.height, n, t.data);
	});
}
function me(e) {
	let t = (t) => !!e.getExtension(t);
	return {
		astcSupported: t(H),
		astcHDRSupported: !1,
		etc1Supported: !1,
		etc2Supported: t(U),
		dxtSupported: t(B) && t(V),
		bptcSupported: t(ae),
		pvrtcSupported: !1
	};
}
// src/gltf-nodes.js
var he = class {
	constructor(e) {
		this.values = e;
	}
	toArray() {
		return [...this.values];
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < this.values.length; n++) this.values[n] = e[t + n];
		return this;
	}
}, G = class {
	constructor() {
		this.elements = e(/* @__PURE__ */ new Float64Array(16));
	}
	fromArray(e, t = 0) {
		for (let n = 0; n < 16; n++) this.elements[n] = e[t + n];
		return this;
	}
	copy(e) {
		return this.elements.set(e.elements), this;
	}
	multiplyMatrices(e, n) {
		return t(this.elements, e.elements, n.elements), this;
	}
	determinant() {
		return i(this.elements);
	}
	compose(e, t, n) {
		return r(this.elements, t.values, e.values, n.values), this;
	}
	decompose(e, t, r) {
		let i = this.elements, a = Math.hypot(i[0], i[1], i[2]), o = Math.hypot(i[4], i[5], i[6]), s = Math.hypot(i[8], i[9], i[10]);
		this.determinant() < 0 && (a = -a), e.fromArray([
			i[12],
			i[13],
			i[14]
		]);
		let l = /* @__PURE__ */ new Float64Array(16);
		l[15] = 1;
		for (let e = 0; e < 3; e++) l[e] = i[e] / a, l[4 + e] = i[4 + e] / o, l[8 + e] = i[8 + e] / s;
		return t.fromArray(c(/* @__PURE__ */ new Float64Array(4), n(/* @__PURE__ */ new Float64Array(4), l))), r.fromArray([
			a,
			o,
			s
		]), this;
	}
}, ge = 1, _e = class {
	constructor() {
		this.uuid = `node-uuid-${ge++}`, this.name = "", this.parent = null, this.children = [], this.position = new he([
			0,
			0,
			0
		]), this.quaternion = new he([
			0,
			0,
			0,
			1
		]), this.scale = new he([
			1,
			1,
			1
		]), this.matrix = new G(), this.matrixWorld = new G(), this.matrixAutoUpdate = !0, this.matrixWorldNeedsUpdate = !1, this.association = {};
	}
	add(e) {
		e.parent = this, this.children.push(e);
	}
	traverse(e) {
		e(this);
		for (let t of this.children) t.traverse(e);
	}
	updateMatrix() {
		this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
	}
	updateMatrixWorld() {
		this.matrixAutoUpdate && this.updateMatrix(), this.parent ? this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix) : this.matrixWorld.copy(this.matrix), this.matrixWorldNeedsUpdate = !1;
		for (let e of this.children) e.updateMatrixWorld();
	}
	getMatrixAt(e, t) {
		return t.fromArray(this.instanceMatrices, e * 16);
	}
}, ve = {
	POSITION: "position",
	NORMAL: "normal",
	COLOR_0: "color",
	TEXCOORD_0: "uv",
	TEXCOORD_1: "uv1",
	JOINTS_0: "skinIndex",
	WEIGHTS_0: "skinWeight"
}, ye = [
	[
		"map",
		"baseColorTexture",
		!0
	],
	[
		"normalMap",
		"normalTexture",
		!1
	],
	[
		"metalnessMap",
		"metallicRoughnessTexture",
		!0
	],
	[
		"aoMap",
		"occlusionTexture",
		!1
	],
	[
		"emissiveMap",
		"emissiveTexture",
		!1
	]
], be = [
	137,
	80,
	78,
	71
], xe = [
	82,
	73,
	70,
	70,
	null,
	null,
	null,
	null,
	87,
	69,
	66,
	80
], Se = "srgb-linear", Ce = new Map(Object.entries(y).map(([e, t]) => [t, Number(e)]));
function K(e, t, n, r, i, a = 1) {
	if (n > i * a) {
		let o = a > 1 ? ` x ${a}` : "";
		e.push({
			text: `${t} ${n}, over ${r} ${i}${o}`,
			option: r,
			needed: Math.ceil(n / a)
		});
	}
	return e;
}
function q(e) {
	if (!e.length) return;
	let t = /* @__PURE__ */ new Map();
	for (let n of e) t.set(n.option, Math.max(t.get(n.option) ?? 0, n.needed));
	let n = [...t].map(([e, t]) => `${e}: ${t}`).join(", ");
	throw RangeError(`glTF over its limits: ${e.map((e) => e.text).join("; ")}. Fix: pass { ${n} }.`);
}
var we = /* @__PURE__ */ new WeakSet();
function Te(e) {
	return e.mode >= 0 && e.mode <= 3 || we.has(e);
}
function Ee(e) {
	return e.extensions?.KHR_texture_basisu?.source ?? e.extensions?.EXT_texture_webp?.source ?? e.source;
}
function De(e) {
	return e.replace(/\s/g, "_").replace(/[[\].:/]/g, "");
}
function Oe(e, t) {
	return e.mimeType ? e.mimeType : be.every((e, n) => t[n] === e) ? "image/png" : xe.every((e, n) => e === null || t[n] === e) ? "image/webp" : "image/jpeg";
}
async function ke(e, t, n) {
	let r = new Blob([e], { type: t });
	if (typeof createImageBitmap == "function") {
		let e = {
			premultiplyAlpha: "none",
			colorSpaceConversion: "none",
			imageOrientation: "none"
		};
		return n && Object.assign(e, {
			resizeWidth: n.width,
			resizeHeight: n.height,
			resizeQuality: "high"
		}), createImageBitmap(r, e);
	}
	if (n) throw Error("Scaling textures to fit maxTexturePixels requires createImageBitmap.");
	let i = URL.createObjectURL(r);
	try {
		let e = new Image();
		return e.src = i, await e.decode(), e;
	} finally {
		URL.revokeObjectURL(i);
	}
}
function Ae(e, t) {
	return {
		array: e.array,
		itemSize: e.itemSize,
		count: e.count,
		normalized: t ?? e.normalized === !0,
		componentType: Ce.get(e.array.constructor)
	};
}
function je(e) {
	let t = S(e);
	for (let e = 0; e < t.length; e += 4) {
		let n = t[e] + t[e + 1] + t[e + 2] + t[e + 3];
		if (n === 0) t[e] = 1;
		else for (let r = 0; r < 4; r++) t[e + r] /= n;
	}
	return {
		array: t,
		itemSize: 4,
		count: e.count,
		normalized: !1,
		componentType: 5126
	};
}
async function Me({ document: e, glbBinary: t, resourceBytes: n, decoders: i, limits: a, imageTargets: s = /* @__PURE__ */ new Map(), sharedTextures: c }) {
	let u = [], d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map();
	function C(r) {
		let i = e.buffers?.[r];
		return i ? i.uri === void 0 ? r === 0 ? t : null : n.get(i.uri) ?? null : null;
	}
	let w = ee(e, C, i.meshopt);
	await w.prepare();
	function T(e) {
		let t = De(e);
		if (!d.has(t)) return d.set(t, 0), t;
		let n = d.get(t), r;
		do
			n++, r = `${t}_${n}`;
		while (d.has(r));
		return d.set(t, n), d.set(r, 0), r;
	}
	function E(t) {
		let r = e.images[t];
		return r.uri === void 0 ? w.viewBytes(r.bufferView) : n.get(r.uri);
	}
	function D(e) {
		let t = i.ktx2, n = URL.createObjectURL(new Blob([e], { type: "image/ktx2" }));
		return new Promise((e, r) => t.load(n, e, void 0, r)).finally(() => URL.revokeObjectURL(n));
	}
	async function O(t, n) {
		let r = `${t}:${n}`;
		if (v.has(r)) return v.get(r);
		let i = E(t), a;
		if (n) {
			let e = await D(i);
			a = {
				image: e.image,
				isCompressedTexture: e.isCompressedTexture === !0,
				format: e.format,
				mipmaps: e.mipmaps
			}, u.push(() => e.dispose?.());
		} else {
			let n = await ke(i, Oe(e.images[t], i), s.get(t));
			a = {
				image: n,
				isCompressedTexture: !1,
				format: void 0,
				mipmaps: void 0
			}, u.push(() => n.close?.());
		}
		return v.set(r, a), a;
	}
	async function k(e) {
		let t = !!e.extensions?.KHR_texture_basisu, n = Ee(e), r = e.source;
		if (!(!t && e.extensions?.EXT_texture_webp && Number.isInteger(r) && r !== n)) return O(n, t);
		try {
			return await O(n, !1);
		} catch {
			return O(r, !1);
		}
	}
	async function A(t) {
		if (_.has(t)) return _.get(t);
		let n = e.textures[t], r = n.extras?.sharedTexture, i = r && c?.get(r);
		if (i) return i;
		let a = e.samplers?.[n.sampler] ?? {}, { image: o, isCompressedTexture: s, format: l, mipmaps: u } = await k(n), d = {
			image: o,
			isCompressedTexture: s,
			format: l,
			mipmaps: u,
			wrapS: a.wrapS ?? 10497,
			wrapT: a.wrapT ?? 10497,
			minFilter: a.minFilter ?? 9987,
			magFilter: a.magFilter ?? 9729
		};
		return _.set(t, d), r && c?.set(r, d), d;
	}
	async function j(t) {
		if (g.has(t)) return g.get(t);
		let n = t === void 0 ? {} : e.materials[t], r = n.pbrMetallicRoughness ?? {}, i = {
			materialIndex: t,
			color: (r.baseColorFactor ?? [
				1,
				1,
				1
			]).slice(0, 3),
			metalness: r.metallicFactor ?? 1,
			roughness: r.roughnessFactor ?? 1,
			emissive: [...n.emissiveFactor ?? [
				0,
				0,
				0
			]],
			emissiveIntensity: n.extensions?.KHR_materials_emissive_strength?.emissiveStrength ?? 1,
			aoMapIntensity: n.occlusionTexture?.strength ?? 1
		};
		for (let [e, t, a] of ye) {
			let o = a ? r[t] : n[t];
			if (o) try {
				i[e] = await A(o.index);
			} catch (e) {
				throw Error(`${t} failed to decode. Use a valid PNG, JPEG or WebP image. ${e.message}`);
			}
		}
		let a = {};
		for (let [e, t] of o(n)) try {
			a[e] = await A(t.index);
		} catch (t) {
			throw Error(`${e} failed to decode. Use a valid PNG, JPEG or WebP image. ${t.message}`);
		}
		return Object.keys(a).length > 0 && (i.layerTextures = a), g.set(t, i), i;
	}
	function te(t, n) {
		let r = i.draco;
		r.preload?.();
		let a = {}, o = {};
		for (let [r, i] of Object.entries(n.attributes)) {
			let n = ve[r];
			if (!n) continue;
			a[n] = i;
			let s = e.accessors[t.attributes[r]];
			s && (o[n] = y[s.componentType].name);
		}
		let s = w.viewBytes(n.bufferView).slice().buffer;
		return new Promise((e, t) => r.decodeDracoFile(s, e, a, o, Se, t));
	}
	async function M(t, n) {
		let r = `${t}:${n}`;
		if (h.has(r)) return h.get(r);
		let i = e.meshes[t].primitives[n], a = i.extensions?.KHR_draco_mesh_compression, o = a ? await te(i, a) : null, s = {};
		for (let [t, n] of Object.entries(i.attributes)) {
			let r = ve[t];
			if (r) {
				if (o && a.attributes[t] !== void 0) {
					let i = o.getAttribute(r);
					if (!i) throw Error(`Draco geometry is missing ${t}.`);
					s[r] = Ae(i, e.accessors[n]?.normalized === !0);
				} else s[r] = w.readAccessor(n);
			}
		}
		let c = null;
		i.indices !== void 0 && (c = o ? Ae(o.getIndex()) : w.readAccessor(i.indices));
		let l = i.targets ?? [], u = {
			uuid: r,
			attributes: s,
			index: c,
			morphPositions: l.map((e) => e.POSITION === void 0 ? void 0 : w.readAccessor(e.POSITION)),
			morphNormals: l.map((e) => e.NORMAL === void 0 ? void 0 : w.readAccessor(e.NORMAL))
		};
		return h.set(r, u), u;
	}
	function N(e, t) {
		if (e.skinPrepared) return;
		let { skinIndex: n, skinWeight: r, position: i } = e.attributes;
		l({
			positions: { length: i.count * 3 },
			skinIndices: S(n),
			skinWeights: S(r)
		}, p(t)), e.attributes.skinWeight = je(r), e.skinPrepared = !0;
	}
	function ne(t, n) {
		if (x.has(t)) return x.get(t);
		let { TRANSLATION: i, ROTATION: o, SCALE: s } = n.attributes, c = i === void 0 ? null : S(w.readAccessor(i)), l = o === void 0 ? null : S(w.readAccessor(o)), u = s === void 0 ? null : S(w.readAccessor(s)), d = [
			i,
			o,
			s
		].filter((e) => e !== void 0).map((t) => e.accessors[t].count)[0];
		q(K([], `node ${t} instances`, d, "maxInstances", a.maxInstances));
		let f = new Float64Array(d * 16);
		for (let e = 0; e < d; e++) r(f.subarray(e * 16, e * 16 + 16), l ? l.subarray(e * 4, e * 4 + 4) : [
			0,
			0,
			0,
			1
		], c ? c.subarray(e * 3, e * 3 + 3) : [
			0,
			0,
			0
		], u ? u.subarray(e * 3, e * 3 + 3) : [
			1,
			1,
			1
		]);
		let p = {
			count: d,
			matrices: f
		};
		return x.set(t, p), p;
	}
	function P(t) {
		if (!m.has(t)) {
			let n = e.meshes[t], r = n.name || `mesh_${t}`;
			m.set(t, n.primitives.map(() => T(r)));
		}
		return m.get(t);
	}
	async function F(t, n, r, i) {
		let a = e.meshes[r], o = a.primitives[i], s = new _e();
		s.isMesh = !0, s.geometry = await M(r, i), s.material = await j(o.material), s.name = P(r)[i], s.association = {
			meshes: r,
			primitives: i
		}, t.skin !== void 0 && (s.isSkinnedMesh = !0, N(s.geometry, e.skins[t.skin].joints.length));
		let c = o.targets?.length ?? 0;
		c && (s.morphTargetInfluences = Array.from({ length: c }, (e, n) => t.weights?.[n] ?? a.weights?.[n] ?? 0));
		let l = t.extensions?.EXT_mesh_gpu_instancing;
		if (l) {
			let { count: e, matrices: t } = ne(n, l);
			s.isInstancedMesh = !0, s.count = e, s.instanceMatrices = t;
		}
		return s;
	}
	async function I(t) {
		if (b.has(t)) return b.get(t);
		let n = e.skins[t], r = [];
		for (let e of n.joints) r.push(await L(e));
		let i = n.inverseBindMatrices === void 0 ? null : S(w.readAccessor(n.inverseBindMatrices)), a = {
			bones: r,
			boneInverses: r.map((e, t) => i ? new G().fromArray(i, t * 16) : new G()),
			dispose() {}
		};
		return b.set(t, a), a;
	}
	async function L(t) {
		if (f.has(t)) return f.get(t);
		let n = e.nodes[t], r = n.name ? T(n.name) : "", i = [];
		if (n.mesh !== void 0) for (let r = 0; r < e.meshes[n.mesh].primitives.length; r++) Te(e.meshes[n.mesh].primitives[r]) || i.push(await F(n, t, n.mesh, r));
		let a;
		if (i.length === 1) a = i[0];
		else {
			a = new _e(), i.length && (a.association = { meshes: n.mesh });
			for (let e of i) a.add(e);
		}
		if (n.name && (a.name = r), a.association = {
			...a.association,
			nodes: t
		}, n.matrix !== void 0 && new G().fromArray(n.matrix).decompose(a.position, a.quaternion, a.scale), n.translation !== void 0 && a.position.fromArray(n.translation), n.rotation !== void 0 && a.quaternion.fromArray(n.rotation), n.scale !== void 0 && a.scale.fromArray(n.scale), f.set(t, a), n.skin !== void 0) {
			let e = await I(n.skin);
			a.traverse((t) => {
				t.isSkinnedMesh && (t.skeleton = e, t.bindMatrix = new G());
			});
		}
		for (let e of n.children ?? []) a.add(await L(e));
		return a;
	}
	let R = () => u.forEach((e) => e());
	try {
		let t = e.scenes?.[e.scene ?? 0];
		if (!t) throw Error("glTF has no default scene.");
		let n = new _e();
		for (let e of t.nodes ?? []) n.add(await L(e));
		for (let t of e.animations ?? []) for (let e of t.channels ?? []) e.target.node !== void 0 && await L(e.target.node);
		let r = re(e, (e) => f.get(e), w.readAccessor);
		return n.updateMatrixWorld(), {
			scene: n,
			animations: r,
			release: R
		};
	} catch (e) {
		throw R(), e;
	}
}
// src/gltf-lights.js
var Ne = 1e5, Pe = 1e3, Fe = .01, Ie = Math.PI / 2 - .01, Le = Math.PI / 4, Re = .001;
function ze(e, t) {
	return e.name ? `"${e.name}"` : `light ${t}`;
}
function Be(e) {
	return Array.isArray(e) && e.length === 3 && e.every((e) => Number.isFinite(e) && e >= 0 && e <= 1);
}
function Ve(e) {
	let t = e.spot?.outerConeAngle ?? Le, n = e.spot?.innerConeAngle ?? 0;
	return !Number.isFinite(t) || !Number.isFinite(n) || n < 0 || n >= t || t > Math.PI / 2 ? null : {
		angle: Math.min(Math.max(t, Fe), Ie),
		penumbra: (t - n) / t
	};
}
function He(e, t) {
	let n = e.extensions?.KHR_lights_punctual?.lights ?? [], r = [], i = [], a = [], o = null;
	for (let { nodeIndex: s, matrix: c } of t) {
		let t = e.nodes[s].extensions.KHR_lights_punctual.light, l = n[t];
		if (!l) {
			r.push(`Skipped the light of node ${s}: KHR_lights_punctual has no light ${t}.`);
			continue;
		}
		let u = ze(l, t), d = l.color ?? [
			1,
			1,
			1
		], f = l.intensity ?? 1;
		if (!Be(d) || !Number.isFinite(f) || f < 0) {
			r.push(`Skipped ${u}: its color or intensity is invalid.`);
			continue;
		}
		let p = [
			c[12],
			c[13],
			c[14]
		], m = [
			c[8],
			c[9],
			c[10]
		], h = Math.min(f, Ne);
		if (h !== f && r.push(`Clamped the intensity of ${u} to ${Ne}.`), l.type === "directional") {
			if (o) {
				r.push(`Skipped directional ${u}: the renderer has one directional key light, already taken by ${o.label}.`);
				continue;
			}
			o = {
				label: u,
				keyColor: d.map((e) => Math.min(e * f, Pe)),
				lightDirection: m,
				keyIntensity: 1
			};
			continue;
		}
		if (l.type !== "point" && l.type !== "spot") {
			r.push(`Skipped ${u}: light type ${l.type} is not point, spot or directional.`);
			continue;
		}
		let g = {
			position: p,
			color: d,
			intensity: h,
			range: l.range === void 0 ? 0 : Math.max(l.range, Re)
		};
		if (l.type === "point") {
			if (i.length >= 16) {
				r.push(`Skipped point ${u}: the renderer draws at most 16 point lights.`);
				continue;
			}
			i.push(g);
			continue;
		}
		let _ = Ve(l);
		_ ? a.length >= 8 ? r.push(`Skipped spot ${u}: the renderer draws at most 8 spot lights.`) : a.push({
			...g,
			direction: m.map((e) => -e),
			..._
		}) : r.push(`Skipped spot ${u}: its cone angles are invalid.`);
	}
	let s = {};
	return i.length && (s.pointLights = i), a.length && (s.spotLights = a), o && (s.keyColor = o.keyColor, s.lightDirection = o.lightDirection, s.keyIntensity = o.keyIntensity), {
		lights: s,
		warnings: r
	};
}
// src/gltf.js
var Ue = Object.freeze({
	maxBytes: 268435456,
	maxVertices: 8e6,
	maxParts: 65536,
	maxResources: 256,
	maxTexturePixels: 16777216,
	maxTextureImagePixels: 67108864,
	maxJoints: 4096,
	maxInstances: 65536
}), We = Object.freeze({
	formats: ["glb", "gltf"],
	limits: Ue,
	supported: [
		"triangle meshes",
		"world transforms",
		"rigid node animations",
		"four-influence skeletal skinning",
		"joint node animations",
		"relative POSITION/NORMAL morph targets",
		"morph weight animations",
		"PNG/JPEG/WebP base color textures",
		"normal/occlusion/emissive/metallic-roughness textures",
		"TEXCOORD_0",
		"TEXCOORD_1 for occlusion, emissive and metallic-roughness textures",
		"clearcoat, clearcoat roughness, clearcoat normal, anisotropy, sheen color and sheen roughness textures",
		"linear RGB vertex colors, with the alpha of RGBA colors ignored and reported in warnings",
		"metallic roughness factors",
		"emissive factors",
		"alpha mask and blend modes",
		"double-sided materials",
		"KHR_mesh_quantization",
		"KHR_materials_emissive_strength",
		"KHR_materials_clearcoat, transmission, volume, ior, specular, sheen, anisotropy and iridescence factors",
		"KHR_texture_transform baked into UVs, with a normal map that differs by scale and offset applied in the shader",
		"EXT_mesh_gpu_instancing expanded into parts",
		"KHR_draco_mesh_compression with options.decoders.draco",
		"EXT_meshopt_compression",
		"KHR_texture_basisu with options.decoders.ktx2",
		"EXT_texture_webp, with the PNG or JPEG fallback source when the browser cannot decode WebP",
		"KHR_materials_unlit as the unlit material tag, with a base color map only",
		"KHR_lights_punctual point and spot lights (up to eight each) and the first directional light, returned in lights as environment options"
	],
	ignoredExtensions: [
		"KHR_materials_variants",
		"KHR_materials_dispersion",
		"KHR_materials_diffuse_roughness",
		"EXT_materials_bump",
		"EXT_texture_avif"
	],
	optionalExtensions: "Any other optional extension is ignored and named in warnings. One listed in extensionsRequired that 67js does not read is refused.",
	skippedPrimitives: [
		"POINTS",
		"LINES",
		"LINE_LOOP",
		"LINE_STRIP"
	],
	unsupported: [
		"more than four skin influences",
		"singular weighted skin transforms",
		"reflected skin transforms",
		"TANGENT morph targets",
		"drawing vertex alpha (it is ignored with a warning)",
		"different texture transforms on one material, except a normal map that differs by scale and offset",
		"skinned or morphed GPU instancing",
		"transmission, iridescence and specular textures (their factors are used)",
		"texture transforms on TEXCOORD_1"
	]
}), Ge = Object.freeze(["KHR_materials_anisotropy", "KHR_materials_iridescence"]);
async function Ke(e) {
	(e.materials ?? []).some((e) => Ge.some((t) => e?.extensions?.[t]) || o(e).length > 0 || pt(e ?? {}).normalRelative) && await import("./material-layer-shaders.js"), (e.materials ?? []).some((e) => e?.extensions?.KHR_materials_transmission) && await import("./liquid-shader.js");
}
function qe(e) {
	let t = e.materials ?? [];
	return t.some((e) => e?.extensions?.KHR_materials_pbrSpecularGlossiness) ? !0 : (e.meshes ?? []).some((e) => (e.primitives ?? []).some((e) => e.attributes?.TEXCOORD_0 === void 0 && JSON.stringify(t[e.material] ?? {}).includes("\"index\"")));
}
async function Je(e) {
	if (!qe(e)) return [];
	let { applyGltfFallbacks: t } = await import("./gltf-fallbacks-mRqg47AF.js");
	return t(e);
}
var Ye = {
	OPAQUE: "opaque",
	MASK: "mask",
	BLEND: "blend"
}, Xe = /* @__PURE__ */ new Set([
	"KHR_mesh_quantization",
	"KHR_materials_emissive_strength",
	"KHR_texture_transform",
	"EXT_mesh_gpu_instancing",
	"EXT_meshopt_compression",
	"EXT_texture_webp",
	"KHR_materials_unlit",
	"KHR_lights_punctual",
	"KHR_xmp_json_ld",
	"KHR_xmp",
	...s
]), Ze = {
	KHR_draco_mesh_compression: "draco",
	KHR_texture_basisu: "ktx2"
}, J = Object.freeze({
	offset: [0, 0],
	rotation: 0,
	scale: [1, 1]
}), Qe = JSON.stringify([
	J.offset,
	J.rotation,
	J.scale
]), $e = [
	[
		"map",
		"baseColorTexture",
		"srgb"
	],
	[
		"normalMap",
		"normalTexture",
		"linear"
	],
	[
		"metallicRoughnessMap",
		"metallicRoughnessTexture",
		"linear"
	],
	[
		"occlusionMap",
		"occlusionTexture",
		"linear"
	],
	[
		"emissiveMap",
		"emissiveTexture",
		"srgb"
	]
], et = [
	"metallicRoughnessTexture",
	"occlusionTexture",
	"emissiveTexture"
];
function tt(e, t) {
	return ["baseColorTexture", "metallicRoughnessTexture"].includes(t) ? e.pbrMetallicRoughness?.[t] : e[t];
}
function Y(e) {
	return e.texCoord ?? 0;
}
function X(e) {
	let t = [];
	for (let [, n] of $e) {
		let r = tt(e, n);
		r && t.push([n, r]);
	}
	for (let [n, r] of o(e)) t.push([n, r]);
	return t;
}
function nt(e) {
	return X(e ?? {}).some(([, e]) => Y(e) === 1);
}
function rt(e) {
	let t = Object.fromEntries(Object.entries(Ue).map(([t, n]) => [t, e[t] ?? n]));
	for (let [e, n] of Object.entries(t)) if (!Number.isSafeInteger(n) || n <= 0) throw TypeError(`${e} must be a positive safe integer.`);
	return t;
}
function it(e, t) {
	if (typeof e == "string") {
		let n = new TextEncoder().encode(e).byteLength;
		return q(K([], "bytes", n, "maxBytes", t)), JSON.parse(e);
	}
	if (!(e instanceof ArrayBuffer)) throw TypeError("parseGltf expects an ArrayBuffer or glTF JSON string.");
	if (q(K([], "bytes", e.byteLength, "maxBytes", t)), e.byteLength < 4) throw Error("glTF input is truncated.");
	let n = new DataView(e);
	if (n.getUint32(0, !0) !== 1179937895) return JSON.parse(new TextDecoder().decode(e));
	if (e.byteLength < 20 || n.getUint32(4, !0) !== 2 || n.getUint32(8, !0) !== e.byteLength) throw Error("Invalid GLB version or declared length.");
	let r = n.getUint32(12, !0);
	if (n.getUint32(16, !0) !== 1313821514 || r % 4 != 0 || 20 + r > e.byteLength) throw Error("Invalid GLB JSON chunk.");
	let i = 20 + r;
	for (; i < e.byteLength;) {
		if (i + 8 > e.byteLength) throw Error("Truncated GLB chunk.");
		let t = n.getUint32(i, !0);
		if (t % 4 != 0 || i + 8 + t > e.byteLength) throw Error("Invalid GLB chunk length.");
		i += 8 + t;
	}
	return JSON.parse(new TextDecoder().decode(new Uint8Array(e, 20, r)));
}
function at(e, t, n) {
	let r = e.meshes?.[e.nodes?.[t.association?.nodes]?.mesh]?.extras?.targetNames;
	return Array.isArray(r) && r.length === n && new Set(r).size === n && r.every((e) => typeof e == "string" && e.length > 0 && e.length <= 128) ? [...r] : null;
}
function Z(e) {
	return e?.primitives?.[0]?.targets?.length ?? 0;
}
function ot(e, t) {
	if (e !== void 0 && (!t || !Array.isArray(e) || e.length !== t || e.some((e) => typeof e != "number" || !Number.isFinite(Math.fround(e))))) throw Error("Morph default weights require one finite Float32 value per target.");
}
function st(e) {
	for (let t of e.animations ?? []) {
		let n = /* @__PURE__ */ new Set();
		for (let r of t.channels ?? []) {
			let i = r.target?.path, a = r.target?.node, o = e.nodes?.[a];
			if (![
				"translation",
				"rotation",
				"scale",
				"weights"
			].includes(i)) throw Error("Only node translation, rotation, scale and weights animations are supported.");
			if (a === void 0) continue;
			if (!Number.isInteger(a) || !o) throw Error("Animation channel requires a valid target node.");
			let s = `${a}:${i}`;
			if (n.has(s)) throw Error("Animation channels must have distinct node and path targets.");
			n.add(s);
			let c = t.samplers?.[r.sampler];
			if (!Number.isInteger(r.sampler) || !c) throw Error("Invalid animation sampler index.");
			let l = c.interpolation ?? "LINEAR";
			if (![
				"LINEAR",
				"STEP",
				"CUBICSPLINE"
			].includes(l)) throw Error("Unsupported animation interpolation.");
			let u = e.accessors?.[c.input], d = e.accessors?.[c.output];
			if (!Number.isInteger(c.input) || !u || u.type !== "SCALAR" || u.componentType !== 5126 || u.normalized || !Number.isSafeInteger(u.count) || u.count < (l === "CUBICSPLINE" ? 2 : 1)) throw Error("Animation inputs require float SCALAR keyframe times.");
			let f = i === "weights" ? Z(e.meshes?.[o.mesh]) : 1;
			if (!f) throw Error("Weights animation requires a node with morph targets.");
			let p = i === "weights" ? "SCALAR" : i === "rotation" ? "VEC4" : "VEC3", m = u.count * f * (l === "CUBICSPLINE" ? 3 : 1), h = ["rotation", "weights"].includes(i) && [
				5120,
				5121,
				5122,
				5123
			].includes(d?.componentType) && d.normalized;
			if (!Number.isInteger(c.output) || !d || d.type !== p || d.count !== m || !(d.componentType === 5126 && !d.normalized || h)) throw Error("Animation output shape, count or component type does not match its target.");
		}
	}
}
function ct(e) {
	let t = new Set(Xe);
	for (let [n, r] of Object.entries(Ze)) e[r] && t.add(n);
	return t;
}
function lt(e) {
	let t = Ze[e], n = t ? ` Pass options.decoders.${t} to enable it.` : "";
	return /* @__PURE__ */ Error(`Unsupported glTF extension: ${e}.${n}`);
}
function ut(e, t) {
	let n = /* @__PURE__ */ new Set();
	function r(e) {
		if (!t.has(e)) {
			if (Ze[e]) throw lt(e);
			n.add(e);
		}
	}
	let i = [e];
	for (; i.length;) {
		let e = i.pop();
		if (e && typeof e == "object") {
			for (let t of Object.keys(e.extensions ?? {})) r(t);
			i.push(...Object.values(e).filter((e) => e && typeof e == "object"));
		}
	}
	for (let t of e.extensionsUsed ?? []) r(t);
	for (let n of e.extensionsRequired ?? []) if (!t.has(n)) throw lt(n);
	return [...n].sort();
}
function dt(e) {
	let t = e.extensions?.KHR_texture_transform;
	if (!t) return J;
	let n = t.offset ?? [0, 0], r = t.scale ?? [1, 1], i = t.rotation ?? 0;
	if (![n, r].every((e) => Array.isArray(e) && e.length === 2 && e.every(Number.isFinite)) || !Number.isFinite(i)) throw Error("KHR_texture_transform requires finite offset, rotation and scale.");
	if ((t.texCoord ?? Y(e)) !== Y(e)) throw Error("KHR_texture_transform texCoord overrides are unsupported.");
	return {
		offset: n,
		rotation: i,
		scale: r
	};
}
function Q(e) {
	let t = JSON.stringify([
		e.offset,
		e.rotation,
		e.scale
	]);
	return t === Qe ? "" : t;
}
function ft(e, t) {
	let n = t.scale.map((t, n) => t / e.scale[n]), r = t.rotation === e.rotation, i = e.rotation === 0 || n[0] === n[1];
	if (!r || !i || !n.every((e) => e > 0 && Number.isFinite(e))) throw Error("The normal texture transform may differ from the other maps only by an offset and a positive scale, with the same rotation.");
	return [
		...n,
		t.offset[0] - n[0] * e.offset[0],
		t.offset[1] - n[1] * e.offset[1]
	];
}
function pt(e) {
	let t = null, n = null;
	for (let [r, i] of X(e)) {
		let e = dt(i);
		if (Y(i) !== 0) {
			if (Q(e) !== "") throw Error(`${r} reads TEXCOORD_1, where KHR_texture_transform is unsupported. Bake the transform into the UVs.`);
		} else if (r === "normalTexture") n = e;
		else {
			if (t && Q(t) !== Q(e)) throw Error("Maps of one material must share the same KHR_texture_transform, except the normal map. Different transforms per map are unsupported.");
			t = e;
		}
	}
	return n ? t ? Q(t) === Q(n) ? {
		shared: t,
		normalRelative: null
	} : {
		shared: t,
		normalRelative: ft(t, n)
	} : {
		shared: n,
		normalRelative: null
	} : {
		shared: t ?? J,
		normalRelative: null
	};
}
function mt(e, t) {
	let n = Math.cos(t.rotation), r = Math.sin(t.rotation), [i, a] = t.offset, [o, s] = t.scale;
	for (let t = 0; t < e.length; t += 2) {
		let c = e[t], l = e[t + 1];
		e[t] = n * o * c + r * s * l + i, e[t + 1] = -r * o * c + n * s * l + a;
	}
}
function ht(e) {
	pt(e), a(e);
}
function gt(e, t, n, r) {
	let i = t.extensions?.EXT_mesh_gpu_instancing;
	if (!i) return 1;
	let a = i.attributes;
	if (t.mesh === void 0 || t.skin !== void 0) throw Error("EXT_mesh_gpu_instancing requires a static mesh node without a skin.");
	if (Z(e.meshes?.[t.mesh])) throw Error("EXT_mesh_gpu_instancing with morph targets is unsupported.");
	let o = {
		TRANSLATION: "VEC3",
		ROTATION: "VEC4",
		SCALE: "VEC3"
	}, s;
	for (let [t, n] of Object.entries(a ?? {})) {
		if (!(t in o)) continue;
		let r = e.accessors?.[n];
		if (!r || r.type !== o[t] || !Number.isSafeInteger(r.count)) throw Error(`Instancing ${t} requires a ${o[t]} accessor.`);
		if (s !== void 0 && r.count !== s) throw Error("Instancing attributes must share one count.");
		s = r.count;
	}
	if (s === void 0 || s < 1) throw Error("EXT_mesh_gpu_instancing needs TRANSLATION, ROTATION or SCALE instances.");
	return K(r, "instances of one node", s, "maxInstances", n.maxInstances), s;
}
function _t(e, t, n) {
	if (e.asset?.version !== "2.0") throw Error("Only glTF 2.0 assets are supported.");
	let r = ut(e, n), i = 0;
	for (let t of e.buffers ?? []) {
		if (!Number.isSafeInteger(t.byteLength) || t.byteLength < 0) throw Error("Invalid glTF buffer length.");
		t.extensions?.EXT_meshopt_compression?.fallback || (i += t.byteLength);
	}
	let a = [];
	K(a, "buffer bytes", i, "maxBytes", t.maxBytes);
	let o = 0, s = 0, c = 0;
	for (let t of e.meshes ?? []) {
		let n = Z(t);
		if (n > 64) throw Error("Morph target count exceeds 64.");
		ot(t.weights, n);
		for (let r of t.primitives ?? []) {
			if (Te(r)) continue;
			if ((r.mode ?? 4) !== 4) throw Error("Only glTF TRIANGLES primitives are supported. POINTS, LINES, LINE_LOOP and LINE_STRIP are skipped with a warning.");
			let t = e.accessors?.[r.attributes?.POSITION];
			if (!t || t.type !== "VEC3" || !Number.isSafeInteger(t.count) || t.count < 3) throw Error("Each mesh primitive requires a valid POSITION accessor.");
			if (r.targets !== void 0 && (!Array.isArray(r.targets) || !r.targets.length || r.targets.length !== n) || (r.targets?.length ?? 0) !== n) throw Error("Morph target counts must match across all mesh primitives.");
			for (let n of r.targets ?? []) {
				if (!n || typeof n != "object" || Array.isArray(n) || !Object.keys(n).length) throw Error("Morph targets require POSITION or NORMAL channels.");
				for (let [i, a] of Object.entries(n)) {
					if (!["POSITION", "NORMAL"].includes(i)) throw Error(`Unsupported morph target semantic: ${i}.`);
					let n = e.accessors?.[a];
					if (r.attributes?.[i] === void 0 && i !== "NORMAL") throw Error("Morph target channels require corresponding base attributes.");
					if (!Number.isInteger(a) || !n || n.type !== "VEC3" || ![
						5120,
						5122,
						5126
					].includes(n.componentType) || n.normalized && n.componentType === 5126 || n.count !== t.count) throw Error("Morph target channels require matching VEC3 (float, or int8 or int16 with KHR_mesh_quantization) accessors.");
					if (i === "POSITION" && (!Array.isArray(n.min) || !Array.isArray(n.max) || n.min.length !== 3 || n.max.length !== 3 || n.min.some((e, t) => typeof e != "number" || !Number.isFinite(Math.fround(e)) || typeof n.max[t] != "number" || !Number.isFinite(Math.fround(n.max[t])) || e > n.max[t]))) throw Error("Morph POSITION requires finite ordered min/max bounds.");
				}
			}
			if (o += t.count * (1 + n), c += t.count * n * 24, r.attributes?.NORMAL === void 0 && (c += t.count * 24), Object.keys(r.attributes ?? {}).some((e) => /^(JOINTS|WEIGHTS)_/.test(e) && !["JOINTS_0", "WEIGHTS_0"].includes(e))) throw Error("Only four JOINTS_0/WEIGHTS_0 skin influences are supported.");
			let i = e.accessors?.[r.attributes?.JOINTS_0], a = e.accessors?.[r.attributes?.WEIGHTS_0];
			if (i || a) {
				if (!i || !a || i.type !== "VEC4" || a.type !== "VEC4" || i.count !== t.count || a.count !== t.count) throw Error("JOINTS_0 and WEIGHTS_0 must contain four values per POSITION.");
				if (![5121, 5123].includes(i.componentType) || i.normalized) throw Error("JOINTS_0 requires unnormalized unsigned byte or short indices.");
				if (a.componentType !== 5126 && (![5121, 5123].includes(a.componentType) || !a.normalized)) throw Error("WEIGHTS_0 requires floats or normalized unsigned integers.");
			} else if (r.attributes?.JOINTS_0 !== void 0 || r.attributes?.WEIGHTS_0 !== void 0) throw Error("Invalid skin attribute accessor index.");
			let l = r.attributes?.COLOR_0;
			if (l !== void 0) {
				let n = e.accessors?.[l];
				if (!n || !["VEC3", "VEC4"].includes(n.type) || n.count !== t.count) throw Error("COLOR_0 requires RGB or RGBA values matching the POSITION vertex count.");
				if (n.componentType !== 5126 && (![5121, 5123].includes(n.componentType) || !n.normalized)) throw Error("COLOR_0 requires float or normalized unsigned integer components.");
			}
			for (let [n, i] of [["NORMAL", "VEC3"], ["TEXCOORD_0", "VEC2"]]) {
				let a = r.attributes?.[n], o = e.accessors?.[a];
				if (a !== void 0 && (!o || o.type !== i || o.count !== t.count)) throw Error(`${n} must match the POSITION vertex count and component shape.`);
			}
			let u = r.indices === void 0 ? null : e.accessors?.[r.indices];
			if (r.indices !== void 0 && (!u || u.type !== "SCALAR" || !Number.isSafeInteger(u.count) || u.count < 3)) throw Error("Invalid mesh index accessor.");
			let d = u?.count ?? t.count;
			if (d % 3 != 0) throw Error("Triangle index count must be divisible by three.");
			s += d;
		}
	}
	K(a, "vertices", o, "maxVertices", t.maxVertices), K(a, "indices", s, "maxVertices", t.maxVertices, 12), K(a, "nodes", e.nodes?.length ?? 0, "maxParts", t.maxParts);
	let l = 0;
	for (let t of e.skins ?? []) {
		if (!Array.isArray(t.joints) || !t.joints.length || new Set(t.joints).size !== t.joints.length || t.joints.some((t) => !Number.isInteger(t) || !e.nodes?.[t])) throw Error("Skin joints require distinct valid node indices.");
		if (l += t.joints.length, t.joints.length > 65536) throw Error("A skin has more than 65536 joints.");
		if (t.skeleton !== void 0 && (!Number.isInteger(t.skeleton) || !e.nodes?.[t.skeleton])) throw Error("Invalid skin skeleton node.");
		if (t.inverseBindMatrices !== void 0) {
			let n = e.accessors?.[t.inverseBindMatrices];
			if (!n || n.type !== "MAT4" || n.componentType !== 5126 || n.normalized || n.count !== t.joints.length) throw Error("Inverse bind matrices require one float MAT4 per joint.");
		}
	}
	K(a, "skin joints", l, "maxJoints", t.maxJoints);
	let u = 0, d = 0;
	for (let n of e.nodes ?? []) {
		let r = e.meshes?.[n.mesh];
		if (n.mesh !== void 0 && (!Number.isInteger(n.mesh) || !r)) throw Error("Invalid mesh node index.");
		if (d += (r?.primitives?.length ?? 0) * gt(e, n, t, a), ot(n.weights, Z(r)), c += Z(r) * (r?.primitives?.length ?? 0) * 16, n.skin !== void 0) {
			if (!Number.isInteger(n.skin) || !e.skins?.[n.skin] || !e.meshes?.[n.mesh]) throw Error("Invalid skinned mesh or skin index.");
			for (let t of e.meshes[n.mesh].primitives ?? []) if (!Te(t)) {
				if (t.attributes?.JOINTS_0 === void 0 || t.attributes?.WEIGHTS_0 === void 0) throw Error("Skinned meshes require JOINTS_0 and WEIGHTS_0.");
				u += e.skins[n.skin].joints.length;
			}
		}
	}
	K(a, "parts", d, "maxParts", t.maxParts), K(a, "skin pose joints", u, "maxJoints", t.maxJoints), Ct(e.nodes ?? []), st(e);
	for (let t of e.materials ?? []) {
		let n = t.pbrMetallicRoughness ?? {}, r = [n.baseColorFactor ?? [
			1,
			1,
			1,
			1
		], t.emissiveFactor ?? [
			0,
			0,
			0
		]];
		for (let e = 0; e < r.length; e++) if (!Array.isArray(r[e]) || r[e].length !== (e === 0 ? 4 : 3) || !r[e].every((e) => Number.isFinite(e) && e >= 0 && e <= 1)) throw Error("Invalid glTF material color factor.");
		for (let e of [n.metallicFactor ?? 1, n.roughnessFactor ?? 1]) if (!Number.isFinite(e) || e < 0 || e > 1) throw Error("Invalid glTF metallic or roughness factor.");
		if (!Object.hasOwn(Ye, t.alphaMode ?? "OPAQUE")) throw Error(`Unsupported alpha mode: ${t.alphaMode}.`);
		let i = t.alphaCutoff ?? .5;
		if (!Number.isFinite(i) || i < 0 || i > 1) throw Error("Invalid glTF alphaCutoff.");
		if (t.doubleSided !== void 0 && typeof t.doubleSided != "boolean") throw Error("glTF doubleSided must be a boolean.");
		for (let [n, r] of X(t)) {
			if (!(et.includes(n) ? [0, 1] : [0]).includes(Y(r)) || Object.keys(r.extensions ?? {}).some((e) => e !== "KHR_texture_transform")) throw Error(`${n} requires ${et.includes(n) ? "TEXCOORD_0 or TEXCOORD_1" : "TEXCOORD_0"} and no texture extensions besides KHR_texture_transform.`);
			if (!Number.isInteger(r.index) || !e.textures?.[r.index]) throw Error(`Invalid ${n} texture index.`);
			if (n === "normalTexture" && (!Number.isFinite(r.scale ?? 1) || !Number.isFinite(Math.fround(r.scale ?? 1)))) throw Error("Normal texture scale must be a finite float.");
			if (n === "occlusionTexture" && (!Number.isFinite(r.strength ?? 1) || (r.strength ?? 1) < 0 || (r.strength ?? 1) > 1)) throw Error("Occlusion texture strength must be within zero and one.");
		}
		ht(t);
	}
	for (let t of e.textures ?? []) {
		let n = Ee(t);
		if (!Number.isInteger(n) || !e.images?.[n]) throw Error("Invalid texture image index.");
		if (t.sampler !== void 0 && (!Number.isInteger(t.sampler) || !e.samplers?.[t.sampler])) throw Error("Invalid texture sampler index.");
		let r = e.samplers?.[t.sampler] ?? {};
		m({
			image: {
				width: 1,
				height: 1
			},
			...r
		});
	}
	for (let t of e.meshes ?? []) for (let n of t.primitives ?? []) {
		if (Te(n)) continue;
		let t = e.materials?.[n.material];
		for (let [, e] of X(t ?? {})) {
			let t = `TEXCOORD_${Y(e)}`;
			if (n.attributes?.[t] === void 0) throw Error(`Material textures require ${t}.`);
		}
	}
	let f = c, p = {
		SCALAR: 1,
		VEC2: 2,
		VEC3: 3,
		VEC4: 4,
		MAT2: 4,
		MAT3: 9,
		MAT4: 16
	};
	for (let n of e.accessors ?? []) {
		if (!Number.isSafeInteger(n.count) || n.count < 0) throw Error("Invalid glTF accessor count.");
		if (n.count > t.maxVertices * 12 && q(K(a, "accessor elements", n.count, "maxVertices", t.maxVertices, 12)), !p[n.type]) throw Error("Unsupported glTF accessor shape.");
		f += n.count * p[n.type] * 4;
	}
	return K(a, "decoded accessor bytes", f, "maxBytes", t.maxBytes, 4), {
		vertices: o,
		ignoredExtensions: r,
		overruns: a
	};
}
var vt = [
	"POINTS",
	"LINES",
	"LINE_LOOP",
	"LINE_STRIP"
];
function yt(e) {
	let t = [];
	return (e.meshes ?? []).forEach((e, n) => {
		let r = /* @__PURE__ */ new Map();
		for (let t of e.primitives ?? []) {
			if (!(t.mode >= 0 && t.mode <= 3)) continue;
			let e = vt[t.mode];
			r.set(e, (r.get(e) ?? 0) + 1);
		}
		if (!r.size) return;
		let i = [...r].map(([e, t]) => `${t} ${e}`).join(", "), a = e.name ? `"${e.name}"` : n;
		t.push(`Skipped ${i} primitive(s) in mesh ${a}: 67js draws triangles only.`);
	}), t;
}
function bt(e, t, n) {
	let r = e.meshes[t].name;
	return `primitive ${n} of mesh ${r ? `"${r}"` : t}`;
}
function xt(e, t) {
	let n = e.accessors?.[t.attributes?.POSITION];
	if (!n || n.type !== "VEC3" || !Number.isSafeInteger(n.count) || n.count < 3) return "its POSITION accessor is missing, is not VEC3 or has fewer than 3 vertices";
	let r = t.indices === void 0 ? null : e.accessors?.[t.indices];
	if (t.indices !== void 0 && (!r || r.type !== "SCALAR" || !Number.isSafeInteger(r.count) || r.count < 3)) return "its index accessor is missing or has fewer than 3 indices";
	let i = r?.count ?? n.count;
	return i % 3 == 0 ? null : `its index count ${i} is not a multiple of 3`;
}
function St(e) {
	let t = [];
	return (e.meshes ?? []).forEach((n, r) => {
		(n.primitives ?? []).forEach((n, i) => {
			if (!n || (n.mode ?? 4) !== 4) return;
			let a = xt(e, n);
			a && (we.add(n), t.push(`Skipped ${bt(e, r, i)}: ${a}.`));
		});
	}), t;
}
function Ct(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) for (let r of n.children ?? []) {
		if (!Number.isInteger(r) || !e[r] || t.has(r)) throw Error("Invalid glTF hierarchy child or multiple parents.");
		t.add(r);
	}
	let n = new Uint8Array(e.length), r = Array.from(e.keys()).filter((e) => !t.has(e)), i = Array.from(e.keys()).filter((e) => t.has(e));
	for (let t of [...r, ...i]) {
		let r = [{
			index: t,
			exit: !1,
			depth: 1
		}];
		for (; r.length;) {
			let t = r.pop();
			if (t.exit) n[t.index] = 2;
			else {
				if (n[t.index] === 1) throw Error("Cyclic glTF node hierarchy.");
				if (n[t.index] !== 2) {
					if (t.depth > 256) throw Error("glTF hierarchy exceeds 256 levels.");
					n[t.index] = 1, r.push({
						...t,
						exit: !0
					});
					for (let n of e[t.index].children ?? []) r.push({
						index: n,
						exit: !1,
						depth: t.depth + 1
					});
				}
			}
		}
	}
}
function wt(e) {
	let t = e.indexOf(",");
	if (t < 0 || !e.slice(0, t).endsWith(";base64")) throw Error("Embedded glTF resources must use base64 data URIs.");
	let n = atob(e.slice(t + 1));
	return Uint8Array.from(n, (e) => e.charCodeAt(0));
}
var Tt = 1380533830, Et = 1464156752;
function Dt(e, t) {
	if (e.length < 30 || t.getUint32(0) !== Tt || t.getUint32(8) !== Et) return null;
	let n = String.fromCharCode(e[12], e[13], e[14], e[15]);
	if (n === "VP8X") return {
		width: 1 + (e[24] | e[25] << 8 | e[26] << 16),
		height: 1 + (e[27] | e[28] << 8 | e[29] << 16)
	};
	if (n === "VP8 " && e[23] === 157 && e[24] === 1 && e[25] === 42) return {
		width: t.getUint16(26, !0) & 16383,
		height: t.getUint16(28, !0) & 16383
	};
	if (n === "VP8L" && e[20] === 47) {
		let e = t.getUint32(21, !0);
		return {
			width: (e & 16383) + 1,
			height: (e >>> 14 & 16383) + 1
		};
	}
	return null;
}
function Ot(e, t, n, r, i) {
	let a = new DataView(e.buffer, e.byteOffset, e.byteLength), o, s, c = !0, l = 1;
	if (e.length >= 24 && a.getUint32(0) === 2303741511 && a.getUint32(4) === 218765834 && a.getUint32(12) === 1229472850) o = a.getUint32(16), s = a.getUint32(20);
	else if (e.length >= 4 && a.getUint16(0) === 65496) {
		let t = 2;
		for (; t + 4 <= e.length && e[t++] === 255;) {
			for (; e[t] === 255;) t++;
			let n = e[t++];
			if (n === 217 || n === 218 || t + 2 > e.length) break;
			let r = a.getUint16(t);
			if (r < 2 || t + r > e.length) break;
			if ([
				192,
				193,
				194,
				195,
				197,
				198,
				199,
				201,
				202,
				203,
				205,
				206,
				207
			].includes(n) && r >= 7) {
				s = a.getUint16(t + 3), o = a.getUint16(t + 5);
				break;
			}
			t += r;
		}
	}
	if (!o) {
		let t = Dt(e, a);
		o = t?.width, s = t?.height;
	}
	if (!o && e.length >= 28 && [
		171,
		75,
		84,
		88,
		32,
		50,
		48,
		187,
		13,
		10,
		26,
		10
	].every((t, n) => e[n] === t) && (o = a.getUint32(20, !0), s = a.getUint32(24, !0), c = !1, l = r), !o || !s) throw Error("Only valid PNG, JPEG, WebP and KTX2 texture images are supported.");
	return K(i, `image ${t} (${o}x${s}) pixels`, o * s, "maxTextureImagePixels", n.maxTextureImagePixels), {
		width: o,
		height: s,
		scalable: c,
		weight: l
	};
}
function kt(e) {
	let t = e?.workerConfig;
	return t && (t.bptcSupported || t.astcSupported || t.dxtSupported || t.etc2Supported) ? .25 : 1;
}
function At(e) {
	if (!(e instanceof ArrayBuffer) || e.byteLength < 20) return null;
	let t = new DataView(e);
	if (t.getUint32(0, !0) !== 1179937895) return null;
	let n = 12;
	for (; n + 8 <= e.byteLength;) {
		let r = t.getUint32(n, !0);
		if (t.getUint32(n + 4, !0) === 5130562) return new Uint8Array(e, n + 8, r);
		n += 8 + r;
	}
	return null;
}
async function jt(e, t, n) {
	let r = await fetch(e, { signal: n });
	if (!r.ok) throw Error(`glTF fetch failed (${r.status}): ${e}.`);
	let i = r.headers.get("content-length");
	if (i !== null && Number(i) > t && (await r.body?.cancel(), q(K([], `${e} bytes`, Number(i), "maxBytes", t))), !r.body?.getReader) throw Error("Bounded glTF loading requires a streaming fetch response.");
	let a = r.body.getReader(), o = [], s = 0;
	try {
		for (;;) {
			let { done: n, value: r } = await a.read();
			if (n) break;
			s += r.byteLength, q(K([], `${e} bytes`, s, "maxBytes", t)), o.push(r);
		}
	} catch (e) {
		throw await a.cancel().catch(() => {}), e;
	} finally {
		a.releaseLock();
	}
	let c = new Uint8Array(s), l = 0;
	for (let e of o) c.set(e, l), l += e.byteLength;
	return {
		bytes: c,
		mimeType: r.headers.get("content-type") ?? "application/octet-stream"
	};
}
async function Mt(e, t, n, r, i, a) {
	let o = /* @__PURE__ */ new Map(), s = [...(e.buffers ?? []).filter((e) => !e.extensions?.EXT_meshopt_compression?.fallback), ...e.images ?? []], c = new Set(s.map((e) => e.uri).filter((e) => e !== void 0));
	K(a, "resource URIs", c.size, "maxResources", i.maxResources), [...c].some((e) => typeof e == "string" && !e.startsWith("data:")) && q(a);
	let l = n;
	for (let e of c) {
		if (typeof e != "string") throw Error("Invalid glTF resource URI.");
		if (e.startsWith("data:")) {
			o.set(e, wt(e));
			continue;
		}
		if (!r.baseUrl && !/^(https?:|blob:)/.test(e)) throw Error("External glTF resources require baseUrl. Use GLB for a self-contained local file.");
		let t = new URL(e, r.baseUrl || void 0).href;
		if (!/^(https?:|blob:)/.test(t)) throw Error("Only HTTP, HTTPS, blob and embedded data resources are supported.");
		let n = await jt(t, i.maxBytes - l, r.signal);
		l += n.bytes.byteLength, o.set(e, n.bytes);
	}
	let u = [], d = kt(r.decoders?.ktx2);
	for (let [n, r] of (e.images ?? []).entries()) {
		let s = o.get(r.uri);
		if (!s && r.bufferView !== void 0) {
			let n = e.bufferViews?.[r.bufferView], i = n && e.buffers?.[n.buffer], a = i?.uri ? o.get(i.uri) : n?.buffer === 0 ? At(t) : null, c = n?.byteOffset ?? 0;
			if (!a || !Number.isSafeInteger(n.byteLength) || n.byteLength < 0 || c < 0 || c + n.byteLength > a.length) throw Error("Invalid embedded glTF image buffer view.");
			s = a.subarray(c, c + n.byteLength);
		}
		if (!s) throw Error("glTF image has no supported source.");
		u.push(Ot(s, n, i, d, a));
	}
	return q(a), {
		resourceBytes: o,
		textureScaling: Pt(e.images ?? [], u, i.maxTexturePixels, Nt(e))
	};
}
function Nt(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e.materials ?? []) for (let r of [n.pbrMetallicRoughness?.baseColorTexture, n.emissiveTexture]) {
		let n = r && e.textures?.[r.index];
		n && t.add(Ee(n));
	}
	return t;
}
function Pt(e, t, n, r = /* @__PURE__ */ new Set()) {
	let i = t.map(({ width: e, height: t }) => ({
		width: e,
		height: t
	})), a = () => i.reduce((e, { width: n, height: r }, i) => e + n * r * t[i].weight, 0);
	for (; a() > n;) {
		let e = (e) => i[e].width * i[e].height * (r.has(e) ? .25 : 1), n = i.map((e, t) => t).filter((e) => t[e].scalable && i[e].width * i[e].height > 1);
		if (!n.length) throw Error("Texture images exceed maxTexturePixels and cannot be scaled down further.");
		let a = Math.max(...n.map(e));
		for (let t of n) {
			let n = i[t];
			e(t) === a && (n.width = Math.max(1, n.width >> 1), n.height = Math.max(1, n.height >> 1));
		}
	}
	let o = [], s = /* @__PURE__ */ new Map();
	return i.forEach((n, r) => {
		let i = t[r];
		(n.width !== i.width || n.height !== i.height) && (s.set(r, n), o.push({
			name: e[r].name ?? `image ${r}`,
			from: [i.width, i.height],
			to: [n.width, n.height]
		}));
	}), {
		targetByImageIndex: s,
		scaledTextures: o
	};
}
function $(e, t) {
	if (e.itemSize !== t) throw Error(`Expected a ${t}-component mesh attribute.`);
	let n = S(e);
	if (!n.every(Number.isFinite)) throw Error("Mesh attributes must contain finite values.");
	return n;
}
function Ft(e, t, n) {
	if (e.itemSize !== t) throw Error(`Expected a ${t}-component mesh attribute.`);
	let r = S(e), i = 0;
	for (let e = 0; e < r.length; e++) Number.isFinite(r[e]) || (r[e] = 0, i++);
	return i && n(i), r;
}
function It(e, t, n, r) {
	let i = new Float32Array(e.length);
	for (let t = 0; t < e.length; t++) i[t] = e[t] + r[t];
	let a = Rt(i, t);
	for (let e = 0; e < a.length; e += 3) {
		let t = Math.hypot(a[e], a[e + 1], a[e + 2]);
		for (let r = 0; r < 3; r++) {
			let i = t > 1e-8 ? a[e + r] / t : n[e + r];
			a[e + r] = i - n[e + r];
		}
	}
	return a;
}
function Lt(e, t, n) {
	let [r, i, a] = [
		t[n] * 3,
		t[n + 1] * 3,
		t[n + 2] * 3
	], o = [
		e[i] - e[r],
		e[i + 1] - e[r + 1],
		e[i + 2] - e[r + 2]
	], s = [
		e[a] - e[r],
		e[a + 1] - e[r + 1],
		e[a + 2] - e[r + 2]
	], c = [
		o[1] * s[2] - o[2] * s[1],
		o[2] * s[0] - o[0] * s[2],
		o[0] * s[1] - o[1] * s[0]
	];
	return {
		corners: [
			r,
			i,
			a
		],
		cross: c
	};
}
function Rt(e, t) {
	let n = new Float32Array(e.length), r = new Float32Array(e.length);
	for (let i = 0; i < t.length; i += 3) {
		let { corners: a, cross: o } = Lt(e, t, i), s = Math.hypot(...o);
		for (let e of a) {
			for (let t = 0; t < 3; t++) n[e + t] += o[t];
			if (s > 1e-8 && !r[e] && !r[e + 1] && !r[e + 2]) for (let t = 0; t < 3; t++) r[e + t] = o[t] / s;
		}
	}
	for (let e = 0; e < n.length; e += 3) if (Math.hypot(...n.subarray(e, e + 3)) < 1e-8 && (r[e] || r[e + 1] || r[e + 2])) for (let t = 0; t < 3; t++) n[e + t] = r[e + t];
	return n;
}
var zt = class extends Error {};
function Bt(e, t) {
	for (let n = 0; n < t.length; n += 3) if (Math.hypot(...Lt(e, t, n).cross) > 0) return !0;
	return !1;
}
function Vt(e, t, n, r, i) {
	let { position: a, normal: o, uv: s, uv1: c, color: l, skinIndex: u, skinWeight: d } = e.attributes, f = (e) => (t) => i(`${t} non-finite ${e} value(s) were set to 0`), p = Ft(a, 3, f("POSITION")), m = new Uint32Array(e.index?.count ?? a.count);
	for (let t = 0; t < m.length; t++) {
		let n = e.index ? e.index.array[t] : t;
		if (!Number.isInteger(n) || n < 0 || n >= a.count) throw new zt("an index is out of range of its POSITION accessor");
		m[t] = n;
	}
	if (o && o.count !== a.count) throw Error("NORMAL and POSITION counts must match.");
	if (!Bt(p, m)) throw new zt("every triangle has zero area");
	let h = o ? $(o, 3) : Rt(p, m), g = {
		positions: p,
		normals: h,
		indices: m
	}, _ = [];
	for (let e = 0; e < h.length; e += 3) {
		let t = Math.hypot(...h.subarray(e, e + 3));
		if (t < 1e-8 && !o) h[e + 1] = 1;
		else if (t < 1e-8) _.push(e);
		else for (let n = 0; n < 3; n++) h[e + n] /= t;
	}
	if (_.length) {
		let e = Rt(p, m);
		for (let t of _) {
			let n = Math.hypot(...e.subarray(t, t + 3));
			for (let r = 0; r < 3; r++) h[t + r] = n > 1e-8 ? e[t + r] / n : +(r === 1);
		}
		i(`${_.length} vertex normal(s) had zero length and were rebuilt from the triangles`);
	}
	if (t.targets?.length && (g.morphTargets = t.targets.map((t, n) => {
		let r = {};
		return t.POSITION !== void 0 && (r.positions = Ft(e.morphPositions[n], 3, f("morph POSITION"))), t.NORMAL !== void 0 && o && (r.normals = $(e.morphNormals[n], 3)), !o && r.positions && (r.normals = It(p, m, h, r.positions)), r;
	}), !o && g.morphTargets.some((e) => e.normals) && i("it has morph targets but no base NORMAL; base and per-target normals are generated from the triangles")), s && s.count !== a.count) throw Error("TEXCOORD_0 and POSITION counts must match.");
	if (s && (g.uvs = $(s, 2)), n) {
		if (!c || c.count !== a.count) throw Error("TEXCOORD_1 and POSITION counts must match.");
		g.lightUvs = $(c, 2);
	}
	return l && (g.colors = rn(l, a.count, r)), u && (g.skinIndices = new Uint16Array($(u, 4))), d && (g.skinWeights = $(d, 4)), g;
}
function Ht(e) {
	let t = e.skeleton.bones.length, n = p(t), r = p(t), i = new Float32Array(t * 16), a = 0, o = !1, s = new Float32Array(t * 16), c = new Float32Array(t * 16), l = e.skeleton.bones.map((t, n) => {
		let r = i.subarray(n * 16, n * 16 + 16);
		return r.set(e.skeleton.boneInverses[n].elements), r.every(Number.isFinite) ? Math.abs(d(r, 0)) < 1e-10 && (r.set(Ut), o = !0) : (r.set(Ut), a++), {
			name: t.name,
			parent: e.skeleton.bones.indexOf(t.parent)
		};
	}), u = Object.assign(n, {
		joints: l,
		inverseBindMatrices: i,
		jointWorldMatrices: s,
		bindMatrix: new Float32Array(e.bindMatrix.elements)
	});
	return {
		node: e,
		skin: u,
		pendingPose: r,
		pendingWorld: c,
		palette: u.jointMatrices,
		jointWorld: u.jointWorldMatrices,
		repairedInverseBindMatrices: a,
		collapsedJoints: o
	};
}
var Ut = [
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
];
function Wt(e, t) {
	for (let n = t; n < t + 16; n++) if (!Number.isFinite(e[n])) return !0;
	let n = e[t], r = e[t + 1], i = e[t + 2], a = e[t + 3], o = e[t + 4], s = e[t + 5], c = e[t + 6], l = e[t + 7], u = e[t + 8], d = e[t + 9], f = e[t + 10], p = e[t + 11], m = e[t + 12], h = e[t + 13], g = e[t + 14], _ = e[t + 15], v = n * s - r * o, y = n * c - i * o, b = r * c - i * s, x = u * h - d * m, S = u * g - f * m, C = d * g - f * h, w = n * C - r * S + i * x, ee = o * C - s * S + c * x, T = u * b - d * y + f * v, E = m * b - h * y + g * v, D = l * w - a * ee + _ * T - p * E;
	return !Number.isFinite(D) || Math.abs(D) < 1e-12;
}
function Gt(e, t, n = !0) {
	let { node: r, skin: i, pendingPose: a, pendingWorld: o } = e;
	if (i.jointMatrices !== e.palette || i.jointWorldMatrices !== e.jointWorld || e.palette.length !== a.jointMatrices.length || e.jointWorld.length !== o.length) throw Error("Imported skin palette identities must remain unchanged.");
	for (let t = 0; t < r.skeleton.bones.length; t++) {
		let n = t * 16;
		o.set(r.skeleton.bones[t].matrixWorld.elements, n), Wt(o, n) && Zt(o.subarray(n, n + 16), void 0, Xt) && (e.collapsedJoints = !0);
	}
	u(a, o, i.inverseBindMatrices, r.matrixWorld.elements, i.bindMatrix, n), n && f(a, t, r.matrixWorld.elements);
}
function Kt(e) {
	e.skin.jointMatrices.set(e.pendingPose.jointMatrices), e.skin.jointWorldMatrices.set(e.pendingWorld);
}
function qt(e, t, n) {
	let r = v(t.morphTargets.length);
	r.weights.set(e.morphTargetInfluences);
	let i = v(r.weights.length), a = n.get(t);
	return a ? _(r, a) : (a = g(t, r), n.set(t, a)), {
		node: e,
		pose: r,
		weights: r.weights,
		pendingPose: i,
		metadata: a
	};
}
function Jt(e) {
	if (e.pose.weights !== e.weights || e.weights.length !== e.metadata.targetCount) throw Error("Imported morph weight identity must remain unchanged.");
	let t = e.node.morphTargetInfluences;
	if (t.length !== e.weights.length) throw Error("Decoded morph weight count changed.");
	e.pendingPose.weights.set(t), _(e.pendingPose, e.metadata);
}
var Yt = 2e-4, Xt = .01;
function Zt(e, t = 1e-12, n = Yt) {
	let r = !0;
	for (let t = 0; t < 16; t++) if (!Number.isFinite(e[t])) {
		r = !1;
		break;
	}
	let a = r ? i(e) : NaN;
	if (r && Number.isFinite(a) && Math.abs(a) >= t) return !1;
	let o = [
		e[12],
		e[13],
		e[14]
	], s = o.every(Number.isFinite);
	return e.fill(0), e[0] = e[5] = e[10] = n, e[15] = 1, s && e.set(o, 12), !0;
}
function Qt(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e.animations ?? []) for (let e of n.channels ?? []) Number.isInteger(e.target?.node) && t.add(e.target.node);
	return t;
}
function $t(e, t) {
	for (let n = e; n; n = n.parent) if (t.has(n.association?.nodes)) return !0;
	return !1;
}
function en(e, t, n, r) {
	for (let i of e) {
		t.set(i.matrixWorld.elements);
		let e = t.every(Number.isFinite), a = e ? n.fromArray(t).determinant() : NaN;
		if (!(e && Number.isFinite(a) && Math.abs(a) >= 1e-12) && !r.has(i)) {
			if (!r.collecting) throw Error(e ? "Animation creates a singular Float32 node transform." : "Animation creates a non-finite Float32 world matrix.");
			r.add(i);
		}
	}
}
function tn(e, t) {
	return e.isInstancedMesh ? (q(K([], "instances of one node", e.count, "maxInstances", t)), Array.from({ length: e.count }, (t, n) => {
		let r = new G();
		return e.getMatrixAt(n, r), r;
	})) : [null];
}
function nn(e, t, n) {
	return t ? n.multiplyMatrices(e.matrixWorld, t) : n.copy(e.matrixWorld);
}
function rn(e, t, n) {
	if (e.count !== t || ![3, 4].includes(e.itemSize)) throw Error("COLOR_0 requires matching RGB or RGBA vertex values.");
	let r = $(e, e.itemSize), i = new Float32Array(t * 3), a = !1;
	for (let n = 0; n < t; n++) {
		let t = n * e.itemSize;
		e.itemSize === 4 && r[t + 3] < 1 && (a = !0);
		for (let e = 0; e < 3; e++) {
			let a = r[t + e];
			if (a < 0 || a > 1) throw Error("COLOR_0 RGB values must be within zero and one.");
			i[n * 3 + e] = a;
		}
	}
	return a && n(), i;
}
function an(e, t, n) {
	if (e.isCompressedTexture) return W(e.format, e.mipmaps, t, n);
	let r = e.image;
	if (!r?.data) return r;
	let { width: i, height: a, data: o } = r;
	if (!(o instanceof Uint8Array) || o.length < i * a * 4) throw Error(`${t} KTX2 image must decode to RGBA8 pixels.`);
	let s = new Uint8ClampedArray(o.buffer, o.byteOffset, i * a * 4);
	return typeof ImageData == "function" ? new ImageData(s, i, a) : {
		width: i,
		height: a,
		data: s
	};
}
function on(e, t, { colorSpace: n, uvChannel: r, uvTransform: i = null }, a, o) {
	o.has(e) || o.set(e, /* @__PURE__ */ new Map());
	let s = o.get(e), c = `${n}:${r}:${i ?? ""}`;
	if (!s.has(c)) {
		let o = an(e, t, n);
		if (!o || o.width * o.height > a.maxTextureImagePixels) throw Error(`${t} image is missing or exceeds maxTextureImagePixels.`);
		let l = {
			image: o,
			uvChannel: r,
			wrapS: e.wrapS,
			wrapT: e.wrapT,
			minFilter: e.minFilter,
			magFilter: e.magFilter,
			flipY: !1,
			colorSpace: n
		};
		i && (l.uvTransform = i), m(l), s.set(c, l);
	}
	return s.get(c);
}
function sn(e) {
	return [...e.values()].flatMap((e) => [...e.values()]).map((e) => {
		let { width: t, height: n, compressed: r } = e.image;
		return {
			format: r?.name ?? "rgba8",
			width: t,
			height: n,
			colorSpace: e.colorSpace,
			bytes: m(e).bytes
		};
	});
}
function cn(e, t, n, r = {}) {
	let i = !!r.extensions?.KHR_materials_unlit, s = {
		tag: i ? "unlit" : "gltf",
		color: [...e.color],
		metallic: e.metalness,
		roughness: e.roughness,
		emission: e.emissiveIntensity ?? 1,
		emissiveColor: [...e.emissive],
		normalScale: [r.normalTexture?.scale ?? 1, r.normalTexture?.scale ?? 1],
		occlusionStrength: e.aoMapIntensity
	};
	if (typeof r.name == "string" && r.name && (s.name = r.name.slice(0, 256)), s.alphaMode = Ye[r.alphaMode ?? "OPAQUE"], s.alphaCutoff = r.alphaCutoff ?? .5, s.opacity = r.pbrMetallicRoughness?.baseColorFactor?.[3] ?? 1, s.doubleSided = r.doubleSided ?? !1, i || Object.assign(s, a(r)), i && (s.emissiveColor = [
		0,
		0,
		0
	]), s.emissiveColor.some((e) => e > 0) || (s.emission = 0), !Number.isFinite(Math.fround(s.emission)) || s.emission < 0) throw Error("Emissive intensity must be a finite nonnegative float.");
	for (let [a, o, c] of $e) {
		if (i && a !== "map") continue;
		let l = e[a === "metallicRoughnessMap" ? "metalnessMap" : a === "occlusionMap" ? "aoMap" : a];
		l && (s[a] = on(l, a, {
			colorSpace: c,
			uvChannel: Y(tt(r, o)),
			uvTransform: a === "normalMap" ? pt(r).normalRelative : null
		}, t, n));
	}
	for (let [a, c, l] of i ? [] : o(r)) {
		let r = e.layerTextures?.[a];
		r && (s.layerMaps ??= {}, s.layerMaps[a] = on(r, a, {
			colorSpace: l,
			uvChannel: Y(c)
		}, t, n));
	}
	return s;
}
function ln() {
	return Object.assign(/* @__PURE__ */ new Map(), { descriptors: /* @__PURE__ */ new Map() });
}
async function un(e, t = {}) {
	let n = rt(t), r = it(e, n.maxBytes), i = await Je(r), a = t.decoders ?? {}, o = null, s, c = St(r);
	try {
		s = _t(r, n, ct(a));
	} catch (e) {
		if (o = (await import("./gltf-map-resample-DcqmvZPk.js")).planMapResampling(r, {
			materialTextureReferences: X,
			textureUvTransform: dt
		}), !o) throw e;
		s = _t(r, n, ct(a));
	}
	let { ignoredExtensions: u, overruns: d } = s;
	await Ke(r);
	let f = [
		...i,
		...u.map((e) => `${e} is accepted but not rendered.`),
		...yt(r),
		...c
	], { resourceBytes: p, textureScaling: m } = await Mt(r, e, typeof e == "string" ? new TextEncoder().encode(e).byteLength : e.byteLength, t, n, d);
	if (m.scaledTextures.length) {
		let e = m.scaledTextures.slice(0, 3).map(({ name: e, from: t, to: n }) => `${e} ${t.join("x")} to ${n.join("x")}`), t = m.scaledTextures.length - e.length, n = t ? ` and ${t} more (see asset.scaledTextures)` : "";
		f.push(`Scaled ${m.scaledTextures.length} texture image(s) to fit maxTexturePixels: ${e.join(", ")}${n}.`);
	}
	let g;
	try {
		g = await Me({
			document: r,
			glbBinary: At(e),
			resourceBytes: p,
			decoders: a,
			limits: n,
			imageTargets: m.targetByImageIndex,
			sharedTextures: t.sharedTextures
		}), o && f.push(...o.apply(g, n));
		let i = [], s = [], c = [], u = [], d = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), y = t.sharedTextures?.descriptors ?? /* @__PURE__ */ new Map(), b = [], x = /* @__PURE__ */ new Set(), S = [], C = new G(), w = /* @__PURE__ */ new Float32Array(16), ee = Qt(r), T = 0;
		g.scene.traverse((e) => {
			b.push(e);
			let t = e.association?.nodes;
			if (t !== void 0 && r.nodes?.[t]?.extensions?.KHR_lights_punctual && S.push({
				nodeIndex: t,
				matrix: Array.from(e.matrixWorld.elements)
			}), !e.isMesh) return;
			let a = e.association, o = r.meshes?.[a?.meshes]?.primitives?.[a?.primitives];
			if (!o) throw Error("Decoded mesh requires a valid original primitive association.");
			if (Array.isArray(e.material)) throw Error("Multiple materials on one decoded primitive are unsupported.");
			let p = e.material.materialIndex, m = pt(r.materials?.[p] ?? {}).shared, g = Q(m), w = nt(r.materials?.[p]);
			v.has(e.material) || v.set(e.material, cn(e.material, n, y, r.materials?.[p]));
			let E = v.get(e.material);
			for (let t of tn(e, n.maxInstances)) {
				let p = nn(e, t, C).determinant(), v = !Number.isFinite(p) || Math.abs(p) < 1e-12;
				if (v) {
					let t = $t(e, ee), n = e.name ? `"${e.name}"` : a.nodes, r = t ? `Node ${n} starts with a singular or non-finite world transform; it draws nothing while its scale is zero.` : `Skipped node ${n}: its world transform is singular or non-finite.`;
					if (f.includes(r) || f.push(r), !t) continue;
				}
				let y = !v && p < 0, b = `${e.geometry.uuid}:${g}:${w}`;
				if (!d.has(b)) {
					T += e.geometry.attributes.position.count * (1 + (o.targets?.length ?? 0)), q(K([], "decoded vertices", T, "maxVertices", n.maxVertices));
					try {
						let t = Vt(e.geometry, o, w, () => x.add(e.name), (e) => {
							let t = `Repaired ${bt(r, a.meshes, a.primitives)}: ${e}.`;
							f.includes(t) || f.push(t);
						});
						t.uvs && mt(t.uvs, m), d.set(b, t);
					} catch (e) {
						if (!(e instanceof zt)) throw e;
						let t = `Skipped ${bt(r, a.meshes, a.primitives)}: ${e.message}.`;
						f.includes(t) || f.push(t), d.set(b, null);
					}
				}
				let S = d.get(b);
				if (!S) continue;
				if ([...$e.map(([e]) => E[e]), ...Object.values(E.layerMaps ?? {})].some((e) => e && e.uvChannel === 0) && !S.uvs) throw Error("Material textures require TEXCOORD_0.");
				let D = new Float32Array(nn(e, t, C).elements);
				Zt(D);
				let O = {
					name: e.name || `glTF mesh ${i.length + 1}`,
					geometry: S,
					matrix: D,
					material: E
				}, k = {
					node: e,
					instanceMatrix: t,
					part: O,
					mirrored: y,
					matrix: O.matrix,
					pendingMatrix: /* @__PURE__ */ new Float32Array(16)
				}, A;
				if (e.isSkinnedMesh) {
					let t = Ht(e);
					if (Gt(t, S), t.collapsedJoints) {
						let t = `Skin of ${e.name ? `"${e.name}"` : a.nodes} has a joint with zero or non-finite scale; its vertices collapse to a point while it is singular.`;
						f.includes(t) || f.push(t);
					}
					if (t.repairedInverseBindMatrices) {
						let n = `Skin of ${e.name ? `"${e.name}"` : a.nodes} has ${t.repairedInverseBindMatrices} non-finite inverse bind matrix(es); they were replaced with the identity.`;
						f.includes(n) || f.push(n);
					}
					Kt(t), O.skin = t.skin, c.push({
						...t,
						geometry: S
					}), A = t.pendingPose;
				}
				if (l(S, O.skin), k.skin = O.skin, S.morphTargets) {
					let t = qt(e, S, _);
					O.morph = t.pose;
					let n = at(r, e, t.pose.weights.length);
					n && (O.morphTargetNames = n), h(t.pose, t.metadata, O.matrix, O.skin), u.push({
						...t,
						part: O,
						pendingMatrix: k.pendingMatrix,
						pendingSkin: A
					});
				}
				if (!Array.from(O.matrix).every(Number.isFinite)) throw Error("Mesh world matrix must be finite.");
				i.push(O), s.push(k), q(K([], "decoded parts", i.length, "maxParts", n.maxParts));
			}
		});
		let E = Object.assign(/* @__PURE__ */ new Set(), { collecting: !0 });
		if (en(b, w, C, E), E.collecting = !1, !i.length && !r.skins?.length && !g.animations.length) {
			let e = f.filter((e) => e.startsWith("Skipped "));
			throw Error(`glTF scene contains no supported triangle meshes and no skin or animation.${e.length ? ` ${e.join(" ")}` : ""}`);
		}
		let { lights: D, warnings: O } = He(r, S);
		f.push(...O), x.size && f.push(`Ignored the alpha of RGBA COLOR_0 vertex colors in ${[...x].join(", ")}; only the RGB is used.`);
		let k = /* @__PURE__ */ new Map();
		for (let e of b) {
			let t = e.association.nodes;
			if (t === void 0) continue;
			let n = `node-${t}`;
			if (k.has(n)) throw Error("Decoded source node IDs must not alias.");
			k.set(n, e);
		}
		let A = new Map([...k].map(([e, t]) => [t, e])), j = new Set(c.flatMap((e) => e.node.skeleton.bones)), te = new Set((r.skins ?? []).flatMap((e) => e.joints));
		for (let e of k.values()) te.has(e.association.nodes) && j.add(e);
		for (let e of b) E.add(e);
		let M = new Map([...k.values()].map((e) => [e, []]));
		for (let e = 0; e < s.length; e++) {
			let t = s[e].node;
			for (; t && !A.has(t);) t = t.parent;
			if (!t) throw Error("Decoded mesh requires a stable source node association.");
			M.get(t).push(`mesh-${e}`);
		}
		let N = [...k].map(([e, t]) => {
			let n = t.parent;
			for (; n && !A.has(n);) n = n.parent;
			let i = r.nodes[Number(e.slice(5))], a = new G().compose(t.position, t.quaternion, t.scale), o = i.matrix ?? t.matrix.elements, s = t.scale.toArray().every((e) => e > 0 && Math.fround(e) > 0) && a.determinant() > 0 && o.every((e, t) => Math.abs(e - a.elements[t]) <= 1e-6 * Math.max(1, Math.abs(e))), c = M.get(t);
			return {
				id: e,
				label: String(i.name ?? e).slice(0, 256),
				name: t.name || e,
				parent: A.get(n) ?? null,
				translation: t.position.toArray(),
				rotation: t.quaternion.toArray(),
				scale: t.scale.toArray(),
				editable: s,
				joint: j.has(t),
				meshIds: c
			};
		}), ne = new Map(N.map((e) => [e.id, e])), P = s.map((e) => ({
			...e.part,
			matrix: e.pendingMatrix
		}));
		for (let e of c) {
			let t = s.findIndex((t) => t.node === e.node);
			P[t].skin = Object.assign(e.pendingPose, {
				joints: e.skin.joints,
				inverseBindMatrices: e.skin.inverseBindMatrices,
				jointWorldMatrices: e.pendingWorld,
				bindMatrix: e.skin.bindMatrix
			});
		}
		for (let e of u) P[s.findIndex((t) => t.node === e.node)].morph = e.pendingPose;
		let F = !1, I, L = null;
		function R(e = null) {
			if (!e) return b.map((e) => ({
				node: e,
				translation: e.position.toArray(),
				rotation: e.quaternion.toArray(),
				scale: e.scale.toArray(),
				matrix: [...e.matrix.elements],
				world: [...e.matrixWorld.elements],
				matrixAutoUpdate: e.matrixAutoUpdate,
				matrixWorldNeedsUpdate: e.matrixWorldNeedsUpdate,
				weights: e.morphTargetInfluences ? [...e.morphTargetInfluences] : null
			}));
			for (let t = 0; t < b.length; t++) {
				let n = b[t], r = e[t];
				z(n.position.values, r.translation), z(n.quaternion.values, r.rotation), z(n.scale.values, r.scale), z(n.matrix.elements, r.matrix), z(n.matrixWorld.elements, r.world), r.matrixAutoUpdate = n.matrixAutoUpdate, r.matrixWorldNeedsUpdate = n.matrixWorldNeedsUpdate, r.weights && z(n.morphTargetInfluences, r.weights);
			}
			return e;
		}
		function z(e, t) {
			for (let n = 0; n < t.length; n++) t[n] = e[n];
		}
		function re(e) {
			for (let t of e) if (t.node.position.fromArray(t.translation), t.node.quaternion.fromArray(t.rotation), t.node.scale.fromArray(t.scale), t.node.matrix.fromArray(t.matrix), t.node.matrixWorld.fromArray(t.world), t.node.matrixAutoUpdate = t.matrixAutoUpdate, t.node.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, t.weights) for (let e = 0; e < t.weights.length; e++) t.node.morphTargetInfluences[e] = t.weights[e];
		}
		let ae = R();
		function B(e) {
			re(ae), e !== null && ie(g.animations[e.clip], e.time);
		}
		function V(e = !0) {
			g.scene.updateMatrixWorld(!0), e && en(b, w, C, E);
			let t = new G();
			for (let { node: n, instanceMatrix: r, part: i, mirrored: a, matrix: o, pendingMatrix: c, skin: l } of s) {
				if (i.matrix !== o || o.length !== 16) throw Error("Imported part matrix identity must remain unchanged.");
				if (i.skin !== l) throw Error("Imported skin pose identity must remain unchanged.");
				if (c.set(nn(n, r, t).elements), Zt(c) || !e) continue;
				for (let e of c) if (!Number.isFinite(e)) throw Error("Animation creates a non-finite Float32 world matrix.");
				let s = t.determinant(), u = C.fromArray(c).determinant();
				if (!Number.isFinite(s) || !Number.isFinite(u) || Math.abs(u) < 1e-12 || s < 0 !== a || u < 0 !== a) throw Error("Animation creates a singular transform or changes triangle winding.");
			}
			for (let t of c) Gt(t, t.geometry, e);
			for (let t of u) {
				if (t.part.morph !== t.pose) throw Error("Imported morph pose identity must remain unchanged.");
				Jt(t), e && h(t.pendingPose, t.metadata, t.pendingMatrix, t.pendingSkin);
			}
		}
		function H(e, t, n) {
			if (!e || Object.getPrototypeOf(e) !== Object.prototype) throw TypeError(`${n} must be a plain object.`);
			for (let r of Reflect.ownKeys(e)) {
				let i = Object.getOwnPropertyDescriptor(e, r);
				if (typeof r != "string" || !t.includes(r) || !i.enumerable || !Object.hasOwn(i, "value")) throw TypeError(`Unknown or unsupported ${n} field: ${String(r)}.`);
			}
		}
		function U(e, t, n) {
			if (!Array.isArray(e) || e.length !== t || Reflect.ownKeys(e).length !== t + 1) throw TypeError(`${n} needs ${t} finite Float32 values.`);
			let r = [];
			for (let i = 0; i < t; i++) {
				let a = Object.getOwnPropertyDescriptor(e, i);
				if (!a || !Object.hasOwn(a, "value") || !Number.isFinite(a.value) || !Number.isFinite(Math.fround(a.value))) throw TypeError(`${n} needs ${t} finite Float32 values.`);
				r.push(a.value);
			}
			return r;
		}
		function oe(e) {
			H(e, [
				"animation",
				"nodeOverrides",
				"morphWeights"
			], "pose");
			let t = e.animation ?? null;
			if (t !== null) {
				H(t, ["clip", "time"], "pose animation");
				let e = g.animations[t.clip];
				if (!Number.isInteger(t.clip) || !e || !Number.isFinite(t.time) || t.time < 0 || t.time > e.duration) throw RangeError("Pose animation needs an existing clip and time within its duration.");
			}
			let n = e.nodeOverrides === void 0 ? [] : e.nodeOverrides, r = Math.min(4096, k.size);
			if (!Array.isArray(n) || n.length > r || Reflect.ownKeys(n).length !== n.length + 1) throw RangeError(`Pose overrides must be a dense array with at most ${r} entries.`);
			let i = /* @__PURE__ */ new Set(), a = [];
			for (let e = 0; e < n.length; e++) {
				let t = Object.getOwnPropertyDescriptor(n, e);
				if (!t || !Object.hasOwn(t, "value")) throw TypeError("Pose overrides cannot contain holes or accessors.");
				let r = t.value;
				H(r, [
					"id",
					"translation",
					"rotation",
					"scale"
				], "node override");
				let o = ne.get(r.id);
				if (!o || i.has(r.id)) throw RangeError("Pose node IDs must exist and be distinct.");
				if (!o.editable) throw RangeError("Authored node poses require a positive TRS base without shear or reflection.");
				i.add(r.id);
				let s = { id: r.id };
				for (let e of [
					"translation",
					"rotation",
					"scale"
				]) Object.hasOwn(r, e) && (s[e] = U(r[e], e === "rotation" ? 4 : 3, e));
				if (Object.keys(s).length === 1) throw TypeError("A node override needs at least one transform field.");
				if (s.rotation) {
					let e = Math.hypot(...s.rotation);
					if (!Number.isFinite(e) || e < 1e-8) throw RangeError("Pose rotation needs a nonzero quaternion.");
					s.rotation = s.rotation.map((t) => t / e);
				}
				if (s.scale?.some((e) => Math.fround(e) <= 0)) throw RangeError("Pose scale must be positive at Float32 precision.");
				a.push(s);
			}
			return {
				animation: t === null ? null : { ...t },
				overrides: a,
				morphWeights: se(e.morphWeights)
			};
		}
		function se(e) {
			if (e === void 0) return [];
			if (!Array.isArray(e) || e.length > u.length || Reflect.ownKeys(e).length !== e.length + 1) throw RangeError(`Pose morphWeights must be a dense array with at most ${u.length} entries.`);
			let t = /* @__PURE__ */ new Set();
			return e.map((n, r) => {
				let a = Object.getOwnPropertyDescriptor(e, r);
				if (!a || !Object.hasOwn(a, "value")) throw TypeError("Pose morphWeights cannot contain holes or accessors.");
				H(a.value, ["part", "weights"], "morph weights");
				let o = u.find((e) => i[a.value.part] === e.part);
				if (!Number.isInteger(a.value.part) || !o || t.has(a.value.part)) throw RangeError("Pose morphWeights need distinct part indices of parts that have morph targets.");
				t.add(a.value.part);
				let s = U(a.value.weights, o.weights.length, "morph weights");
				if (s.some((e) => e < 0 || e > 1)) throw RangeError("Pose morph weights must be within 0 and 1.");
				return {
					binding: o,
					weights: s
				};
			});
		}
		function ce(e) {
			if (F) throw Error("The glTF asset was disposed.");
			if (I) throw Error("A pose transaction is already pending. Commit or discard it first.");
			let t = oe(e), n = R(), r = L;
			function a() {
				B(r), re(n);
			}
			try {
				B(t.animation);
				for (let e of t.overrides) {
					let t = k.get(e.id);
					e.translation && t.position.fromArray(e.translation), e.rotation && t.quaternion.fromArray(e.rotation), e.scale && t.scale.fromArray(e.scale), t.updateMatrix();
				}
				for (let { binding: e, weights: n } of t.morphWeights) n.forEach((t, n) => {
					e.node.morphTargetInfluences[n] = t;
				});
				V();
			} catch (e) {
				throw a(), e;
			}
			let o = !1;
			function s() {
				if (F) throw Error("The glTF asset was disposed.");
				if (o) throw Error("The pose transaction is already settled.");
			}
			let c = Object.freeze({
				parts: P,
				nodePoses() {
					return s(), [...k].map(([e, t]) => ({
						id: e,
						translation: t.position.toArray(),
						rotation: t.quaternion.toArray(),
						scale: t.scale.toArray()
					}));
				},
				commit() {
					s();
					try {
						V();
					} catch (e) {
						throw a(), o = !0, I = null, e;
					}
					return fe(t.animation), W = !1, o = !0, I = null, i;
				},
				discard() {
					return s(), a(), o = !0, I = null, i;
				}
			});
			return I = c, c;
		}
		function le() {
			F || (I?.discard(), F = !0, g.release());
		}
		function ue(e, t = 0, { checks: n = !0 } = {}) {
			if (F) throw Error("The glTF asset was disposed.");
			if (!Number.isFinite(e)) throw TypeError("Animation time must be finite.");
			if (typeof n != "boolean") throw TypeError("Animation checks must be a boolean.");
			let r = g.animations[t];
			if (!Number.isInteger(t) || !r) throw RangeError("Animation clip index is out of range.");
			if (I) throw Error("A pose transaction is already pending. Commit or discard it first.");
			let a = {
				clip: t,
				time: Math.max(0, Math.min(e, r.duration))
			}, o = W ? null : R(de ??= R()), s = L;
			try {
				W && s?.clip === a.clip ? ie(r, a.time) : B(a), V(n);
			} catch (e) {
				throw B(s), o && re(o), e;
			}
			return fe(a), W = !0, i;
		}
		let de = null, W = !0;
		function fe(e) {
			for (let { matrix: e, pendingMatrix: t } of s) Float32Array.prototype.set.call(e, t);
			for (let e of c) Kt(e);
			for (let e of u) Float32Array.prototype.set.call(e.weights, e.pendingPose.weights);
			L = e;
		}
		return {
			parts: i,
			warnings: f,
			lights: D,
			scaledTextures: m.scaledTextures,
			textureFormats: sn(y),
			skins: c.map((e) => e.skin),
			animations: g.animations,
			get nodes() {
				return structuredClone(N);
			},
			stagePose: ce,
			applyAnimation: ue,
			dispose: le,
			capabilities: We
		};
	} catch (e) {
		throw g?.release(), e;
	}
}
async function dn(e, t = {}) {
	let n = rt(t);
	if (typeof e == "string" || e instanceof URL) {
		let r = new URL(String(e), globalThis.location?.href).href;
		if (!/^(https?:|blob:|data:)/.test(r)) throw Error("Unsupported glTF source URL protocol.");
		let i = await jt(r, n.maxBytes, t.signal), a = t.baseUrl ?? (/^https?:/.test(r) ? new URL(".", r).href : "");
		return un(i.bytes.buffer, {
			...t,
			baseUrl: a
		});
	}
	if (!e || typeof e.arrayBuffer != "function" || !Number.isSafeInteger(e.size)) throw TypeError("loadGltf expects a URL or a File/Blob.");
	return q(K([], "file bytes", e.size, "maxBytes", n.maxBytes)), un(await e.arrayBuffer(), t);
}
export { me as a, un as i, ln as n, dn as r, We as t };
