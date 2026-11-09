/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { a as e, d as t, h as n, l as r, n as i, o as a, p as o, t as s, u as c } from "./mat4-BCZClxna.js";
import { c as l, d as u, o as d, r as f, s as p } from "./quat-Bl7gjwWK.js";
import { S as m, h, l as g, m as _, y as v } from "./vec3-BRYC6f_g.js";
import { n as y, r as b } from "./animation-IxY9GETP.js";
import { i as x } from "./skinning-DjFQA5hH.js";
// src/retarget.js
var S = ["left", "right"], C = [
	"thumb",
	"index",
	"middle",
	"ring",
	"little"
], w = [
	"proximal",
	"intermediate",
	"distal"
], T = [
	"hips",
	"spine",
	"chest",
	"upperChest",
	"neck",
	"head"
], E = [
	"shoulder",
	"upperArm",
	"lowerArm",
	"hand",
	"upperLeg",
	"lowerLeg",
	"foot",
	"toes"
], D = new Set(E), O = [
	"upperArm",
	"lowerArm",
	"hand",
	"upperLeg",
	"lowerLeg",
	"foot"
];
function k(e) {
	return e[0].toUpperCase() + e.slice(1);
}
function A(e, t) {
	return `${e}${k(t)}`;
}
function j() {
	let e = [...T];
	for (let t of S) for (let n of E) e.push(A(t, n));
	for (let t of S) for (let n of C) for (let r of w) e.push(`${t}${k(n)}${k(r)}`);
	return Object.freeze(e);
}
var M = j(), N = Object.freeze([
	"hips",
	"spine",
	"head",
	...S.flatMap((e) => O.map((t) => A(e, t)))
]), P = {
	hips: [
		"hips",
		"pelvis",
		"hip"
	],
	spine: [
		"spine",
		"spine01",
		"abdomen"
	],
	chest: [
		"chest",
		"spine1",
		"spine02",
		"torso"
	],
	upperChest: [
		"upperchest",
		"spine2",
		"spine03"
	],
	neck: [
		"neck",
		"neck01",
		"neck1"
	],
	head: ["head"],
	shoulder: [
		"shoulder",
		"clavicle",
		"collar"
	],
	upperArm: ["arm", "upperarm"],
	lowerArm: ["forearm", "lowerarm"],
	hand: [
		"hand",
		"fist",
		"wrist"
	],
	upperLeg: [
		"upleg",
		"upperleg",
		"thigh"
	],
	lowerLeg: [
		"leg",
		"lowerleg",
		"calf",
		"shin"
	],
	foot: ["foot", "ankle"],
	toes: [
		"toes",
		"toe",
		"toebase",
		"ball"
	]
}, F = {
	hips: ["spine"],
	spine: ["spine001"],
	chest: ["spine002"],
	upperChest: ["spine003"],
	neck: ["spine004"],
	head: ["spine006", "head"]
}, I = /^(mixamorig\d*|bip\d*|j|bip|c|def|org|cc|base|armature)$/, L = /^(?:hand|f)?(thumb|index|middle|ring|pinky|little)(proximal|intermediate|distal|\d+)?$/;
function R(e) {
	let t = /* @__PURE__ */ new Map();
	for (let [n, r] of Object.entries(e)) for (let e of r) t.set(e, n);
	return t;
}
var z = R(P), ee = R({
	...P,
	...F
});
function te(e) {
	return e.slice(e.lastIndexOf(":") + 1).replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}
function ne(e) {
	let t = null, n = [];
	for (let r of te(e)) r === "left" || r === "l" ? t = "left" : r === "right" || r === "r" ? t = "right" : I.test(r) || n.push(r);
	return {
		side: t,
		key: n.join("")
	};
}
function re(e) {
	return e ? w.includes(e) ? e : w[Number.parseInt(e, 10) - 1] ?? null : null;
}
function ie(e, t) {
	let n = t.get(e.key);
	if (n) return D.has(n) ? e.side ? A(e.side, n) : null : n;
	let r = L.exec(e.key);
	if (!r || !e.side) return null;
	let i = re(r[2]);
	if (!i) return null;
	let a = r[1] === "pinky" ? "little" : r[1];
	return `${e.side}${k(a)}${k(i)}`;
}
function B(e, { overrides: t = {} } = {}) {
	if (!Array.isArray(e) || e.some((e) => typeof e != "string")) throw TypeError("Joint names must be an array of strings.");
	let n = {};
	for (let [r, i] of Object.entries(t)) {
		if (!M.includes(r)) throw RangeError(`Unknown humanoid bone in overrides: ${r}`);
		if (!e.includes(i)) throw RangeError(`Override joint was not found in the rig: ${i}`);
		n[r] = i;
	}
	let r = e.some((e) => /^def-/i.test(e)), i = r ? ee : z, a = new Set(Object.values(t));
	for (let t of e) {
		if (a.has(t) || r && !/^def-/i.test(t)) continue;
		let e = ie(ne(t), i);
		e && !Object.hasOwn(n, e) && (n[e] = t);
	}
	let o = new Set(Object.values(n));
	return {
		mapping: n,
		unmapped: e.filter((e) => !o.has(e)),
		missing: N.filter((e) => !Object.hasOwn(n, e))
	};
}
function V(e) {
	let n = s(e), i = c(/* @__PURE__ */ new Float64Array(3), e);
	for (let e = 0; e < 3; e++) for (let t = 0; t < 3; t++) n[e * 4 + t] /= i[e];
	return {
		translation: Array.from(t(/* @__PURE__ */ new Float64Array(3), e)),
		rotation: Array.from(l(/* @__PURE__ */ new Float64Array(4), r(/* @__PURE__ */ new Float64Array(4), n))),
		scale: Array.from(i)
	};
}
function H(e) {
	return o(i(), e) ?? i();
}
function U(e, { rootMatrix: t = i() } = {}) {
	if (!e?.joints || !e.inverseBindMatrices) throw TypeError("A skin with joints and inverseBindMatrices is required.");
	let r = e.joints.map((t, n) => H(e.inverseBindMatrices.subarray(n * 16, n * 16 + 16))), a = H(t);
	return {
		joints: e.joints.map((e, o) => {
			let s = e.parent >= 0 ? r[e.parent] : t, c = e.parent >= 0 ? H(s) : a, l = n(i(), c, r[o]);
			return {
				name: e.name,
				parent: e.parent,
				...V(l)
			};
		}),
		rootMatrix: Array.from(t)
	};
}
function W(e, t) {
	let n = [], r = Array(e.length).fill(0);
	function i(a) {
		if (r[a] === 2) return;
		if (r[a] === 1) throw RangeError(`${t} rig joints form a cycle.`);
		r[a] = 1;
		let o = e[a].parent;
		o >= 0 && i(o), r[a] = 2, n.push(a);
	}
	for (let t = 0; t < e.length; t++) i(t);
	return n;
}
function G(e, t) {
	if (!Array.isArray(e) || !e.length) throw TypeError(`${t} rig needs a non-empty joints array.`);
	e.forEach((n) => {
		let r = Number.isInteger(n.parent) && n.parent >= -1 && n.parent < e.length;
		if (typeof n.name != "string" || !r) throw TypeError(`${t} rig joints need a name and a parent index.`);
		if (n.translation?.length !== 3 || n.rotation?.length !== 4) throw TypeError(`${t} rig joint ${n.name} needs translation and rotation rest values.`);
	});
}
function K(e) {
	let t = (t) => Array.from({ length: e }, () => new Float64Array(t));
	return {
		rotations: t(4),
		positions: t(3),
		scales: new Float64Array(e)
	};
}
function q(e, t, n, r, i) {
	let a = e.joints[n].parent, o = a >= 0 ? t.rotations[a] : e.rootRotation, s = a >= 0 ? t.positions[a] : e.rootPosition, c = a >= 0 ? t.scales[a] : e.rootScale;
	p(t.rotations[n], o, r);
	let l = m(/* @__PURE__ */ new Float64Array(3), i, o);
	h(t.positions[n], s, l, c), t.scales[n] = c * e.localScales[n];
}
function J(e, t, n, r) {
	for (let i of e.order) q(e, t, i, n[i], r[i]);
}
function Y(e, t, n) {
	G(e?.joints, t);
	let r = e.joints.map((e) => e.name);
	if (new Set(r).size !== r.length) throw RangeError(`${t} rig joint names must be unique.`);
	let { mapping: i, missing: a } = e.mapping ? {
		mapping: e.mapping,
		missing: N.filter((t) => !e.mapping[t])
	} : B(r, { overrides: n });
	if (a.length) {
		let e = /* @__PURE__ */ RangeError(`${t} rig is not humanoid. Missing bones: ${a.join(", ")}. Pass overrides to map them.`);
		throw e.missingBones = a, e;
	}
	let o = new Map(r.map((e, t) => [e, t])), s = {};
	for (let [e, n] of Object.entries(i)) {
		if (!o.has(n)) throw RangeError(`${t} mapping names a joint that is not in the rig: ${n}`);
		s[e] = o.get(n);
	}
	return {
		...X(e, t),
		indexByBone: s
	};
}
function X(e, t) {
	let n = e.joints, r = V(e.rootMatrix ? Float64Array.from(e.rootMatrix) : i()), a = {
		joints: n,
		indexByName: new Map(n.map((e, t) => [e.name, t])),
		order: W(n, t),
		localScales: n.map((e) => e.scale?.[0] ?? 1),
		restRotations: n.map((e) => l(/* @__PURE__ */ new Float64Array(4), e.rotation)),
		restTranslations: n.map((e) => Float64Array.from(e.translation)),
		rootRotation: Float64Array.from(r.rotation),
		rootPosition: Float64Array.from(r.translation),
		rootScale: r.scale[0],
		restWorld: K(n.length)
	};
	return J(a, a.restWorld, a.restRotations, a.restTranslations), a;
}
function Z(e) {
	let t = e.restWorld.positions[e.indexByBone.hips], n = S.map((n) => Math.abs(t[1] - e.restWorld.positions[e.indexByBone[A(n, "foot")]][1])), r = (n[0] + n[1]) / 2;
	if (!(r > 0)) throw RangeError("Rig hips must sit above the feet in the rest pose (+Y up).");
	return r;
}
function ae(e, t, n) {
	let r = M.filter((n) => n in e.indexByBone && n in t.indexByBone);
	if (!n) return r;
	for (let e of n) if (!r.includes(e)) throw RangeError(`Bone is not mapped in both rigs: ${e}`);
	return r.filter((e) => n.includes(e));
}
function oe(e, t) {
	let n = [];
	for (let r = 0; r / t < e - 1e-9; r++) n.push(r / t);
	return n.push(e), n;
}
function Q(e, t) {
	let n = [];
	for (let r of e.tracks) {
		let e = t.indexByName.get(r.target);
		e !== void 0 && (r.property === "rotation" || r.property === "translation") && n.push({
			index: e,
			property: r.property,
			output: r.output
		});
	}
	return n;
}
function se(e, t, n, r) {
	let i = K(e.joints.length), a = K(t.joints.length), o = e.restRotations.map((e) => Float64Array.from(e)), s = e.restTranslations.map((e) => Float64Array.from(e)), c = t.restRotations.map((e) => Float64Array.from(e)), u = t.restTranslations.map((e) => Float64Array.from(e)), f = new Map(n.map((n) => [t.indexByBone[n], e.indexByBone[n]])), g = e.indexByBone.hips, y = t.indexByBone.hips, b = Z(t) / Z(e) * r.scale, x = f.has(y);
	function S(t) {
		let n = d(/* @__PURE__ */ new Float64Array(4), e.restWorld.rotations[t]);
		return p(/* @__PURE__ */ new Float64Array(4), i.rotations[t], n);
	}
	function C() {
		let n = v(/* @__PURE__ */ new Float64Array(3), i.positions[g], e.restWorld.positions[g]);
		return r.rootMotion || (n[0] = 0, n[2] = 0), h(/* @__PURE__ */ new Float64Array(3), t.restWorld.positions[y], n, b);
	}
	function w(e, n) {
		let r = t.joints[e].parent, i = r >= 0 ? a.rotations[r] : t.rootRotation, o = r >= 0 ? a.positions[r] : t.rootPosition, s = r >= 0 ? a.scales[r] : t.rootScale, c = v(/* @__PURE__ */ new Float64Array(3), n, o);
		return _(c, c, 1 / s), m(c, c, d(/* @__PURE__ */ new Float64Array(4), i));
	}
	return function(n) {
		for (let e of n) (e.property === "rotation" ? o[e.index] : s[e.index]).set(e.output);
		J(e, i, o, s);
		for (let e of t.order) {
			let n = t.joints[e].parent, r = n >= 0 ? a.rotations[n] : t.rootRotation, i = f.get(e);
			if (i !== void 0) {
				let n = p(/* @__PURE__ */ new Float64Array(4), S(i), t.restWorld.rotations[e]);
				p(c[e], d(/* @__PURE__ */ new Float64Array(4), r), n), l(c[e], c[e]);
			}
			x && e === y && u[e].set(w(e, C())), q(t, a, e, c[e], u[e]);
		}
		return {
			rotations: c,
			translations: u
		};
	};
}
function ce(e, t, n, r = {}) {
	let { bones: i, rootMotion: a = !0, scale: o = 1, frameRate: s = 30, sourceOverrides: c, targetOverrides: l } = r;
	if (!Number.isFinite(o) || o <= 0) throw RangeError("Retarget scale must be positive.");
	if (!Number.isFinite(s) || s <= 0) throw RangeError("Retarget frameRate must be positive.");
	let u = Y(e, "Source", c), d = Y(t, "Target", l), p = ae(u, d, i), m = y(n), h = Q(m, u), g = se(u, d, p, {
		rootMotion: a,
		scale: o
	}), _ = p.map((e) => d.indexByBone[e]), v = d.indexByBone.hips, x = oe(n.duration, s), S = _.map(() => []), C = [];
	x.forEach((e) => {
		m.sample(e);
		let t = g(h);
		_.forEach((n, r) => {
			let i = S[r], a = Array.from(t.rotations[n]), o = i[i.length - 1]?.value;
			o && f(o, a) < 0 && a.forEach((e, t) => {
				a[t] = -a[t];
			}), i.push({
				time: e,
				value: a
			});
		}), _.includes(v) && C.push({
			time: e,
			value: Array.from(t.translations[v])
		});
	});
	let w = _.map((e, t) => ({
		target: d.joints[e].name,
		property: "rotation",
		keyframes: S[t]
	}));
	return C.length && w.push({
		target: d.joints[v].name,
		property: "translation",
		keyframes: C
	}), b({
		duration: n.duration,
		loop: n.loop,
		tracks: w
	});
}
function le(e, t, { rig: n = U(e), meshWorldMatrix: r = e.bindMatrix ?? i() } = {}) {
	G(n.joints, "Skin");
	let o = X(n, "Skin"), s = e.bindMatrix ?? i(), c = y(t), l = Q(c, o), u = o.restRotations.map((e) => Float64Array.from(e)), d = o.restTranslations.map((e) => Float64Array.from(e)), f = K(n.joints.length), p = new Float32Array(n.joints.length * 16), m = i();
	return {
		clip: t,
		apply(t) {
			c.sample(t);
			for (let e of l) (e.property === "rotation" ? u : d)[e.index].set(e.output);
			J(o, f, u, d);
			for (let e = 0; e < n.joints.length; e++) {
				let t = g(f.scales[e], f.scales[e], f.scales[e]);
				a(m, f.rotations[e], f.positions[e], t), p.set(m, e * 16);
			}
			return x(e, p, e.inverseBindMatrices, r, s), e;
		}
	};
}
function $(e) {
	let t = e >>> 0;
	return function() {
		t = t + 1831565813 >>> 0;
		let e = Math.imul(t ^ t >>> 15, 1 | t);
		return e = e + Math.imul(e ^ e >>> 7, 61 | e) ^ e, ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function ue(e, t, n) {
	let r = Math.ceil(e / n);
	return Array.from({ length: e }, (e, i) => [
		(i % n - (n - 1) / 2) * t,
		0,
		(Math.floor(i / n) - (r - 1) / 2) * t
	]);
}
function de(e, t, n, r) {
	let i = [], a = t * .75;
	for (let t = 0; t < e; t++) {
		let e;
		for (let t = 0; t < 40 && (e = [
			(r() - .5) * n,
			0,
			(r() - .5) * n
		], !i.every((t) => Math.hypot(t[0] - e[0], t[2] - e[2]) >= a)); t++);
		i.push(e);
	}
	return i;
}
function fe({ count: t, clip: n, seed: r = 1, layout: i = "grid", spacing: a = 1.5, columns: o, size: s, rateJitter: c = .15, randomYaw: l = !1 } = {}) {
	if (!Number.isInteger(t) || t < 1) throw RangeError("Crowd count must be a positive integer.");
	if (!n?.tracks) throw TypeError("A clip is required.");
	if (!["grid", "scatter"].includes(i)) throw RangeError(`Unknown crowd layout: ${i}`);
	if (!Number.isFinite(a) || a <= 0) throw RangeError("Crowd spacing must be positive.");
	if (!Number.isFinite(c) || c < 0 || c >= 1) throw RangeError("rateJitter must be at least 0 and below 1.");
	let d = $(r), f = (i === "grid" ? ue(t, a, o ?? Math.ceil(Math.sqrt(t))) : de(t, a, s ?? Math.sqrt(t) * a * 1.5, d)).map((t, r) => {
		let i = d() * n.duration, a = 1 + (d() * 2 - 1) * c, o = l ? d() * Math.PI * 2 : 0, s = e(/* @__PURE__ */ new Float32Array(16), u(/* @__PURE__ */ new Float64Array(4), [
			0,
			1,
			0
		], o), t);
		return Object.freeze({
			index: r,
			position: t,
			yawRadians: o,
			timeOffset: i,
			playbackRate: a,
			matrix: s
		});
	}), p = f.map(() => y(n));
	function m(e, t) {
		let n = f[e];
		return n.timeOffset + t * n.playbackRate;
	}
	return {
		instances: Object.freeze(f),
		clipTime: m,
		sample(e) {
			return f.map((t, n) => {
				let r = m(n, e);
				return {
					instance: t,
					time: r,
					tracks: p[n].sample(r)
				};
			});
		}
	};
}
export { M as HUMANOID_BONES, N as REQUIRED_HUMANOID_BONES, Q as bindSourceTracks, J as computeWorldPose, fe as createCrowd, K as createPoseState, U as createRigFromSkin, le as createSkinClipPlayer, B as mapHumanoidBones, X as prepareRigGeometry, ce as retargetClip, G as validateRigJoints };
