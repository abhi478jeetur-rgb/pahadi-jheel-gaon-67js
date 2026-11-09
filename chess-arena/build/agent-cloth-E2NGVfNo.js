/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t, o as n, p as r } from "./mat4-BCZClxna.js";
import { a as i, s as a, x as o } from "./vec3-BRYC6f_g.js";
import { o as s } from "./kernel-offload-CFdSENYy.js";
import { t as c } from "./cloth-fields-CCGzrDE6.js";
import { n as l } from "./force-fields-DH4YNmiz.js";
import { CLOTH_LIMITS as u, sampleClothFrames as d, weldVertices as f } from "./cloth.js";
import { t as p } from "./geometry-normals-DRzK4L7V.js";
import { a as m, i as h, n as g, o as _, r as v, t as y } from "./agent-recipe-checks-FwGjwFIr.js";
import { a as b, o as ee, s as x } from "./agent-scene-CyG0Wljh.js";
// src/agent-cloth.js
var te = .2, S = 60, ne = 10, C = 8, w = 16, T = 64, E = .001, re = 10, D = 100, ie = 1e-4, O = [
	"top",
	"bottom",
	"left",
	"right",
	"topLeft",
	"topRight",
	"bottomLeft",
	"bottomRight"
], k = ["ball", "box"], A = ["ball", "capsule"], j = [
	"duration",
	"gravity",
	"wind",
	"fields",
	"sheets",
	"colliders"
], M = [
	"node",
	"pin",
	"pinGroup",
	"pinTo",
	"stiffness",
	"bend",
	"density",
	"damping",
	"friction",
	"thickness"
], N = ["node", "weight"], P = ["node", "shape"], F = [
	"attach",
	"shape",
	"radius",
	"offset",
	"to",
	"toOffset"
], I = [
	"armature",
	"radiusFraction",
	"exclude"
], L = 1e-4, R = .5, z = /^[A-Za-z0-9][A-Za-z0-9._-]{0,47}$/, B = /* @__PURE__ */ new Map();
function V(e, t) {
	h(e, M, "cloth sheet"), m(e.node, t.recipeNodes, t.claimedNodes, t.motionNodeIds, t.physicsNodeIds, "Cloth sheet");
	let n = { node: e.node };
	if (e.pin !== void 0) {
		let t = g(e.pin, O.length, "Cloth pin");
		for (let e of t) if (!O.includes(e)) throw RangeError(`Cloth pin must be one of ${O.join(", ")}.`);
		n.pin = [...new Set(t)];
	}
	if (e.pinGroup !== void 0) {
		if (typeof e.pinGroup != "string" || !z.test(e.pinGroup)) throw RangeError("Cloth pinGroup must be the name of a vertex group on the sheet mesh.");
		n.pinGroup = e.pinGroup;
	}
	if (e.pinTo !== void 0) {
		if (h(e.pinTo, N, "cloth pinTo"), !n.pin?.length && !n.pinGroup) throw RangeError("Cloth pinTo moves the pinned vertices, so the sheet needs pin too (or pinGroup).");
		let r = H(e.pinTo.node, t, "Cloth pinTo");
		if (r === e.node) throw RangeError("Cloth pinTo cannot name the sheet itself.");
		n.pinTo = {
			node: r,
			weight: e.pinTo.weight === void 0 ? 1 : v(e.pinTo.weight, "Cloth pinTo weight", .01, 1)
		};
	}
	for (let [t, [r, i]] of Object.entries({
		stiffness: [.01, 1],
		bend: [0, 1],
		density: [.01, 10],
		damping: [0, 100],
		friction: [0, 1],
		thickness: [0, .5]
	})) e[t] !== void 0 && (n[t] = v(e[t], `Cloth ${t}`, r, i));
	return n;
}
function H(e, t, n) {
	if (typeof e != "string" || !t.recipeNodes.has(e)) throw RangeError(`${n} node was not found: ${String(e).slice(0, 64)}.`);
	return e;
}
function U(e, t) {
	h(e, F, "cloth moving collider");
	let n = e.shape ?? "ball";
	if (!A.includes(n)) throw RangeError(`Cloth moving collider shape must be one of ${A.join(", ")}.`);
	if (n === "capsule" != (e.to !== void 0)) throw RangeError("A capsule collider needs to (the node its other end rides on); a ball takes no to.");
	let r = {
		attach: H(e.attach, t, "Cloth collider attach"),
		shape: n,
		radius: v(e.radius, "Cloth collider radius", E, re)
	};
	if (e.offset !== void 0 && (r.offset = _(e.offset, "Cloth collider offset", D)), n === "capsule") r.to = H(e.to, t, "Cloth collider to"), e.toOffset !== void 0 && (r.toOffset = _(e.toOffset, "Cloth collider toOffset", D));
	else if (e.toOffset !== void 0) throw RangeError("A ball collider takes no toOffset.");
	return r;
}
function W(e, t) {
	h(e, I, "cloth fitted collider");
	let n = (t.armatures ?? []).find((t) => t.id === e.armature);
	if (!n) throw RangeError(`Cloth collider armature was not found: ${JSON.stringify(String(e.armature).slice(0, 48))}. Add it to the recipe armatures.`);
	let r = { armature: n.id };
	if (e.radiusFraction !== void 0 && (r.radiusFraction = v(e.radiusFraction, "Cloth collider radiusFraction", .02, .5)), e.exclude !== void 0) {
		let t = new Set(n.bones.map((e) => e.name));
		r.exclude = [...new Set(g(e.exclude, T, "Cloth collider exclude"))];
		for (let e of r.exclude) if (!t.has(e)) throw RangeError(`Cloth collider exclude names a bone that ${n.id} does not have: ${JSON.stringify(String(e).slice(0, 48))}.`);
	}
	return r;
}
function G(e, t, n) {
	if (typeof e == "object" && e && Object.hasOwn(e, "attach")) return U(e, t);
	if (typeof e == "object" && e && Object.hasOwn(e, "armature")) return W(e, n);
	h(e, P, "cloth collider"), m(e.node, t.recipeNodes, t.claimedNodes, t.motionNodeIds, t.physicsNodeIds, "Cloth collider");
	let r = e.shape ?? "box";
	if (!k.includes(r)) throw RangeError(`Cloth collider shape must be one of ${k.join(", ")}.`);
	return {
		node: e.node,
		shape: r
	};
}
function ae(e, t) {
	if (e == null) return null;
	h(e, j, "cloth");
	let n = y(t), r = { duration: v(e.duration, "Cloth duration", .1, ne) };
	if (r.sheets = g(e.sheets, C, "Cloth sheets").map((e) => V(e, n)), !r.sheets.length) throw RangeError("Cloth needs at least one sheet. Use null to clear it.");
	if (e.gravity !== void 0 && (r.gravity = _(e.gravity, "Cloth gravity", 1e3)), e.wind !== void 0 && (r.wind = _(e.wind, "Cloth wind", 100)), e.fields !== void 0 && (r.fields = l(e.fields, "Cloth force field")), e.colliders !== void 0) {
		let i = g(e.colliders, 80, "Cloth colliders");
		g(i.filter((e) => !Object.hasOwn(e ?? {}, "attach") && !Object.hasOwn(e ?? {}, "armature")), w, "Cloth colliders on fixed nodes"), r.colliders = i.map((e) => G(e, n, t));
		let a = Z(r, t).length;
		if (a > T) throw RangeError(`Cloth moving colliders are limited to ${T} balls and capsules, counting one per armature bone; this has ${a}.`);
	}
	return r;
}
function K(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < e.length; r += 3) for (let i = 0; i < 3; i++) t[i] = Math.min(t[i], e[r + i]), n[i] = Math.max(n[i], e[r + i]);
	return {
		minimum: t,
		maximum: n
	};
}
function q(e) {
	return n(t(), e.rotation, e.translation, e.scale);
}
function J(e, t, n) {
	let r = q(t), { minimum: i, maximum: a } = K(n.positions), o = i.map((e, t) => (e + a[t]) / 2), s = i.map((e, n) => Math.max((a[n] - e) / 2 * Math.abs(t.scale[n]), 1e-4)), c = [
		r[0] * o[0] + r[4] * o[1] + r[8] * o[2] + r[12],
		r[1] * o[0] + r[5] * o[1] + r[9] * o[2] + r[13],
		r[2] * o[0] + r[6] * o[1] + r[10] * o[2] + r[14]
	];
	return e.shape === "ball" ? {
		kind: "ball",
		center: c,
		radius: Math.max(...s)
	} : {
		kind: "box",
		center: c,
		axes: [
			0,
			1,
			2
		].map((e) => {
			let t = [
				r[e * 4],
				r[e * 4 + 1],
				r[e * 4 + 2]
			], n = Math.hypot(...t);
			return t.map((e) => e / n);
		}),
		halfExtents: s
	};
}
function Y(e, t) {
	if (!e.pinGroup) return null;
	let n = t.vertexGroups?.[e.pinGroup];
	if (!n) {
		let n = Object.keys(t.vertexGroups ?? {});
		throw RangeError(`Cloth pinGroup ${e.pinGroup} is not a vertex group of ${e.node}. Known groups: ${n.join(", ") || "none"}. Make one with a vertex_group mesh edit.`);
	}
	return n;
}
function X(e, t, n, r = null) {
	if (!n?.length && !r) return [];
	let i = t.map((t) => e.subarray(t * 3, t * 3 + 3)), { minimum: a, maximum: o } = K(i.reduce((e, t) => [...e, ...t], [])), s = L * Math.max(o[0] - a[0], o[1] - a[1], 1e-6), c = (e, t, n) => Math.abs(e[t] - (n === "min" ? a[t] : o[t])) <= s, l = {
		top: (e) => c(e, 1, "max"),
		bottom: (e) => c(e, 1, "min"),
		left: (e) => c(e, 0, "min"),
		right: (e) => c(e, 0, "max"),
		topLeft: (e) => c(e, 1, "max") && c(e, 0, "min"),
		topRight: (e) => c(e, 1, "max") && c(e, 0, "max"),
		bottomLeft: (e) => c(e, 1, "min") && c(e, 0, "min"),
		bottomRight: (e) => c(e, 1, "min") && c(e, 0, "max")
	}, u = [];
	return i.forEach((e, i) => {
		let a = n?.some((t) => l[t](e)), o = r !== null && r[t[i]] >= R;
		(a || o) && u.push(i);
	}), u;
}
function Z(e, t) {
	let n = new Map(t.nodes.map((e) => [e.id, e])), r = [];
	for (let i of e.colliders ?? []) if (i.attach !== void 0) {
		let e = [
			0,
			0,
			0
		];
		r.push(i.shape === "ball" ? {
			kind: "ball",
			node: i.attach,
			offset: i.offset ?? e,
			radius: i.radius
		} : {
			kind: "capsule",
			startNode: i.attach,
			startOffset: i.offset ?? e,
			endNode: i.to,
			endOffset: i.toOffset ?? e,
			radius: i.radius
		});
	} else i.armature !== void 0 && r.push(...oe(i, t, n));
	return r;
}
function oe(e, n, s) {
	let c = n.armatures.find((t) => t.id === e.armature), l = x(c.id, s), u = ee(c), d = new Set(e.exclude ?? []), f = [];
	return c.bones.forEach((n, p) => {
		if (d.has(n.name)) return;
		let m = b(c, n.name), h = x(m, s), g = o(i(), [
			0,
			0,
			0
		], h), _ = o(i(), u[p], l), v = a(g, _);
		if (v < ie) return;
		let y = o(i(), _, r(t(), h));
		f.push({
			kind: "capsule",
			startNode: m,
			startOffset: [
				0,
				0,
				0
			],
			endNode: m,
			endOffset: Array.from(y),
			radius: v * (e.radiusFraction ?? te)
		});
	}), f;
}
function se(r, i) {
	let a = new Map(r.nodes.map((e) => [e.id, e]));
	return function(r) {
		let o = i ? i.sample(r).nodes : B, s = /* @__PURE__ */ new Map(), c = (r) => {
			let i = s.get(r);
			if (!i) {
				let l = a.get(r), u = o.get(r);
				i = n(t(), u?.rotation ?? l.rotation, u?.translation ?? l.translation, u?.scale ?? l.scale), l.parent !== null && e(i, c(l.parent), i), s.set(r, i);
			}
			return i;
		};
		return c;
	};
}
function ce(e) {
	let t = [];
	for (let n = 1; n < e; n++) for (let e = 1; e <= u.substeps; e++) t.push((n - 1 + e / u.substeps) / S);
	return t;
}
function le(e, t, n) {
	let r = new Float64Array(n.length * e.length * 7), a = i(), s = (e, t, n, i) => {
		o(a, i, t(n)), r.set(a, e);
	};
	return n.forEach((n, i) => {
		let a = t(n);
		e.forEach((t, n) => {
			let o = (i * e.length + n) * 7, c = t.kind === "ball";
			s(o, a, c ? t.node : t.startNode, c ? t.offset : t.startOffset), s(o + 3, a, c ? t.node : t.endNode, c ? t.offset : t.endOffset), r[o + 6] = t.radius;
		});
	}), r;
}
function ue(e, n, a, s, c) {
	let l = r(t(), s(0)(e.node)), u = n.map((e) => o(i(), a.subarray(e * 3, e * 3 + 3), l)), d = new Float64Array(c.length * n.length * 3), f = i();
	return c.forEach((t, r) => {
		let i = s(t)(e.node);
		u.forEach((e, t) => {
			o(f, e, i), d.set(f, (r * n.length + t) * 3);
		});
	}), d;
}
function Q(e, t, n, r, i) {
	let { specs: a, worldMatricesAt: o } = r, s = ce(i);
	r.colliderTrack ??= le(a, o, s);
	let c = Uint32Array.from(e.pinTo ? t : []);
	return {
		anchorParticles: c,
		anchorWeights: new Float64Array(c.length).fill(e.pinTo?.weight ?? 1),
		anchorTrack: e.pinTo ? ue(e.pinTo, t, n, o, s) : /* @__PURE__ */ new Float64Array(),
		colliderCount: a.length,
		colliderTrack: r.colliderTrack
	};
}
function de(e, n, i, a, o, l, u) {
	let d = f(a.positions, a.indices), p = q(i), m = new Float64Array(d.representatives.length * 3);
	d.representatives.forEach((e, t) => {
		let n = a.positions.subarray(e * 3, e * 3 + 3), r = [
			0,
			0,
			0
		];
		for (let e = 0; e < 3; e++) r[e] = p[e] * n[0] + p[4 + e] * n[1] + p[8 + e] * n[2] + p[12 + e];
		m.set(r, t * 3);
	});
	let h = X(a.positions, d.representatives, e.pin, Y(e, a)), g = u && (e.pinTo || u.specs.length) ? Q(e, h, m, u, l) : null, _ = Object.freeze({ ...s("cloth", [
		m,
		d.triangles,
		{
			pinned: e.pinTo ? [] : h,
			moving: g,
			gravity: n.gravity,
			wind: n.wind,
			fields: n.fields,
			stiffness: e.stiffness,
			bend: e.bend,
			density: e.density,
			damping: e.damping,
			friction: e.friction,
			thickness: e.thickness,
			colliders: o,
			frameCount: l,
			framesPerSecond: S
		}
	], c) });
	return {
		recording: _,
		welded: d,
		inverse: r(t(), p),
		geometry: a,
		particleScratch: new Float32Array(_.particleCount * 3),
		live: fe(a)
	};
}
var $ = /* @__PURE__ */ new WeakSet();
function fe(e) {
	let t = Object.freeze({
		...e,
		positions: Float32Array.from(e.positions),
		normals: Float32Array.from(e.normals)
	});
	return $.add(t), t;
}
function pe(e) {
	return $.has(e);
}
function me(e, t) {
	let { recording: n, welded: r, inverse: i, geometry: a, particleScratch: o, live: s } = e;
	d(n, t, o);
	let c = s.positions;
	for (let e = 0; e < r.particleOfVertex.length; e++) {
		let t = r.particleOfVertex[e] * 3;
		for (let n = 0; n < 3; n++) c[e * 3 + n] = i[n] * o[t] + i[4 + n] * o[t + 1] + i[8 + n] * o[t + 2] + i[12 + n];
	}
	return s.normals.set(p(a, c)), s;
}
function he(e, t, n) {
	let { recording: r, welded: i, geometry: a } = e, o = new Float32Array(r.particleCount * 3);
	d(r, Infinity, o);
	let s = [
		Infinity,
		Infinity,
		Infinity
	], c = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let e = 0; e < o.length; e += 3) for (let t = 0; t < 3; t++) s[t] = Math.min(s[t], o[e + t]), c[t] = Math.max(c[t], o[e + t]);
	let l = (e) => e.map((e) => Number(e.toFixed(4)));
	return {
		node: t.id,
		particles: r.particleCount,
		triangles: i.triangles.length / 3,
		vertices: a.positions.length / 3,
		pinned: X(a.positions, i.representatives, n.pin, Y(n, a)).length,
		finalBoundsMin: l(s),
		finalBoundsMax: l(c)
	};
}
function ge(e, t, n, r = null) {
	let i = new Map(t.nodes.map((e) => [e.id, e])), a = Math.round(e.duration * S) + 1, o = Z(e, t), s = o.length > 0 || e.sheets.some((e) => e.pinTo) ? {
		specs: o,
		worldMatricesAt: se(t, r)
	} : null, c = (e.colliders ?? []).filter((e) => e.node !== void 0).map((e) => J(e, i.get(e.node), n.get(i.get(e.node).geometry))), l = new Map(e.sheets.map((t) => {
		let r = i.get(t.node);
		return [t.node, de(t, e, r, n.get(r.geometry), c, a, s)];
	})), u = null;
	return Object.freeze({
		duration: e.duration,
		sample(t) {
			if (t <= 0) return null;
			let n = Math.min(t, e.duration);
			return new Map([...l].map(([e, t]) => [e, me(t, n)]));
		},
		report() {
			return u ??= {
				duration: e.duration,
				frames: a,
				gravity: e.gravity ?? [
					0,
					-9.81,
					0
				],
				wind: e.wind ?? [
					0,
					0,
					0
				],
				fields: e.fields ?? [],
				sheets: e.sheets.map((e) => he(l.get(e.node), i.get(e.node), e))
			}, structuredClone(u);
		}
	});
}
export { ge as bakeAgentCloth, pe as isLiveClothGeometry, Z as movingColliderSpecs, ae as normalizeAgentCloth };
