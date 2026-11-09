/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/agent-drive-schema.js
var e = Object.freeze({
	maxPathPoints: 512,
	maxLegs: 32,
	maxWheels: 8,
	maxNodeReferences: 64,
	maxLights: 16
}), t = [
	"path",
	"legs",
	"speed",
	"cruiseSpeed",
	"acceleration",
	"braking",
	"startSpeed",
	"endSpeed",
	"maxLateralAcceleration",
	"startTime",
	"steering",
	"maxSteerAngle",
	"fullBrakeDeceleration",
	"rollGain",
	"pitchGain",
	"wheels",
	"body",
	"forwardAxis",
	"wheelbase",
	"lights"
], n = t.slice(2, 9).concat([
	"startTime",
	"maxSteerAngle",
	"fullBrakeDeceleration",
	"rollGain",
	"pitchGain",
	"wheelbase"
]), r = [
	"id",
	"node",
	"nodes",
	"side",
	"axle",
	"radius",
	"center",
	"steerable",
	"spinSign"
], i = ["headlights", "tailLights"], a = [
	"id",
	"position",
	"direction"
], o = [
	"id",
	"material",
	"signal",
	"off",
	"on"
], s = [
	"duration",
	"loop",
	"eye"
];
function c(e, t, n) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`${n} must be an object.`);
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`Unknown ${n} field: ${r}. Allowed fields: ${t.join(", ")}.`);
}
function l(e, t) {
	if (!Array.isArray(e) || e.length !== 3 || e.some((e) => !Number.isFinite(e))) throw TypeError(`${t} must be three finite numbers.`);
	return [...e];
}
function u(e, t) {
	if (typeof e != "string" || !e || e.length > 256) throw TypeError(`${t} must be a node label or id of 1 to 256 characters.`);
	return e;
}
function d(t, n) {
	if (Array.isArray(t)) {
		if (t.length < 2 || t.length > e.maxPathPoints) throw RangeError(`${n} needs 2 to ${e.maxPathPoints} points.`);
		return t.map((e, t) => l(e, `${n} point ${t}`));
	}
	if (c(t, s, n), !t.eye || !Array.isArray(t.eye.keyframes) || t.eye.keyframes.length > e.maxPathPoints) throw TypeError(`${n} is an array of [x, y, z] points or a camera path { duration, eye: { keyframes } }.`);
	return structuredClone(t);
}
function f(t) {
	if (t === "auto") return t;
	if (!Array.isArray(t) || t.length < 2 || t.length > e.maxWheels) throw RangeError(`wheels is 'auto' or a list of 2 to ${e.maxWheels} wheels.`);
	return t.map((t, n) => {
		c(t, r, `wheel ${n}`);
		let i = t.nodes ?? [t.node];
		if (!Array.isArray(i) || !i.length || i.length > e.maxNodeReferences) throw TypeError(`wheel ${n} needs a node, or nodes listing tire, hub and bolts.`);
		return i.forEach((e) => u(e, `wheel ${n} node`)), structuredClone(t);
	});
}
function p(t) {
	c(t, i, "drive lights");
	let n = {};
	if (t.headlights !== void 0) {
		if (!Array.isArray(t.headlights) || t.headlights.length > e.maxLights) throw RangeError(`headlights lists at most ${e.maxLights} lamps.`);
		n.headlights = t.headlights.map((e, t) => {
			c(e, a, `headlight ${t}`);
			let n = { position: l(e.position, `headlight ${t} position`) };
			return e.id !== void 0 && (n.id = String(e.id)), e.direction !== void 0 && (n.direction = l(e.direction, `headlight ${t} direction`)), n;
		});
	}
	if (t.tailLights !== void 0) {
		if (!Array.isArray(t.tailLights) || t.tailLights.length > e.maxLights) throw RangeError(`tailLights lists at most ${e.maxLights} lamps.`);
		n.tailLights = t.tailLights.map((e, t) => {
			if (c(e, o, `tail light ${t}`), typeof e.material != "string" || !e.material) throw TypeError(`tail light ${t} needs the material id whose emission it drives.`);
			if (e.signal !== "brake" && e.signal !== "reverse") throw RangeError(`tail light ${t} signal must be brake or reverse.`);
			return structuredClone(e);
		});
	}
	return n;
}
function m(r) {
	if (c(r, t, "drive"), r.path === void 0 == (r.legs === void 0)) throw TypeError("A drive needs exactly one of path or legs.");
	let i = {};
	if (r.path !== void 0 && (i.path = d(r.path, "drive path")), r.legs !== void 0) {
		if (!Array.isArray(r.legs) || !r.legs.length || r.legs.length > e.maxLegs) throw RangeError(`legs lists 1 to ${e.maxLegs} legs.`);
		i.legs = r.legs.map((e, t) => {
			if (c(e, [
				"path",
				"direction",
				"pause"
			], `leg ${t}`), e.direction !== void 0 && e.direction !== "forward" && e.direction !== "reverse") throw RangeError(`leg ${t} direction must be forward or reverse.`);
			return {
				...structuredClone(e),
				path: d(e.path, `leg ${t} path`)
			};
		});
	}
	for (let e of n) if (r[e] !== void 0) {
		if (!Number.isFinite(r[e])) throw TypeError(`drive ${e} must be a finite number.`);
		i[e] = r[e];
	}
	if (r.steering !== void 0) {
		if (r.steering !== "ackermann" && r.steering !== "shared") throw RangeError("drive steering must be 'ackermann' or 'shared'.");
		i.steering = r.steering;
	}
	if (r.forwardAxis !== void 0) {
		if (![
			"+x",
			"-x",
			"+z",
			"-z"
		].includes(r.forwardAxis)) throw RangeError("drive forwardAxis must be +x, -x, +z or -z.");
		i.forwardAxis = r.forwardAxis;
	}
	if (r.wheels !== void 0 && (i.wheels = f(r.wheels)), r.body !== void 0) {
		if (!Array.isArray(r.body) || !r.body.length || r.body.length > e.maxNodeReferences) throw RangeError(`drive body lists 1 to ${e.maxNodeReferences} nodes.`);
		i.body = r.body.map((e) => u(e, "drive body node"));
	}
	return r.lights !== void 0 && (i.lights = p(r.lights)), i;
}
export { m as t };
