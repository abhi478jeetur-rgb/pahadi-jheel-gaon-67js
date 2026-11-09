/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./camera-path-jvnqstYo.js";
import { createVehicleNodeOverrides as t, createVehicleRig as n, driveAlongLegs as r } from "./vehicle.js";
import { t as i } from "./agent-drive-schema-cTXeEd3n.js";
// src/agent-drive.js
function a(t) {
	return Array.isArray(t) ? t : e({
		loop: !1,
		...t
	});
}
function o(e) {
	return Number(e.toFixed(5));
}
function s(e, i, { materialIds: s = null } = {}) {
	let { path: c, legs: l, wheels: u, body: d, forwardAxis: f, wheelbase: p, lights: m = {}, ...h } = i, g = n({
		asset: e,
		wheels: u,
		body: d,
		forwardAxis: f,
		wheelbase: p,
		maxSteerAngle: h.maxSteerAngle,
		lights: { headlights: m.headlights }
	});
	for (let e of m.tailLights ?? []) if (s && !s.has(e.material)) throw RangeError(`Tail light material was not found: ${e.material}.`);
	let _ = r(g, (l ?? [{ path: c }]).map((e) => ({
		...e,
		path: a(e.path)
	})), h), v = m.tailLights ?? [];
	return Object.freeze({
		rig: g,
		duration: _.duration,
		length: _.length,
		sample(e) {
			let n = _.sample(e);
			return {
				pose: n,
				nodeOverrides: t(g, n),
				emissions: v.map((e) => ({
					material: e.material,
					emission: (e.off ?? 0) + ((e.on ?? 4) - (e.off ?? 0)) * n.lights[e.signal]
				}))
			};
		},
		describe(e) {
			return {
				wheels: g.wheels.map((e) => ({
					id: e.id,
					side: e.side,
					axle: e.axle,
					radius: o(e.radius),
					steerable: e.steerable,
					nodes: e.entries.map((e) => e.label)
				})),
				rejectedNames: g.rejectedNames,
				wheelbase: o(g.wheelbase),
				trackWidth: o(g.trackWidth),
				duration: o(_.duration),
				length: o(_.length),
				...e ? {
					lights: {
						brake: o(e.lights.brake),
						reverse: e.lights.reverse,
						headlights: e.lights.headlights.map((e) => ({
							id: e.id,
							position: e.position.map(o),
							direction: e.direction.map(o)
						}))
					},
					speed: o(e.speed),
					direction: e.direction
				} : {}
			};
		}
	});
}
export { s as createAssetDrive, i as normalizeDrive };
