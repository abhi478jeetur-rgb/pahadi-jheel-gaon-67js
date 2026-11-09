/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./rolldown-runtime-CvuOiBwx.js";
import { n as t, r as n, s as r } from "./animation-IxY9GETP.js";
import { n as i, t as a } from "./field-error-DPtscRqU.js";
import { t as o } from "./camera-path-jvnqstYo.js";
import { t as s } from "./camera-DqWdI22s.js";
import { c, i as l, o as u, s as d } from "./skeleton-pose-DVe89ZSy.js";
import { n as f } from "./mat3-BUCH0Dej.js";
import { d as p, h as m, n as h, o as g, p as _, t as v, u as y } from "./mat4-BCZClxna.js";
import { a as b, c as x, d as S, f as C, s as w } from "./quat-Bl7gjwWK.js";
import { c as T, d as E, f as ee, h as D, i as te, m as ne, o as O, p as k, s as re, y as A } from "./vec3-BRYC6f_g.js";
import { _ as j, c as ie, d as ae, g as M, h as oe, i as se, m as N, n as ce, p as P, s as le, t as ue } from "./expression-BmPTs3mu.js";
import { mapHumanoidBones as de, retargetClip as fe } from "./retarget.js";
var pe = [
	"translation",
	"rotation",
	"scale"
], me = se();
me.set("div", ie(2, 2, (e, t) => e / t));
function he(e, t) {
	let { label: n, nodeIds: r } = t;
	if (M(e, [
		"node",
		"property",
		"component",
		"space"
	], `${n} node read`), !r.has(e.node)) throw RangeError(`${n}: node ${JSON.stringify(e.node)} is not in this scene.`);
	if (!pe.includes(e.property)) throw RangeError(`${n}: property must be translation, rotation or scale.`);
	if (!Object.hasOwn(ue, e.component)) throw RangeError(`${n}: component must be x, y or z.`);
	let i = e.space ?? "local";
	if (i !== "local" && i !== "world") throw RangeError(`${n}: space must be local or world.`);
	t.reads.add(e.node);
	let a = ue[e.component];
	return ae((t) => t.read(e.node, e.property, a, i));
}
function ge(e, t) {
	if (e === "time") return ae((e) => e.time);
	if (le(e) && Object.hasOwn(e, "node")) return he(e, t);
}
var _e = Object.freeze({
	name: "motion",
	accepts: "a number, \"time\", a node read or an operator object",
	maxNodes: 64,
	maxDepth: 8,
	operators: me,
	sourceNames: Object.freeze(["time", "node"]),
	reject: (e, t) => /* @__PURE__ */ TypeError(`${t.label}: ${e}`),
	compileInput: ge
});
function F(e, t, n) {
	let r = {
		dialect: _e,
		nodeCount: 0,
		label: n,
		nodeIds: t,
		reads: /* @__PURE__ */ new Set()
	}, { evaluate: i } = ce(e, r, 0);
	return Object.freeze({
		reads: [...r.reads],
		evaluate(e) {
			let t = i(e);
			if (!Number.isFinite(t)) throw RangeError(`${n} produced ${t} at time ${e.time}; it must stay finite.`);
			return t;
		}
	});
}
var I = [
	"x",
	"y",
	"z"
], L = [
	"+x",
	"-x",
	"+y",
	"-y",
	"+z",
	"-z"
], R = Math.PI / 180, z = 1e-9, B = 1e6, ve = ["world", "local"], ye = [
	"emission",
	"metallic",
	"roughness"
], be = ["color", "emissiveColor"], xe = [
	"type",
	"node",
	"influence"
], V = {
	copy_location: [
		"target",
		"axes",
		"invert",
		"offset",
		"space"
	],
	copy_rotation: [
		"target",
		"axes",
		"invert",
		"mix",
		"space"
	],
	copy_scale: [
		"target",
		"axes",
		"offset",
		"space"
	],
	limit_location: [
		"x",
		"y",
		"z",
		"space"
	],
	limit_rotation: [
		"x",
		"y",
		"z",
		"space"
	],
	track_to: [
		"target",
		"trackAxis",
		"upAxis",
		"worldUp"
	],
	child_of: ["target", "inverse"],
	floor: [
		"target",
		"axis",
		"offset"
	],
	copy_transforms: ["target"],
	limit_distance: [
		"target",
		"distance",
		"mode"
	],
	limit_scale: [
		"x",
		"y",
		"z",
		"space"
	],
	stretch_to: [
		"target",
		"restLength",
		"volume",
		"bulge",
		"worldUp"
	],
	locked_track: [
		"target",
		"trackAxis",
		"lockAxis"
	],
	transformation: [
		"target",
		"source",
		"destination",
		"map",
		"fromMin",
		"fromMax",
		"toMin",
		"toMax",
		"space"
	],
	action: [
		"target",
		"source",
		"axis",
		"min",
		"max",
		"destination",
		"keys",
		"space"
	]
}, H = [
	"translation",
	"rotation",
	"scale"
], Se = 16, Ce = Object.freeze(Object.keys(V));
function we(e, t) {
	if (e === void 0) return [...I];
	if (N(e, 3, t), !e.length || e.some((e) => !I.includes(e)) || new Set(e).size !== e.length) throw RangeError(`${t} must list distinct axes from x, y and z.`);
	return [...e];
}
function U(e, t, n, r) {
	if (e === void 0) return n;
	if (!t.includes(e)) throw RangeError(`${r} must be one of ${t.join(", ")}.`);
	return e;
}
function W(e, t, n) {
	let r = {};
	for (let i of I) {
		if (e[i] === void 0) continue;
		let a = j(e[i], 2, `${n} ${i}`);
		if (a[0] > a[1] || Math.abs(a[0]) > t || Math.abs(a[1]) > t) throw RangeError(`${n} ${i} must be [min, max] within ${-t} and ${t}, min first.`);
		r[i] = a;
	}
	if (!Object.keys(r).length) throw RangeError(`${n} needs an x, y or z range.`);
	return r;
}
function Te(e, t, n) {
	return e === void 0 ? 1 : typeof e == "number" ? P(e, 0, 1, `${n} influence`) : (F(e, t, `${n} influence`), structuredClone(e));
}
var Ee = [
	"copy_transforms",
	"limit_distance",
	"limit_scale",
	"stretch_to",
	"locked_track",
	"transformation",
	"action"
];
function De(e, t) {
	if (!e || e.args === void 0 || !Ee.includes(e.type)) return e;
	M(e.args, ["influence", ...V[e.type]], `${t} args`);
	let { args: n, ...r } = e, i = Object.keys(n).find((e) => Object.hasOwn(r, e));
	if (i) throw RangeError(`${t} gives ${i} both directly and in args.`);
	return {
		...r,
		...n
	};
}
function Oe(e, t, n, r) {
	let i = `Motion constraint ${t}`, a = De(e, i);
	if (!a || !Object.hasOwn(V, a.type)) throw RangeError(`${i} type must be one of ${Ce.join(", ")}.`);
	if (M(a, [...xe, ...V[a.type]], i), !n.has(a.node)) throw RangeError(`${i} node must be a node ID in this recipe; got ${JSON.stringify(a.node)}.`);
	let o = {
		type: a.type,
		node: a.node,
		influence: Te(a.influence, r, i)
	};
	if (V[a.type].includes("target")) {
		if (!r.has(a.target)) throw RangeError(`${i} target must be a node ID in this recipe; got ${JSON.stringify(a.target)}.`);
		if (a.target === a.node) throw RangeError(`${i} target cannot be the constrained node itself.`);
		o.target = a.target;
	}
	switch (V[a.type].includes("space") && (o.space = U(a.space, ve, "world", `${i} space`)), a.type) {
		case "copy_location":
		case "copy_rotation":
		case "copy_scale":
			if (o.axes = we(a.axes, `${i} axes`), a.invert !== void 0) {
				if (a.type === "copy_scale") throw TypeError(`${i} does not take invert.`);
				o.invert = we(a.invert, `${i} invert`);
			}
			if (a.offset !== void 0) {
				if (typeof a.offset != "boolean" || a.type === "copy_rotation") throw TypeError(`${i} offset must be a boolean on copy_location and copy_scale.`);
				o.offset = a.offset;
			}
			a.type === "copy_rotation" && (o.mix = U(a.mix, ["replace", "add"], "replace", `${i} mix`));
			break;
		case "limit_location":
			Object.assign(o, W(a, B, i));
			break;
		case "limit_rotation":
			Object.assign(o, W(a, 180, i));
			break;
		case "track_to":
			if (o.trackAxis = U(a.trackAxis, L, "-z", `${i} trackAxis`), o.upAxis = U(a.upAxis, I, "y", `${i} upAxis`), o.trackAxis.slice(1) === o.upAxis) throw RangeError(`${i} trackAxis and upAxis must be different axes.`);
			if (o.worldUp = a.worldUp === void 0 ? [
				0,
				1,
				0
			] : j(a.worldUp, 3, `${i} worldUp`), E(o.worldUp) < z) throw RangeError(`${i} worldUp cannot be zero.`);
			break;
		case "child_of":
			o.inverse = U(a.inverse, ["rest", "none"], "rest", `${i} inverse`);
			break;
		case "floor":
			o.axis = U(a.axis, L, "+y", `${i} axis`), o.offset = a.offset === void 0 ? 0 : P(a.offset, -1e6, B, `${i} offset`);
			break;
		default: ke(a, o, i);
	}
	return o;
}
function ke(e, t, n) {
	switch (e.type) {
		case "copy_transforms": break;
		case "limit_distance":
			t.distance = P(e.distance, 0, B, `${n} distance`), t.mode = U(e.mode, [
				"inside",
				"outside",
				"surface"
			], "inside", `${n} mode`);
			break;
		case "limit_scale":
			Object.assign(t, W(e, B, n));
			for (let e of I) if (t[e] && !(t[e][0] > 0)) throw RangeError(`${n} ${e} minimum must be above 0.`);
			break;
		case "stretch_to":
			if (t.restLength = e.restLength === void 0 ? 0 : P(e.restLength, 0, B, `${n} restLength`), t.volume = U(e.volume, [
				"xz",
				"x",
				"z",
				"none"
			], "xz", `${n} volume`), t.bulge = e.bulge === void 0 ? 1 : P(e.bulge, 0, 4, `${n} bulge`), t.worldUp = e.worldUp === void 0 ? [
				0,
				1,
				0
			] : j(e.worldUp, 3, `${n} worldUp`), E(t.worldUp) < z) throw RangeError(`${n} worldUp cannot be zero.`);
			break;
		case "locked_track":
			if (t.trackAxis = U(e.trackAxis, L, "+y", `${n} trackAxis`), t.lockAxis = U(e.lockAxis, I, "z", `${n} lockAxis`), t.trackAxis.slice(1) === t.lockAxis) throw RangeError(`${n} trackAxis and lockAxis must be different axes.`);
			break;
		case "transformation":
			if (t.source = U(e.source, H, "translation", `${n} source`), t.destination = U(e.destination, H, "translation", `${n} destination`), t.map = e.map === void 0 ? [...I] : N(e.map, 3, `${n} map`), t.map.length !== 3 || t.map.some((e) => !I.includes(e))) throw RangeError(`${n} map needs three axes from x, y and z, one per destination axis.`);
			for (let [r, i] of [
				["fromMin", 0],
				["fromMax", 1],
				["toMin", 0],
				["toMax", 1]
			]) t[r] = e[r] === void 0 ? [
				i,
				i,
				i
			] : j(e[r], 3, `${n} ${r}`);
			if (t.fromMin.some((e, n) => e === t.fromMax[n])) throw RangeError(`${n} fromMax must differ from fromMin on every axis.`);
			break;
		default: Ae(e, t, n);
	}
}
function Ae(e, t, n) {
	if (t.source = U(e.source, H, "translation", `${n} source`), t.destination = U(e.destination, H, "translation", `${n} destination`), t.axis = U(e.axis, I, "x", `${n} axis`), t.min = P(e.min, -1e6, B, `${n} min`), t.max = P(e.max, -1e6, B, `${n} max`), !(t.min < t.max)) throw RangeError(`${n} min must be below max.`);
	if (N(e.keys, Se, `${n} keys`), e.keys.length < 2) throw RangeError(`${n} keys needs at least 2 keys.`);
	if (t.keys = e.keys.map((e, t) => (M(e, ["at", "value"], `${n} key ${t}`), {
		at: P(e.at, 0, 1, `${n} key ${t} at`),
		value: j(e.value, 3, `${n} key ${t} value`)
	})), t.keys.some((e, n) => n && e.at <= t.keys[n - 1].at)) throw RangeError(`${n} keys must have rising at values.`);
}
function je(e, t, n) {
	return N(e, 32, "Motion constraints"), e.map((e, r) => Oe(e, r, t, n));
}
function Me(e, t, n, r, i) {
	let a = `Motion driver ${t}`;
	M(e, ["target", "expression"], a), M(e.target, [
		"kind",
		"id",
		"property",
		"component"
	], `${a} target`);
	let { kind: o, id: s, property: c, component: l } = e.target;
	if (l !== void 0 && !I.includes(l)) throw RangeError(`${a} component must be x, y or z.`);
	if (o === "node") {
		if (!n.has(s)) throw RangeError(`${a} node must be a node ID in this recipe; got ${JSON.stringify(s)}.`);
		if (![
			"translation",
			"rotation",
			"scale"
		].includes(c)) throw RangeError(`${a} property must be translation, rotation or scale.`);
		if (l === void 0) throw RangeError(`${a} needs a component: x, y or z. Rotation is Euler XYZ in degrees.`);
	} else if (o === "material") {
		if (!r.has(s)) throw RangeError(`${a} material was not found: ${JSON.stringify(s)}.`);
		let e = be.includes(c);
		if (!e && !ye.includes(c)) throw RangeError(`${a} property must be one of ${[...be, ...ye].join(", ")}.`);
		if (e !== (l !== void 0)) throw RangeError(`${a}: color properties need a component (x, y, z for red, green, blue); the others take none.`);
	} else throw RangeError(`${a} target kind must be node or material.`);
	return F(e.expression, i, `${a} expression`), {
		target: {
			kind: o,
			id: s,
			property: c,
			...l === void 0 ? {} : { component: l }
		},
		expression: structuredClone(e.expression)
	};
}
function Ne(e, t, n, r) {
	N(e, 32, "Motion drivers");
	let i = /* @__PURE__ */ new Set();
	return e.map((e, a) => {
		let o = Me(e, a, t, n, r), s = JSON.stringify(Object.values(o.target));
		if (i.has(s)) throw RangeError(`Motion driver ${a} drives the same property as an earlier driver.`);
		return i.add(s), o;
	});
}
function Pe(e, t) {
	let n = [
		0,
		4,
		8
	].map((n, r) => Array.from(e.slice(n, n + 3), (e) => e / (t[r] || 1)));
	return x(/* @__PURE__ */ new Float64Array(4), b(/* @__PURE__ */ new Float64Array(4), n.flat()));
}
function G(e) {
	let t = y(/* @__PURE__ */ new Float64Array(3), e);
	return {
		translation: p(/* @__PURE__ */ new Float64Array(3), e),
		rotation: Pe(e, t),
		scale: t
	};
}
function K(e) {
	return g(/* @__PURE__ */ new Float64Array(16), e.rotation, e.translation, e.scale);
}
function q(e) {
	return {
		translation: Float64Array.from(e.translation),
		rotation: Float64Array.from(e.rotation),
		scale: Float64Array.from(e.scale)
	};
}
function Fe(e, t, n) {
	if (n >= 1) return t;
	let r = G(e), i = G(t);
	return K({
		translation: ee(/* @__PURE__ */ new Float64Array(3), r.translation, i.translation, n),
		rotation: C(/* @__PURE__ */ new Float64Array(4), r.rotation, i.rotation, n),
		scale: ee(/* @__PURE__ */ new Float64Array(3), r.scale, i.scale, n)
	});
}
function Ie(e) {
	return e.startsWith("-") ? -1 : 1;
}
function J(e) {
	return I.indexOf(e.replace(/^[+-]/, ""));
}
function Le(e, t, n) {
	for (let r of n.axes) {
		let i = J(r), a = n.invert?.includes(r) ? -1 : 1;
		e.translation[i] = (n.offset ? e.translation[i] : 0) + a * t.translation[i];
	}
}
function Re(e, t, n) {
	let r = d(e.rotation), i = d(t.rotation);
	for (let e of n.axes) {
		let t = J(e), a = n.invert?.includes(e) ? -1 : 1;
		r[t] = (n.mix === "add" ? r[t] : 0) + a * i[t];
	}
	c(e.rotation, r[0], r[1], r[2]);
}
function ze(e, t, n) {
	for (let r of n.axes) {
		let i = J(r);
		e.scale[i] = (n.offset ? e.scale[i] : 1) * t.scale[i];
	}
}
function Be(e, t, n) {
	for (let t of I) {
		if (!n[t]) continue;
		let r = J(t);
		e.translation[r] = Math.min(n[t][1], Math.max(n[t][0], e.translation[r]));
	}
}
function Ve(e, t, n) {
	let r = d(e.rotation);
	for (let e of I) {
		if (!n[e]) continue;
		let t = J(e);
		r[t] = Math.min(n[e][1] * R, Math.max(n[e][0] * R, r[t]));
	}
	c(e.rotation, r[0], r[1], r[2]);
}
function He(e, t, n) {
	for (let t of I) {
		if (!n[t]) continue;
		let r = J(t);
		e.scale[r] = Math.min(n[t][1], Math.max(n[t][0], e.scale[r]));
	}
}
function Ue(e, t) {
	return t === "rotation" ? d(e.rotation).map((e) => e / R) : Array.from(e[t]);
}
function We(e, t, n) {
	if (t === "rotation") {
		let [t, r, i] = n.map((e) => e * R);
		c(e.rotation, t, r, i);
	} else e[t].set(n);
}
function Ge(e, t, n) {
	let r = Ue(t, n.source), i = Ue(e, n.destination);
	n.map.forEach((e, t) => {
		let a = J(e), o = (r[a] - n.fromMin[a]) / (n.fromMax[a] - n.fromMin[a]), s = Math.min(1, Math.max(0, o));
		i[t] = n.toMin[t] + s * (n.toMax[t] - n.toMin[t]);
	}), We(e, n.destination, i);
}
function Ke(e, t, n) {
	let r = Ue(t, n.source)[J(n.axis)], i = Math.min(1, Math.max(0, (r - n.min) / (n.max - n.min))), { keys: a } = n, o = a.findIndex((e) => e.at >= i), s = o < 0 ? a.length - 1 : Math.max(1, o), c = a[s - 1], l = a[s], u = Math.min(1, Math.max(0, (i - c.at) / (l.at - c.at)));
	We(e, n.destination, c.value.map((e, t) => e + u * (l.value[t] - e)));
}
var qe = {
	copy_location: Le,
	copy_rotation: Re,
	copy_scale: ze,
	limit_location: Be,
	limit_rotation: Ve,
	limit_scale: He,
	transformation: Ge,
	action: Ke
};
function Je(e) {
	let t = Math.abs(e[1]) < .9 ? [
		0,
		1,
		0
	] : [
		1,
		0,
		0
	];
	return k(/* @__PURE__ */ new Float64Array(3), O(/* @__PURE__ */ new Float64Array(3), e, t));
}
function Ye(e, t, n) {
	let r = G(e), i = A(/* @__PURE__ */ new Float64Array(3), p(/* @__PURE__ */ new Float64Array(3), t), r.translation);
	if (E(i) < z) return e;
	k(i, i);
	let a = k(/* @__PURE__ */ new Float64Array(3), n.worldUp), o = D(/* @__PURE__ */ new Float64Array(3), a, i, -T(a, i));
	E(o) < 1e-6 && te(o, Je(i)), k(o, o);
	let s = J(n.trackAxis), c = I.indexOf(n.upAxis), l = [
		null,
		null,
		null
	];
	l[s] = ne(/* @__PURE__ */ new Float64Array(3), i, Ie(n.trackAxis)), l[c] = o;
	let u = 3 - s - c;
	return l[u] = O(/* @__PURE__ */ new Float64Array(3), l[(u + 1) % 3], l[(u + 2) % 3]), r.rotation = x(/* @__PURE__ */ new Float64Array(4), b(/* @__PURE__ */ new Float64Array(4), l.flatMap((e) => Array.from(e)))), K(r);
}
function Xe(e, t, n) {
	let r = p(/* @__PURE__ */ new Float64Array(3), t), i = A(/* @__PURE__ */ new Float64Array(3), p(/* @__PURE__ */ new Float64Array(3), e), r), a = E(i), o = n.mode === "outside", s = n.mode === "inside";
	if (a < z || s && a <= n.distance || o && a >= n.distance) return e;
	let c = v(e);
	return D(i, r, i, n.distance / a), c.set(i, 12), c;
}
function Ze(e, t, n) {
	let r = G(e), i = f(/* @__PURE__ */ new Float64Array(9), r.rotation), a = (e) => Array.from(i.slice(J(e) * 3, J(e) * 3 + 3)), o = a(n.lockAxis), s = a(n.trackAxis).map((e) => e * Ie(n.trackAxis)), c = A(/* @__PURE__ */ new Float64Array(3), p(/* @__PURE__ */ new Float64Array(3), t), r.translation);
	if (D(c, c, o, -T(c, o)), E(c) < z) return e;
	k(c, c);
	let l = Math.atan2(T(o, O(/* @__PURE__ */ new Float64Array(3), s, c)), T(s, c)), u = S(/* @__PURE__ */ new Float64Array(4), o, l);
	return r.rotation = x(/* @__PURE__ */ new Float64Array(4), w(/* @__PURE__ */ new Float64Array(4), u, r.rotation)), K(r);
}
function Qe(e, t, n, r) {
	let i = Ye(e, t, {
		trackAxis: "+y",
		upAxis: "z",
		worldUp: n.worldUp
	}), a = re(p(/* @__PURE__ */ new Float64Array(3), e), p(/* @__PURE__ */ new Float64Array(3), t));
	if (i === e || !(r > 0)) return i;
	let o = G(i), s = a / r, c = s ** -n.bulge, l = n.volume === "xz" ? Math.sqrt(c) : c;
	return o.scale[1] *= s, n.volume !== "none" && n.volume !== "z" && (o.scale[0] *= l), n.volume !== "none" && n.volume !== "x" && (o.scale[2] *= l), K(o);
}
function $e(e, t, n) {
	let r = /* @__PURE__ */ new Float64Array(3);
	r[J(n.axis)] = Ie(n.axis);
	let i = p(/* @__PURE__ */ new Float64Array(3), e), a = p(/* @__PURE__ */ new Float64Array(3), t), o = T(A(/* @__PURE__ */ new Float64Array(3), i, a), r);
	if (o >= n.offset) return e;
	let s = v(e), c = n.offset - o;
	for (let e = 0; e < 3; e++) s[12 + e] += r[e] * c;
	return s;
}
function et(e, t) {
	let n = [], r = new Uint8Array(e.length), i = (a) => {
		if (r[a]) return;
		r[a] = 1;
		let o = e[a].parent;
		o != null && i(t.get(o)), n.push(a);
	};
	return e.forEach((e, t) => i(t)), n;
}
function tt(e) {
	return {
		translation: Float64Array.from(e.translation ?? [
			0,
			0,
			0
		]),
		rotation: Float64Array.from(e.rotation ?? [
			0,
			0,
			0,
			1
		]),
		scale: Float64Array.from(e.scale ?? [
			1,
			1,
			1
		])
	};
}
function nt(e, t) {
	return !!(e?.length || t?.length);
}
function rt({ hierarchy: e, rootMatrix: t, constraints: n = [], drivers: r = [], materials: i = [] }) {
	if (!nt(n, r)) return null;
	let a = new Map(e.map((e, t) => [e.id, t])), o = et(e, a), s = e.map((e) => e.parent === void 0 || e.parent === null ? -1 : a.get(e.parent)), l = t ? v(t) : h(), u = new Set(a.keys()), f = new Map(i.map((e) => [e.id, e])), g = r.map((e) => ({
		...e,
		compiled: F(e.expression, u, "Motion driver expression")
	})), y = n.map((e) => ({
		...e,
		compiledInfluence: typeof e.influence == "number" ? null : F(e.influence, u, "Motion constraint influence")
	}));
	function b(t) {
		let n = Array(e.length);
		for (let e of o) {
			let r = s[e] >= 0 ? n[s[e]] : l;
			n[e] = m(/* @__PURE__ */ new Float64Array(16), r, K(t[e]));
		}
		return n;
	}
	let x = e.map(tt), S = b(x);
	function C(e, t) {
		return (n, r, i, o) => {
			let s = a.get(n), c = o === "world" ? G(t[s]) : e[s];
			return r === "rotation" ? d(c.rotation)[i] / R : c[r][i];
		};
	}
	function w(e, t, n, r) {
		let i = e.compiled.evaluate(n), { kind: o, id: s, property: l, component: u } = e.target, p = I.indexOf(u);
		if (o === "material") {
			if (p < 0) {
				r.set(s, {
					...r.get(s),
					[l]: i
				});
				return;
			}
			let e = r.get(s)?.[l] ?? Array.from(f.get(s)?.[l] ?? [
				.5,
				.5,
				.5
			]);
			e[p] = i, r.set(s, {
				...r.get(s),
				[l]: e
			});
			return;
		}
		let m = t[a.get(s)];
		if (l === "rotation") {
			let e = d(m.rotation);
			e[p] = i * R, c(m.rotation, e[0], e[1], e[2]);
		} else {
			if (l === "scale" && !(Math.fround(i) > 0)) throw RangeError(`Motion driver made the scale of ${s} not positive (${i}).`);
			m[l][p] = i;
		}
	}
	function T(e, t, n) {
		let r = b(t), i = a.get(e.node), o = s[i] >= 0 ? r[s[i]] : l, c = r[i], u = e.target === void 0 ? -1 : a.get(e.target), d = e.compiledInfluence ? Math.min(1, Math.max(0, e.compiledInfluence.evaluate(n))) : e.influence, f;
		if (qe[e.type]) {
			let n = e.space === "local", a = n ? q(t[i]) : G(c), s = u < 0 ? null : n ? t[u] : G(r[u]);
			qe[e.type](a, s, e), f = n ? m(/* @__PURE__ */ new Float64Array(16), o, K(a)) : K(a);
		} else if (e.type === "track_to") f = Ye(c, r[u], e);
		else if (e.type === "floor") f = $e(c, r[u], e);
		else if (e.type === "copy_transforms") f = r[u];
		else if (e.type === "limit_distance") f = Xe(c, r[u], e);
		else if (e.type === "locked_track") f = Ze(c, r[u], e);
		else if (e.type === "stretch_to") {
			let t = e.restLength || re(p(/* @__PURE__ */ new Float64Array(3), S[i]), p(/* @__PURE__ */ new Float64Array(3), S[u]));
			f = Qe(c, r[u], e, t);
		} else {
			let t = e.inverse === "rest" ? _(/* @__PURE__ */ new Float64Array(16), S[u]) : h(), n = m(/* @__PURE__ */ new Float64Array(16), r[u], t);
			f = m(/* @__PURE__ */ new Float64Array(16), n, c);
		}
		let g = Fe(c, f, d);
		t[i] = G(m(/* @__PURE__ */ new Float64Array(16), _(/* @__PURE__ */ new Float64Array(16), o), g));
	}
	return Object.freeze({ evaluate(t, n = /* @__PURE__ */ new Map()) {
		let r = e.map((e, t) => {
			let r = n.get(e.id), i = q(x[t]);
			return r?.translation && i.translation.set(r.translation), r?.rotation && i.rotation.set(r.rotation), r?.scale && i.scale.set(r.scale), i;
		}), i = {
			time: t,
			read: C(r, b(r))
		}, o = r.map(q), s = /* @__PURE__ */ new Map();
		for (let e of g) w(e, o, i, s);
		for (let e of y) T(e, o, i);
		let c = /* @__PURE__ */ new Set([...g.filter((e) => e.target.kind === "node").map((e) => e.target.id), ...y.map((e) => e.node)]), l = new Map([...c].map((e) => [e, o[a.get(e)]]));
		for (let [e, t] of l) {
			if (![
				...t.translation,
				...t.rotation,
				...t.scale
			].every(Number.isFinite)) throw RangeError(`Motion constraints produced an invalid pose for node ${e}.`);
			if (t.scale.some((e) => !(Math.fround(e) > 0))) throw RangeError(`Motion constraints made the scale of node ${e} not positive.`);
		}
		return {
			nodes: l,
			materials: s
		};
	} });
}
// src/agent-retarget.js
var it = 24;
function at(e) {
	return e.filter((e) => e.joint).map((e) => e.name);
}
function ot(e) {
	let { mapping: t, unmapped: n, missing: r } = de(at(e));
	return {
		mapped: Object.keys(t).length,
		unmapped: n.slice(0, it),
		unmappedCount: n.length,
		missing: r
	};
}
function st(e, t, n) {
	let r = ot(e), i = ot(t);
	for (let [e, t] of [["source", r], ["target", i]]) if (t.missing.length) throw RangeError(`${n}: the ${e} asset is not humanoid to the bone map. Missing bones: ${t.missing.join(", ")}. ${t.unmappedCount} joints are unmapped.`);
	return {
		source: r,
		target: i
	};
}
function ct(e, t, n, { scale: r = 1, rootMotion: i = !0 } = {}) {
	return fe(u(e), u(t), n, {
		scale: r,
		rootMotion: i
	});
}
var lt = 32, ut = 64, dt = 128, ft = 8, pt = 30;
function mt(e, t) {
	return {
		clips: e.map((e) => ({
			duration: e.duration,
			targets: new Set(e.tracks.map((e) => e.name.slice(0, e.name.lastIndexOf("."))))
		})),
		nodes: t.map(({ id: e, name: t }) => ({
			id: e,
			name: t
		})),
		hierarchy: t,
		external: /* @__PURE__ */ new Map()
	};
}
function ht(e) {
	return {
		clips: e.animations.map((e) => ({ duration: e.duration })),
		animations: e.animations,
		nodes: e.nodes.map((e) => structuredClone(e))
	};
}
function gt(e) {
	let t = new Map(e.nodes.map((e) => [e.id, e.name])), n = new Set(e.nodes.map((e) => e.name));
	return function(e, r) {
		if (typeof e != "string" || !e || e.length > dt) throw TypeError(`${r} needs a node ID or name of 1 to ${dt} characters.`);
		if (t.has(e)) return t.get(e);
		if (n.has(e)) return e;
		throw RangeError(`${r}: ${e.slice(0, 64)} is not a node of this asset. Find IDs and names with scene_inspect kind hierarchy.`);
	};
}
function _t(e, t, n) {
	let r = `Motion layer ${n} mask`;
	if (M(e, [
		"joints",
		"descendants",
		"exclude"
	], r), N(e.joints, lt, `${r} joints`), !e.joints.length) throw RangeError(`${r} needs at least one joint.`);
	let i = { joints: e.joints.map((e) => t(e, `${r} joint`)) };
	if (e.descendants !== void 0) {
		if (typeof e.descendants != "boolean") throw TypeError(`${r} descendants must be boolean.`);
		i.descendants = e.descendants;
	}
	return e.exclude !== void 0 && (N(e.exclude, lt, `${r} exclude`), i.exclude = e.exclude.map((e) => t(e, `${r} exclude`))), i;
}
function vt(e, t, n, r) {
	let i = `Motion layer ${r} bones`;
	if (!e || Object.getPrototypeOf(e) !== Object.prototype) throw TypeError(`${i} must be a plain object.`);
	let a = Object.entries(e);
	if (!a.length || a.length > ut) throw RangeError(`${i} needs 1 to ${ut} entries.`);
	let o = a.map(([e, r]) => {
		if (!t.targets.has(e)) throw RangeError(`${i}: the clip has no track for ${e.slice(0, 64)}.`);
		return [e, n(r, `${i} ${e.slice(0, 64)}`)];
	}), s = o.map(([, e]) => e);
	if (new Set(s).size !== s.length) throw RangeError(`${i} cannot send two clip nodes to the same node.`);
	return Object.fromEntries(o);
}
function yt(e, t, n) {
	M(e, ["asset", "clip"], `${n} from`);
	let r = typeof e.asset == "string" ? t.external.get(e.asset.toLowerCase()) : void 0;
	if (!r) throw RangeError(`${n} from.asset is not a catalog asset available to this session. Use an asset ID from scene_asset_catalog other than this scene's own.`);
	let i = r.clips[e.clip];
	if (!Number.isInteger(e.clip) || !i) throw RangeError(`${n} from.clip must be the index of a clip in that asset (0 to ${r.clips.length - 1}).`);
	return st(r.nodes, t.hierarchy, n), {
		from: {
			asset: e.asset.toLowerCase(),
			clip: e.clip
		},
		clip: i
	};
}
function bt(e, t, n, r) {
	let i = `Motion layer ${t}`;
	M(e, [
		"clip",
		"from",
		"scale",
		"rootMotion",
		"loop",
		"weight",
		"speed",
		"offset",
		"additive",
		"reference",
		"mask",
		"bones",
		"morph"
	], i);
	let a = {}, o;
	if (e.from !== void 0) {
		if (e.clip !== void 0 || e.bones !== void 0 || e.morph !== void 0) throw TypeError(`${i} takes from or clip, and from has no bones or morph.`);
		let t = yt(e.from, n, i);
		if (o = t.clip, a.from = t.from, e.scale !== void 0 && (a.scale = P(e.scale, .1, 10, `${i} scale`)), e.rootMotion !== void 0) {
			if (typeof e.rootMotion != "boolean") throw TypeError(`${i} rootMotion must be boolean.`);
			a.rootMotion = e.rootMotion;
		}
	} else {
		if (o = n.clips[e.clip], !Number.isInteger(e.clip) || !o) throw RangeError(`${i} clip must be the index of a clip in the asset (0 to ${n.clips.length - 1}).`);
		if (a.clip = e.clip, e.scale !== void 0 || e.rootMotion !== void 0) throw TypeError(`${i} scale and rootMotion only apply to a layer with from.`);
	}
	for (let t of [
		"loop",
		"additive",
		"morph"
	]) if (e[t] !== void 0) {
		if (typeof e[t] != "boolean") throw TypeError(`${i} ${t} must be boolean.`);
		a[t] = e[t];
	}
	return e.weight !== void 0 && (a.weight = P(e.weight, 0, 1, `${i} weight`)), e.speed !== void 0 && (a.speed = P(e.speed, .05, ft, `${i} speed`)), e.offset !== void 0 && (a.offset = P(e.offset, -30, pt, `${i} offset`)), e.reference !== void 0 && (a.reference = P(e.reference, 0, o.duration, `${i} reference`)), e.mask !== void 0 && (a.mask = _t(e.mask, r, t)), e.bones !== void 0 && (a.bones = vt(e.bones, o, r, t)), a;
}
function xt(e, t) {
	if (!t) throw RangeError("Motion layers play clips of an imported asset, so they need an asset recipe.");
	if (N(e, 8, "Motion layers"), !e.length) throw RangeError("Motion layers needs at least one layer. Leave it out to play none.");
	let n = gt(t);
	return e.map((e, r) => bt(e, r, t, n));
}
// src/foot-lock.js
var Y = 30, St = 3, Ct = ["left", "right"], X = Object.freeze({
	contactHeight: .05,
	contactSpeed: .35,
	blend: .1
});
function wt(e) {
	if (e === !0) return { ...X };
	M(e, [
		"contactHeight",
		"contactSpeed",
		"blend",
		"ground"
	], "Motion footLock");
	let t = {
		contactHeight: P(e.contactHeight ?? X.contactHeight, .001, 1, "footLock contactHeight"),
		contactSpeed: P(e.contactSpeed ?? X.contactSpeed, .01, 5, "footLock contactSpeed"),
		blend: P(e.blend ?? X.blend, .01, 1, "footLock blend")
	};
	if (e.ground !== void 0) {
		M(e.ground, ["height", "normal"], "Motion footLock ground");
		let n = j(e.ground.normal ?? [
			0,
			1,
			0
		], 3, "footLock ground normal"), r = Math.hypot(...n);
		if (!(r > 0) || n[1] / r < .5) throw RangeError("footLock ground normal must point up within 60 degrees of +Y.");
		t.ground = {
			height: P(e.ground.height ?? 0, -1e3, 1e3, "footLock ground height"),
			normal: n.map((e) => e / r)
		};
	}
	return t;
}
function Tt(e) {
	return e * e * (3 - 2 * e);
}
function Et(e, t) {
	let n = 1 / Y, r = Math.min(...e.map((e) => e[1])), i = e.map((i, a) => {
		let o = e[Math.max(0, a - 1)], s = e[Math.min(e.length - 1, a + 1)], c = (Math.min(e.length - 1, a + 1) - Math.max(0, a - 1)) * n, l = Math.hypot(s[0] - o[0], s[2] - o[2]) / c;
		return i[1] - r <= t.contactHeight && l <= t.contactSpeed;
	}), a = [], o = null;
	for (let e = 0; e <= i.length; e++) i[e] && o === null && (o = e), !i[e] && o !== null && (e - o >= St && a.push({
		first: o,
		last: e - 1
	}), o = null);
	return {
		lowest: r,
		phases: a
	};
}
function Dt(e, t, n) {
	if (!n) return e;
	let [r, i, a] = n.normal, o = e[0] * r + (e[1] - n.height) * i + e[2] * a;
	return n.normal.map((n, r) => e[r] - n * (o - t));
}
function Ot({ settings: e, nodes: t, rootMatrix: n, layers: r, duration: i, loop: a }) {
	let o = u(t, { rootMatrix: n }), s = Ct.map((e) => {
		let t = [
			"UpperLeg",
			"LowerLeg",
			"Foot"
		].map((t) => o.mapping[`${e}${t}`]);
		if (t.some((e) => e === void 0)) throw RangeError(`Motion footLock needs the ${e} leg mapped to the humanoid bones (${e}UpperLeg, ${e}LowerLeg, ${e}Foot). scene_inspect lists the unmapped joints.`);
		return {
			side: e,
			root: t[0],
			middle: t[1],
			end: t[2]
		};
	}), c = new Map(t.map((e) => [e.name, e.id])), d = r.map(({ morphs: e, ...t }) => t).filter((e) => e.clip), f = null;
	function p() {
		let t = l({
			rig: o,
			layers: d
		}), n = Math.max(2, Math.round(i * Y) + 1), r = s.map(() => []);
		for (let e = 0; e < n; e++) t.apply(Math.min(i, e / Y)), s.forEach((e, n) => r[n].push(t.jointWorld(e.end).position));
		return s.map((t, n) => {
			let { lowest: i, phases: a } = Et(r[n], e);
			return a.map(({ first: t, last: a }) => ({
				start: t / Y,
				end: a / Y,
				target: Dt(r[n][t], i, e.ground)
			}));
		});
	}
	function m() {
		return f ??= p(), f;
	}
	function h(e) {
		return a ? e % i : Math.min(e, i);
	}
	function g(t, n) {
		let r = {
			weight: 0,
			phase: t[0]
		};
		for (let i of t) {
			let t = 0;
			n >= i.start && n <= i.end ? t = 1 : n < i.start && n >= i.start - e.blend ? t = Tt((n - (i.start - e.blend)) / e.blend) : n > i.end && n <= i.end + e.blend && (t = Tt(1 - (n - i.end) / e.blend)), t > r.weight && (r = {
				weight: t,
				phase: i
			});
		}
		return r;
	}
	let _ = null;
	function v() {
		let t = m(), n = s.map((n, r) => {
			let i = t[r];
			return {
				type: "two-bone",
				root: n.root,
				middle: n.middle,
				end: n.end,
				target: (e, t) => i.length ? g(i, h(e)).phase.target : t,
				weight: (e) => i.length ? g(i, h(e)).weight : 0,
				...e.ground ? { groundNormal: e.ground.normal } : {}
			};
		});
		return _ = l({
			rig: o,
			ik: n
		}), _;
	}
	return {
		solve(e, t) {
			let n = _ ?? v(), r = new Map(t.map((e) => [e.id, e]));
			n.apply(e, (e, t) => {
				o.joints.forEach((n, i) => {
					let a = r.get(c.get(n.name));
					e[i].set(a.rotation), t[i].set(a.translation);
				});
			});
			let i = m();
			if (!s.some((t, n) => i[n].length && g(i[n], h(e)).weight > 0)) return [];
			let a = new Map(o.joints.map((e, t) => [e.name, t]));
			return s.flatMap((e) => [
				e.root,
				e.middle,
				e.end
			].map((e) => ({
				id: c.get(e),
				rotation: Array.from(n.localRotation(a.get(e)))
			})));
		},
		report() {
			let t = m();
			return {
				feet: s.map((e, n) => ({
					bone: `${e.side}Foot`,
					phases: t[n].map((e) => ({
						start: Number(e.start.toFixed(3)),
						end: Number(e.end.toFixed(3))
					}))
				})),
				...e.ground ? { ground: e.ground } : {}
			};
		}
	};
}
// src/agent-motion.js
var kt = /* @__PURE__ */ e({
	compileAgentMotion: () => mn,
	motionEffects: () => dn,
	motionEnvironment: () => un,
	motionMovesLook: () => fn,
	normalizeAgentMotion: () => rn
}), Z = {
	node: {
		translation: 3,
		rotation: 4,
		scale: 3,
		visible: 1
	},
	material: {
		color: 3,
		emissiveColor: 3,
		emission: 1,
		metallic: 1,
		roughness: 1
	},
	camera: {
		eye: 3,
		target: 3,
		fov: 1,
		roll: 1
	},
	morph: { weight: 1 },
	light: {
		position: 3,
		direction: 3,
		color: 3,
		intensity: 1
	},
	sun: {
		direction: 3,
		color: 3,
		intensity: 1
	},
	environment: {
		skyTop: 3,
		skyBottom: 3,
		fogColor: 3,
		fogDensity: 1,
		volumeFogDensity: 1,
		ambientIntensity: 1,
		fillIntensity: 1,
		environmentIntensity: 1,
		environmentRotation: 1
	},
	effects: {
		exposure: 1,
		focusDistance: 1
	}
}, At = /* @__PURE__ */ new Set([
	"camera",
	"sun",
	"environment",
	"effects"
]), jt = /* @__PURE__ */ new Set([
	"light",
	"sun",
	"environment",
	"effects"
]), Mt = {
	point: "pointLights",
	spot: "spotLights",
	area: "areaLights"
}, Nt = /* @__PURE__ */ new Set(["spot", "area"]), Pt = {
	light: {
		position: [-1e6, 1e6],
		direction: [-1e6, 1e6],
		color: [0, 1],
		intensity: [0, 1e5]
	},
	sun: {
		direction: [-1e6, 1e6],
		color: [0, 1e3],
		intensity: [0, 100]
	},
	environment: {
		skyTop: [0, 1],
		skyBottom: [0, 1],
		fogColor: [0, 1],
		fogDensity: [0, 10],
		volumeFogDensity: [0, 1e3],
		ambientIntensity: [0, 100],
		fillIntensity: [0, 100],
		environmentIntensity: [0, 100],
		environmentRotation: [-100, 100]
	},
	effects: {
		exposure: [.01, 16],
		focusDistance: [.01, 1e5]
	}
}, Ft = [
	"LINEAR",
	"STEP",
	"SMOOTH",
	"CUBICSPLINE"
], It = 16, Lt = 33, Rt = {
	eye: [
		4,
		3,
		5
	],
	target: [
		0,
		0,
		0
	],
	up: [
		0,
		1,
		0
	],
	fov: 45,
	near: .1,
	far: 1e3
};
function zt(e, t, n, r = `${e}.${t}`) {
	let i = typeof n == "number" ? [n] : n;
	for (let e of i) oe(e, r);
	if (t === "visible" && i.some((e) => e !== 0 && e !== 1)) throw a(r, n, "1 (shown) or 0 (hidden)");
	if (t === "scale" && i.some((e) => Math.fround(e) <= 0)) throw a(r, n, "positive numbers, such as [1, 1, 1]");
	if (e === "material") {
		if (i.some((e) => e < 0)) throw a(r, n, `numbers of 0 or more for ${t}, such as 0.5`);
		if ([
			"color",
			"metallic",
			"roughness"
		].includes(t) && i.some((e) => e > 1)) throw a(r, n, `numbers from 0 to 1 for ${t}, such as 0.5`);
	}
	if (e === "morph" && i.some((e) => e < 0 || e > 1)) throw a(r, n, "a morph weight from 0 to 1, such as 0.5");
	let o = Pt[e]?.[t];
	if (o && i.some((e) => e < o[0] || e > o[1])) throw a(r, n, `${e} ${t} values from ${o[0]} to ${o[1]}, such as ${Math.min(Math.max(1, o[0]), o[1])}`);
	if (t === "direction" && Math.hypot(...i) < 1e-6) throw a(r, n, "a direction that is not all zero, such as [0, -1, 0]; keyframes of opposite directions blend through zero");
	if (e === "camera" && t === "fov" && (Math.fround(n) <= 0 || Math.fround(n) >= 180)) throw a(r, n, "degrees above 0 and below 180, such as 50");
}
function Bt(e) {
	return e.property === "rotation" ? "rotation" : Z[e.kind][e.property] === 1 ? "value" : "translation";
}
function Vt(e, t) {
	let n = {
		time: e.time,
		value: Array.isArray(e.value) ? [...e.value] : e.value
	};
	return e.easing !== void 0 && (n.easing = e.easing), t === "CUBICSPLINE" && (n.inTangent = Array.isArray(e.inTangent) ? [...e.inTangent] : e.inTangent, n.outTangent = Array.isArray(e.outTangent) ? [...e.outTangent] : e.outTangent), n;
}
function Ht(e, t, n, i) {
	M(e, [
		"time",
		"value",
		"inTangent",
		"outTangent",
		"easing"
	], "motion keyframe");
	let a = Z[t.kind][t.property], o = {
		time: P(e.time, 0, n, "time"),
		value: j(e.value, a, "value")
	};
	zt(t.kind, t.property, o.value, "value");
	let s = r(e);
	if (s && i !== "LINEAR" && i !== "SMOOTH") throw RangeError(`Keyframe easing needs LINEAR or SMOOTH interpolation, not ${i}.`);
	if (Object.assign(o, s), i === "CUBICSPLINE") o.inTangent = j(e.inTangent, a, "Incoming tangent"), o.outTangent = j(e.outTangent, a, "Outgoing tangent");
	else if (Object.hasOwn(e, "inTangent") || Object.hasOwn(e, "outTangent")) throw TypeError("Tangents require CUBICSPLINE interpolation.");
	return o;
}
function Ut(e) {
	return Object.entries(Mt).flatMap(([t, n]) => (e[n] ?? []).map((e, n) => `${t}:${n}`));
}
function Wt(e, t) {
	let { kind: n, id: r, property: i } = e;
	if (jt.has(n)) {
		if (!t.environment || !t.effects) throw RangeError(`Motion ${n} tracks move the lights, sky and effects of a scene recipe; an imported asset has none.`);
		if (n === "light") {
			let e = Ut(t.environment);
			if (!e.includes(r)) throw RangeError(`Motion light was not found: ${JSON.stringify(r)}. Lights of this scene: ${e.join(", ") || "none"}. The sun is a sun track.`);
			if (i === "direction" && !Nt.has(r.split(":")[0])) throw RangeError(`Motion light ${r} has no direction; only spot and area lights do. A point light takes position, color and intensity.`);
		}
		if (n === "effects" && i === "focusDistance" && !(t.effects.depthOfField?.blur > 0)) throw RangeError("Motion focusDistance needs effects.depthOfField.blur above 0. A camera with an fStop focuses on its target, so move the camera target track instead.");
	}
}
function Q(e, t, n) {
	if (typeof e != "string" || !t.has(e)) throw RangeError(`${n} must be a node ID in this recipe; got ${JSON.stringify(e)}.`);
	return e;
}
function Gt(e, t, n, r) {
	M(e, ["keyframes", "interpolation"], r);
	let i = e.interpolation ?? "LINEAR";
	if (![
		"LINEAR",
		"STEP",
		"SMOOTH"
	].includes(i)) throw RangeError(`${r} interpolation must be LINEAR, STEP or SMOOTH.`);
	if (N(e.keyframes, 64, `${r} keyframes`), !e.keyframes.length) throw RangeError(`${r} needs at least one keyframe.`);
	return {
		interpolation: i,
		keyframes: e.keyframes.map((e) => (M(e, ["time", "value"], `${r} keyframe`), {
			time: P(e.time, 0, n, "Keyframe time"),
			value: j(e.value, t, `${r} value`)
		}))
	};
}
function Kt(e, t, n, r) {
	if (Array.isArray(e)) return j(e, 3, r);
	if (e && Object.hasOwn(e, "node")) return M(e, ["node"], r), { node: Q(e.node, t, `${r} node`) };
	if (e && Object.hasOwn(e, "keyframes")) return Gt(e, 3, n, r);
	throw TypeError(`${r} must be [x, y, z], { "node": id } or { "keyframes": [{ "time", "value" }] }.`);
}
function qt(e, t, n) {
	if (e === void 0) return 1;
	if (typeof e == "number") return P(e, 0, 1, n);
	let r = Gt(e, 1, t, n);
	return r.keyframes.forEach((e) => P(e.value, 0, 1, n)), r;
}
function Jt(e, t) {
	M(e, ["root", "middle"], t);
	let n = {};
	for (let r of Object.keys(e)) {
		M(e[r], [
			"x",
			"y",
			"z"
		], `${t} ${r}`), n[r] = {};
		for (let i of Object.keys(e[r])) {
			let a = j(e[r][i], 2, `${t} ${r}.${i}`);
			if (a[0] > a[1] || a[0] < -180 || a[1] > 180) throw RangeError(`${t} ${r}.${i} must be [min, max] degrees within -180 and 180, min first.`);
			n[r][i] = a;
		}
	}
	return n;
}
function Yt(e, t, n, r, i) {
	let a = `Motion ik ${t}`;
	if (e?.type === "two-bone") {
		M(e, [
			"type",
			"root",
			"middle",
			"end",
			"target",
			"pole",
			"weight",
			"keepEndRotation",
			"limits",
			"bendToward"
		], a);
		let t = {
			type: "two-bone",
			root: Q(e.root, n, `${a} root`),
			middle: Q(e.middle, n, `${a} middle`),
			end: Q(e.end, n, `${a} end`),
			target: Kt(e.target, r, i, `${a} target`),
			weight: qt(e.weight, i, `${a} weight`)
		};
		if (e.pole !== void 0 && (t.pole = Kt(e.pole, r, i, `${a} pole`)), e.keepEndRotation !== void 0) {
			if (typeof e.keepEndRotation != "boolean") throw TypeError(`${a} keepEndRotation must be boolean.`);
			t.keepEndRotation = e.keepEndRotation;
		}
		return e.limits !== void 0 && (t.limits = Jt(e.limits, `${a} limits`)), e.bendToward !== void 0 && (t.bendToward = j(e.bendToward, 3, `${a} bendToward`)), t;
	}
	if (e?.type === "aim") {
		if (M(e, [
			"type",
			"joint",
			"joints",
			"forward",
			"worldForward",
			"target",
			"maxAngle",
			"weight"
		], a), e.forward !== void 0 && e.worldForward !== void 0) throw TypeError(`${a} takes forward or worldForward, not both.`);
		if (e.joint === void 0 == (e.joints === void 0)) throw TypeError(`${a} needs joint, or joints listed from the base of the chain to the aiming node.`);
		let t = e.joints === void 0 ? [e.joint] : N(e.joints, 16, `${a} joints`);
		if (!t.length) throw RangeError(`${a} joints cannot be empty.`);
		let o = {
			type: "aim",
			joints: t.map((e) => Q(e, n, `${a} joint`)),
			target: Kt(e.target, r, i, `${a} target`),
			weight: qt(e.weight, i, `${a} weight`)
		};
		return e.worldForward === void 0 ? o.forward = j(e.forward ?? [
			0,
			0,
			1
		], 3, `${a} forward`) : o.worldForward = j(e.worldForward, 3, `${a} worldForward`), e.maxAngle !== void 0 && (o.maxAngle = P(e.maxAngle, .001, 180, `${a} maxAngle`)), o;
	}
	throw RangeError(`${a} type must be two-bone or aim.`);
}
function Xt(e) {
	return e.type === "two-bone" ? [
		e.root,
		e.middle,
		e.end
	] : e.joints;
}
function Zt(e) {
	return [e.target, e.pole].filter((e) => e?.node).map((e) => e.node);
}
function Qt(e, t) {
	let n = [], r = t.get(e)?.parent;
	for (; r != null;) n.push(r), r = t.get(r)?.parent;
	return n;
}
function $t(e, t, n) {
	let r = new Map($(n).map((e) => [e.id, e])), i = new Set(t.filter((e) => e.kind === "node" && e.property === "scale").map((e) => e.id)), a = /* @__PURE__ */ new Set();
	for (let t of e) for (let e of [...Xt(t), ...Zt(t)]) Qt(e, r).forEach((e) => a.add(e));
	for (let e of a) {
		if (i.has(e)) throw RangeError(`Motion ik: node ${e} has IK nodes below it, so it cannot have a scale track.`);
		let t = r.get(e).scale ?? [
			1,
			1,
			1
		];
		if (Math.max(...t) - Math.min(...t) > .001 * Math.max(...t)) throw RangeError(`Motion ik: node ${e} has non-uniform scale ${JSON.stringify(t)}. It has IK nodes below it, so keep it at uniform scale and put the size on a child node with the geometry.`);
	}
}
function $(e) {
	return e.ikHierarchy ?? e.nodes;
}
function en(e, t, n, r) {
	N(e, It, "Motion ik");
	let i = new Set(t.nodes.map((e) => e.id)), a = new Set($(t).map((e) => e.id)), o = e.map((e, t) => Yt(e, t, i, a, r));
	return $t(o, n, t), o;
}
function tn(e) {
	let t = 0;
	for (let n of e) for (let e of [
		n.target,
		n.pole,
		n.weight
	]) t += e?.keyframes?.length ?? 0;
	return t;
}
function nn(e, t) {
	if (!t.normalizeDrive) throw RangeError("motion.drive moves an imported asset recipe. For an asset placed in a scene, give the placement a drive: { asset: { id, drive } }.");
	let n = t.normalizeDrive(e);
	return {
		canonical: n,
		built: t.buildDrive(n)
	};
}
function rn(e, t) {
	if (e == null) return null;
	M(e, [
		"duration",
		"loop",
		"tracks",
		"ik",
		"constraints",
		"drivers",
		"layers",
		"footLock",
		"drive"
	], "motion");
	let r = e.drive === void 0 ? null : nn(e.drive, t), o = P(e.duration === void 0 && r ? Math.ceil(r.built.duration * 1e3) / 1e3 : e.duration, .1, 30, "motion.duration"), s = e.loop !== void 0 && e.loop;
	if (typeof s != "boolean") throw a("motion.loop", s, "true or false", TypeError);
	let c = e.tracks ?? [];
	if (N(c, 128, "Motion tracks"), !c.length && !e.layers?.length && !e.ik?.length && !e.constraints?.length && !e.drivers?.length && !r) throw RangeError("Motion needs at least one track, IK solver, constraint or driver. Use null to clear it.");
	let l = new Set((t.nodes ?? []).map((e) => e.id)), u = new Set((t.materials ?? []).map((e) => e.id)), d = new Set(t.morphTargets ?? (t.geometries ?? []).flatMap((e) => (e.shapeKeys ?? []).map((e) => e.name))), f = /* @__PURE__ */ new Set(), p = 0, m = c.map((e, r) => {
		if (M(e, [
			"kind",
			"id",
			"property",
			"interpolation",
			"keyframes"
		], "motion track"), !Object.hasOwn(Z, e.kind) || !Object.hasOwn(Z[e.kind], e.property)) {
			let t = Object.hasOwn(Z, e.kind) ? ` ${e.kind} properties: ${Object.keys(Z[e.kind]).join(", ")}.` : ` Kinds: ${Object.keys(Z).join(", ")}.`;
			throw a(`motion.tracks[${r}].property`, `${e.kind}.${e.property}`, `a kind and property pair.${t}`);
		}
		if (At.has(e.kind)) {
			if (Object.hasOwn(e, "id")) throw TypeError(`${e.kind[0].toUpperCase()}${e.kind.slice(1)} tracks cannot have an ID.`);
		} else {
			if (typeof e.id != "string" || !e.id.trim() || e.id.length > 128) throw TypeError("Motion target IDs need 1 to 128 characters.");
			let t = e.kind === "node" ? l : e.kind === "morph" ? d : u;
			if (e.kind !== "light" && !t.has(e.id)) {
				let t = e.kind === "morph" ? ` Morph targets of this asset: ${[...d].slice(0, 24).join(", ") || "none"}.` : "";
				throw RangeError(`Motion target was not found: ${e.id}.${t}`);
			}
		}
		Wt(e, t);
		let c = JSON.stringify([
			e.kind,
			e.id ?? null,
			e.property
		]);
		if (f.has(c)) throw a(`motion.tracks[${r}].property`, `${e.kind}.${e.property}`, "one track per target and property, but this one repeats an earlier track: merge the keyframes, or drop the duplicate");
		f.add(c);
		let m = e.interpolation ?? (e.property === "visible" ? "STEP" : "LINEAR");
		if (!Ft.includes(m)) throw a(`motion.tracks[${r}].interpolation`, m, `one of ${Ft.join(", ")}`);
		if (N(e.keyframes, 64, "Motion keyframes"), p += e.keyframes.length, p > 2048) throw RangeError("Motion exceeds 2048 total keyframes.");
		let h = e.keyframes.map((t, n) => i(`motion.tracks[${r}].keyframes[${n}]`, () => Ht(t, e, o, m))), g = n({
			duration: o,
			loop: s,
			tracks: [{
				target: String(r),
				property: Bt(e),
				interpolation: m,
				keyframes: h
			}]
		}), _ = {
			kind: e.kind,
			property: e.property,
			interpolation: m,
			keyframes: g.tracks[0].keyframes.map((e) => Vt(e, m))
		};
		return At.has(e.kind) || (_.id = e.id), _;
	}), h = {
		duration: o,
		loop: s,
		tracks: m
	};
	if (r && (h.drive = r.canonical), e.layers !== void 0 && (h.layers = xt(e.layers, t.clipLayerContext)), e.footLock !== void 0) {
		if (!h.layers?.length) throw RangeError("Motion footLock plants the feet of the clips in motion.layers, so it needs layers.");
		h.footLock = wt(e.footLock);
	}
	if (e.ik !== void 0 && (h.ik = en(e.ik, t, m, o), p + tn(h.ik) > 2048)) throw RangeError("Motion exceeds 2048 total keyframes.");
	let g = new Set($(t).map((e) => e.id));
	if (e.constraints !== void 0 && (h.constraints = je(e.constraints, l, g)), e.drivers !== void 0) {
		h.drivers = Ne(e.drivers, l, u, g);
		for (let { target: e } of h.drivers) if (f.has(JSON.stringify([
			e.kind,
			e.id,
			e.property
		]))) throw RangeError(`Motion driver for ${e.id} ${e.property} clashes with a track on the same property.`);
	}
	return h;
}
function an(e, t) {
	let n = $(t), r = new Map(n.map((e) => [e.id, e])), i = /* @__PURE__ */ new Set();
	for (let t of e) for (let e of [...Xt(t), ...Zt(t)]) i.add(e), Qt(e, r).forEach((e) => i.add(e));
	let a = n.filter((e) => i.has(e.id)), o = new Map(a.map((e, t) => [e.id, t]));
	return {
		mapping: {},
		...t.ikRootMatrix ? { rootMatrix: t.ikRootMatrix } : {},
		joints: a.map((e) => ({
			name: e.id,
			parent: e.parent === void 0 || e.parent === null ? -1 : o.get(e.parent),
			translation: e.translation ?? [
				0,
				0,
				0
			],
			rotation: e.rotation ?? [
				0,
				0,
				0,
				1
			],
			scale: e.scale ?? [
				1,
				1,
				1
			]
		}))
	};
}
function on(e, t, r) {
	let i = [];
	return e.forEach((e, t) => {
		e.target.keyframes && i.push({
			target: `target ${t}`,
			property: "translation",
			interpolation: e.target.interpolation,
			keyframes: e.target.keyframes
		}), e.pole?.keyframes && i.push({
			target: `pole ${t}`,
			property: "translation",
			interpolation: e.pole.interpolation,
			keyframes: e.pole.keyframes
		}), e.weight.keyframes && i.push({
			target: `weight ${t}`,
			property: "value",
			interpolation: e.weight.interpolation,
			keyframes: e.weight.keyframes
		});
	}), i.length ? n({
		duration: t,
		loop: r,
		tracks: i
	}) : null;
}
function sn(e, n, r) {
	let i = an(e.ik, n), a = on(e.ik, e.duration, e.loop), o = a ? t(a) : null, s = (e) => o.tracks.find((t) => t.target === e).output, c = null, u = (e, t) => {
		if (Array.isArray(e)) return () => e;
		if (e.node) return () => c.jointWorld(e.node).position;
		let n = s(t);
		return () => n;
	}, d = e.ik.map((e, t) => {
		let n = e.weight.keyframes ? s(`weight ${t}`) : null, r = {
			target: u(e.target, `target ${t}`),
			weight: n ? () => Math.min(1, Math.max(0, n[0])) : e.weight
		};
		return e.type === "aim" ? {
			...r,
			type: "aim",
			joints: e.joints,
			forward: e.forward,
			worldForward: e.worldForward,
			maxAngle: e.maxAngle
		} : {
			...r,
			type: "two-bone",
			root: e.root,
			middle: e.middle,
			end: e.end,
			...e.pole ? { pole: u(e.pole, `pole ${t}`) } : {},
			keepEndRotation: e.keepEndRotation,
			limits: e.limits,
			bendToward: e.bendToward
		};
	});
	c = l({
		rig: i,
		ik: d
	});
	let f = new Map(i.joints.map((e, t) => [e.name, t])), p = i.joints.map((e, t) => ({
		index: t,
		tracks: r.get(e.name)
	})), m = new Set(e.ik.flatMap((e) => e.type === "aim" ? e.joints : e.keepEndRotation === !1 ? [e.root, e.middle] : [
		e.root,
		e.middle,
		e.end
	])), h = new Map([...m].map((e) => [e, /* @__PURE__ */ new Float64Array(4)]));
	function g(e, t) {
		for (let { index: n, tracks: r } of p) r?.rotation && e[n].set(r.rotation), r?.translation && t[n].set(r.translation);
	}
	return {
		staged: h,
		solve(e, t) {
			if (o?.sample(e), t) {
				let n = new Map(t.map((e) => [e.id, e]));
				c.apply(e, (e, t) => {
					i.joints.forEach((r, i) => {
						let a = n.get(r.name);
						e[i].set(a.rotation), t[i].set(a.translation);
					});
				});
			} else c.apply(e, g);
			for (let [e, t] of h) if (t.set(c.localRotation(f.get(e))), !t.every(Number.isFinite)) throw RangeError(`Motion ik produced an invalid rotation for node ${e}.`);
			return c.ikResults;
		}
	};
}
function cn(e) {
	let t = e.emission ?? 0, n = e.emissiveColor ?? e.color ?? [
		.5,
		.5,
		.5
	];
	for (let r of n) {
		let n = Math.fround(r) * Math.fround(t);
		if (!Number.isFinite(Math.fround(n))) throw RangeError("Motion emissive radiance exceeds Float32 range.");
		if (e.tag === "unlit" && n > 65500) throw RangeError("Motion unlit radiance exceeds the HDR range.");
	}
}
function ln(e) {
	let t = (e.drivers ?? []).filter((e) => e.target.kind === "node").map((e) => e.target.id);
	return /* @__PURE__ */ new Set([...t, ...(e.constraints ?? []).map((e) => e.node)]);
}
function un(e, t) {
	for (let [n, r] of t.lights) {
		let [t, i] = n.split(":");
		Object.assign(e[Mt[t]][Number(i)], pn(r));
	}
	if (t.sun) {
		let { direction: n, color: r, intensity: i } = pn(t.sun);
		n && (e.lightDirection = n), r && (e.keyColor = r), i !== void 0 && (e.keyIntensity = i);
	}
	if (t.environment) {
		let { volumeFogDensity: n, ...r } = pn(t.environment);
		Object.assign(e, r), n !== void 0 && (e.volumeFog.density = n);
	}
	return e;
}
function dn(e, t) {
	let { exposure: n, focusDistance: r } = t.effects;
	return n !== void 0 && (e.exposure = n), r !== void 0 && (e.depthOfField.focusDistance = r), e;
}
function fn(e) {
	return !!(e && (e.lights.size || e.sun || e.environment || e.effects));
}
function pn(e) {
	return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, typeof t == "number" ? t : Array.from(t)]));
}
function mn(e, r) {
	let i = rn(e, r);
	if (i === null) return null;
	let a = i.tracks.filter((e) => e.kind !== "camera"), c = n({
		duration: i.duration,
		loop: i.loop,
		tracks: a.map((e, t) => ({
			target: String(t),
			property: Bt(e),
			interpolation: e.interpolation,
			keyframes: e.keyframes
		}))
	}), l = t(c), u = {
		nodes: /* @__PURE__ */ new Map(),
		materials: /* @__PURE__ */ new Map(),
		morphs: /* @__PURE__ */ new Map(),
		lights: /* @__PURE__ */ new Map(),
		sun: null,
		environment: null,
		effects: null,
		camera: null
	}, d = {
		node: u.nodes,
		material: u.materials,
		morph: u.morphs,
		light: u.lights
	}, f = a.map((e, t) => {
		let n;
		if (jt.has(e.kind) && e.kind !== "light") u[e.kind] ??= {}, n = u[e.kind];
		else {
			let t = d[e.kind];
			t.has(e.id) || t.set(e.id, {}), n = t.get(e.id);
		}
		let r = Z[e.kind][e.property];
		return n[e.property] = r === 1 ? 0 : new Float64Array(r), {
			track: e,
			patch: n,
			staged: l.tracks[t].output
		};
	}), p = /* @__PURE__ */ new Map();
	for (let { track: e, staged: t } of f) e.kind === "node" && (p.has(e.id) || p.set(e.id, {}), p.get(e.id)[e.property] = t);
	let m = i.ik?.length ? sn(i, r, p) : null, h = rt({
		hierarchy: $(r),
		rootMatrix: r.ikRootMatrix,
		constraints: i.constraints,
		drivers: i.drivers,
		materials: r.materials ?? []
	}), g = !!((m || h) && r.ikHierarchy);
	if (m && !g) for (let e of m.staged.keys()) {
		u.nodes.has(e) || u.nodes.set(e, {});
		let t = u.nodes.get(e);
		t.rotation ||= /* @__PURE__ */ new Float64Array(4);
	}
	if (h && !g) for (let e of ln(i)) {
		u.nodes.has(e) || u.nodes.set(e, {});
		let t = u.nodes.get(e);
		t.translation ??= /* @__PURE__ */ new Float64Array(3), t.rotation ??= /* @__PURE__ */ new Float64Array(4), t.scale ??= /* @__PURE__ */ new Float64Array(3);
	}
	let _ = (i.drivers ?? []).filter((e) => e.target.kind === "material");
	for (let { target: e } of _) u.materials.has(e.id) || u.materials.set(e.id, {}), u.materials.get(e.id)[e.property] = e.component === void 0 ? 0 : /* @__PURE__ */ new Float64Array(3);
	let v = i.drive ? r.buildDrive(i.drive) : null;
	if (v) {
		for (let { id: e } of v.sample(0).nodeOverrides) u.nodes.set(e, {
			translation: /* @__PURE__ */ new Float64Array(3),
			rotation: /* @__PURE__ */ new Float64Array(4),
			scale: /* @__PURE__ */ new Float64Array(3)
		});
		for (let { material: e } of i.drive.lights?.tailLights ?? []) u.materials.set(e, { emission: 0 });
	}
	let y = new Map((r.materials ?? []).map((e) => [e.id, structuredClone(e)])), b = i.tracks.filter((e) => e.kind === "camera"), x = {
		...structuredClone(Rt),
		...structuredClone(r.camera ?? {}),
		duration: i.duration,
		loop: i.loop
	};
	for (let e of b) x[e.property] = {
		interpolation: e.interpolation,
		keyframes: e.keyframes
	};
	let S = b.length ? o(x) : null, C = S ? {
		eye: /* @__PURE__ */ new Float32Array(3),
		target: /* @__PURE__ */ new Float32Array(3),
		up: /* @__PURE__ */ new Float32Array(3)
	} : null;
	if (S) {
		if (x.focalLength !== void 0 && b.some((e) => e.property === "fov")) throw RangeError("A camera with a focalLength cannot have a fov track. Give the camera a fov, or leave fov out of the motion.");
		u.camera = {
			eye: /* @__PURE__ */ new Float32Array(3),
			target: /* @__PURE__ */ new Float32Array(3),
			up: /* @__PURE__ */ new Float32Array(3),
			fov: 45,
			near: x.near,
			far: x.far,
			...Object.fromEntries(s.filter((e) => x[e] !== void 0).map((e) => [e, x[e]]))
		};
	}
	let w = new Map([...u.materials.keys()].map((e) => [e, { ...y.get(e) }])), T = () => new Map([...p].map(([e, t]) => [e, { ...t }]));
	function E() {
		let e = T();
		for (let [t, n] of m?.staged ?? []) e.set(t, {
			...e.get(t),
			rotation: n
		});
		return e;
	}
	return Object.freeze({
		ikUsesStagedPose: g,
		driveSampler: v,
		solveStagedPose(e, t) {
			let n = /* @__PURE__ */ new Map(), r = new Map(t.map(({ id: e, translation: t, rotation: n, scale: r }) => [e, {
				translation: t,
				rotation: n,
				scale: r
			}]));
			if (m) {
				m.solve(e, t);
				for (let [e, t] of m.staged) n.set(e, { rotation: Array.from(t) }), r.set(e, {
					...r.get(e),
					rotation: t
				});
			}
			if (h) for (let [t, i] of h.evaluate(e, r).nodes) n.set(t, {
				translation: Array.from(i.translation),
				rotation: Array.from(i.rotation),
				scale: Array.from(i.scale)
			});
			return [...n].map(([e, t]) => ({
				id: e,
				...t
			}));
		},
		sweepIk(e) {
			if (!m) return [];
			let t = i.ik.map((e) => ({
				type: e.type,
				reached: !0,
				worstError: 0,
				atTime: 0,
				warnings: [],
				limited: []
			}));
			for (let n = 0; n < Lt; n++) {
				let r = i.duration * n / 32;
				l.sample(r), m.solve(r, e?.(r)).forEach((e, n) => {
					let i = t[n], a = Number(r.toFixed(3));
					i.reached = i.reached && e.reached, e.error > i.worstError && (i.worstError = Number(e.error.toFixed(6)), i.atTime = a);
					for (let t of e.warnings ?? []) i.warnings.some((e) => e.code === t.code) || i.warnings.push({
						...t,
						atTime: a
					});
					for (let t of e.limited ?? []) i.limited.some((e) => e.joint === t.joint && e.axis === t.axis) || i.limited.push({
						...t,
						atTime: a
					});
				});
			}
			return t;
		},
		sample(e) {
			P(e, 0, 3600, "Motion sample time"), l.sample(e);
			for (let { track: e, staged: t } of f) {
				let n = t.length === 1 ? t[0] : t;
				zt(e.kind, e.property, n), e.kind === "material" && (w.get(e.id)[e.property] = n);
			}
			let t = v?.sample(e);
			g || m?.solve(e);
			let n = h?.evaluate(e, g ? T() : E()), r = [];
			for (let { target: e } of _) {
				let t = n.materials.get(e.id)[e.property];
				zt("material", e.property, t), w.get(e.id)[e.property] = t, r.push({
					target: e,
					value: t
				});
			}
			for (let e of w.values()) cn(e);
			if (S) {
				S.sample(e, C);
				for (let e of [
					"fov",
					"near",
					"far"
				]) oe(C[e], `Camera ${e}`);
				if (Math.fround(C.fov) <= 0 || Math.fround(C.fov) >= 180 || Math.fround(C.near) <= 0 || Math.fround(C.far) <= Math.fround(C.near)) throw RangeError("Sampled camera lens is invalid at Float32 precision.");
			}
			for (let { track: e, patch: t, staged: n } of f) n.length === 1 ? t[e.property] = n[0] : t[e.property].set(n);
			if (m && !g) for (let [e, t] of m.staged) u.nodes.get(e).rotation.set(t);
			if (n && !g) for (let [e, t] of n.nodes) {
				let n = u.nodes.get(e);
				n.translation.set(t.translation), n.rotation.set(t.rotation), n.scale.set(t.scale);
			}
			for (let e of t?.nodeOverrides ?? []) {
				let t = u.nodes.get(e.id);
				t.translation.set(e.translation), t.rotation.set(e.rotation), t.scale.set(e.scale);
			}
			for (let { material: e, emission: n } of t?.emissions ?? []) u.materials.get(e).emission = n;
			for (let { target: e, value: t } of r) {
				let n = u.materials.get(e.id);
				typeof t == "number" ? n[e.property] = t : n[e.property].set(t);
			}
			if (S) {
				for (let e of [
					"eye",
					"target",
					"up"
				]) u.camera[e].set(C[e]);
				for (let e of [
					"fov",
					"near",
					"far"
				]) u.camera[e] = C[e];
			}
			return u;
		}
	});
}
export { Ot as a, ct as c, rn as i, st as l, mn as n, mt as o, un as r, ht as s, kt as t };
