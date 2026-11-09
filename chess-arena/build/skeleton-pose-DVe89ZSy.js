/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, o as t } from "./mat4-BCZClxna.js";
import { c as n, d as r, f as i, l as a, o, s } from "./quat-Bl7gjwWK.js";
import { S as c, c as l, d as u, h as d, i as f, m as p, n as m, o as h, p as g, s as _, t as v, v as y, y as b } from "./vec3-BRYC6f_g.js";
import { n as x, r as S } from "./animation-IxY9GETP.js";
import { i as C } from "./skinning-DjFQA5hH.js";
import { bindSourceTracks as w, computeWorldPose as T, createPoseState as E, createRigFromSkin as D, mapHumanoidBones as O, prepareRigGeometry as k, validateRigJoints as A } from "./retarget.js";
// src/rotation-euler.js
var j = 1 - 1e-9;
function M(e, t, n, i) {
	let a = r(/* @__PURE__ */ new Float64Array(4), [
		1,
		0,
		0
	], t), o = r(/* @__PURE__ */ new Float64Array(4), [
		0,
		1,
		0
	], n), c = r(/* @__PURE__ */ new Float64Array(4), [
		0,
		0,
		1
	], i);
	return s(e, c, o), s(e, e, a);
}
function N(e) {
	let [t, n, r, i] = e, a = t * t + n * n + r * r + i * i, o = a > 0 ? 2 / a : 0, s = o * (t * r - i * n), c = o * (n * r + i * t), l = 1 - o * (t * t + n * n), u = o * (t * n + i * r), d = 1 - o * (n * n + r * r);
	if (Math.abs(s) >= j) {
		let e = 1 - o * (t * t + r * r), a = o * (n * r - i * t);
		return [
			Math.atan2(-a, e),
			Math.asin(Math.max(-1, Math.min(1, -s))),
			0
		];
	}
	return [
		Math.atan2(c, l),
		Math.asin(-s),
		Math.atan2(u, d)
	];
}
// src/skeleton-pose.js
var P = 1e-9, F = Math.PI / 180, I = Object.freeze([
	0,
	0,
	0,
	1
]);
function L(e, t) {
	let n = e.joints.map((e) => e.name), r = e.mapping ?? O(n).mapping;
	return function(e, i) {
		let a = t.indexByName.has(e) ? e : r[e], o = t.indexByName.get(a);
		if (o === void 0) {
			let t = n.slice(0, 12).join(", ");
			throw RangeError(`${i}: joint ${e} is not in the rig. Use a joint name or a humanoid bone such as leftUpperArm. Joints: ${t}${n.length > 12 ? ", ..." : ""}`);
		}
		return o;
	};
}
function R(e, t) {
	let n = new Uint8Array(e.joints.length);
	for (let e of t) n[e] = 1;
	for (let t of e.order) {
		let r = e.joints[t].parent;
		r >= 0 && n[r] && (n[t] = 1);
	}
	return n;
}
function z(e, t, n) {
	let r = new Float64Array(e.joints.length);
	if (!n) return r.fill(1);
	if (!Array.isArray(n.joints) || !n.joints.length) throw TypeError("A layer mask needs joints: a non-empty list of joint or bone names.");
	let i = n.joints.map((e) => t(e, "Layer mask"));
	if (n.descendants === !1) for (let e of i) r[e] = 1;
	else r.set(R(e, i));
	return n.exclude && R(e, n.exclude.map((e) => t(e, "Layer mask exclude"))).forEach((e, t) => {
		e && (r[t] = 0);
	}), r;
}
function B(e, t) {
	if (typeof e == "function") return e;
	if (!Number.isFinite(e) || e < 0 || e > 1) throw RangeError(`${t} must be from 0 to 1, or a function of time.`);
	return () => e;
}
function V(e, t, n) {
	let r = e(t);
	if (!Number.isFinite(r) || r < 0 || r > 1) throw RangeError(`${n} returned ${r} at time ${t}; it must be from 0 to 1.`);
	return r;
}
function H(e, t, n, r) {
	let i = `Layer ${t}`;
	if (!e?.clip) throw TypeError(`${i} needs a clip from createAnimationClip.`);
	let a = x(e.clip), o = w(a, n);
	if (!o.length) throw RangeError(`${i}: no clip track names a joint of this rig.`);
	let s = e.additive === !0, c = e.reference ?? 0;
	if (!Number.isFinite(c)) throw RangeError(`${i} reference must be a clip time in seconds.`);
	let l = [];
	s && (a.sample(c), l = o.map((e) => Float64Array.from(e.output)));
	let u = e.speed ?? 1, d = e.offset ?? 0;
	if (!Number.isFinite(u) || !Number.isFinite(d)) throw RangeError(`${i} speed and offset must be finite.`);
	return {
		label: i,
		sampler: a,
		bindings: o,
		additive: s,
		references: l,
		speed: u,
		offset: d,
		weight: B(e.weight ?? 1, `${i} weight`),
		mask: z(n, r, e.mask)
	};
}
var U = /* @__PURE__ */ new Float64Array(4), W = /* @__PURE__ */ new Float64Array(4);
function G(e, t, r, a) {
	s(U, o(W, r), t), i(U, I, U, a), n(e, s(e, e, U));
}
function K(e, t, r, a) {
	let o = V(e.weight, t, `${e.label} weight`);
	o !== 0 && (e.sampler.sample(t * e.speed + e.offset), e.bindings.forEach((t, s) => {
		let c = o * e.mask[t.index];
		if (c === 0) return;
		if (t.property === "rotation") {
			let a = r[t.index];
			e.additive ? G(a, t.output, e.references[s], c) : n(a, i(a, a, t.output, c));
			return;
		}
		let l = a[t.index];
		for (let n = 0; n < 3; n++) e.additive ? l[n] += (t.output[n] - e.references[s][n]) * c : l[n] += (t.output[n] - l[n]) * c;
	}));
}
function q(e, t, n) {
	let r = e.joints[t].parent;
	for (; r >= 0;) {
		if (r === n) return !0;
		r = e.joints[r].parent;
	}
	return !1;
}
function J(e, t) {
	if (e?.length !== 3 || !Number.isFinite(e[0]) || !Number.isFinite(e[1]) || !Number.isFinite(e[2])) throw RangeError(`${t} must be three finite numbers.`);
	return e;
}
var Y = [
	"x",
	"y",
	"z"
], X = 175 * F, ee = .01, te = .02;
function Z(e, t, n, r) {
	if (e === void 0) return [];
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${t} limits must be { root, middle } with an x, y or z range each.`);
	return Object.entries(e).map(([e, i]) => {
		if (!Object.hasOwn(n, e)) throw RangeError(`${t} limits: ${e} must be root or middle.`);
		let a = Object.keys(i ?? {}).find((e) => !Y.includes(e));
		if (a !== void 0) throw RangeError(`${t} limits ${e}: ${a} must be x, y or z.`);
		let o = Y.map((n) => {
			let r = i[n];
			if (r === void 0) return null;
			if (!Array.isArray(r) || r.length !== 2 || !r.every(Number.isFinite) || r[0] > r[1] || r[0] < -180 || r[1] > 180) throw RangeError(`${t} limits ${e}.${n} must be [min, max] degrees within -180 and 180, min first.`);
			return r.map((e) => e * F);
		}), s = n[e];
		return {
			index: s,
			name: r.joints[s].name,
			ranges: o
		};
	});
}
function Q(e) {
	return Number((e / F).toFixed(4));
}
function ne(e, t, r) {
	let i = [];
	for (let a of e) {
		let e = t.restRotations[a.index], c = s(/* @__PURE__ */ new Float64Array(4), o(/* @__PURE__ */ new Float64Array(4), e), r[a.index]), l = N(c), u = !1;
		l.forEach((e, t) => {
			let n = a.ranges[t];
			if (!n) return;
			let r = Math.min(n[1], Math.max(n[0], e));
			Math.abs(r - e) < 1e-9 || (i.push({
				joint: a.name,
				axis: Y[t],
				requested: Q(e),
				applied: Q(r)
			}), l[t] = r, u = !0);
		}), u && (M(c, l[0], l[1], l[2]), n(r[a.index], s(r[a.index], e, c)));
	}
	return i;
}
function re(e, t, n) {
	let r = b(/* @__PURE__ */ new Float64Array(3), n, e), i = b(/* @__PURE__ */ new Float64Array(3), t, e), a = y(r);
	return a < P ? i : d(i, i, r, -l(i, r) / a);
}
function ie(e, t, n, r) {
	let { positions: i, rotations: a } = e.restWorld, s = re(i[t], i[n], i[r]), l = _(i[t], i[n]) + _(i[n], i[r]);
	if (u(s) < l * te) return null;
	let d = e.joints[t].parent, f = d >= 0 ? a[d] : e.rootRotation;
	return c(/* @__PURE__ */ new Float64Array(3), s, o(/* @__PURE__ */ new Float64Array(4), f));
}
function ae(e, t, n) {
	let r = [], i = t.positions[e.root], a = t.positions[e.middle], o = t.positions[e.end], s = m(b(/* @__PURE__ */ new Float64Array(3), i, a), b(/* @__PURE__ */ new Float64Array(3), o, a));
	s > X && r.push({
		code: "hyperextended",
		message: `${n.joints[e.middle].name} is locked straight (${Q(s)} degrees). The target is at or beyond the limb's reach, so a real joint would hyperextend.`
	});
	let d = e.bendToward;
	if (!d && e.restBend) {
		let r = n.joints[e.root].parent;
		d = c(/* @__PURE__ */ new Float64Array(3), e.restBend, r >= 0 ? t.rotations[r] : n.rootRotation);
	}
	if (!d) return r;
	let f = re(i, a, o), p = _(i, a) + _(a, o);
	return u(f) >= p * ee && l(f, d) < 0 && r.push({
		code: "wrong-bend",
		message: `${n.joints[e.middle].name} bends away from its natural direction. Move the pole to the other side, or set bendToward.`
	}), r;
}
function oe(e, t, n, r) {
	let i = `IK ${t}`, a = B(e?.weight ?? 1, `${i} weight`);
	if (typeof e?.target != "function" && J(e?.target, `${i} target`), e.type === "two-bone") {
		let t = r(e.root, i), s = r(e.middle, i), l = r(e.end, i);
		if (!q(n, s, t) || !q(n, l, s)) throw RangeError(`${i}: end must descend from middle, and middle from root.`);
		e.pole !== void 0 && typeof e.pole != "function" && J(e.pole, `${i} pole`);
		let u = Z(e.limits, i, {
			root: t,
			middle: s
		}, n), d = e.bendToward === void 0 ? null : g(/* @__PURE__ */ new Float64Array(3), J(e.bendToward, `${i} bendToward`));
		return e.groundNormal !== void 0 && typeof e.groundNormal != "function" && J(e.groundNormal, `${i} groundNormal`), {
			type: "two-bone",
			label: i,
			weight: a,
			root: t,
			middle: s,
			end: l,
			target: e.target,
			pole: e.pole,
			limits: u,
			bendToward: d,
			groundNormal: e.groundNormal,
			endUp: c(/* @__PURE__ */ new Float64Array(3), [
				0,
				1,
				0
			], o(/* @__PURE__ */ new Float64Array(4), n.restWorld.rotations[l])),
			restBend: ie(n, t, s, l),
			keepEndRotation: e.keepEndRotation !== !1
		};
	}
	if (e.type === "aim") {
		let t = e.joints ?? (e.joint === void 0 ? [] : [e.joint]);
		if (!t.length) throw TypeError(`${i} needs joint, or joints listed from the base of the chain to the aiming joint.`);
		let s = t.map((e) => r(e, i));
		if (s.slice(1).forEach((e, t) => {
			if (!q(n, e, s[t])) throw RangeError(`${i}: list joints from the base of the chain to the aiming joint.`);
		}), e.forward !== void 0 && e.worldForward !== void 0) throw TypeError(`${i} takes forward or worldForward, not both.`);
		let l = g(/* @__PURE__ */ new Float64Array(3), J(e.forward ?? e.worldForward ?? [
			0,
			0,
			1
		], `${i} forward`));
		if (e.worldForward !== void 0) {
			let e = n.restWorld.rotations[s[s.length - 1]];
			c(l, l, o(/* @__PURE__ */ new Float64Array(4), e));
		}
		let u = e.maxAngle ?? 180;
		if (!Number.isFinite(u) || u <= 0) throw RangeError(`${i} maxAngle must be a positive number of degrees.`);
		return {
			type: "aim",
			label: i,
			weight: a,
			joints: s,
			forward: l,
			maxRadians: u * F,
			target: e.target
		};
	}
	throw RangeError(`${i} type must be two-bone or aim.`);
}
function $(e, t, n, r) {
	return J(typeof e == "function" ? e(t, Array.from(n)) : e, r);
}
function se(e) {
	let t = Math.abs(e[1]) < .9 ? [
		0,
		1,
		0
	] : [
		1,
		0,
		0
	];
	return g(/* @__PURE__ */ new Float64Array(3), h(/* @__PURE__ */ new Float64Array(3), e, t));
}
function ce(e, t, r, a) {
	let c = () => T(e, t, r, a), l = /* @__PURE__ */ new Float64Array(4);
	function u(a, u, d) {
		let f = e.joints[a].parent, p = f >= 0 ? t.rotations[f] : e.rootRotation;
		s(l, o(/* @__PURE__ */ new Float64Array(4), p), u), n(r[a], i(r[a], r[a], l, d)), c();
	}
	return {
		state: t,
		prepared: e,
		localRotations: r,
		update: c,
		setWorldRotation: u
	};
}
function le(e, t, n) {
	let { state: r, prepared: i, localRotations: o, update: m, setWorldRotation: h } = n, y = V(e.weight, t, `${e.label} weight`), x = r.positions[e.end], S = $(e.target, t, x, `${e.label} target`);
	if (y === 0) return {
		reached: !0,
		error: 0,
		warnings: [],
		limited: []
	};
	let C = Float64Array.from(r.positions[e.root]), w = Float64Array.from(r.positions[e.middle]), T = Float64Array.from(x), E = Float64Array.from(r.rotations[e.end]), D = _(C, w), O = _(w, T), k = b(/* @__PURE__ */ new Float64Array(3), S, C), A = u(k);
	if (A < P || D < P || O < P) return {
		reached: !1,
		error: _(T, S),
		warnings: [],
		limited: []
	};
	let j = p(/* @__PURE__ */ new Float64Array(3), k, 1 / A), M = (D + O) * 1e-4, N = D + O - M, F = Math.min(N, Math.max(Math.abs(D - O) + M, A)), I = e.pole === void 0 ? b(/* @__PURE__ */ new Float64Array(3), w, C) : b(/* @__PURE__ */ new Float64Array(3), $(e.pole, t, w, `${e.label} pole`), C), L = l(I, j), R = d(/* @__PURE__ */ new Float64Array(3), I, j, -L);
	u(R) < P * Math.max(1, D) ? f(R, se(j)) : g(R, R);
	let z = (D * D - O * O + F * F) / (2 * F), B = Math.sqrt(Math.max(0, D * D - z * z)), H = d(/* @__PURE__ */ new Float64Array(3), C, j, z);
	d(H, H, R, B);
	let U = d(/* @__PURE__ */ new Float64Array(3), C, j, F), W = g(/* @__PURE__ */ new Float64Array(3), b(/* @__PURE__ */ new Float64Array(3), w, C)), G = g(/* @__PURE__ */ new Float64Array(3), b(/* @__PURE__ */ new Float64Array(3), H, C)), K = a(/* @__PURE__ */ new Float64Array(4), W, G), q = c(/* @__PURE__ */ new Float64Array(3), b(/* @__PURE__ */ new Float64Array(3), T, C), K);
	v(q, q, C);
	let J = g(/* @__PURE__ */ new Float64Array(3), b(/* @__PURE__ */ new Float64Array(3), q, H)), Y = g(/* @__PURE__ */ new Float64Array(3), b(/* @__PURE__ */ new Float64Array(3), U, H)), X = a(/* @__PURE__ */ new Float64Array(4), J, Y), ee = s(/* @__PURE__ */ new Float64Array(4), K, r.rotations[e.root]), te = s(/* @__PURE__ */ new Float64Array(4), X, s(/* @__PURE__ */ new Float64Array(4), K, r.rotations[e.middle]));
	h(e.root, ee, y), h(e.middle, te, y);
	let Z = ne(e.limits, i, o);
	if (Z.length && m(), e.keepEndRotation && h(e.end, E, y), e.groundNormal !== void 0) {
		let n = g(/* @__PURE__ */ new Float64Array(3), $(e.groundNormal, t, [
			0,
			1,
			0
		], `${e.label} groundNormal`)), i = c(/* @__PURE__ */ new Float64Array(3), e.endUp, r.rotations[e.end]), o = a(/* @__PURE__ */ new Float64Array(4), i, n);
		h(e.end, s(/* @__PURE__ */ new Float64Array(4), o, r.rotations[e.end]), y);
	}
	let Q = _(r.positions[e.end], S);
	return {
		reached: Q <= M * 2 + P,
		error: Q,
		warnings: ae(e, r, i),
		limited: Z
	};
}
function ue(e, t, n) {
	let { state: r, setWorldRotation: o } = n, l = V(e.weight, t, `${e.label} weight`), d = e.joints[e.joints.length - 1], f = $(e.target, t, r.positions[d], `${e.label} target`);
	if (l === 0) return {
		reached: !0,
		error: 0
	};
	let p = () => c(/* @__PURE__ */ new Float64Array(3), e.forward, r.rotations[d]), h = b(/* @__PURE__ */ new Float64Array(3), f, r.positions[d]);
	if (u(h) < P) return {
		reached: !1,
		error: Math.PI
	};
	g(h, h);
	let _ = p(), v = a(/* @__PURE__ */ new Float64Array(4), _, h), y = 2 * Math.acos(Math.min(1, Math.abs(v[3]))), x = y > e.maxRadians ? e.maxRadians / y : 1, S = i(/* @__PURE__ */ new Float64Array(4), I, v, x), C = c(/* @__PURE__ */ new Float64Array(3), _, S);
	e.joints.forEach((t, n) => {
		let c = e.joints.length - n, u = a(/* @__PURE__ */ new Float64Array(4), p(), C);
		i(u, I, u, 1 / c), o(t, s(/* @__PURE__ */ new Float64Array(4), u, r.rotations[t]), l);
	});
	let w = p(), T = b(/* @__PURE__ */ new Float64Array(3), f, r.positions[d]), E = m(w, T);
	return {
		reached: E < .02,
		error: E
	};
}
var de = {
	"two-bone": le,
	aim: ue
}, fe = {
	position: "translation",
	quaternion: "rotation",
	scale: "scale"
}, pe = 2300, me = 2301, he = 2302, ge = 30;
function _e(e, t) {
	let n = e.getInterpolation?.();
	if (n === me || n === pe) return Array.from(e.times, (n, r) => ({
		time: n,
		value: Array.from(e.values.subarray(r * t, (r + 1) * t))
	}));
	let r = e.createInterpolant(new Float64Array(t)), i = e.times[0], a = e.times[e.times.length - 1], o = Math.max(1, Math.ceil((a - i) * ge));
	return Array.from({ length: o + 1 }, (e, t) => {
		let n = i + (a - i) * t / o;
		return {
			time: n,
			value: Array.from(r.evaluate(n))
		};
	});
}
function ve(e, { loop: t = !1, rename: n = {} } = {}) {
	if (!Array.isArray(e?.tracks) || !Number.isFinite(e.duration)) throw TypeError("clipFromGltfAnimation needs an animation from asset.animations.");
	let r = [];
	for (let t of e.tracks) {
		let e = t.name.lastIndexOf("."), i = fe[t.name.slice(e + 1)];
		if (!i || !t.times.length) continue;
		let a = i === "rotation" ? 4 : 3, o = t.name.slice(0, e);
		r.push({
			target: Object.hasOwn(n, o) ? n[o] : o,
			property: i,
			interpolation: t.getInterpolation?.() === pe ? "STEP" : "LINEAR",
			keyframes: _e(t, a)
		});
	}
	return S({
		duration: Math.max(e.duration, .001),
		loop: t,
		tracks: r
	});
}
var ye = ".morphTargetInfluences";
function be(e, { loop: t = !1 } = {}) {
	if (!Array.isArray(e?.tracks) || !Number.isFinite(e.duration)) throw TypeError("morphClipFromGltfAnimation needs an animation from asset.animations.");
	let n = e.tracks.filter((e) => e.name.endsWith(ye) && e.times.length).map((e) => {
		let t = e.values.length / e.times.length, n = e.getInterpolation?.() === he ? t / 3 : t;
		return {
			part: e.name.slice(0, -22),
			count: n,
			interpolant: e.createInterpolant(new Float64Array(n))
		};
	});
	return {
		duration: Math.max(e.duration, .001),
		loop: t,
		tracks: n
	};
}
function xe(e, t) {
	return e.loop ? (t % e.duration + e.duration) % e.duration : Math.min(e.duration, Math.max(0, t));
}
function Se(e) {
	let t = /* @__PURE__ */ new Map();
	return e.forEach((e, n) => {
		for (let r of e.meshIds ?? []) t.set(Number(r.slice(5)), n);
	}), t;
}
function Ce(e, t, n, r) {
	let i = k(r, "Pose"), a = L(r, i), o = Se(t);
	return n.filter((e) => e.morphs?.tracks.length).map((t) => {
		let n = z(i, a, t.mask), r = /* @__PURE__ */ new Map();
		for (let i of t.morphs.tracks) {
			let t = [...e.parts.keys()].filter((t) => {
				let r = e.parts[t];
				return r.name === i.part && r.morph?.weights.length === i.count && n[o.get(t)] > 0;
			});
			r.set(i, t);
		}
		return {
			morphs: t.morphs,
			partIndices: r,
			mask: n,
			owners: o,
			additive: t.additive === !0,
			speed: t.speed ?? 1,
			offset: t.offset ?? 0,
			weight: B(t.weight ?? 1, "Morph layer weight"),
			reference: t.reference ?? 0
		};
	});
}
function we(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r of e) {
		let e = V(r.weight, t, "Morph layer weight");
		if (e === 0) continue;
		let i = t * r.speed + r.offset;
		for (let t of r.morphs.tracks) {
			let a = Array.from(t.interpolant.evaluate(xe(r.morphs, i))), o = r.additive ? Array.from(t.interpolant.evaluate(xe(r.morphs, r.reference))) : null;
			for (let i of r.partIndices.get(t)) {
				let s = n.get(i) ?? Array(t.count).fill(0), c = e * r.mask[r.owners.get(i)];
				s.forEach((e, t) => {
					let n = o ? e + a[t] - o[t] : a[t];
					s[t] = Math.min(1, Math.max(0, e + (n - e) * c));
				}), n.set(i, s);
			}
		}
	}
	return [...n].map(([e, t]) => ({
		part: e,
		weights: t
	}));
}
function Te(e, { rootMatrix: t } = {}) {
	let n = new Map(e.map((e, t) => [e.id, t])), r = e.filter((e) => e.joint).map((e) => e.name);
	return {
		mapping: O(r).mapping,
		...t ? { rootMatrix: t } : {},
		joints: e.map((e) => ({
			name: e.name,
			parent: e.parent === null ? -1 : n.get(e.parent),
			translation: e.translation,
			rotation: e.rotation,
			scale: e.scale
		}))
	};
}
function Ee(e, t) {
	let n = new Map(e.joints.map((e, t) => [e.name, t]));
	for (let r of t) {
		let t = e.joints[n.get(r)]?.parent ?? -1;
		for (; t >= 0;) {
			let n = e.joints[t], [i, a, o] = n.scale;
			if (Math.max(i, a, o) - Math.min(i, a, o) > .001 * Math.max(i, a, o)) throw RangeError(`IK: node ${n.name} above ${r} has non-uniform scale ${JSON.stringify(n.scale)}, which IK cannot solve through.`);
			t = n.parent;
		}
	}
}
function De(e, t, n) {
	if (typeof e?.stagePose != "function" || !Array.isArray(e.nodes)) throw TypeError("createAssetPose needs an asset from loadGltf or parseGltf.");
	if (!Array.isArray(t) || !Array.isArray(n)) throw TypeError("layers and ik must be arrays.");
	let r = e.nodes, i = Te(r), a = Ae({
		rig: i,
		layers: t.filter((e) => e?.clip || !e?.morphs),
		ik: n
	});
	Ee(i, a.solvedJointNames);
	let o = a.writtenJoints.filter(({ index: e }) => r[e].editable), s = Ce(e, r, t, i);
	function c(e) {
		return a.apply(e), {
			nodeOverrides: o.map(({ index: e, translation: t }) => {
				let n = {
					id: r[e].id,
					rotation: Array.from(a.localRotation(e))
				};
				return t && (n.translation = Array.from(a.localTranslation(e))), n;
			}),
			morphWeights: we(s, e)
		};
	}
	return {
		pose: a,
		evaluate: c
	};
}
function Oe(e, t) {
	return { evaluate: De(e, t, []).evaluate };
}
function ke(e, { layers: t = [], ik: n = [] } = {}) {
	let { pose: r, evaluate: i } = De(e, t, n);
	return {
		apply(t) {
			let { nodeOverrides: n, morphWeights: r } = i(t);
			return e.stagePose({
				animation: null,
				nodeOverrides: n,
				morphWeights: r
			}).commit();
		},
		jointWorld: r.jointWorld,
		get ikResults() {
			return r.ikResults;
		}
	};
}
function Ae({ skin: n, rig: r = n && D(n), meshWorldMatrix: i, layers: a = [], ik: o = [] } = {}) {
	if (!r) throw TypeError("createSkeletonPose needs a skin or a rig.");
	if (A(r.joints, "Pose"), !Array.isArray(a) || !Array.isArray(o)) throw TypeError("layers and ik must be arrays.");
	let s = k(r, "Pose"), c = L(r, s), l = a.map((e, t) => H(e, t, s, c)), u = o.map((e, t) => oe(e, t, s, c)), d = new Set(u.flatMap((e) => e.type === "aim" ? e.joints : [
		e.root,
		e.middle,
		e.end
	])), f = new Set(l.flatMap((e) => e.bindings.filter((e) => e.property === "translation").map((e) => e.index))), p = /* @__PURE__ */ new Set([
		...d,
		...f,
		...l.flatMap((e) => e.bindings.filter((e) => e.property === "rotation").map((e) => e.index))
	]), m = r.joints.length, h = s.restRotations.map((e) => Float64Array.from(e)), g = s.restTranslations.map((e) => Float64Array.from(e)), _ = E(m), v = ce(s, _, h, g), y = new Float32Array(m * 16), b = e(), x = u.map(() => ({
		reached: !0,
		error: 0
	})), S = n?.bindMatrix ?? e(), w = i ?? S;
	function T() {
		for (let e = 0; e < m; e++) {
			let n = _.scales[e];
			t(b, _.rotations[e], _.positions[e], [
				n,
				n,
				n
			]), y.set(b, e * 16);
		}
		C(n, y, n.inverseBindMatrices, w, S);
	}
	function O(e) {
		let t = c(e, "jointWorld");
		return {
			position: Array.from(_.positions[t]),
			rotation: Array.from(_.rotations[t])
		};
	}
	return {
		apply(e, t) {
			if (!Number.isFinite(e)) throw RangeError("Pose time must be finite.");
			for (let e = 0; e < m; e++) h[e].set(s.restRotations[e]), g[e].set(s.restTranslations[e]);
			t?.(h, g);
			for (let t of l) K(t, e, h, g);
			return v.update(), u.forEach((t, n) => {
				x[n] = de[t.type](t, e, v);
			}), n && T(), n;
		},
		jointWorld: O,
		localRotation(e) {
			return h[e];
		},
		localTranslation(e) {
			return g[e];
		},
		writtenJoints: [...p].map((e) => ({
			index: e,
			translation: f.has(e)
		})),
		solvedJointNames: [...d].map((e) => r.joints[e].name),
		get ikResults() {
			return x;
		}
	};
}
export { be as a, M as c, Ae as i, Oe as n, Te as o, ke as r, N as s, ve as t };
