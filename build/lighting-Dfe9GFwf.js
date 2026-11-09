/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { a as e } from "./shader-registry-DHYkwAg5.js";
// src/effects.js
var t = Object.freeze({
	depthOfField: Object.freeze({
		blur: 0,
		focusDistance: 5
	}),
	motionBlur: Object.freeze({ shutter: 0 })
}), n = Object.freeze({
	neutral: Object.freeze({
		depthOfField: t.depthOfField,
		motionBlur: t.motionBlur,
		saturation: 1,
		contrast: 1,
		temperature: 0,
		vignette: 0,
		grain: 0,
		ambientOcclusion: 0,
		ambientOcclusionRadius: .5,
		bloom: Object.freeze({
			strength: 0,
			threshold: 1,
			radius: 1
		})
	}),
	cinematic: Object.freeze({
		depthOfField: t.depthOfField,
		motionBlur: t.motionBlur,
		saturation: .88,
		contrast: 1.08,
		temperature: .08,
		vignette: .16,
		grain: .012,
		ambientOcclusion: 0,
		ambientOcclusionRadius: .5,
		bloom: Object.freeze({
			strength: .25,
			threshold: 1,
			radius: 1.5
		})
	}),
	vivid: Object.freeze({
		depthOfField: t.depthOfField,
		motionBlur: t.motionBlur,
		saturation: 1.15,
		contrast: 1.03,
		temperature: 0,
		vignette: .06,
		grain: 0,
		ambientOcclusion: 0,
		ambientOcclusionRadius: .5,
		bloom: Object.freeze({
			strength: .3,
			threshold: .9,
			radius: 1.2
		})
	})
});
function r(e, t, n, r, i) {
	let a = e ?? t;
	if (!Number.isFinite(a) || a < n || a > r) throw Error(`${i} must be between ${n} and ${r}.`);
	return a;
}
function i(e = {}) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw Error("Effects must be an object.");
	let t = e.bloom ?? {};
	if (!t || typeof t != "object" || Array.isArray(t)) throw Error("Bloom must be an object.");
	let n = e.depthOfField ?? {}, i = e.motionBlur ?? {};
	if (typeof n != "object" || Array.isArray(n)) throw Error("Depth of field must be an object.");
	if (typeof i != "object" || Array.isArray(i)) throw Error("Motion blur must be an object.");
	return {
		depthOfField: {
			blur: r(n.blur, 0, 0, 1, "Depth of field blur"),
			focusDistance: r(n.focusDistance, 5, .01, 1e5, "Depth of field focus distance")
		},
		motionBlur: {
			shutter: r(i.shutter, 0, 0, .5, "Motion blur shutter"),
			...i.objects > 0 ? { objects: r(i.objects, 0, 0, 1, "Motion blur objects") } : {}
		},
		saturation: r(e.saturation, 1, 0, 2, "Saturation"),
		contrast: r(e.contrast, 1, .1, 2, "Contrast"),
		temperature: r(e.temperature, 0, -1, 1, "Temperature"),
		vignette: r(e.vignette, 0, 0, 1, "Vignette"),
		grain: r(e.grain, 0, 0, .1, "Grain"),
		ambientOcclusion: r(e.ambientOcclusion, 0, 0, 1, "Ambient occlusion"),
		ambientOcclusionRadius: r(e.ambientOcclusionRadius, .5, .01, 100, "Ambient occlusion radius"),
		bloom: {
			strength: r(t.strength, 0, 0, 2, "Bloom strength"),
			threshold: r(t.threshold, 1, 0, 10, "Bloom threshold"),
			radius: r(t.radius, 1, .1, 4, "Bloom radius")
		}
	};
}
var a = Math.PI / 2 - .01, o = 1e-4;
function s(e, t, n, r) {
	if (typeof e != "number" || !Number.isFinite(e) || e < t || e > n) throw RangeError(`${r} must be between ${t} and ${n}`);
	return e;
}
function c(e, t, n, r) {
	if (e?.length !== 3) throw TypeError(`${r} must have three components`);
	for (let i = 0; i < 3; i++) s(e[i], t, n, r);
	return e;
}
function l(e, t, n) {
	let r = e[t] ?? [];
	if (!Array.isArray(r) || r.length > n) throw RangeError(`${t} must be an array of at most ${n} lights`);
	return r;
}
function u(e, t) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${t} must be an object`);
	return e;
}
function d(e, t) {
	let n = e.range ?? 0;
	if (s(n, 0, 1e6, `${t} range`), n !== 0 && n < .001) throw RangeError(`${t} range must be zero or at least 0.001`);
}
function f(e, t) {
	if (e.castShadow !== void 0 && typeof e.castShadow != "boolean") throw TypeError(`${t} castShadow must be true or false`);
}
function p(e, t) {
	c(e, -1e6, 1e6, t);
	let n = Math.hypot(e[0], e[1], e[2]);
	if (n < 1e-6) throw RangeError(`${t} must not be zero length`);
	return [
		e[0] / n,
		e[1] / n,
		e[2] / n
	];
}
function m(e) {
	u(e, "Point light"), c(e.position, -1e6, 1e6, "Point light position"), c(e.color ?? [
		1,
		1,
		1
	], 0, 1, "Point light color"), s(e.intensity ?? 1, 0, 1e5, "Point light intensity"), s(e.radius ?? .05, .001, 1e6, "Point light radius"), d(e, "Point light"), f(e, "Point light");
}
function h(e) {
	u(e, "Spot light"), c(e.position, -1e6, 1e6, "Spot light position"), p(e.direction, "Spot light direction"), c(e.color ?? [
		1,
		1,
		1
	], 0, 1, "Spot light color"), s(e.intensity ?? 1, 0, 1e5, "Spot light intensity"), s(e.radius ?? .05, .001, 1e6, "Spot light radius"), s(e.angle ?? Math.PI / 4, .01, a, "Spot light angle"), s(e.penumbra ?? .15, 0, 1, "Spot light penumbra"), d(e, "Spot light"), f(e, "Spot light");
}
function g(e) {
	u(e, "Area light"), c(e.position, -1e6, 1e6, "Area light position");
	let t = p(e.direction, "Area light direction"), n = p(e.up ?? [
		0,
		1,
		0
	], "Area light up");
	if (Math.abs(t[0] * n[0] + t[1] * n[1] + t[2] * n[2]) > .999 && e.up !== void 0) throw RangeError("Area light up must not be parallel to its direction");
	c(e.color ?? [
		1,
		1,
		1
	], 0, 1, "Area light color"), s(e.intensity ?? 1, 0, 1e5, "Area light intensity"), s(e.width, .001, 1e4, "Area light width"), s(e.height, .001, 1e4, "Area light height");
}
function _(e, t) {
	let n = 0;
	for (let t of e) t.castShadow && (n += 6);
	for (let e of t) e.castShadow && (n += 1);
	if (n > 24) throw RangeError(`Shadow casting lights need ${n} atlas tiles, and the atlas holds 24 (a point light uses 6, a spot light one)`);
	return n;
}
function v() {
	return {
		positions: /* @__PURE__ */ new Float32Array(64),
		colors: /* @__PURE__ */ new Float32Array(64),
		radii: /* @__PURE__ */ new Float32Array(16),
		pointShadows: /* @__PURE__ */ new Float32Array(16),
		spotPositions: /* @__PURE__ */ new Float32Array(32),
		spotColors: /* @__PURE__ */ new Float32Array(32),
		spotDirections: /* @__PURE__ */ new Float32Array(32),
		spotParameters: /* @__PURE__ */ new Float32Array(32),
		areaPositions: /* @__PURE__ */ new Float32Array(28),
		areaColors: /* @__PURE__ */ new Float32Array(28),
		areaNormals: /* @__PURE__ */ new Float32Array(28),
		areaTangents: /* @__PURE__ */ new Float32Array(28),
		shadowCasters: [],
		keyColor: /* @__PURE__ */ new Float32Array(3),
		pointCount: 0,
		spotCount: 0,
		areaCount: 0,
		fillIntensity: 1,
		ambientIntensity: 1,
		specularAntiAliasing: 1
	};
}
function y(e, t) {
	e.positions.fill(0), e.colors.fill(0), e.radii.fill(0), e.pointShadows.fill(-1);
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		if (e.positions.set(r.position, n * 4), e.positions[n * 4 + 3] = r.range ?? 0, e.colors.set(r.color ?? [
			1,
			1,
			1
		], n * 4), e.colors[n * 4 + 3] = r.intensity ?? 1, e.radii[n] = r.radius ?? .05, r.castShadow) {
			e.pointShadows[n] = e.shadowCasters.length;
			for (let t = 0; t < 6; t++) e.shadowCasters.push({
				light: r,
				face: t
			});
		}
	}
}
function b(e, t) {
	e.spotPositions.fill(0), e.spotColors.fill(0), e.spotDirections.fill(0), e.spotParameters.fill(0);
	for (let n = 0; n < t.length; n++) {
		let r = t[n], i = r.angle ?? Math.PI / 4, a = Math.cos(i), s = a + Math.max((1 - a) * (r.penumbra ?? .15), o);
		e.spotPositions.set(r.position, n * 4), e.spotPositions[n * 4 + 3] = r.range ?? 0, e.spotColors.set(r.color ?? [
			1,
			1,
			1
		], n * 4), e.spotColors[n * 4 + 3] = r.intensity ?? 1, e.spotDirections.set(p(r.direction, "Spot light direction"), n * 4), e.spotDirections[n * 4 + 3] = a, e.spotParameters[n * 4] = r.radius ?? .05, e.spotParameters[n * 4 + 1] = s, e.spotParameters[n * 4 + 2] = -1, r.castShadow && (e.spotParameters[n * 4 + 2] = e.shadowCasters.length, e.shadowCasters.push({
			light: r,
			face: -1
		}));
	}
}
function x(e, t) {
	e.areaPositions.fill(0), e.areaColors.fill(0), e.areaNormals.fill(0), e.areaTangents.fill(0);
	for (let n = 0; n < t.length; n++) {
		let r = t[n], i = p(r.direction, "Area light direction"), a = p(r.up ?? [
			0,
			1,
			0
		], "Area light up"), o = [
			a[1] * i[2] - a[2] * i[1],
			a[2] * i[0] - a[0] * i[2],
			a[0] * i[1] - a[1] * i[0]
		], s = Math.hypot(...o);
		s < .001 && (o = [
			1,
			0,
			0
		], s = 1), e.areaPositions.set(r.position, n * 4), e.areaColors.set(r.color ?? [
			1,
			1,
			1
		], n * 4), e.areaColors[n * 4 + 3] = r.intensity ?? 1, e.areaNormals.set(i, n * 4), e.areaNormals[n * 4 + 3] = r.width, e.areaTangents.set(o.map((e) => e / s), n * 4), e.areaTangents[n * 4 + 3] = r.height;
	}
}
function S(t, n, { world: r = !1 } = {}) {
	let i = l(n, "pointLights", 16), a = l(n, "spotLights", 8), o = l(n, "areaLights", 7), u = s(n.keyIntensity ?? 1, 0, 100, "Key intensity"), d = s(n.fillIntensity ?? 1, 0, 100, "Fill intensity"), f = s(n.ambientIntensity ?? 1, 0, 100, "Ambient intensity"), p = s(n.daylight ?? 1, 0, 100, "Daylight"), v = s(n.specularAntiAliasing ?? 1, 0, 4, "Specular anti-aliasing"), S = n.keyColor ?? (r ? [
		3.7 * p,
		3.4 * p,
		2.9 * p
	] : [
		5.2,
		4.7,
		4.1
	]);
	c(S, 0, 1e3, "Key color"), i.forEach(m), a.forEach(h), o.forEach(g), _(i, a), t.shadowCasters = [], y(t, i), b(t, a), x(t, o), e.update?.(t, a, o);
	for (let e = 0; e < 3; e++) t.keyColor[e] = S[e] * u;
	return t.pointCount = i.length, t.spotCount = a.length, t.areaCount = o.length, t.fillIntensity = d, t.ambientIntensity = f, t.specularAntiAliasing = v, t;
}
export { i, S as n, n as r, v as t };
