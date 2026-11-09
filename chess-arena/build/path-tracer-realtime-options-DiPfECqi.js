/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { normalizePathTracerOptions as e } from "./path-tracer.js";
import { _ as t, b as n, g as r, v as i, x as a, y as o } from "./path-tracer-gpu-pack-B_ap1Af7.js";
// src/path-tracer-reprojection.js
var s = .06, c = .9, l = [
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
function u(e, t) {
	return e.every((e, n) => e === t[n]);
}
function d(e) {
	let [t, n, r, , i, a, o, , s, c, l, , u, d, f] = e, p = a * l - c * o, m = c * r - n * l, h = n * o - a * r, g = t * p + i * m + s * h;
	if (!(Math.abs(g) > 1e-12)) return null;
	let _ = [
		p,
		s * o - i * l,
		i * c - s * a,
		m,
		t * l - s * r,
		s * n - t * c,
		h,
		i * r - t * o,
		t * a - i * n
	].map((e) => e / g), v = [
		0,
		1,
		2
	].map((e) => -(_[e * 3] * u + _[e * 3 + 1] * d + _[e * 3 + 2] * f));
	return [
		_[0],
		_[3],
		_[6],
		0,
		_[1],
		_[4],
		_[7],
		0,
		_[2],
		_[5],
		_[8],
		0,
		v[0],
		v[1],
		v[2],
		1
	];
}
function f(e, t) {
	let n = Array(16).fill(0);
	for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) for (let a = 0; a < 4; a++) n[r * 4 + i] += e[a * 4 + i] * t[r * 4 + a];
	return n;
}
function p(e, t) {
	let n = new Float32Array(Math.max(1, t.length) * 16);
	return t.forEach((t, r) => {
		let i = r * 16, a = e?.[r], o = t.matrix ?? l, s = a?.matrix ?? l, c = !!a && a.geometry === t.geometry && !t.skin && !a.skin, p = 2, m = l;
		if (c && u(s, o)) p = 0;
		else if (c) {
			let e = d(o);
			e && (m = f(s, e), p = 1);
		}
		for (let e = 0; e < 3; e++) for (let t = 0; t < 4; t++) n[i + e * 4 + t] = m[t * 4 + e];
		n[i + 12] = p;
	}), n;
}
var m = `
uniform vec3 uEye;
uniform vec3 uForward;
uniform vec3 uRight;
uniform vec3 uAbove;
uniform vec2 uHalfSize;
uniform vec3 uPreviousEye;
uniform vec3 uPreviousForward;
uniform vec3 uPreviousRight;
uniform vec3 uPreviousAbove;
uniform vec2 uPreviousHalfSize;
const float DEPTH_TOLERANCE = ${s};
const float NORMAL_AGREEMENT = ${c};

vec3 pixelRayDirection(vec2 pixelPosition, vec2 size) {
  float screenX = (pixelPosition.x / size.x * 2.0 - 1.0) * uHalfSize.x;
  float screenY = (1.0 - pixelPosition.y / size.y * 2.0) * uHalfSize.y;
  return normalize(uForward + uRight * screenX + uAbove * screenY);
}

bool projectToPrevious(vec3 point, vec2 size, out vec2 pixelPosition, out float distanceToEye) {
  vec3 offset = point - uPreviousEye;
  float alongView = dot(offset, uPreviousForward);
  distanceToEye = length(offset);
  pixelPosition = vec2(0.0);
  if (!(alongView > 1e-6)) return false;
  float screenX = dot(offset, uPreviousRight) / alongView / uPreviousHalfSize.x;
  float screenY = dot(offset, uPreviousAbove) / alongView / uPreviousHalfSize.y;
  pixelPosition = vec2(screenX * 0.5 + 0.5, 0.5 - screenY * 0.5) * size;
  return true;
}

bool isHistoryConsistent(float expectedDistance, float historyDistance, vec3 normal, vec3 historyNormal) {
  return abs(historyDistance - expectedDistance) <= DEPTH_TOLERANCE * expectedDistance && dot(normal, historyNormal) >= NORMAL_AGREEMENT;
}
`;
function h(e, t, n, r) {
	e.uniform3fv(t("uEye"), n.eye), e.uniform3fv(t("uForward"), n.forward), e.uniform3fv(t("uRight"), n.right), e.uniform3fv(t("uAbove"), n.above), e.uniform2f(t("uHalfSize"), n.halfWidth, n.halfHeight), e.uniform3fv(t("uPreviousEye"), r.eye), e.uniform3fv(t("uPreviousForward"), r.forward), e.uniform3fv(t("uPreviousRight"), r.right), e.uniform3fv(t("uPreviousAbove"), r.above), e.uniform2f(t("uPreviousHalfSize"), r.halfWidth, r.halfHeight);
}
var g = .02, _ = 4, v = 2.5, y = 8, b = "\nfloat luminanceOf(vec3 color) {\n  return dot(color, vec3(0.2126, 0.7152, 0.0722));\n}\nfloat distanceOf(vec4 radianceAndDistance, float farDistance) {\n  return radianceAndDistance.a > 0.0 ? radianceAndDistance.a : farDistance;\n}\n", x = `${r}
${m}
${b}
uniform sampler2D uRadiance;
uniform sampler2D uAlbedo;
uniform sampler2D uNormal;
uniform sampler2D uPreviousRadiance;
uniform sampler2D uPreviousNormal;
uniform sampler2D uHistoryColor;
uniform sampler2D uHistoryMoments;
uniform sampler2D uHistoryAlbedo;
uniform ivec2 uTraceSize;
uniform bool uResetHistory;
uniform float uFarDistance;
uniform float uHistoryLimit;
const float FIREFLY_DEVIATIONS = ${v};
const float SHORT_HISTORY_LENGTH = ${y}.0;
layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outMoments;
layout(location = 2) out vec4 outAlbedo;
layout(location = 3) out vec4 outFilter;

vec3 illuminationAt(ivec2 texel) {
  ivec2 clamped = clamp(texel, ivec2(0), uTraceSize - 1);
  return texelFetch(uRadiance, clamped, 0).rgb / max(texelFetch(uAlbedo, clamped, 0).rgb, vec3(${g}));
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  vec4 traced = texelFetch(uRadiance, texel, 0);
  vec3 albedo = texelFetch(uAlbedo, texel, 0).rgb;
  vec3 normal = texelFetch(uNormal, texel, 0).rgb;
  vec3 illumination = traced.rgb / max(albedo, vec3(${g}));
  vec2 size = vec2(uTraceSize);
  float distanceToEye = distanceOf(traced, uFarDistance);
  vec3 point = uEye + pixelRayDirection(vec2(texel) + 0.5, size) * distanceToEye;

  vec4 history = vec4(0.0);
  vec4 historyMoments = vec4(0.0);
  vec3 historyAlbedo = vec3(0.0);
  float totalWeight = 0.0;
  vec2 previousPosition;
  float previousDistance;
  if (!uResetHistory && projectToPrevious(point, size, previousPosition, previousDistance)) {
    vec2 base = floor(previousPosition - 0.5);
    vec2 fraction = previousPosition - 0.5 - base;
    for (int tap = 0; tap < 4; tap++) {
      ivec2 offset = ivec2(tap & 1, tap >> 1);
      ivec2 historyTexel = ivec2(base) + offset;
      if (any(lessThan(historyTexel, ivec2(0))) || any(greaterThanEqual(historyTexel, uTraceSize))) continue;
      float weight = (offset.x == 1 ? fraction.x : 1.0 - fraction.x) * (offset.y == 1 ? fraction.y : 1.0 - fraction.y);
      float historyDistance = distanceOf(texelFetch(uPreviousRadiance, historyTexel, 0), uFarDistance);
      if (!isHistoryConsistent(previousDistance, historyDistance, normal, texelFetch(uPreviousNormal, historyTexel, 0).rgb)) continue;
      history += weight * texelFetch(uHistoryColor, historyTexel, 0);
      historyMoments += weight * texelFetch(uHistoryMoments, historyTexel, 0);
      historyAlbedo += weight * texelFetch(uHistoryAlbedo, historyTexel, 0).rgb;
      totalWeight += weight;
    }
  }

  float neighbourSum = 0.0;
  float neighbourSumOfSquares = 0.0;
  for (int offsetY = -1; offsetY <= 1; offsetY++) {
    for (int offsetX = -1; offsetX <= 1; offsetX++) {
      if (offsetX == 0 && offsetY == 0) continue;
      float neighbour = luminanceOf(illuminationAt(texel + ivec2(offsetX, offsetY)));
      neighbourSum += neighbour;
      neighbourSumOfSquares += neighbour * neighbour;
    }
  }
  float neighbourMean = neighbourSum / 8.0;
  float neighbourDeviation = sqrt(max(0.0, neighbourSumOfSquares / 8.0 - neighbourMean * neighbourMean));
  float luminanceLimit = neighbourMean * 1.05 + FIREFLY_DEVIATIONS * neighbourDeviation + 0.01;
  float luminance = luminanceOf(illumination);
  bool shortHistory = totalWeight <= 1e-3 || history.a < SHORT_HISTORY_LENGTH;
  if (shortHistory && luminance > luminanceLimit) {
    illumination *= luminanceLimit / luminance;
    luminance = luminanceLimit;
  }
  vec2 currentMoments = vec2(luminance, luminance * luminance);
  vec3 color = illumination;
  vec3 blendedAlbedo = albedo;
  vec2 moments = currentMoments;
  float historyLength = 1.0;
  if (totalWeight > 1e-3) {
    history /= totalWeight;
    historyMoments /= totalWeight;
    historyAlbedo /= totalWeight;
    historyLength = min(history.a + 1.0, uHistoryLimit);
    float blend = 1.0 / historyLength;
    color = mix(history.rgb, illumination, blend);
    blendedAlbedo = mix(historyAlbedo, albedo, blend);
    moments = mix(historyMoments.xy, currentMoments, blend);
  }
  float variance = max(0.0, moments.y - moments.x * moments.x);
  if (historyLength < ${_}.0) {
    float sum = neighbourSum + luminance;
    float sumOfSquares = neighbourSumOfSquares + luminance * luminance;
    variance = max(0.0, sumOfSquares / 9.0 - (sum / 9.0) * (sum / 9.0));
  }
  outColor = vec4(color, historyLength);
  outMoments = vec4(moments, variance, 0.0);
  outAlbedo = vec4(blendedAlbedo, 1.0);
  outFilter = vec4(color, variance);
}`, S = `${r}
${m}
${b}
uniform sampler2D uFilter;
uniform sampler2D uRadiance;
uniform sampler2D uNormal;
uniform ivec2 uTraceSize;
uniform int uStep;
uniform float uFarDistance;
out vec4 outFilter;

const float KERNEL[3] = float[3](0.375, 0.25, 0.0625);
const float PLANE_SIGMA = 0.02;
const float LUMINANCE_SIGMA = 4.0;
const float NORMAL_POWER = 64.0;

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  vec2 size = vec2(uTraceSize);
  vec4 center = texelFetch(uFilter, texel, 0);
  vec3 centerNormal = texelFetch(uNormal, texel, 0).rgb;
  float centerDistance = distanceOf(texelFetch(uRadiance, texel, 0), uFarDistance);
  vec3 centerPoint = pixelRayDirection(vec2(texel) + 0.5, size) * centerDistance;
  float centerLuminance = luminanceOf(center.rgb);
  float smoothedVariance = 0.0;
  for (int offsetY = -1; offsetY <= 1; offsetY++) {
    for (int offsetX = -1; offsetX <= 1; offsetX++) {
      ivec2 neighbour = clamp(texel + ivec2(offsetX, offsetY), ivec2(0), uTraceSize - 1);
      smoothedVariance += texelFetch(uFilter, neighbour, 0).a * (offsetX == 0 ? 0.5 : 0.25) * (offsetY == 0 ? 0.5 : 0.25);
    }
  }
  float luminanceScale = LUMINANCE_SIGMA * sqrt(max(smoothedVariance, 0.0)) + 1e-4;

  vec3 sumColor = vec3(0.0);
  float sumVariance = 0.0;
  float sumWeight = 0.0;
  for (int offsetY = -2; offsetY <= 2; offsetY++) {
    for (int offsetX = -2; offsetX <= 2; offsetX++) {
      ivec2 neighbour = texel + ivec2(offsetX, offsetY) * uStep;
      if (any(lessThan(neighbour, ivec2(0))) || any(greaterThanEqual(neighbour, uTraceSize))) continue;
      vec4 value = texelFetch(uFilter, neighbour, 0);
      float neighbourDistance = distanceOf(texelFetch(uRadiance, neighbour, 0), uFarDistance);
      vec3 neighbourPoint = pixelRayDirection(vec2(neighbour) + 0.5, size) * neighbourDistance;
      float planeDistance = abs(dot(centerNormal, neighbourPoint - centerPoint));
      float planeWeight = exp(-planeDistance / (PLANE_SIGMA * centerDistance));
      float normalWeight = pow(max(dot(centerNormal, texelFetch(uNormal, neighbour, 0).rgb), 0.0), NORMAL_POWER);
      float luminanceWeight = exp(-abs(luminanceOf(value.rgb) - centerLuminance) / luminanceScale);
      float weight = KERNEL[abs(offsetX)] * KERNEL[abs(offsetY)] * planeWeight * normalWeight * luminanceWeight;
      sumColor += weight * value.rgb;
      sumVariance += weight * weight * value.a;
      sumWeight += weight;
    }
  }
  outFilter = sumWeight > 1e-6 ? vec4(sumColor / sumWeight, sumVariance / (sumWeight * sumWeight)) : center;
}`, C = `${r}
${b}
uniform sampler2D uFilter;
uniform sampler2D uAlbedoHistory;
uniform sampler2D uRadiance;
uniform sampler2D uNormal;
uniform ivec2 uTraceSize;
uniform ivec2 uOutputSize;
uniform float uFarDistance;
out vec4 outColor;

vec3 toneMap(vec3 linear) {
  vec3 color = max(linear, vec3(0.0));
  vec3 mapped = clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
  return pow(mapped, vec3(1.0 / 2.2));
}

void main() {
  vec2 outputPixel = vec2(gl_FragCoord.x, float(uOutputSize.y) - gl_FragCoord.y);
  vec2 position = outputPixel / vec2(uOutputSize) * vec2(uTraceSize);
  ivec2 nearest = clamp(ivec2(floor(position)), ivec2(0), uTraceSize - 1);
  float nearestDistance = distanceOf(texelFetch(uRadiance, nearest, 0), uFarDistance);
  vec3 nearestNormal = texelFetch(uNormal, nearest, 0).rgb;
  vec2 base = floor(position - 0.5);
  vec2 fraction = position - 0.5 - base;
  vec3 illumination = vec3(0.0);
  vec3 albedo = vec3(0.0);
  float totalWeight = 0.0;
  for (int tap = 0; tap < 4; tap++) {
    ivec2 offset = ivec2(tap & 1, tap >> 1);
    ivec2 texel = clamp(ivec2(base) + offset, ivec2(0), uTraceSize - 1);
    float weight = (offset.x == 1 ? fraction.x : 1.0 - fraction.x) * (offset.y == 1 ? fraction.y : 1.0 - fraction.y);
    float distanceDifference = abs(distanceOf(texelFetch(uRadiance, texel, 0), uFarDistance) - nearestDistance);
    weight *= exp(-distanceDifference / (0.02 * nearestDistance));
    weight *= pow(max(dot(nearestNormal, texelFetch(uNormal, texel, 0).rgb), 0.0), 16.0);
    illumination += weight * texelFetch(uFilter, texel, 0).rgb;
    albedo += weight * texelFetch(uAlbedoHistory, texel, 0).rgb;
    totalWeight += weight;
  }
  if (totalWeight < 1e-5) {
    illumination = texelFetch(uFilter, nearest, 0).rgb;
    albedo = texelFetch(uAlbedoHistory, nearest, 0).rgb;
    totalWeight = 1.0;
  }
  vec3 light = illumination / totalWeight;
  vec3 surface = albedo / totalWeight;
  outColor = vec4(toneMap(light * max(surface, vec3(${g}))), 1.0);
}`;
function w(e, { traceWidth: r, traceHeight: s, outputWidth: c, outputHeight: l, historyLimit: u = 48, filterIterations: d = 4 }) {
	let f = n(e, x), p = n(e, S), m = n(e, C), g = () => [i(e, r, s), i(e, r, s)], _ = g(), v = g(), y = g(), b = g(), w = [0, 1].map((t) => o(e, [
		{
			slot: 0,
			texture: _[t]
		},
		{
			slot: 1,
			texture: v[t]
		},
		{
			slot: 2,
			texture: y[t]
		},
		{
			slot: 3,
			texture: b[0]
		}
	])), T = b.map((t) => o(e, [{
		slot: 0,
		texture: t
	}])), E = 0, D = (n, i) => {
		t(e, n, "uRadiance", 0, i.radiance), t(e, n, "uNormal", 1, i.normal), e.uniform2i(n.locate("uTraceSize"), r, s), e.uniform1f(n.locate("uFarDistance"), i.farDistance);
	}, O = (n) => {
		let i = 1 - E;
		e.useProgram(f.program), D(f, n), t(e, f, "uAlbedo", 2, n.albedo), t(e, f, "uPreviousRadiance", 3, n.previousRadiance), t(e, f, "uPreviousNormal", 4, n.previousNormal), t(e, f, "uHistoryColor", 5, _[i]), t(e, f, "uHistoryMoments", 6, v[i]), t(e, f, "uHistoryAlbedo", 7, y[i]), h(e, f.locate, n.camera, n.previousCamera), e.uniform1i(f.locate("uResetHistory"), +!!n.resetHistory), e.uniform1f(f.locate("uHistoryLimit"), u), a(e, w[E], r, s);
	}, k = (n) => {
		e.useProgram(p.program), D(p, n), h(e, p.locate, n.camera, n.previousCamera);
		let i = 0;
		for (let n = 0; n < d; n++) t(e, p, "uFilter", 2, b[i]), e.uniform1i(p.locate("uStep"), 1 << n), a(e, T[1 - i], r, s), i = 1 - i;
		return b[i];
	}, A = (n, r) => {
		e.useProgram(m.program), D(m, n), t(e, m, "uFilter", 2, r), t(e, m, "uAlbedoHistory", 3, y[E]), e.uniform2i(m.locate("uOutputSize"), c, l), a(e, null, c, l);
	};
	return {
		run(e) {
			O(e);
			let t = k(e);
			A(e, t), E = 1 - E;
		},
		dispose() {
			for (let t of [
				..._,
				...v,
				...y,
				...b
			]) e.deleteTexture(t);
			for (let t of [...w, ...T]) e.deleteFramebuffer(t);
			for (let t of [
				f,
				p,
				m
			]) e.deleteProgram(t.program);
		}
	};
}
// src/path-tracer-realtime-options.js
var T = ["gpu", "webgpu"], E = 2, D = 2, O = 200, k = 64, A = 1e4;
function j(t) {
	let n = t.resolutionDivisor ?? D, r = t.width ?? 960, i = t.height ?? 540, a = Math.max(1, Math.ceil(r / n)), o = Math.max(1, Math.ceil(i / n)), s = t.backend ?? "gpu";
	if (!T.includes(s)) throw RangeError(`The real-time path tracer backend must be one of ${T.join(", ")}.`);
	let c = e({
		seed: t.seed,
		lightSelection: t.lightSelection ?? "importance",
		bounces: t.bounces ?? E,
		width: a,
		height: o,
		samples: 1,
		backend: "gpu",
		denoise: !1
	});
	return c.radianceCache = !0, {
		backend: s,
		outputWidth: r,
		outputHeight: i,
		traceWidth: a,
		traceHeight: o,
		options: c,
		historyLimit: t.historyLimit,
		filterIterations: t.filterIterations,
		cacheCellSize: t.cacheCellSize,
		followPartMotion: t.followPartMotion ?? !0
	};
}
function M(e, t) {
	let n = e.farDistance / A, r = t ?? n / O;
	return {
		cellSize: r,
		levelDistance: r * k
	};
}
function N(e, t) {
	return !e || !t ? !1 : [
		"eye",
		"forward",
		"right",
		"above"
	].every((n) => e[n].every((e, r) => e === t[n][r])) && e.halfWidth === t.halfWidth && e.halfHeight === t.halfHeight;
}
export { s as a, w as i, j as n, c as o, N as r, p as s, M as t };
