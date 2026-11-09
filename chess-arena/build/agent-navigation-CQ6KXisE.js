/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { createNavmesh as e } from "./navmesh.js";
// src/agent-navigation.js
var t = [
	"ground",
	"from",
	"to",
	"avoid",
	"radius",
	"maxSlope",
	"cellSize",
	"seconds",
	"speed",
	"lift",
	"spacing"
], n = 1.4, r = 100;
function i(e) {
	return Math.round(e * 1e3) / 1e3;
}
function a(e, t, n, r) {
	if (e !== void 0) {
		if (!Number.isFinite(e) || e < n || e > r) throw RangeError(`path ${t} must be a number from ${n} to ${r}.`);
		return e;
	}
}
function o(t, o, s) {
	let c = a(t.seconds, "seconds", .1, 600), l = a(t.speed, "speed", .01, 100);
	if (c !== void 0 && l !== void 0) throw RangeError("path takes seconds or speed, not both.");
	let u = a(t.lift, "lift", -100, r) ?? 0, d = e({
		positions: o.positions,
		indices: o.indices,
		agentRadius: a(t.radius, "radius", .01, 100),
		maxSlopeDegrees: a(t.maxSlope, "maxSlope", 1, 89),
		cellSize: a(t.cellSize, "cellSize", .05, 100),
		obstacles: s.map((e) => ({
			min: [e.min[0], e.min[2]],
			max: [e.max[0], e.max[2]]
		}))
	}), f = d.findPath(t.from, t.to, { spacing: a(t.spacing, "spacing", .1, 100) }), p = c ?? f.length / (l ?? n), m = 0, h = f.points.map((e, t) => {
		t > 0 && (m += Math.hypot(e[0] - f.points[t - 1][0], e[2] - f.points[t - 1][2]));
		let n = f.length > 0 ? m / f.length : 0;
		return {
			time: i(p * n),
			value: [
				i(e[0]),
				i(e[1] + u),
				i(e[2])
			]
		};
	});
	return {
		length: i(f.length),
		seconds: i(p),
		cellSize: d.cellSize,
		agentRadius: d.agentRadius,
		searchNodes: f.searchNodes,
		keyframes: h
	};
}
function s(e, n, r) {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError("path must be an object.");
	for (let n of Object.keys(e)) if (!t.includes(n)) throw TypeError(`Unknown path field: ${n}. Allowed fields: ${t.join(", ")}.`);
	if (e.avoid !== void 0 && (!Array.isArray(e.avoid) || e.avoid.length > 64)) throw RangeError("path avoid must list at most 64 node IDs.");
	let { geometry: i, worldMatrix: a } = n(e.ground, "ground"), s = new Float32Array(i.positions.length);
	for (let e = 0; e < s.length; e += 3) for (let t = 0; t < 3; t++) s[e + t] = a[t] * i.positions[e] + a[4 + t] * i.positions[e + 1] + a[8 + t] * i.positions[e + 2] + a[12 + t];
	let c = (e.avoid ?? []).map((e) => {
		let t = n(e, "avoid");
		return r(t.geometry, t.worldMatrix);
	});
	return o(e, {
		positions: s,
		indices: i.indices
	}, c);
}
export { t as NAVIGATION_FIELDS, o as queryAgentPath, s as resolvePathQuery };
