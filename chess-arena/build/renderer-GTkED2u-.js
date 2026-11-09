/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { _ as e, d as t, f as n, g as r, i, m as a, n as o, o as s, p as c, r as l, v as u } from "./shader-registry-DHYkwAg5.js";
import { _ as d, g as f, h as p, m, n as h, p as g } from "./mat4-BCZClxna.js";
import { r as _, t as v } from "./mat3-BUCH0Dej.js";
import { a as y, c as b, d as x, f as S, i as C, n as w, o as T, p as E, r as ee, s as D, t as O, u as k } from "./shaders-BfxaqrIb.js";
import { i as A, n as j, r as M, t as N } from "./gl-program-KwXE3oHO.js";
import { a as te, i as ne, n as P, r as F } from "./budget-DiDbAzh2.js";
import { n as re } from "./camera-DqWdI22s.js";
import { i as I, n as ie, t as ae } from "./lighting-Dfe9GFwf.js";
import { n as oe, t as L } from "./shadow-light-Oy72milt.js";
import { t as R } from "./depth-layer-DecVVixZ.js";
import { n as se, r as ce } from "./volumetric-D8WftbY1.js";
import { a as z } from "./environment-shading-BFHO3WeH.js";
import { a as B, o as le } from "./material-layers-C6j9cFSS.js";
// src/post.js
function ue(e, t, n, r) {
	return `#version 300 es
${e}
precision highp float;
in vec2 textureCoordinate;
uniform sampler2D frameTexture;
uniform float transparent;
uniform sampler2D bloomTexture;
uniform float bloomStrength;
uniform float hdrEnabled;
uniform vec3 grade;
uniform float vignette;
uniform float grainAmount;
uniform vec2 resolution;
uniform float monochrome;
uniform float fade;
uniform float cinematic;
uniform float time;
uniform float volumeExplosion;
uniform float explosionProgress;
uniform mat4 inverseViewProjection;
uniform vec3 eye;
uniform sampler2D sceneDepth;
${n}
uniform sampler2D occlusionTexture;
uniform float occlusionStrength;
uniform vec2 occlusionTexel;
out vec4 outputColor;
float luminance(vec3 color) { return dot(color, vec3(0.299, 0.587, 0.114)); }
float hash(vec3 position) { return fract(sin(dot(position, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float cloudNoise(vec3 position) {
  vec3 cell = floor(position);
  vec3 fraction = fract(position);
  fraction = fraction * fraction * (3.0 - 2.0 * fraction);
  float lower = mix(mix(hash(cell), hash(cell + vec3(1,0,0)), fraction.x), mix(hash(cell + vec3(0,1,0)), hash(cell + vec3(1,1,0)), fraction.x), fraction.y);
  float upper = mix(mix(hash(cell + vec3(0,0,1)), hash(cell + vec3(1,0,1)), fraction.x), mix(hash(cell + vec3(0,1,1)), hash(cell + vec3(1,1,1)), fraction.x), fraction.y);
  return mix(lower, upper, fraction.z);
}
${t}
${r}
void main() {
  vec2 texel = 1.0 / resolution;
  vec3 center = texture(frameTexture, textureCoordinate).rgb;
  vec3 northwest = texture(frameTexture, textureCoordinate + vec2(-1.0, -1.0) * texel).rgb;
  vec3 northeast = texture(frameTexture, textureCoordinate + vec2(1.0, -1.0) * texel).rgb;
  vec3 southwest = texture(frameTexture, textureCoordinate + vec2(-1.0, 1.0) * texel).rgb;
  vec3 southeast = texture(frameTexture, textureCoordinate + vec2(1.0, 1.0) * texel).rgb;
  float centerLuma = luminance(center);
  float northwestLuma = luminance(northwest);
  float northeastLuma = luminance(northeast);
  float southwestLuma = luminance(southwest);
  float southeastLuma = luminance(southeast);
  float minimumLuma = min(centerLuma, min(min(northwestLuma, northeastLuma), min(southwestLuma, southeastLuma)));
  float maximumLuma = max(centerLuma, max(max(northwestLuma, northeastLuma), max(southwestLuma, southeastLuma)));
  vec2 direction = vec2(-((northwestLuma + northeastLuma) - (southwestLuma + southeastLuma)), (northwestLuma + southwestLuma) - (northeastLuma + southeastLuma));
  float reduction = max((northwestLuma + northeastLuma + southwestLuma + southeastLuma) * 0.03125, 0.0078125);
  direction = clamp(direction / (min(abs(direction.x), abs(direction.y)) + reduction), vec2(-6.0), vec2(6.0)) * texel;
  vec3 first = 0.5 * (texture(frameTexture, textureCoordinate + direction * (-1.0 / 6.0)).rgb + texture(frameTexture, textureCoordinate + direction * (1.0 / 6.0)).rgb);
  vec3 second = first * 0.5 + 0.25 * (texture(frameTexture, textureCoordinate - direction * 0.5).rgb + texture(frameTexture, textureCoordinate + direction * 0.5).rgb);
  float secondLuma = luminance(second);
  vec3 color = secondLuma < minimumLuma || secondLuma > maximumLuma ? first : second;
  if (maximumLuma - minimumLuma < max(0.03, maximumLuma * 0.125)) color = center;
  float coverage = POST_TRANSPARENT ? texture(frameTexture, textureCoordinate).a : 1.0;
  if (POST_TRANSPARENT) color = center / max(coverage, 0.00001);
  if (POST_OCCLUSION) {
    float visibility = 0.0;
    for (int row = -1; row <= 1; row++) {
      for (int column = -1; column <= 1; column++) {
        visibility += texture(occlusionTexture, textureCoordinate + vec2(float(column), float(row)) * occlusionTexel).r;
      }
    }
    float directShare = 1.0 / (1.0 + 0.4 * luminance(color));
    color *= mix(1.0, visibility / 9.0, occlusionStrength * directShare);
  }
  if (POST_BLOOM) color += texture(bloomTexture, textureCoordinate).rgb * bloomStrength;
  if (POST_VOLUME) color = volumeFog(color);
  if (hdrEnabled > 0.5) {
    color = clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
    color = pow(color, vec3(1.0 / 2.2));
  }
  if (POST_EXPLOSION) color = explosion(color);
  if (POST_FINISH) {
  color = mix(color, vec3(luminance(color)), monochrome);
  if (grade.x != 1.0) color = mix(vec3(luminance(color)), color, grade.x);
  if (grade.y != 1.0) color = (color - 0.5) * grade.y + 0.5;
  if (grade.z != 0.0) color *= vec3(1.0 + grade.z * 0.1, 1.0, 1.0 - grade.z * 0.1);
  vec2 centered = textureCoordinate * 2.0 - 1.0;
  color *= max(0.0, 1.0 - (cinematic * 0.20 + vignette) * dot(centered, centered));
  float grain = fract(sin(dot(gl_FragCoord.xy + floor(time * 24.0), vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  color += grain * (0.018 * cinematic + grainAmount);
  }
  float alpha = POST_TRANSPARENT ? coverage : 1.0;
  outputColor = vec4(color * (1.0 - fade) * alpha, alpha);
}`;
}
var de = "#version 300 es\nprecision highp float;\nin vec2 textureCoordinate;\nuniform vec3 skyTop;\nuniform vec3 skyBottom;\nuniform vec3 sunDirection;\nuniform mat4 inverseViewProjection;\nuniform vec3 eye;\nuniform float time;\nuniform float daylight;\nuniform float hdrEnabled;\nout vec4 outputColor;\nfloat noise(vec2 position) {\n  return sin(position.x * 2.1 + sin(position.y * 1.3)) * 0.5 + sin(position.y * 2.8 - position.x * 0.8) * 0.3;\n}\nvoid main() {\n  vec4 world = inverseViewProjection * vec4(textureCoordinate * 2.0 - 1.0, 1.0, 1.0);\n  vec3 direction = normalize(world.xyz / world.w - eye);\n  float height = clamp(direction.y * 1.3 + 0.12, 0.0, 1.0);\n  vec3 color = mix(skyBottom, skyTop, pow(height, 0.6));\n  float sun = max(dot(direction, normalize(sunDirection)), 0.0);\n  color += vec3(1.0, 0.72, 0.35) * pow(sun, 300.0) * 0.7 * daylight;\n  color += vec3(0.30, 0.22, 0.12) * pow(sun, 8.0) * daylight;\n  vec2 cloudPosition = direction.xz / max(0.08, direction.y) * 0.5 + vec2(time * 0.006, 0.0);\n  float cloud = smoothstep(0.1, 0.55, noise(cloudPosition) + noise(cloudPosition * 2.4) * 0.25);\n  cloud *= smoothstep(0.02, 0.22, direction.y) * (1.0 - smoothstep(0.5, 0.95, direction.y));\n  color = mix(color, mix(skyBottom, vec3(0.94, 0.93, 0.85), 0.7), cloud * 0.28 * daylight);\n  outputColor = vec4(hdrEnabled > 0.5 ? pow(max(color, vec3(0)), vec3(2.2)) : color, 1.0);\n}", fe = "#version 300 es\nprecision highp float;\nin vec2 textureCoordinate;\nuniform sampler2D sourceTexture;\nuniform vec2 texelDirection;\nuniform float threshold;\nuniform float extract;\nout vec4 outputColor;\nvec3 sampleBloom(vec2 coordinate) {\n  vec3 color = texture(sourceTexture, coordinate).rgb;\n  if (extract > 0.5) {\n    float peak = max(color.r, max(color.g, color.b));\n    color *= max(peak - threshold, 0.0) / max(peak, 0.00001);\n  }\n  return color;\n}\nvoid main() {\n  vec3 color = sampleBloom(textureCoordinate) * 0.227027;\n  color += sampleBloom(textureCoordinate + texelDirection * 1.384615) * 0.316216;\n  color += sampleBloom(textureCoordinate - texelDirection * 1.384615) * 0.316216;\n  color += sampleBloom(textureCoordinate + texelDirection * 3.230769) * 0.070270;\n  color += sampleBloom(textureCoordinate - texelDirection * 3.230769) * 0.070270;\n  outputColor = vec4(color, 1.0);\n}", pe = {
	transparent: ["POST_TRANSPARENT", "transparent > 0.5"],
	occlusion: ["POST_OCCLUSION", "occlusionStrength > 0.0"],
	bloom: ["POST_BLOOM", "bloomStrength > 0.0"],
	volume: ["POST_VOLUME", "volumeDensity > 0.0"],
	sky: ["POST_SKY", "true"],
	field: ["POST_FIELD", "true"],
	detail: ["POST_DETAIL", "true"],
	lights: ["POST_LIGHTS", "volumeLightCount > 0"],
	explosion: ["POST_EXPLOSION", "volumeExplosion > 0.5"],
	finish: ["POST_FINISH", "true"]
}, me = Object.freeze([
	"volume",
	"sky",
	"field",
	"detail",
	"lights",
	"explosion"
]), he = Object.freeze(Object.keys(pe).filter((e) => !me.includes(e))), ge = "vec3 explosion(vec3 background) { return background; }", _e = "vec3 volumeFog(vec3 background) { return background; }";
function ve(e) {
	if (!e.has("explosion")) return ge;
	let n = t.get("explosion");
	if (!n) throw Error("The explosion step needs its shader code: add import './explosion-shader.js' (the film player does).");
	return n.post;
}
function ye(e) {
	if (!e.has("volume")) return {
		declarations: "",
		functions: _e
	};
	let t = c("volumeFog");
	return {
		declarations: t.postDeclarations,
		functions: t.postFunctions
	};
}
function be(e = he) {
	let t = new Set(e), n = Object.entries(pe).map(([e, [n, r]]) => `#define ${n} ${t.has(e) ? `(${r})` : "false"}`).join("\n"), r = ye(t);
	return ue(n, ve(t), r.declarations, r.functions);
}
var xe = be(), Se = "#version 300 es\nprecision highp float;\nin vec2 textureCoordinate;\nuniform sampler2D sceneDepth;\nuniform mat4 inverseViewProjection;\nuniform vec3 eye;\nuniform float radius;\nuniform float projectionScale;\nuniform float aspect;\nuniform float orthographic;\nout vec4 occlusion;\n\nvec3 worldPosition(vec2 uv, float depth) {\n  vec4 point = inverseViewProjection * vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);\n  return point.xyz / point.w;\n}\n\nfloat interleavedNoise(vec2 pixel) {\n  return fract(52.9829189 * fract(dot(pixel, vec2(0.06711056, 0.00583715))));\n}\n\nvoid main() {\n  float depth = texture(sceneDepth, textureCoordinate).r;\n  if (depth >= 1.0) {\n    occlusion = vec4(1.0);\n    return;\n  }\n  vec3 position = worldPosition(textureCoordinate, depth);\n  vec3 normal = normalize(cross(dFdx(position), dFdy(position)));\n  if (orthographic < 0.5 && dot(normal, eye - position) < 0.0) normal = -normal;\n  float distanceToEye = orthographic > 0.5 ? 1.0 : length(eye - position);\n  float screenRadius = min(radius * projectionScale / distanceToEye, 0.25);\n  float rotation = interleavedNoise(gl_FragCoord.xy) * 6.2831853;\n  float total = 0.0;\n  for (int index = 0; index < 12; index++) {\n    float fraction = (float(index) + 0.5) / float(12);\n    float angle = rotation + float(index) * 2.3999632;\n    vec2 offset = vec2(cos(angle), sin(angle)) * sqrt(fraction) * screenRadius;\n    vec2 sampleUv = textureCoordinate + vec2(offset.x / aspect, offset.y);\n    float sampleDepth = texture(sceneDepth, sampleUv).r;\n    if (sampleDepth >= 1.0) continue;\n    vec3 toSample = worldPosition(sampleUv, sampleDepth) - position;\n    float sampleDistance = length(toSample);\n    float falloff = 1.0 - clamp(sampleDistance / (radius * 1.5), 0.0, 1.0);\n    total += max(dot(normal, toSample) / max(sampleDistance, 0.0001) - 0.15, 0.0) * falloff;\n  }\n  float visibility = clamp(1.0 - 2.5 * total / float(12), 0.0, 1.0);\n  occlusion = vec4(vec3(visibility), 1.0);\n}", Ce = 10, we = Object.freeze([]);
function Te(e, t, n, r) {
	return {
		kind: e,
		severity: "warning",
		target: t,
		message: n,
		fix: r
	};
}
function Ee(e, t) {
	let n = e[0] * t[0] + e[1] * t[1] + e[2] * t[2], r = Math.hypot(...e) * Math.hypot(...t);
	return r > 1e-6 ? Math.acos(Math.max(-1, Math.min(1, n / r))) * 180 / Math.PI : 0;
}
function De(e, t, n) {
	let r = L(e, t, n), i = Ee(r.eye.map((e, t) => e - r.target[t]), t);
	return i < Ce ? null : Te("shadow-light-direction-mismatch", "shadowBounds.eye", `shadowBounds.eye is ${Math.round(i)} degrees off lightDirection; the eye sets the shadow direction.`, "Drop shadowBounds.eye, or point lightDirection from shadowBounds.target to it.");
}
function Oe({ world: e, depth: t, effects: n, lightDirection: r, shadowBounds: i, coplanarProblems: a = null, skinProblems: o = null }) {
	let s = [];
	if (n.ambientOcclusion > 0 && !t && s.push(Te("ambient-occlusion-without-depth", "effects.ambientOcclusion", `ambientOcclusion is ${n.ambientOcclusion} but the renderer has no depth, so the pass is skipped.`, "Build the renderer with depth: true, or set ambientOcclusion to 0.")), i?.eye && r) {
		let t = De(e, r, i);
		t && s.push(t);
	}
	return a?.length && s.push(...a), o?.length && s.push(...o), s.length ? s : we;
}
// src/render-target-ledger.js
var ke = {
	R8: 1,
	RGBA8: 4,
	RGBA16F: 8,
	R11F_G11F_B10F: 4,
	R11F_G11F_B10F: 4,
	DEPTH_COMPONENT16: 2,
	DEPTH_COMPONENT24: 4
}, Ae = 1048576, je = class {
	targets = /* @__PURE__ */ new Map();
	record(e, { width: t, height: n, format: r, samples: i = 1, layers: a = 1 }) {
		let o = t * n * a * i * ke[r];
		this.targets.set(e, {
			name: e,
			width: t,
			height: n,
			layers: a,
			format: r,
			samples: i,
			bytes: o,
			megabytes: Number((o / Ae).toFixed(2))
		});
	}
	release(...e) {
		for (let t of e) this.targets.delete(t);
	}
	report() {
		let e = [...this.targets.values()].sort((e, t) => t.bytes - e.bytes), t = e.reduce((e, t) => e + t.bytes, 0);
		return {
			totalBytes: t,
			totalMegabytes: Number((t / Ae).toFixed(2)),
			targets: e
		};
	}
}, V = 2048;
V / 512;
var Me = .05, Ne = 30, Pe = 92 * Math.PI / 180, Fe = 4 * Math.PI / 180, Ie = 170 * Math.PI / 180, Le = [
	[
		1,
		0,
		0
	],
	[
		-1,
		0,
		0
	],
	[
		0,
		1,
		0
	],
	[
		0,
		-1,
		0
	],
	[
		0,
		0,
		1
	],
	[
		0,
		0,
		-1
	]
], Re = [
	[
		0,
		1,
		0
	],
	[
		0,
		1,
		0
	],
	[
		0,
		0,
		1
	],
	[
		0,
		0,
		-1
	],
	[
		0,
		1,
		0
	],
	[
		0,
		1,
		0
	]
];
function ze(e) {
	return Math.abs(e[1]) > .99 ? [
		1,
		0,
		0
	] : [
		0,
		1,
		0
	];
}
function Be({ light: e, face: t }, n) {
	let r = e.range > 0 ? e.range : Ne, i = t === -1, a = i ? Math.min(2 * (e.angle ?? Math.PI / 4) + Fe, Ie) : Pe, o = i ? e.direction : Le[t], s = i ? ze(o) : Re[t], c = [
		e.position[0] + o[0],
		e.position[1] + o[1],
		e.position[2] + o[2]
	], l = m(h(), e.position, c, s), u = d(h(), a, 1, Me, r);
	return p(n, u, l), 2 * Math.tan(a / 2) / 512;
}
function Ve(e) {
	let t = e % 4, n = Math.floor(e / 4);
	return [
		t * 512,
		n * 512,
		512,
		512
	];
}
Object.freeze(/* @__PURE__ */ "map.normalMap.metallicRoughnessMap.occlusionMap.emissiveMap.tag.alphaMode.alphaCutoff.opacity.doubleSided.occlusionStrength.moss.boxMapScale.boxMapAxis.lightMapScale.layerMaps.lightMask.clearcoat.clearcoatRoughness.transmission.thickness.ior.sheenRoughness.specular.anisotropy.anisotropyRotation.iridescence.iridescenceIor.iridescenceThickness.attenuationDistance.toon".split(".")), Object.freeze([
	"normalScale",
	"mossColor",
	"lightMap",
	"attenuationColor",
	"sheenColor",
	"specularColor",
	"subsurface"
]);
function He(e) {
	return e.normalScale === void 0 && e.mossColor === void 0 && e.lightMap === void 0 && e.attenuationColor === void 0 && e.sheenColor === void 0 && e.specularColor === void 0 && e.subsurface === void 0;
}
var Ue = class e {
	static of(t) {
		return He(t) ? new e(t) : null;
	}
	constructor(e) {
		this.map = e.map, this.normalMap = e.normalMap, this.metallicRoughnessMap = e.metallicRoughnessMap, this.occlusionMap = e.occlusionMap, this.emissiveMap = e.emissiveMap, this.tag = e.tag, this.alphaMode = e.alphaMode, this.alphaCutoff = e.alphaCutoff, this.opacity = e.opacity, this.doubleSided = e.doubleSided, this.occlusionStrength = e.occlusionStrength, this.moss = e.moss, this.boxMapScale = e.boxMapScale, this.boxMapAxis = e.boxMapAxis, this.lightMapScale = e.lightMapScale, this.layerMaps = e.layerMaps, this.lightMask = e.lightMask, this.clearcoat = e.clearcoat, this.clearcoatRoughness = e.clearcoatRoughness, this.transmission = e.transmission, this.thickness = e.thickness, this.ior = e.ior, this.sheenRoughness = e.sheenRoughness, this.specular = e.specular, this.anisotropy = e.anisotropy, this.anisotropyRotation = e.anisotropyRotation, this.iridescence = e.iridescence, this.iridescenceIor = e.iridescenceIor, this.iridescenceThickness = e.iridescenceThickness, this.attenuationDistance = e.attenuationDistance, this.toon = e.toon;
	}
	matches(e) {
		return He(e) && this.map === e.map && this.normalMap === e.normalMap && this.metallicRoughnessMap === e.metallicRoughnessMap && this.occlusionMap === e.occlusionMap && this.emissiveMap === e.emissiveMap && this.tag === e.tag && this.alphaMode === e.alphaMode && this.alphaCutoff === e.alphaCutoff && this.opacity === e.opacity && this.doubleSided === e.doubleSided && this.occlusionStrength === e.occlusionStrength && this.moss === e.moss && this.boxMapScale === e.boxMapScale && this.boxMapAxis === e.boxMapAxis && this.lightMapScale === e.lightMapScale && this.layerMaps === e.layerMaps && this.lightMask === e.lightMask && this.clearcoat === e.clearcoat && this.clearcoatRoughness === e.clearcoatRoughness && this.transmission === e.transmission && this.thickness === e.thickness && this.ior === e.ior && this.sheenRoughness === e.sheenRoughness && this.specular === e.specular && this.anisotropy === e.anisotropy && this.anisotropyRotation === e.anisotropyRotation && this.iridescence === e.iridescence && this.iridescenceIor === e.iridescenceIor && this.iridescenceThickness === e.iridescenceThickness && this.attenuationDistance === e.attenuationDistance && this.toon === e.toon;
	}
}, We = 6, Ge = 1e-6, Ke = /* @__PURE__ */ new WeakMap();
function qe(e) {
	let t = Ke.get(e);
	if (t) return t;
	let n = e.positions, r = [
		Infinity,
		Infinity,
		Infinity
	], i = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let e = 0; e < n.length; e += 3) for (let t = 0; t < 3; t++) r[t] = Math.min(r[t], n[e + t]), i[t] = Math.max(i[t], n[e + t]);
	let a = r.map((e, t) => (e + i[t]) / 2), o = 0;
	for (let e = 0; e < n.length; e += 3) {
		let t = n[e] - a[0], r = n[e + 1] - a[1], i = n[e + 2] - a[2];
		o = Math.max(o, t * t + r * r + i * i);
	}
	let s = Object.freeze({
		center: Object.freeze(a),
		radius: Math.sqrt(o),
		minimum: r,
		maximum: i
	});
	return Ke.set(e, s), s;
}
function Je(e, t) {
	for (let n = 0; n < We; n++) {
		let r = n >> 1, i = n % 2 == 0 ? 1 : -1;
		for (let a = 0; a < 4; a++) t[n * 4 + a] = e[a * 4 + 3] + i * e[a * 4 + r];
		let a = Math.hypot(t[n * 4], t[n * 4 + 1], t[n * 4 + 2]);
		for (let e = 0; e < 4; e++) t[n * 4 + e] /= a || 1;
	}
	return t;
}
function Ye(e, t) {
	let n = e[t] ** 2 + e[t + 1] ** 2 + e[t + 2] ** 2, r = e[t + 4] ** 2 + e[t + 5] ** 2 + e[t + 6] ** 2, i = e[t + 8] ** 2 + e[t + 9] ** 2 + e[t + 10] ** 2;
	return Math.sqrt(Math.max(n, r, i));
}
function Xe(e, t, n, r, i) {
	for (let a = 0; a < We; a++) {
		let o = a * 4;
		if (e[o] * t + e[o + 1] * n + e[o + 2] * r + e[o + 3] < -i) return !0;
	}
	return !1;
}
function Ze(e, t, n, r) {
	let i = 0;
	for (let a = 1; a < e.length && !(e[a] * t * n > r); a++) i = a;
	return i;
}
var Qe = class {
	constructor(e, t) {
		this.indices = Array.from({ length: t }, () => new Uint32Array(e)), this.counts = new Uint32Array(t), this.visibleCount = 0;
	}
	get isEverything() {
		return this.visibleCount === this.indices[0].length && this.counts[0] === this.visibleCount;
	}
};
function $e(e, { instanceData: t, instanceCount: n, stride: r, bounds: i, margin: a = 0, levelErrors: o, planes: s, viewProjection: c, pixelsPerUnit: l, pixelError: u = 1, belowHeight: d = -Infinity, minimumPixelRadius: f = 0 }) {
	e.counts.fill(0), e.visibleCount = 0;
	let p = o.length > 1, [m, h, g] = i.center;
	for (let _ = 0; _ < n; _++) {
		let n = _ * r, v = t[n] * m + t[n + 4] * h + t[n + 8] * g + t[n + 12], y = t[n + 1] * m + t[n + 5] * h + t[n + 9] * g + t[n + 13], b = t[n + 2] * m + t[n + 6] * h + t[n + 10] * g + t[n + 14], x = Ye(t, n), S = i.radius * x + a;
		if (y + S < d || Xe(s, v, y, b, S)) continue;
		let C = 0;
		if (p || f > 0) {
			let e = c[3] * v + c[7] * y + c[11] * b + c[15];
			if (e > Ge && S * l / e < f) continue;
			C = p && e > Ge ? Ze(o, x, l / e, u) : 0;
		}
		e.indices[C][e.counts[C]++] = _, e.visibleCount++;
	}
	return e;
}
// src/fog-fit.js
var et = .006, tt = 1.2;
function nt(e) {
	let t = 0;
	for (let n = 0; n < 3; n++) t = Math.max(t, Math.hypot(e[n * 4], e[n * 4 + 1], e[n * 4 + 2]));
	return t;
}
function rt(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r of e) {
		if (!r.geometry?.positions?.length || !r.matrix) continue;
		let e = qe(r.geometry), i = r.matrix, a = e.radius * nt(i);
		for (let r = 0; r < 3; r++) {
			let o = i[r] * e.center[0] + i[4 + r] * e.center[1] + i[8 + r] * e.center[2] + i[12 + r];
			t[r] = Math.min(t[r], o - a), n[r] = Math.max(n[r], o + a);
		}
	}
	return Number.isFinite(t[0]) ? Math.hypot(n[0] - t[0], n[1] - t[1], n[2] - t[2]) : 0;
}
function it(e) {
	let t = rt(e);
	return t > 0 ? Math.min(et, tt / t) : et;
}
// src/renderer.js
var at = 2048, ot = /* @__PURE__ */ new Set(["liquid", "foam"]), H = 42, st = 41, ct = 3e38, lt = {
	opaque: 0,
	mask: 1,
	blend: 2,
	add: 3
};
function U(e) {
	return e === "blend" || e === "add";
}
var W = Object.freeze([
	0,
	0,
	0
]), G = [
	"map",
	"normalMap",
	"metallicRoughnessMap",
	"occlusionMap",
	"emissiveMap"
], ut = [
	"baseMap",
	"normalMap",
	"metallicRoughnessMap",
	"occlusionMap",
	"emissiveMap"
], dt = [
	"hasBaseMap",
	"hasNormalMap",
	"hasMetallicRoughnessMap",
	"hasOcclusionMap",
	"hasEmissiveMap"
], ft = [1, 1], pt = 8, K = /* @__PURE__ */ new Set([
	"water",
	"foliage",
	"grass",
	"terrain",
	"floor",
	"fire",
	"smoke",
	"liquid",
	"foam"
]), mt = /* @__PURE__ */ new Set(["foliage", "grass"]), ht = /* @__PURE__ */ new Set([
	"foliage",
	"grass",
	"water",
	"fire",
	"smoke"
]), gt = .56, _t = /* @__PURE__ */ "transparent.frameTexture.bloomTexture.bloomStrength.hdrEnabled.grade.vignette.grainAmount.resolution.monochrome.fade.cinematic.time.volumeExplosion.explosionProgress.inverseViewProjection.eye.sceneDepth.volumeShadowMap.volumeLightProjection.volumeLightDirection.volumeLightColor.volumeDensity.volumeMinimum.volumeMaximum.volumeColor.volumeAmbient.volumeDrift.volumeSteps.volumeAnisotropy.volumeShadowAmbient.volumeGridFog.volumeNoiseAmount.volumeNoiseScale.volumeHeightFalloff.volumeMaxDistance.volumeField.volumeProfile.volumeFlowStrength.volumeFlowPeriod.volumeLightCount.volumeLightPositions[0].volumeLightColors[0].volumeLightDirections[0].volumeLightCones[0].fogSkyVisibility.orthographic.occlusionTexture.occlusionStrength.occlusionTexel".split(".");
function vt(e, t) {
	return Object.fromEntries(_t.map((n) => [n, e.getUniformLocation(t, n)]));
}
var yt = [
	"baseMap",
	"normalMap",
	"metallicRoughnessMap",
	"occlusionMap",
	"emissiveMap"
], bt = [
	"skin",
	"crowd",
	"morph",
	"lightMap",
	"waterReflection"
], xt = [
	"moss",
	"anisotropy",
	"iridescence",
	"toon",
	"boxMapScale"
], St = /* @__PURE__ */ new Set([
	"floor",
	"water",
	"foliage",
	"terrain",
	"grass",
	"fire",
	"smoke",
	"unlit"
]);
function Ct(e) {
	let t = [];
	return e.spotCount > 0 && t.push("spotLights"), e.areaCount > 0 && t.push("areaLights"), e.shadowCasters.length > 0 && t.push("localShadows"), e.extraFeatures && t.push(...e.extraFeatures), e.fillIntensity > 0 && t.push("fill"), t;
}
function wt(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) {
		let { material: e } = n;
		for (let r of bt) (n[r] || e[r]) && t.add(r);
		G.forEach((n, r) => {
			e[n] && t.add(yt[r]);
		}), e.environmentProbe && t.add("probe"), e.irradianceGrid && t.add("irradianceGrid"), e.normalMap?.uvTransform && t.add("normalMapTransform"), Object.keys(e.layerMaps ?? {}).forEach((e) => t.add(e)), e.layers && t.add("splat");
		for (let n of xt) e[n] > 0 && t.add(n);
		e.lightMask !== void 0 && t.add("lightLinking"), (e.alphaMode ?? "opaque") !== "opaque" && t.add("alphaMode"), e.subsurface?.weight > 0 && t.add("subsurface"), e.snippet && t.add(e.snippet.feature), le(e, "clearcoat") > 0 && t.add("clearcoat"), le(e, "sheenColor").some((e) => e !== 0) && t.add("sheen"), St.has(e.tag) && t.add(e.tag), [n.geometry, ...(n.lods ?? []).map((e) => e.geometry)].some((e) => e.colors || e.skyVisibility) && t.add("vertexColors");
	}
	return t;
}
function q(e) {
	return e.transmission > 0 ? "liquid" : ot.has(e.tag) ? e.tag : "opaque";
}
function Tt(t, n = !!e.begin) {
	return !!(t.skin || t.morph || t.geometry.morphTargets || t.geometry.skinIndices || Xt(t.material) && !n);
}
function J(e) {
	return e.pass ?? "opaque";
}
var Et = [
	"skinEnabled",
	"skinInfluences",
	"jointPalette",
	"crowdEnabled"
], Dt = [
	"alphaMode",
	"alphaCutoff",
	"materialOpacity",
	"alphaToCoverage",
	"doubleSided"
], Ot = [
	"alphaMasked",
	"alphaCutoff",
	"materialOpacity",
	"hasBaseMap",
	"baseMap"
], kt = [
	"morphEnabled",
	"morphVertexCount",
	"morphTargetCount",
	"morphWeights[0]",
	"morphTargets"
], At = [
	"environmentSpecular",
	"environmentEnabled",
	"environmentIntensity",
	"environmentRotation",
	"environmentLevelMax",
	"environmentBrdf",
	"environmentIrradiance[0]"
], jt = 6, Y = 9, Mt = 10, Nt = 15, Pt = [
	"pointLightCount",
	"pointLightPositions[0]",
	"pointLightColors[0]",
	"pointLightRadii[0]",
	"pointLightShadowTiles[0]",
	"spotLightCount",
	"spotLightPositions[0]",
	"spotLightColors[0]",
	"spotLightDirections[0]",
	"spotLightParameters[0]",
	"areaLightCount",
	"areaLightPositions[0]",
	"areaLightColors[0]",
	"areaLightNormals[0]",
	"areaLightTangents[0]",
	"localShadowAtlas",
	"localShadowMatrices[0]",
	"localShadowTexelAngles[0]",
	"keyColor",
	"fillIntensity",
	"ambientIntensity",
	"specularAntiAliasing"
], Ft = [
	"splatEnabled",
	"splatColor",
	"splatNormal",
	"splatPacked",
	"splatMask",
	"splatLayer[0]",
	"splatTint[0]",
	"splatSlope[0]",
	"splatHeightRange[0]",
	"splatMaskChannel[0]",
	"splatMaskInvert[0]",
	"splatBlend",
	"splatOptions",
	"splatMaskBounds",
	"splatVariation"
];
function It(e) {
	if (K.has(e.tag)) for (let t = 1; t < G.length; t++) {
		let n = G[t] === "normalMap" && mt.has(e.tag);
		if (e[G[t]] && !n) throw Error("Material maps require a standard PBR material tag. Procedural tags accept only a base map, and foliage and grass also a normal map.");
	}
	if (e.tag === "unlit" && (e.normalMap || e.metallicRoughnessMap || e.occlusionMap)) throw Error("Unlit materials support only base and emissive maps.");
	let t = e.normalScale ?? ft;
	if (t.length !== 2 || !Number.isFinite(t[0]) || !Number.isFinite(t[1]) || !Number.isFinite(Math.fround(t[0])) || !Number.isFinite(Math.fround(t[1]))) throw Error("normalScale must contain two finite floats.");
	let n = e.occlusionStrength ?? 1;
	if (!Number.isFinite(n) || n < 0 || n > 1) throw Error("occlusionStrength must be within zero and one.");
	Rt(e);
}
var Lt = Object.freeze([
	.05,
	.085,
	.02
]);
function Rt(e) {
	if (e.moss === void 0) return;
	if (typeof e.moss != "number" || !(e.moss >= 0 && e.moss <= 1)) throw Error("moss must be within zero and one.");
	if (e.moss > 0 && K.has(e.tag)) throw Error("Moss needs a standard PBR material tag.");
	let t = e.mossColor ?? Lt;
	if (!Array.isArray(t) || t.length !== 3 || !t.every(Number.isFinite)) throw Error("mossColor must be three linear RGB numbers.");
}
function zt(e) {
	return [e.moss ?? 0, ...e.mossColor ?? Lt];
}
function Bt(e) {
	It(e);
	let t = e.normalScale ?? ft, n = e.occlusionStrength ?? 1;
	if ((e.layers || e.splat) && a().validate(e), e.layers && K.has(e.tag)) throw Error("Splat layers require a standard PBR material tag.");
	return [
		...G.map((t) => e[t] ?? null),
		t[0],
		t[1],
		n,
		...zt(e),
		e.boxMapScale ?? 0,
		e.boxMapAxis ?? 1,
		...Vt(e),
		e.layers ?? null,
		e.splat ?? null,
		e.layerMaps ?? null,
		e.environmentProbe ?? null,
		e.waterReflection ?? null,
		e.irradianceGrid ?? null
	];
}
function Vt(e) {
	if (!e.lightMap) return [null, 0];
	let t = e.lightMapScale ?? 1;
	if (!Number.isFinite(t) || t < 0) throw RangeError("lightMapScale must be a nonnegative number.");
	if ((e.lightMap.colorSpace ?? "srgb") !== "srgb") throw Error("lightMap requires an srgb texture descriptor.");
	return [e.lightMap, t];
}
function Ht(e) {
	let t = e.alphaMode ?? "opaque";
	if (!Object.hasOwn(lt, t)) throw Error("alphaMode must be 'opaque', 'mask', 'blend' or 'add'.");
	for (let t of ["alphaCutoff", "opacity"]) {
		let n = e[t] ?? 1;
		if (typeof n != "number" || !Number.isFinite(n) || n < 0 || n > 1) throw Error(`${t} must be a number within zero and one.`);
	}
	if (e.doubleSided !== void 0 && typeof e.doubleSided != "boolean") throw TypeError("doubleSided must be a boolean");
}
function Ut(e) {
	return U(e.alphaMode ?? "opaque") ? (e.opacity ?? 1) + (e.opacityBias ?? 0) : 1;
}
function X(e) {
	Ht(e);
	let t = e.alphaMode ?? "opaque";
	return [
		t,
		t === "mask" ? e.alphaCutoff ?? .5 : 0,
		t === "mask" ? (e.opacity ?? 1) + (e.opacityBias ?? 0) : 1,
		e.doubleSided === !0
	];
}
function Wt(e) {
	return e.castShadow ?? !(e.shadowCatcher === !0 || U(e.material.alphaMode ?? "opaque"));
}
var Gt = (e) => e.receiveShadow !== !1, Kt = (e) => e.holdout === !0 ? 1 : e.shadowCatcher === !0 ? 2 : 0, qt = [
	"castShadow",
	"receiveShadow",
	"holdout",
	"shadowCatcher",
	"visible"
];
function Jt(e) {
	for (let t of qt) if (e[t] !== void 0 && typeof e[t] != "boolean") throw TypeError(`${t} must be a boolean`);
	if (e.holdout === !0 && e.shadowCatcher === !0) throw Error(`A part is a holdout or a shadow catcher, not both: ${e.name}`);
}
var Yt = (e) => e.visible === !1 || e.visibility?.visible === !1;
function Xt(e) {
	return G.some((t) => e[t]);
}
var Zt = 2 ** 128 - 2 ** 103;
function Qt(e) {
	return typeof e == "number" && e > -Zt && e < Zt;
}
function Z(e, t) {
	if (e?.length !== t) return !1;
	if (e instanceof Float32Array) {
		let n = 0;
		for (let r = 0; r < t; r++) n += e[r] * 0;
		return n === 0;
	}
	for (let n = 0; n < t; n++) if (!Qt(e[n])) return !1;
	return !0;
}
function $t(e, t = v()) {
	if (!Z(e.matrix, 16)) throw Error(`Invalid transform: ${e.name}`);
	if (!_(t, e.matrix) || !Z(t, 9)) throw Error(`Singular transform: ${e.name}`);
	let n = e.material, r = e.assembly;
	if (!Z(n.color, 3) || n.emissiveColor !== void 0 && !Z(n.emissiveColor, 3) || r && (!Z(r.offset ?? W, 3) || !Z(r.detailOffset ?? W, 3))) throw Error(`Invalid instance vector: ${e.name}`);
	if (!Qt(e.material.metallic) || !Qt(e.material.roughness) || !Qt(e.material.emission ?? 0)) throw Error(`Invalid material: ${e.name}`);
	return t;
}
function en(e, t, n) {
	e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2];
}
function tn(e) {
	return e[0] * (e[5] * e[10] - e[6] * e[9]) - e[4] * (e[1] * e[10] - e[2] * e[9]) + e[8] * (e[1] * e[6] - e[2] * e[5]) < 0;
}
function nn(e, t, n, r) {
	let i = t * H, a = n.material;
	Yt(n) ? e.fill(0, i, i + 25) : (e.set(n.matrix, i), e.set(r, i + 16)), en(e, i + 25, a.color), e[i + 28] = a.metallic, e[i + 29] = a.roughness, e[i + 30] = a.emission ?? 0, e[i + 31] = s[a.tag] ?? 0, en(e, i + 32, n.assembly?.offset ?? W), en(e, i + 35, n.assembly?.detailOffset ?? W), en(e, i + 38, a.emissiveColor ?? a.color), e[i + st] = Ut(a);
}
var rn = 5;
function an(e) {
	let t = e[0];
	return t.skin || t.morph || ht.has(t.material.tag) && !mt.has(t.material.tag) || q(t.material) !== "opaque" || U(X(t.material)[0]) ? !1 : e.every((e) => !e.assembly || e.crowd);
}
function on(e, t) {
	if (!Array.isArray(t) || t.length < 2 || t[0].geometry !== e.geometry) throw TypeError(`lods must list level 0 (the own geometry of the part) and at least one coarser level: ${e.name}`);
	t.forEach((n, r) => {
		if (!n.geometry?.positions || !n.geometry.indices) throw TypeError(`Every lods entry needs a geometry: ${e.name}`);
		if (!Number.isFinite(n.error) || n.error < 0 || r > 0 && n.error < t[r - 1].error) throw RangeError(`lods errors must be finite and not decrease from level to level: ${e.name}`);
	});
}
function sn(e) {
	return [
		e.geometry,
		...(e.lods ?? []).map((e) => e.geometry),
		...(e.shadowLods ?? []).map((e) => e.geometry)
	];
}
function cn(e, t) {
	return {
		levelErrors: e.map((e) => e.error),
		levelGeometries: e.map((e) => e.geometry),
		levelDraws: [],
		selection: new Qe(t, e.length)
	};
}
function ln(e) {
	let t = Infinity, n = -Infinity;
	for (let { geometry: r, matrix: i } of e) {
		if (!r?.positions?.length || !i) continue;
		let { minimum: e, maximum: a } = qe(r), o = i[13], s = 0;
		for (let t = 0; t < 3; t++) {
			let n = i[1 + t * 4];
			o += Math.min(n * e[t], n * a[t]), s += Math.abs(n) * (a[t] - e[t]);
		}
		t = Math.min(t, o), n = Math.max(n, o + s);
	}
	let r = n - t;
	return .019 - t > r * .1 ? t + r * .02 : .019;
}
function un(e = .019) {
	return {
		name: "Studio floor",
		geometry: {
			positions: new Float32Array([
				-100,
				e,
				-100,
				-100,
				e,
				100,
				100,
				e,
				100,
				100,
				e,
				-100
			]),
			normals: new Float32Array([
				0,
				1,
				0,
				0,
				1,
				0,
				0,
				1,
				0,
				0,
				1,
				0
			]),
			indices: new Uint32Array([
				0,
				1,
				2,
				0,
				2,
				3
			])
		},
		matrix: h(),
		material: {
			color: [
				.04,
				.05,
				.06
			],
			metallic: 0,
			roughness: 1,
			emission: 0,
			tag: "floor"
		}
	};
}
var Q = () => n("validateSkinGeometry", "skinning.js"), $ = () => n("validateMorphGeometry", "morph.js"), dn = (e) => !!(e.skin || e.geometry.skinIndices || e.geometry.skinWeights), fn = (e) => !!(e.morph || e.geometry.morphTargets !== void 0);
function pn(e, t = !0) {
	let n = /* @__PURE__ */ new Map(), r = [], i = /* @__PURE__ */ new Map();
	for (let a of e) {
		if ($t(a), Jt(a), dn(a)) {
			let { validateSkinGeometry: e, validateSkinPose: t } = Q();
			e(a.geometry, a.skin), a.skin && t(a.skin, a.geometry, a.matrix);
		}
		if (a.skin && K.has(a.material.tag)) throw Error("Skinned parts require a standard material tag.");
		if (fn(a)) {
			let { validateMorphGeometry: e, validateMorphPose: t, validateMorphTransform: n } = $();
			i.has(a.geometry) ? t(a.morph, i.get(a.geometry)) : i.set(a.geometry, e(a.geometry, a.morph)), a.morph && n(a.morph, i.get(a.geometry), a.matrix, a.skin);
		}
		if (a.morph && K.has(a.material.tag)) throw Error("Morphed parts require a standard material tag.");
		let e = t ? a.geometry : a;
		n.has(e) || n.set(e, /* @__PURE__ */ new Map());
		let o = n.get(e);
		for (let e of [
			...Bt(a.material),
			...B(a.material),
			a.skin ?? null,
			a.material.snippet,
			a.crowd ?? null,
			a.morph ?? null,
			Wt(a),
			Gt(a),
			Kt(a),
			R(a),
			q(a.material),
			a.lods ?? null,
			a.shadowLods ?? null,
			tn(a.matrix),
			...X(a.material)
		]) o.has(e) || o.set(e, /* @__PURE__ */ new Map()), o = o.get(e);
		if (!o.has("parts")) {
			let e = [];
			o.set("parts", e), r.push(e);
		}
		o.get("parts").push(a);
	}
	return r;
}
function mn(e, t = Infinity) {
	let n = e.image?.naturalWidth ?? e.image?.width, r = e.image?.naturalHeight ?? e.image?.height;
	if (!Number.isInteger(n) || !Number.isInteger(r) || n <= 0 || r <= 0 || n > t || r > t) throw Error("Texture image dimensions are invalid or exceed MAX_TEXTURE_SIZE.");
	if (![0, 1].includes(e.uvChannel ?? 0)) throw Error("Only texture UV channels 0 and 1 are supported.");
	if (e.transform || e.offset || e.repeat || e.rotation !== void 0 || e.extensions && Object.keys(e.extensions).length) throw Error("Texture transforms and extensions are unsupported. Bake them into UV channel 0.");
	if (e.colorSpace && !["srgb", "linear"].includes(e.colorSpace)) throw Error("Texture color space must be srgb or linear.");
	let i = e.wrapS ?? 10497, a = e.wrapT ?? 10497, o = e.minFilter ?? 9987, s = e.magFilter ?? 9729;
	if (![
		10497,
		33071,
		33648
	].includes(i) || ![
		10497,
		33071,
		33648
	].includes(a)) throw Error("Unsupported texture wrap mode.");
	if (![
		9728,
		9729,
		9984,
		9985,
		9986,
		9987
	].includes(o) || ![9728, 9729].includes(s)) throw Error("Unsupported texture filtering mode.");
	let c = e.image.compressed;
	if (c) return {
		width: n,
		height: r,
		wrapS: i,
		wrapT: a,
		minFilter: c.minFilter(o),
		magFilter: s,
		mipmaps: !1,
		bytes: c.bytes
	};
	let l = o >= 9984;
	return {
		width: n,
		height: r,
		wrapS: i,
		wrapT: a,
		minFilter: o,
		magFilter: s,
		mipmaps: l,
		bytes: F(n, r, { mipmaps: l })
	};
}
function hn(e, t, n) {
	let r = Array.from(e.getInternalformatParameter(e.RENDERBUFFER, t, e.SAMPLES)), i = Array.from(e.getInternalformatParameter(e.RENDERBUFFER, e.DEPTH_COMPONENT24, e.SAMPLES));
	return Math.max(0, ...r.filter((e) => e <= n && i.includes(e)));
}
function gn(e) {
	return e.lightUvs ? e.lightUvs.byteLength * 2 : e.uvs?.byteLength ?? 0;
}
function _n(e) {
	let t = e.lightUvs.length / 2, n = new Float32Array(t * 4);
	for (let r = 0; r < t; r++) n[r * 4] = e.uvs?.[r * 2] ?? 0, n[r * 4 + 1] = e.uvs?.[r * 2 + 1] ?? 0, n[r * 4 + 2] = e.lightUvs[r * 2], n[r * 4 + 3] = e.lightUvs[r * 2 + 1];
	return n;
}
function vn(e) {
	let t = e.skyVisibility.length, n = new Float32Array(t * 4);
	for (let r = 0; r < t; r++) {
		for (let t = 0; t < 3; t++) n[r * 4 + t] = e.colors ? e.colors[r * 3 + t] : 1;
		n[r * 4 + 3] = e.skyVisibility[r];
	}
	return n;
}
function yn(e) {
	let t = [
		"positions",
		"normals",
		"colors",
		"indices"
	].reduce((t, n) => t + (e[n]?.byteLength ?? 0), gn(e));
	return e.skyVisibility ? t - (e.colors?.byteLength ?? 0) + e.skyVisibility.length * 16 : t;
}
function bn(e) {
	let t = e.positions?.length / 3;
	if (!(e.positions instanceof Float32Array) || !Number.isInteger(t) || t < 1 || !(e.normals instanceof Float32Array) || e.normals.length !== t * 3 || !(e.indices instanceof Uint32Array) || e.indices.length < 3 || e.indices.length % 3 != 0) throw TypeError("Replacement geometry needs matching Float32 positions/normals and Uint32 triangles.");
	for (let [n, r] of [
		["positions", 3],
		["normals", 3],
		["uvs", 2],
		["colors", 3]
	]) {
		let i = e[n];
		if ((i || !["uvs", "colors"].includes(n)) && (!(i instanceof Float32Array) || i.length !== t * r || !xn(i))) throw TypeError(`Replacement ${n} must contain finite matching Float32 data.`);
	}
	let n = e.indices;
	for (let e = 0; e < n.length; e++) if (n[e] >= t) throw RangeError("Replacement triangle indices must address existing vertices.");
}
function xn(e) {
	for (let t = 0; t < e.length; t++) {
		let n = e[t];
		if (!(n > -Infinity && n < Infinity)) return !1;
	}
	return !0;
}
var Sn = class {
	constructor(e, t, { batching: n = !0, pixelRatio: r = 1.5, benchmark: i = !1, world: o = !1, ground: s = !0, transparent: c = !1, samples: l = 4, hdr: u = !1, depth: d = !1, memoryBudgetMiB: f, environment: p = {}, shadowBounds: m = {}, shadowCascades: g = null, culling: _ = !0, lodPixelError: v = 1, createGpuTimer: x = null, skyOpenness: S = null, fogSkyVisibility: C = null, shading: T = "full", viewTransform: ee = "aces", look: D = null, resolveCoplanar: k = !1, reversedDepth: N = "auto" } = {}) {
		if (this.canvas = e, this.sceneParts = t, this.skyOpenness = S, this.fogSkyVisibility = C, this.fogFieldOverride = null, this.fogFieldTexture = null, this.fogLightBuffers = null, this.createGpuTimer = x, this.gpuTimer = void 0, this.gpuMilliseconds = null, this.culling = _, this.lodPixelError = v, this.frustumPlanes = /* @__PURE__ */ new Float32Array(24), !Number.isInteger(l) || l < 1) throw Error("MSAA sample count must be a positive integer.");
		if (!w.includes(T)) throw Error(`shading must be one of ${w.join(", ")}.`);
		if (this.shading = T, new Set(t).size !== t.length) throw Error("Scene parts must have distinct object identities for animation.");
		this.lighting = ae(), ie(this.lighting, p, { world: o });
		let ne = se(p.volumeFog);
		if (ne.density > 0 && (!d || i || c || !u)) throw Error("Volume fog requires depth:true, hdr:true, an opaque canvas and normal rendering");
		if (this.context = e.getContext("webgl2", {
			antialias: !0,
			alpha: !!c,
			premultipliedAlpha: !0,
			powerPreference: "high-performance"
		}), !this.context) throw Error("WebGL2 is unavailable. Enable hardware acceleration or use a supported browser.");
		if (this.transparent = !!c, this.pixelRatio = r, this.benchmark = i, this.depth = !(!d || i), this.world = o, this.environment = p, this.fittedFogDensity = o ? it(t) : void 0, this.shadowBounds = m, this.coplanarDiagnostics = null, this.reversedDepthMode = N, this.reversedDepthReady = null, this.diagnostics = [], this.activeLightDirection = p.lightDirection ?? [
			-3,
			6,
			4
		], this.shadowCascades = g, this.renderTargets = new je(), this.defaultViewTransform = ee, this.defaultLook = D, this.viewTransform = "aces", this.look = null, this.lookSource = null, this.selectViewTransform(ee, D), this.hdr = !!(u && !i && this.context.getExtension("EXT_color_buffer_float")), ne.density > 0 && !this.hdr) throw Error("Volume fog requires EXT_color_buffer_float for HDR rendering");
		if (this.multisampleSamples = i ? 0 : hn(this.context, this.hdr ? this.context.RGBA16F : this.context.RGBA8, Math.min(T === "light" ? Math.min(l, 2) : l, this.context.getParameter(this.context.MAX_SAMPLES))), this.capabilities = {
			hdr: this.hdr,
			hdrRequested: !!u,
			hdrFallbackReason: u && !this.hdr ? i ? "HDR is disabled in benchmark mode" : "EXT_color_buffer_float is unavailable" : null,
			samples: this.multisampleSamples
		}, this.geometryBytes = 0, this.geometryBuffers = /* @__PURE__ */ new Map(), this.batching = n, this.groundPart = s === !0 ? un(ln(t)) : s || null, this.buffers = [], this.batches = [], this.partLocations = /* @__PURE__ */ new Map(), this.updateBatches = /* @__PURE__ */ new Set(), this.postStages = [], this.passSupport = null, this.updateSkins = /* @__PURE__ */ new Set(), this.updateMorphs = /* @__PURE__ */ new Set(), this.skinTextures = /* @__PURE__ */ new Map(), this.influenceTextures = /* @__PURE__ */ new Map(), this.morphTextures = /* @__PURE__ */ new Map(), this.textures = /* @__PURE__ */ new Map(), this.splatResources = /* @__PURE__ */ new Map(), this.textureBytes = 4, this.shadowsDirty = !0, this.windState = {
			time: 0,
			strength: .3
		}, this.assemblyAmount = 0, k && typeof k != "function") throw TypeError("resolveCoplanar is resolveFlushParts from 67js/addons/coplanar-overlap.");
		k && !i && k(t, N === !1 && { minimumGap: 0 });
		let P = pn(this.groundPart ? [...t, this.groundPart] : t, n), F = this.context.getParameter(this.context.MAX_TEXTURE_SIZE);
		if (this.hasSkins = P.some((e) => e[0].skin || e[0].crowd), this.hasMorphs = P.some((e) => e[0].morph), this.hasSkins && (this.context.getParameter(this.context.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 2 || this.context.getParameter(this.context.MAX_COMBINED_TEXTURE_IMAGE_UNITS) < 8)) throw Error("GPU skinning requires two vertex texture units and eight combined texture units.");
		if (this.hasMorphs && (this.context.getParameter(this.context.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < (this.hasSkins ? 3 : 1) || this.context.getParameter(this.context.MAX_COMBINED_TEXTURE_IMAGE_UNITS) < 9)) throw Error("GPU morphing requires one additional vertex texture unit and nine combined texture units.");
		let re = /* @__PURE__ */ new Set();
		for (let e of P) {
			let t = e[0];
			if (!t.morph || re.has(t.geometry)) continue;
			let n = t.geometry.positions.length / 3 * t.geometry.morphTargets.length * 2;
			this.textureBytes += $().skinTextureLayout(n, F, 2).bytes, re.add(t.geometry);
		}
		let I = /* @__PURE__ */ new Set(), oe = /* @__PURE__ */ new Set();
		for (let e of P) {
			let t = e[0];
			t.crowd && !I.has(t.crowd) && (this.textureBytes += Q().skinTextureLayout(t.crowd.data.length / 4, F, 4).bytes, I.add(t.crowd)), t.skin && (I.has(t.skin) || (this.textureBytes += Q().skinTextureLayout(t.skin.jointMatrices.length / 4, F, 4).bytes), oe.has(t.geometry) || (this.textureBytes += Q().skinTextureLayout(t.geometry.positions.length / 3 * 2, F, 2).bytes), I.add(t.skin), oe.add(t.geometry));
		}
		let L = /* @__PURE__ */ new Set();
		for (let e of P) {
			let t = e[0].material;
			for (let [e, n] of [...G, "lightMap"].map((e) => [e, t[e]]).concat(Object.entries(t.layerMaps ?? {}))) {
				if (!n) continue;
				let t = mn(n, F);
				if ([
					"normalMap",
					"metallicRoughnessMap",
					"occlusionMap"
				].includes(e) && n.colorSpace !== "linear") throw Error(`${e} requires a linear texture descriptor.`);
				if (e === "emissiveMap" && (n.colorSpace ?? "srgb") !== "srgb") throw Error("emissiveMap requires an srgb texture descriptor.");
				L.has(n) || (this.textureBytes += t.bytes), L.add(n);
			}
		}
		this.splatBytes = 0;
		let R = /* @__PURE__ */ new Set();
		for (let e of P) {
			let t = e[0].material;
			t.layers && !R.has(t.layers) && (R.add(t.layers), this.splatBytes += a().textureBytes(a().resolveSize(t, F), t.layers.length) + (t.splat?.maskMap ? mn(t.splat.maskMap, F).bytes : 0));
		}
		this.textureBytes += this.splatBytes, this.capabilities.maximumTextureSize = F, this.environmentResources = null, this.environmentBackgroundProgram = null, this.environmentBytes = !i && p.map ? z().estimateBytes(p.map, F) : 0, this.textureBytes += this.environmentBytes;
		for (let e of P) {
			let t = e[0].geometry;
			if (t.uvs && t.uvs.length !== t.positions.length / 3 * 2) throw Error("Geometry UV count must match the vertex count.");
			if (Xt(e[0].material) && !t.uvs && !t.lightUvs && !e[0].material.boxMapScale) throw Error("Textured geometry requires UV channel 0.");
			for (let e of t.uvs ?? []) if (!Number.isFinite(e)) throw Error("Geometry UVs must be finite.");
			if (t.colors && t.colors.length !== t.positions.length) throw Error("Geometry colors must contain RGB for every vertex.");
		}
		let ce = P.reduce((e, t) => e + yn(t[0].geometry) + t.length * H * 4, 0);
		this.memoryBudgetMiB = te({
			width: Math.max(1, e.clientWidth),
			height: Math.max(1, e.clientHeight),
			pixelRatio: r,
			samples: this.samples,
			memoryBudgetMiB: f,
			geometryBytes: ce,
			textureBytes: this.textureBytes,
			hdr: this.hdr,
			bloom: !i,
			depth: this.depth,
			maximumSize: F
		}).memoryBudgetMiB, this.view = h(), this.projection = h(), this.viewProjection = h(), this.lightProjection = h(), this.shadowBiasPerSlope = 0, this.inverseViewProjection = h(), this.shaderFeatures = wt(P.flat()), P.some((e) => e.length > 1) && this.shaderFeatures.add("instanced"), this.shaderFeatures.add(p.map ? "environmentMap" : "studioLighting"), Ct(this.lighting).forEach((e) => this.shaderFeatures.add(e)), T === "light" && this.shaderFeatures.add(O), g && this.shaderFeatures.add(g.shaderFeature);
		let B = {
			main: this.startMainProgram(),
			depth: A(this.context, y(this.shaderFeatures), E(b, this.shaderFeatures))
		};
		i || (B.post = A(this.context, M, this.withViewTransform(xe, "post")), B.sky = A(this.context, M, de), B.bloom = A(this.context, M, fe), p.map && this.startEnvironmentPrograms()), P.forEach((e) => this.batches.push(this.uploadBatch(e))), this.finishMainProgram(B.main), this.depthProgram = j(this.context, B.depth), this.depthSkinUniforms = Object.fromEntries(Et.map((e) => [e, this.context.getUniformLocation(this.depthProgram, e)])), this.depthMorphUniforms = Object.fromEntries(kt.map((e) => [e, this.context.getUniformLocation(this.depthProgram, e)])), i || (this.postProgram = j(this.context, B.post), this.skyProgram = j(this.context, B.sky), this.postUniforms = vt(this.context, this.postProgram), this.postVariants = /* @__PURE__ */ new Map(), this.bloomProgram = j(this.context, B.bloom), this.bloomUniforms = Object.fromEntries([
			"sourceTexture",
			"texelDirection",
			"threshold",
			"extract"
		].map((e) => [e, this.context.getUniformLocation(this.bloomProgram, e)])), this.skyUniforms = Object.fromEntries([
			"skyTop",
			"skyBottom",
			"sunDirection",
			"inverseViewProjection",
			"eye",
			"time",
			"daylight",
			"hdrEnabled"
		].map((e) => [e, this.context.getUniformLocation(this.skyProgram, e)]))), this.depthAlphaUniforms = Object.fromEntries(Ot.map((e) => [e, this.context.getUniformLocation(this.depthProgram, e)])), this.depthUniform = this.context.getUniformLocation(this.depthProgram, "lightProjection"), this.depthAssemblyUniform = this.context.getUniformLocation(this.depthProgram, "assemblyAmount"), this.depthWindUniforms = {
			time: this.context.getUniformLocation(this.depthProgram, "time"),
			wind: this.context.getUniformLocation(this.depthProgram, "wind")
		}, this.partCount = t.length, this.triangles = t.reduce((e, t) => e + t.geometry.indices.length / 3, 0), this.whiteTexture = this.createTexture(null);
		for (let [e, t] of [[this.program, this.uniforms], [this.depthProgram, this.depthSkinUniforms]]) this.context.useProgram(e), this.context.uniform1i(t.skinInfluences, 6), this.context.uniform1i(t.jointPalette, 7);
		for (let [e, t] of [[this.program, this.uniforms], [this.depthProgram, this.depthMorphUniforms]]) this.context.useProgram(e), this.context.uniform1i(t.morphTargets, 8);
		for (let e of [
			6,
			7,
			8
		]) this.context.activeTexture(this.context.TEXTURE0 + e), this.context.bindTexture(this.context.TEXTURE_2D, this.whiteTexture);
		this.shaderFeatures.has("splat") && a().initializePlaceholders(this), this.initializeEnvironment(p.map), this.createShadowMap(), this.resize(), !this.benchmark && !this.multisampleFramebuffer && this.allocateFrameTargets(this.canvas.width, this.canvas.height);
	}
	selectViewTransform(e, t) {
		if ((e !== "aces" || t) && !u.apply) throw Error("viewTransform and look need their shader code: add import '@codepawlhq/67js/addons/view-transform-shader' (a recipe: await loadAgentSceneModules(recipe)).");
		this.viewTransform = e, this.lookSource = t, this.look = t ? u.resolveLook(t) : null;
	}
	syncViewTransform(e) {
		let t = e.viewTransform ?? this.defaultViewTransform, n = e.look ?? this.defaultLook;
		if (t === this.viewTransform && n === this.lookSource || (u.dispose?.(this), this.selectViewTransform(t, n), this.benchmark)) return;
		let r = this.context;
		this.rebuildMainProgram();
		for (let e of this.postVariants.values()) r.deleteProgram(e.pending ? j(r, e.pending) : e.program);
		this.postVariants.clear(), r.deleteProgram(this.postProgram), this.postProgram = j(r, A(r, M, this.withViewTransform(xe, "post"))), this.postUniforms = vt(r, this.postProgram), this.liquidProgram && r.deleteProgram(this.liquidProgram), this.liquidProgram = null, this.environmentBackgroundProgram && r.deleteProgram(this.environmentBackgroundProgram), this.environmentBackgroundProgram = null;
	}
	withViewTransform(e, t) {
		return this.viewTransform === "aces" && !this.look ? e : u.apply(e, t, this.viewTransform, !!this.look);
	}
	startMainProgram() {
		let e = this.benchmark, t = e ? ee : this.withViewTransform(T(this.shaderFeatures), "main");
		return A(this.context, e ? C : D(this.shaderFeatures), t);
	}
	buildMainProgram() {
		this.finishMainProgram(this.startMainProgram());
	}
	finishMainProgram(e) {
		this.program = j(this.context, e), this.uniforms = Object.fromEntries([
			"materialDielectric",
			"materialCoat",
			"materialSheen",
			"materialAnisotropy",
			"materialIridescence",
			"lightLinkMask",
			"boxMapScale",
			"boxMapAxis",
			"lightMap",
			"lightMapScale",
			"hasLightMap",
			"viewProjection",
			"lightProjection",
			"eye",
			"armorColor",
			"armorSurface",
			"exposure",
			"inspection",
			"shadowMap",
			"shadowBiasPerSlope",
			...ut,
			...dt,
			...Et,
			...kt,
			"normalScale",
			"occlusionStrength",
			"materialMoss",
			...Ft,
			"hdrEnabled",
			"time",
			"wind",
			"worldMode",
			"daylight",
			"fogColor",
			"lightDirection",
			"fogDensity",
			"waterRipple",
			"rippleTime",
			"explosionProgress",
			"explosionCenter",
			"assemblyAmount",
			"renderPassMode",
			"renderPassDepthRange",
			"renderPassObjectBase",
			"baseColor",
			"surface",
			"instanceEmission",
			"instanceOpacity",
			"boxNormalMatrix",
			"shadowBlind",
			"compositeMode",
			...Dt
		].map((e) => [e, this.context.getUniformLocation(this.program, e)]));
		for (let e of Pt) this.uniforms[e] = this.context.getUniformLocation(this.program, e);
		for (let e of At) this.uniforms[e] = this.context.getUniformLocation(this.program, e);
		this.keepSamplerTypesApart();
	}
	keepSamplerTypesApart() {
		let e = this.context;
		e.useProgram(this.program);
		let t = e.getProgramParameter(this.program, e.ACTIVE_UNIFORMS);
		for (let n = 0; n < t; n++) {
			let t = e.getActiveUniform(this.program, n);
			t.type === e.SAMPLER_2D && e.uniform1iv(e.getUniformLocation(this.program, t.name), new Int32Array(t.size).fill(1));
		}
	}
	get samples() {
		return Math.max(1, this.multisampleSamples);
	}
	uploadBuffer(e, t, n = this.context.STATIC_DRAW) {
		let r = this.context.createBuffer();
		return this.buffers.push(r), this.context.bindBuffer(e, r), this.context.bufferData(e, t, n), this.geometryBytes += t.byteLength, r;
	}
	applyAnisotropy(e) {
		let t = this.context, n = t.getExtension("EXT_texture_filter_anisotropic");
		if (!n) return;
		let r = t.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
		t.texParameterf(e, n.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(pt, r));
	}
	createTexture(e) {
		if (this.textures.has(e)) return this.textures.get(e);
		let t = this.context, n = t.createTexture();
		t.bindTexture(t.TEXTURE_2D, n);
		let r = t.getParameter(t.UNPACK_FLIP_Y_WEBGL), i = t.getParameter(t.UNPACK_COLORSPACE_CONVERSION_WEBGL);
		try {
			if (t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL, e?.flipY ?? !1), t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL, t.NONE), e) {
				let n = mn(e, t.getParameter(t.MAX_TEXTURE_SIZE));
				e.image.compressed ? e.image.compressed.upload(t) : t.texImage2D(t.TEXTURE_2D, 0, e.colorSpace === "linear" ? t.RGBA8 : t.SRGB8_ALPHA8, t.RGBA, t.UNSIGNED_BYTE, e.image), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, n.wrapS), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, n.wrapT), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, n.minFilter), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, n.magFilter), n.mipmaps && (t.generateMipmap(t.TEXTURE_2D), this.applyAnisotropy(t.TEXTURE_2D));
			} else t.texImage2D(t.TEXTURE_2D, 0, t.RGBA8, 1, 1, 0, t.RGBA, t.UNSIGNED_BYTE, new Uint8Array([
				255,
				255,
				255,
				255
			])), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR);
		} catch (e) {
			throw t.deleteTexture(n), e;
		} finally {
			t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL, r), t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL, i);
		}
		return this.textures.set(e, n), n;
	}
	updateTexture(e, t = {}) {
		if (!r.update) throw Error("updateTexture needs its code: add import '@codepawlhq/67js/addons/texture-update'.");
		r.update(this, e, t);
	}
	requireShaderFeatures(e) {
		this.requireFeatureNames([...wt(e), ...e.length > 1 ? ["instanced"] : []]);
	}
	requireFeatureNames(e) {
		if (this.benchmark || !this.shaderFeatures) return;
		let t = e.filter((e) => !this.shaderFeatures.has(e));
		t.length !== 0 && (t.forEach((e) => this.shaderFeatures.add(e)), this.rebuildMainProgram());
	}
	rebuildMainProgram() {
		let e = this.context, t = this.program;
		this.buildMainProgram(), e.deleteProgram(t), e.useProgram(this.program);
		for (let [t, n] of [
			["skinInfluences", 6],
			["jointPalette", 7],
			["morphTargets", 8],
			...Object.entries(o),
			["environmentSpecular", Y],
			["environmentBrdf", Mt]
		]) e.uniform1i(this.uniforms[t], n);
		e.uniform1f(this.uniforms.splatEnabled, 0), this.shaderFeatures.has("splat") && !this.splatPlaceholder && a().initializePlaceholders(this);
	}
	uploadBatch(e) {
		this.requireShaderFeatures(e);
		let t = this.context, n = t.createVertexArray();
		try {
			return this.uploadBatchData(e, n);
		} catch (e) {
			throw t.bindVertexArray(null), t.deleteVertexArray(n), e;
		}
	}
	bindGeometryAttributes(e, t) {
		let n = this.context, r = this.geometryBuffers.get(e);
		if (!r) {
			r = /* @__PURE__ */ new Map();
			for (let t of [
				"positions",
				"normals",
				"uvs",
				"colors",
				"indices",
				"crowdPacked"
			]) if (e[t]) {
				let i = t === "indices" ? n.ELEMENT_ARRAY_BUFFER : n.ARRAY_BUFFER, a = t === "uvs" && e.lightUvs ? _n(e) : e[t];
				r.set(t, this.uploadBuffer(i, t === "colors" && e.skyVisibility ? vn(e) : a));
			}
			e.skyVisibility && !e.colors && r.set("colors", this.uploadBuffer(n.ARRAY_BUFFER, vn(e))), e.lightUvs && !e.uvs && r.set("uvs", this.uploadBuffer(n.ARRAY_BUFFER, _n(e))), this.geometryBuffers.set(e, r);
		}
		for (let [e, t] of [[0, "positions"], [1, "normals"]]) n.bindBuffer(n.ARRAY_BUFFER, r.get(t)), n.enableVertexAttribArray(e), n.vertexAttribPointer(e, 3, n.FLOAT, !1, 0, 0);
		if (e.lightUvs && e.lightUvs.length !== e.positions.length / 3 * 2) throw Error("Geometry lightUvs count must match the vertex count.");
		if (e.uvs || e.lightUvs) {
			if (e.uvs && e.uvs.length !== e.positions.length / 3 * 2) throw Error("Geometry UV count must match the vertex count.");
			n.bindBuffer(n.ARRAY_BUFFER, r.get("uvs")), n.enableVertexAttribArray(13), n.vertexAttribPointer(13, e.lightUvs ? 4 : 2, n.FLOAT, !1, 0, 0);
		} else {
			if (Xt(t) && !t.boxMapScale) throw Error("Textured geometry requires UV channel 0.");
			n.disableVertexAttribArray(13), n.vertexAttrib2f(13, -1, -1);
		}
		if (e.colors && e.colors.length !== e.positions.length) throw Error("Geometry colors must contain RGB for every vertex.");
		if (e.skyVisibility && e.skyVisibility.length !== e.positions.length / 3) throw Error("Geometry skyVisibility must hold one value for every vertex.");
		e.colors || e.skyVisibility ? (n.bindBuffer(n.ARRAY_BUFFER, r.get("colors")), n.enableVertexAttribArray(14), n.vertexAttribPointer(14, e.skyVisibility ? 4 : 3, n.FLOAT, !1, 0, 0)) : (n.disableVertexAttribArray(14), n.vertexAttrib3f(14, 1, 1, 1)), e.crowdPacked && (n.bindBuffer(n.ARRAY_BUFFER, r.get("crowdPacked")), n.enableVertexAttribArray(14), n.vertexAttribPointer(14, 4, n.FLOAT, !1, 0, 0)), n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, r.get("indices"));
	}
	pointInstanceAttributes() {
		for (let e = 0; e < 4; e++) this.attribute(2 + e, 4, 168, e * 16);
		for (let e = 0; e < 3; e++) this.attribute(6 + e, 3, 168, 64 + e * 12);
		this.attribute(9, 3, 168, 100), this.attribute(10, 4, 168, 112), this.attribute(11, 3, 168, 128), this.attribute(12, 3, 168, 140), this.attribute(15, 4, 168, 152);
	}
	createCullingState(e) {
		let t = e[0], n = an(e);
		if (t.lods && (on(t, t.lods), !n)) throw RangeError(`lods need rigid or swaying, opaque parts without assembly motion: ${t.name}`);
		if (t.shadowLods && (on(t, t.shadowLods), !n)) throw RangeError(`shadowLods need rigid or swaying, opaque parts without assembly motion: ${t.name}`);
		let r = t.lods ?? [{
			geometry: t.geometry,
			error: 0
		}], i = t.crowd?.bounds ?? qe(t.geometry), a = {
			center: i.center,
			radius: i.radius + Math.max(...r.map((e) => e.error))
		}, o = t.shadowLods ? cn(t.shadowLods, e.length) : null;
		return {
			cullable: n,
			bounds: a,
			swayReach: mt.has(t.material.tag) ? gt : 0,
			...cn(r, e.length),
			shadowLevels: o
		};
	}
	levelDraw(e, t, n = e) {
		if (n.levelDraws[t]) return n.levelDraws[t];
		let r = this.context, i = n.levelGeometries[t], a = r.createVertexArray();
		r.bindVertexArray(a), this.bindGeometryAttributes(i, e.parts[0].material);
		let o = r.createBuffer();
		return this.buffers.push(o), r.bindBuffer(r.ARRAY_BUFFER, o), r.bufferData(r.ARRAY_BUFFER, e.instanceData.byteLength, r.DYNAMIC_DRAW), this.pointInstanceAttributes(), r.bindVertexArray(null), n.levelDraws[t] = {
			vertexArray: a,
			instanceBuffer: o,
			indexCount: i.indices.length
		}, n.levelDraws[t];
	}
	releaseLevelDraws(e, t) {
		for (let n of [e, e.shadowLevels]) if (n) {
			for (let e of n.levelDraws) e && (this.context.deleteVertexArray(e.vertexArray), t?.add(e.instanceBuffer));
			n.levelDraws = [];
		}
	}
	selectBatchInstances(e) {
		return !this.culling || !e.cullable ? null : $e(e.selection, {
			instanceData: e.instanceData,
			instanceCount: e.instanceCount,
			stride: H,
			bounds: e.bounds,
			margin: e.swayReach * Math.abs(this.windState.strength),
			levelErrors: e.levelErrors,
			planes: this.frustumPlanes,
			viewProjection: this.viewProjection,
			pixelsPerUnit: this.canvas.height / 2 * this.projection[5],
			pixelError: this.lodPixelError * (this.mirrorCulling?.lodScale ?? 1),
			belowHeight: this.mirrorCulling?.belowHeight,
			minimumPixelRadius: this.mirrorCulling?.minimumPixelRadius
		});
	}
	drawSelectedLevels(e, t, n = e) {
		let r = this.context, i = H;
		for (let a = 0; a < t.counts.length; a++) {
			let o = t.counts[a];
			if (o === 0) continue;
			let s = this.levelDraw(e, a, n);
			this.selectionScratch?.length >= o * i || (this.selectionScratch = new Float32Array(o * i));
			for (let n = 0; n < o; n++) {
				let r = t.indices[a][n];
				this.selectionScratch.set(e.instanceData.subarray(r * i, (r + 1) * i), n * i);
			}
			r.bindBuffer(r.ARRAY_BUFFER, s.instanceBuffer), r.bufferSubData(r.ARRAY_BUFFER, 0, this.selectionScratch, 0, o * i), r.bindVertexArray(s.vertexArray), r.drawElementsInstanced(r.TRIANGLES, s.indexCount, r.UNSIGNED_INT, 0, o);
		}
	}
	uploadBatchData(e, t) {
		let n = this.context, r = e[0].geometry;
		n.bindVertexArray(t), this.bindGeometryAttributes(r, e[0].material);
		let i = H, o = new Float32Array(e.length * i), s = v();
		e.forEach((e, t) => {
			_(s, e.matrix), nn(o, t, e, s);
		});
		let c = this.uploadBuffer(n.ARRAY_BUFFER, o, n.DYNAMIC_DRAW);
		this.pointInstanceAttributes(), n.bindVertexArray(null);
		let l = e[0].material.map ?? null, u = Bt(e[0].material), d = u.slice(0, 5).map((e) => this.createTexture(e)), f = e[0].material.layers ? a().createResources(this, e[0].material, a()) : null, p = u[14] ? this.createTexture(u[14]) : null;
		if (p && (e[0].skin || e[0].morph || !r.lightUvs)) throw Error("A light map needs lightUvs on rigid geometry, with no skin or morph.");
		let m = e[0].skin ?? null, h = m ? this.createSkinTexture(this.skinTextures, m, m.jointMatrices, 4) : null, g = m ? this.createSkinTexture(this.influenceTextures, r, null, 2) : null, y = e[0].crowd ?? null, b = y ? this.createSkinTexture(this.skinTextures, y, y.data, 4) : null, x = e[0].morph ?? null, S = x ? this.createMorphTexture(r, x) : null, C = x ? new Float32Array(x.weights) : null, [w, T, E, ee] = X(e[0].material), D = B(e[0].material), O = this.createCullingState(e), k = {
			...O,
			alphaMode: w,
			alphaCutoff: T,
			opacity: E,
			doubleSided: ee,
			mirrored: tn(e[0].matrix),
			layerState: D,
			parts: [...e],
			vertexArray: t,
			instanceBuffer: c,
			instanceData: o,
			textures: d,
			mapState: u,
			splat: f,
			lightMapTexture: p,
			texture: d[0],
			map: l,
			skin: m,
			skinTexture: h,
			influenceTexture: g,
			crowd: y,
			crowdTexture: b,
			morph: x,
			morphTexture: S,
			morphWeights: C,
			indexCount: r.indices.length,
			instanceCount: e.length,
			floor: e[0].material.tag === "floor",
			castShadow: Wt(e[0]),
			receivesShadow: Gt(e[0]),
			compositeMode: Kt(e[0]),
			depthLayer: R(e[0]),
			pass: q(e[0].material)
		};
		return e[0].lods && O.levelGeometries.forEach((e, t) => this.levelDraw(k, t)), O.shadowLevels?.levelGeometries.forEach((e, t) => this.levelDraw(k, t, k.shadowLevels)), e.forEach((e, t) => this.partLocations.set(e, {
			batch: k,
			index: t,
			geometry: e.geometry,
			map: l,
			mapState: u,
			layerState: D,
			skin: m,
			jointMatrices: m?.jointMatrices,
			skinIndices: r.skinIndices,
			skinWeights: r.skinWeights,
			morph: x,
			morphWeights: x?.weights,
			morphTargets: r.morphTargets,
			normalMatrix: v(),
			committedMatrix: k.instanceData.subarray(t * H, t * H + 16)
		})), k;
	}
	replaceParts(t, { regroupOnly: n = !1 } = {}) {
		if (!Array.isArray(t) || new Set(t).size !== t.length) throw TypeError("Scene parts must be an array with distinct object identities.");
		let r = this.groundPart ? [...t, this.groundPart] : t, i = pn(r, this.batching), a = new Set(r.flatMap(sn));
		for (let e of a) this.geometryBuffers.has(e) || bn(e);
		let o = /* @__PURE__ */ new Set(), s = i.map((e) => {
			let t = e[0], n = this.partLocations.get(t), r = n?.batch, i = Bt(t.material), a = r?.parts.length === e.length && r.parts.every((t, n) => t === e[n]), s = X(t.material), c = n?.geometry === t.geometry && r?.castShadow === Wt(t) && r.receivesShadow === Gt(t) && r.compositeMode === Kt(t) && (r.depthLayer ?? 0) === R(t) && r.floor === (t.material.tag === "floor") && J(r) === q(t.material) && [
				r.alphaMode,
				r.alphaCutoff,
				r.opacity,
				r.doubleSided
			].every((e, t) => e === s[t]) && r.mapState.every((e, t) => e === i[t]) && r.layerState.every((e, n) => e === B(t.material)[n]);
			return a && c ? (o.add(r), {
				group: e,
				batch: r
			}) : {
				group: e,
				batch: null
			};
		});
		for (let t of s) if (!t.batch && t.group.some((t) => Tt(t, n || !!e.begin))) throw Error("replaceParts can add or change only rigid, untextured parts. Keep textured, skinned and morphed parts unchanged, or import replace-textured-parts to add textured ones.");
		for (let [t, r] of this.partLocations) if (!o.has(r.batch) && (r.skin || r.morph || r.morphTargets || r.skinIndices || r.mapState.slice(0, 5).some(Boolean) && !e.begin && !n)) throw Error(`replaceParts can remove or regroup only existing rigid, untextured parts; ${t.name} is textured, skinned or morphed and needs a new renderer.`);
		let c = [...a].filter((e) => !this.geometryBuffers.has(e)).reduce((e, t) => e + yn(t), 0), l = s.filter((e) => !e.batch).reduce((e, t) => e + t.group.length * H * 4, 0), u = P(this.canvas.width, this.canvas.height, this.samples, 2048, {
			hdr: this.hdr,
			bloom: !this.benchmark,
			depth: this.depth
		});
		if (u + this.textureBytes + this.geometryBytes + c + l > this.memoryBudgetMiB * 1024 * 1024) throw ne(this.geometryBytes + c + l, this.textureBytes, u, this.memoryBudgetMiB);
		let d = this.partLocations, f = [...this.buffers], p = this.geometryBytes, m = new Map(this.geometryBuffers), h = e.begin?.(this), g = /* @__PURE__ */ new Map(), _ = [];
		this.partLocations = g;
		try {
			for (let e of s) if (e.batch) {
				_.push(e.batch);
				for (let t of e.group) g.set(t, d.get(t));
			} else _.push(this.uploadBatch(e.group));
			let e = this.context.getError();
			if (e !== 0) throw Error(`WebGL replacement allocation failed with error ${e}.`);
		} catch (e) {
			for (let e of _) o.has(e) || (this.context.deleteVertexArray(e.vertexArray), this.releaseLevelDraws(e));
			for (let e of this.buffers.slice(f.length)) this.context.deleteBuffer(e);
			throw this.context.bindVertexArray(null), this.buffers = f, this.geometryBytes = p, this.geometryBuffers = m, h?.(), this.partLocations = d, e;
		}
		let v = /* @__PURE__ */ new Set();
		for (let e of this.batches) o.has(e) || (this.context.deleteVertexArray(e.vertexArray), v.add(e.instanceBuffer), this.releaseLevelDraws(e, v));
		for (let [e, t] of this.geometryBuffers) if (!a.has(e)) {
			for (let e of t.values()) v.add(e);
			this.geometryBuffers.delete(e);
		}
		for (let e of v) this.context.deleteBuffer(e);
		return this.buffers = this.buffers.filter((e) => !v.has(e)), h?.(this.batches, _), this.geometryBytes = [...a].reduce((e, t) => e + yn(t), 0) + r.length * H * 4, this.batches = _, this.partCount = t.length, this.triangles = t.reduce((e, t) => e + t.geometry.indices.length / 3, 0), this.updateBatches.clear(), this.shadowsDirty = !0, this.updateParts(r), t.length;
	}
	createSkinTexture(e, t, n, r) {
		if (e.has(t)) return e.get(t);
		let i = this.context, a = n ? n.length / 4 : t.positions.length / 3 * 2, o = Q().skinTextureLayout(a, i.getParameter(i.MAX_TEXTURE_SIZE), r), s = n ? new Float32Array(o.width * o.height * 4) : Q().packSkinInfluences(t, o);
		n && s.set(n);
		let c = this.createPackedTexture(o, s);
		return c.pose = n ? t : null, e.set(t, c), c;
	}
	createMorphTexture(e, t) {
		if (this.morphTextures.has(e)) return this.morphTextures.get(e);
		let n = $().validateMorphGeometry(e, t), r = $().skinTextureLayout(n.vertexCount * n.targetCount * 2, this.context.getParameter(this.context.MAX_TEXTURE_SIZE), 2), i = this.createPackedTexture(r, $().packMorphTargets(e, r));
		return i.info = n, this.morphTextures.set(e, i), i;
	}
	createPackedTexture(e, t) {
		let n = this.context, r = n.createTexture();
		n.bindTexture(n.TEXTURE_2D, r);
		try {
			n.texImage2D(n.TEXTURE_2D, 0, n.RGBA32F, e.width, e.height, 0, n.RGBA, n.FLOAT, t), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE);
		} catch (e) {
			throw n.deleteTexture(r), e;
		}
		return {
			...e,
			texture: r,
			data: t
		};
	}
	updateParts(e, { shadows: t = !0, checks: n = !0 } = {}) {
		if (typeof n != "boolean") throw TypeError("updateParts checks must be a boolean.");
		this.updatePartIdentities ??= /* @__PURE__ */ new Set(), this.updatePartIdentities.clear(), this.updateSkins.clear(), this.updateMorphs ??= /* @__PURE__ */ new Set(), this.updateMorphs.clear(), this.updateBatches.clear();
		let r = this.updateLocations ??= [];
		r.length = e.length;
		let i = !1;
		for (let t = 0; t < e.length; t++) {
			let a = e[t], o = this.partLocations.get(a);
			if (!o) throw Error(`Unknown part identity: ${a.name}`);
			if (r[t] = o, (a.skin || a.morph) && this.updatePartIdentities.add(a), Jt(a), Wt(a) !== o.batch.castShadow) throw Error(`Shadow casting changes require a new renderer: ${a.name}`);
			if (Gt(a) !== o.batch.receivesShadow || Kt(a) !== o.batch.compositeMode) throw Error(`receiveShadow, holdout and shadowCatcher changes require replaceParts: ${a.name}`);
			if (R(a) !== (o.batch.depthLayer ?? 0)) throw Error(`depthLayer changes require replaceParts: ${a.name}`);
			let s = o.materialSnapshot?.matches(a.material) === !0;
			if (!s) {
				let e = X(a.material), t = [
					o.batch.alphaMode,
					o.batch.alphaCutoff,
					o.batch.opacity,
					o.batch.doubleSided
				];
				if (e.some((e, n) => e !== t[n])) throw Error(`Alpha mode, cutoff, double-sided and mask opacity changes require a new renderer (blend and add opacity may change): ${a.name}`);
			}
			if (a.geometry !== o.geometry) throw Error(`Geometry changes require a new renderer: ${a.name}`);
			if (tn(a.matrix) !== !!o.batch.mirrored && (i = !0), !s && q(a.material) !== J(o.batch)) throw Error(`Moving a part into or out of the liquid or foam pass requires replaceParts: ${a.name}`);
			if ((a.skin ?? null) !== o.skin || a.skin?.jointMatrices !== o.jointMatrices || a.geometry.skinIndices !== o.skinIndices || a.geometry.skinWeights !== o.skinWeights) throw Error(`Skin identity changes require a new renderer: ${a.name}`);
			if (a.skin) {
				if (K.has(a.material.tag)) throw Error("Skinned parts require a standard material tag.");
				n && Q().validateSkinPose(a.skin, a.geometry, a.matrix), this.updateSkins.add(o.batch.skinTexture);
			}
			if ((a.morph ?? null) !== (o.morph ?? null) || a.morph?.weights !== o.morphWeights || a.geometry.morphTargets !== o.morphTargets) throw Error(`Morph identity changes require a new renderer: ${a.name}`);
			if (a.morph) {
				if (K.has(a.material.tag)) throw Error("Morphed parts require a standard material tag.");
				n && $().validateMorphTransform(a.morph, o.batch.morphTexture.info, a.matrix, a.skin), this.updateMorphs.add(a.morph);
			}
			if (s) {
				$t(a, o.normalMatrix);
				continue;
			}
			if ((a.material.map ?? null) !== o.map) throw Error(`Texture map changes require a new renderer: ${a.name}`);
			It(a.material);
			let c = a.material.normalScale ?? ft, l = o.mapState;
			for (let e = 0; e < G.length; e++) if ((a.material[G[e]] ?? null) !== l[e]) throw Error(`Material map or scale changes require a new renderer: ${a.name}`);
			let [u, d] = Vt(a.material);
			if (u !== (l[14] ?? null) || d !== (l[15] ?? 0) || (a.material.layerMaps ?? null) !== (l[18] ?? null)) throw Error(`Light map and layer texture changes require a new renderer: ${a.name}`);
			if (c[0] !== l[5] || c[1] !== l[6] || (a.material.occlusionStrength ?? 1) !== l[7] || zt(a.material).some((e, t) => e !== l[8 + t]) || B(a.material).some((e, t) => e !== o.layerState[t])) throw Error(`Material map or scale changes require a new renderer: ${a.name}`);
			$t(a, o.normalMatrix), o.materialSnapshot = Ue.of(a.material);
		}
		if (i) return this.replaceParts([...this.partLocations.keys()].filter((e) => e !== this.groundPart), { regroupOnly: !0 }), e.length;
		if (n && this.updateSkins.size) for (let [e, t] of this.partLocations) {
			if (!t.skin || !this.updateSkins.has(t.batch.skinTexture) || this.updatePartIdentities.has(e)) continue;
			let n = t.committedMatrix ?? t.batch.instanceData.subarray(t.index * H, t.index * H + 16);
			Q().validateSkinPose(t.skin, t.geometry, n);
		}
		if (n && (this.updateMorphs.size || this.updateSkins.size)) for (let [e, t] of this.partLocations) {
			if (!t.morph || this.updatePartIdentities.has(e) || !this.updateMorphs.has(t.morph) && !this.updateSkins.has(t.batch.skinTexture)) continue;
			let n = t.committedMatrix ?? t.batch.instanceData.subarray(t.index * H, t.index * H + 16);
			$().validateMorphTransform(t.morph, t.batch.morphTexture.info, n, t.skin);
		}
		this.updateBatches.clear();
		for (let t = 0; t < e.length; t++) {
			let n = e[t], i = r[t];
			St.has(n.material.tag) && !this.shaderFeatures?.has(n.material.tag) && this.requireShaderFeatures([n]), nn(i.batch.instanceData, i.index, n, i.normalMatrix), this.updateBatches.add(i.batch);
		}
		for (let e of this.updateBatches) this.context.bindBuffer(this.context.ARRAY_BUFFER, e.instanceBuffer), this.context.bufferSubData(this.context.ARRAY_BUFFER, 0, e.instanceData);
		for (let e of this.updateSkins) {
			let t = e.pose;
			e.data.set(t.jointMatrices), this.context.bindTexture(this.context.TEXTURE_2D, e.texture), this.context.texSubImage2D(this.context.TEXTURE_2D, 0, 0, 0, e.width, e.height, this.context.RGBA, this.context.FLOAT, e.data);
		}
		for (let e of this.batches ?? []) e.morph && this.updateMorphs.has(e.morph) && e.morphWeights.set(e.morph.weights);
		return t && e.length > 0 && (this.shadowsDirty = !0), e.length;
	}
	attribute(e, t, n, r) {
		this.context.enableVertexAttribArray(e), this.context.vertexAttribPointer(e, t, this.context.FLOAT, !1, n, r), this.context.vertexAttribDivisor(e, 1);
	}
	shadowMapSizeWanted() {
		return this.batches.some((e) => !e.floor && e.castShadow) && !this.shadowCascades?.replacesSingleMap(this) ? at : 1;
	}
	createShadowMap() {
		let e = this.context, t = this.shadowMapSizeWanted();
		if (this.shadowTexture ??= e.createTexture(), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, this.shadowTexture), t !== this.shadowMapSize && (this.shadowMapSize = t, e.texImage2D(e.TEXTURE_2D, 0, e.DEPTH_COMPONENT24, t, t, 0, e.DEPTH_COMPONENT, e.UNSIGNED_INT, null), this.renderTargets.record("shadowMap", {
			width: t,
			height: t,
			format: "DEPTH_COMPONENT24"
		})), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_COMPARE_MODE, e.COMPARE_REF_TO_TEXTURE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), this.shadowFramebuffer ||= e.createFramebuffer(), e.bindFramebuffer(e.FRAMEBUFFER, this.shadowFramebuffer), e.framebufferTexture2D(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.TEXTURE_2D, this.shadowTexture, 0), e.drawBuffers([e.NONE]), e.readBuffer(e.NONE), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("Shadow framebuffer is incomplete.");
		let n = L(this.world, this.activeLightDirection, this.shadowBounds), r = m(h(), n.eye, n.target, n.up ?? [
			0,
			1,
			0
		]);
		f(this.lightProjection, -n.extent, n.extent, -n.extent, n.extent, n.near, n.far), p(this.lightProjection, this.lightProjection, r), e.viewport(0, 0, t, t), e.enable(e.DEPTH_TEST), e.enable(e.CULL_FACE), e.clear(e.DEPTH_BUFFER_BIT), this.shadowBiasPerSlope = oe(n, at), this.drawShadowCasters(this.lightProjection, t), e.bindFramebuffer(e.FRAMEBUFFER, null), this.shadowsDirty = !1;
	}
	selectShadowInstances(e, t, n, r) {
		if (!this.culling || !e.cullable) return null;
		let i = Je(n, this.shadowFrustumPlanes ??= /* @__PURE__ */ new Float32Array(24)), a = n[3] === 0 && n[7] === 0 && n[11] === 0 && n[15] === 1, o = !!r && a && t.levelErrors.length > 1, s = o ? Math.hypot(n[0], n[4], n[8]) * r / 2 : 0;
		return $e(t.selection, {
			instanceData: e.instanceData,
			instanceCount: e.instanceCount,
			stride: H,
			bounds: e.bounds,
			margin: e.swayReach * Math.abs(this.windState.strength),
			levelErrors: o ? t.levelErrors : [0],
			planes: i,
			viewProjection: n,
			pixelsPerUnit: s,
			pixelError: this.lodPixelError
		});
	}
	drawShadowCasters(e = this.lightProjection, t = null) {
		let n = this.context;
		n.useProgram(this.depthProgram), n.uniformMatrix4fv(this.depthUniform, !1, e), n.uniform1f(this.depthAssemblyUniform, this.assemblyAmount ?? 0), n.uniform1f(this.depthWindUniforms.time, this.windState.time), n.uniform1f(this.depthWindUniforms.wind, this.windState.strength), n.uniform1i(this.depthAlphaUniforms.baseMap, 1), n.enable(n.POLYGON_OFFSET_FILL), n.polygonOffset(1, 1);
		for (let n of this.batches) {
			if (n.floor || !n.castShadow) continue;
			let r = n.shadowLevels ?? n, i = this.selectShadowInstances(n, r, e, t);
			i?.visibleCount !== 0 && (this.applyAlphaState(n, !1), this.drawBatch(n, !1, i, r));
		}
		n.disable(n.POLYGON_OFFSET_FILL), n.enable(n.CULL_FACE);
	}
	allocateLocalShadowAtlas(e) {
		let t = this.context;
		if (this.localShadowTexture && t.deleteTexture(this.localShadowTexture), this.localShadowFramebuffer && t.deleteFramebuffer(this.localShadowFramebuffer), this.localShadowAtlasHeight = Math.ceil(e / 4) * 512, this.localShadowTexture = t.createTexture(), t.activeTexture(t.TEXTURE0 + Nt), t.bindTexture(t.TEXTURE_2D, this.localShadowTexture), t.texImage2D(t.TEXTURE_2D, 0, t.DEPTH_COMPONENT24, V, this.localShadowAtlasHeight, 0, t.DEPTH_COMPONENT, t.UNSIGNED_INT, null), this.renderTargets.record("localShadowAtlas", {
			width: V,
			height: this.localShadowAtlasHeight,
			format: "DEPTH_COMPONENT24"
		}), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), this.localShadowFramebuffer = t.createFramebuffer(), t.bindFramebuffer(t.FRAMEBUFFER, this.localShadowFramebuffer), t.framebufferTexture2D(t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.TEXTURE_2D, this.localShadowTexture, 0), t.drawBuffers([t.NONE]), t.readBuffer(t.NONE), t.checkFramebufferStatus(t.FRAMEBUFFER) !== t.FRAMEBUFFER_COMPLETE) throw Error("Local shadow framebuffer is incomplete.");
		t.activeTexture(t.TEXTURE0);
	}
	updateLocalShadows(e) {
		let t = this.lighting.shadowCasters;
		if (t.length === 0 || this.benchmark) return;
		let n = this.localShadowMatrices ??= /* @__PURE__ */ new Float32Array(384), r = this.localShadowTexelAngles ??= /* @__PURE__ */ new Float32Array(24), i = this.localShadowPreviousMatrices ??= /* @__PURE__ */ new Float32Array(384), a = /* @__PURE__ */ new Float32Array(16);
		if (t.forEach((e, t) => {
			r[t] = Be(e, a), n.set(a, t * 16);
		}), !(t.length !== this.localShadowTileCount || n.some((e, t) => e !== i[t])) && !e && this.localShadowTexture) return;
		i.set(n), this.localShadowTileCount = t.length;
		let o = this.context;
		(!this.localShadowTexture || Math.ceil(t.length / 4) * 512 > this.localShadowAtlasHeight) && this.allocateLocalShadowAtlas(t.length), o.bindFramebuffer(o.FRAMEBUFFER, this.localShadowFramebuffer), o.viewport(0, 0, V, this.localShadowAtlasHeight), o.enable(o.DEPTH_TEST), o.clear(o.DEPTH_BUFFER_BIT);
		for (let e = 0; e < t.length; e++) o.viewport(...Ve(e)), this.drawShadowCasters(n.subarray(e * 16, e * 16 + 16));
		o.bindFramebuffer(o.FRAMEBUFFER, null);
	}
	updateWindState(e) {
		let t = {
			time: e.time ?? 0,
			strength: e.wind ?? .3
		}, n = this.windState;
		return this.windState = t, n.time === t.time && n.strength === t.strength ? !1 : this.batches.some((e) => e.castShadow && mt.has(e.parts[0].material.tag));
	}
	resize() {
		let e = te({
			width: Math.max(1, this.canvas.clientWidth),
			height: Math.max(1, this.canvas.clientHeight),
			pixelRatio: this.pixelRatio,
			samples: this.samples,
			memoryBudgetMiB: this.memoryBudgetMiB,
			geometryBytes: this.geometryBytes,
			textureBytes: this.textureBytes,
			hdr: this.hdr,
			bloom: !this.benchmark,
			depth: this.depth,
			maximumSize: Math.min(this.context.getParameter(this.context.MAX_RENDERBUFFER_SIZE), this.context.getParameter(this.context.MAX_TEXTURE_SIZE))
		}), { width: t, height: n } = e;
		this.memoryPlan = e, (this.canvas.width !== t || this.canvas.height !== n) && (this.canvas.width = t, this.canvas.height = n, this.benchmark || this.allocateFrameTargets(t, n)), d(this.projection, this.world ? Math.PI / 4 : Math.PI / 5.5, t / n, .1, this.world ? 600 : 100);
	}
	memoryReport() {
		return this.renderTargets.report();
	}
	releaseFrameTargets() {
		let e = this.context;
		this.multisampleFramebuffer && e.deleteFramebuffer(this.multisampleFramebuffer), this.resolveFramebuffer && e.deleteFramebuffer(this.resolveFramebuffer), this.multisampleColor && e.deleteRenderbuffer(this.multisampleColor), this.multisampleDepth && e.deleteRenderbuffer(this.multisampleDepth), this.frameTexture && e.deleteTexture(this.frameTexture), this.depthTexture && e.deleteTexture(this.depthTexture);
		for (let t of this.bloomTargets ?? []) e.deleteTexture(t.texture), e.deleteFramebuffer(t.framebuffer);
		this.bloomTargets = [], this.renderTargets.release("multisampleColor", "multisampleDepth", "frameColor", "sceneDepth", "bloomA", "bloomB"), this.releaseOcclusionTarget(), this.passSupport?.releaseTargets(e);
		for (let t of this.postStages ?? []) t.releaseTargets(e);
		this.multisampleFramebuffer = null, this.resolveFramebuffer = null, this.multisampleColor = null, this.multisampleDepth = null, this.frameTexture = null, this.depthTexture = null;
	}
	releaseOcclusionTarget() {
		this.occlusionTarget &&= (this.context.deleteTexture(this.occlusionTarget.texture), this.context.deleteFramebuffer(this.occlusionTarget.framebuffer), this.renderTargets.release("ambientOcclusion"), null);
	}
	drawsInOpaqueLoop(e) {
		return J(e) === "opaque" && !U(e.alphaMode);
	}
	ensureOcclusionTarget() {
		let e = this.context;
		if (!this.occlusionProgram) {
			this.occlusionProgram = N(e, M, Se);
			let t = [
				"sceneDepth",
				"inverseViewProjection",
				"eye",
				"radius",
				"projectionScale",
				"aspect",
				"orthographic"
			];
			this.occlusionUniforms = Object.fromEntries(t.map((t) => [t, e.getUniformLocation(this.occlusionProgram, t)]));
		}
		if (this.occlusionTarget) return;
		let t = Math.max(1, Math.ceil(this.canvas.width / 2)), n = Math.max(1, Math.ceil(this.canvas.height / 2)), r = e.createTexture();
		e.bindTexture(e.TEXTURE_2D, r), e.texImage2D(e.TEXTURE_2D, 0, e.R8, t, n, 0, e.RED, e.UNSIGNED_BYTE, null), this.renderTargets.record("ambientOcclusion", {
			width: t,
			height: n,
			format: "R8"
		}), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE);
		let i = e.createFramebuffer();
		e.bindFramebuffer(e.FRAMEBUFFER, i), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, r, 0), this.occlusionTarget = {
			texture: r,
			framebuffer: i,
			width: t,
			height: n
		};
	}
	drawAmbientOcclusion(e, t) {
		let n = this.context;
		this.ensureOcclusionTarget();
		let r = this.occlusionUniforms;
		n.bindFramebuffer(n.FRAMEBUFFER, this.occlusionTarget.framebuffer), n.viewport(0, 0, this.occlusionTarget.width, this.occlusionTarget.height), n.disable(n.DEPTH_TEST), n.disable(n.CULL_FACE), n.bindVertexArray(null), n.useProgram(this.occlusionProgram), n.activeTexture(n.TEXTURE1), n.bindTexture(n.TEXTURE_2D, this.depthTexture), n.uniform1i(r.sceneDepth, 1), n.uniformMatrix4fv(r.inverseViewProjection, !1, this.inverseViewProjection), n.uniform3fv(r.eye, e.eye), n.uniform1f(r.radius, t.ambientOcclusionRadius), n.uniform1f(r.projectionScale, .5 * this.projection[5]), n.uniform1f(r.aspect, this.canvas.width / this.canvas.height), n.uniform1f(r.orthographic, +(e.projection === "orthographic")), n.drawArrays(n.TRIANGLES, 0, 3);
	}
	allocateFrameTargets(e, t) {
		let n = this.context;
		this.releaseFrameTargets(), this.multisampleFramebuffer = n.createFramebuffer(), n.bindFramebuffer(n.FRAMEBUFFER, this.multisampleFramebuffer), this.multisampleColor = n.createRenderbuffer(), n.bindRenderbuffer(n.RENDERBUFFER, this.multisampleColor), n.renderbufferStorageMultisample(n.RENDERBUFFER, this.multisampleSamples, this.hdr ? n.RGBA16F : n.RGBA8, e, t), n.framebufferRenderbuffer(n.FRAMEBUFFER, n.COLOR_ATTACHMENT0, n.RENDERBUFFER, this.multisampleColor), this.multisampleDepth = n.createRenderbuffer(), n.bindRenderbuffer(n.RENDERBUFFER, this.multisampleDepth);
		let r = this.depth ? "DEPTH_COMPONENT24" : "DEPTH_COMPONENT16";
		if (n.renderbufferStorageMultisample(n.RENDERBUFFER, this.multisampleSamples, n[r], e, t), n.framebufferRenderbuffer(n.FRAMEBUFFER, n.DEPTH_ATTACHMENT, n.RENDERBUFFER, this.multisampleDepth), n.checkFramebufferStatus(n.FRAMEBUFFER) !== n.FRAMEBUFFER_COMPLETE) throw Error("Multisample framebuffer allocation failed. Choose a lower quality preset.");
		if (this.renderTargets.record("multisampleColor", {
			width: e,
			height: t,
			format: this.hdr ? "RGBA16F" : "RGBA8",
			samples: this.multisampleSamples
		}), this.renderTargets.record("multisampleDepth", {
			width: e,
			height: t,
			format: r,
			samples: this.multisampleSamples
		}), this.renderTargets.record("frameColor", {
			width: e,
			height: t,
			format: this.hdr ? "RGBA16F" : "RGBA8"
		}), this.frameTexture = n.createTexture(), n.bindTexture(n.TEXTURE_2D, this.frameTexture), n.texImage2D(n.TEXTURE_2D, 0, this.hdr ? n.RGBA16F : n.RGBA8, e, t, 0, n.RGBA, this.hdr ? n.HALF_FLOAT : n.UNSIGNED_BYTE, null), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE), this.resolveFramebuffer = n.createFramebuffer(), n.bindFramebuffer(n.FRAMEBUFFER, this.resolveFramebuffer), n.framebufferTexture2D(n.FRAMEBUFFER, n.COLOR_ATTACHMENT0, n.TEXTURE_2D, this.frameTexture, 0), this.depth && (this.depthTexture = n.createTexture(), n.bindTexture(n.TEXTURE_2D, this.depthTexture), n.texImage2D(n.TEXTURE_2D, 0, n.DEPTH_COMPONENT24, e, t, 0, n.DEPTH_COMPONENT, n.UNSIGNED_INT, null), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE), n.framebufferTexture2D(n.FRAMEBUFFER, n.DEPTH_ATTACHMENT, n.TEXTURE_2D, this.depthTexture, 0), this.renderTargets.record("sceneDepth", {
			width: e,
			height: t,
			format: "DEPTH_COMPONENT24"
		})), n.checkFramebufferStatus(n.FRAMEBUFFER) !== n.FRAMEBUFFER_COMPLETE) throw Error("Resolve framebuffer allocation failed. Choose a lower quality preset.");
		this.bloomWidth = Math.max(1, Math.ceil(e / 2)), this.bloomHeight = Math.max(1, Math.ceil(t / 2)), n.bindFramebuffer(n.FRAMEBUFFER, null);
	}
	startEnvironmentPrograms() {
		this.pendingEnvironmentPrograms = /* @__PURE__ */ new Map();
		for (let e of [z().prefilterFragment, z().brdfFragment]) this.pendingEnvironmentPrograms.set(e, A(this.context, M, e));
	}
	compileEnvironmentProgram(e, t, n) {
		let r = this.pendingEnvironmentPrograms?.get(n);
		return r ? (this.pendingEnvironmentPrograms.delete(n), j(e, r)) : N(e, t, n);
	}
	initializeEnvironment(e) {
		let t = this.context;
		t.useProgram(this.program), t.uniform1i(this.uniforms.environmentSpecular, Y), t.uniform1i(this.uniforms.environmentBrdf, Mt), this.liquidProgram && (t.useProgram(this.liquidProgram), t.uniform1i(this.liquidUniforms.environmentSpecular, Y)), this.bindEnvironmentTextures(this.whiteTexture, this.whiteTexture), !this.benchmark && e && this.prepareEnvironment(e);
	}
	bindEnvironmentTextures(e, t) {
		let n = this.context;
		n.activeTexture(n.TEXTURE0 + Y), n.bindTexture(n.TEXTURE_2D, e), n.activeTexture(n.TEXTURE0 + Mt), n.bindTexture(n.TEXTURE_2D, t);
	}
	prepareEnvironment(e) {
		if (z().assertMap(e), this.environmentResources?.data === e.data && this.environmentResources.irradianceSource === e.irradianceSource) return !1;
		z().estimateBytes(e, this.capabilities.maximumTextureSize);
		let t = z().createResources(this.context, e, {
			compileProgram: (e, t, n) => this.compileEnvironmentProgram(e, t, n),
			fullscreenVertex: M
		});
		return this.environmentResources?.dispose(), this.environmentResources = t, this.textureBytes += t.bytes - this.environmentBytes, this.environmentBytes = t.bytes, !0;
	}
	activateEnvironment(e) {
		return this.activeMap = this.benchmark ? null : e, this.benchmark || !e ? (this.bindEnvironmentTextures(this.whiteTexture, this.whiteTexture), null) : (this.prepareEnvironment(e) && this.resize(), this.bindEnvironmentTextures(this.environmentResources.specularTexture, this.environmentResources.brdfTexture), e);
	}
	applyEnvironmentUniforms(e, t = this.uniforms) {
		let n = this.context;
		n.uniform1f(t.environmentEnabled, +!!e), e && (t["environmentIrradiance[0]"] && n.uniform3fv(t["environmentIrradiance[0]"], e.irradianceWithBounce?.(this.environmentResources.irradiance) ?? this.environmentResources.irradiance), n.uniform1f(t.environmentIntensity, e.intensity), n.uniform2f(t.environmentRotation, Math.cos(e.rotation), Math.sin(e.rotation)), n.uniform1f(t.environmentLevelMax, this.environmentResources.levelCount - 1));
	}
	drawEnvironmentBackground(e, t, n) {
		if (!e?.showBackground || this.transparent) return !1;
		let r = this.context;
		if (!this.environmentBackgroundProgram) {
			this.environmentBackgroundProgram = N(r, M, this.withViewTransform(z().backgroundFragment, "background"));
			let e = [
				"inverseViewProjection",
				"eye",
				"backgroundLevel",
				"exposure",
				"hdrEnabled",
				"environmentSpecular",
				"environmentRotation",
				"environmentIntensity",
				"environmentLevelMax"
			];
			this.environmentBackgroundUniforms = Object.fromEntries(e.map((e) => [e, r.getUniformLocation(this.environmentBackgroundProgram, e)]));
		}
		let i = this.environmentBackgroundUniforms, a = this.environmentResources.levelCount - 1;
		return r.disable(r.DEPTH_TEST), r.disable(r.CULL_FACE), r.bindVertexArray(null), r.useProgram(this.environmentBackgroundProgram), r.uniformMatrix4fv(i.inverseViewProjection, !1, this.inverseViewProjection), r.uniform3fv(i.eye, t.eye), r.uniform1f(i.backgroundLevel, e.backgroundBlur * a), r.uniform1f(i.exposure, n), r.uniform1f(i.hdrEnabled, +!!this.hdr), r.uniform1i(i.environmentSpecular, Y), r.uniform2f(i.environmentRotation, Math.cos(e.rotation), Math.sin(e.rotation)), r.uniform1f(i.environmentIntensity, e.intensity), r.uniform1f(i.environmentLevelMax, a), r.drawArrays(r.TRIANGLES, 0, 3), !0;
	}
	drawSky(e) {
		let t = this.context, n = {
			skyTop: [
				.2,
				.38,
				.52
			],
			skyBottom: [
				.62,
				.7,
				.67
			],
			lightDirection: [
				-3,
				6,
				4
			],
			daylight: 1,
			...this.environment,
			...e.environment
		};
		t.disable(t.DEPTH_TEST), t.disable(t.CULL_FACE), t.bindVertexArray(null), t.useProgram(this.skyProgram), t.uniform3fv(this.skyUniforms.skyTop, n.skyTop), t.uniform3fv(this.skyUniforms.skyBottom, n.skyBottom), t.uniform3fv(this.skyUniforms.sunDirection, n.lightDirection), t.uniformMatrix4fv(this.skyUniforms.inverseViewProjection, !1, this.inverseViewProjection), t.uniform3fv(this.skyUniforms.eye, e.eye), t.uniform1f(this.skyUniforms.time, e.time ?? 0), t.uniform1f(this.skyUniforms.daylight, n.daylight), t.uniform1f(this.skyUniforms.hdrEnabled, +!!this.hdr), t.drawArrays(t.TRIANGLES, 0, 3);
	}
	postStepsOf(e, t, n, r, i) {
		let a = [];
		return this.transparent && a.push("transparent"), r && a.push("occlusion"), t.bloom.strength > 0 && a.push("bloom"), n.density > 0 && a.push("volume"), n.density > 0 && n.field && a.push("field"), n.density > 0 && c("volumeFog").support.usesDetail(n) && a.push("detail"), n.density > 0 && this.fogLightBuffers?.count > 0 && a.push("lights"), i && a.push("sky"), e.volumeExplosion && a.push("explosion"), (t.saturation !== 1 || t.contrast !== 1 || t.temperature !== 0 || (e.monochrome ?? 0) !== 0 || e.cinematic || t.vignette !== 0 || t.grain !== 0) && a.push("finish"), a;
	}
	selectPostProgram(e) {
		if (e.join() === he.join()) return {
			program: this.postProgram,
			uniforms: this.postUniforms
		};
		let t = e.join(","), n = this.postVariants.get(t);
		if (n || (n = { pending: A(this.context, M, this.withViewTransform(be(e), "post")) }, this.postVariants.set(t, n)), n.pending) {
			let t = this.context.getExtension("KHR_parallel_shader_compile");
			if (t && !me.some((t) => e.includes(t)) && !this.context.getProgramParameter(n.pending.program, t.COMPLETION_STATUS_KHR)) return {
				program: this.postProgram,
				uniforms: this.postUniforms
			};
			n.program = j(this.context, n.pending), n.uniforms = vt(this.context, n.program), n.pending = null;
		}
		return n;
	}
	restoreSingleLevelFiltering() {
		if (!this.mipmappedTexture) return;
		let e = this.context;
		e.bindTexture(e.TEXTURE_2D, this.mipmappedTexture), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), this.mipmappedTexture = null;
	}
	resolveFrame(e, t, n, r) {
		let i = this.context;
		i.bindFramebuffer(i.READ_FRAMEBUFFER, this.multisampleFramebuffer), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, this.resolveFramebuffer), i.blitFramebuffer(0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height, i.COLOR_BUFFER_BIT | (this.depth ? i.DEPTH_BUFFER_BIT : 0), i.NEAREST), this.restoreSingleLevelFiltering();
		let a = this.frameTexture;
		for (let n of this.postStages) a = n.apply(this, e, t, a) ?? a;
		t.bloom.strength > 0 && this.drawBloom(t.bloom, a);
		let o = t.ambientOcclusion > 0 && !!this.depthTexture;
		o && this.drawAmbientOcclusion(e, t), i.bindFramebuffer(i.FRAMEBUFFER, e.outputFramebuffer ?? null), i.viewport(0, 0, this.canvas.width, this.canvas.height), i.disable(i.DEPTH_TEST), i.disable(i.CULL_FACE), i.bindVertexArray(null);
		let s = this.fogSkyVisibility?.(this.sceneParts, r, i, n), l = r.density > 0 ? c("volumeFog").support : null;
		l ? l.packLights(this) : this.fogLightBuffers && (this.fogLightBuffers.count = 0);
		let d = this.selectPostProgram(this.postStepsOf(e, t, r, o, s));
		i.useProgram(d.program), this.look && u.bindLook(this, d.program), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, a), r.density > 0 ? (i.generateMipmap(i.TEXTURE_2D), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.LINEAR_MIPMAP_LINEAR), this.mipmappedTexture = a) : this.mipmappedTexture === a && (i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.LINEAR), this.mipmappedTexture = null), i.uniform1i(d.uniforms.frameTexture, 0), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, this.depthTexture ?? this.whiteTexture), i.uniform1i(d.uniforms.sceneDepth, 1), l?.bindUniforms(this, d, r, n, e), i.activeTexture(i.TEXTURE2), i.bindTexture(i.TEXTURE_2D, t.bloom.strength > 0 ? this.bloomTargets[1].texture : this.whiteTexture), i.uniform1i(d.uniforms.bloomTexture, 2), i.uniform1f(d.uniforms.bloomStrength, t.bloom.strength), i.activeTexture(i.TEXTURE4), i.bindTexture(i.TEXTURE_2D, o ? this.occlusionTarget.texture : this.whiteTexture), i.uniform1i(d.uniforms.occlusionTexture, 4), i.uniform1f(d.uniforms.occlusionStrength, o ? t.ambientOcclusion : 0), i.uniform2f(d.uniforms.occlusionTexel, 1 / Math.ceil(this.canvas.width / 2), 1 / Math.ceil(this.canvas.height / 2)), i.uniform1f(d.uniforms.transparent, +!!this.transparent), i.uniform1f(d.uniforms.hdrEnabled, +!!this.hdr), i.uniform3f(d.uniforms.grade, t.saturation, t.contrast, t.temperature), i.uniform1f(d.uniforms.vignette, t.vignette), i.uniform1f(d.uniforms.grainAmount, t.grain), i.uniform2f(d.uniforms.resolution, this.canvas.width, this.canvas.height), i.uniform1f(d.uniforms.monochrome, e.monochrome ?? 0), i.uniform1f(d.uniforms.fade, e.fade ?? 0), i.uniform1f(d.uniforms.cinematic, +!!e.cinematic), i.uniform1f(d.uniforms.time, e.time ?? 0), i.uniform1f(d.uniforms.volumeExplosion, +!!e.volumeExplosion), i.uniform1f(d.uniforms.explosionProgress, e.explosionProgress ?? 1), i.uniformMatrix4fv(d.uniforms.inverseViewProjection, !1, this.inverseViewProjection), i.uniform3fv(d.uniforms.eye, e.eye), i.drawArrays(i.TRIANGLES, 0, 3);
	}
	drawTranslucent(e, t, n, r) {
		this.activateEnvironment(r);
		let i = this.batches.filter((e) => J(e) === "liquid"), a = this.batches.filter((e) => J(e) === "foam");
		(i.length !== 0 || a.length !== 0) && x()(this, {
			frame: e,
			environment: t,
			assemblyAmount: n,
			environmentMap: r,
			liquids: i,
			foams: a,
			environmentSpecularUnit: Y,
			maximumDistance: ct,
			vertexSource: S,
			fragmentSource: k()
		});
	}
	ensureBloomTargets() {
		if (this.bloomTargets.length > 0) return;
		let e = this.context;
		for (let t = 0; t < 2; t++) {
			let t = e.createTexture(), n = e.createFramebuffer();
			if (this.bloomTargets.push({
				texture: t,
				framebuffer: n
			}), e.bindTexture(e.TEXTURE_2D, t), e.texImage2D(e.TEXTURE_2D, 0, this.hdr ? e.RGBA16F : e.RGBA8, this.bloomWidth, this.bloomHeight, 0, e.RGBA, this.hdr ? e.HALF_FLOAT : e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.bindFramebuffer(e.FRAMEBUFFER, n), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, t, 0), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("Bloom framebuffer allocation failed. Choose a lower quality preset.");
		}
		e.bindFramebuffer(e.FRAMEBUFFER, null), this.renderTargets.record("bloomA", {
			width: this.bloomWidth,
			height: this.bloomHeight,
			format: this.hdr ? "RGBA16F" : "RGBA8"
		}), this.renderTargets.record("bloomB", {
			width: this.bloomWidth,
			height: this.bloomHeight,
			format: this.hdr ? "RGBA16F" : "RGBA8"
		});
	}
	drawBloom(e, t = this.frameTexture) {
		let n = this.context;
		this.ensureBloomTargets(), n.disable(n.DEPTH_TEST), n.disable(n.CULL_FACE), n.bindVertexArray(null), n.useProgram(this.bloomProgram), n.viewport(0, 0, this.bloomWidth, this.bloomHeight), n.uniform1i(this.bloomUniforms.sourceTexture, 0), n.uniform1f(this.bloomUniforms.threshold, e.threshold);
		for (let r = 0; r < 2; r++) n.bindFramebuffer(n.FRAMEBUFFER, this.bloomTargets[r].framebuffer), n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, r === 0 ? t : this.bloomTargets[0].texture), n.uniform1f(this.bloomUniforms.extract, +(r === 0)), n.uniform2f(this.bloomUniforms.texelDirection, r === 0 ? e.radius / this.bloomWidth : 0, r === 1 ? e.radius / this.bloomHeight : 0), n.drawArrays(n.TRIANGLES, 0, 3);
	}
	applyAlphaState(e, t) {
		let n = this.context;
		e.doubleSided || !t ? n.disable(n.CULL_FACE) : n.enable(n.CULL_FACE);
		let r = e.alphaMode === "mask";
		if (!t) {
			let t = this.depthAlphaUniforms;
			n.uniform1f(t.alphaMasked, +!!r), n.uniform1f(t.alphaCutoff, e.alphaCutoff), n.uniform1f(t.materialOpacity, e.opacity), n.uniform1f(t.hasBaseMap, +!!e.mapState[0]), i.bindDepth?.(this, e), r && (n.activeTexture(n.TEXTURE0 + 1), n.bindTexture(n.TEXTURE_2D, e.textures[0]));
			return;
		}
		this.applyDepthLayer(e.depthLayer);
		let a = r && this.samples > 1 && !this.benchmark && !this.renderingPass;
		a ? n.enable(n.SAMPLE_ALPHA_TO_COVERAGE) : n.disable(n.SAMPLE_ALPHA_TO_COVERAGE);
		let o = this.uniforms;
		n.uniform1f(o.alphaMode, lt[e.alphaMode]), n.uniform1f(o.alphaCutoff, e.alphaCutoff), n.uniform1f(o.materialOpacity, e.opacity), n.uniform1f(o.alphaToCoverage, +!!a), n.uniform1f(o.doubleSided, +!!e.doubleSided);
	}
	applyDepthLayer(e) {
		let t = this.context;
		e ? (t.enable(t.POLYGON_OFFSET_FILL), t.polygonOffset(-e, -e * 4)) : t.disable(t.POLYGON_OFFSET_FILL);
	}
	uploadSortedInstances(e, t) {
		if (e.instanceCount < 2) return;
		let n = e.instanceData, r = Array.from({ length: e.instanceCount }, (e, r) => {
			let i = r * H;
			return {
				index: r,
				distance: Math.hypot(n[i + 12] - t[0], n[i + 13] - t[1], n[i + 14] - t[2])
			};
		});
		r.sort((e, t) => t.distance - e.distance), e.sortedData ??= new Float32Array(n.length), r.forEach(({ index: t }, r) => {
			e.sortedData.set(n.subarray(t * H, (t + 1) * H), r * H);
		}), this.context.bindBuffer(this.context.ARRAY_BUFFER, e.instanceBuffer), this.context.bufferSubData(this.context.ARRAY_BUFFER, 0, e.sortedData);
	}
	hasOpaqueInstance(e) {
		for (let t = 0; t < e.instanceCount; t++) if (e.instanceData[t * H + st] >= .999) return !0;
		return !1;
	}
	drawBlendBatches(e) {
		let t = this.context, n = e.eye, r = this.batches.filter((e) => e.alphaMode === "blend" && J(e) === "opaque"), i = this.batches.filter((e) => e.alphaMode === "add" && J(e) === "opaque");
		if (r.length === 0 && i.length === 0) return;
		t.bindFramebuffer(t.FRAMEBUFFER, this.multisampleFramebuffer), t.viewport(0, 0, this.canvas.width, this.canvas.height), t.enable(t.DEPTH_TEST), t.useProgram(this.program), t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D, this.shadowTexture), t.uniform1i(this.uniforms.shadowMap, 0);
		let a = (e) => {
			let t = 0;
			for (let r = 0; r < e.instanceCount; r++) {
				let i = r * H;
				t += Math.hypot(e.instanceData[i + 12] - n[0], e.instanceData[i + 13] - n[1], e.instanceData[i + 14] - n[2]);
			}
			return t / e.instanceCount;
		}, o = r.map((e) => ({
			batch: e,
			distance: a(e)
		})).sort((e, t) => t.distance - e.distance);
		for (let { batch: e } of o) this.hasOpaqueInstance(e) && this.drawAlphaBatch({
			...e,
			alphaMode: "mask",
			alphaCutoff: .999
		}, !0);
		t.enable(t.BLEND), t.blendFuncSeparate(t.SRC_ALPHA, t.ONE_MINUS_SRC_ALPHA, t.ONE, t.ONE_MINUS_SRC_ALPHA), t.depthMask(!1);
		for (let { batch: e } of o) this.uploadSortedInstances(e, n), this.drawAlphaBatch(e, !0);
		if (i.length > 0) {
			t.blendFuncSeparate(t.SRC_ALPHA, t.ONE, t.ZERO, t.ONE);
			for (let e of i) this.drawAlphaBatch(e, !0);
		}
		t.depthMask(!0), this.applyDepthLayer(0), t.disable(t.BLEND), t.disable(t.SAMPLE_ALPHA_TO_COVERAGE), t.enable(t.CULL_FACE), t.bindVertexArray(null);
	}
	drawAlphaBatch(e, t, n = !1) {
		let r = n ? this.selectBatchInstances(e) : null;
		r?.visibleCount !== 0 && (this.applyAlphaState(e, t), this.drawBatch(e, t, r));
	}
	setSingleInstanceUniforms(e) {
		let t = this.context;
		t.uniform3f(this.uniforms.baseColor, e[25], e[26], e[27]), t.uniform4f(this.uniforms.surface, e[28], e[29], e[30], e[31]), t.uniform4f(this.uniforms.instanceEmission, e[38], e[39], e[40], 0), t.uniform1f(this.uniforms.instanceOpacity, e[st]), this.shaderFeatures.has("boxMapScale") && t.uniformMatrix3fv(this.uniforms.boxNormalMatrix, !1, e.subarray(16, 25));
	}
	drawBatch(e, t = !1, n = null, r = e) {
		if (this.hasMorphs) {
			let n = t ? this.uniforms : this.depthMorphUniforms;
			this.context.uniform1f(n.morphEnabled, +!!e.morph), e.morph && (this.context.uniform1i(n.morphVertexCount, e.morphTexture.info.vertexCount), this.context.uniform1i(n.morphTargetCount, e.morphTexture.info.targetCount), this.context.uniform1fv(n["morphWeights[0]"], e.morphWeights), this.context.activeTexture(this.context.TEXTURE0 + 8), this.context.bindTexture(this.context.TEXTURE_2D, e.morphTexture.texture));
		}
		if (this.hasSkins) {
			let n = t ? this.uniforms : this.depthSkinUniforms;
			this.context.uniform1f(n.crowdEnabled, +!!e.crowd), this.context.uniform1f(n.skinEnabled, +!!e.skin), e.crowd ? (this.context.activeTexture(this.context.TEXTURE0 + 7), this.context.bindTexture(this.context.TEXTURE_2D, e.crowdTexture.texture), this.context.uniform1i(n.jointPalette, 7)) : e.skin && (this.context.activeTexture(this.context.TEXTURE0 + 6), this.context.bindTexture(this.context.TEXTURE_2D, e.influenceTexture.texture), this.context.uniform1i(n.skinInfluences, 6), this.context.activeTexture(this.context.TEXTURE0 + 7), this.context.bindTexture(this.context.TEXTURE_2D, e.skinTexture.texture), this.context.uniform1i(n.jointPalette, 7));
		}
		if (t && !this.benchmark) {
			this.context.uniform1f(this.uniforms.shadowBlind, +(e.receivesShadow === !1)), this.context.uniform1f(this.uniforms.compositeMode, e.compositeMode ?? 0);
			for (let t = 0; t < G.length; t++) this.context.activeTexture(this.context.TEXTURE0 + t + 1), this.context.bindTexture(this.context.TEXTURE_2D, e.textures[t]), this.context.uniform1i(this.uniforms[ut[t]], t + 1), this.context.uniform1f(this.uniforms[dt[t]], e.mapState[t] ? 1 + (e.mapState[t].uvChannel ?? 0) : 0);
			this.context.uniform2f(this.uniforms.normalScale, e.mapState[5], e.mapState[6]), this.context.uniform1f(this.uniforms.occlusionStrength, e.mapState[7]), this.context.uniform4f(this.uniforms.materialMoss, e.mapState[8], e.mapState[9], e.mapState[10], e.mapState[11]);
			let t = e.layerState;
			this.context.uniform3f(this.uniforms.materialDielectric, t[0], t[1], t[2]), this.context.uniform2f(this.uniforms.materialCoat, t[3], t[4]), this.context.uniform4f(this.uniforms.materialSheen, t[5], t[6], t[7], t[8]), this.context.uniform2f(this.uniforms.materialAnisotropy, t[16], t[17]), this.context.uniform3f(this.uniforms.materialIridescence, t[18], t[19], t[20]), this.context.uniform1i(this.uniforms.lightLinkMask, t[21]), this.context.uniform1f(this.uniforms.materialToon, t[22]), this.context.uniform1f(this.uniforms.boxMapScale, e.mapState[12]), this.context.uniform1i(this.uniforms.boxMapAxis, e.mapState[13]), this.shaderFeatures?.has("splat") && a().bind(this, e.splat), i.bind?.(this, e.mapState, t, e), this.context.uniform1f(this.uniforms.hasLightMap, +!!e.lightMapTexture), e.lightMapTexture && (this.context.activeTexture(this.context.TEXTURE0 + jt), this.context.bindTexture(this.context.TEXTURE_2D, e.lightMapTexture), this.context.uniform1i(this.uniforms.lightMap, jt), this.context.uniform1f(this.uniforms.lightMapScale, e.mapState[15]));
		}
		t && !this.benchmark && this.shaderFeatures?.has("instanced") === !1 && this.setSingleInstanceUniforms(e.instanceData), e.mirrored && this.context.frontFace(this.context.CW), n && !n.isEverything ? this.drawSelectedLevels(e, n, r) : (this.context.bindVertexArray(e.vertexArray), this.context.drawElementsInstanced(this.context.TRIANGLES, e.indexCount, this.context.UNSIGNED_INT, 0, e.instanceCount)), e.mirrored && this.context.frontFace(this.context.CCW);
	}
	preparePass(e) {
		if (e.pass === void 0) return 0;
		if (!this.passSupport) throw Error("Render passes need installRenderPasses(renderer) from 67js/addons/render-passes.");
		return this.passSupport.prepare(e);
	}
	setFogField(e) {
		this.fogFieldOverride = e === null ? null : ce(e);
	}
	loadReversedDepthFor(e) {
		this.reversedDepthMode === !1 || this.reversedDepth !== void 0 || this.reversedDepthReady || e.far / (e.near ?? .1) > 1e4 && (this.reversedDepthReady = import("./reversed-depth.js").then(({ installReversedDepth: e }) => e(this, this.reversedDepthMode)));
	}
	render(e) {
		this.loadReversedDepthFor?.(e);
		let { eye: t, target: n = [
			0,
			1.2,
			0
		], armorColor: r = [
			.53,
			.39,
			.24
		], armorSurface: i = [.88, .32], exposure: a = 1, inspection: o = !1 } = e, s = I(e.effects), u = {
			lightDirection: [
				-3,
				6,
				4
			],
			fogColor: [
				.35,
				.43,
				.43
			],
			fogDensity: .006,
			daylight: 1,
			explosionCenter: [
				0,
				0,
				0
			],
			...this.environment,
			...e.environment
		};
		u.fogDensity ??= this.fittedFogDensity ?? .006;
		let d = se(u.volumeFog);
		if (this.fogFieldOverride && (d.field = this.fogFieldOverride), d.density > 0) {
			if (c("volumeFog"), !this.depth || !this.hdr || this.transparent || this.benchmark) throw Error("Volume fog requires depth:true, active HDR and an opaque canvas");
			if (!Number.isFinite(e.time ?? 0) || Math.abs(e.time ?? 0) > 1e6) throw RangeError("Volume time must be finite and within ±1000000 seconds");
			let t = u.lightDirection, n = t?.length === 3 ? Math.hypot(...t) : NaN;
			if (!Number.isFinite(n) || n < 1e-6 || !Array.from(t).every((e) => typeof e == "number" && Math.abs(e) <= 1e6)) throw RangeError("Volume light direction must have a finite nonzero length and bounded components");
		}
		ie(this.lighting, u, { world: this.world }), this.syncViewTransform(u);
		let f = String(this.activeLightDirection) !== String(u.lightDirection);
		this.activeLightDirection = u.lightDirection, this.diagnostics = Oe({
			world: this.world,
			depth: this.depth,
			effects: s,
			lightDirection: u.lightDirection,
			shadowBounds: this.shadowBounds,
			coplanarProblems: this.coplanarDiagnostics?.(this.batches),
			skinProblems: l.reflectedSkinDiagnostics?.(this.partLocations)
		});
		let h = performance.now(), _ = this.context;
		this.beginGpuTiming();
		let v = Math.max(0, Math.min(1, e.assemblyAmount ?? 0)), y = this.updateWindState(e), b = this.assemblyAmount !== v || this.shadowsDirty || y || f;
		this.requireFeatureNames(Ct(this.lighting));
		let x = this.preparePass(e);
		this.renderingPass = x > 0, this.volumeShadowWanted = d.density > 0, (b || this.shadowMapSizeWanted() !== this.shadowMapSize) && (this.assemblyAmount = v, this.createShadowMap()), this.updateLocalShadows(b);
		let S = this.activateEnvironment(u.map);
		this.requireFeatureNames([S ? "environmentMap" : "studioLighting"]), re(this.projection, e, this.canvas.width / this.canvas.height, { world: this.world }), m(this.view, t, n, e.up ?? [
			0,
			1,
			0
		]), p(this.viewProjection, this.projection, this.view), g(this.inverseViewProjection, this.viewProjection), Je(this.viewProjection, this.frustumPlanes), this.viewForward = [
			-this.view[2],
			-this.view[6],
			-this.view[10]
		], e.reflectionTarget && this.shadowCascades?.texture ? this.cascadeCastersChanged ||= b : (this.shadowCascades?.update(this, b || !!this.cascadeCastersChanged), this.cascadeCastersChanged = !1);
		let C = e.reflectionTarget;
		_.bindFramebuffer(_.FRAMEBUFFER, C ? C.framebuffer : x ? this.passSupport.framebuffer : this.benchmark ? null : this.multisampleFramebuffer), _.viewport(0, 0, C?.width ?? this.canvas.width, C?.height ?? this.canvas.height), x ? _.clearColor(...this.passSupport.background(e.pass)) : this.transparent ? _.clearColor(0, 0, 0, 0) : _.clearColor(.145, .162, .177, 1);
		let w = !x && !!S?.showBackground && !this.transparent;
		_.clear(w ? _.DEPTH_BUFFER_BIT : _.COLOR_BUFFER_BIT | _.DEPTH_BUFFER_BIT);
		let T = !x && this.drawEnvironmentBackground(S, e, a);
		this.world && !this.benchmark && !x && !T && this.drawSky(e), _.enable(_.DEPTH_TEST), _.enable(_.CULL_FACE), _.useProgram(this.program), _.uniformMatrix4fv(this.uniforms.viewProjection, !1, this.viewProjection), _.uniformMatrix4fv(this.uniforms.lightProjection, !1, this.lightProjection), _.uniform1f(this.uniforms.shadowBiasPerSlope, this.shadowBiasPerSlope), _.uniform3fv(this.uniforms.eye, t), this.shadowCascades?.bindUniforms(this), _.uniform3fv(this.uniforms.armorColor, r), _.uniform2fv(this.uniforms.armorSurface, i), _.uniform1f(this.uniforms.exposure, a), _.uniform1f(this.uniforms.inspection, +!!o), _.uniform1f(this.uniforms.hdrEnabled, +!!this.hdr), _.uniform1i(this.uniforms.pointLightCount, e.reflectionTarget ? 0 : this.lighting.pointCount), _.uniform4fv(this.uniforms["pointLightPositions[0]"], this.lighting.positions), _.uniform4fv(this.uniforms["pointLightColors[0]"], this.lighting.colors), _.uniform1fv(this.uniforms["pointLightRadii[0]"], this.lighting.radii), this.applyLocalLightUniforms(!!e.reflectionTarget), this.lighting.bind?.(this), _.uniform3fv(this.uniforms.keyColor, this.lighting.keyColor), _.uniform1f(this.uniforms.fillIntensity, this.lighting.fillIntensity), _.uniform1f(this.uniforms.ambientIntensity, this.lighting.ambientIntensity), _.uniform1f(this.uniforms.specularAntiAliasing, this.lighting.specularAntiAliasing), _.uniform1f(this.uniforms.time, e.time ?? 0), _.uniform1f(this.uniforms.wind, e.wind ?? .3), _.uniform1f(this.uniforms.worldMode, +!!this.world), _.uniform1f(this.uniforms.daylight, u.daylight), _.uniform3fv(this.uniforms.lightDirection, u.lightDirection), _.uniform3fv(this.uniforms.fogColor, u.fogColor), _.uniform1f(this.uniforms.fogDensity, u.fogDensity), _.uniform3fv(this.uniforms.waterRipple, e.waterRipple ?? [
			1e4,
			0,
			1e4
		]), _.uniform1f(this.uniforms.rippleTime, e.rippleTime ?? -1e3), _.uniform1f(this.uniforms.explosionProgress, e.explosionProgress ?? 1), _.uniform3fv(this.uniforms.explosionCenter, u.explosionCenter), _.uniform1f(this.uniforms.assemblyAmount, v), _.activeTexture(_.TEXTURE0), _.bindTexture(_.TEXTURE_2D, this.shadowTexture), _.uniform1i(this.uniforms.shadowMap, 0), this.applyEnvironmentUniforms(S), _.uniform1f(this.uniforms.renderPassMode, x), _.uniform1f(this.uniforms.renderPassDepthRange, e.passDepthRange ?? 100);
		let E = 0;
		for (let e of this.batches) this.benchmark ? this.drawBatch(e, !0) : this.drawsInOpaqueLoop(e) && !(C && e.mapState[20]) && (_.uniform1f(this.uniforms.renderPassObjectBase, E), E += e.instanceCount, this.drawAlphaBatch(e, !0, x !== rn));
		this.applyDepthLayer(0), _.disable(_.SAMPLE_ALPHA_TO_COVERAGE), _.enable(_.CULL_FACE), _.bindVertexArray(null), C ? (this.renderingPass = !1, this.endGpuTiming()) : (x ? this.passSupport.copyToCanvas() : this.benchmark || (this.drawTranslucent(e, u, v, S), this.drawBlendBatches(e), this.resolveFrame(e, s, u, d)), this.renderingPass = !1, this.endGpuTiming(), this.cpuMilliseconds = performance.now() - h);
	}
	beginGpuTiming() {
		this.gpuTimer === void 0 && (this.gpuTimer = this.createGpuTimer?.(this.context) ?? null), this.gpuTimer?.begin();
	}
	endGpuTiming() {
		this.gpuTimer && (this.gpuTimer.end(), this.gpuMilliseconds = this.gpuTimer.collect());
	}
	applyLocalLightUniforms(e = !1) {
		let t = this.context, n = this.lighting, r = this.uniforms;
		t.uniform1fv(r["pointLightShadowTiles[0]"], n.pointShadows), t.uniform1i(r.spotLightCount, e ? 0 : n.spotCount), t.uniform4fv(r["spotLightPositions[0]"], n.spotPositions), t.uniform4fv(r["spotLightColors[0]"], n.spotColors), t.uniform4fv(r["spotLightDirections[0]"], n.spotDirections), t.uniform4fv(r["spotLightParameters[0]"], n.spotParameters), t.uniform1i(r.areaLightCount, e ? 0 : n.areaCount), t.uniform4fv(r["areaLightPositions[0]"], n.areaPositions), t.uniform4fv(r["areaLightColors[0]"], n.areaColors), t.uniform4fv(r["areaLightNormals[0]"], n.areaNormals), t.uniform4fv(r["areaLightTangents[0]"], n.areaTangents), n.shadowCasters.length !== 0 && this.localShadowTexture && (t.uniformMatrix4fv(r["localShadowMatrices[0]"], !1, this.localShadowMatrices), t.uniform1fv(r["localShadowTexelAngles[0]"], this.localShadowTexelAngles), t.activeTexture(t.TEXTURE0 + Nt), t.bindTexture(t.TEXTURE_2D, this.localShadowTexture), t.uniform1i(r.localShadowAtlas, Nt), t.activeTexture(t.TEXTURE0));
	}
	dispose() {
		this.fogFieldTexture?.dispose(), this.releaseFrameTargets(), this.shadowCascades?.dispose(this.context, this.renderTargets), u.dispose?.(this), this.localShadowTexture && this.context.deleteTexture(this.localShadowTexture), this.localShadowFramebuffer && this.context.deleteFramebuffer(this.localShadowFramebuffer), this.batches.forEach((e) => {
			this.context.deleteVertexArray(e.vertexArray), this.releaseLevelDraws(e);
		}), this.buffers.forEach((e) => this.context.deleteBuffer(e)), this.geometryBuffers?.clear(), this.context.deleteTexture(this.shadowTexture), this.context.deleteFramebuffer(this.shadowFramebuffer), this.context.deleteProgram(this.program), this.context.deleteProgram(this.depthProgram), this.postProgram && this.context.deleteProgram(this.postProgram);
		for (let e of this.postVariants?.values() ?? []) this.context.deleteProgram(e.pending ? j(this.context, e.pending) : e.program);
		this.skyProgram && this.context.deleteProgram(this.skyProgram), this.bloomProgram && this.context.deleteProgram(this.bloomProgram), this.occlusionProgram && this.context.deleteProgram(this.occlusionProgram), this.passSupport?.dispose(this.context);
		for (let e of this.postStages ?? []) e.dispose(this.context);
		this.environmentBackgroundProgram && this.context.deleteProgram(this.environmentBackgroundProgram), this.environmentResources?.dispose();
		for (let e of this.textures.values()) this.context.deleteTexture(e);
		this.splatPlaceholder && a().dispose(this), this.textures.clear();
		for (let e of [
			this.skinTextures,
			this.influenceTextures,
			this.morphTextures
		]) {
			for (let t of e?.values() ?? []) this.context.deleteTexture(t.texture);
			e?.clear();
		}
		this.partLocations.clear(), this.updatePartIdentities?.clear(), this.updateSkins?.clear(), this.updateMorphs?.clear(), this.updateBatches?.clear();
	}
};
export { mn as n, Sn as t };
