/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t, t as n } from "./mat4-BCZClxna.js";
import { t as r } from "./gl-program-KwXE3oHO.js";
// src/gaussian-splat-sort.js
var i = 65536, a = 1e-6;
function o(e, { minimum: t, maximum: n }) {
	let r = Infinity, i = -Infinity;
	for (let a = 0; a < 8; a++) {
		let o = a & 1 ? n[0] : t[0], s = a & 2 ? n[1] : t[1], c = a & 4 ? n[2] : t[2], l = e[2] * o + e[6] * s + e[10] * c + e[14];
		r = Math.min(r, l), i = Math.max(i, l);
	}
	return {
		nearest: r,
		farthest: i
	};
}
function s(e, t, n) {
	let r = new Int32Array(t), s = new Uint32Array(t), c = /* @__PURE__ */ new Uint32Array(65537), l = (/* @__PURE__ */ new Float64Array(4)).fill(NaN), u = 0;
	function d(d) {
		let f = [
			d[2],
			d[6],
			d[10],
			d[14]
		];
		if (f.every((e, t) => Math.abs(e - l[t]) <= a)) return {
			order: s,
			visibleCount: u,
			changed: !1
		};
		l.set(f);
		let { nearest: p, farthest: m } = o(d, n), h = Math.min(m, 0) - p, g = h > 0 ? 65535 / h : 0;
		c.fill(0);
		let _ = 0;
		for (let n = 0; n < t; n++) {
			let t = f[0] * e[n * 3] + f[1] * e[n * 3 + 1] + f[2] * e[n * 3 + 2] + f[3];
			if (t >= 0) {
				r[n] = -1;
				continue;
			}
			let i = Math.min(65535, Math.max(0, (t - p) * g | 0));
			r[n] = i, c[i + 1]++, _++;
		}
		for (let e = 0; e < i; e++) c[e + 1] += c[e];
		for (let e = 0; e < t; e++) {
			let t = r[e];
			t >= 0 && (s[c[t]++] = e);
		}
		return u = _, {
			order: s,
			visibleCount: u,
			changed: !0
		};
	}
	return {
		sort: d,
		get visibleCount() {
			return u;
		}
	};
}
// src/gaussian-splat-ply.js
var c = Object.freeze({
	maximumBytes: 536870912,
	maximumCount: 2e6
}), l = 4e6, u = [
	"x",
	"y",
	"z",
	"f_dc_0",
	"f_dc_1",
	"f_dc_2",
	"opacity",
	"scale_0",
	"scale_1",
	"scale_2",
	"rot_0",
	"rot_1",
	"rot_2",
	"rot_3"
], d = .28209479177387814, f = "end_header\n", p = 65536, m = {
	char: {
		bytes: 1,
		read: (e, t) => e.getInt8(t)
	},
	int8: {
		bytes: 1,
		read: (e, t) => e.getInt8(t)
	},
	uchar: {
		bytes: 1,
		read: (e, t) => e.getUint8(t)
	},
	uint8: {
		bytes: 1,
		read: (e, t) => e.getUint8(t)
	},
	short: {
		bytes: 2,
		read: (e, t) => e.getInt16(t, !0)
	},
	int16: {
		bytes: 2,
		read: (e, t) => e.getInt16(t, !0)
	},
	ushort: {
		bytes: 2,
		read: (e, t) => e.getUint16(t, !0)
	},
	uint16: {
		bytes: 2,
		read: (e, t) => e.getUint16(t, !0)
	},
	int: {
		bytes: 4,
		read: (e, t) => e.getInt32(t, !0)
	},
	int32: {
		bytes: 4,
		read: (e, t) => e.getInt32(t, !0)
	},
	uint: {
		bytes: 4,
		read: (e, t) => e.getUint32(t, !0)
	},
	uint32: {
		bytes: 4,
		read: (e, t) => e.getUint32(t, !0)
	},
	float: {
		bytes: 4,
		read: (e, t) => e.getFloat32(t, !0)
	},
	float32: {
		bytes: 4,
		read: (e, t) => e.getFloat32(t, !0)
	},
	double: {
		bytes: 8,
		read: (e, t) => e.getFloat64(t, !0)
	},
	float64: {
		bytes: 8,
		read: (e, t) => e.getFloat64(t, !0)
	}
};
function h(e) {
	let t = Math.min(e.length, p), n = new TextDecoder("latin1").decode(e.subarray(0, t)), r = n.indexOf(f);
	if (!n.startsWith("ply") || r < 0) throw Error("Not a PLY file: the header must start with \"ply\" and end with \"end_header\"");
	return {
		text: n.slice(0, r),
		bodyStart: r + 11
	};
}
function g(e) {
	let t = e.split(/\r?\n/).map((e) => e.trim()).filter(Boolean), n = t.find((e) => e.startsWith("format "));
	if (n?.split(/\s+/)[1] !== "binary_little_endian") throw Error(`Gaussian splat PLY must be binary_little_endian, got "${n ?? "no format line"}"`);
	let r = 0, i = !1, a = !1, o = [];
	for (let e of t) {
		let t = e.split(/\s+/);
		if (t[0] === "element") i = t[1] === "vertex" && !a, i && (a = !0, r = Number(t[2]));
		else if (t[0] === "property" && i) {
			if (t[1] === "list" || !m[t[1]]) throw Error(`Gaussian splat PLY has an unsupported property type "${t[1]}"`);
			o.push({
				name: t[2],
				type: t[1]
			});
		}
	}
	if (!Number.isInteger(r) || r <= 0) throw Error("Gaussian splat PLY has no vertex element with a positive count");
	return {
		vertexCount: r,
		properties: o
	};
}
function _(e) {
	let t = /* @__PURE__ */ new Map(), n = 0;
	for (let { name: r, type: i } of e) t.set(r, {
		offset: n,
		read: m[i].read
	}), n += m[i].bytes;
	let r = u.filter((e) => !t.has(e));
	if (r.length > 0) throw Error(`Gaussian splat PLY lacks the properties ${r.join(", ")}`);
	return {
		layout: t,
		stride: n
	};
}
function v(e) {
	let t = e.maximumBytes ?? c.maximumBytes, n = e.maximumCount ?? c.maximumCount;
	if (!(t > 0) || !(n > 0)) throw RangeError("maximumBytes and maximumCount must be positive");
	return {
		maximumBytes: t,
		maximumCount: Math.min(n, l)
	};
}
function y(e) {
	return Math.max(0, Math.min(255, Math.round(e * 255)));
}
function b(e, t = {}) {
	let { maximumBytes: n, maximumCount: r } = v(t);
	if (!(e instanceof ArrayBuffer) && !ArrayBuffer.isView(e)) throw TypeError("parseGaussianSplatPly expects an ArrayBuffer or a typed array");
	if (e.byteLength > n) throw RangeError(`Gaussian splat file is ${e.byteLength} bytes, over the limit of ${n}`);
	let i = e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength), { text: a, bodyStart: o } = h(i), { vertexCount: s, properties: c } = g(a);
	if (s > r) throw RangeError(`Gaussian splat file holds ${s} splats, over the limit of ${r}`);
	let { layout: l, stride: u } = _(c);
	if (i.length - o < s * u) throw Error(`Gaussian splat PLY is truncated: ${s} splats need ${s * u} bytes, ${i.length - o} are present`);
	return x(new DataView(i.buffer, i.byteOffset + o, s * u), s, l, u);
}
function x(e, t, n, r) {
	let i = new Float32Array(t * 3), a = new Uint8Array(t * 4), o = new Float32Array(t * 3), s = new Float32Array(t * 4), c = [
		Infinity,
		Infinity,
		Infinity
	], l = [
		-Infinity,
		-Infinity,
		-Infinity
	], u = [
		"x",
		"y",
		"z"
	].map((e) => n.get(e)), f = [
		"f_dc_0",
		"f_dc_1",
		"f_dc_2"
	].map((e) => n.get(e)), p = n.get("opacity"), m = [
		"scale_0",
		"scale_1",
		"scale_2"
	].map((e) => n.get(e)), h = [
		"rot_0",
		"rot_1",
		"rot_2",
		"rot_3"
	].map((e) => n.get(e));
	for (let n = 0; n < t; n++) {
		let t = n * r;
		for (let r = 0; r < 3; r++) {
			let s = u[r], p = s.read(e, t + s.offset);
			if (!Number.isFinite(p)) throw Error(`Gaussian splat ${n} has a non-finite position`);
			i[n * 3 + r] = p, p < c[r] && (c[r] = p), p > l[r] && (l[r] = p);
			let h = f[r];
			a[n * 4 + r] = y(.5 + d * h.read(e, t + h.offset));
			let g = m[r];
			o[n * 3 + r] = Math.exp(g.read(e, t + g.offset));
		}
		a[n * 4 + 3] = y(1 / (1 + Math.exp(-p.read(e, t + p.offset)))), S(s, n, e, t, h);
	}
	return {
		count: t,
		positions: i,
		colors: a,
		scales: o,
		rotations: s,
		bounds: {
			minimum: c,
			maximum: l
		}
	};
}
function S(e, t, n, r, i) {
	let a = t * 4;
	for (let t = 0; t < 4; t++) e[a + t] = i[t].read(n, r + i[t].offset);
	let o = Math.hypot(e[a], e[a + 1], e[a + 2], e[a + 3]);
	if (o > 1e-12) for (let t = 0; t < 4; t++) e[a + t] /= o;
	else e.set([
		1,
		0,
		0,
		0
	], a);
}
// src/gaussian-splats.js
var C = 2048, w = 3, T = 4, E = l, D = 10, O = "#version 300 es\nprecision highp float;\nprecision highp int;\nprecision highp usampler2D;\nuniform usampler2D splatData;\nuniform mat4 modelView;\nuniform mat4 projection;\nuniform vec2 focal;\nuniform vec2 viewport;\nlayout(location = 0) in uint splatIndex;\nout vec4 vertexColor;\nout vec2 vertexOffset;\nivec2 texelOf(uint splat, uint texel) {\n  uint linear = splat * 3u + texel;\n  return ivec2(int(linear & 2047u), int(linear >> 11));\n}\nvoid main() {\n  uvec4 first = texelFetch(splatData, texelOf(splatIndex, 0u), 0);\n  uvec4 second = texelFetch(splatData, texelOf(splatIndex, 1u), 0);\n  uvec4 third = texelFetch(splatData, texelOf(splatIndex, 2u), 0);\n  vec3 center = uintBitsToFloat(first.xyz);\n  vec4 cameraSpace = modelView * vec4(center, 1.0);\n  vec4 clip = projection * cameraSpace;\n  if (clip.z < -clip.w || abs(clip.x) > 1.3 * clip.w || abs(clip.y) > 1.3 * clip.w) {\n    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);\n    return;\n  }\n  vec4 firstCovariance = uintBitsToFloat(second);\n  vec2 secondCovariance = uintBitsToFloat(third.xy);\n  mat3 covariance = mat3(\n    firstCovariance.x, firstCovariance.y, firstCovariance.z,\n    firstCovariance.y, firstCovariance.w, secondCovariance.x,\n    firstCovariance.z, secondCovariance.x, secondCovariance.y);\n  float depth = -cameraSpace.z;\n  mat3 jacobian = mat3(\n    focal.x / depth, 0.0, 0.0,\n    0.0, focal.y / depth, 0.0,\n    focal.x * cameraSpace.x / (depth * depth), focal.y * cameraSpace.y / (depth * depth), 0.0);\n  mat3 transform = jacobian * mat3(modelView);\n  mat3 screen = transform * covariance * transpose(transform);\n  float a = screen[0][0] + 0.3;\n  float b = screen[0][1];\n  float c = screen[1][1] + 0.3;\n  float middle = 0.5 * (a + c);\n  float radius = length(vec2(0.5 * (a - c), b));\n  float majorVariance = middle + radius;\n  float minorVariance = max(middle - radius, 0.1);\n  vec2 direction = vec2(b, majorVariance - a);\n  direction = dot(direction, direction) < 1e-12 ? vec2(1.0, 0.0) : normalize(direction);\n  vec2 majorAxis = min(sqrt(2.0 * majorVariance), 1024.0) * direction;\n  vec2 minorAxis = min(sqrt(2.0 * minorVariance), 1024.0) * vec2(direction.y, -direction.x);\n  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 4.0 - 2.0;\n  vec2 offset = (corner.x * majorAxis + corner.y * minorAxis) * 2.0 / viewport;\n  vertexColor = vec4(float(first.w & 255u), float((first.w >> 8) & 255u), float((first.w >> 16) & 255u), float(first.w >> 24)) / 255.0;\n  vertexOffset = corner;\n  gl_Position = vec4(clip.xy / clip.w + offset, clip.z / clip.w, 1.0);\n}", k = "#version 300 es\nprecision highp float;\nuniform float hdrEnabled;\nuniform float exposure;\nin vec4 vertexColor;\nin vec2 vertexOffset;\nout vec4 outputColor;\nvoid main() {\n  float falloff = -dot(vertexOffset, vertexOffset);\n  if (falloff < -4.0) discard;\n  float alpha = exp(falloff) * vertexColor.a;\n  if (alpha < 1.0 / 255.0) discard;\n  vec3 color = hdrEnabled > 0.5 ? pow(vertexColor.rgb, vec3(2.2)) * exposure : vertexColor.rgb;\n  outputColor = vec4(color * alpha, alpha);\n}", A = [
	"splatData",
	"modelView",
	"projection",
	"focal",
	"viewport",
	"hdrEnabled",
	"exposure"
];
function j(e, t, n) {
	let [r, i, a, o] = t.subarray(n * 4, n * 4 + 4), s = [
		1 - 2 * (a * a + o * o),
		2 * (i * a + r * o),
		2 * (i * o - r * a),
		2 * (i * a - r * o),
		1 - 2 * (i * i + o * o),
		2 * (a * o + r * i),
		2 * (i * o + r * a),
		2 * (a * o - r * i),
		1 - 2 * (i * i + a * a)
	].map((t, r) => t * e[n * 3 + Math.floor(r / 3)]), c = (e, t) => s[e] * s[t] + s[3 + e] * s[3 + t] + s[6 + e] * s[6 + t];
	return [
		c(0, 0),
		c(0, 1),
		c(0, 2),
		c(1, 1),
		c(1, 2),
		c(2, 2)
	];
}
function M(e) {
	let t = e.count * w, n = Math.ceil(t / C), r = new Uint32Array(n * C * T), i = new Float32Array(r.buffer), a = new Uint32Array(e.colors.buffer, e.colors.byteOffset, e.count);
	for (let t = 0; t < e.count; t++) {
		let n = t * w * T;
		i.set(e.positions.subarray(t * 3, t * 3 + 3), n), r[n + 3] = a[t], i.set(j(e.scales, e.rotations, t), n + 4);
	}
	return {
		words: r,
		rows: n
	};
}
function N(e, { matrix: r = t(), maximumCount: i = c.maximumCount } = {}) {
	let a = Math.min(i, E);
	if (!(e?.count > 0)) throw Error("createGaussianSplats needs parsed splat data with at least one splat");
	if (e.count > a) throw RangeError(`Gaussian splat scene holds ${e.count} splats, over the limit of ${a}`);
	if (r.length !== 16 || !Array.from(r).every(Number.isFinite)) throw TypeError("matrix must be 16 finite numbers");
	let o = M(e), l = s(e.positions, e.count, e.bounds), u = {
		count: e.count,
		visibleCount: 0,
		sortMilliseconds: 0,
		gpuBytes: 0,
		cpuBytes: e.positions.byteLength + e.count * 8
	};
	return {
		count: e.count,
		matrix: n(r),
		bounds: e.bounds,
		statistics: u,
		packed: o,
		sorter: l
	};
}
function P(e, t) {
	let { words: n, rows: r } = t.packed, i = e.createTexture();
	e.activeTexture(e.TEXTURE0 + D), e.bindTexture(e.TEXTURE_2D, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA32UI, C, r, 0, e.RGBA_INTEGER, e.UNSIGNED_INT, n);
	let a = e.createBuffer();
	e.bindBuffer(e.ARRAY_BUFFER, a), e.bufferData(e.ARRAY_BUFFER, t.count * 4, e.DYNAMIC_DRAW);
	let o = e.createVertexArray();
	return e.bindVertexArray(o), e.enableVertexAttribArray(0), e.vertexAttribIPointer(0, 1, e.UNSIGNED_INT, 0, 0), e.vertexAttribDivisor(0, 1), e.bindVertexArray(null), t.statistics.gpuBytes = n.byteLength + t.count * 4, t.packed = null, {
		texture: i,
		orderBuffer: a,
		vertexArray: o
	};
}
var F = /* @__PURE__ */ new WeakMap();
function I(e) {
	let n = e.context, i = r(n, O, k), a = {
		program: i,
		uniforms: Object.fromEntries(A.map((e) => [e, n.getUniformLocation(i, e)])),
		entries: /* @__PURE__ */ new Set(),
		modelView: t(),
		original: null,
		disposeOriginal: null
	};
	return a.original = e.drawBlendBatches, a.disposeOriginal = e.dispose, e.drawBlendBatches = function(e) {
		a.original.call(this, e), H(this, a, e);
	}, e.dispose = function() {
		return R(e, a), a.disposeOriginal.call(this);
	}, a;
}
function L(e, t) {
	e.deleteTexture(t.texture), e.deleteBuffer(t.orderBuffer), e.deleteVertexArray(t.vertexArray);
}
function R(e, t) {
	for (let n of t.entries) L(e.context, n);
	t.entries.clear(), e.context.deleteProgram(t.program), e.drawBlendBatches = t.original, e.dispose = t.disposeOriginal, F.delete(e);
}
function z(e, t, n) {
	let r = e.context, i = e.canvas.width, a = e.canvas.height;
	r.bindFramebuffer(r.FRAMEBUFFER, e.multisampleFramebuffer), r.viewport(0, 0, i, a), r.enable(r.DEPTH_TEST), r.depthMask(!1), r.disable(r.CULL_FACE), r.enable(r.BLEND), r.blendFuncSeparate(r.ONE, r.ONE_MINUS_SRC_ALPHA, r.ONE, r.ONE_MINUS_SRC_ALPHA), r.useProgram(t.program);
	let { uniforms: o } = t;
	r.uniformMatrix4fv(o.projection, !1, e.rasterProjection ?? e.projection), r.uniform2f(o.focal, e.projection[0] * i * .5, e.projection[5] * a * .5), r.uniform2f(o.viewport, i, a), r.uniform1f(o.hdrEnabled, +!!e.hdr), r.uniform1f(o.exposure, n.exposure ?? 1), r.uniform1i(o.splatData, D);
}
function B(e) {
	let t = e.context;
	t.depthMask(!0), t.disable(t.BLEND), t.enable(t.CULL_FACE), t.bindVertexArray(null), t.activeTexture(t.TEXTURE0);
}
function V(t, n, r) {
	let i = t.context, { splats: a } = r;
	e(n.modelView, t.view, a.matrix);
	let o = performance.now(), { order: s, visibleCount: c, changed: l } = a.sorter.sort(n.modelView);
	l && (i.bindBuffer(i.ARRAY_BUFFER, r.orderBuffer), i.bufferSubData(i.ARRAY_BUFFER, 0, s, 0, c), a.statistics.sortMilliseconds = performance.now() - o), a.statistics.visibleCount = c, c !== 0 && (i.uniformMatrix4fv(n.uniforms.modelView, !1, n.modelView), i.activeTexture(i.TEXTURE0 + D), i.bindTexture(i.TEXTURE_2D, r.texture), i.bindVertexArray(r.vertexArray), i.bindBuffer(i.ARRAY_BUFFER, r.orderBuffer), i.drawArraysInstanced(i.TRIANGLE_STRIP, 0, 4, c));
}
function H(e, t, n) {
	if (t.entries.size === 0) return;
	z(e, t, n);
	let r = [...t.entries].map((e) => ({
		entry: e,
		distance: U(e.splats, n.eye)
	})).sort((e, t) => t.distance - e.distance);
	for (let { entry: n } of r) V(e, t, n);
	B(e);
}
function U(e, t) {
	let { minimum: n, maximum: r } = e.bounds, i = [
		0,
		1,
		2
	].map((e) => (n[e] + r[e]) / 2), a = [
		e.matrix[0] * i[0] + e.matrix[4] * i[1] + e.matrix[8] * i[2] + e.matrix[12],
		e.matrix[1] * i[0] + e.matrix[5] * i[1] + e.matrix[9] * i[2] + e.matrix[13],
		e.matrix[2] * i[0] + e.matrix[6] * i[1] + e.matrix[10] * i[2] + e.matrix[14]
	];
	return Math.hypot(a[0] - t[0], a[1] - t[1], a[2] - t[2]);
}
function W(e, t) {
	if (!t?.packed) throw Error("These splats are already attached to a renderer; create them again to attach to another");
	if (typeof e?.drawBlendBatches != "function") throw TypeError("attachGaussianSplats needs a Renderer67");
	let n = F.get(e) ?? I(e);
	F.set(e, n);
	let r = {
		splats: t,
		...P(e.context, t)
	};
	return n.entries.add(r), function() {
		n.entries.delete(r) && (L(e.context, r), n.entries.size === 0 && F.get(e) === n && R(e, n));
	};
}
export { l as GAUSSIAN_SPLAT_HARD_COUNT_LIMIT, c as GAUSSIAN_SPLAT_LIMITS, W as attachGaussianSplats, N as createGaussianSplats, b as parseGaussianSplatPly };
