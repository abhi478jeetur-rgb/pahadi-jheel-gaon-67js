/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, o as t, r as n } from "./mat4-BCZClxna.js";
import { n as r, s as i, t as a } from "./quat-Bl7gjwWK.js";
import { S as o, c as s, d as c, h as l, s as u, t as d, y as f } from "./vec3-BRYC6f_g.js";
// src/physics.js
var p, m, h = () => import("@dimforge/rapier3d-compat"), g = [
	0,
	0,
	0
], _ = [
	0,
	0,
	0,
	1
], v = 2 ** -126, y = 1e6, b = 1e4, x = 1e6, S = 1e8, C = Math.fround(Math.PI), w = {
	maxBodies: [256, 4096],
	maxColliders: [1024, 8192],
	maxJoints: [512, 8192],
	maxEvents: [1e4, 1e5],
	maxFrames: [3601, 1e6],
	maxColliderTriangles: [2e4, 2e5],
	maxHullPoints: [2048, 16384],
	maxContactEvents: [4096, 1e5]
}, T = .02, E = .05, D = 65535;
function O(e) {
	h = e, p = void 0, m = void 0;
}
function k() {
	return p ??= h().then(async (e) => {
		let t = e.default ?? e;
		return await t.init(), m = t, t;
	}, (e) => {
		throw p = void 0, e;
	}), p;
}
function A() {
	return m !== void 0;
}
function j(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${n} must be an object`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`${n}.${r} is unsupported`);
}
function M(e, t, n = -Infinity, r = Infinity) {
	let i = Math.fround(e);
	if (typeof e != "number" || !Number.isFinite(e) || !Number.isFinite(i) || e < n || e > r || i < n || i > r) throw RangeError(`${t} must be finite Float32 in [${n}, ${r}]`);
	return i;
}
function N(e, t) {
	let n = M(e, t, 0);
	if (n === 0) throw RangeError(`${t} must remain positive in Float32`);
	return n;
}
function P(e, t) {
	let n = M(e, t, v);
	return N(1 / n, `${t} reciprocal`), n;
}
function F(e, t) {
	let n = e[0] ** 2 + e[1] ** 2 + e[2] ** 2;
	return M(n, `${t} squared norm`, 0), Math.sqrt(n);
}
function I(e, t, n, r) {
	if (e ??= r, !e || e.length !== t) throw TypeError(`${n} must contain ${t} numbers`);
	return Array.from(e, (e, t) => M(e, `${n}[${t}]`));
}
function L(e, t) {
	let n = I(e, 4, t, _), r = Math.hypot(...n);
	if (!r || Math.abs(r - 1) > 1e-4) throw RangeError(`${t} must be a unit quaternion`);
	let i = n[3] === 0 && n.find((e) => e !== 0) < 0 ? -1 : 1;
	return n.map((e) => e === 0 ? 0 : Math.fround(i * e / r));
}
function R(e, t, n, r) {
	if (!Number.isSafeInteger(e) || e < n || e > r) throw RangeError(`${t} must be an integer in [${n}, ${r}]`);
	return e;
}
function z(e, t, n) {
	if (!Array.isArray(e) || e.length > n) throw RangeError(`${t} must be an array with at most ${n} entries`);
	let r = /* @__PURE__ */ new Set();
	for (let n of e) {
		if (typeof n?.name != "string" || !n.name.length || r.has(n.name)) throw TypeError(`${t} names must be nonempty and unique`);
		r.add(n.name);
	}
	return e;
}
function B(e, t) {
	let n = I(e, 2, "joint limits"), r = t === "revolute" ? C : y;
	for (let e of n) M(e, "joint limit", -r, r);
	if (n[0] >= n[1]) throw RangeError("joint limits must remain strictly increasing in Float32");
	return n;
}
function V(e, t) {
	if (e === null) return null;
	if (j(e, [
		"mode",
		"target",
		"stiffness",
		"damping",
		"maxForce"
	], "motor"), !["position", "velocity"].includes(e.mode)) throw TypeError("motor mode must be position or velocity");
	if (e.mode === "velocity" && e.stiffness !== void 0) throw TypeError("velocity motors do not accept stiffness");
	let n = e.mode === "velocity" ? b : t.type === "revolute" ? C : y, r = M(e.target, "motor target", -n, n);
	if (e.target !== 0 && r === 0) throw RangeError("motor target must not collapse to zero in Float32");
	if (e.mode === "position" && t.limits && (r < t.limits[0] || r > t.limits[1])) throw RangeError("motor position target must stay within joint limits");
	let i = e.mode === "position" ? N(e.stiffness, "motor stiffness") : 0;
	if (i > x) throw RangeError("motor stiffness exceeds the supported gain bound");
	let a = M(e.damping, "motor damping", 0, x);
	if (e.damping !== 0 && a === 0) throw RangeError("motor damping must not collapse to zero in Float32");
	if (e.mode === "velocity" && a === 0) throw RangeError("velocity motor damping must remain positive in Float32");
	let o = P(e.maxForce, "motor maxForce");
	if (o > S) throw RangeError("motor maxForce exceeds the supported force bound");
	return {
		mode: e.mode,
		target: r,
		stiffness: i,
		damping: a,
		maxForce: o
	};
}
function H(e, t) {
	let n = t[e.bodyA], r = t[e.bodyB], p = o(/* @__PURE__ */ new Float64Array(3), e.axis, n.rotation), m = o(/* @__PURE__ */ new Float64Array(3), e.axis, r.rotation);
	if (u(p, m) > 1e-4) throw RangeError("controlled joint axes must initially align in world space");
	let h = o(/* @__PURE__ */ new Float64Array(3), e.anchorA, n.rotation), g = o(/* @__PURE__ */ new Float64Array(3), e.anchorB, r.rotation);
	d(h, h, n.translation), d(g, g, r.translation);
	let _ = f(/* @__PURE__ */ new Float64Array(3), g, h), v = i(/* @__PURE__ */ new Float64Array(4), a(/* @__PURE__ */ new Float64Array(4), n.rotation), r.rotation), b;
	if (e.type === "prismatic") {
		if (b = s(_, p), l(_, _, p, -b), c(_) > 1e-4 || Math.abs(v[3]) < .9999) throw RangeError("prismatic joint anchors must initially align along its axis with matching body orientations");
	} else {
		if (c(_) > 1e-4) throw RangeError("controlled revolute joint anchors must initially coincide");
		b = 2 * Math.atan2(v[0] * e.axis[0] + v[1] * e.axis[1] + v[2] * e.axis[2], v[3]), b > Math.PI && (b -= 2 * Math.PI), b < -Math.PI && (b += 2 * Math.PI), Math.abs(b) === Math.PI && (b = e.limits && e.limits[1] < Math.PI ? -Math.PI : Math.PI);
	}
	if (b = M(b, "initial joint coordinate", e.type === "revolute" ? -C : -1e6, e.type === "revolute" ? C : y), e.limits && (b < e.limits[0] || b > e.limits[1])) throw RangeError("initial joint coordinate must stay within joint limits");
}
function U(e, t, n) {
	if (!Array.isArray(e) && !ArrayBuffer.isView(e)) throw TypeError(`${t} must be an array of numbers`);
	if (e.length > n) throw RangeError(`${t} has ${e.length} numbers; the limit is ${n}`);
	return Float32Array.from(e, (e, n) => M(e, `${t}[${n}]`));
}
function W(e, t) {
	if (e.vertices !== void 0 || e.indices !== void 0 || e.radius !== void 0 || e.halfHeight !== void 0 || e.halfExtents !== void 0) throw TypeError("convexHull only accepts points");
	if (!e.points || e.points.length % 3 != 0 || e.points.length < 12) throw TypeError("convexHull points must hold at least four xyz points");
	let n = U(e.points, "points", t.maxHullPoints * 3), r = [
		Infinity,
		Infinity,
		Infinity
	], i = [
		-Infinity,
		-Infinity,
		-Infinity
	], a = 0;
	for (let e = 0; e < n.length; e += 3) {
		for (let t = 0; t < 3; t++) r[t] = Math.min(r[t], n[e + t]), i[t] = Math.max(i[t], n[e + t]);
		a = Math.max(a, Math.hypot(n[e], n[e + 1], n[e + 2]));
	}
	let o = i.map((e, t) => e - r[t]);
	return {
		shape: "convexHull",
		points: n,
		volume: o[0] * o[1] * o[2],
		smallestExtent: Math.min(...o) / 2,
		largestExtent: a
	};
}
function G(e, t, n, r) {
	if (t.type === "dynamic") throw TypeError("trimesh colliders need a fixed or kinematic body; use convexHull for a dynamic body");
	if (e.points !== void 0 || e.radius !== void 0 || e.halfHeight !== void 0 || e.halfExtents !== void 0) throw TypeError("trimesh only accepts vertices and indices");
	if (!e.vertices || e.vertices.length % 3 != 0 || !e.indices || e.indices.length % 3 != 0 || !e.indices.length) throw TypeError("trimesh needs xyz vertices and triangle indices");
	if (r.triangles += e.indices.length / 3, r.triangles > n.maxColliderTriangles) throw RangeError(`trimesh colliders hold ${r.triangles} triangles; maxColliderTriangles is ${n.maxColliderTriangles}`);
	let i = U(e.vertices, "vertices", n.maxColliderTriangles * 3 * 3), a = i.length / 3;
	return {
		shape: "trimesh",
		vertices: i,
		indices: Uint32Array.from(e.indices, (e, t) => R(e, `indices[${t}]`, 0, a - 1))
	};
}
function K(e, t, n, r) {
	if (e.shape === "convexHull") return W(e, n);
	if (e.shape === "trimesh") return G(e, t, n, r);
	if (e.points !== void 0 || e.vertices !== void 0 || e.indices !== void 0) throw TypeError(`${e.shape} does not accept points, vertices or indices`);
	return null;
}
function q(e, t) {
	j(e, [
		"bodies",
		"colliders",
		"joints",
		"events",
		"gravity"
	], "definition"), j(t, [
		"frameCount",
		"timestep",
		"solverIterations",
		"maxMemoryBytes",
		...Object.keys(w)
	], "options");
	let n = {};
	for (let [e, [r, i]] of Object.entries(w)) n[e] = R(t[e] ?? r, e, 1, i);
	let r = R(t.frameCount ?? 601, "frameCount", 1, n.maxFrames), i = N(t.timestep ?? 1 / 60, "timestep");
	if (N(1 / i, "timestep reciprocal"), i > 1) throw RangeError("timestep must be at most one second");
	let a = R(t.solverIterations ?? 8, "solverIterations", 1, 128), o = R(t.maxMemoryBytes ?? 134217728, "maxMemoryBytes", 1, 2 ** 31 - 1), s = z(e.bodies, "bodies", n.maxBodies);
	if (!s.length) throw RangeError("bodies must not be empty");
	let c = z(e.colliders ?? [], "colliders", n.maxColliders), l = z(e.joints ?? [], "joints", n.maxJoints), u = e.events ?? [];
	if (!Array.isArray(u) || u.length > n.maxEvents) throw RangeError("events exceed maxEvents");
	let d = s.length * r * 7 * Float32Array.BYTES_PER_ELEMENT, f = 1048576 + s.length * 16384 + c.length * 16384 + l.length * 8192 + c.length ** 2 * 128, p = d + f;
	if (!Number.isSafeInteger(p) || p > o) throw RangeError(`physics memory plan ${p} exceeds maxMemoryBytes ${o}`);
	let m = s.map((e) => {
		j(e, [
			"name",
			"type",
			"translation",
			"rotation",
			"linearVelocity",
			"angularVelocity",
			"linearDamping",
			"angularDamping",
			"ccd"
		], `body ${e.name}`);
		let t = e.type ?? "dynamic";
		if (![
			"dynamic",
			"fixed",
			"kinematic"
		].includes(t)) throw TypeError(`body ${e.name} has unsupported type`);
		if (t !== "dynamic" && (e.linearVelocity || e.angularVelocity || e.linearDamping !== void 0 || e.angularDamping !== void 0 || e.ccd !== void 0)) throw TypeError(`body ${e.name} only supports velocity, damping, and CCD when dynamic`);
		if (e.ccd !== void 0 && typeof e.ccd != "boolean") throw TypeError("ccd must be boolean");
		return {
			name: e.name,
			type: t,
			translation: I(e.translation, 3, "translation", g),
			rotation: L(e.rotation, "rotation"),
			linearVelocity: I(e.linearVelocity, 3, "linearVelocity", g),
			angularVelocity: I(e.angularVelocity, 3, "angularVelocity", g),
			linearDamping: M(e.linearDamping ?? 0, "linearDamping", 0),
			angularDamping: M(e.angularDamping ?? 0, "angularDamping", 0),
			ccd: e.ccd ?? !1
		};
	}), h = new Map(m.map((e, t) => [e.name, t]));
	function _(e) {
		if (!h.has(e)) throw TypeError(`unknown body ${e}`);
		return h.get(e);
	}
	let v = { triangles: 0 }, y = c.map((e) => {
		j(e, [
			"name",
			"body",
			"shape",
			"radius",
			"halfHeight",
			"halfExtents",
			"points",
			"vertices",
			"indices",
			"translation",
			"rotation",
			"mass",
			"density",
			"friction",
			"restitution",
			"sensor",
			"groups",
			"mask"
		], `collider ${e.name}`);
		let t = _(e.body), r = K(e, m[t], n, v);
		if (e.sensor !== void 0 && typeof e.sensor != "boolean") throw TypeError("sensor must be boolean");
		let i = {
			body: t,
			translation: I(e.translation, 3, "collider translation", g),
			rotation: L(e.rotation, "collider rotation"),
			friction: M(e.friction ?? .5, "friction", 0),
			restitution: M(e.restitution ?? 0, "restitution", 0, 1),
			sensor: e.sensor ?? !1,
			groups: R(e.groups ?? D, "groups", 0, D),
			mask: R(e.mask ?? D, "mask", 0, D)
		};
		if (r?.shape === "trimesh") return {
			...i,
			...r,
			effectiveMass: 0,
			minimumInertia: 0,
			largestExtent: 0
		};
		let a, o, s, c, l;
		if (e.shape === "ball") {
			if (e.halfHeight !== void 0 || e.halfExtents !== void 0) throw TypeError("ball only accepts radius");
			a = N(e.radius, "radius"), c = 4 * Math.PI * a ** 3 / 3, l = a;
		} else if (e.shape === "cuboid") {
			if (e.radius !== void 0 || e.halfHeight !== void 0) throw TypeError("cuboid only accepts halfExtents");
			s = I(e.halfExtents, 3, "halfExtents");
			for (let e of s) N(e, "halfExtents");
			c = 8 * s[0] * s[1] * s[2], l = Math.min(...s);
		} else if (e.shape === "capsule") {
			if (e.halfExtents !== void 0) throw TypeError("capsule only accepts radius and halfHeight");
			a = N(e.radius, "radius"), o = N(e.halfHeight, "halfHeight"), c = Math.PI * a ** 2 * 2 * o + 4 * Math.PI * a ** 3 / 3, l = a;
		} else if (r) c = r.volume, l = r.smallestExtent;
		else throw TypeError(`unsupported collider shape ${e.shape}`);
		if (N(c, "collider volume"), e.mass !== void 0 && e.density !== void 0) throw TypeError("collider accepts either mass or density");
		let u = e.mass === void 0 ? void 0 : N(e.mass, "mass"), d = u === void 0 ? N(e.density ?? 1, "density") : void 0, f = P(u ?? c * d, "collider effective mass");
		u !== void 0 && N(u / c, "collider effective density");
		let p = P(.1 * f * l ** 2, "collider minimum inertia scale"), h = r ? r.largestExtent : s ? Math.max(...s) : a + (o ?? 0);
		return N(f * h ** 2, "collider maximum inertia scale"), {
			...i,
			shape: e.shape,
			radius: a,
			halfHeight: o,
			halfExtents: s,
			points: r?.points,
			mass: u,
			density: d,
			effectiveMass: f,
			minimumInertia: p,
			largestExtent: h
		};
	}), b = Array(m.length).fill(0), x = Array(m.length).fill(0), S = Array(m.length).fill(0), C = Array(m.length).fill(0);
	for (let e of y) {
		if (e.shape === "trimesh") continue;
		let t = e.body;
		b[t] = P(b[t] + e.effectiveMass, "compound body mass"), x[t] = N(x[t] + e.effectiveMass * (e.largestExtent ** 2 + Math.hypot(...e.translation) ** 2), "compound body inertia scale"), S[t] = P(S[t] + e.minimumInertia, "compound body minimum inertia"), C[t] = Math.max(C[t], Math.hypot(...e.translation));
		for (let t of e.translation) M(e.effectiveMass * t, "collider weighted center");
	}
	for (let e = 0; e < m.length; e++) if (m[e].type === "dynamic" && b[e] === 0) throw TypeError(`dynamic body ${m[e].name} requires a collider with mass`);
	let T = l.map((e) => {
		if (j(e, [
			"name",
			"type",
			"bodyA",
			"bodyB",
			"anchorA",
			"anchorB",
			"axis",
			"frameA",
			"frameB",
			"contactsEnabled",
			"limits",
			"motor"
		], `joint ${e.name}`), ![
			"spherical",
			"revolute",
			"prismatic",
			"fixed"
		].includes(e.type)) throw TypeError("unsupported joint type");
		let t = _(e.bodyA), n = _(e.bodyB);
		if (t === n) throw TypeError("joint bodies must differ");
		if (e.contactsEnabled !== void 0 && typeof e.contactsEnabled != "boolean") throw TypeError("contactsEnabled must be boolean");
		let r = e.type === "revolute" || e.type === "prismatic";
		if (!r && e.axis !== void 0) throw TypeError("axis requires a revolute or prismatic joint");
		if (!r && (e.limits !== void 0 || e.motor !== void 0)) throw TypeError("limits and motors require a revolute or prismatic joint");
		if (e.type !== "fixed" && (e.frameA !== void 0 || e.frameB !== void 0)) throw TypeError("joint frames require a fixed joint");
		let i = r ? I(e.axis, 3, "axis") : void 0;
		if (i && Math.abs(Math.hypot(...i) - 1) > 1e-4) throw RangeError("axis must be a unit vector");
		if (i) {
			let e = Math.hypot(...i);
			for (let t = 0; t < 3; t++) i[t] = Math.fround(i[t] / e);
		}
		let a = {
			type: e.type,
			bodyA: t,
			bodyB: n,
			anchorA: I(e.anchorA, 3, "anchorA", g),
			anchorB: I(e.anchorB, 3, "anchorB", g),
			axis: i,
			frameA: L(e.frameA, "frameA"),
			frameB: L(e.frameB, "frameB"),
			contactsEnabled: e.contactsEnabled ?? !1
		};
		return e.limits !== void 0 && (a.limits = B(e.limits, e.type)), e.motor !== void 0 && (a.motor = V(e.motor, a)), (e.type === "prismatic" || e.limits !== void 0 || e.motor !== void 0) && H(a, m), a;
	}), E = new Map(l.map((e, t) => [e.name, t])), O = u.map((e, t) => {
		let n = R(e.tick, "event tick", 0, r - 2), i = e.type ?? "impulse";
		if (i === "jointMotor") {
			if (j(e, [
				"tick",
				"type",
				"joint",
				"motor"
			], `event ${t}`), !E.has(e.joint)) throw TypeError(`unknown joint ${e.joint}`);
			let r = E.get(e.joint);
			if (!["revolute", "prismatic"].includes(T[r].type)) throw TypeError("motor events require a revolute or prismatic joint");
			return H(T[r], m), {
				tick: n,
				type: i,
				order: t,
				joint: r,
				motor: V(e.motor, T[r])
			};
		}
		j(e, [
			"tick",
			"body",
			"type",
			"impulse",
			"torqueImpulse",
			"point",
			"translation",
			"rotation"
		], `event ${t}`);
		let a = _(e.body);
		if (i === "impulse") {
			if (m[a].type !== "dynamic") throw TypeError("impulses require a dynamic body");
			if (e.translation !== void 0 || e.rotation !== void 0 || e.impulse === void 0 && e.torqueImpulse === void 0 || e.point !== void 0 && e.impulse === void 0) throw TypeError("invalid impulse event fields");
			return {
				tick: n,
				body: a,
				type: i,
				order: t,
				impulse: e.impulse === void 0 ? void 0 : I(e.impulse, 3, "impulse"),
				torqueImpulse: e.torqueImpulse === void 0 ? void 0 : I(e.torqueImpulse, 3, "torqueImpulse"),
				point: e.point === void 0 ? void 0 : I(e.point, 3, "point")
			};
		}
		if (i !== "kinematicPose" || m[a].type !== "kinematic") throw TypeError("kinematicPose events require a kinematic body");
		if (e.impulse !== void 0 || e.torqueImpulse !== void 0 || e.point !== void 0 || e.translation === void 0 && e.rotation === void 0) throw TypeError("invalid kinematicPose event fields");
		return {
			tick: n,
			body: a,
			type: i,
			order: t,
			translation: e.translation === void 0 ? void 0 : I(e.translation, 3, "event translation"),
			rotation: e.rotation === void 0 ? void 0 : L(e.rotation, "event rotation")
		};
	}).sort((e, t) => e.tick - t.tick || e.order - t.order), k = I(e.gravity, 3, "gravity", [
		0,
		-9.81,
		0
	]);
	Y(m, O, k, i, r, b, S, C, T, x);
	let A = Object.freeze({
		timelineBytes: d,
		solverReserveBytes: f,
		estimatedPeakBytes: p,
		maxMemoryBytes: o,
		bodyCount: m.length,
		colliderCount: y.length,
		jointCount: T.length,
		eventCount: O.length,
		frameCount: r
	});
	return {
		bodies: m,
		colliders: y,
		joints: T,
		events: O,
		gravity: k,
		frameCount: r,
		timestep: i,
		solverIterations: a,
		maxContactEvents: n.maxContactEvents,
		memoryPlan: A
	};
}
function J(e, t, n, r, i, a, o, s, c, l, u) {
	let d = e.map((e, t) => t);
	function f(e) {
		for (; d[e] !== e;) e = d[e];
		return e;
	}
	for (let e of t) d[f(e.bodyB)] = f(e.bodyA);
	let p = t.map(() => 0);
	function m(n, i) {
		if (!i) return;
		let a = t[n];
		if (e[a.bodyA].type !== "dynamic" && e[a.bodyB].type !== "dynamic") throw TypeError("active motors need at least one directly attached dynamic body");
		if (P(i.maxForce ** 2, "motor force squared norm"), P((i.maxForce * r) ** 2, "motor step impulse squared norm"), i.stiffness && P((i.stiffness * r ** 2) ** 2, "motor timestep stiffness squared"), i.damping && P((i.damping * r) ** 2, "motor timestep damping squared"), i.target !== 0) {
			P(i.target ** 2, "motor target squared norm");
			let e = i.mode === "position" ? i.stiffness : i.damping;
			P((Math.min(Math.abs(e * i.target), i.maxForce) * r) ** 2, "motor commanded impulse squared norm");
		}
		p[n] = Math.max(p[n], i.maxForce);
	}
	for (let e = 0; e < t.length; e++) m(e, t[e].motor);
	for (let e of n) e.type === "jointMotor" && m(e.joint, e.motor);
	let h = e.map(() => 0), g = e.map(() => 0), _ = e.map(() => 0);
	for (let t = 0; t < e.length; t++) _[f(t)] += c[t];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r = f(n.bodyA);
		_[r] += Math.hypot(...n.anchorA) + Math.hypot(...n.anchorB), n.type === "prismatic" ? h[r] += p[e] : g[r] += p[e];
	}
	for (let t = 0; t < e.length; t++) {
		if (e[t].type !== "dynamic") continue;
		let n = f(t), r = h[n], c = g[n] + r * _[n];
		if (!r && !c) continue;
		M(r ** 2, "combined motor force squared norm", 0), M(c ** 2, "combined motor torque squared norm", 0), r && P((r / a[t]) ** 2, "motor linear acceleration squared norm"), c && P((c / s[t]) ** 2, "motor angular acceleration squared norm");
		let d = c / o[t], p = r / a[t] + d * _[n];
		u[t] += d * i, l[t] += p * i, M(u[t] ** 2, "motor-induced angular velocity squared norm", 0), M(l[t] ** 2, "motor-induced linear velocity squared norm", 0), M((Math.hypot(...e[t].translation) + l[t] * i) ** 2, "motor-induced position squared norm", 0);
	}
}
function Y(e, t, n, r, i, a, o, s, c, l) {
	let u = (i - 1) * r, d = F(n, "gravity"), f = e.map((e) => {
		let t = F(e.linearVelocity, "linearVelocity") + (e.type === "dynamic" ? d * u : 0);
		return M(t ** 2, "accumulated linear velocity squared norm", 0), t;
	}), p = e.map((e) => F(e.angularVelocity, "angularVelocity"));
	for (let e of t) if (e.type === "impulse") {
		if (e.impulse) {
			let t = F(e.impulse, "impulse");
			f[e.body] += t / a[e.body], M(f[e.body] ** 2, "accumulated linear velocity squared norm", 0);
		}
		if (e.torqueImpulse) {
			let t = F(e.torqueImpulse, "torqueImpulse");
			p[e.body] += t / o[e.body], M(p[e.body] ** 2, "accumulated angular velocity squared norm", 0);
		}
	}
	J(e, c, t, r, u, a, o, l, s, f, p);
	let m = e.map((e) => e.translation.slice()), h = e.map((e) => e.translation.slice()), g = Array(e.length).fill(-1);
	for (let n of t) {
		let t = e[n.body];
		if (n.type === "kinematicPose") {
			if (n.translation) {
				g[n.body] !== n.tick && (h[n.body] = m[n.body]);
				let e = h[n.body];
				F(n.translation.map((t, n) => (t - e[n]) / r), "kinematic target velocity"), m[n.body] = n.translation, g[n.body] = n.tick;
			}
			n.rotation && M((Math.PI / r) ** 2, "kinematic angular velocity squared norm", 0);
		} else if (n.impulse && n.point) {
			let e = F(n.impulse, "impulse"), r = f[n.body] * u, i = e * (Math.hypot(...n.point) + Math.hypot(...t.translation) + r + s[n.body]);
			M(i ** 2, "off-center torque impulse squared norm", 0), p[n.body] += i / o[n.body], M(p[n.body] ** 2, "accumulated angular velocity squared norm", 0);
		}
	}
}
function ee(e, t = {}) {
	return q(e, t).memoryPlan;
}
var X = (e) => ({
	x: e[0],
	y: e[1],
	z: e[2]
}), Z = (e) => ({
	...X(e),
	w: e[3]
});
function Q(e, t, n) {
	t.configureMotorModel(e.MotorModel.ForceBased), t.setMotorMaxForce(n?.maxForce ?? 0), n ? n.mode === "position" ? t.configureMotorPosition(n.target, n.stiffness, n.damping) : t.configureMotorVelocity(n.target, n.damping) : t.configureMotor(0, 0, 0, 0), t.body1().wakeUp(), t.body2().wakeUp();
}
async function te(e, t = {}) {
	let n = q(e, t);
	return await k(), $(n);
}
function ne(e, t = {}) {
	if (!m) throw Error("Physics engine is not loaded. Await loadPhysicsEngine() first.");
	return $(q(e, t));
}
function re(e, t) {
	let n;
	if (t.shape === "ball") n = e.ColliderDesc.ball(t.radius);
	else if (t.shape === "cuboid") n = e.ColliderDesc.cuboid(...t.halfExtents);
	else if (t.shape === "capsule") n = e.ColliderDesc.capsule(t.halfHeight, t.radius);
	else if (t.shape === "convexHull") {
		if (n = e.ColliderDesc.convexHull(t.points), !n) throw RangeError("convexHull points are degenerate: they must span a volume");
	} else n = e.ColliderDesc.trimesh(t.vertices, t.indices);
	return n.setTranslation(...t.translation), n.setRotation(Z(t.rotation)), n.setFriction(t.friction), n.setRestitution(t.restitution), n.setSensor(t.sensor), n.setCollisionGroups((t.groups << 16 | t.mask) >>> 0), n.setActiveEvents(e.ActiveEvents.COLLISION_EVENTS), t.shape !== "trimesh" && (t.mass === void 0 ? n.setDensity(t.density) : n.setMass(t.mass)), n;
}
function $(e) {
	let t = m, n = new t.World(X(e.gravity)), r = new t.EventQueue(!0), i = [], a = /* @__PURE__ */ new Map(), o = new Int32Array(e.bodies.length).fill(-1), s = !1, c;
	try {
		n.timestep = e.timestep, n.numSolverIterations = e.solverIterations;
		let l = e.bodies.map((e) => {
			let r;
			return r = e.type === "dynamic" ? t.RigidBodyDesc.dynamic() : e.type === "fixed" ? t.RigidBodyDesc.fixed() : t.RigidBodyDesc.kinematicPositionBased(), r.setTranslation(...e.translation), r.setRotation(Z(e.rotation)), e.type === "dynamic" && (r.setLinvel(...e.linearVelocity), r.setAngvel(X(e.angularVelocity)), r.setLinearDamping(e.linearDamping), r.setAngularDamping(e.angularDamping), r.setCcdEnabled(e.ccd)), n.createRigidBody(r);
		});
		e.colliders.forEach((e, r) => {
			let i = n.createCollider(re(t, e), l[e.body]);
			a.set(i.handle, r);
		});
		let u = e.joints.map((e) => {
			let r = X(e.anchorA), i = X(e.anchorB), a;
			a = e.type === "spherical" ? t.JointData.spherical(r, i) : e.type === "revolute" ? t.JointData.revolute(r, i, X(e.axis)) : e.type === "prismatic" ? t.JointData.prismatic(r, i, X(e.axis)) : t.JointData.fixed(r, Z(e.frameA), i, Z(e.frameB));
			let o = n.createImpulseJoint(a, l[e.bodyA], l[e.bodyB], !0);
			return o.setContactsEnabled(e.contactsEnabled), e.limits && o.setLimits(...e.limits), e.motor !== void 0 && Q(t, o, e.motor), o;
		});
		c = new Float32Array(e.memoryPlan.timelineBytes / 4);
		let d = 0;
		for (let f = 0; f < e.frameCount; f++) {
			if (f > 0) {
				for (; d < e.events.length && e.events[d].tick === f - 1;) {
					let n = e.events[d];
					if (d++, n.type === "jointMotor") {
						Q(t, u[n.joint], n.motor);
						continue;
					}
					let r = l[n.body];
					n.type === "kinematicPose" ? (n.translation && r.setNextKinematicTranslation(X(n.translation)), n.rotation && r.setNextKinematicRotation(Z(n.rotation))) : (n.impulse && (n.point ? r.applyImpulseAtPoint(X(n.impulse), X(n.point), !0) : r.applyImpulse(X(n.impulse), !0)), n.torqueImpulse && r.applyTorqueImpulse(X(n.torqueImpulse), !0));
				}
				n.step(r), r.drainCollisionEvents((t, n, r) => {
					if (i.length >= e.maxContactEvents) {
						s = !0;
						return;
					}
					let o = a.get(t), c = a.get(n), l = e.colliders[o].sensor || e.colliders[c].sensor;
					i.push(Object.freeze({
						frame: f,
						kind: l ? "sensor" : "contact",
						started: r,
						colliderA: o,
						colliderB: c
					}));
				});
			}
			for (let t = 0; t < l.length; t++) {
				let n = l[t].linvel(), r = l[t].angvel();
				M(n.x ** 2 + n.y ** 2 + n.z ** 2, "solver linear velocity squared norm", 0), M(r.x ** 2 + r.y ** 2 + r.z ** 2, "solver angular velocity squared norm", 0), (Math.hypot(n.x, n.y, n.z) > T || Math.hypot(r.x, r.y, r.z) > E) && (o[t] = f);
				let i = l[t].translation(), a = l[t].rotation(), s = (f * l.length + t) * 7;
				c[s] = i.x, c[s + 1] = i.y, c[s + 2] = i.z, c[s + 3] = a.x, c[s + 4] = a.y, c[s + 5] = a.z, c[s + 6] = a.w;
				for (let n = 0; n < 7; n++) if (!Number.isFinite(c[s + n])) throw RangeError(`solver produced nonfinite pose at frame ${f}, body ${e.bodies[t].name}`);
				let u = Math.hypot(a.x, a.y, a.z, a.w);
				if (!u || Math.abs(u - 1) > .001) throw RangeError("solver produced invalid quaternion");
			}
		}
	} finally {
		r.free(), n.free();
	}
	return ie(e, c, {
		contactEvents: i,
		contactEventsTruncated: s,
		lastMovingFrames: o
	});
}
function ie(i, a, o) {
	let s = Object.freeze(i.bodies.map((e) => e.name)), c = new Map(s.map((e, t) => [e, t])), l = s.length * 7, u = (i.frameCount - 1) * i.timestep;
	function d() {
		if (!a) throw Error("physics scene is disposed");
	}
	function f(e) {
		if (d(), !c.has(e)) throw TypeError(`unknown body ${e}`);
		return c.get(e);
	}
	function p(e, t) {
		if (d(), typeof e != "number" || !Number.isFinite(e)) throw RangeError("sample time must be finite");
		if (t ??= new Float32Array(l), !(t instanceof Float32Array) || t.length !== l) throw TypeError(`sample output must be Float32Array(${l})`);
		let n = Math.max(0, Math.min(u, e)) / i.timestep, r = Math.round(n);
		Math.abs(n - r) <= 2 ** -52 * Math.max(1, n) * 4 && (n = r);
		let o = Math.min(i.frameCount - 1, Math.floor(n)), c = Math.min(i.frameCount - 1, o + 1), f = n - o;
		for (let e = 0; e < s.length; e++) {
			let n = e * 7, r = o * l + n, i = c * l + n;
			for (let e = 0; e < 3; e++) t[n + e] = a[r + e] * (1 - f) + a[i + e] * f;
			if (f === 0 || o === c) {
				for (let e = 3; e < 7; e++) t[n + e] = a[r + e];
				continue;
			}
			let s = 0;
			for (let e = 3; e < 7; e++) s += a[r + e] * a[i + e];
			let u = s < 0 ? -1 : 1;
			s = Math.min(1, Math.abs(s));
			let d = 1 - f, p = f;
			if (s < .9995) {
				let e = Math.acos(s), t = Math.sin(e);
				d = Math.sin((1 - f) * e) / t, p = Math.sin(f * e) / t;
			}
			let m = 0;
			for (let e = 3; e < 7; e++) {
				let o = d * a[r + e] + u * p * a[i + e];
				t[n + e] = o, m += o ** 2;
			}
			let h = Math.sqrt(m);
			for (let e = 3; e < 7; e++) t[n + e] /= h;
		}
		return t;
	}
	function m(a) {
		if (d(), !Array.isArray(a) || a.length > i.memoryPlan.bodyCount * 16) throw RangeError("bindings must be a bounded array");
		let o = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map(), c = a.map((t) => {
			j(t, ["body", "part"], "binding");
			let i = f(t.body), a = t.part?.matrix;
			if (!(a instanceof Float32Array) || a.length !== 16 || o.has(a)) throw TypeError("each binding requires a distinct retained Float32 part.matrix");
			o.add(a);
			let c = s.get(a.buffer);
			c || (c = [], s.set(a.buffer, c)), c.push(a);
			for (let e of a) M(e, "binding matrix");
			if (a[3] !== 0 || a[7] !== 0 || a[11] !== 0 || a[15] !== 1) throw TypeError("binding matrix must be affine");
			let l = [
				Math.hypot(a[0], a[1], a[2]),
				Math.hypot(a[4], a[5], a[6]),
				Math.hypot(a[8], a[9], a[10])
			];
			for (let e of l) N(e, "binding scale");
			for (let [e, t] of [
				[0, 1],
				[0, 2],
				[1, 2]
			]) {
				let n = a[e * 4] * a[t * 4] + a[e * 4 + 1] * a[t * 4 + 1] + a[e * 4 + 2] * a[t * 4 + 2];
				if (Math.abs(n / l[e] / l[t]) > 1e-5) throw TypeError("binding matrix shear is unsupported");
			}
			return n(a) < 0 && (l[0] *= -1), {
				part: t.part,
				matrix: a,
				index: i,
				scale: l,
				position: /* @__PURE__ */ new Float32Array(3),
				rotation: r(),
				scratchMatrix: e()
			};
		});
		for (let e of s.values()) {
			e.sort((e, t) => e.byteOffset - t.byteOffset);
			for (let t = 1; t < e.length; t++) {
				let n = e[t - 1], r = e[t];
				if (n.byteOffset + n.byteLength > r.byteOffset) throw TypeError("binding matrix views must not overlap");
			}
		}
		let u = new Float32Array(l);
		return Object.freeze({ apply(e) {
			d();
			for (let e = 0; e < c.length; e++) if (c[e].part.matrix !== c[e].matrix) throw Error("binding part.matrix identity changed");
			p(e, u);
			for (let e = 0; e < c.length; e++) {
				let n = c[e], r = n.index * 7;
				for (let e = 0; e < 3; e++) n.position[e] = u[r + e];
				for (let e = 0; e < 4; e++) n.rotation[e] = u[r + e + 3];
				t(n.scratchMatrix, n.rotation, n.position, n.scale);
				for (let e = 0; e < 16; e++) if (!Number.isFinite(n.scratchMatrix[e])) throw RangeError("binding transform exceeds Float32 range");
			}
			for (let e = 0; e < c.length; e++) c[e].matrix.set(c[e].scratchMatrix);
			return a;
		} });
	}
	return Object.freeze({
		bodyNames: s,
		frameCount: i.frameCount,
		timestep: i.timestep,
		duration: u,
		memoryPlan: i.memoryPlan,
		bodyIndex: f,
		sample: p,
		bindParts: m,
		colliderNames: Object.freeze(i.colliders.map((e) => i.bodies[e.body].name)),
		contactEvents: Object.freeze(o.contactEvents),
		contactEventsTruncated: o.contactEventsTruncated,
		restFrames: Object.freeze(Array.from(o.lastMovingFrames, (e) => e < i.frameCount - 1 ? e + 1 : -1)),
		dispose() {
			a = null;
		},
		get disposed() {
			return a === null;
		}
	});
}
export { ne as bakePhysicsScene, te as createPhysicsScene, k as loadPhysicsEngine, A as physicsEngineLoaded, ee as planPhysicsScene, O as setPhysicsModuleLoader };
