/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./shader-registry-DHYkwAg5.js";
import { t } from "./renderer-GTkED2u-.js";
import { c as n, i as r, s as i, t as a } from "./geometry-C1ukZMAo.js";
import { t as o } from "./export-CC2yRYRG.js";
import { d as s, l as c, n as l, o as u, r as d, t as f, u as p } from "./mat4-BCZClxna.js";
import { c as m, f as h } from "./quat-Bl7gjwWK.js";
import { a as g, i as _, n as v, o as y, r as b } from "./animation-IxY9GETP.js";
import { t as x } from "./scene-graph-D7m1CRQ0.js";
import { i as S, t as C } from "./skinning-DjFQA5hH.js";
import { t as w } from "./morph-CbizhGSZ.js";
import { r as T } from "./environment-H0LjiCAj.js";
import { a as E, n as D, t as O } from "./budget-DiDbAzh2.js";
import { n as k } from "./assembly-CVbal4ya.js";
import { a as A, i as j, o as M } from "./camera-DqWdI22s.js";
import { n as N, t as P } from "./camera-path-jvnqstYo.js";
import { i as F, r as I } from "./lighting-Dfe9GFwf.js";
// src/version.js
var L = "0.16.0", R = /* @__PURE__ */ new Set([
	"emission",
	"metallic",
	"roughness"
]), z = 1e-8;
function B(e) {
	if (!Number.isFinite(e)) throw TypeError("Mixer times must be finite.");
	return e;
}
function V(e) {
	if (!Number.isFinite(e) || e < 0 || e > 1) throw RangeError("Action weights must be finite and within [0, 1].");
	return e;
}
function H(e) {
	if (!(e.matrix instanceof Float32Array) || e.matrix.length !== 16 || !e.matrix.every(Number.isFinite)) throw TypeError("Mixer parts need finite Float32Array matrices.");
	if (e.matrix[3] !== 0 || e.matrix[7] !== 0 || e.matrix[11] !== 0 || e.matrix[15] !== 1) throw RangeError("Mixer matrices must be affine transforms.");
	let t = f(e.matrix), n = s(/* @__PURE__ */ new Float64Array(3), t), r = p(/* @__PURE__ */ new Float64Array(3), t);
	if (r.some((e) => e < Math.fround(z))) throw RangeError("Mixer matrices need nonzero positive scale.");
	let i = f(t);
	for (let e = 0; e < 3; e++) for (let t = 0; t < 3; t++) i[e * 4 + t] /= r[e];
	if (d(i) < .9999) throw RangeError("Mixer matrices cannot contain shear or reflected scale.");
	let a = m(/* @__PURE__ */ new Float64Array(4), c(/* @__PURE__ */ new Float64Array(4), i));
	return {
		part: e,
		originalMatrix: t,
		matrix: l(),
		base: {
			translation: n,
			rotation: a,
			scale: r,
			material: { ...e.material }
		},
		translation: new Float64Array(n),
		rotation: new Float64Array(a),
		scale: new Float64Array(r),
		properties: /* @__PURE__ */ new Map(),
		material: null,
		hasTransform: !1,
		transformWeight: 0
	};
}
function U(e, t) {
	let n = R.has(t), r, i;
	if (n) {
		let n = e.base.material[t] ?? (t === "emission" ? 0 : NaN);
		if (!Number.isFinite(n) || n < 0 || t === "metallic" && n > 1 || t === "roughness" && (n <= 0 || n > 1)) throw RangeError(`Mixer base ${t} must stay within its material range.`);
		r = new Float64Array([n]), i = /* @__PURE__ */ new Float64Array(1);
	} else {
		if (r = e.base[t], !r) throw RangeError(`Unsupported mixer property: ${t}`);
		i = e[t];
	}
	return {
		binding: e,
		property: t,
		base: r,
		output: i,
		materialProperty: n,
		weight: 0
	};
}
function W(e, t) {
	let n = e.timeline, r = -1, i = n.length;
	for (; i - r > 1;) {
		let e = Math.floor((r + i) / 2);
		n[e].at <= t ? r = e : i = e;
	}
	return r < 0 ? e.initial : n[r];
}
function G(e, t) {
	if (!e.playing) return 0;
	if (t >= e.fadeEnd) return e.toWeight;
	if (t <= e.at) return e.fromWeight;
	let n = (t - e.at) / (e.fadeEnd - e.at);
	return e.fromWeight * (1 - n) + e.toWeight * n;
}
function K(e, t) {
	B(t);
	let n = e.timeline;
	if (n.length && t < n[n.length - 1].at) throw RangeError("Schedule action controls in nondecreasing time order.");
	return W(e, t);
}
function q(e, { at: t = 0, offset: n = 0, timeScale: r = 1, weight: i = 1 } = {}) {
	if (K(e, t), B(n), !Number.isFinite(r)) throw TypeError("Action timeScale must be finite.");
	return V(i), {
		at: t,
		playing: !0,
		origin: t,
		offset: n,
		timeScale: r,
		fromWeight: i,
		toWeight: i,
		fadeEnd: t
	};
}
function J(e, t, n, r, i = K(e, n)) {
	if (V(t), !Number.isFinite(r) || r <= 0 || !Number.isFinite(n + r) || n + r <= n) throw RangeError("Fade duration must produce a finite end time after its start.");
	if (!i.playing) throw RangeError("Play the action before scheduling its fade.");
	return {
		...i,
		at: n,
		fromWeight: G(i, n),
		toWeight: t,
		fadeEnd: n + r
	};
}
function Y(e, t, n) {
	let r = e.weight + n;
	if (e.weight === 0) e.output.set(t);
	else {
		let i = n / r;
		if (e.property === "rotation") h(e.output, e.output, t, i);
		else for (let n = 0; n < e.output.length; n++) e.output[n] = e.output[n] * (1 - i) + t[n] * i;
	}
	e.weight = r;
}
function X(e) {
	let t = e.output;
	if (e.weight < 1 && e.weight > 0) {
		if (e.property === "rotation") h(t, e.base, t, e.weight);
		else for (let n = 0; n < t.length; n++) t[n] = t[n] * e.weight + e.base[n] * (1 - e.weight);
	}
	for (let n = 0; n < t.length; n++) {
		if (!Number.isFinite(t[n])) throw RangeError("Mixed animation output must be finite.");
		(e.property === "scale" || e.property === "roughness") && (t[n] = Math.max(z, t[n])), e.property === "emission" && (t[n] = Math.max(0, t[n])), e.property === "metallic" && (t[n] = Math.max(0, t[n])), (e.property === "metallic" || e.property === "roughness") && (t[n] = Math.min(1, t[n]));
	}
	if (e.property === "rotation") {
		let e = Math.hypot(t[0], t[1], t[2], t[3]);
		if (!Number.isFinite(e) || e === 0) throw RangeError("Mixed rotation must be a finite nonzero quaternion.");
		for (let n = 0; n < 4; n++) t[n] /= e;
	}
	e.materialProperty || (e.binding.transformWeight += e.weight);
}
function Z(e) {
	if (!Array.isArray(e)) throw TypeError("Mixer parts must be an array.");
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) {
		if (!r || typeof r.name != "string" || !r.name.trim()) throw TypeError("Mixer parts need names.");
		if (t.has(r.name)) throw RangeError(`Duplicate mixer part name: ${r.name}`);
		let e = H(r);
		t.set(r.name, e), n.push(e);
	}
	let r = [], i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = 0;
	function c(e) {
		if (a.has(e)) return a.get(e);
		let n = v(e), c = [], l = [];
		for (let e of n.tracks) {
			let n = t.get(e.target);
			if (!n) throw RangeError(`Mixer target was not found: ${e.target}`);
			if (e.property === "value") throw RangeError("Value tracks cannot bind to mixer parts.");
			let r = n.properties.get(e.property) ?? U(n, e.property);
			n.properties.has(e.property) || l.push(r), c.push({
				property: r,
				sample: e.output
			});
		}
		let u = {
			sampler: n,
			entries: c,
			timeline: [],
			initial: {
				at: -Infinity,
				playing: !1,
				origin: 0,
				offset: 0,
				timeScale: 1,
				fromWeight: 0,
				toWeight: 0,
				fadeEnd: -Infinity
			}
		}, d = Object.freeze({
			clip: e,
			play({ at: e = s, offset: t = 0, timeScale: n = 1, weight: r = 1 } = {}) {
				return u.timeline.push(q(u, {
					at: e,
					offset: t,
					timeScale: n,
					weight: r
				})), d;
			},
			stop(e = s) {
				let t = K(u, e);
				return u.timeline.push({
					...t,
					at: e,
					playing: !1,
					fromWeight: 0,
					toWeight: 0,
					fadeEnd: e
				}), d;
			},
			fadeTo(e, { at: t = s, duration: n } = {}) {
				return u.timeline.push(J(u, e, t, n)), d;
			},
			getState(e = s) {
				B(e);
				let t = W(u, e), n = "stopped";
				return t.playing && (n = e < t.fadeEnd ? "fading" : "playing"), t === u.initial && u.timeline.length && u.timeline[0].playing && (n = "scheduled"), {
					phase: n,
					playing: t.playing,
					weight: G(t, e),
					localTime: t.playing ? (e - t.origin) * t.timeScale + t.offset : null
				};
			}
		});
		for (let e of l) {
			let t = e.binding;
			t.properties.set(e.property, e), r.push(e), e.materialProperty ? t.material ||= g(t.part) : t.hasTransform = !0;
		}
		return i.push(u), a.set(e, d), o.set(d, u), d;
	}
	let l = {
		clipAction: c,
		get time() {
			return s;
		},
		crossFade(e, t, { at: n = s, duration: r } = {}) {
			let i = o.get(e), a = o.get(t);
			if (!i || !a || i === a) throw RangeError("Crossfade needs two distinct actions from this mixer.");
			let c = J(i, 0, n, r), u = K(a, n), d = J(a, 1, n, r, u.playing ? u : q(a, {
				at: n,
				weight: 0
			}));
			return i.timeline.push(c), a.timeline.push(d), l;
		},
		apply(t) {
			B(t);
			for (let e = 0; e < r.length; e++) {
				let t = r[e];
				t.output.set(t.base), t.weight = 0;
			}
			for (let e = 0; e < n.length; e++) n[e].transformWeight = 0;
			for (let e = 0; e < i.length; e++) {
				let n = i[e], r = W(n, t), a = G(r, t);
				if (a !== 0) {
					n.sampler.sample((t - r.origin) * r.timeScale + r.offset);
					for (let e = 0; e < n.entries.length; e++) {
						let t = n.entries[e];
						Y(t.property, t.sample, a);
					}
				}
			}
			for (let e = 0; e < r.length; e++) X(r[e]);
			for (let e = 0; e < n.length; e++) {
				let t = n[e];
				if (t.hasTransform) {
					t.transformWeight === 0 ? t.matrix.set(t.originalMatrix) : u(t.matrix, t.rotation, t.translation, t.scale);
					for (let e = 0; e < 16; e++) if (!Number.isFinite(t.matrix[e])) throw RangeError("Mixed matrix exceeds the finite Float32 range.");
				}
			}
			for (let e = 0; e < r.length; e++) {
				let t = r[e];
				t.materialProperty && (t.binding.material[t.property] = t.output[0]);
			}
			for (let e = 0; e < n.length; e++) {
				let t = n[e];
				t.hasTransform && t.part.matrix.set(t.matrix);
			}
			return s = t, e;
		}
	};
	return l;
}
export { I as EFFECT_PRESETS, t as Glaze, t as Renderer67, e as MAX_MORPH_TARGETS, O as RENDER_PRESETS, L as VERSION, k as assemblyOffset, a as box, j as cameraView, b as createAnimationClip, Z as createAnimationMixer, _ as createAnimationPlayer, P as createCameraPath, T as createEnvironmentMap, w as createMorphPose, x as createSceneGraph, C as createSkinPose, r as cylinder, D as estimateFrameBytes, o as exportGlb, A as fitOrthographicHeight, M as fitPerspectiveDistance, N as fovFromFocalLength, E as planRenderSize, F as resolveEffects, y as sampleAnimationClip, i as sphere, n as torus, S as updateSkinPose };
