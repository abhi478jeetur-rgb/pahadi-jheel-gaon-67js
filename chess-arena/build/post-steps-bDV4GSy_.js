/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { s as e } from "./shader-registry-DHYkwAg5.js";
import { createStage as t, sharedFragmentHeader as n } from "./camera-effects.js";
// src/post-steps.js
var r = 8, i = 24, a = 32, o = .03;
function s(e, t, n, r, i) {
	let a = e ?? t;
	if (!Number.isFinite(a) || a < n || a > r) throw RangeError(`${i} must be between ${n} and ${r}.`);
	return a;
}
var c = Object.freeze({
	lift: [
		0,
		0,
		0
	],
	gamma: [
		1,
		1,
		1
	],
	gain: [
		1,
		1,
		1
	]
});
function l(e, t) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${t} must be an object.`);
	return e;
}
function u(e, t, n) {
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown ${n} field "${r}".`);
}
function d(e, t, n, r, i) {
	let a = e ?? t;
	if (!Array.isArray(a) || a.length !== 3) throw TypeError(`${i} must be three numbers.`);
	return a.map((e, a) => s(e, t[a], n, r, `${i}[${a}]`));
}
function f(e) {
	let t = l(e, "colorBalance");
	return u(t, [
		"lift",
		"gamma",
		"gain"
	], "colorBalance"), {
		lift: d(t.lift, c.lift, -1, 1, "colorBalance.lift"),
		gamma: d(t.gamma, c.gamma, .1, 4, "colorBalance.gamma"),
		gain: d(t.gain, c.gain, 0, 4, "colorBalance.gain")
	};
}
function p(e) {
	let t = l(e, "glare");
	u(t, [
		"streaks",
		"count",
		"angle",
		"fogGlow",
		"threshold",
		"size"
	], "glare");
	let n = s(t.count, 4, 1, r, "glare.count");
	if (!Number.isInteger(n)) throw RangeError("glare.count must be a whole number.");
	return {
		streaks: s(t.streaks, 0, 0, 1, "glare.streaks"),
		count: n,
		angle: s(t.angle, 0, -360, 360, "glare.angle"),
		fogGlow: s(t.fogGlow, 0, 0, 1, "glare.fogGlow"),
		threshold: s(t.threshold, 1, 0, 10, "glare.threshold"),
		size: s(t.size, .15, .01, 1, "glare.size")
	};
}
function m(e) {
	let t = l(e, "lensDistortion");
	return u(t, ["distortion", "dispersion"], "lensDistortion"), {
		distortion: s(t.distortion, 0, -1, 1, "lensDistortion.distortion"),
		dispersion: s(t.dispersion, 0, 0, 1, "lensDistortion.dispersion")
	};
}
function h(e) {
	let t = {};
	return e.colorBalance !== void 0 && (t.colorBalance = f(e.colorBalance)), e.glare !== void 0 && (t.glare = p(e.glare)), e.lensDistortion !== void 0 && (t.lensDistortion = m(e.lensDistortion)), t;
}
e.fields = [
	"colorBalance",
	"glare",
	"lensDistortion"
], e.resolve = h;
var g = `${n}
uniform vec3 lift;
uniform vec3 inverseGamma;
uniform vec3 gain;
void main() {
  vec4 source = texture(sourceTexture, textureCoordinate);
  vec3 graded = source.rgb * gain + lift * (1.0 - clamp(source.rgb, 0.0, 1.0));
  outputColor = vec4(pow(max(graded, vec3(0.0)), inverseGamma), source.a);
}`, _ = `${n}
uniform float streakAmount;
uniform int streakCount;
uniform float streakAngle;
uniform float fogAmount;
uniform float threshold;
uniform float sizePixels;
uniform float fogLod;
vec3 brightPart(vec2 coordinate, float lod) {
  vec3 color = textureLod(sourceTexture, coordinate, lod).rgb;
  float peak = max(color.r, max(color.g, color.b));
  return color * max(peak - threshold, 0.0) / max(peak, 0.00001);
}
void main() {
  vec4 source = texture(sourceTexture, textureCoordinate);
  vec3 glow = vec3(0.0);
  float jitter = pixelRotation() / 6.2831853;
  if (streakAmount > 0.0) {
    vec3 streaks = vec3(0.0);
    for (int arm = 0; arm < ${r}; arm++) {
      if (arm >= streakCount) break;
      float angle = streakAngle + float(arm) * 6.2831853 / float(streakCount);
      vec2 step = vec2(cos(angle), sin(angle)) * sizePixels / ${i}.0 / resolution;
      for (int index = 1; index <= ${i}; index++) {
        float along = float(index) - jitter;
        float weight = 1.0 - along / (${i}.0 + 1.0);
        streaks += brightPart(textureCoordinate + step * along, 0.0) * weight * weight * weight;
      }
    }
    glow += streaks * streakAmount * 4.0 / ${i}.0;
  }
  if (fogAmount > 0.0) {
    vec3 fog = vec3(0.0);
    float weightSum = 0.0;
    for (int index = 0; index < ${a}; index++) {
      float ring = sqrt((float(index) + 0.5) / ${a}.0);
      float angle = float(index) * 2.3999632;
      float weight = 1.0 - ring * ring;
      fog += brightPart(textureCoordinate + vec2(cos(angle), sin(angle)) * ring * sizePixels / resolution, fogLod) * weight;
      weightSum += weight;
    }
    glow += fog / weightSum * fogAmount;
  }
  outputColor = vec4(source.rgb + glow, source.a);
}`, v = `${n}
uniform float distortion;
uniform float dispersion;
void main() {
  float aspect = resolution.x / resolution.y;
  vec2 centered = (textureCoordinate - 0.5) * 2.0;
  centered.x *= aspect;
  float bend = 1.0 + distortion * 0.25 * dot(centered, centered);
  vec3 spread = 1.0 + dispersion * ${o} * vec3(1.0, 0.0, -1.0);
  float cornerBend = max(1.0 + distortion * 0.25 * (aspect * aspect + 1.0), 1.0);
  vec3 scales = bend * spread / (cornerBend * (1.0 + dispersion * ${o}));
  vec2 red = centered * scales.r;
  vec2 green = centered * scales.g;
  vec2 blue = centered * scales.b;
  vec4 center = texture(sourceTexture, green / vec2(aspect, 1.0) * 0.5 + 0.5);
  outputColor = vec4(texture(sourceTexture, red / vec2(aspect, 1.0) * 0.5 + 0.5).r, center.g,
    texture(sourceTexture, blue / vec2(aspect, 1.0) * 0.5 + 0.5).b, center.a);
}`;
function y(e) {
	return h(e.effects ?? {});
}
function b(e) {
	return !!e && [
		"lift",
		"gamma",
		"gain"
	].some((t) => e[t].some((e, n) => e !== c[t][n]));
}
function x() {
	return t({
		name: "Color balance",
		fragment: g,
		uniformNames: [
			"lift",
			"inverseGamma",
			"gain"
		],
		isActive: (e, t) => b(y(t).colorBalance),
		setUniforms(e, t, n, r) {
			let { colorBalance: i } = y(r);
			e.uniform3fv(t.lift, i.lift), e.uniform3fv(t.inverseGamma, i.gamma.map((e) => 1 / e)), e.uniform3fv(t.gain, i.gain);
		}
	});
}
function S() {
	let e = t({
		name: "Glare",
		fragment: _,
		uniformNames: [
			"streakAmount",
			"streakCount",
			"streakAngle",
			"fogAmount",
			"threshold",
			"sizePixels",
			"fogLod"
		],
		isActive: (e, t) => {
			let { glare: n } = y(t);
			return !!n && (n.streaks > 0 || n.fogGlow > 0);
		},
		setUniforms(e, t, n, r) {
			let { glare: i } = y(r);
			e.uniform1f(t.streakAmount, i.streaks), e.uniform1i(t.streakCount, i.count), e.uniform1f(t.streakAngle, i.angle * Math.PI / 180), e.uniform1f(t.fogAmount, i.fogGlow), e.uniform1f(t.threshold, i.threshold);
			let a = i.size * n.canvas.height;
			e.uniform1f(t.sizePixels, a), e.uniform1f(t.fogLod, Math.max(0, Math.log2(a / 1.5)));
		}
	});
	return {
		...e,
		apply(t, n, r, i) {
			let a = t.context, o = y(n).glare?.fogGlow > 0;
			o && (a.activeTexture(a.TEXTURE0), a.bindTexture(a.TEXTURE_2D, i), a.generateMipmap(a.TEXTURE_2D), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_LINEAR));
			let s = e.apply(t, n, r, i);
			return o && (a.activeTexture(a.TEXTURE0), a.bindTexture(a.TEXTURE_2D, i), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR)), s;
		}
	};
}
function C() {
	return t({
		name: "Lens distortion",
		fragment: v,
		uniformNames: ["distortion", "dispersion"],
		isActive: (e, t) => {
			let { lensDistortion: n } = y(t);
			return !!n && (n.distortion !== 0 || n.dispersion > 0);
		},
		setUniforms(e, t, n, r) {
			let { lensDistortion: i } = y(r);
			e.uniform1f(t.distortion, i.distortion), e.uniform1f(t.dispersion, i.dispersion);
		}
	});
}
function w(e) {
	return e.postStages.some((e) => e.name === "Glare") || e.postStages.push(S(), C(), x()), e;
}
export { g as colorBalanceFragment, _ as glareFragment, w as installPostSteps, v as lensDistortionFragment, h as resolvePostSteps };
