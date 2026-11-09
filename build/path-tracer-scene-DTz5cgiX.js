/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./rolldown-runtime-CvuOiBwx.js";
import { t } from "./triangle-bvh-MJBX52tQ.js";
import { t as n } from "./ray-query-CWJhfYYD.js";
import { r, t as i } from "./light-link-bits-Bn3Ktwrl.js";
import { n as a, t as o } from "./export-box-uv-CcWmsskb.js";
import { n as s } from "./path-tracer-volume-CWKqVztb.js";
import { r as c } from "./path-tracer-subsurface-Dyu5_MBA.js";
import { a as l } from "./shader-registry-DHYkwAg5.js";
// src/path-tracer-scene.js
var u = /* @__PURE__ */ e({
	MAX_TRACE_LIGHTS: () => 32,
	MAX_TRACE_PARTS: () => f,
	MAX_TRACE_TRIANGLES: () => d,
	SUN_ANGULAR_RADIUS: () => p,
	attachTracer: () => I,
	buildTraceScene: () => L,
	skinnedGeometry: () => _,
	texturePixels: () => S
}), d = 4e5, f = 1024, p = Math.PI / 360, m = Object.freeze([
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
]), h = 10497;
function g(e, t, n, r, i, a, o, s, c) {
	let l = r * 16;
	e[t] += i * (n[l] * a + n[l + 4] * o + n[l + 8] * s + n[l + 12] * c), e[t + 1] += i * (n[l + 1] * a + n[l + 5] * o + n[l + 9] * s + n[l + 13] * c), e[t + 2] += i * (n[l + 2] * a + n[l + 6] * o + n[l + 10] * s + n[l + 14] * c);
}
function _(e) {
	let { geometry: t, skin: n } = e, r = t.positions.length / 3, i = new Float32Array(t.positions.length), a = new Float32Array(t.normals.length), o = t.skinWeights.length / r;
	for (let e = 0; e < r; e++) {
		let r = e * 3;
		for (let s = 0; s < o; s++) {
			let c = t.skinWeights[e * o + s];
			if (c === 0) continue;
			let l = t.skinIndices[e * o + s];
			g(i, r, n.jointMatrices, l, c, t.positions[r], t.positions[r + 1], t.positions[r + 2], 1), g(a, r, n.jointMatrices, l, c, t.normals[r], t.normals[r + 1], t.normals[r + 2], 0);
		}
		let s = Math.hypot(a[r], a[r + 1], a[r + 2]) || 1;
		for (let e = 0; e < 3; e++) a[r + e] /= s;
	}
	return {
		...t,
		positions: i,
		normals: a
	};
}
function v(e) {
	let [t, n, r, , i, a, o, , s, c, l] = e, u = [
		a * l - o * c,
		o * s - i * l,
		i * c - a * s,
		r * c - n * l,
		t * l - r * s,
		n * s - t * c,
		n * o - r * a,
		r * i - t * o,
		t * a - n * i
	], d = t * u[0] + n * u[1] + r * u[2] < 0 ? -1 : 1;
	return u.map((e) => e * d);
}
function y() {
	let e = /* @__PURE__ */ new Float32Array(256);
	for (let t = 0; t < 256; t++) {
		let n = t / 255;
		e[t] = n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
	}
	return e;
}
var b = y(), x = /* @__PURE__ */ new WeakMap();
function S(e, t = C) {
	if (!e?.width || !e.height) return null;
	if (e.data) return e.data;
	if (e.compressed || typeof e != "object") return null;
	if (x.has(e)) return x.get(e);
	let n = t(e.width, e.height)?.getContext("2d", { willReadFrequently: !0 });
	if (!n) return null;
	n.drawImage(e, 0, 0);
	let r = n.getImageData(0, 0, e.width, e.height).data;
	return x.set(e, r), r;
}
function C(e, t) {
	if (typeof OffscreenCanvas == "function") return new OffscreenCanvas(e, t);
	let n = globalThis.document?.createElement("canvas");
	return n ? (n.width = e, n.height = t, n) : null;
}
function w(e) {
	let t = e?.image, n = S(t);
	return n ? {
		width: t.width,
		height: t.height,
		data: n,
		colorLookup: e.colorSpace === "linear" ? null : b,
		repeat: e.wrapS === h
	} : null;
}
var T = -1;
function E(e) {
	let t = e.pattern?.type === "graph" ? e.pattern.graph : null;
	return e.alphaMode === "blend" && t && Object.hasOwn(t, "opacity") ? .5 : 0;
}
function D(e) {
	let t = e.emissiveColor ?? e.color, n = e.emission ?? 0;
	return {
		color: e.color ?? [
			1,
			1,
			1
		],
		metallic: e.metallic ?? 0,
		roughness: e.roughness ?? .5,
		emission: t.map((e) => e * n),
		emissiveTexture: n > 0 ? w(e.emissiveMap) : null,
		clearcoat: e.clearcoat ?? 0,
		clearcoatTexture: w(e.layerMaps?.clearcoatTexture),
		transmissionTexture: w(e.transmissionMap),
		clearcoatRoughness: e.clearcoatRoughness ?? 0,
		transmission: e.transmission ?? 0,
		subsurface: c(e.subsurface),
		ior: e.ior ?? 1.5,
		texture: w(e.map),
		normalTexture: w(e.normalMap),
		normalScale: e.normalScale ?? [1, 1],
		surfaceTexture: w(e.metallicRoughnessMap),
		lightMask: e.lightMask ?? T,
		alphaCutoff: e.alphaMode === "mask" ? e.alphaCutoff ?? .5 : E(e)
	};
}
function O(e, t, n) {
	if (!e || t !== void 0 && e.length !== t) throw TypeError(`${n} must hold ${t} numbers.`);
	for (let t = 0; t < e.length; t++) if (!Number.isFinite(e[t])) throw RangeError(`${n} must be finite numbers.`);
}
function k(e, t) {
	let n = `Part ${e.name ?? ""}`.trim();
	if (O(e.matrix ?? m, 16, `${n} matrix`), O(t.positions, void 0, `${n} positions`), t.positions.length % 3 != 0 || t.indices.length % 3 != 0) throw RangeError(`${n} positions and indices must come in threes.`);
	let r = t.positions.length / 3;
	if (t.normals?.length !== t.positions.length) throw RangeError(`${n} needs one normal for every position.`);
	O(t.normals, void 0, `${n} normals`);
	for (let e = 0; e < t.indices.length; e++) if (!(t.indices[e] < r)) throw RangeError(`${n} has an index past its last vertex.`);
	if (t.uvs && t.uvs.length !== r * 2) throw RangeError(`${n} needs one UV pair for every position.`);
	if (t.colors && t.colors.length !== r * 3) throw RangeError(`${n} needs one colour for every position.`);
}
function A(e) {
	let t = e.skin ? _(e) : e.geometry, { boxMapScale: n = 0, boxMapAxis: r = 1 } = e.material ?? {};
	return n > 0 ? o(t, a(e.matrix ?? m), n, r) : t;
}
function j(e) {
	let t = 0, n = 0, r = e.map(A);
	e.forEach((e, t) => k(e, r[t]));
	for (let e of r) t += e.positions.length / 3, n += e.indices.length;
	if (n / 3 > 4e5) throw RangeError(`A path trace takes at most ${d} triangles in total.`);
	let i = {
		positions: new Float32Array(t * 3),
		normals: new Float32Array(t * 3),
		uvs: new Float32Array(t * 2),
		colors: new Float32Array(t * 3).fill(1),
		indices: new Uint32Array(n),
		triangleMaterial: new Uint32Array(n / 3)
	}, a = 0, o = 0;
	return e.forEach((e, t) => {
		let n = r[t], s = e.matrix ?? m, c = v(s), l = n.positions.length / 3;
		for (let e = 0; e < l; e++) {
			let t = n.positions[e * 3], r = n.positions[e * 3 + 1], o = n.positions[e * 3 + 2], l = (a + e) * 3;
			i.positions[l] = s[0] * t + s[4] * r + s[8] * o + s[12], i.positions[l + 1] = s[1] * t + s[5] * r + s[9] * o + s[13], i.positions[l + 2] = s[2] * t + s[6] * r + s[10] * o + s[14];
			let u = n.normals[e * 3], d = n.normals[e * 3 + 1], f = n.normals[e * 3 + 2], p = c[0] * u + c[3] * d + c[6] * f, m = c[1] * u + c[4] * d + c[7] * f, h = c[2] * u + c[5] * d + c[8] * f, g = Math.hypot(p, m, h) || 1;
			i.normals[l] = p / g, i.normals[l + 1] = m / g, i.normals[l + 2] = h / g;
		}
		n.uvs && i.uvs.set(n.uvs, a * 2), n.colors && i.colors.set(n.colors, a * 3);
		for (let e = 0; e < n.indices.length; e++) i.indices[o * 3 + e] = n.indices[e] + a;
		i.triangleMaterial.fill(t, o, o + n.indices.length / 3), a += l, o += n.indices.length / 3;
	}), i;
}
function M(e) {
	let t = Math.hypot(e[0], e[1], e[2]) || 1;
	return [
		e[0] / t,
		e[1] / t,
		e[2] / t
	];
}
function N(e) {
	return e.ies === void 0 ? null : l.profile(e.ies);
}
function P(e) {
	let t = Math.max(...e.keyColor ?? [
		0,
		0,
		0
	]);
	if ((e.pointLights?.length ?? 0) + (e.spotLights?.length ?? 0) + (e.areaLights?.length ?? 0) > 32) throw RangeError("A path trace takes at most 32 point, spot and area lights.");
	return {
		sun: t > 0 ? {
			bit: 0,
			direction: M(e.lightDirection ?? [
				0,
				1,
				0
			]),
			color: e.keyColor,
			angularRadius: e.sunAngularRadius ?? p
		} : null,
		points: (e.pointLights ?? []).map((e, t) => ({
			bit: 1 + t,
			position: e.position,
			color: e.color,
			intensity: e.intensity,
			radius: e.radius ?? 0,
			range: e.range ?? 0
		})),
		spots: (e.spotLights ?? []).map((e, t) => ({
			bit: r + t,
			position: e.position,
			color: e.color,
			intensity: e.intensity,
			radius: e.radius ?? 0,
			range: e.range ?? 0,
			direction: M(e.direction),
			cosineHalfAngle: Math.cos(e.angle),
			profile: N(e),
			blend: (1 - Math.cos(e.angle)) * (e.penumbra ?? 0)
		})),
		areas: (e.areaLights ?? []).map((e, t) => {
			let n = M(e.direction), r = M(e.up ?? [
				0,
				1,
				0
			]), a = M([
				r[1] * n[2] - r[2] * n[1],
				r[2] * n[0] - r[0] * n[2],
				r[0] * n[1] - r[1] * n[0]
			]), o = [
				n[1] * a[2] - n[2] * a[1],
				n[2] * a[0] - n[0] * a[2],
				n[0] * a[1] - n[1] * a[0]
			];
			return {
				bit: i + t,
				position: e.position,
				color: e.color,
				intensity: e.intensity,
				width: e.width,
				height: e.height,
				normal: n,
				across: a,
				along: o,
				profile: N(e)
			};
		})
	};
}
function F(e) {
	if (!e) return null;
	let { width: t, height: n, channels: r, data: i, intensity: a, rotation: o } = e, s = Math.cos(o), c = Math.sin(o), l = new Float64Array(n), u = new Float64Array(t * n), d = 0;
	for (let e = 0; e < n; e++) {
		let a = Math.sin(Math.PI * (e + .5) / n), o = 0;
		for (let n = 0; n < t; n++) {
			let s = (e * t + n) * r;
			o += (.2126 * i[s] + .7152 * i[s + 1] + .0722 * i[s + 2] + 1e-6) * a, u[e * t + n] = o;
		}
		d += o, l[e] = d;
	}
	return {
		width: t,
		height: n,
		channels: r,
		data: i,
		intensity: a,
		cosine: s,
		sine: c,
		rowCumulative: l,
		pixelCumulative: u,
		total: d
	};
}
function I(e) {
	return {
		...e,
		tracer: n({
			positions: e.positions,
			indices: e.indices,
			bvh: e.bvh
		})
	};
}
function L(e, n = {}) {
	if (!Array.isArray(e) || e.length < 1 || e.length > 1024) throw RangeError(`A path trace takes 1 to ${f} parts.`);
	let r = j(e), i = t(r.positions, r.indices), a = .001;
	for (let e = 0; e < r.positions.length; e++) a = Math.max(a, Math.abs(r.positions[e]));
	return I({
		...r,
		bvh: i,
		materials: e.map((e) => D(e.material ?? {})),
		lights: P(n),
		environment: F(n.map),
		volume: s(n.volumeFog),
		surfaceOffset: a * 1e-5,
		farDistance: a * 1e4
	});
}
export { u as a, L as i, p as n, I as r, f as t };
