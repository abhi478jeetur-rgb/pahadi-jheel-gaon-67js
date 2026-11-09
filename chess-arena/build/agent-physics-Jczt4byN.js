/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { d as e, h as t, l as n, n as r, o as i, t as a, u as o } from "./mat4-BCZClxna.js";
import { S as s, a as c, d as l, m as u, p as d, t as f, x as p, y as m } from "./vec3-BRYC6f_g.js";
import { C as h, a as g, o as _, s as v } from "./agent-scene-CyG0Wljh.js";
import { c as y, f as ee, l as te, n as b, o as x, s as S, u as C } from "./quat-Bl7gjwWK.js";
import { bakePhysicsScene as w, loadPhysicsEngine as ne, physicsEngineLoaded as re, setPhysicsModuleLoader as ie } from "./physics.js";
var ae = 1e-4, oe = .25, se = .2, ce = 3, T = 120 * Math.PI / 180, le = 1, ue = 65535, de = .001, fe = [
	0,
	1,
	0
];
function pe(t) {
	let r = a(t.worldMatrix), i = y(b(), n(b(), r)), o = e(c(), r), u = s(c(), m(c(), t.tail, o), x(b(), i)), d = l(u);
	if (!(d > ae)) throw RangeError(`Ragdoll bone ${t.id} has no length: its head and tail coincide.`);
	let f = E(r, t.id), p = t.parentId === null ? D(t.parentWorldMatrix, t.id) : null;
	return {
		...t,
		head: o,
		rotation: i,
		uniformScale: f,
		staticParent: p,
		tailInBone: u,
		length: d
	};
}
function E(e, t) {
	let n = o(c(), e);
	if (Math.max(...n) - Math.min(...n) > de * Math.max(...n)) throw RangeError(`Ragdoll bone ${t} sits under a stretched (non-uniform) scale ${JSON.stringify(Array.from(n))}; a ragdoll needs uniform scale above its bones.`);
	return n[0];
}
function D(t, r) {
	return {
		translation: e(c(), t),
		rotation: y(b(), n(b(), t)),
		scale: E(t, r)
	};
}
function me(e, t) {
	y(e, e);
	let n = S(b(), x(b(), t), e);
	n[3] < 0 && C(n, n, -1);
	let r = 2 * Math.acos(Math.min(1, n[3]));
	if (r <= T) return;
	let i = ee(b(), b(), n, T / r);
	S(e, t, i);
}
function he(e, t, n) {
	let r = e.length * se, i = t.layer ?? le, a = {
		name: e.id,
		body: e.id,
		shape: "capsule",
		radius: r,
		halfHeight: Math.max(e.length / 2 - r, r * .01),
		translation: Array.from(u(c(), e.tailInBone, .5)),
		rotation: Array.from(te(b(), fe, d(c(), e.tailInBone))),
		groups: 1 << i,
		mask: t.collidesWith ?? ue & ~(1 << i),
		mass: (t.density ?? 1) * Math.max(e.length, n * oe)
	};
	return t.friction !== void 0 && (a.friction = t.friction), t.restitution !== void 0 && (a.restitution = t.restitution), a;
}
function ge(e, t, n) {
	let r = m(c(), e.head, t.head), i = s(c(), r, x(b(), t.rotation));
	return {
		name: `ragdoll-joint-${n}`,
		type: "spherical",
		bodyA: t.id,
		bodyB: e.id,
		anchorA: Array.from(i),
		anchorB: [
			0,
			0,
			0
		]
	};
}
function O(e, t = {}) {
	if (!Array.isArray(e) || e.length < 1 || e.length > 48) throw RangeError(`A ragdoll needs 1 to 48 bones; this rig has ${Array.isArray(e) ? e.length : 0}.`);
	let n = e.map(pe), r = new Map(n.map((e) => [e.id, e])), i = Math.max(...n.map((e) => e.length)), a = [], o = [], l = [];
	for (let e of n) {
		let n = e.parentId === null ? null : r.get(e.parentId);
		if (e.parentId !== null && !n) throw RangeError(`Ragdoll bone ${e.id} names a parent that is not in the ragdoll: ${e.parentId}.`);
		a.push({
			name: e.id,
			type: "dynamic",
			translation: Array.from(e.head),
			rotation: Array.from(e.rotation),
			angularDamping: ce
		}), o.push(he(e, t, i)), n && l.push(ge(e, n, l.length));
	}
	for (let e of n) {
		let t = e.parentId === null ? e.staticParent.rotation : r.get(e.parentId).rotation;
		e.restLocalRotation = S(b(), x(b(), t), e.rotation);
	}
	let d = c();
	return Object.freeze({
		boneIds: n.map((e) => e.id),
		definition: {
			bodies: a,
			colliders: o,
			joints: l
		},
		writePatches(e, t) {
			let r = /* @__PURE__ */ new Map();
			for (let i of n) {
				let n = e(i.id), a = i.parentId === null ? i.staticParent : r.get(i.parentId);
				r.set(i.id, {
					translation: n.translation,
					rotation: n.rotation,
					scale: i.uniformScale
				});
				let o = x(b(), a.rotation), c = t.get(i.id);
				m(d, n.translation, a.translation), s(c.translation, d, o), u(c.translation, c.translation, 1 / a.scale), S(c.rotation, o, n.rotation), me(c.rotation, i.restLocalRotation);
			}
		},
		ends(e, t) {
			let n = r.get(e).tailInBone, i = s(c(), n, t.rotation);
			return {
				head: Array.from(t.translation),
				tail: Array.from(f(i, i, t.translation))
			};
		}
	});
}
function k(e) {
	return new Map(e.boneIds.map((e) => [e, {
		translation: /* @__PURE__ */ new Float64Array(3),
		rotation: /* @__PURE__ */ new Float64Array(4)
	}]));
}
var A = (e) => Number(e.toFixed(4));
function j(e, t) {
	let n = t.sample(t.duration), r = t.sample(Math.max(0, t.duration - t.timestep)), i = Infinity, a = -Infinity, o = 0, s = 0;
	for (let c of e.boneIds) {
		let l = t.bodyIndex(c) * 7, u = {
			translation: n.subarray(l, l + 3),
			rotation: n.subarray(l + 3, l + 7)
		}, { head: d, tail: f } = e.ends(c, u);
		i = Math.min(i, d[1], f[1]), a = Math.max(a, d[1], f[1]);
		let p = Math.hypot(...[
			0,
			1,
			2
		].map((e) => n[l + e] - r[l + e]));
		o = Math.max(o, p / t.timestep);
		let m = t.restFrames[t.bodyIndex(c)];
		s = s < 0 || m < 0 ? -1 : Math.max(s, m);
	}
	return {
		bones: e.boneIds.length,
		lowestY: A(i),
		highestY: A(a),
		fastestFinalSpeed: A(o),
		restsAtTime: s < 0 ? null : Number((s * t.timestep).toFixed(3))
	};
}
// src/agent-physics.js
var M = 60, N = 10, P = 64, F = 64, I = 15, L = 2e4, R = 2048, z = 65536, _e = 64, ve = 128, B = [
	"dynamic",
	"fixed",
	"kinematic"
], V = [
	"box",
	"ball",
	"capsule",
	"convex",
	"trimesh"
], H = [
	"spherical",
	"revolute",
	"prismatic",
	"fixed"
], ye = [
	"node",
	"type",
	"shape",
	"mass",
	"density",
	"friction",
	"restitution",
	"sensor",
	"velocity",
	"angularVelocity",
	"layer",
	"collidesWith"
], be = [
	"type",
	"bodyA",
	"bodyB",
	"anchorA",
	"anchorB",
	"axis",
	"limits"
], xe = [
	"duration",
	"gravity",
	"bodies",
	"joints",
	"ragdoll"
], U = [
	"armature",
	"density",
	"friction",
	"restitution",
	"layer"
];
function W(e, t, n) {
	if (!e || Object.getPrototypeOf(e) !== Object.prototype) throw TypeError(`${n} must be a plain object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown or unsupported ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function G(e, t, n = -Infinity, r = Infinity) {
	if (typeof e != "number" || !Number.isFinite(e) || !Number.isFinite(Math.fround(e)) || e < n || e > r) throw RangeError(`${t} must be a finite number within ${n} and ${r}.`);
	return e;
}
function K(e, t, n) {
	if (!Array.isArray(e) || e.length !== t) throw TypeError(`${n} needs ${t} numbers.`);
	return e.map((e) => G(e, n));
}
function Se(e, t) {
	if (typeof e != "string" || !e.trim() || e.length > 128) throw TypeError(`${t} needs a node ID of 1 to 128 characters.`);
	return e;
}
function q(e, t, n) {
	if (!Array.isArray(e) || e.length > t) throw TypeError(`${n} must be an array of at most ${t} entries.`);
	return e;
}
function Ce(e, t, n, r) {
	W(e, ye, "physics body");
	let i = Se(e.node, "Physics body node"), a = t.get(i);
	if (!a) throw RangeError(`Physics body node was not found: ${i}.`);
	if (a.geometry === void 0) throw RangeError(`Physics body node ${i} has no geometry to fit a collider to.`);
	if (a.parent !== null) throw RangeError(`Physics body node ${i} must be a root node; reparent it or move its parent into the body.`);
	if (r.has(i)) throw RangeError(`Node ${i} has more than one physics body.`);
	if (n.has(i)) throw RangeError(`Node ${i} has a motion translation or rotation track and a physics body. Pick one.`);
	r.add(i);
	let o = e.type ?? "dynamic";
	if (!B.includes(o)) throw RangeError(`Physics body type must be one of ${B.join(", ")}.`);
	if (e.sensor !== void 0 && typeof e.sensor != "boolean") throw TypeError("Physics body sensor must be boolean.");
	let s = e.sensor ?? !1, c = e.shape ?? (s || o === "dynamic" ? "box" : "trimesh");
	if (!V.includes(c)) throw RangeError(`Physics shape must be one of ${V.join(", ")}.`);
	if (c === "trimesh" && o === "dynamic") throw RangeError(`Body ${i} is dynamic: use shape convex, box, ball or capsule. Trimesh is for fixed or kinematic bodies.`);
	if (o !== "dynamic" && (e.velocity !== void 0 || e.angularVelocity !== void 0)) throw TypeError(`Body ${i} is ${o}: only dynamic bodies take velocity.`);
	if (e.mass !== void 0 && e.density !== void 0) throw TypeError("A physics body takes mass or density, not both.");
	let l = {
		node: i,
		type: o,
		shape: c
	};
	if (s && (l.sensor = !0), e.mass !== void 0 && (l.mass = G(e.mass, "Physics mass", 1e-6, 1e9)), e.density !== void 0 && (l.density = G(e.density, "Physics density", 1e-6, 1e9)), e.friction !== void 0 && (l.friction = G(e.friction, "Physics friction", 0, 100)), e.restitution !== void 0 && (l.restitution = G(e.restitution, "Physics restitution", 0, 1)), e.velocity !== void 0 && (l.velocity = K(e.velocity, 3, "Physics velocity")), e.angularVelocity !== void 0 && (l.angularVelocity = K(e.angularVelocity, 3, "Physics angularVelocity")), e.layer !== void 0 && (l.layer = Math.trunc(G(e.layer, "Physics layer", 0, I))), e.collidesWith !== void 0) {
		let t = q(e.collidesWith, 16, "Physics collidesWith");
		l.collidesWith = [...new Set(t.map((e) => Math.trunc(G(e, "Physics collidesWith layer", 0, I))))].sort((e, t) => e - t);
	}
	return l;
}
function we(e, t) {
	if (W(e, be, "physics joint"), !H.includes(e.type)) throw RangeError(`Physics joint type must be one of ${H.join(", ")}.`);
	for (let n of ["bodyA", "bodyB"]) if (!t.has(e[n])) throw RangeError(`Physics joint ${n} must be the node of a physics body: ${e[n]}.`);
	let n = {
		type: e.type,
		bodyA: e.bodyA,
		bodyB: e.bodyB
	};
	for (let t of [
		"anchorA",
		"anchorB",
		"axis"
	]) e[t] !== void 0 && (n[t] = K(e[t], 3, `Physics joint ${t}`));
	return e.limits !== void 0 && (n.limits = K(e.limits, 2, "Physics joint limits")), n;
}
function Te(e, t, n) {
	W(e, U, "physics ragdoll");
	let r = (t.armatures ?? []).find((t) => t.id === e.armature);
	if (!r) throw RangeError(`Physics ragdoll armature was not found: ${JSON.stringify(String(e.armature).slice(0, 48))}. Add it to the recipe armatures.`);
	let i = { armature: r.id };
	e.density !== void 0 && (i.density = G(e.density, "Ragdoll density", 1e-6, 1e9)), e.friction !== void 0 && (i.friction = G(e.friction, "Ragdoll friction", 0, 100)), e.restitution !== void 0 && (i.restitution = G(e.restitution, "Ragdoll restitution", 0, 1)), e.layer !== void 0 && (i.layer = Math.trunc(G(e.layer, "Ragdoll layer", 0, I)));
	for (let e of r.bones) if (n.has(g(r, e.name))) throw RangeError(`Bone ${e.name} has a motion translation or rotation track and a ragdoll. Pick one.`);
	return J(i, t), i;
}
function J(e, t) {
	let n = t.armatures.find((t) => t.id === e.armature), r = new Map(t.nodes.map((e) => [e.id, e])), i = v(n.id, r), a = _(n), o = n.bones.map((e, t) => {
		let o = g(n, e.name);
		return {
			id: o,
			parentId: e.parent === null ? null : g(n, e.parent),
			worldMatrix: v(o, r),
			parentWorldMatrix: v(r.get(o).parent, r),
			tail: Array.from(p(c(), a[t], i))
		};
	}), { armature: s, ...l } = e;
	return O(o, l);
}
function Ee(e, t) {
	if (e == null) return null;
	W(e, xe, "physics");
	let n = G(e.duration, "Physics duration", .1, N), r = new Map(t.nodes.map((e) => [e.id, e])), i = new Set((t.motion?.tracks ?? []).filter((e) => e.kind === "node" && (e.property === "translation" || e.property === "rotation")).map((e) => e.id)), a = /* @__PURE__ */ new Set(), o = q(e.bodies ?? [], P, "Physics bodies").map((e) => Ce(e, r, i, a));
	if (!o.length && e.ragdoll === void 0) throw RangeError("Physics needs at least one body. Use null to clear it.");
	let s = {
		duration: n,
		bodies: o
	};
	return e.ragdoll !== void 0 && (s.ragdoll = Te(e.ragdoll, t, i)), e.gravity !== void 0 && (s.gravity = K(e.gravity, 3, "Physics gravity")), e.joints !== void 0 && (s.joints = q(e.joints, F, "Physics joints").map((e) => we(e, a))), s;
}
function De(e, t) {
	let n = [
		Infinity,
		Infinity,
		Infinity
	], r = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let i = 0; i < e.length; i += 3) for (let a = 0; a < 3; a++) {
		let o = e[i + a] * t[a];
		n[a] = Math.min(n[a], o), r[a] = Math.max(r[a], o);
	}
	return {
		center: n.map((e, t) => (e + r[t]) / 2),
		halfExtents: n.map((e, t) => Math.max((r[t] - e) / 2, 1e-4))
	};
}
function Oe(e, t, n) {
	if (e.length / 3 > z) throw RangeError(`Geometry of ${n} has ${e.length / 3} vertices; a convex collider reads at most ${z}. Use shape box or a coarser geometry.`);
	let r = /* @__PURE__ */ new Map();
	for (let i = 0; i < e.length; i += 3) {
		let a = [
			e[i] * t[0],
			e[i + 1] * t[1],
			e[i + 2] * t[2]
		];
		if (r.set(a.map((e) => e.toFixed(5)).join(","), a), r.size > R) throw RangeError(`Geometry of ${n} has more than ${R} distinct vertices for a convex collider. Use shape box or a coarser geometry.`);
	}
	return [...r.values()].flat();
}
function ke(e, t, n) {
	let r = e.indices.length / 3;
	if (r > L) throw RangeError(`Geometry of ${n} has ${r} triangles; a trimesh collider holds at most ${L}. Use a coarser geometry or shape box.`);
	let i = [];
	for (let n = 0; n < e.positions.length; n += 3) i.push(e.positions[n] * t[0], e.positions[n + 1] * t[1], e.positions[n + 2] * t[2]);
	return {
		vertices: i,
		indices: Array.from(e.indices)
	};
}
function Ae(e, t, n) {
	let { center: r, halfExtents: i } = De(n.positions, t.scale);
	if (e.shape === "box") return {
		shape: "cuboid",
		halfExtents: i,
		translation: r
	};
	if (e.shape === "ball") return {
		shape: "ball",
		radius: Math.max(...i),
		translation: r
	};
	if (e.shape === "capsule") {
		let e = Math.max(i[0], i[2]);
		return {
			shape: "capsule",
			radius: e,
			halfHeight: Math.max(i[1] - e, e * .01),
			translation: r
		};
	}
	return e.shape === "convex" ? {
		shape: "convexHull",
		points: Oe(n.positions, t.scale, t.id)
	} : {
		shape: "trimesh",
		...ke(n, t.scale, t.id)
	};
}
function je(e) {
	return e.reduce((e, t) => e | 1 << t, 0);
}
function Me(e, t, n, r) {
	let i = new Map(t.nodes.map((e) => [e.id, e])), a = {
		bodies: [],
		colliders: [],
		joints: []
	};
	e.gravity && (a.gravity = e.gravity);
	for (let t of e.bodies) {
		let e = i.get(t.node);
		a.bodies.push({
			name: e.id,
			type: t.type,
			translation: e.translation,
			rotation: e.rotation,
			...t.velocity ? { linearVelocity: t.velocity } : {},
			...t.angularVelocity ? { angularVelocity: t.angularVelocity } : {}
		});
		let r = {
			name: e.id,
			body: e.id,
			...Ae(t, e, n.get(e.geometry)),
			...t.sensor ? { sensor: !0 } : {},
			...t.friction === void 0 ? {} : { friction: t.friction },
			...t.restitution === void 0 ? {} : { restitution: t.restitution },
			groups: 1 << (t.layer ?? 0),
			mask: t.collidesWith ? je(t.collidesWith) : 65535
		};
		r.shape !== "trimesh" && (t.mass === void 0 ? r.density = t.density ?? 1 : r.mass = t.mass), a.colliders.push(r);
	}
	return r && (a.bodies.push(...r.definition.bodies), a.colliders.push(...r.definition.colliders), a.joints.push(...r.definition.joints)), (e.joints ?? []).forEach((e, t) => a.joints.push({
		name: `joint-${t}`,
		...e
	})), a;
}
var Y = (e, t) => Number((e * t).toFixed(3)), X = (e) => Array.from(e, (e) => Number(e.toFixed(4)));
function Ne(e, t) {
	let n = new Set(t.bodies.filter((e) => e.sensor).map((e) => e.node)), r = /* @__PURE__ */ new Map(), i = [];
	for (let t of e.contactEvents) {
		let a = e.colliderNames[t.colliderA], o = e.colliderNames[t.colliderB];
		if (t.kind === "sensor") {
			if (i.length < ve) {
				let r = n.has(a) ? a : o;
				i.push({
					sensor: r,
					other: r === a ? o : a,
					kind: t.started ? "enter" : "leave",
					time: Y(t.frame, e.timestep)
				});
			}
			continue;
		}
		let s = [a, o].sort().join("|"), c = r.get(s) ?? {
			a: a < o ? a : o,
			b: a < o ? o : a,
			firstTime: Y(t.frame, e.timestep),
			touching: 0,
			count: 0
		};
		c.touching += t.started ? 1 : -1, c.count += +!!t.started, r.set(s, c);
	}
	return {
		contacts: [...r.values()].slice(0, _e).map(({ a: e, b: t, firstTime: n, touching: r, count: i }) => ({
			a: e,
			b: t,
			firstTime: n,
			count: i,
			touchingAtEnd: r > 0
		})),
		sensorEvents: i
	};
}
function Pe(e, t) {
	let n = e.sample(e.duration), r = e.sample(Math.max(0, e.duration - e.timestep));
	return t.bodies.map((t) => {
		let i = e.bodyIndex(t.node) * 7, a = Array.from(n.subarray(i, i + 3)), o = Math.hypot(...a.map((e, t) => e - r[i + t])) / e.timestep, s = e.restFrames[e.bodyIndex(t.node)];
		return {
			node: t.node,
			type: t.type,
			shape: t.shape,
			finalPosition: X(a),
			finalSpeed: Number(o.toFixed(4)),
			...t.type === "dynamic" ? { restsAtTime: s < 0 ? null : Y(s, e.timestep) } : {}
		};
	});
}
function Fe(e, t) {
	let n = e.nodes.filter((t) => e.physics.bodies.some((e) => e.node === t.id)), r = e.physics.ragdoll ? [e.nodes, e.armatures] : null;
	return JSON.stringify([
		e.physics,
		n,
		n.map((e) => t.get(e.geometry).signature),
		r
	]);
}
function Ie(e, t, n) {
	let r = e.ragdoll ? J(e.ragdoll, t) : null, i = Me(e, t, n, r), a = Math.round(e.duration * M) + 1, o = w(i, {
		frameCount: a,
		timestep: 1 / M,
		maxColliderTriangles: L,
		maxHullPoints: R
	}), s = new Map(e.bodies.map((e) => [e.node, {
		translation: /* @__PURE__ */ new Float64Array(3),
		rotation: /* @__PURE__ */ new Float64Array(4)
	}])), c = r ? k(r) : /* @__PURE__ */ new Map();
	for (let [e, t] of c) s.set(e, t);
	let l = new Float32Array(o.bodyNames.length * 7), u = (e) => {
		let t = o.bodyIndex(e) * 7;
		return {
			translation: l.subarray(t, t + 3),
			rotation: l.subarray(t + 3, t + 7)
		};
	}, d = null;
	return Object.freeze({
		duration: e.duration,
		sample(e) {
			o.sample(e, l), r?.writePatches(u, c);
			for (let [e, t] of s) {
				if (c.has(e)) continue;
				let n = o.bodyIndex(e) * 7;
				t.translation.set(l.subarray(n, n + 3)), t.rotation.set(l.subarray(n + 3, n + 7));
			}
			return s;
		},
		report() {
			return d ??= {
				duration: e.duration,
				frames: o.frameCount,
				gravity: e.gravity ?? [
					0,
					-9.81,
					0
				],
				bodies: Pe(o, e),
				...Ne(o, e),
				eventsTruncated: o.contactEventsTruncated,
				...r ? { ragdoll: j(r, o) } : {}
			}, structuredClone(d);
		}
	});
}
var Le = [
	"duration",
	"gravity",
	"floor",
	"ragdoll"
], Z = 200, Q = .5;
function Re(e) {
	W(e, Le, "asset physics");
	let t = { duration: G(e.duration, "Physics duration", .1, N) };
	if (e.gravity !== void 0 && (t.gravity = K(e.gravity, 3, "Physics gravity")), e.floor !== void 0 && (t.floor = G(e.floor, "Physics floor", -1e6, 1e6)), e.ragdoll === void 0) throw TypeError("Asset physics needs a ragdoll section: it is what moves the asset joints.");
	W(e.ragdoll, U.filter((e) => e !== "armature"), "physics ragdoll");
	let n = {};
	for (let [t, r, i] of [
		[
			"density",
			1e-6,
			1e9
		],
		[
			"friction",
			0,
			100
		],
		[
			"restitution",
			0,
			1
		]
	]) e.ragdoll[t] !== void 0 && (n[t] = G(e.ragdoll[t], `Ragdoll ${t}`, r, i));
	return e.ragdoll.layer !== void 0 && (n.layer = Math.trunc(G(e.ragdoll.layer, "Ragdoll layer", 0, I))), {
		...t,
		ragdoll: n
	};
}
function $(e, n, i, a, o) {
	if (a.has(e.id)) return a.get(e.id);
	let s = e.parent === null ? o : $(n.get(e.parent), n, i, a, o), c = t(r(), s, i.get(e.id));
	return a.set(e.id, c), c;
}
function ze(e, t) {
	let n = e.parent === null ? void 0 : t.get(e.parent);
	for (; n && !n.joint;) n = n.parent === null ? void 0 : t.get(n.parent);
	return n?.id ?? null;
}
function Be(t, n, a) {
	let o = new Map(t.map((e) => [e.id, e])), s = new Map(n.map((e) => [e.id, i(r(), e.rotation, e.translation, e.scale)])), l = /* @__PURE__ */ new Map(), u = t.filter((e) => e.joint), d = u.find((e) => !e.editable);
	if (d) throw RangeError(`Joint ${d.id} cannot be edited (mirrored or sheared), so a ragdoll cannot drive it.`);
	let f = (e) => e.parent === null ? 0 : 1 + f(o.get(e.parent)), p = u.map((e) => ({
		node: e,
		depth: f(e)
	})).sort((e, t) => e.depth - t.depth).map((e) => e.node), m = new Map(p.map((e) => [e.id, $(e, o, s, l, a)])), h = { bones: p.map((t) => ({
		name: t.id,
		parent: ze(t, o),
		head: Array.from(e(c(), m.get(t.id)))
	})) }, g = _(h);
	return p.map((e, t) => ({
		id: e.id,
		parentId: h.bones[t].parent,
		worldMatrix: m.get(e.id),
		tail: g[t],
		parentWorldMatrix: e.parent === null ? a : $(o.get(e.parent), o, s, l, a)
	}));
}
function Ve(e, t, n, r) {
	let i = O(Be(t, n, r), e.ragdoll), a = {
		bodies: [{
			name: "ragdoll-floor",
			type: "fixed",
			translation: [
				0,
				(e.floor ?? 0) - Q,
				0
			]
		}, ...i.definition.bodies],
		colliders: [{
			name: "ragdoll-floor",
			body: "ragdoll-floor",
			shape: "cuboid",
			halfExtents: [
				Z,
				Q,
				Z
			]
		}, ...i.definition.colliders],
		joints: i.definition.joints,
		...e.gravity ? { gravity: e.gravity } : {}
	}, o = Math.round(e.duration * M) + 1, s = w(a, {
		frameCount: o,
		timestep: 1 / M,
		maxColliderTriangles: L,
		maxHullPoints: R
	}), c = k(i), l = new Float32Array(s.bodyNames.length * 7), u = (e) => {
		let t = s.bodyIndex(e) * 7;
		return {
			translation: l.subarray(t, t + 3),
			rotation: l.subarray(t + 3, t + 7)
		};
	};
	return Object.freeze({
		duration: e.duration,
		sample(e) {
			return s.sample(e, l), i.writePatches(u, c), c;
		},
		report() {
			return {
				duration: e.duration,
				frames: s.frameCount,
				gravity: e.gravity ?? [
					0,
					-9.81,
					0
				],
				ragdoll: j(i, s)
			};
		}
	});
}
export { Ie as bakeAgentPhysics, Ve as bakeAssetRagdoll, ne as loadPhysicsEngine, h as needsPhysics, Ee as normalizeAgentPhysics, Re as normalizeAssetPhysics, Fe as physicsBakeKey, re as physicsEngineLoaded, ie as setPhysicsModuleLoader };
