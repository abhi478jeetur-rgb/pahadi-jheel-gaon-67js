/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { S as e, b as t, d as n, f as r, h as i, l as a, o, p as s, s as c, u as l, v as u, y as d } from "./mat4-BCZClxna.js";
import { a as f, g as p, h as m, o as h, p as g, s as _, t as v, x as y, y as b } from "./vec3-BRYC6f_g.js";
// src/vehicle.js
var x = Object.freeze({
	"+x": [
		1,
		0,
		0
	],
	"-x": [
		-1,
		0,
		0
	],
	"+z": [
		0,
		0,
		1
	],
	"-z": [
		0,
		0,
		-1
	]
}), S = Object.freeze([
	0,
	1,
	0
]), C = 35 * Math.PI / 180, w = .35, T = 1 / 240, E = 2, D = .1, O = 2e4, k = .5, A = /* @__PURE__ */ new Map([
	["wheel", "wheel"],
	["wheels", "wheel"],
	["tire", "tire"],
	["tires", "tire"],
	["tyre", "tire"],
	["tyres", "tire"],
	["rim", "rim"],
	["rims", "rim"],
	["hub", "rim"],
	["hubcap", "rim"],
	["hubcaps", "rim"]
]), j = /* @__PURE__ */ new Set([
	"steering",
	"spare",
	"fender",
	"fenders",
	"mudguard",
	"arch",
	"arches",
	"well",
	"wells",
	"guard",
	"brake",
	"brakes",
	"caliper",
	"rotor",
	"disc",
	"housing",
	"cover",
	"shield"
]), ee = /* @__PURE__ */ new Map([
	["fl", ["front", "left"]],
	["fr", ["front", "right"]],
	["rl", ["rear", "left"]],
	["rr", ["rear", "right"]],
	["bl", ["rear", "left"]],
	["br", ["rear", "right"]],
	["lf", ["front", "left"]],
	["rf", ["front", "right"]],
	["lr", ["rear", "left"]],
	["lb", ["rear", "left"]],
	["rb", ["rear", "right"]]
]), te = /* @__PURE__ */ new Map([
	["front", "front"],
	["rear", "rear"],
	["back", "rear"]
]), ne = /* @__PURE__ */ new Map([
	["left", "left"],
	["l", "left"],
	["right", "right"],
	["r", "right"]
]);
function M() {
	return r(/* @__PURE__ */ new Float64Array(16));
}
function N(e, t) {
	if (!Number.isFinite(e) || e <= 0) throw RangeError(t);
}
function P(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function re(e) {
	return e.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}
function ie(e) {
	let t = null, n = null;
	for (let r of e) {
		let e = ee.get(r);
		e && (t ??= e[0], n ??= e[1]), t ??= te.get(r) ?? null, n ??= ne.get(r) ?? null;
	}
	return {
		axle: t,
		side: n
	};
}
function F(e) {
	if (!Array.isArray(e) || e.some((e) => typeof e != "string")) throw TypeError("findWheelCandidates needs an array of name strings.");
	let t = [], n = [];
	return e.forEach((e, r) => {
		let i = re(e), a = i.find((e) => A.has(e));
		if (!a) return;
		let o = i.find((e) => j.has(e));
		if (o) {
			n.push({
				index: r,
				name: e,
				reason: `contains "${o}", which does not roll with the wheel`
			});
			return;
		}
		let { axle: s, side: c } = ie(i), l = s && c ? `${s}-${c}` : null;
		t.push({
			index: r,
			name: e,
			kind: A.get(a),
			axle: s,
			side: c,
			corner: l
		});
	}), {
		wheels: t,
		rejected: n
	};
}
function ae(e) {
	if (!Array.isArray(e) || e.length === 0) throw TypeError("parts must be a non-empty array of parts with a 16-value matrix.");
	return I("parts", e.map((e, t) => {
		if (!e || !e.matrix || e.matrix.length !== 16) throw TypeError(`Part ${t} needs a 16-value matrix.`);
		let n = Float64Array.from(e.matrix);
		return {
			key: e,
			label: String(e.name ?? `part-${t}`),
			parentKey: null,
			restWorld: n,
			meshes: e.geometry ? [{
				geometry: e.geometry,
				matrix: n
			}] : []
		};
	}));
}
function oe(e) {
	if (!e || !e.nodes || e.nodes.length === 0) throw TypeError("graph must be a scene graph with nodes.");
	return I("graph", Array.from(e.nodes, (e) => {
		let t = Float64Array.from(e.worldMatrix);
		return {
			key: e.name,
			label: e.name,
			parentKey: e.parent,
			restWorld: t,
			pivot: e.pivot,
			meshes: e.geometry ? [{
				geometry: e.geometry,
				matrix: t
			}] : []
		};
	}));
}
function se(e) {
	let t = M();
	return o(t, e.rotation, e.translation, e.scale), t;
}
function ce(e) {
	if (!e || !e.nodes || !e.parts || typeof e.stagePose != "function") throw TypeError("asset must be a loadGltf result with nodes, parts and stagePose.");
	let t = new Map(e.nodes.map((e) => [e.id, e])), n = /* @__PURE__ */ new Map();
	function r(e) {
		if (n.has(e)) return n.get(e);
		let a = t.get(e), o = se(a), s = a.parent === null ? o : i(M(), r(a.parent), o);
		return n.set(e, s), s;
	}
	return I("asset", e.nodes.map((t) => ({
		key: t.id,
		label: t.label,
		parentKey: t.parent,
		restWorld: r(t.id),
		editable: t.editable,
		meshes: (t.meshIds ?? []).map((t) => {
			let n = e.parts[Number(t.slice(5))];
			return {
				geometry: n.geometry,
				matrix: Float64Array.from(n.matrix)
			};
		})
	})));
}
function I(e, t) {
	let n = new Map(t.map((e) => [e.key, e]));
	for (let e of t) e.childKeys = [];
	for (let e of t) e.parentKey !== null && n.has(e.parentKey) && n.get(e.parentKey).childKeys.push(e.key);
	return {
		kind: e,
		entries: t,
		byKey: n
	};
}
function le({ parts: e, graph: t, asset: n }) {
	if ([
		e,
		t,
		n
	].filter((e) => e !== void 0).length !== 1) throw TypeError("createVehicleRig needs exactly one of parts, graph or asset.");
	return e === void 0 ? t === void 0 ? ce(n) : oe(t) : ae(e);
}
function L(e, t) {
	if (e.byKey.has(t)) return e.byKey.get(t);
	if (Number.isInteger(t) && e.kind === "parts" && e.entries[t]) return e.entries[t];
	if (typeof t == "string") {
		let n = e.entries.filter((e) => e.label === t);
		if (n.length === 1) return n[0];
		if (n.length > 1) throw RangeError(`Vehicle ${e.kind} name is ambiguous: ${t}`);
	}
	throw RangeError(`Vehicle ${e.kind} was not found: ${String(t?.name ?? t)}`);
}
function R(e, t, n = []) {
	n.push(...t.meshes);
	for (let r of t.childKeys) R(e, e.byKey.get(r), n);
	return n;
}
function z(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	], r = f();
	for (let { geometry: i, matrix: a } of e) {
		let e = i.positions;
		for (let i = 0; i + 2 < e.length; i += 3) {
			p(r, e[i], e[i + 1], e[i + 2]), y(r, r, a);
			for (let e = 0; e < 3; e++) t[e] = Math.min(t[e], r[e]), n[e] = Math.max(n[e], r[e]);
		}
	}
	return Number.isFinite(t[0]) ? {
		minimum: t,
		maximum: n
	} : null;
}
function B(e, t) {
	let n = 0;
	for (let r = 0; r < 3; r++) n += Math.abs(t[r]) * (e.maximum[r] - e.minimum[r]);
	return n;
}
function V(e, t) {
	return {
		center: e.minimum.map((t, n) => (t + e.maximum[n]) / 2),
		radius: Math.max(B(e, S), B(e, t)) / 2
	};
}
function H(e, t, n) {
	let r = t.parentKey;
	for (; r !== null && e.byKey.has(r);) {
		if (n.has(r)) return !0;
		r = e.byKey.get(r).parentKey;
	}
	return !1;
}
function ue(e, t) {
	let { wheels: n, rejected: r } = F(e.entries.map((e) => e.label)), i = new Set(n.map((t) => e.entries[t.index].key)), a = n.filter((t) => !H(e, e.entries[t.index], i)), o = /* @__PURE__ */ new Map(), s = [];
	for (let t of a) if (t.corner) {
		let n = o.get(t.corner) ?? {
			id: t.corner,
			axle: t.axle,
			side: t.side,
			entries: []
		};
		n.entries.push(e.entries[t.index]), o.set(t.corner, n);
	} else s.push(e.entries[t.index]);
	let c = (n) => {
		let r = z(R(e, n));
		return r ? {
			entry: n,
			...V(r, t)
		} : {
			entry: n,
			center: null,
			radius: 0
		};
	}, l = Array.from(o.values()).map((e) => {
		let t = e.entries.map(c).sort((e, t) => t.radius - e.radius)[0];
		return {
			...e,
			center: t.center,
			radius: t.radius
		};
	});
	for (let e of s.map(c).sort((e, t) => t.radius - e.radius)) {
		let t = e.center && l.find((t) => t.center && _(t.center, e.center) < t.radius * .6);
		t ? t.entries.push(e.entry) : l.push({
			id: `wheel-${l.length}`,
			axle: null,
			side: null,
			entries: [e.entry],
			center: e.center,
			radius: e.radius
		});
	}
	return {
		groups: l,
		rejected: r
	};
}
function de(e, t, n) {
	let r = t.targets ?? t.parts ?? t.nodes ?? [t.target ?? t.part ?? t.node];
	if (!Array.isArray(r) || r.length === 0 || r.includes(void 0)) throw TypeError(`Wheel ${n} needs a part, node or targets list.`);
	let i = r.map((t) => L(e, t));
	return {
		id: t.id ?? i[0].label,
		entries: i,
		axle: t.axle,
		side: t.side,
		spec: t
	};
}
function fe(e, t, n) {
	if (t === void 0 || t === "auto") {
		let { groups: t, rejected: r } = ue(e, n);
		return {
			described: t.map((e) => ({
				id: e.id,
				entries: e.entries,
				axle: e.axle,
				side: e.side,
				spec: {}
			})),
			rejected: r
		};
	}
	if (!Array.isArray(t)) throw TypeError("wheels must be an array of wheel descriptions or 'auto'.");
	return {
		described: t.map((t, n) => de(e, t, n)),
		rejected: []
	};
}
function pe(e, t, n) {
	let r = z(t.entries.flatMap((t) => R(e, t))), i = r ? V(r, n) : null, a = t.spec.center ?? i?.center, o = t.spec.radius ?? i?.radius;
	if (!a || o === void 0) throw RangeError(`Wheel ${t.id} needs a radius and center, or geometry to measure them from.`);
	if (a.length !== 3 || !Array.from(a).every(Number.isFinite)) throw RangeError(`Wheel ${t.id} center must be three finite numbers.`);
	return N(o, `Wheel ${t.id} radius must be positive and finite.`), {
		...t,
		center: Array.from(a),
		radius: o
	};
}
function me(e, t, n) {
	let r = M();
	return r.set([
		...e,
		0,
		...S,
		0,
		...t,
		0,
		...n,
		1
	]), r;
}
function U(e) {
	return e.reduce((e, t) => e + t, 0) / e.length;
}
function he(e, t) {
	let n = h(f(), S, t), r = [
		0,
		1,
		2
	].map((t) => U(e.map((e) => e.center[t]))), i = me(n, t, m(f(), r, S, -U(e.map((e) => e.radius)))), a = s(M(), i);
	return {
		wheels: e.map((e, t) => {
			let n = y(f(), e.center, a), r = e.side ?? (Math.abs(n[0]) < 1e-4 ? "center" : n[0] > 0 ? "left" : "right"), i = e.axle ?? (n[2] >= 0 ? "front" : "rear");
			if (![
				"left",
				"right",
				"center"
			].includes(r)) throw RangeError(`Wheel ${e.id} side must be left, right or center.`);
			if (!["front", "rear"].includes(i)) throw RangeError(`Wheel ${e.id} axle must be front or rear.`);
			let o = e.spec.spinSign ?? 1;
			if (o !== 1 && o !== -1) throw RangeError(`Wheel ${e.id} spinSign must be 1 or -1.`);
			return {
				id: e.id || `wheel-${t}`,
				entries: e.entries,
				side: r,
				axle: i,
				radius: e.radius,
				steerable: e.spec.steerable ?? i === "front",
				spinSign: o,
				centerLocal: Array.from(n)
			};
		}),
		restFrame: i,
		inverseRestFrame: a
	};
}
function ge(e, t) {
	if (t !== void 0) return N(t, "wheelbase must be positive and finite."), t;
	let n = e.filter((e) => e.axle === "front"), r = e.filter((e) => e.axle === "rear");
	if (n.length && r.length) {
		let e = U(n.map((e) => e.centerLocal[2])) - U(r.map((e) => e.centerLocal[2]));
		if (e > 1e-6) return e;
	}
	if (e.some((e) => e.steerable)) throw RangeError("Cannot measure the wheelbase from the wheels. Pass wheelbase in metres or mark axles front and rear.");
	return 0;
}
function _e(e, t, n) {
	if (t !== void 0) {
		if (!Array.isArray(t) || t.length === 0) throw TypeError("body must be a non-empty array of parts or nodes.");
		return t.map((t) => L(e, t));
	}
	let r = new Set(n.flatMap((e) => e.entries.map((e) => e.key))), i = e.entries.filter((t) => !r.has(t.key) && !H(e, t, r) && (e.kind === "parts" || t.parentKey === null));
	if (i.length === 0) throw RangeError("No body parts remain after removing the wheels. Pass body explicitly.");
	return i;
}
function ve(e) {
	for (let t of e) if (t.pivot && t.pivot.some((e) => e !== 0)) throw RangeError(`Vehicle node ${t.label} has a nonzero pivot, which vehicle poses do not support.`);
}
function W(e, t, n) {
	let r = y(f(), v(f(), t, n), e), i = y(f(), t, e);
	return g(r, b(r, r, i));
}
function G(e, t) {
	if (!e || e.length !== 3 || !Array.from(e).every(Number.isFinite)) throw TypeError(t);
}
function ye(e, t = {}, n, r) {
	let i = (t.headlights ?? []).map((e, t) => {
		G(e.position, `Headlight ${t} needs a position of three finite numbers.`);
		let i = e.direction ?? r;
		G(i, `Headlight ${t} direction must be three finite numbers.`);
		let a = y(f(), e.position, n);
		return {
			id: e.id ?? `headlight-${t}`,
			positionLocal: Array.from(a),
			directionLocal: Array.from(W(n, e.position, i))
		};
	}), a = (t.tailLights ?? []).map((t, n) => {
		if (t.signal !== "brake" && t.signal !== "reverse") throw RangeError(`Tail light ${n} signal must be brake or reverse.`);
		let r = t.targets ?? t.parts ?? t.nodes ?? [t.target ?? t.part ?? t.node];
		if (!Array.isArray(r) || r.length === 0 || r.includes(void 0)) throw TypeError(`Tail light ${n} needs a part, node or targets list.`);
		let { off: i = 0, on: a = 4 } = t;
		if (!Number.isFinite(i) || !Number.isFinite(a) || i < 0 || a < 0) throw RangeError(`Tail light ${n} off and on must be zero or positive.`);
		let o = r.map((t) => L(e, t));
		return {
			id: t.id ?? o[0].label,
			signal: t.signal,
			entries: o,
			off: i,
			on: a
		};
	});
	return {
		headlights: Object.freeze(i),
		tailLights: Object.freeze(a)
	};
}
function be({ parts: e, graph: t, asset: n, body: r, wheels: i = "auto", forwardAxis: a = "+z", wheelbase: o, maxSteerAngle: s = C, lights: c } = {}) {
	let l = x[a];
	if (!l) throw RangeError("forwardAxis must be one of +x, -x, +z or -z.");
	N(s, "maxSteerAngle must be positive radians.");
	let u = le({
		parts: e,
		graph: t,
		asset: n
	}), { described: d, rejected: f } = fe(u, i, l);
	if (d.length < 2) throw RangeError(`A vehicle rig needs at least two wheels, found ${d.length}. Pass wheels explicitly or check findWheelCandidates.`);
	let p = he(d.map((e) => pe(u, e, l)), l), m = _e(u, r, p.wheels);
	ve([...m, ...p.wheels.flatMap((e) => e.entries)]);
	let h = ge(p.wheels, o), g = p.wheels.some((e) => e.axle === "front") ? p.wheels.filter((e) => e.axle === "front") : p.wheels, _ = g.map((e) => e.centerLocal[0]);
	return Object.freeze({
		kind: u.kind,
		source: u,
		forwardAxis: a,
		wheelbase: h,
		trackWidth: Math.max(..._) - Math.min(..._),
		rearAxleZ: U(g.map((e) => e.centerLocal[2])) - h,
		...ye(u, c, p.inverseRestFrame, l),
		maxSteerAngle: s,
		restFrame: p.restFrame,
		inverseRestFrame: p.inverseRestFrame,
		bodyEntries: m,
		wheels: Object.freeze(p.wheels),
		rejectedNames: f
	});
}
function xe(e, t) {
	if (!Array.isArray(e) && !ArrayBuffer.isView(e) || e.length !== 3 || !Array.from(e).every(Number.isFinite)) throw TypeError(`Path point ${t} must be three finite numbers.`);
}
function Se(e, t) {
	if (Array.isArray(e)) return e.map((e) => Array.from(e));
	if (e && typeof e.sample == "function" && Number.isFinite(e.duration) && e.duration > 0) {
		let n = [];
		for (let r = 0; r <= t; r++) n.push(Array.from(e.sample(e.duration * r / t).eye));
		return n;
	}
	throw TypeError("Path must be an array of [x, y, z] points or a camera path with duration and sample(time).");
}
function Ce(e) {
	return e.filter((t, n) => n === 0 || _(t, e[n - 1]) > 1e-6);
}
function we(e, t, n) {
	let r = (e, t, r, i) => {
		let a = i - r;
		return e.map((e, o) => (i - n) / a * e + (n - r) / a * t[o]);
	}, [i, a, o, s] = e, [c, l, u, d] = t, f = r(i, a, c, l), p = r(a, o, l, u), m = r(o, s, u, d);
	return r(r(f, p, c, u), r(p, m, l, d), l, u);
}
function Te(e) {
	if (e.length === 2) return e;
	let t = (e, t) => e.map((e, n) => 2 * e - t[n]), n = [
		t(e[0], e[1]),
		...e,
		t(e.at(-1), e.at(-2))
	], r = [e[0]];
	for (let e = 1; e < n.length - 2; e++) {
		let t = n.slice(e - 1, e + 3), i = [0];
		for (let e = 1; e < 4; e++) i.push(i[e - 1] + Math.sqrt(_(t[e - 1], t[e])));
		let a = P(Math.ceil(_(t[1], t[2]) / .05), 8, 2e3);
		for (let e = 1; e <= a; e++) r.push(we(t, i, i[1] + (i[2] - i[1]) * e / a));
	}
	return r;
}
function Ee(e) {
	let t = [0];
	for (let n = 1; n < e.length; n++) t.push(t[n - 1] + _(e[n - 1], e[n]));
	let n = t.at(-1);
	if (!(n > 1e-6)) throw RangeError("Path has zero length.");
	let r = Math.max(2, Math.ceil(n / Math.max(D, n / O))), i = n / r, a = [], o = 0;
	for (let n = 0; n <= r; n++) {
		let r = n * i;
		for (; o < e.length - 2 && t[o + 1] < r;) o++;
		let s = t[o + 1] - t[o], c = s > 0 ? P((r - t[o]) / s, 0, 1) : 0;
		a.push(e[o].map((t, n) => t + (e[o + 1][n] - t) * c));
	}
	return {
		positions: a,
		spacing: i,
		length: n
	};
}
function De(e, t) {
	return e.map((n, r) => {
		let i = Math.max(0, r - t), a = Math.min(e.length - 1, r + t), o = 0;
		for (let t = i; t <= a; t++) o += e[t];
		return o / (a - i + 1);
	});
}
function Oe(e, t) {
	let n = Se(e, t);
	n.forEach(xe);
	let r = Ce(n);
	if (r.length < 2) throw RangeError("Path needs at least two distinct points.");
	let { positions: i, spacing: a, length: o } = Ee(Te(r)), s = [], c = [];
	return i.forEach((e, t) => {
		let n = i[Math.max(0, t - 1)], r = i[Math.min(i.length - 1, t + 1)], a = Math.hypot(r[0] - n[0], r[2] - n[2]), o = a > 1e-9 ? Math.atan2(r[0] - n[0], r[2] - n[2]) : s.at(-1) ?? 0;
		t > 0 && (o += Math.round((s[t - 1] - o) / (2 * Math.PI)) * 2 * Math.PI), s.push(o), c.push(a > 1e-9 ? Math.atan2(r[1] - n[1], a) : 0);
	}), {
		positions: i,
		headings: s,
		slopes: c,
		curvature: De(s.map((e, t) => {
			let n = Math.max(0, t - 1), r = Math.min(s.length - 1, t + 1);
			return (s[r] - s[n]) / ((r - n) * a);
		}), 5),
		spacing: a,
		length: o
	};
}
function ke(e, t) {
	let { cruiseSpeed: n, acceleration: r, braking: i, startSpeed: a, endSpeed: o, maxLateralAcceleration: s } = t, c = e.positions.length, l = e.curvature.map((e) => {
		let t = s / Math.max(Math.abs(e), 1e-9);
		return Math.min(n ** 2, Math.max(t, k ** 2));
	}), u = Float64Array.from(l);
	u[0] = Math.min(a ** 2, l[0]);
	for (let t = 1; t < c; t++) u[t] = Math.min(u[t], u[t - 1] + 2 * r * e.spacing);
	u[c - 1] = Math.min(u[c - 1], o ** 2);
	for (let t = c - 2; t >= 0; t--) u[t] = Math.min(u[t], u[t + 1] + 2 * i * e.spacing);
	let d = u.map(Math.sqrt), f = new Float64Array(c);
	for (let t = 1; t < c; t++) {
		let n = (d[t - 1] + d[t]) / 2;
		if (n < 1e-9) throw RangeError("The speed profile never leaves rest. Raise acceleration or startSpeed.");
		f[t] = f[t - 1] + e.spacing / n;
	}
	return {
		speeds: d,
		times: f,
		duration: f[c - 1]
	};
}
function Ae(e, t) {
	let n = 0, r = e.length - 1;
	for (; r - n > 1;) {
		let i = n + r >> 1;
		e[i] <= t ? n = i : r = i;
	}
	return n;
}
function je(e, t) {
	let n = t.startTime;
	if (t.speed !== void 0) {
		let r = e.length / t.speed;
		return {
			duration: n + r,
			distanceAt: (r) => P((r - n) * t.speed, 0, e.length),
			speedAt: (e) => e > n && e < n + r ? t.speed : 0,
			accelerationAt: () => 0
		};
	}
	let r = ke(e, t), i = e.spacing;
	function a(e) {
		let t = Ae(r.times, e), n = r.speeds[t] ** 2, a = r.speeds[t + 1] ** 2;
		return {
			index: t,
			elapsed: e - r.times[t],
			acceleration: (a - n) / (2 * i)
		};
	}
	return {
		duration: n + r.duration,
		distanceAt(t) {
			let o = t - n;
			if (o <= 0) return 0;
			if (o >= r.duration) return e.length;
			let { index: s, elapsed: c, acceleration: l } = a(o);
			return s * i + r.speeds[s] * c + .5 * l * c ** 2;
		},
		speedAt(e) {
			let t = e - n;
			if (t <= 0 || t >= r.duration) return 0;
			let { index: i, elapsed: o, acceleration: s } = a(t);
			return Math.max(0, r.speeds[i] + s * o);
		},
		accelerationAt(e) {
			let t = e - n;
			return t <= 0 || t >= r.duration ? 0 : a(t).acceleration;
		}
	};
}
function K(e, t, n) {
	let r = P(n / t, 0, e.length - 1), i = Math.min(Math.floor(r), e.length - 2), a = r - i, o = e[i], s = e[i + 1];
	return Array.isArray(o) ? o.map((e, t) => e + (s[t] - e) * a) : o + (s - o) * a;
}
function Me(e, t) {
	let n = Math.ceil((e.duration + E) / T) + 1, r = new Float64Array(n), i = new Float64Array(n), a = 2 * Math.PI * t.bounceFrequency, o = 2 * t.dampingRatio * a, s = 0, c = 0, l = 0, u = 0;
	for (let d = 0; d < n; d++) {
		let n = d * T, f = e.signedSpeedAt(n), p = (e.signedSpeedAt(n + T) - e.signedSpeedAt(n - T)) / (2 * T), m = e.curvatureAt(n), h = P(t.pitchGain * p, -.35, w), g = P(t.rollGain * f * f * m, -.35, w);
		l += (a ** 2 * (h - s) - o * l) * T, u += (a ** 2 * (g - c) - o * u) * T, s += l * T, c += u * T, r[d] = s, i[d] = c;
	}
	return {
		pitches: r,
		rolls: i
	};
}
function Ne(e, t, n, r) {
	let i = Math.cos(n), a = Math.sin(n), o = e.wheels.map((e) => {
		let [n, , o] = e.centerLocal;
		return {
			left: n,
			forward: o,
			height: q(r, t[0] + n * i + o * a, t[2] - n * a + o * i)
		};
	}), s = U(o.map((e) => e.left)), c = U(o.map((e) => e.forward)), l = U(o.map((e) => e.height)), u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let e of o) {
		let t = e.left - s, n = e.forward - c, r = e.height - l;
		u += t * t, d += n * n, f += t * n, p += t * r, m += n * r;
	}
	let h = u * d - f ** 2, g = h > 1e-9 * Math.max(1, u * d), _ = g ? (p * d - m * f) / h : 0, v = g ? (m * u - p * f) / h : 0;
	return {
		height: l - _ * s - v * c,
		pitch: Math.atan(v),
		roll: Math.atan(_)
	};
}
function q(e, t, n) {
	let r = e(t, n);
	if (!Number.isFinite(r)) throw TypeError("groundHeight must return a finite number.");
	return r;
}
function J(e, n, r, i) {
	let a = c(M(), e);
	return d(a, a, n), u(a, a, -r), t(a, a, i), a;
}
function Pe(e, t, n, r) {
	let i = f(), a = Math.max(.5, t[5]);
	return e.wheels.map((e) => n ? (y(i, e.centerLocal, t), P((q(n, i[0], i[2]) + e.radius - i[1]) / a, -r, r)) : 0);
}
function Fe(e, t, n = {}) {
	return Y(e, [{ path: t }], n);
}
function Ie(e, t) {
	let n = [];
	return e.forEach((r, i) => {
		let { path: a, direction: o = "forward", pause: s = 0 } = r ?? {};
		if (o !== "forward" && o !== "reverse") throw RangeError(`Leg ${i} direction must be forward or reverse.`);
		if (!Number.isFinite(s) || s < 0) throw RangeError(`Leg ${i} pause must be zero or positive seconds.`);
		let c = n.at(-1), l = o === "reverse" ? -1 : 1, u = c ? c.endTime + s : t.startTime, d = Oe(a, t.pathSamples), f = je(d, {
			...t,
			startTime: u,
			startSpeed: c ? 0 : t.startSpeed,
			endSpeed: i === e.length - 1 ? t.endSpeed : 0
		}), p = o === "reverse" ? Math.PI : 0;
		if (c) {
			let e = c.headingShift + c.table.headings.at(-1);
			p += Math.round((e - d.headings[0] - p) / (2 * Math.PI)) * 2 * Math.PI;
		}
		n.push({
			table: d,
			motion: f,
			sign: l,
			startTime: u,
			endTime: f.duration,
			headingShift: p,
			startForwardDistance: c ? c.startForwardDistance + c.sign * c.table.length : 0,
			startHeadingChange: c ? c.startHeadingChange + c.table.headings.at(-1) - c.table.headings[0] : 0
		});
	}), n;
}
function Y(e, t, n = {}) {
	if (!e || !e.wheels || !e.restFrame) throw TypeError("driveAlongPath needs a rig from createVehicleRig.");
	if (!Array.isArray(t) || t.length === 0) throw TypeError("legs must be a non-empty array of { path, direction, pause }.");
	let r = Le(e, n), i = Ie(t, r), a = i.at(-1).endTime, o = i.reduce((e, t) => e + t.table.length, 0), s = (e) => i.findLast((t) => t.startTime <= e) ?? i[0], c = Me({
		duration: a,
		signedSpeedAt(e) {
			let t = s(e);
			return t.sign * t.motion.speedAt(e);
		},
		curvatureAt(e) {
			let t = s(e);
			return t.sign * K(t.table.curvature, t.table.spacing, t.motion.distanceAt(e));
		}
	}, r), l = r.maxSteerAngle;
	function u(t) {
		if (!Number.isFinite(t)) throw RangeError("Sample time must be finite.");
		let n = s(t), { table: i, motion: a, sign: o } = n, u = a.distanceAt(t), d = n.startForwardDistance + o * u, f = K(i.headings, i.spacing, u), p = f + n.headingShift, m = o * K(i.curvature, i.spacing, u), h = n.startHeadingChange + f - i.headings[0], g = P(t, 0, (c.pitches.length - 1) * T) / T, _ = Math.min(Math.floor(g), c.pitches.length - 2), v = g - _, y = c.pitches[_] + (c.pitches[_ + 1] - c.pitches[_]) * v, b = c.rolls[_] + (c.rolls[_ + 1] - c.rolls[_]) * v, x = K(i.positions, i.spacing, u), S = o * K(i.slopes, i.spacing, u), C = 0;
		if (r.groundHeight) {
			let t = Ne(e, x, p, r.groundHeight);
			x[1] = t.height, S = t.pitch, C = t.roll;
		}
		let w = S + y, E = C + b, D = J(x, p, w, E), O = Pe(e, D, r.groundHeight, r.suspensionTravel), k = P(Math.atan(e.wheelbase * m), -l, l), A = r.steering === "ackermann" ? Re(e, k) : null, j = o * a.speedAt(t);
		return {
			time: t,
			distance: d,
			speed: j,
			direction: o,
			position: x,
			heading: p,
			pitch: w,
			roll: E,
			steerAngle: k,
			wheels: e.wheels.map((e, t) => ({
				id: e.id,
				spinAngle: e.spinSign * (d - e.centerLocal[0] * h) / e.radius,
				steerAngle: A ? A[t] : e.steerable ? k : 0,
				suspensionOffset: O[t]
			})),
			lights: ze(e, D, {
				braking: Math.max(0, -a.accelerationAt(t)) / r.fullBrakeDeceleration,
				reversing: o < 0 && j !== 0
			})
		};
	}
	return Object.freeze({
		rig: e,
		length: o,
		duration: a,
		sample: u
	});
}
function Le(e, t) {
	let { speed: n, cruiseSpeed: r, acceleration: i = 3, braking: a = 4, startSpeed: o = 0, endSpeed: s = 0, maxLateralAcceleration: c = Infinity, startTime: l = 0, groundHeight: u, maxSteerAngle: d = e.maxSteerAngle, rollGain: f = .012, pitchGain: p = .012, bounceFrequency: m = 1.6, dampingRatio: h = .45, suspensionTravel: g = .2, pathSamples: _ = 400, steering: v = "ackermann", fullBrakeDeceleration: y = a } = t;
	if (v !== "ackermann" && v !== "shared") throw RangeError("steering must be 'ackermann' or 'shared'.");
	if (N(y, "fullBrakeDeceleration must be positive and finite."), n === void 0 == (r === void 0)) throw TypeError("Give exactly one of speed (constant) or cruiseSpeed (with acceleration and braking).");
	if (n !== void 0 && N(n, "speed must be positive and finite."), r !== void 0 && (N(r, "cruiseSpeed must be positive and finite."), N(i, "acceleration must be positive and finite."), N(a, "braking must be positive and finite.")), !Number.isFinite(l) || l < 0) throw RangeError("startTime must be zero or positive.");
	if (u !== void 0 && typeof u != "function") throw TypeError("groundHeight must be a function (x, z) => height.");
	if (N(d, "maxSteerAngle must be positive radians."), N(m, "bounceFrequency must be positive."), N(h, "dampingRatio must be positive."), !Number.isFinite(o) || o < 0 || !Number.isFinite(s) || s < 0) throw RangeError("startSpeed and endSpeed must be zero or positive.");
	if (!(c > 0)) throw RangeError("maxLateralAcceleration must be positive.");
	if (!Number.isInteger(_) || _ < 8) throw RangeError("pathSamples must be an integer of at least 8.");
	return {
		speed: n,
		cruiseSpeed: r,
		acceleration: i,
		braking: a,
		startSpeed: o,
		endSpeed: s,
		maxLateralAcceleration: c,
		startTime: l,
		groundHeight: u,
		maxSteerAngle: d,
		rollGain: f,
		pitchGain: p,
		bounceFrequency: m,
		dampingRatio: h,
		suspensionTravel: g,
		pathSamples: _,
		steering: v,
		fullBrakeDeceleration: y
	};
}
function Re(e, t) {
	let n = Math.tan(t);
	return e.wheels.map((t) => {
		if (!t.steerable) return 0;
		let r = t.centerLocal[2] - e.rearAxleZ;
		return Math.atan2(r * n, e.wheelbase - t.centerLocal[0] * n);
	});
}
function ze(e, t, { braking: n, reversing: r }) {
	return {
		brake: P(n, 0, 1),
		reverse: +!!r,
		headlights: e.headlights.map((e) => ({
			id: e.id,
			position: Array.from(y(f(), e.positionLocal, t)),
			direction: Array.from(W(t, e.positionLocal, e.directionLocal))
		}))
	};
}
function X(e, t) {
	if (!t || !t.lights) throw TypeError("pose must come from drive.sample for this rig.");
	return e.tailLights.map((e) => ({
		id: e.id,
		emission: e.off + (e.on - e.off) * t.lights[e.signal],
		entries: e.entries
	}));
}
function Be(e, t) {
	Q(e, "parts");
	let n = [];
	for (let { id: r, emission: i, entries: a } of X(e, t)) for (let { key: e } of a) {
		if (!e.material) throw TypeError(`Tail light ${r} part needs a material to set emission on.`);
		e.material.emission = i, n.push(e);
	}
	return n;
}
function Ve(t, n) {
	let r = c(M(), [
		0,
		n.suspensionOffset,
		0
	]);
	return e(r, r, t.centerLocal), d(r, r, n.steerAngle), u(r, r, n.spinAngle), e(r, r, t.centerLocal.map((e) => -e)), r;
}
function Z(e, t) {
	if (!t || !Array.isArray(t.wheels) || t.wheels.length !== e.wheels.length) throw TypeError("pose must come from drive.sample for this rig.");
	let n = J(t.position, t.heading, t.pitch, t.roll), r = i(M(), n, e.inverseRestFrame), a = /* @__PURE__ */ new Map();
	for (let t of e.bodyEntries) a.set(t.key, i(M(), r, t.restWorld));
	return e.wheels.forEach((r, o) => {
		let s = i(M(), n, Ve(r, t.wheels[o]));
		i(s, s, e.inverseRestFrame);
		for (let e of r.entries) a.set(e.key, i(M(), s, e.restWorld));
	}), a;
}
function Q(e, t) {
	if (e.kind !== t) throw TypeError(`This rig was built from ${e.kind}, not ${t}.`);
}
function He(e, t) {
	Q(e, "parts");
	let n = Z(e, t), r = [];
	for (let [e, t] of n) e.matrix.set(t), r.push(e);
	return r;
}
function Ue(e, t) {
	let { byKey: n } = e.source, r = /* @__PURE__ */ new Map();
	function a(e) {
		if (t.has(e)) return t.get(e);
		if (r.has(e)) return r.get(e);
		let o = n.get(e), c = o.restWorld;
		if (o.parentKey !== null && n.has(o.parentKey)) {
			let e = n.get(o.parentKey).restWorld, t = i(M(), s(M(), e), o.restWorld);
			c = i(M(), a(o.parentKey), t);
		}
		return r.set(e, c), c;
	}
	return function(e, t) {
		if (e.parentKey === null || !n.has(e.parentKey)) return Float64Array.from(t);
		let r = s(M(), a(e.parentKey));
		return i(M(), r, t);
	};
}
function We(e, t, n) {
	Q(e, "graph");
	let r = Z(e, t), i = Ue(e, r);
	for (let [t, a] of r) n.getNode(t).localMatrix.set(i(e.source.byKey.get(t), a));
	return n.update();
}
function $(e, t) {
	Q(e, "asset");
	let r = Z(e, t), i = Ue(e, r), o = [];
	for (let [t, s] of r) {
		let r = e.source.byKey.get(t);
		if (r.editable === !1) throw RangeError(`Imported node ${r.label} has an authored pose that cannot be overridden.`);
		let c = i(r, s);
		o.push({
			id: t,
			translation: Array.from(n(f(), c)),
			rotation: Array.from(a(/* @__PURE__ */ new Float64Array(4), c)),
			scale: Array.from(l(f(), c))
		});
	}
	return o;
}
function Ge(e, t, n) {
	return n.stagePose({ nodeOverrides: $(e, t) }).commit();
}
export { Be as applyVehicleLightsToParts, Ge as applyVehiclePoseToAsset, He as applyVehiclePoseToParts, We as applyVehiclePoseToSceneGraph, X as computeVehicleLightEmissions, $ as createVehicleNodeOverrides, be as createVehicleRig, Y as driveAlongLegs, Fe as driveAlongPath, F as findWheelCandidates };
