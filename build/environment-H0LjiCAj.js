/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { l as e } from "./shader-registry-DHYkwAg5.js";
import { i as t, n, r, t as i } from "./environment-shading-BFHO3WeH.js";
var a = 16384, o = 1024, s = 65504, c = 256;
function l(e, t, n, r) {
	if (!Number.isInteger(e) || e < n || e > r) throw RangeError(`Environment map ${t} must be an integer between ${n} and ${r}.`);
}
function u(e, t, n, r) {
	if (typeof e != "number" || !Number.isFinite(e) || e < n || e > r) throw RangeError(`Environment map ${t} must be a finite number between ${n} and ${r}.`);
}
function d({ width: e, height: t, data: n, intensity: r = 1, rotation: i = 0, showBackground: o = !1, backgroundBlur: s = 0 } = {}) {
	if (l(e, "width", 4, a), l(t, "height", 2, a), !(n instanceof Float32Array)) throw TypeError("Environment map data must be a Float32Array of linear RGB or RGBA values.");
	let c = e * t, d = n.length === c * 3 ? 3 : n.length === c * 4 ? 4 : 0;
	if (!d) throw RangeError("Environment map data length must equal width * height * 3 or width * height * 4.");
	for (let e = 0; e < n.length; e++) if (!Number.isFinite(n[e])) throw RangeError("Environment map data must contain only finite values.");
	if (u(r, "intensity", 0, 1e3), u(i, "rotation", -1e6, 1e6), u(s, "backgroundBlur", 0, 1), typeof o != "boolean") throw TypeError("Environment map showBackground must be a boolean.");
	return Object.freeze({
		kind: "environment-map",
		width: e,
		height: t,
		channels: d,
		data: n,
		intensity: r,
		rotation: i,
		showBackground: o,
		backgroundBlur: s
	});
}
function f(e) {
	if (e?.kind !== "environment-map" || !(e.data instanceof Float32Array)) throw TypeError("environment.map must be created with createEnvironmentMap.");
	if (e.data.length !== e.width * e.height * e.channels) throw RangeError("Environment map data length does not match its dimensions.");
	u(e.intensity, "intensity", 0, 1e3), u(e.rotation, "rotation", -1e6, 1e6), u(e.backgroundBlur, "backgroundBlur", 0, 1);
}
function p(e) {
	let t = Math.min(1, o / e.width), n = Math.max(4, Math.round(e.width * t)), r = Math.max(2, Math.round(e.height * t)), i = Math.min(7, Math.floor(Math.log2(Math.max(n, r))) + 1), a = [], s = 65536;
	for (let e = 0; e < i; e++) {
		let t = Math.max(1, n >> e), i = Math.max(1, r >> e);
		a.push({
			width: t,
			height: i
		}), s += t * i * 8;
	}
	return {
		width: n,
		height: r,
		levelCount: i,
		levels: a,
		bytes: s
	};
}
function m(e, t = a) {
	if (f(e), e.width > t || e.height > t) throw RangeError(`Environment map ${e.width}x${e.height} exceeds the GPU texture limit of ${t}.`);
	return p(e).bytes;
}
var h = [
	.282095,
	.488603,
	.488603,
	.488603,
	1.092548,
	1.092548,
	.315392,
	1.092548,
	.546274
], g = [
	1,
	2 / 3,
	2 / 3,
	2 / 3,
	1 / 4,
	1 / 4,
	1 / 4,
	1 / 4,
	1 / 4
];
function _(e, t, n) {
	return [
		1,
		t,
		n,
		e,
		e * t,
		t * n,
		3 * n * n - 1,
		e * n,
		e * e - t * t
	];
}
function v(e) {
	f(e);
	let { width: t, height: n, channels: r, data: i } = e, a = new Float64Array(t), o = new Float64Array(t);
	for (let e = 0; e < t; e++) {
		let n = ((e + .5) / t - .5) * 2 * Math.PI;
		a[e] = Math.sin(n), o[e] = Math.cos(n);
	}
	let s = /* @__PURE__ */ new Float64Array(27), c = 2 * Math.PI / t * (Math.PI / n);
	for (let e = 0; e < n; e++) {
		let l = (e + .5) / n * Math.PI, u = Math.sin(l), d = Math.cos(l), f = u * c;
		for (let n = 0; n < t; n++) {
			let c = _(u * a[n], d, -u * o[n]), l = (e * t + n) * r;
			for (let e = 0; e < 9; e++) {
				let t = c[e] * f;
				s[e * 3] += i[l] * t, s[e * 3 + 1] += i[l + 1] * t, s[e * 3 + 2] += i[l + 2] * t;
			}
		}
	}
	let l = /* @__PURE__ */ new Float32Array(27);
	for (let e = 0; e < 9; e++) {
		let t = h[e] ** 2 * g[e];
		for (let n = 0; n < 3; n++) l[e * 3 + n] = s[e * 3 + n] * t;
	}
	return l;
}
function y(e, t) {
	let [n, r, i] = t, a = _(n, r, i), o = [
		0,
		0,
		0
	];
	for (let t = 0; t < 9; t++) for (let n = 0; n < 3; n++) o[n] += e[t * 3 + n] * a[t];
	return o.map((e) => Math.max(e, 0));
}
function b(e) {
	let t = e.width * e.height, n = new Float32Array(t * 4);
	for (let r = 0; r < t; r++) {
		let t = r * e.channels, i = r * 4;
		n[i] = Math.min(Math.max(e.data[t], 0), s), n[i + 1] = Math.min(Math.max(e.data[t + 1], 0), s), n[i + 2] = Math.min(Math.max(e.data[t + 2], 0), s), n[i + 3] = 1;
	}
	return n;
}
var x = `#version 300 es
precision highp float;
in vec2 textureCoordinate;
uniform sampler2D sourceMap;
uniform vec2 sourceSize;
uniform float roughness;
uniform float sourceLevelOffset;
out vec4 outputColor;
const float PI = 3.14159265359;
const uint SAMPLE_COUNT = ${c}u;
${r}
float radicalInverse(uint bits) {
  bits = (bits << 16u) | (bits >> 16u);
  bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
  bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
  bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
  bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
  return float(bits) * 2.3283064365386963e-10;
}
void main() {
  if (roughness < 0.001) {
    outputColor = vec4(min(textureLod(sourceMap, textureCoordinate, sourceLevelOffset).rgb, 65000.0), 1.0);
    return;
  }
  vec3 normal = directionFromEquirectangular(textureCoordinate);
  vec3 helper = abs(normal.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(helper, normal));
  vec3 bitangent = cross(normal, tangent);
  float alphaSquared = pow(roughness, 4.0);
  float texelSolidAngle = 4.0 * PI / (sourceSize.x * sourceSize.y);
  vec3 total = vec3(0.0);
  float totalWeight = 0.0;
  for (uint index = 0u; index < SAMPLE_COUNT; index++) {
    float firstRandom = float(index) / float(SAMPLE_COUNT);
    float secondRandom = radicalInverse(index);
    float cosineHalf = sqrt((1.0 - secondRandom) / (1.0 + (alphaSquared - 1.0) * secondRandom));
    float sineHalf = sqrt(max(1.0 - cosineHalf * cosineHalf, 0.0));
    float azimuth = 2.0 * PI * firstRandom;
    vec3 halfway = tangent * (sineHalf * cos(azimuth)) + bitangent * (sineHalf * sin(azimuth)) + normal * cosineHalf;
    vec3 light = reflect(-normal, halfway);
    float normalLight = dot(normal, light);
    if (normalLight <= 0.0) continue;
    float denominator = cosineHalf * cosineHalf * (alphaSquared - 1.0) + 1.0;
    float distribution = alphaSquared / (PI * denominator * denominator);
    float sampleSolidAngle = 1.0 / (float(SAMPLE_COUNT) * distribution * 0.25 + 0.0001);
    float sourceLevel = max(0.5 * log2(sampleSolidAngle / texelSolidAngle) + 1.0, 0.0);
    total += textureLod(sourceMap, equirectangularFromDirection(light), sourceLevel).rgb * normalLight;
    totalWeight += normalLight;
  }
  outputColor = vec4(min(total / max(totalWeight, 0.0001), 65000.0), 1.0);
}`, S = "#version 300 es\nprecision highp float;\nin vec2 textureCoordinate;\nout vec4 outputColor;\nconst float PI = 3.14159265359;\nconst uint SAMPLE_COUNT = 256u;\nfloat radicalInverse(uint bits) {\n  bits = (bits << 16u) | (bits >> 16u);\n  bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);\n  bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);\n  bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);\n  bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);\n  return float(bits) * 2.3283064365386963e-10;\n}\nvoid main() {\n  float normalView = max(textureCoordinate.x, 0.001);\n  float roughness = max(textureCoordinate.y, 0.02);\n  float alpha = roughness * roughness;\n  float alphaSquared = alpha * alpha;\n  float visibilityBias = alpha * 0.5;\n  vec3 view = vec3(sqrt(1.0 - normalView * normalView), 0.0, normalView);\n  float scale = 0.0;\n  float offset = 0.0;\n  for (uint index = 0u; index < SAMPLE_COUNT; index++) {\n    float firstRandom = float(index) / float(SAMPLE_COUNT);\n    float secondRandom = radicalInverse(index);\n    float cosineHalf = sqrt((1.0 - secondRandom) / (1.0 + (alphaSquared - 1.0) * secondRandom));\n    float sineHalf = sqrt(max(1.0 - cosineHalf * cosineHalf, 0.0));\n    float azimuth = 2.0 * PI * firstRandom;\n    vec3 halfway = vec3(sineHalf * cos(azimuth), sineHalf * sin(azimuth), cosineHalf);\n    vec3 light = 2.0 * dot(view, halfway) * halfway - view;\n    float normalLight = max(light.z, 0.0);\n    float normalHalf = max(halfway.z, 0.0);\n    float viewHalf = max(dot(view, halfway), 0.0);\n    if (normalLight <= 0.0) continue;\n    float geometry = (normalLight / (normalLight * (1.0 - visibilityBias) + visibilityBias)) * (normalView / (normalView * (1.0 - visibilityBias) + visibilityBias));\n    float visibility = geometry * viewHalf / max(normalHalf * normalView, 0.0001);\n    float fresnelTerm = pow(1.0 - viewHalf, 5.0);\n    scale += (1.0 - fresnelTerm) * visibility;\n    offset += fresnelTerm * visibility;\n  }\n  outputColor = vec4(scale / float(SAMPLE_COUNT), offset / float(SAMPLE_COUNT), 0.0, 1.0);\n}", C = `#version 300 es
precision highp float;
in vec2 textureCoordinate;
uniform mat4 inverseViewProjection;
uniform vec3 eye;
uniform float backgroundLevel;
uniform float exposure;
uniform float hdrEnabled;
out vec4 outputColor;
${i}
vec3 toneMap(vec3 color) {
  return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
}
void main() {
  vec4 world = inverseViewProjection * vec4(textureCoordinate * 2.0 - 1.0, 1.0, 1.0);
  vec3 direction = normalize(world.xyz / world.w - eye);
  vec3 radiance = environmentRadiance(direction, backgroundLevel);
  outputColor = vec4(hdrEnabled > 0.5 ? min(radiance * exposure, vec3(65504.0)) : pow(toneMap(radiance * exposure), vec3(1.0 / 2.2)), 1.0);
}`;
function w(e, t, n, r, i, { wrapHorizontally: a }) {
	let o = e.createTexture();
	return e.bindTexture(e.TEXTURE_2D, o), e.texStorage2D(e.TEXTURE_2D, n, t, r, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, n > 1 ? e.LINEAR_MIPMAP_LINEAR : e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, a ? e.REPEAT : e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), o;
}
function T(e, t, n, r, i, a) {
	if (e.bindFramebuffer(e.FRAMEBUFFER, t), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, n, r), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("Environment prefilter framebuffer is incomplete.");
	e.viewport(0, 0, i, a), e.drawArrays(e.TRIANGLES, 0, 3);
}
function E(e, t, { compileProgram: n, fullscreenVertex: r }) {
	if (f(t), !e.getExtension("EXT_color_buffer_float")) throw Error("Environment maps require EXT_color_buffer_float.");
	let i = performance.now(), a = p(t), o = Math.floor(Math.log2(Math.max(t.width, t.height))) + 1, s = w(e, e.RGBA16F, o, t.width, t.height, { wrapHorizontally: !0 });
	e.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, t.width, t.height, e.RGBA, e.FLOAT, b(t)), e.generateMipmap(e.TEXTURE_2D);
	let c = w(e, e.RGBA16F, a.levelCount, a.width, a.height, { wrapHorizontally: !0 }), l = w(e, e.RG16F, 1, 128, 128, { wrapHorizontally: !1 }), u = e.createFramebuffer(), d = n(e, r, x), m = n(e, r, S);
	e.disable(e.DEPTH_TEST), e.disable(e.CULL_FACE), e.disable(e.BLEND), e.disable(e.SCISSOR_TEST), e.bindVertexArray(null), e.useProgram(d), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, s), e.uniform1i(e.getUniformLocation(d, "sourceMap"), 0), e.uniform2f(e.getUniformLocation(d, "sourceSize"), t.width, t.height);
	let h = e.getUniformLocation(d, "roughness"), g = e.getUniformLocation(d, "sourceLevelOffset");
	for (let n = 0; n < a.levelCount; n++) e.uniform1f(h, n / Math.max(1, a.levelCount - 1)), e.uniform1f(g, Math.max(0, Math.log2(t.width / a.levels[n].width))), T(e, u, c, n, a.levels[n].width, a.levels[n].height);
	return e.useProgram(m), T(e, u, l, 0, 128, 128), e.bindFramebuffer(e.FRAMEBUFFER, null), e.deleteFramebuffer(u), e.deleteProgram(d), e.deleteProgram(m), e.deleteTexture(s), e.finish(), {
		data: t.data,
		irradianceSource: t.irradianceSource,
		specularTexture: c,
		brdfTexture: l,
		levelCount: a.levelCount,
		bytes: a.bytes,
		irradiance: v(t.irradianceSource ?? t),
		prefilterMilliseconds: performance.now() - i,
		dispose() {
			e.deleteTexture(c), e.deleteTexture(l);
		}
	};
}
e("environmentMap", { environmentShading: i + n }), t({
	assertMap: f,
	estimateBytes: m,
	createResources: E,
	prefilterFragment: x,
	brdfFragment: S,
	backgroundFragment: C
});
export { y as a, E as i, v as n, d as r, a as t };
