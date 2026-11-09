/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/agent-recipe-checks.js
function e(e, t, n) {
	if (!e || Object.getPrototypeOf(e) !== Object.prototype) throw TypeError(`${n} must be a plain object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown or unsupported ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function t(e, t, n, r) {
	if (typeof e != "number" || !Number.isFinite(e) || !Number.isFinite(Math.fround(e)) || e < n || e > r) throw RangeError(`${t} must be a finite number within ${n} and ${r}.`);
	return e;
}
function n(e, n, r) {
	if (!Array.isArray(e) || e.length !== 3) throw TypeError(`${n} needs 3 numbers.`);
	return e.map((e) => t(e, n, -r, r));
}
function r(e, t, n) {
	if (!Array.isArray(e) || e.length > t) throw TypeError(`${n} must be an array of at most ${t} entries.`);
	return e;
}
function i(e, t, n, r, i, a, o = "cloth") {
	let s = typeof e == "string" ? t.get(e) : void 0;
	if (!s) throw RangeError(`${a} node was not found: ${String(e).slice(0, 64)}.`);
	if (s.geometry === void 0) throw RangeError(`${a} node ${e} has no geometry.`);
	if (s.parent !== null) throw RangeError(`${a} node ${e} must be a root node; reparent it first.`);
	if (n.has(e)) throw RangeError(`Node ${e} is used twice in ${o}.`);
	if (r.has(e) || i.has(e)) throw RangeError(`Node ${e} has a motion translation or rotation track or a physics body. ${a} needs a node that stays where it is.`);
	n.add(e);
}
var a = {
	cloth: (e) => [...e.sheets, ...e.colliders ?? []].map((e) => e.node),
	particles: (e) => e.systems.map((e) => e.node)
};
function o(e, t = []) {
	let n = /* @__PURE__ */ new Set();
	for (let r of t) e[r] && a[r](e[r]).forEach((e) => n.add(e));
	return {
		recipeNodes: new Map(e.nodes.map((e) => [e.id, e])),
		claimedNodes: n,
		motionNodeIds: new Set((e.motion?.tracks ?? []).filter((e) => e.kind === "node" && (e.property === "translation" || e.property === "rotation")).map((e) => e.id)),
		physicsNodeIds: new Set((e.physics?.bodies ?? []).map((e) => e.node))
	};
}
export { i as a, e as i, r as n, n as o, t as r, o as t };
