/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e, l as t } from "./shader-registry-DHYkwAg5.js";
import { o as n } from "./probe-trace-ALKeQrQp.js";
// src/water-reflection.js
var r = .1, i = .5, a = 5, o = .35;
function s(e) {
	let t = (e - r) / .4;
	return 5 * Math.min(Math.max(t, 0), 1);
}
function c(e) {
	let t = (e - o) / .15000000000000002;
	return 1 - Math.min(Math.max(t, 0), 1);
}
var l = .02, u = .002, d = .75, f = 3, p = 5, m = "0.02", h = "1.0", g = "0.012", _ = "0.004", v = 8, y = "0.0015", b = "0.0045", x = .05, S = "waterReflection", C = 7, w = /* @__PURE__ */ new Set([
	"liquid",
	"foam",
	"unlit",
	"fire",
	"smoke",
	"floor"
]);
function T({ minimum: e, maximum: t }) {
	return (t[0] - e[0]) * (t[2] - e[2]);
}
function E(e) {
	return !w.has(e.tag) && !(e.transmission > 0) && (e.roughness ?? 1) < .5;
}
function D({ minimum: e, maximum: t }) {
	let n = Math.max(t[0] - e[0], t[2] - e[2]);
	return n > 0 && t[1] - e[1] <= n * .02;
}
function O(e) {
	let t = e.map((e) => n(e)), r = [
		Infinity,
		Infinity,
		Infinity
	], i = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let { minimum: e, maximum: n } of t) for (let t = 0; t < 3; t++) r[t] = Math.min(r[t], e[t]), i[t] = Math.max(i[t], n[t]);
	let a = T({
		minimum: r,
		maximum: i
	}), o = [];
	if (e.forEach((e, n) => {
		let r = a > 0 ? T(t[n]) / a : 0;
		E(e.material) && D(t[n]) && r >= .002 && o.push({
			index: n,
			share: r,
			height: t[n].maximum[1],
			footprint: T(t[n])
		});
	}), o.length === 0) return null;
	let s = o.reduce((e, t) => t.footprint > e.footprint ? t : e), c = o.filter((e) => Math.abs(e.height - s.height) <= x);
	return {
		height: s.height,
		partIndices: c.map((e) => e.index),
		footprint: s.footprint,
		sceneShare: s.share
	};
}
function k(e) {
	let t = {};
	for (let n of Object.keys(e)) Object.defineProperty(t, n, {
		enumerable: !0,
		get: () => e[n]
	});
	return Object.defineProperty(t, S, {
		enumerable: !0,
		value: !0
	}), Object.freeze(t);
}
function A(e) {
	let t = O(e);
	if (!t) return {
		parts: e,
		surface: null,
		report: {
			placed: !1,
			reason: "no large flat smooth surface"
		}
	};
	for (let t of e) t.prepareMirrorLevels?.();
	let n = new Set(t.partIndices), r = e.map((e, t) => n.has(t) ? Object.freeze({
		...e,
		material: k(e.material)
	}) : e), i = {
		placed: !0,
		height: t.height,
		parts: t.partIndices.length,
		footprint: t.footprint,
		sceneShare: t.sceneShare
	};
	return {
		parts: Object.freeze(r),
		surface: t,
		report: i
	};
}
t("waterReflection", Object.freeze({
	declarations: "uniform sampler2D waterReflection;\nuniform mat4 waterReflectionMatrix;\nuniform vec2 waterClip;\nuniform float waterReflectionEnabled;\n",
	mainSetup: "  if (waterClip.y > 0.5 && worldPosition.y < waterClip.x + " + x.toFixed(2) + ") discard;\n",
	afterEmission: `  if (waterReflectionEnabled > 0.5) {
    float eyeDistance = length(worldPosition - eye);
    vec2 slope = vec2(sin(worldPosition.x * 0.31 + worldPosition.z * 0.17 + time * 0.4) + 0.6 * sin(worldPosition.x * 0.83 - worldPosition.z * 0.5 - time * 0.7),
      sin(worldPosition.z * 0.27 - worldPosition.x * 0.11 + time * 0.5) + 0.6 * sin(worldPosition.z * 0.91 + worldPosition.x * 0.43 - time * 0.6)) * ${g};
    vec3 shaken = worldPosition + vec3(slope.x, 0.0, slope.y) * (1.0 + eyeDistance * ${_});
    vec4 mirrorClip = waterReflectionMatrix * vec4(shaken, 1.0);
    vec2 mirrorCentre = mirrorClip.xy / mirrorClip.w * 0.5 + 0.5;
    float mirrorLevel = ${5 .toFixed(1)} * clamp((roughness - ${r.toFixed(2)}) / ${.4.toFixed(2)}, 0.0, 1.0);
    float mirrorWeight = 1.0 - clamp((roughness - ${o.toFixed(2)}) / ${.15000000000000002.toFixed(2)}, 0.0, 1.0);
    vec3 mirrored = vec3(0.0);
    for (int tap = 0; tap < ${v}; tap++) {
      float angle = float(tap) * 2.39996;
      vec2 offset = vec2(cos(angle), sin(angle)) * sqrt((float(tap) + 0.5) / ${v}.0);
      mirrored += textureLod(waterReflection, mirrorCentre + offset * vec2(${y}, ${b}), mirrorLevel).rgb;
    }
    mirrored = (hdrEnabled > 0.5 ? mirrored / ${v}.0 : pow(mirrored / ${v}.0, vec3(2.2))) / max(exposure, 1e-4);
    float fresnelWeight = (${m} + (1.0 - ${m}) * pow(1.0 - max(viewDirection.y, 0.0), 5.0)) * mirrorWeight;
    vec3 skyLight = ENVIRONMENT_ENABLED ? environmentLighting(normal, specularNormal, baseReflectance, viewDirection, reflect(-viewDirection, specularNormal), vec3(0.0), metallic, roughness, occlusion, ambientIntensity, skyReflection) : vec3(0.0);
    radiance = ENVIRONMENT_ENABLED ? max(radiance - skyLight * mirrorWeight, vec3(0.0)) + mirrored * ${h} * fresnelWeight : mix(radiance, mirrored * ${h}, fresnelWeight);
  }
`
}));
var j = /* @__PURE__ */ new WeakMap();
function M(e, t, n) {
	let r = e.context, i = r.createTexture();
	r.bindTexture(r.TEXTURE_2D, i), r.texImage2D(r.TEXTURE_2D, 0, e.hdr ? r.RGBA16F : r.RGBA8, t, n, 0, r.RGBA, e.hdr ? r.HALF_FLOAT : r.UNSIGNED_BYTE, null), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR_MIPMAP_LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE);
	let a = r.createRenderbuffer();
	r.bindRenderbuffer(r.RENDERBUFFER, a), r.renderbufferStorage(r.RENDERBUFFER, r.DEPTH_COMPONENT24, t, n);
	let o = r.createFramebuffer();
	r.bindFramebuffer(r.FRAMEBUFFER, o), r.framebufferTexture2D(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, i, 0), r.framebufferRenderbuffer(r.FRAMEBUFFER, r.DEPTH_ATTACHMENT, r.RENDERBUFFER, a);
	let s = r.checkFramebufferStatus(r.FRAMEBUFFER) === r.FRAMEBUFFER_COMPLETE;
	return r.bindFramebuffer(r.FRAMEBUFFER, null), {
		framebuffer: o,
		texture: i,
		depth: a,
		width: t,
		height: n,
		complete: s
	};
}
function N(e, t) {
	if (!t) return;
	let n = e.context;
	n.deleteFramebuffer(t.framebuffer), n.deleteTexture(t.texture), n.deleteRenderbuffer(t.depth);
}
function P(e, t, n) {
	let [r, i, a] = e.eye, [o, s, c] = e.target ?? [
		0,
		1.2,
		0
	], [l, u, d] = e.up ?? [
		0,
		1,
		0
	];
	return {
		...e,
		eye: [
			r,
			2 * t - i,
			a
		],
		target: [
			o,
			2 * t - s,
			c
		],
		up: [
			l,
			-u,
			d
		],
		reflectionTarget: n
	};
}
var F = 4, I = 65536;
function L(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function R(e, t) {
	if (e.constructor !== t.constructor || e.length !== t.length || e.length > I) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function z(e, t = 0) {
	return t >= F || typeof e != "object" || !e ? e : ArrayBuffer.isView(e) ? L(e) && e.length > I ? e : e.slice() : Array.isArray(e) ? e.map((e) => z(e, t + 1)) : Object.getPrototypeOf(e) === Object.prototype ? Object.fromEntries(Object.entries(e).map(([e, n]) => [e, z(n, t + 1)])) : e;
}
function B(e, t, n = 0) {
	if (e === t) return !0;
	if (n >= F || e === null || t === null || typeof e != "object" || typeof t != "object") return !1;
	if (L(e) && L(t)) return R(e, t);
	let r = Object.keys(e);
	return Object.getPrototypeOf(e) !== Object.getPrototypeOf(t) || r.length !== Object.keys(t).length ? !1 : r.every((r) => B(e[r], t[r], n + 1));
}
function V(e, t) {
	return !e.ready || !e.drawnFrame ? !1 : e.partsRevision === e.drawnRevision && B(e.drawnFrame, t) ? !0 : e.framesSinceDraw < e.updateEvery - 1;
}
function H(e, t, n, r) {
	let i = Math.max(1, Math.ceil(e.canvas.width * t.scale)), a = Math.max(1, Math.ceil(e.canvas.height * t.scale));
	if (t.target && t.target.width === i && t.target.height === a || (N(e, t.target), t.target = M(e, i, a), t.ready = !1), !(n.eye[1] > t.height) || !t.target.complete) t.ready = !1;
	else if (V(t, n)) t.framesSinceDraw++;
	else {
		t.ready = !1, e.context.activeTexture(e.context.TEXTURE0 + C), e.context.bindTexture(e.context.TEXTURE_2D, null), e.context.activeTexture(e.context.TEXTURE0), t.drawing = !0, e.mirrorCulling = {
			belowHeight: t.height + x,
			lodScale: 3,
			minimumPixelRadius: 5
		};
		try {
			r(P(n, t.height, t.target));
		} finally {
			e.mirrorCulling = null, t.drawing = !1;
		}
		e.context.bindTexture(e.context.TEXTURE_2D, t.target.texture), e.context.generateMipmap(e.context.TEXTURE_2D), t.matrix.set(e.viewProjection), t.drawnFrame = z(n), t.drawnRevision = t.partsRevision, t.framesSinceDraw = 0, t.ready = !0;
	}
}
function U(e, t) {
	if (t.program !== e.program) {
		let n = e.context, r = (t) => n.getUniformLocation(e.program, t);
		t.program = e.program, t.locations = {
			sampler: r("waterReflection"),
			matrix: r("waterReflectionMatrix"),
			clip: r("waterClip"),
			enabled: r("waterReflectionEnabled")
		};
	}
	return t.locations;
}
function W(e, t) {
	let n = j.get(e);
	if (!n || !e.shaderFeatures?.has("waterReflection")) return;
	let r = e.context, i = U(e, n), a = !!t[20] && n.ready && !n.drawing;
	r.uniform2f(i.clip, n.height, +!!n.drawing), r.uniform1f(i.enabled, +!!a), a && (r.activeTexture(r.TEXTURE0 + C), r.bindTexture(r.TEXTURE_2D, n.target.texture), r.uniform1i(i.sampler, C), r.uniformMatrix4fv(i.matrix, !1, n.matrix));
}
var G = e.bind;
e.bind = (e, t, n, r) => {
	G?.(e, t, n, r), W(e, t);
};
var K = /* @__PURE__ */ new WeakSet();
function q(e) {
	K.has(e) || (K.add(e), e.levelGeometries?.some((e) => e.mirrorOnly) && (e.mirrorErrors = e.levelErrors, e.levelErrors = e.levelErrors.map((t, n) => e.levelGeometries[n].mirrorOnly ? Infinity : t)));
}
function J(e, t, { scale: n = d, updateEvery: r = 1 } = {}) {
	if (!t) return () => {};
	let i = {
		height: t.height,
		scale: n,
		updateEvery: Math.max(1, Math.floor(r)),
		partsRevision: 0,
		drawnRevision: -1,
		drawnFrame: null,
		framesSinceDraw: 0,
		target: null,
		ready: !1,
		drawing: !1,
		matrix: /* @__PURE__ */ new Float32Array(16),
		program: null,
		locations: null
	};
	j.set(e, i), e.batches?.forEach(q);
	let a = e.render, o = e.dispose, s = e.updateParts, c = (t) => a.call(e, t), l = e.selectBatchInstances;
	return e.selectBatchInstances = (t) => {
		if (q(t), !i.drawing || !t.mirrorErrors) return l.call(e, t);
		let n = t.levelErrors;
		t.levelErrors = t.mirrorErrors;
		try {
			return l.call(e, t);
		} finally {
			t.levelErrors = n;
		}
	}, e.render = (t) => (e.batches?.forEach(q), !t.reflectionTarget && t.pass === void 0 && H(e, i, t, c), a.call(e, t)), s && (e.updateParts = (...t) => (i.partsRevision++, s.apply(e, t))), e.dispose = () => (N(e, i.target), j.delete(e), o.call(e)), () => {
		e.render = a, e.selectBatchInstances = l, e.dispose = o, s && (e.updateParts = s), N(e, i.target), j.delete(e);
	};
}
export { i as WATER_BLUR_LIMIT_ROUGHNESS, o as WATER_FADE_START_ROUGHNESS, a as WATER_MAXIMUM_BLUR_LEVEL, r as WATER_MAXIMUM_ROUGHNESS, l as WATER_MAXIMUM_THICKNESS_RATIO, u as WATER_MINIMUM_SCENE_SHARE, f as WATER_MIRROR_LOD_SCALE, p as WATER_MIRROR_MINIMUM_PIXEL_RADIUS, d as WATER_REFLECTION_SCALE, A as applyWaterReflection, J as attachWaterReflection, V as canReuseMirrorImage, O as findWaterSurface, s as waterMirrorLevel, c as waterMirrorWeight };
