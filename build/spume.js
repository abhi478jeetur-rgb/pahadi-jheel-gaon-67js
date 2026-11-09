/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e } from "./mat4-BCZClxna.js";
import "./liquid-shader-B9Ya-tfK.js";
// src/spume.js
var t = 1179937895, n = 1313821514, r = 5130562, i = 5123, a = 5125, o = 5122, s = 5120, c = 6, l = 1e5, u = Object.freeze({
	spray: 0,
	foam: 1,
	bubble: 2
}), d = Object.freeze({
	tag: "liquid",
	color: [
		.56,
		.84,
		.88
	],
	metallic: 0,
	roughness: .05,
	emission: 0
}), f = Object.freeze({
	tag: "foam",
	color: [
		.95,
		.97,
		.98
	],
	metallic: 0,
	roughness: .6,
	emission: 0
}), p = [
	[
		1,
		1,
		1
	],
	[
		.93,
		.96,
		.97
	],
	[
		.7,
		.82,
		.86
	]
], m = [
	1,
	1.5,
	.6
], h = [
	0,
	2,
	4,
	4,
	2,
	1,
	1,
	2,
	5,
	5,
	2,
	0,
	4,
	3,
	0,
	1,
	3,
	4,
	5,
	3,
	1,
	0,
	3,
	5
];
function g(e) {
	let t = e & 32768 ? -1 : 1, n = e >> 10 & 31, r = e & 1023;
	return n === 0 ? t * 2 ** -14 * (r / 1024) : n === 31 ? r ? NaN : t * Infinity : t * 2 ** (n - 15) * (1 + r / 1024);
}
function _(e) {
	let i = e instanceof ArrayBuffer ? e : e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength), a = new DataView(i);
	if (i.byteLength < 28 || a.getUint32(0, !0) !== t || a.getUint32(4, !0) !== 2) throw TypeError("Spume frame is not a binary glTF 2.0 file.");
	let o = a.getUint32(12, !0);
	if (a.getUint32(16, !0) !== n || 20 + o + 8 > i.byteLength) throw TypeError("Spume frame has no JSON chunk.");
	let s = JSON.parse(new TextDecoder().decode(new Uint8Array(i, 20, o))), c = 20 + o, l = a.getUint32(c, !0);
	if (a.getUint32(c + 4, !0) !== r || c + 8 + l > i.byteLength) throw TypeError("Spume frame has no binary chunk.");
	return {
		description: s,
		buffer: i,
		binaryOffset: c + 8
	};
}
function v(e, t, n, r) {
	let i = e.description.accessors?.[t], a = e.description.bufferViews?.[i?.bufferView];
	if (!i || !a) throw TypeError("Spume frame references a missing accessor.");
	let o = i.count * r, s = e.binaryOffset + (a.byteOffset ?? 0) + (i.byteOffset ?? 0);
	if (s + o * n > e.buffer.byteLength) throw RangeError("Spume accessor runs past the binary chunk.");
	return {
		accessor: i,
		start: s,
		length: o
	};
}
function y(e) {
	let t = _(e), n = t.description.meshes?.[0]?.primitives?.[0];
	if (!n || n.indices === void 0) throw TypeError("Spume frame has no indexed mesh.");
	let r = v(t, n.attributes.POSITION, 2, 3);
	if (r.accessor.componentType !== o || r.accessor.min?.length !== 3 || r.accessor.max?.length !== 3) throw TypeError("Spume positions must be int16 with min and max bounds.");
	let c = new Int16Array(t.buffer.slice(r.start, r.start + r.length * 2)), l = new Float32Array(r.length), u = r.accessor.min, d = r.accessor.max.map((e, t) => Math.max(e - u[t], 1e-6));
	for (let e = 0; e < l.length; e++) {
		let t = e % 3;
		l[e] = u[t] + (c[e] + 32768) / 65535 * d[t];
	}
	let f = v(t, n.attributes.NORMAL, 1, 3);
	if (f.accessor.componentType !== s) throw TypeError("Spume normals must be int8.");
	let p = new Int8Array(t.buffer, f.start, f.length), m = new Float32Array(f.length);
	for (let e = 0; e < f.length; e += 3) {
		let t = Math.max(p[e] / 127, -1), n = Math.max(p[e + 1] / 127, -1), r = Math.max(p[e + 2] / 127, -1), i = Math.hypot(t, n, r);
		i > 1e-6 ? (m[e] = t / i, m[e + 1] = n / i, m[e + 2] = r / i) : m[e + 1] = 1;
	}
	let h = t.description.accessors[n.indices], g = h?.componentType === i ? 2 : 4;
	if (![i, a].includes(h?.componentType)) throw TypeError("Spume indices must be uint16 or uint32.");
	let y = v(t, n.indices, g, 1), b = g === 2 ? new Uint16Array(t.buffer.slice(y.start, y.start + y.length * 2)) : new Uint32Array(t.buffer.slice(y.start, y.start + y.length * 4)), x = Uint32Array.from(b), S = l.length / 3;
	if (x.length % 3 != 0 || !x.every((e) => e < S)) throw RangeError("Spume frame triangles address missing vertices.");
	return {
		positions: l,
		normals: m,
		indices: x
	};
}
function b(e) {
	if (!e || typeof e != "object") throw TypeError("Spume meta.json must be an object.");
	if (!Number.isFinite(e.fps) || e.fps <= 0) throw RangeError("Spume meta.fps must be positive.");
	if (!Number.isInteger(e.frameCount) || e.frameCount < 1 || e.frameCount > l) throw RangeError(`Spume meta.frameCount must be between 1 and ${l}.`);
	if (typeof e.frameFile != "string" || !e.frameFile.includes("%04d")) throw TypeError("Spume meta.frameFile must contain %04d.");
	let t = e.spray?.index;
	if (e.spray && (!Array.isArray(t) || t.length !== e.frameCount)) throw RangeError("Spume spray index must list every frame.");
	if (e.spray && e.spray.floatsPerPoint !== c) throw RangeError("Spume spray must store six floats per point.");
}
function x(e, t) {
	return e.frameFile.replace("%04d", String(t).padStart(4, "0"));
}
function S(e) {
	if (typeof e == "function") return e;
	if (typeof e == "string" || e instanceof URL) {
		let t = String(e).endsWith("/") ? String(e) : `${e}/`;
		return async (e) => {
			let n = await fetch(new URL(e, new URL(t, globalThis.location?.href)));
			if (n.status === 404) return null;
			if (!n.ok) throw Error(`Spume cache file ${e} failed with HTTP ${n.status}.`);
			return n.arrayBuffer();
		};
	}
	throw TypeError("Spume cache source must be a folder URL or a read(name) function.");
}
async function C(e) {
	let t = S(e), n = await t("meta.json");
	if (!n) throw Error("Spume cache has no meta.json.");
	let r = JSON.parse(new TextDecoder().decode(n));
	b(r);
	let i = await Promise.all(Array.from({ length: r.frameCount }, async (e, n) => {
		let i = await t(x(r, n));
		if (!i) throw Error(`Spume cache is missing ${x(r, n)}.`);
		return i;
	})), a = null;
	if (r.spray) {
		let e = r.spray.index.reduce((e, [t, n]) => Math.max(e, t + n), 0), [n, i, o] = await Promise.all([
			t(r.spray.file),
			t(r.spray.ids),
			r.spray.kinds ? t(r.spray.kinds) : null
		]);
		if (e > 0) {
			if (!n || n.byteLength < e * c * 2) throw RangeError("Spume spray.bin is shorter than its index.");
			if (!i || i.byteLength < e * 4) throw RangeError("Spume spray_ids.bin is shorter than its index.");
		}
		a = {
			index: r.spray.index,
			data: new Uint16Array(n ?? /* @__PURE__ */ new ArrayBuffer(0), 0, e * c),
			ids: new Uint32Array(i ?? /* @__PURE__ */ new ArrayBuffer(0), 0, e),
			kinds: o && o.byteLength >= e ? new Uint8Array(o, 0, e) : null
		};
	}
	return {
		meta: r,
		frames: i,
		spray: a,
		duration: r.frameCount / r.fps
	};
}
function w(e) {
	let t = e >>> 0;
	return t = Math.imul(t ^ t >>> 16, 73244475), t = Math.imul(t ^ t >>> 16, 73244475), t ^= t >>> 16, (t >>> 0) / 4294967295;
}
function T(e) {
	let t = Math.abs(e[1]) < .9 ? [
		0,
		1,
		0
	] : [
		1,
		0,
		0
	], n = [
		e[1] * t[2] - e[2] * t[1],
		e[2] * t[0] - e[0] * t[2],
		e[0] * t[1] - e[1] * t[0]
	], r = Math.hypot(...n);
	return n[0] /= r, n[1] /= r, n[2] /= r, [n, [
		e[1] * n[2] - e[2] * n[1],
		e[2] * n[0] - e[0] * n[2],
		e[0] * n[1] - e[1] * n[0]
	]];
}
function E(e, t, { radius: n = .014, shutter: r = 1 / 60, kinds: i = ["spray", "foam"], maxPoints: a = 12e3 } = {}) {
	if (!(r >= 0 && r <= 1)) throw RangeError("Spray shutter must be between 0 and 1 second.");
	let o = e.spray;
	if (!o) return null;
	let [s, l] = o.index[t], d = new Set(i.map((e) => {
		if (!(e in u)) throw TypeError(`Unknown spray kind: ${e}`);
		return u[e];
	})), f = [];
	for (let e = s; e < s + l; e++) d.has(o.kinds ? o.kinds[e] : u.spray) && f.push(e);
	if (f.length === 0) return null;
	let _ = Math.max(1, f.length / a), v = Math.min(f.length, a), y = new Float32Array(v * 6 * 3), b = new Float32Array(v * 6 * 3), x = new Float32Array(v * 6 * 3), S = new Uint32Array(v * h.length);
	for (let e = 0; e < v; e++) {
		let t = f[Math.floor(e * _)], i = o.kinds ? o.kinds[t] : u.spray, a = n * m[i] * (.6 + .8 * w(o.ids[t])), s = t * c, l = [
			g(o.data[s]),
			g(o.data[s + 1]),
			g(o.data[s + 2])
		], d = [
			g(o.data[s + 3]),
			g(o.data[s + 4]),
			g(o.data[s + 5])
		], v = Math.hypot(...d), C = v > .001 ? d.map((e) => e / v) : [
			0,
			1,
			0
		], [E, D] = T(C), O = a + v * r * .5, k = [
			[E, a],
			[E, -a],
			[C, O],
			[C, -O],
			[D, a],
			[D, -a]
		];
		for (let t = 0; t < 6; t++) {
			let n = (e * 6 + t) * 3, [r, a] = k[t], o = Math.sign(a);
			for (let e = 0; e < 3; e++) y[n + e] = l[e] + r[e] * a, b[n + e] = r[e] * o, x[n + e] = p[i][e];
		}
		for (let t = 0; t < h.length; t++) S[e * h.length + t] = e * 6 + h[t];
	}
	return {
		positions: y,
		normals: b,
		colors: x,
		indices: S
	};
}
function D(t, { name: n = t.meta.name ?? "Spume", matrix: r = e(), waterMaterial: i = d, sprayMaterial: a = f, spray: o = {}, loop: s = !1, cachedFrames: c = 4 } = {}) {
	if (!t?.meta || !Array.isArray(t.frames)) throw TypeError("createSpumePlayer needs a cache from loadSpumeCache.");
	if (!Number.isInteger(c) || c < 1) throw RangeError("cachedFrames must be a positive integer.");
	let l = t.meta.frameCount, u = /* @__PURE__ */ new Map();
	function p(e) {
		if (!Number.isFinite(e)) throw RangeError("Spume playback time must be finite.");
		let n = Math.floor(e * t.meta.fps + 1e-6);
		return s ? (n % l + l) % l : Math.min(Math.max(n, 0), l - 1);
	}
	function m(e) {
		let s = u.get(e);
		if (s) return u.delete(e), u.set(e, s), s;
		let l = [{
			name: `${n} liquid`,
			geometry: y(t.frames[e]),
			matrix: r,
			material: i
		}], d = o ? E(t, e, o) : null;
		for (d && l.push({
			name: `${n} whitewater`,
			geometry: d,
			matrix: r,
			material: a,
			castShadow: !1
		}), u.set(e, l); u.size > c;) u.delete(u.keys().next().value);
		return l;
	}
	return {
		frameCount: l,
		fps: t.meta.fps,
		duration: t.duration,
		frameIndexAt: p,
		partsAt: (e) => m(p(e)),
		partsForFrame: m
	};
}
export { f as DEFAULT_SPRAY_MATERIAL, d as DEFAULT_WATER_MATERIAL, u as SPRAY_KINDS, E as buildSprayGeometry, D as createSpumePlayer, y as decodeSpumeFrame, g as float16ToFloat32, x as frameFileName, C as loadSpumeCache };
