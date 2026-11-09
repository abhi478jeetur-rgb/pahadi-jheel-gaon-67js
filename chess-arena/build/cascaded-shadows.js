/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { g as e, h as t, m as n, n as r } from "./mat4-BCZClxna.js";
import { _ as i, a, f as o, m as s, p as c, r as l, s as u, t as d, x as f, y as p } from "./vec3-BRYC6f_g.js";
import { l as m } from "./shader-registry-DHYkwAg5.js";
import { t as h } from "./shadow-light-Oy72milt.js";
// src/cascaded-shadows.js
var g = 4, _ = 40, v = 3, y = 2048, b = 150, x = .7, S = 200, C = {
	baseMap: 1,
	normalMap: 2,
	metallicRoughnessMap: 3,
	occlusionMap: 4,
	emissiveMap: 5,
	lightMap: 6,
	localShadowAtlas: 15
}, w = [
	[-1, -1],
	[1, -1],
	[-1, 1],
	[1, 1]
];
m("cascadedShadows", { declarations: "uniform highp sampler2DArray cascadeShadowMap;\nuniform mat4 cascadeMatrices[4];\nuniform vec4 cascadeSplits;\nuniform vec4 cascadeTexels;\nuniform vec4 cascadeRanges;\nuniform vec4 cascadeFrame;\nuniform float sunSoftness;\nvec2 cascadeVogel(int index, int count, float rotation) {\n  float angle = float(index) * 2.399963 + rotation;\n  return sqrt((float(index) + 0.5) / float(count)) * vec2(cos(angle), sin(angle));\n}\nfloat cascadeTap(int layer, vec2 coordinates, float receiverDepth, ivec2 dimensions) {\n  vec2 pixel = coordinates * vec2(dimensions) - 0.5;\n  ivec2 origin = ivec2(floor(pixel));\n  vec2 blend = fract(pixel);\n  ivec2 maximum = dimensions - 1;\n  float lowerLeft = step(receiverDepth, texelFetch(cascadeShadowMap, ivec3(clamp(origin, ivec2(0), maximum), layer), 0).r);\n  float lowerRight = step(receiverDepth, texelFetch(cascadeShadowMap, ivec3(clamp(origin + ivec2(1, 0), ivec2(0), maximum), layer), 0).r);\n  float upperLeft = step(receiverDepth, texelFetch(cascadeShadowMap, ivec3(clamp(origin + ivec2(0, 1), ivec2(0), maximum), layer), 0).r);\n  float upperRight = step(receiverDepth, texelFetch(cascadeShadowMap, ivec3(clamp(origin + ivec2(1, 1), ivec2(0), maximum), layer), 0).r);\n  return mix(mix(lowerLeft, lowerRight, blend.x), mix(upperLeft, upperRight, blend.x), blend.y);\n}\nfloat cascadeSoftVisibility(int layer, vec3 projected, float receiverDepth, ivec2 dimensions) {\n  float rotation = 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));\n  float texelWorld = cascadeTexels[layer];\n  float searchTexels = clamp(sunSoftness * 12.0 / texelWorld, 1.0, 24.0);\n  float gapSum = 0.0;\n  float blockers = 0.0;\n  for (int tap = 0; tap < 12; tap++) {\n    ivec2 texel = clamp(ivec2(floor(projected.xy * vec2(dimensions) + cascadeVogel(tap, 12, rotation) * searchTexels)), ivec2(0), dimensions - 1);\n    float stored = texelFetch(cascadeShadowMap, ivec3(texel, layer), 0).r;\n    if (stored < receiverDepth) {\n      gapSum += receiverDepth - stored;\n      blockers += 1.0;\n    }\n  }\n  if (blockers == 0.0) return 1.0;\n  float penumbraTexels = clamp(sunSoftness * (gapSum / blockers) * cascadeRanges[layer] / texelWorld, 1.0, 24.0);\n  float lit = 0.0;\n  for (int tap = 0; tap < 16; tap++) {\n    lit += cascadeTap(layer, projected.xy + cascadeVogel(tap, 16, rotation) * penumbraTexels / vec2(dimensions), receiverDepth, dimensions);\n  }\n  return lit / 16.0;\n}\nfloat cascadeLayerVisibility(int layer, vec3 normal) {\n  vec3 shifted = worldPosition + normal * (cascadeTexels[layer] * 1.5);\n  vec3 projected = (cascadeMatrices[layer] * vec4(shifted, 1.0)).xyz * 0.5 + 0.5;\n  if (projected.z > 1.0 || projected.z < 0.0 || any(lessThan(projected.xy, vec2(0.0))) || any(greaterThan(projected.xy, vec2(1.0)))) return 1.0;\n  float bias = cascadeTexels[layer] / cascadeRanges[layer] * (1.0 + 2.0 * (1.0 - dot(normal, normalize(lightDirection))));\n  ivec2 dimensions = textureSize(cascadeShadowMap, 0).xy;\n  if (sunSoftness > 0.0) return cascadeSoftVisibility(layer, projected, projected.z - bias, dimensions);\n  vec2 texel = 1.0 / vec2(dimensions);\n  float visibility = 0.0;\n  for (int row = -1; row <= 1; row++) {\n    for (int column = -1; column <= 1; column++) {\n      visibility += cascadeTap(layer, projected.xy + vec2(column, row) * texel * 2.5, projected.z - bias, dimensions);\n    }\n  }\n  return visibility / 9.0;\n}\nfloat cascadeVisibility(vec3 normal) {\n  float viewDepth = dot(worldPosition - eye, cascadeFrame.xyz);\n  int count = int(cascadeFrame.w);\n  for (int layer = 0; layer < 4; layer++) {\n    if (layer >= count) break;\n    float split = cascadeSplits[layer];\n    if (viewDepth >= split) continue;\n    float visibility = cascadeLayerVisibility(layer, normal);\n    float previousSplit = layer > 0 ? cascadeSplits[layer - 1] : 0.0;\n    float blendStart = split - (split - previousSplit) * 0.1;\n    if (layer + 1 < count && viewDepth > blendStart) {\n      visibility = mix(visibility, cascadeLayerVisibility(layer + 1, normal), smoothstep(blendStart, split, viewDepth));\n    }\n    return visibility;\n  }\n  return 1.0;\n}\n#define shadowVisibility(normal) cascadeVisibility(normal)\n" });
function T(e, t, n, r) {
	if (!Number.isInteger(e) || e < t || e > n) throw RangeError(`${r} must be a whole number between ${t} and ${n}`);
	return e;
}
function E(e, t, n, r) {
	if (typeof e != "number" || !Number.isFinite(e) || e < t || e > n) throw RangeError(`${r} must be between ${t} and ${n}`);
	return e;
}
function D(e, t, n, r = x) {
	let i = [];
	for (let a = 1; a <= e; a++) {
		let o = a / e, s = t * (n / t) ** o, c = t + (n - t) * o;
		i.push(r * s + (1 - r) * c);
	}
	return i[e - 1] = n, i;
}
function O(e) {
	let t = [];
	for (let n of [-1, 1]) for (let [r, i] of w) t.push(f(a(), [
		r,
		i,
		n
	], e));
	return t;
}
function k(e, t, n) {
	let r = [];
	for (let i of [t, n]) for (let t = 0; t < 4; t++) r.push(o(a(), e[t], e[t + 4], i));
	return r;
}
function A(e, t) {
	return -f(a(), e, t)[2];
}
function j(e) {
	let t = a();
	return e.forEach((e) => d(t, t, e)), s(t, t, 1 / e.length), {
		center: t,
		radius: Math.max(...e.map((e) => u(t, e)))
	};
}
function M(i, { center: o, radius: s }, c, l, u, d = 0) {
	let p = n(r(), [
		0,
		0,
		0
	], [
		-c[0],
		-c[1],
		-c[2]
	], Math.abs(c[1]) > .99 ? [
		0,
		0,
		1
	] : [
		0,
		1,
		0
	]), m = f(a(), o, p), h = 2 * s / l, g = Math.round(m[0] / h) * h, _ = Math.round(m[1] / h) * h, v = Math.round(m[2] / h) * h, y = -(v + u + d), b = -(v - s), x = e(r(), g - s, g + s, _ - s, _ + s, y, b);
	return t(i, x, p), {
		texel: h,
		range: b - y,
		snappedX: g,
		snappedY: _,
		near: y,
		far: b,
		radius: s
	};
}
function N(e, t, o, s) {
	if (i(e.towardLight, o) > 1e-12) return !1;
	let c = n(r(), [
		0,
		0,
		0
	], [
		-o[0],
		-o[1],
		-o[2]
	], Math.abs(o[1]) > .99 ? [
		0,
		0,
		1
	] : [
		0,
		1,
		0
	]), l = f(a(), t.center, c);
	return Math.abs(l[0] - e.snappedX) + t.radius <= e.radius && Math.abs(l[1] - e.snappedY) + t.radius <= e.radius && -(l[2] + s) >= e.near && -(l[2] - t.radius) <= e.far;
}
var P = .1, F = class {
	constructor({ count: e = 3, resolution: t = y, maximumDistance: n = b, splitLambda: r = x, casterReach: i = S } = {}) {
		this.count = T(e, 1, 4, "cascade count"), this.resolution = T(t, 256, 4096, "cascade resolution"), this.maximumDistance = E(n, 1, 1e5, "cascade maximumDistance"), this.splitLambda = E(r, 0, 1, "cascade splitLambda"), this.casterReach = E(i, 1, 1e5, "cascade casterReach"), this.shaderFeature = "cascadedShadows", this.matrices = /* @__PURE__ */ new Float32Array(64), this.drawnMatrices = /* @__PURE__ */ new Float32Array(64), this.holds = [], this.holdMargin = P, this.splits = (/* @__PURE__ */ new Float32Array(4)).fill(1e9), this.texels = (/* @__PURE__ */ new Float32Array(4)).fill(1), this.ranges = (/* @__PURE__ */ new Float32Array(4)).fill(1), this.forward = /* @__PURE__ */ new Float32Array(4), this.texture = null, this.framebuffer = null, this.drawCount = 0, this.locations = null, this.locationProgram = null;
	}
	allocate(e) {
		this.texture = e.createTexture(), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D_ARRAY, this.texture), e.texImage3D(e.TEXTURE_2D_ARRAY, 0, e.DEPTH_COMPONENT24, this.resolution, this.resolution, this.count, 0, e.DEPTH_COMPONENT, e.UNSIGNED_INT, null), e.texParameteri(e.TEXTURE_2D_ARRAY, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D_ARRAY, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D_ARRAY, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D_ARRAY, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), this.framebuffer = e.createFramebuffer(), this.drawCount = 0, this.drawnMatrices.fill(0);
	}
	fitToCamera(e) {
		let t = h(e.world, e.activeLightDirection, e.shadowBounds), n = c(a(), p(a(), t.eye, t.target)), r = O(e.inverseViewProjection), i = A(r[0], e.view), o = A(r[4], e.view), s = Math.min(o, this.maximumDistance), l = D(this.count, i, s, this.splitLambda), u = o - i, d = 0;
		return l.forEach((e, t) => {
			let a = Math.min((e - i) / u, 1), o = j(k(r, d, a)), s = this.chooseFit(t, o, n);
			this.matrices.set(s.matrix, t * 16), this.splits[t] = e, this.texels[t] = s.texel, this.ranges[t] = s.range, d = a;
		}), this.forward.set([...e.viewForward, this.count]), this.matrices.some((e, t) => e !== this.drawnMatrices[t]);
	}
	chooseFit(e, t, n) {
		let r = this.holds[e] ??= {
			fit: null,
			tight: null
		}, i = {
			matrix: /* @__PURE__ */ new Float32Array(16),
			towardLight: l(n)
		};
		Object.assign(i, M(i.matrix, t, n, this.resolution, this.casterReach));
		let a = r.tight && i.matrix.some((e, t) => e !== r.tight.matrix[t]);
		if (r.tight = i, e === 0 || !r.fit || !a) r.fit = i;
		else if (!N(r.fit, t, n, this.casterReach)) {
			let e = {
				matrix: /* @__PURE__ */ new Float32Array(16),
				towardLight: l(n)
			}, i = t.radius * this.holdMargin;
			Object.assign(e, M(e.matrix, {
				center: t.center,
				radius: t.radius + i
			}, n, this.resolution, this.casterReach, i)), r.fit = e;
		}
		return r.fit;
	}
	replacesSingleMap(e) {
		return !e.volumeShadowWanted && !e.shaderFeatures.has("subsurface");
	}
	update(e, t) {
		let n = e.context;
		if (this.texture || (this.allocate(n), e.renderTargets.record("cascadedShadowMaps", {
			width: this.resolution,
			height: this.resolution,
			layers: this.count,
			format: "DEPTH_COMPONENT24"
		})), !(!this.fitToCamera(e) && !t && this.drawCount > 0)) {
			this.drawCount++, n.bindFramebuffer(n.FRAMEBUFFER, this.framebuffer), n.drawBuffers([n.NONE]), n.readBuffer(n.NONE), n.viewport(0, 0, this.resolution, this.resolution), n.enable(n.DEPTH_TEST), n.enable(n.CULL_FACE);
			for (let r = 0; r < this.count; r++) {
				let i = this.matrices.subarray(r * 16, r * 16 + 16), a = this.drawnMatrices.subarray(r * 16, r * 16 + 16);
				!t && this.drawCount > 1 && a.every((e, t) => e === i[t]) || (a.set(i), n.framebufferTextureLayer(n.FRAMEBUFFER, n.DEPTH_ATTACHMENT, this.texture, 0, r), n.clear(n.DEPTH_BUFFER_BIT), e.drawShadowCasters(i, this.resolution));
			}
			n.bindFramebuffer(n.FRAMEBUFFER, null);
		}
	}
	bindUniforms(e) {
		let t = e.context;
		if (this.locationProgram !== e.program) {
			let n = [
				"cascadeShadowMap",
				"cascadeMatrices[0]",
				"cascadeSplits",
				"cascadeTexels",
				"cascadeRanges",
				"cascadeFrame",
				"sunSoftness"
			];
			this.locations = Object.fromEntries(n.map((n) => [n, t.getUniformLocation(e.program, n)])), this.locationProgram = e.program;
			for (let [n, r] of Object.entries(C)) t.uniform1i(t.getUniformLocation(e.program, n), r);
		}
		t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D_ARRAY, this.texture), t.uniform1i(this.locations.cascadeShadowMap, 0), t.uniformMatrix4fv(this.locations["cascadeMatrices[0]"], !1, this.matrices), t.uniform4fv(this.locations.cascadeSplits, this.splits), t.uniform4fv(this.locations.cascadeTexels, this.texels), t.uniform4fv(this.locations.cascadeRanges, this.ranges), t.uniform4fv(this.locations.cascadeFrame, this.forward);
		let n = e.environment?.sunAngularRadius;
		t.uniform1f(this.locations.sunSoftness, n > 0 ? Math.tan(n) : 0);
	}
	dispose(e, t = null) {
		t?.release("cascadedShadowMaps"), this.texture && e.deleteTexture(this.texture), this.framebuffer && e.deleteFramebuffer(this.framebuffer), this.texture = null, this.framebuffer = null;
	}
};
function I(e) {
	return new F(e);
}
function L(e, t) {
	if (e.shadowCascades !== void 0) return e.shadowCascades;
	let n = t.extent > _ ? v : 0;
	return e.sunAngularRadius > 0 ? Math.max(n, 1) : n;
}
export { F as CascadedShadows, g as MAXIMUM_CASCADES, D as cascadeSplitDistances, I as createCascadedShadows, L as effectiveShadowCascades, M as writeCascadeMatrix };
