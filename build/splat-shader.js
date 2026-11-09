/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { l as e, n as t, u as n } from "./shader-registry-DHYkwAg5.js";
import { r } from "./budget-DiDbAzh2.js";
// src/splat-renderer.js
function i(e, t, n, r, i) {
	let a = e.context, o = a.createTexture();
	a.bindTexture(a.TEXTURE_2D_ARRAY, o);
	let s = Math.floor(Math.log2(n)) + 1;
	return a.texStorage3D(a.TEXTURE_2D_ARRAY, s, t, n, n, r), a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, !1), a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL, a.NONE), a.texSubImage3D(a.TEXTURE_2D_ARRAY, 0, 0, 0, 0, n, n, r, a.RGBA, a.UNSIGNED_BYTE, i), a.generateMipmap(a.TEXTURE_2D_ARRAY), a.texParameteri(a.TEXTURE_2D_ARRAY, a.TEXTURE_WRAP_S, a.REPEAT), a.texParameteri(a.TEXTURE_2D_ARRAY, a.TEXTURE_WRAP_T, a.REPEAT), a.texParameteri(a.TEXTURE_2D_ARRAY, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_LINEAR), a.texParameteri(a.TEXTURE_2D_ARRAY, a.TEXTURE_MAG_FILTER, a.LINEAR), e.applyAnisotropy(a.TEXTURE_2D_ARRAY), o;
}
function a(e) {
	let n = e.context;
	e.splatPlaceholder = n.createTexture(), n.bindTexture(n.TEXTURE_2D_ARRAY, e.splatPlaceholder), n.texImage3D(n.TEXTURE_2D_ARRAY, 0, n.RGBA8, 1, 1, 1, 0, n.RGBA, n.UNSIGNED_BYTE, new Uint8Array([
		128,
		128,
		128,
		255
	])), n.texParameteri(n.TEXTURE_2D_ARRAY, n.TEXTURE_MIN_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_2D_ARRAY, n.TEXTURE_MAG_FILTER, n.LINEAR), n.useProgram(e.program);
	for (let r of [
		"splatColor",
		"splatNormal",
		"splatPacked"
	]) n.uniform1i(e.uniforms[r], t[r]), n.activeTexture(n.TEXTURE0 + t[r]), n.bindTexture(n.TEXTURE_2D_ARRAY, e.splatPlaceholder);
	n.uniform1i(e.uniforms.splatMask, t.splatMask), n.activeTexture(n.TEXTURE0 + t.splatMask), n.bindTexture(n.TEXTURE_2D, e.whiteTexture), n.uniform1f(e.uniforms.splatEnabled, 0);
}
function o(e, t, n) {
	if (e.splatResources.has(t.layers)) return e.splatResources.get(t.layers);
	let r = e.context, a = n.resolveSize(t, r.getParameter(r.MAX_TEXTURE_SIZE)), o = t.layers.length, s = n.buildPixels(t.layers, a), c = {
		size: a,
		layerCount: o,
		color: i(e, r.SRGB8_ALPHA8, a, o, s.color),
		normal: i(e, r.RGBA8, a, o, s.normal),
		packed: i(e, r.RGBA8, a, o, s.packed),
		mask: t.splat?.maskMap ? e.createTexture(t.splat.maskMap) : e.whiteTexture,
		parameters: n.packParameters(t)
	};
	return e.splatResources.set(t.layers, c), c;
}
function s(e, n) {
	let r = e.context, i = e.uniforms;
	if (r.uniform1f(i.splatEnabled, +!!n), !n) return;
	let a = [
		[
			t.splatColor,
			r.TEXTURE_2D_ARRAY,
			n.color
		],
		[
			t.splatNormal,
			r.TEXTURE_2D_ARRAY,
			n.normal
		],
		[
			t.splatPacked,
			r.TEXTURE_2D_ARRAY,
			n.packed
		],
		[
			t.splatMask,
			r.TEXTURE_2D,
			n.mask
		]
	];
	for (let [e, t, n] of a) r.activeTexture(r.TEXTURE0 + e), r.bindTexture(t, n);
	let o = n.parameters;
	r.uniform4fv(i["splatLayer[0]"], o.layer), r.uniform4fv(i["splatTint[0]"], o.tint), r.uniform4fv(i["splatSlope[0]"], o.slope), r.uniform4fv(i["splatHeightRange[0]"], o.height), r.uniform1fv(i["splatMaskChannel[0]"], o.mask), r.uniform1fv(i["splatMaskInvert[0]"], o.maskInvert), r.uniform4fv(i.splatBlend, o.blend), r.uniform4fv(i.splatOptions, o.options), r.uniform4fv(i.splatMaskBounds, o.maskBounds), r.uniform4fv(i.splatVariation, o.variation);
}
function c(e) {
	for (let t of e.splatResources.values()) for (let n of [
		t.color,
		t.normal,
		t.packed
	]) e.context.deleteTexture(n);
	e.splatResources.clear(), e.splatPlaceholder && e.context.deleteTexture(e.splatPlaceholder);
}
var l = Object.freeze([
	"color",
	"normal",
	"roughness",
	"height"
]), u = Object.freeze({
	r: 0,
	g: 1,
	b: 2,
	a: 3
}), d = 4, f = Object.freeze({
	heightBlend: .22,
	heightInfluence: 1,
	triplanarStart: 38,
	triplanarEnd: 52,
	antiTiling: 1,
	cavity: .55,
	variation: 1,
	edgeNoise: 1,
	parallax: .03
}), p = Object.freeze({
	slope: 4,
	height: 1.5
});
function m(e) {
	let t = e?.naturalWidth ?? e?.width, n = e?.naturalHeight ?? e?.height;
	if (!Number.isInteger(t) || !Number.isInteger(n) || t <= 0 || n <= 0) throw Error("Splat texture image dimensions are invalid.");
	return Math.max(t, n);
}
function h(e, t) {
	if (typeof e != "number" || !Number.isFinite(e)) throw TypeError(`${t} must be a finite number.`);
	return e;
}
function g(e, t, n, r) {
	if (!Array.isArray(e) || e.length !== 2) throw TypeError(`${t} must be a [minimum, maximum] pair.`);
	let [i, a] = e;
	if (h(i, `${t}[0]`), h(a, `${t}[1]`), i > a) throw RangeError(`${t} minimum must not exceed its maximum.`);
	if (i < n || a > r) throw RangeError(`${t} must stay within ${n} and ${r}.`);
}
function _(e, t) {
	if (!e || typeof e != "object") throw TypeError(`layers[${t}] must be an object.`);
	let n = l.filter((t) => e[t]);
	if (n.length === 0) throw Error(`layers[${t}] needs at least one of ${l.join(", ")}.`);
	for (let r of n) {
		m(e[r].image);
		let n = e[r].colorSpace ?? (r === "color" ? "srgb" : "linear"), i = r === "color" ? "srgb" : "linear";
		if (n !== i) throw Error(`layers[${t}].${r} requires a ${i} texture descriptor.`);
	}
	if (h(e.scale ?? d, `layers[${t}].scale`) <= 0) throw RangeError(`layers[${t}].scale must be positive.`);
	if (e.tint !== void 0 && (!Array.isArray(e.tint) || e.tint.length !== 3 || !e.tint.every(Number.isFinite))) throw TypeError(`layers[${t}].tint must be three finite numbers.`);
	if (h(e.normalStrength ?? 1, `layers[${t}].normalStrength`) < 0) throw RangeError(`layers[${t}].normalStrength must not be negative.`);
}
function v(e, t, n) {
	if (e != null) {
		if (typeof e != "object") throw TypeError(`splat.rules[${t}] must be an object.`);
		e.slope !== void 0 && g(e.slope, `splat.rules[${t}].slope`, 0, 90), e.height !== void 0 && g(e.height, `splat.rules[${t}].height`, -1e6, 1e6);
		for (let n of ["slopeSoftness", "heightSoftness"]) if (e[n] !== void 0 && h(e[n], `splat.rules[${t}].${n}`) < 0) throw RangeError(`splat.rules[${t}].${n} must not be negative.`);
		if (e.mask !== void 0) {
			if (!Object.hasOwn(u, e.mask)) throw RangeError(`splat.rules[${t}].mask must be r, g, b or a.`);
			if (e.mask === "a" && !n.maskMap) throw Error("Mask channel a needs splat.maskMap; vertex colours have only r, g and b.");
		}
	}
}
function y(e) {
	if (e.maskMap) {
		if (m(e.maskMap.image), (e.maskMap.colorSpace ?? "srgb") !== "linear") throw Error("splat.maskMap requires a linear texture descriptor.");
		if (!Array.isArray(e.maskBounds) || e.maskBounds.length !== 4 || !e.maskBounds.every(Number.isFinite)) throw TypeError("splat.maskBounds must be [minimumX, minimumZ, maximumX, maximumZ].");
		if (e.maskBounds[2] <= e.maskBounds[0] || e.maskBounds[3] <= e.maskBounds[1]) throw RangeError("splat.maskBounds must have a positive extent.");
	}
}
function b(e) {
	if (!e.layers && !e.splat) return;
	let t = e.layers;
	if (!Array.isArray(t) || t.length < 1 || t.length > 4) throw RangeError("material.layers must hold 1 to 4 layers.");
	t.forEach(_);
	let n = e.splat ?? {};
	if (n.rules !== void 0 && (!Array.isArray(n.rules) || n.rules.length > t.length)) throw RangeError("splat.rules needs one entry per layer at most.");
	n.rules?.forEach((e, t) => v(e, t, n)), y(n);
	for (let e of [
		"heightBlend",
		"heightInfluence",
		"antiTiling",
		"cavity",
		"variation",
		"edgeNoise"
	]) if (n[e] !== void 0 && h(n[e], `splat.${e}`) < 0) throw RangeError(`splat.${e} must not be negative.`);
	if (n.antiTiling > 1 || n.cavity > 1) throw RangeError("splat.antiTiling and splat.cavity must be at most 1.");
	if (n.variation > 2 || n.edgeNoise > 2) throw RangeError("splat.variation and splat.edgeNoise must be at most 2.");
	if (n.parallax !== void 0 && !(h(n.parallax, "splat.parallax") >= 0 && n.parallax <= .15)) throw RangeError("splat.parallax must be between 0 and 0.15 metres.");
	for (let e of ["triplanarStart", "triplanarEnd"]) n[e] !== void 0 && g([n[e], n[e]], `splat.${e}`, 0, 90);
	if ((n.triplanarStart ?? f.triplanarStart) > (n.triplanarEnd ?? f.triplanarEnd)) throw RangeError("splat.triplanarStart must not exceed splat.triplanarEnd.");
	if (n.textureSize !== void 0 && (!Number.isInteger(n.textureSize) || n.textureSize < 4)) throw RangeError("splat.textureSize must be an integer of at least 4.");
	if (e.map || e.normalMap || e.metallicRoughnessMap || e.occlusionMap) throw Error("Splat materials replace base, normal, roughness and occlusion maps; remove them.");
}
function x(e, t, n = 0) {
	return 3 * t * r(e, e) + (n ? r(n, n) : 0);
}
function S(e, t) {
	let n = 1;
	for (let t of e.layers) for (let e of l) t[e] && (n = Math.max(n, m(t[e].image)));
	return Math.min(n, t, e.splat?.textureSize ?? Infinity);
}
function C(e, t, n, r) {
	let i = e?.slope, a = e?.height, o = e?.mask === void 0 ? -1 : u[e.mask];
	n.slope.set([
		i?.[0] ?? 0,
		i?.[1] ?? 90,
		e?.slopeSoftness ?? p.slope,
		+!!i
	], t * 4), n.height.set([
		a?.[0] ?? -1e6,
		a?.[1] ?? 1e6,
		e?.heightSoftness ?? p.height,
		+!!a
	], t * 4), n.mask[t] = o, n.maskInvert[t] = +!!e?.invertMask;
	let s = !!(i || a || o >= 0);
	n.layer.set([
		r.scale ?? d,
		r.normalStrength ?? 1,
		+!!r.triplanar,
		+!!s
	], t * 4), n.tint.set([...r.tint ?? [
		1,
		1,
		1
	], 0], t * 4);
}
function w(e) {
	let t = {
		...f,
		...e.splat
	}, n = e.layers.length, r = {
		layer: /* @__PURE__ */ new Float32Array(16),
		tint: /* @__PURE__ */ new Float32Array(16),
		slope: /* @__PURE__ */ new Float32Array(16),
		height: /* @__PURE__ */ new Float32Array(16),
		mask: (/* @__PURE__ */ new Float32Array(4)).fill(-1),
		maskInvert: /* @__PURE__ */ new Float32Array(4),
		blend: new Float32Array([
			t.heightBlend,
			t.heightInfluence,
			t.triplanarStart,
			t.triplanarEnd
		]),
		options: new Float32Array([
			t.antiTiling,
			+!!t.maskMap,
			n,
			t.cavity
		]),
		maskBounds: new Float32Array(t.maskBounds ?? [
			0,
			0,
			1,
			1
		]),
		variation: new Float32Array([
			t.variation,
			t.edgeNoise,
			t.parallax,
			0
		])
	};
	return e.layers.forEach((t, n) => C(e.splat?.rules?.[n], n, r, t)), r;
}
function T(e, t) {
	let n = new Uint8Array(t * t * 4);
	for (let r = 0; r < t; r++) {
		let i = Math.min(e.height - 1, Math.floor(r * e.height / t));
		for (let a = 0; a < t; a++) {
			let o = Math.min(e.width - 1, Math.floor(a * e.width / t)), s = (i * e.width + o) * 4;
			n.set(e.data.subarray(s, s + 4), (r * t + a) * 4);
		}
	}
	return n;
}
function E(e) {
	if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(e, e);
	let t = document.createElement("canvas");
	return t.width = e, t.height = e, t;
}
function D(e, t) {
	if (e.data && e.width && e.height) return T(e, t);
	let n = E(t).getContext("2d", { willReadFrequently: !0 });
	return n.imageSmoothingQuality = "high", n.drawImage(e, 0, 0, t, t), new Uint8Array(n.getImageData(0, 0, t, t).data.buffer);
}
var O = Object.freeze({
	color: [
		128,
		128,
		128,
		255
	],
	normal: [
		128,
		128,
		255,
		255
	],
	roughnessHeight: [
		255,
		128,
		0,
		255
	]
});
function k(e, t, n, r) {
	let i = n * n * 4, a = t * i;
	for (let t = 0; t < i; t += 4) e.set(r, a + t);
}
function A(e, t, n = D) {
	let r = t * t * 4, i = new Uint8Array(r * e.length), a = new Uint8Array(r * e.length), o = new Uint8Array(r * e.length);
	return e.forEach((e, s) => {
		let c = s * r;
		e.color ? i.set(n(e.color.image, t), c) : k(i, s, t, O.color), e.normal ? a.set(n(e.normal.image, t), c) : k(a, s, t, O.normal), k(o, s, t, O.roughnessHeight);
		let l = e.roughness ? n(e.roughness.image, t) : null, u = e.height ? n(e.height.image, t) : null;
		for (let e = 0; e < r; e += 4) l && (o[c + e] = l[e]), u && (o[c + e + 1] = u[e]);
	}), {
		color: i,
		normal: a,
		packed: o
	};
}
// src/splat-shader.js
var j = "\nuniform float splatEnabled;\nuniform highp sampler2DArray splatColor;\nuniform highp sampler2DArray splatNormal;\nuniform highp sampler2DArray splatPacked;\nuniform sampler2D splatMask;\nuniform vec4 splatLayer[4];\nuniform vec4 splatTint[4];\nuniform vec4 splatSlope[4];\nuniform vec4 splatHeightRange[4];\nuniform float splatMaskChannel[4];\nuniform float splatMaskInvert[4];\nuniform vec4 splatBlend;\nuniform vec4 splatOptions;\nuniform vec4 splatMaskBounds;\nuniform vec4 splatVariation;\n\nconst mat2 SPLAT_ROTATION = mat2(0.8253, 0.5646, -0.5646, 0.8253);\nconst float SPLAT_SECOND_SCALE = 0.58;\nconst vec2 SPLAT_SECOND_OFFSET = vec2(0.37, 0.71);\n\nstruct SplatPlane {\n  vec2 uv;\n  vec2 dx;\n  vec2 dy;\n  vec3 tangent;\n  vec3 bitangent;\n  vec3 face;\n};\n\nfloat splatRange(float value, float minimum, float maximum, float softness) {\n  float width = max(softness, 0.0001);\n  return smoothstep(minimum - width, minimum + width, value) * (1.0 - smoothstep(maximum - width, maximum + width, value));\n}\n\nfloat splatOctaves(vec2 position) {\n  return terrainNoise(position).x * 0.5 + terrainNoise(position * 2.03 + 7.1).x * 0.3 + terrainNoise(position * 4.11 + 13.7).x * 0.2;\n}\n\nvec3 splatVariationTint(float footprint) {\n  float amount = splatVariation.x;\n  if (amount < 0.001) return vec3(1.0);\n  float fieldScale = splatOctaves(worldPosition.xz * 0.008 + 3.7) - 0.5;\n  float patchScale = splatOctaves(worldPosition.xz * 0.05 + 21.0) - 0.5;\n  float clumpScale = splatOctaves(worldPosition.xz * 0.35 + 41.0) - 0.5;\n  float distant = smoothstep(0.02, 0.2, footprint);\n  float brightness = 1.0 + (fieldScale * 0.8 + patchScale * 0.9 + clumpScale * mix(0.35, 0.7, distant)) * amount;\n  float dryness = smoothstep(0.4, 0.68, splatOctaves(worldPosition.xz * 0.02 + 11.0));\n  float lush = smoothstep(0.48, 0.75, splatOctaves(worldPosition.xz * 0.04 + 57.0));\n  vec3 hue = mix(vec3(1.0), vec3(1.3, 1.05, 0.55), dryness * 0.8);\n  hue = mix(hue, vec3(0.72, 0.92, 0.8), lush * 0.7);\n  return mix(vec3(1.0), hue, min(amount, 1.0)) * max(brightness, 0.35);\n}\n\nfloat splatMaskValue(int layerIndex) {\n  float channel = splatMaskChannel[layerIndex];\n  if (channel < -0.5) return 1.0;\n  vec4 weights = vec4(vertexTint, 1.0);\n  if (splatOptions.y > 0.5) {\n    vec2 maskUv = (worldPosition.xz - splatMaskBounds.xy) / (splatMaskBounds.zw - splatMaskBounds.xy);\n    weights = texture(splatMask, clamp(maskUv, 0.0, 1.0));\n  }\n  float value = channel < 0.5 ? weights.r : (channel < 1.5 ? weights.g : (channel < 2.5 ? weights.b : weights.a));\n  return splatMaskInvert[layerIndex] > 0.5 ? 1.0 - value : value;\n}\n\nfloat splatContrastDivisor(float blend) {\n  return sqrt(blend * blend + (1.0 - blend) * (1.0 - blend));\n}\n\nvec4 splatTapTwoScale(highp sampler2DArray source, SplatPlane plane, float layer, float blend) {\n  vec4 first = textureGrad(source, vec3(plane.uv, layer), plane.dx, plane.dy);\n  if (blend < 0.003) return first;\n  vec2 secondUv = SPLAT_ROTATION * plane.uv * SPLAT_SECOND_SCALE + SPLAT_SECOND_OFFSET;\n  vec2 secondDx = SPLAT_ROTATION * plane.dx * SPLAT_SECOND_SCALE;\n  vec2 secondDy = SPLAT_ROTATION * plane.dy * SPLAT_SECOND_SCALE;\n  vec4 mixed = mix(first, textureGrad(source, vec3(secondUv, layer), secondDx, secondDy), blend);\n  vec4 mean = textureLod(source, vec3(0.5, 0.5, layer), 12.0);\n  return mean + (mixed - mean) / splatContrastDivisor(blend);\n}\n\nvec3 splatNormalTwoScale(SplatPlane plane, float layer, float blend) {\n  vec3 first = textureGrad(splatNormal, vec3(plane.uv, layer), plane.dx, plane.dy).xyz * 2.0 - 1.0;\n  if (blend < 0.003) return first;\n  vec2 secondUv = SPLAT_ROTATION * plane.uv * SPLAT_SECOND_SCALE + SPLAT_SECOND_OFFSET;\n  vec2 secondDx = SPLAT_ROTATION * plane.dx * SPLAT_SECOND_SCALE;\n  vec2 secondDy = SPLAT_ROTATION * plane.dy * SPLAT_SECOND_SCALE;\n  vec3 second = textureGrad(splatNormal, vec3(secondUv, layer), secondDx, secondDy).xyz * 2.0 - 1.0;\n  second.xy = second.xy * SPLAT_ROTATION;\n  vec3 mixed = mix(first, second, blend);\n  mixed.xy /= splatContrastDivisor(blend);\n  return mixed;\n}\n\nvec2 splatParallaxOffset(SplatPlane top, float layer, vec2 viewSlope, float depthInUv) {\n  vec2 offset = vec2(0.0);\n  for (int refinement = 0; refinement < 3; refinement++) {\n    float height = textureGrad(splatPacked, vec3(top.uv + offset, layer), top.dx, top.dy).y;\n    offset = -viewSlope * depthInUv * (1.0 - height);\n  }\n  return offset;\n}\n\nSplatPlane splatPlane(vec2 worldCoordinates, vec2 worldDx, vec2 worldDy, float scale, vec3 tangent, vec3 bitangent, vec3 face) {\n  return SplatPlane(worldCoordinates / scale, worldDx / scale, worldDy / scale, tangent, bitangent, face);\n}\n\nvec2 splatPackedSample(int layerIndex, SplatPlane top, SplatPlane sideX, SplatPlane sideZ, vec3 projection, float blend) {\n  float layer = float(layerIndex);\n  vec2 result = vec2(0.0);\n  if (projection.y > 0.002) result += splatTapTwoScale(splatPacked, top, layer, blend).xy * projection.y;\n  if (projection.x > 0.002) result += splatTapTwoScale(splatPacked, sideX, layer, blend).xy * projection.x;\n  if (projection.z > 0.002) result += splatTapTwoScale(splatPacked, sideZ, layer, blend).xy * projection.z;\n  return result;\n}\n\nvec3 splatTilt(vec3 tangentNormal, SplatPlane plane, float strength) {\n  return (plane.tangent * tangentNormal.x + plane.bitangent * tangentNormal.y) * strength;\n}\n\nvoid splatColorSample(int layerIndex, SplatPlane top, SplatPlane sideX, SplatPlane sideZ, vec3 projection, float blend, out vec3 color, out vec3 tilt) {\n  float layer = float(layerIndex);\n  float strength = splatLayer[layerIndex].y;\n  color = vec3(0.0);\n  tilt = vec3(0.0);\n  if (projection.y > 0.002) {\n    color += splatTapTwoScale(splatColor, top, layer, blend).rgb * projection.y;\n    tilt += splatTilt(splatNormalTwoScale(top, layer, blend), top, strength) * projection.y;\n  }\n  if (projection.x > 0.002) {\n    color += splatTapTwoScale(splatColor, sideX, layer, blend).rgb * projection.x;\n    tilt += splatTilt(splatNormalTwoScale(sideX, layer, blend), sideX, strength) * projection.x;\n  }\n  if (projection.z > 0.002) {\n    color += splatTapTwoScale(splatColor, sideZ, layer, blend).rgb * projection.z;\n    tilt += splatTilt(splatNormalTwoScale(sideZ, layer, blend), sideZ, strength) * projection.z;\n  }\n  color *= splatTint[layerIndex].rgb;\n}\n\nvoid applySplat(inout vec3 color, inout vec3 normal, inout float roughness, inout float cavity) {\n  int layerCount = int(splatOptions.z);\n  vec3 geometric = normal;\n  float slope = degrees(acos(clamp(geometric.y, -1.0, 1.0)));\n  float zSign = geometric.z < 0.0 ? -1.0 : 1.0;\n  float xSign = geometric.x < 0.0 ? -1.0 : 1.0;\n  vec2 topCoordinates = worldPosition.xz;\n  vec2 topDx = dFdx(worldPosition.xz);\n  vec2 topDy = dFdy(worldPosition.xz);\n  vec2 sideXCoordinates = vec2(-xSign * worldPosition.z, -worldPosition.y);\n  vec2 sideXDx = vec2(-xSign * dFdx(worldPosition.z), -dFdx(worldPosition.y));\n  vec2 sideXDy = vec2(-xSign * dFdy(worldPosition.z), -dFdy(worldPosition.y));\n  vec2 sideZCoordinates = vec2(zSign * worldPosition.x, -worldPosition.y);\n  vec2 sideZDx = vec2(zSign * dFdx(worldPosition.x), -dFdx(worldPosition.y));\n  vec2 sideZDy = vec2(zSign * dFdy(worldPosition.x), -dFdy(worldPosition.y));\n  vec3 up = vec3(0.0, 1.0, 0.0);\n  vec3 topTangent = vec3(1.0, 0.0, 0.0);\n  vec3 topBitangent = vec3(0.0, 0.0, -1.0);\n  vec3 sideXTangent = vec3(0.0, 0.0, -xSign);\n  vec3 sideZTangent = vec3(zSign, 0.0, 0.0);\n  vec3 sideUp = vec3(0.0, 1.0, 0.0);\n\n  float lowFrequency = terrainNoise(worldPosition.xz * 0.045).x;\n  float blend = splatOptions.x > 0.0 ? mix(0.5, lowFrequency, 0.7) : 0.0;\n  vec3 variationTint = splatVariationTint(length(fwidth(worldPosition.xz)));\n  float edgeJitter = (splatOctaves(worldPosition.xz * 0.3 + 71.0) - 0.5) * 2.0 * splatVariation.y;\n  float ruleSlope = slope + edgeJitter * 9.0;\n  float ruleHeight = worldPosition.y + edgeJitter * 1.6;\n\n  float weights[4] = float[4](0.0, 0.0, 0.0, 0.0);\n  float covered = 0.0;\n  for (int index = 0; index < 4; index++) {\n    if (index >= layerCount) break;\n    if (splatLayer[index].w < 0.5) continue;\n    float weight = 1.0;\n    if (splatSlope[index].w > 0.5) weight *= splatRange(ruleSlope, splatSlope[index].x, splatSlope[index].y, splatSlope[index].z);\n    if (splatHeightRange[index].w > 0.5) weight *= splatRange(ruleHeight, splatHeightRange[index].x, splatHeightRange[index].y, splatHeightRange[index].z);\n    weight *= splatMaskValue(index);\n    weights[index] = weight;\n    covered = max(covered, weight);\n  }\n  for (int index = 0; index < 4; index++) {\n    if (index >= layerCount) break;\n    if (splatLayer[index].w < 0.5) weights[index] = 1.0 - covered;\n  }\n\n  float triplanarAmount = smoothstep(splatBlend.z, splatBlend.w, slope);\n  vec2 sideShare = pow(abs(geometric.xz), vec2(4.0));\n  sideShare /= max(sideShare.x + sideShare.y, 0.0001);\n\n  vec3 toEye = normalize(eye - worldPosition);\n  vec2 viewSlope = toEye.xz / max(toEye.y, 0.35);\n  float parallaxFade = 1.0 - smoothstep(0.004, 0.03, length(fwidth(worldPosition.xz)));\n  vec2 topOffsets[4] = vec2[4](vec2(0.0), vec2(0.0), vec2(0.0), vec2(0.0));\n  vec2 packedSamples[4] = vec2[4](vec2(0.5), vec2(0.5), vec2(0.5), vec2(0.5));\n  vec3 projections[4] = vec3[4](vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0));\n  float scores[4] = float[4](-1.0, -1.0, -1.0, -1.0);\n  float highestScore = -1.0;\n  for (int index = 0; index < 4; index++) {\n    if (index >= layerCount) break;\n    if (weights[index] < 0.002) continue;\n    float scale = splatLayer[index].x;\n    float tri = splatLayer[index].z > 0.5 ? triplanarAmount : 0.0;\n    vec3 projection = vec3(tri * sideShare.x, 1.0 - tri, tri * sideShare.y);\n    SplatPlane top = splatPlane(topCoordinates, topDx, topDy, scale, topTangent, topBitangent, up);\n    SplatPlane sideX = splatPlane(sideXCoordinates, sideXDx, sideXDy, scale, sideXTangent, sideUp, vec3(xSign, 0.0, 0.0));\n    SplatPlane sideZ = splatPlane(sideZCoordinates, sideZDx, sideZDy, scale, sideZTangent, sideUp, vec3(0.0, 0.0, zSign));\n    float parallaxDepth = splatVariation.z * parallaxFade * projection.y / scale;\n    if (parallaxDepth > 0.0001) topOffsets[index] = splatParallaxOffset(top, float(index), viewSlope, parallaxDepth);\n    top.uv += topOffsets[index];\n    projections[index] = projection;\n    packedSamples[index] = splatPackedSample(index, top, sideX, sideZ, projection, blend);\n    scores[index] = weights[index] + packedSamples[index].y * splatBlend.y;\n    highestScore = max(highestScore, scores[index]);\n  }\n\n  float total = 0.0;\n  for (int index = 0; index < 4; index++) {\n    if (index >= layerCount) break;\n    float weight = scores[index] < 0.0 ? 0.0 : max(scores[index] - (highestScore - splatBlend.x), 0.0) * step(0.002, weights[index]);\n    weights[index] = weight;\n    total += weight;\n  }\n  total = max(total, 0.0001);\n\n  vec3 blendedColor = vec3(0.0);\n  vec3 blendedTilt = vec3(0.0);\n  float blendedRoughness = 0.0;\n  float blendedHeight = 0.0;\n  for (int index = 0; index < 4; index++) {\n    if (index >= layerCount) break;\n    float weight = weights[index] / total;\n    if (weight < 0.004) continue;\n    float scale = splatLayer[index].x;\n    SplatPlane top = splatPlane(topCoordinates, topDx, topDy, scale, topTangent, topBitangent, up);\n    SplatPlane sideX = splatPlane(sideXCoordinates, sideXDx, sideXDy, scale, sideXTangent, sideUp, vec3(xSign, 0.0, 0.0));\n    SplatPlane sideZ = splatPlane(sideZCoordinates, sideZDx, sideZDy, scale, sideZTangent, sideUp, vec3(0.0, 0.0, zSign));\n    top.uv += topOffsets[index];\n    vec3 layerColor;\n    vec3 layerTilt;\n    splatColorSample(index, top, sideX, sideZ, projections[index], blend, layerColor, layerTilt);\n    blendedColor += layerColor * weight;\n    blendedTilt += layerTilt * weight;\n    blendedRoughness += packedSamples[index].x * weight;\n    blendedHeight += packedSamples[index].y * weight;\n  }\n\n  color *= blendedColor * variationTint;\n  normal = normalize(geometric + blendedTilt);\n  roughness = blendedRoughness;\n  cavity = mix(1.0, mix(0.55, 1.0, smoothstep(0.1, 0.85, blendedHeight)), splatOptions.w);\n}\n";
e("splat", { libraries: j }), n({
	validate: b,
	textureBytes: x,
	resolveSize: S,
	packParameters: w,
	buildPixels: A,
	initializePlaceholders: a,
	createResources: o,
	bind: s,
	dispose: c
});
export { j as splatGlsl };
