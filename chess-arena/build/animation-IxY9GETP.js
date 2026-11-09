/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { d as e, l as t, n, o as r, r as i, t as a, u as o } from "./mat4-BCZClxna.js";
import { c as s, f as c } from "./quat-Bl7gjwWK.js";
// src/easing.js
var l = [
	"Sine",
	"Quad",
	"Cubic",
	"Quart",
	"Quint",
	"Expo",
	"Circ",
	"Back",
	"Bounce",
	"Elastic"
], u = [
	"In",
	"Out",
	"InOut"
], d = 1.525, f = 2 * Math.PI, p = 8, m = 48, ee = 1e-7, h = Object.freeze(["linear", ...l.flatMap((e) => u.map((t) => `ease${t}${e}`))]), te = new Set(h), g = new Map(h.map((e) => [e.toLowerCase(), e])), _ = /^([A-Za-z][A-Za-z-]*)\s*(?:\(([^()]*)\))?$/, v = [0, 1], y = [-4, 5], b = {
	Back: [{
		name: "overshoot",
		bounds: [0, 10],
		fallback: () => 1.70158
	}],
	Elastic: [{
		name: "amplitude",
		bounds: [1, 10],
		fallback: () => 1
	}, {
		name: "period",
		bounds: [.05, 2],
		fallback: (e) => e === "InOut" ? .45 : .3
	}]
}, x = "linear, cubic-bezier(x1, y1, x2, y2), or ease<In|Out|InOut><Sine|Quad|Cubic|Quart|Quint|Expo|Circ|Back|Bounce|Elastic>, such as easeOutBack; Back takes (overshoot) and Elastic (amplitude, period)";
function S(e) {
	return (t) => t ** e;
}
function C(e) {
	return (t) => 1 - (1 - t) ** e;
}
function w(e) {
	return (t) => t < .5 ? 2 ** (e - 1) * t ** e : 1 - (-2 * t + 2) ** e / 2;
}
var T = 2 ** -10, E = 1 - T;
function D(e) {
	return (2 ** (10 * (e - 1)) - T) / E;
}
function O(e) {
	return (1 - 2 ** (-10 * e)) / E;
}
function k(e) {
	if (e < 1 / 2.75) return 7.5625 * e * e;
	if (e < 2 / 2.75) {
		let t = e - 1.5 / 2.75;
		return 7.5625 * t * t + .75;
	}
	if (e < 2.5 / 2.75) {
		let t = e - 2.25 / 2.75;
		return 7.5625 * t * t + .9375;
	}
	let t = e - 2.625 / 2.75;
	return 7.5625 * t * t + .984375;
}
function A(e, t, n, r) {
	return t * 2 ** (10 * e) * Math.sin((e - r) * f / n);
}
function j(e, t) {
	return t / f * Math.asin(1 / e);
}
var M = {
	Sine: {
		In: (e) => 1 - Math.cos(e * Math.PI / 2),
		Out: (e) => Math.sin(e * Math.PI / 2),
		InOut: (e) => -(Math.cos(Math.PI * e) - 1) / 2
	},
	Quad: {
		In: S(2),
		Out: C(2),
		InOut: w(2)
	},
	Cubic: {
		In: S(3),
		Out: C(3),
		InOut: w(3)
	},
	Quart: {
		In: S(4),
		Out: C(4),
		InOut: w(4)
	},
	Quint: {
		In: S(5),
		Out: C(5),
		InOut: w(5)
	},
	Expo: {
		In: D,
		Out: O,
		InOut: (e) => e < .5 ? D(2 * e) / 2 : .5 + O(2 * e - 1) / 2
	},
	Circ: {
		In: (e) => 1 - Math.sqrt(1 - e * e),
		Out: (e) => Math.sqrt(1 - (e - 1) ** 2),
		InOut: (e) => e < .5 ? -.5 * (Math.sqrt(1 - (2 * e) ** 2) - 1) : .5 * (Math.sqrt(1 - (2 * e - 2) ** 2) + 1)
	},
	Bounce: {
		In: (e) => 1 - k(1 - e),
		Out: k,
		InOut: (e) => e < .5 ? (1 - k(1 - 2 * e)) / 2 : k(2 * e - 1) / 2 + .5
	}
};
function N(e, t) {
	if (e === "In") return (e) => e * e * ((t + 1) * e - t);
	if (e === "Out") return (e) => {
		let n = e - 1;
		return n * n * ((t + 1) * n + t) + 1;
	};
	let n = t * d;
	return (e) => {
		let t = e * 2;
		if (t < 1) return .5 * t * t * ((n + 1) * t - n);
		let r = t - 2;
		return .5 * (r * r * ((n + 1) * r + n) + 2);
	};
}
function ne(e, t, n) {
	let r = j(t, n), i = (e) => e === 0 ? 0 : e === 1 ? 1 : -A(e - 1, t, n, r);
	return e === "In" ? i : e === "Out" ? (e) => 1 - i(1 - e) : (e) => e < .5 ? i(2 * e) / 2 : 1 - i(2 * (1 - e)) / 2;
}
function re(e, t, n, r) {
	let i = (e, t, n) => {
		let r = 1 - n;
		return 3 * r * r * n * e + 3 * r * n * n * t + n ** 3;
	}, a = (t) => {
		let r = 1 - t;
		return 3 * r * r * e + 6 * r * t * (n - e) + 3 * t * t * (1 - n);
	};
	return (o) => {
		if (o <= 0) return 0;
		if (o >= 1) return 1;
		let s = o;
		for (let c = 0; c < p; c++) {
			let c = i(e, n, s) - o;
			if (Math.abs(c) < ee) return i(t, r, s);
			let l = a(s);
			if (Math.abs(l) < 1e-6) break;
			s -= c / l;
		}
		let c = 0, l = 1;
		s = o;
		for (let t = 0; t < m; t++) i(e, n, s) < o ? c = s : l = s, s = (c + l) / 2;
		return i(t, r, s);
	};
}
function P(e, t, n) {
	if (!Number.isFinite(e) || e < t[0] || e > t[1]) throw RangeError(`${n} must be a number from ${t[0]} to ${t[1]}.`);
	return e;
}
function F(e) {
	let t = typeof e == "string" ? e.replace(/\(.*$/s, "").trim() : void 0, n = t === void 0 ? void 0 : g.get(t.toLowerCase()), r = n ? ` Did you mean ${n}?` : "";
	return /* @__PURE__ */ RangeError(`Unknown easing ${JSON.stringify(e)}.${r} Use ${x}.`);
}
function ie(e) {
	let t = u.find((t) => e.startsWith(`ease${t}`) && l.includes(e.slice(4 + t.length)));
	return {
		direction: t,
		family: e.slice(4 + t.length)
	};
}
function I(e, t) {
	return e.trim() === "" ? [] : e.split(",").map((e) => {
		let n = Number(e);
		if (e.trim() === "" || !Number.isFinite(n)) throw RangeError(`${t} arguments must be finite numbers; got ${JSON.stringify(e.trim())}.`);
		return n;
	});
}
function L(e, t) {
	if (t.length !== 4) throw RangeError(`${e} needs four numbers: cubic-bezier(x1, y1, x2, y2).`);
	let [n, r, i, a] = t;
	return P(n, v, "cubic-bezier x1"), P(i, v, "cubic-bezier x2"), P(r, y, "cubic-bezier y1"), P(a, y, "cubic-bezier y2"), re(n, r, i, a);
}
function R(e, t) {
	let { direction: n, family: r } = ie(e), i = b[r] ?? [];
	if (t.length > i.length) {
		let t = i.length ? `${e}(${i.map((e) => e.name).join(", ")})` : e;
		throw RangeError(`${e} takes ${i.length ? `at most ${i.length} argument${i.length > 1 ? "s" : ""}` : "no arguments"}: ${t}.`);
	}
	let [a, o] = i.map((r, i) => t[i] === void 0 ? r.fallback(n) : P(t[i], r.bounds, `${e} ${r.name}`));
	return r === "Back" ? N(n, a) : r === "Elastic" ? ne(n, a, o) : M[r][n];
}
function z(e) {
	let t = typeof e == "string" ? _.exec(e.trim()) : null;
	if (!t) throw F(e);
	let n = t[1], r = t[2] !== void 0;
	if (n === "cubic-bezier") {
		if (!r) throw F(e);
		return L(n, I(t[2], n));
	}
	if (!te.has(n)) throw F(e);
	if (n === "linear") {
		if (r) throw RangeError("linear takes no arguments.");
		return (e) => e;
	}
	return R(n, r ? I(t[2], n) : []);
}
function B(e) {
	if (e.easing !== void 0) return z(e.easing), { easing: e.easing.trim() };
}
var V = /* @__PURE__ */ new WeakMap();
function H(e, t) {
	let n = V.get(e);
	return n || (n = z(e.easing), V.set(e, n)), n(t);
}
// src/animation.js
var U = {
	translation: 3,
	rotation: 4,
	scale: 3,
	value: 1,
	emission: 1,
	metallic: 1,
	roughness: 1
}, W = /* @__PURE__ */ new Set([
	"LINEAR",
	"STEP",
	"SMOOTH",
	"CUBICSPLINE"
]), G = /* @__PURE__ */ new Set([
	"emission",
	"metallic",
	"roughness"
]), K = 1e-8, q = /* @__PURE__ */ new WeakMap();
function J(e, t = { ...e.material }) {
	let n = q.get(e), r = n && n === e.material ? n : t;
	return e.material = r, q.set(e, r), r;
}
function Y(e, t) {
	let n = U[e];
	if (n === 1) {
		if (!Number.isFinite(t)) throw TypeError("Spline tangents must be finite numbers.");
		return t;
	}
	if (!Array.isArray(t) && !ArrayBuffer.isView(t) || t.length !== n || !Array.from(t).every(Number.isFinite)) throw TypeError(`${e} tangents need ${n} finite values.`);
	return Object.freeze(Array.from(t));
}
function ae(e, t) {
	let n = U[e];
	if (n === 1) {
		if (!Number.isFinite(t)) throw TypeError("Numeric keyframes must be finite.");
		if (e === "emission" && t < 0) throw RangeError("Emission keyframes cannot be negative.");
		if (["metallic", "roughness"].includes(e) && (t > 1 || t < 0 || e === "roughness" && t === 0)) throw RangeError(`${e} keyframes must stay within their material range.`);
		return t;
	}
	if (!Array.isArray(t) && !ArrayBuffer.isView(t) || t.length !== n || !Array.from(t).every(Number.isFinite)) throw TypeError(`${e} keyframes need ${n} finite values.`);
	let r = Array.from(t);
	if (e === "rotation") {
		let e = Math.hypot(...r);
		if (!Number.isFinite(e) || e < 1e-8) throw RangeError("Rotation keyframes need a finite nonzero quaternion length.");
		return Object.freeze(r.map((t) => t / e));
	}
	if (e === "scale" && r.some((e) => e < 0)) throw RangeError("Scale keyframes cannot be negative. Zero is allowed and hides the node.");
	return Object.freeze(r);
}
function oe({ duration: e, loop: t = !1, tracks: n = [] } = {}) {
	if (!Number.isFinite(e) || e <= 0) throw RangeError("Clip duration must be positive and finite.");
	if (typeof t != "boolean" || !Array.isArray(n)) throw TypeError("Clip loop must be boolean and tracks must be an array.");
	let r = /* @__PURE__ */ new Set(), i = n.map((t) => {
		if (!t || typeof t.target != "string" || !t.target.trim()) throw TypeError("Every track needs a target name.");
		if (!Object.hasOwn(U, t.property)) throw RangeError(`Unknown animation property: ${t.property}`);
		let n = `${t.target}\u0000${t.property}`;
		if (r.has(n)) throw RangeError("Each target property can have only one track.");
		r.add(n);
		let i = t.interpolation ?? "LINEAR";
		if (!W.has(i)) throw RangeError(`Unknown interpolation: ${i}`);
		if (!Array.isArray(t.keyframes) || !t.keyframes.length) throw RangeError("Tracks need at least one keyframe.");
		if (i === "CUBICSPLINE" && t.keyframes.length < 2) throw RangeError("Spline tracks need at least two keyframes.");
		let a = t.keyframes.map((n) => {
			if (!n || !Number.isFinite(n.time) || n.time < 0 || n.time > e) throw RangeError("Keyframe times must be within the clip duration.");
			let r = {
				time: n.time,
				value: ae(t.property, n.value)
			}, a = B(n);
			if (a && i !== "LINEAR" && i !== "SMOOTH") throw RangeError(`Keyframe easing needs LINEAR or SMOOTH interpolation, not ${i}.`);
			return Object.assign(r, a), i === "CUBICSPLINE" && (r.inTangent = Y(t.property, n.inTangent), r.outTangent = Y(t.property, n.outTangent)), Object.freeze(r);
		}).sort((e, t) => e.time - t.time);
		for (let e = 1; e < a.length; e++) if (a[e].time === a[e - 1].time) throw RangeError("Keyframe times must be distinct.");
		return Object.freeze({
			target: t.target,
			property: t.property,
			interpolation: i,
			keyframes: Object.freeze(a)
		});
	});
	return Object.freeze({
		duration: e,
		loop: t,
		tracks: Object.freeze(i)
	});
}
function se(e, t) {
	if (!Number.isFinite(t)) throw RangeError("Animation output must be finite. Reduce the values or tangents.");
	return e === "scale" ? Math.max(K, t) : e === "emission" ? Math.max(0, t) : e === "metallic" ? Math.max(0, Math.min(1, t)) : e === "roughness" ? Math.max(K, Math.min(1, t)) : t;
}
function X(e, t) {
	return typeof t == "number" ? e[0] = t : e.set(t), e;
}
function Z(e, t, n) {
	let r = e.keyframes, i = r[0], a = r[r.length - 1];
	if (t <= i.time) return X(n, i.value);
	if (t >= a.time) return X(n, a.value);
	let o = 0, s = r.length - 1;
	for (; s - o > 1;) {
		let e = Math.floor((o + s) / 2);
		r[e].time <= t ? o = e : s = e;
	}
	let l = r[o], u = r[s];
	if (t === l.time || e.interpolation === "STEP") return X(n, l.value);
	let d = u.time - l.time, f = (t - l.time) / d;
	if (e.interpolation === "CUBICSPLINE") {
		let t = f * f, r = t * f, i = 2 * r - 3 * t + 1, a = -2 * r + 3 * t, o = (r - 2 * t + f) * d, s = (r - t) * d;
		for (let t = 0; t < n.length; t++) {
			let r = n.length === 1, c = r ? l.value : l.value[t], d = r ? u.value : u.value[t], f = r ? l.outTangent : l.outTangent[t], p = r ? u.inTangent : u.inTangent[t];
			n[t] = se(e.property, i * c + o * f + a * d + s * p);
		}
		if (e.property === "rotation") {
			let e = Math.hypot(n[0], n[1], n[2], n[3]);
			if (!Number.isFinite(e) || e === 0) throw RangeError("Spline produced an invalid quaternion. Adjust the rotation tangents.");
			for (let t = 0; t < 4; t++) n[t] /= e;
		}
		return n;
	}
	if (l.easing === void 0 ? e.interpolation === "SMOOTH" && (f = f * f * (3 - 2 * f)) : f = H(l, f), e.property === "rotation") return c(n, l.value, u.value, f);
	for (let e = 0; e < n.length; e++) {
		let t = n.length === 1 ? l.value : l.value[e], r = n.length === 1 ? u.value : u.value[e];
		n[e] = t + (r - t) * f;
	}
	return n;
}
function Q(e, t) {
	if (!e.keyframes.some((e) => e.easing !== void 0)) return e.keyframes;
	let n = U[e.property], r = [];
	for (let i = 0; i < e.keyframes.length; i++) {
		let a = e.keyframes[i];
		r.push({
			time: a.time,
			value: a.value
		});
		let o = e.keyframes[i + 1];
		if (!o) break;
		for (let i = 1; i < t; i++) {
			let s = a.time + (o.time - a.time) * i / t, c = Z(e, s, new Float64Array(n));
			r.push({
				time: s,
				value: n === 1 ? c[0] : Array.from(c)
			});
		}
	}
	return r;
}
function $(e, t) {
	if (!Number.isFinite(t)) throw TypeError("Animation time must be finite.");
	if (!e.loop) return Math.max(0, Math.min(e.duration, t));
	let n = t % e.duration;
	return n < 0 ? n + e.duration : n;
}
function ce(e, t) {
	let n = $(e, t);
	return e.tracks.map((e) => {
		let t = Z(e, n, new Float64Array(U[e.property])), r = t.length === 1 ? t[0] : Array.from(t);
		return {
			target: e.target,
			property: e.property,
			value: r
		};
	});
}
function le(e) {
	let t = e.tracks.map((e) => ({
		target: e.target,
		property: e.property,
		output: new Float64Array(U[e.property])
	}));
	return {
		tracks: t,
		sample(n) {
			let r = $(e, n);
			for (let n = 0; n < t.length; n++) Z(e.tracks[n], r, t[n].output);
			return t;
		}
	};
}
function ue(c, l) {
	let u = /* @__PURE__ */ new Map();
	for (let e of l) {
		if (u.has(e.name)) throw RangeError(`Duplicate animated part name: ${e.name}`);
		u.set(e.name, e);
	}
	let d = /* @__PURE__ */ new Map(), f = [];
	for (let r of c.tracks) {
		let c = u.get(r.target);
		if (!c) throw RangeError(`Animation target was not found: ${r.target}`);
		if (r.property === "value") throw RangeError("Value tracks are sampled directly, rather than bound to parts.");
		if (!d.has(r.target)) {
			if (!(c.matrix instanceof Float32Array) || c.matrix.length !== 16 || !Array.from(c.matrix).every(Number.isFinite)) throw TypeError("Animated parts need a finite Float32Array matrix.");
			let l = e(/* @__PURE__ */ new Float64Array(3), c.matrix), u = o(/* @__PURE__ */ new Float64Array(3), c.matrix);
			if (Array.from(u).some((e) => e < Math.fround(K))) throw RangeError("Animated matrices must have nonzero scale.");
			let f = a(c.matrix);
			for (let e = 0; e < 3; e++) for (let t = 0; t < 3; t++) f[e * 4 + t] /= u[e];
			if (i(f) < .9999) throw RangeError("Animated matrices must use rotation and positive scale without shear.");
			let p = s(/* @__PURE__ */ new Float64Array(4), t(/* @__PURE__ */ new Float64Array(4), f));
			d.set(r.target, {
				part: c,
				translation: l,
				scale: u,
				rotation: p,
				matrix: n(),
				hasTransform: !1,
				material: null
			});
		}
		let l = d.get(r.target), p = G.has(r.property);
		if (p && !l.material) {
			let e = q.get(c);
			l.material = e && e === c.material ? e : { ...c.material };
		}
		p || (l.hasTransform = !0);
		let m = p ? /* @__PURE__ */ new Float64Array(1) : l[r.property];
		f.push({
			track: r,
			binding: l,
			output: m,
			materialTrack: p
		});
	}
	let p = Array.from(d.values());
	for (let e of p) e.material &&= J(e.part, e.material);
	return {
		clip: c,
		apply(e) {
			let t = $(c, e);
			for (let e of f) Z(e.track, t, e.output);
			for (let e of p) if (e.hasTransform) {
				r(e.matrix, e.rotation, e.translation, e.scale);
				for (let t = 0; t < 16; t++) if (!Number.isFinite(e.matrix[t])) throw RangeError("Animated matrix exceeds the finite float range. Reduce the transform values.");
			}
			for (let e of f) e.materialTrack && (e.binding.material[e.track.property] = e.output[0]);
			for (let e of p) e.hasTransform && e.part.matrix.set(e.matrix);
			return l;
		}
	};
}
export { J as a, ue as i, le as n, ce as o, oe as r, B as s, Q as t };
