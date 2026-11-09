/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t, o as n, p as r } from "./mat4-BCZClxna.js";
import { a as i, x as a } from "./vec3-BRYC6f_g.js";
// src/agent-relations.js
var o = Object.freeze([
	"attach",
	"flush",
	"align",
	"centered",
	"gap"
]), s = Object.freeze([
	"+x",
	"-x",
	"+y",
	"-y",
	"+z",
	"-z"
]), c = Object.freeze({
	maxPerNode: 8,
	maxNodes: 256,
	maxOffset: 1e6
}), l = Object.freeze([
	"x",
	"y",
	"z"
]), u = Object.freeze([
	"min",
	"center",
	"max"
]), d = Object.freeze({
	attach: ["side", "offset"],
	gap: ["side", "offset"],
	flush: ["side", "offset"],
	align: [
		"axis",
		"at",
		"offset"
	],
	centered: ["axes"]
});
function f(e) {
	return l.indexOf(e);
}
function p(e) {
	return f(e[1]);
}
function m(e, t, n) {
	return `Relation ${t} of node ${JSON.stringify(e.slice(0, 48))} (${n.kind} to ${JSON.stringify(String(n.to).slice(0, 48))})`;
}
function h(e, t, n) {
	if (!n || typeof n != "object" || Array.isArray(n)) throw TypeError(`Relation ${t} of node ${e.id} must be an object such as { "kind": "attach", "to": "body", "side": "+x" }.`);
	if (!o.includes(n.kind)) throw TypeError(`Relation ${t} of node ${e.id} has kind ${JSON.stringify(String(n.kind).slice(0, 48))}. Use one of ${o.join(", ")}.`);
	let r = [
		"kind",
		"to",
		"region",
		...d[n.kind] ?? []
	];
	for (let i of Object.keys(n)) if (!r.includes(i)) throw TypeError(`${m(e.id, t, n)} has unknown field ${JSON.stringify(i.slice(0, 48))}. A ${n.kind} relation takes: ${r.join(", ")}.`);
	if (typeof n.to != "string" || !n.to) throw TypeError(`${m(e.id, t, n)} needs "to", the ID of the part it is placed against.`);
	if (n.region !== void 0 && (typeof n.region != "string" || !n.region || n.region.length > 128)) throw TypeError(`${m(e.id, t, n)} region must be a mesh tag name of at most 128 characters.`);
	let i = n.offset ?? 0;
	if (!Number.isFinite(i) || Math.abs(i) > c.maxOffset) throw RangeError(`${m(e.id, t, n)} offset must be a finite number of metres within +-${c.maxOffset}.`);
	let a = {
		kind: n.kind,
		to: n.to
	};
	if (n.region !== void 0 && (a.region = n.region), i !== 0 && (a.offset = i), d[n.kind].includes("side")) {
		if (!s.includes(n.side)) throw TypeError(`${m(e.id, t, n)} needs side, one of ${s.join(", ")}: the face of "${n.to}" it sits against.`);
		a.side = n.side;
	}
	if (n.kind === "align") {
		if (!l.includes(n.axis) || !u.includes(n.at)) throw TypeError(`${m(e.id, t, n)} needs axis (x, y or z) and at (${u.join(", ")}).`);
		a.axis = n.axis, a.at = n.at;
	}
	if (n.kind === "centered") {
		let r = n.axes ?? l;
		if (!Array.isArray(r) || r.length === 0 || r.length > 3 || r.some((e) => !l.includes(e)) || new Set(r).size !== r.length) throw TypeError(`${m(e.id, t, n)} axes must list each of x, y, z at most once, or be left out for all three.`);
		a.axes = [...r].sort();
	}
	return a;
}
function g(e) {
	switch (e.kind) {
		case "attach": return [
			0,
			1,
			2
		];
		case "gap":
		case "flush": return [p(e.side)];
		case "align": return [f(e.axis)];
		default: return e.axes.map(f);
	}
}
function _(e, t) {
	let n = [], r = /* @__PURE__ */ new Set(), i = [];
	function a(o) {
		if (r.has(o)) return;
		let s = i.indexOf(o);
		if (s !== -1) {
			let e = [...i.slice(s), o].map((e) => JSON.stringify(e.slice(0, 48))).join(" -> ");
			throw RangeError(`Relations form a cycle: ${e} (each part waits for the next, parents included). Remove one relation in the loop with set-node relations, or place one part with translation instead.`);
		}
		i.push(o);
		let c = e.get(o);
		c.parent !== null && e.has(c.parent) && a(c.parent);
		for (let e of c.relations ?? []) a(e.to);
		i.pop(), r.add(o), t.has(o) && n.push(o);
	}
	for (let e of t) a(e);
	return n;
}
function v(e) {
	return new Map(e.map((e) => [e.id, e]));
}
function y(e) {
	let t = e.filter((e) => e.relations !== void 0);
	if (t.length === 0) return e;
	let n = v(e), r = e.map((e) => ({ ...e })), i = v(r), a = 0;
	for (let e of t) {
		if (!Array.isArray(e.relations) || e.relations.length > c.maxPerNode) throw RangeError(`Node ${e.id} relations must be an array of at most ${c.maxPerNode} entries. Merge or drop relations.`);
		let t = e.relations.map((t, n) => h(e, n, t)), r = i.get(e.id);
		if (t.length === 0) {
			delete r.relations;
			continue;
		}
		if (a++, a > c.maxNodes) throw RangeError(`At most ${c.maxNodes} nodes can carry relations. Group repeated parts or place the rest with translation.`);
		if (e.geometry === void 0) throw TypeError(`Node ${e.id} is a group, and relations place mesh nodes. Put the relations on a mesh node inside the group.`);
		let o = /* @__PURE__ */ new Map();
		t.forEach((t, r) => {
			let i = n.get(t.to);
			if (t.to === e.id) throw RangeError(`${m(e.id, r, t)} points at its own node. Point "to" at another part.`);
			if (!i) throw RangeError(`${m(e.id, r, t)}: no node has that ID. Use a node ID from scene_inspect, or drop the relation.`);
			if (i.geometry === void 0) throw RangeError(`${m(e.id, r, t)}: the target is a group with no geometry. Point "to" at a mesh node.`);
			for (let n of g(t)) {
				if (o.has(n)) throw RangeError(`${m(e.id, r, t)} decides the ${l[n]} axis, which relation ${o.get(n)} already decides. Keep one relation per axis.`);
				o.set(n, r);
			}
		}), r.relations = t;
	}
	return _(i, new Set(t.filter((e) => i.get(e.id).relations).map((e) => e.id))), r;
}
function b(r, i, a) {
	let o = a.get(r);
	if (o) return o;
	let s = i.get(r), c = n(t(), s.rotation, s.translation, s.scale), l = s.parent !== null && i.has(s.parent) ? e(c, b(s.parent, i, a), c) : c;
	return a.set(r, l), l;
}
function x(e, t, n) {
	return n === "min" ? e.min[t] : n === "max" ? e.max[t] : (e.min[t] + e.max[t]) / 2;
}
function S(e, t, n) {
	let r = e.offset ?? 0, i = [], a = (e) => ({
		axis: p(e),
		outward: e[0] === "+"
	});
	if (e.kind === "gap" || e.kind === "attach") {
		let { axis: t, outward: o } = a(e.side);
		i.push(o ? {
			axis: t,
			anchor: "min",
			value: n.max[t] + r
		} : {
			axis: t,
			anchor: "max",
			value: n.min[t] - r
		});
	}
	if (e.kind === "attach") {
		let { axis: t } = a(e.side);
		for (let e of [
			0,
			1,
			2
		].filter((e) => e !== t)) i.push({
			axis: e,
			anchor: "center",
			value: x(n, e, "center")
		});
	}
	if (e.kind === "flush") {
		let { axis: t, outward: o } = a(e.side), s = o ? "max" : "min";
		i.push({
			axis: t,
			anchor: s,
			value: x(n, t, s) + r
		});
	}
	if (e.kind === "align") {
		let t = f(e.axis);
		i.push({
			axis: t,
			anchor: e.at,
			value: x(n, t, e.at) + r
		});
	}
	if (e.kind === "centered") for (let t of e.axes.map(f)) i.push({
		axis: t,
		anchor: "center",
		value: x(n, t, "center")
	});
	return i.map((e) => ({
		...e,
		delta: e.value - x(t, e.axis, e.anchor)
	}));
}
function C(e, n) {
	let o = e.filter((e) => e.relations?.length);
	if (o.length === 0) return e;
	let s = e.map((e) => ({ ...e })), c = v(s), l = /* @__PURE__ */ new Map();
	for (let e of _(c, new Set(o.map((e) => e.id)))) {
		let o = c.get(e), s = [
			0,
			0,
			0
		], u = n(o, b(e, c, l), void 0);
		o.relations.forEach((t, r) => {
			let i = c.get(t.to), a;
			try {
				a = n(i, b(i.id, c, l), t.region);
			} catch (n) {
				throw RangeError(`${m(e, r, t)} cannot be satisfied: ${n.message}`);
			}
			for (let e of S(t, u, a)) s[e.axis] = e.delta;
		});
		let d = o.parent !== null && c.has(o.parent) ? b(o.parent, c, l) : t(), f = r(t(), d);
		if (!f) throw RangeError(`Node ${e} sits under a parent with a singular transform, so its relations cannot be solved. Fix the parent scale.`);
		let p = a(i(), s, f), h = a(i(), [
			0,
			0,
			0
		], f);
		if (o.translation = o.translation.map((e, t) => e + p[t] - h[t]), !o.translation.every(Number.isFinite)) throw RangeError(`Relations on node ${e} produce a translation outside the number range. Reduce offsets or part sizes.`);
		l.clear();
	}
	return s;
}
export { o as RELATION_KINDS, c as RELATION_LIMITS, s as RELATION_SIDES, y as normalizeRelations, g as relationAxes, C as solveRelations };
