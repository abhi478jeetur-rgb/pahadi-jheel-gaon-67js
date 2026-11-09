/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import "./world-material-shader.js";
import { n as e } from "./terrain-CgaLbvb-.js";
// src/agent-terrain.js
var t = Object.freeze({
	size: [1, 2e3],
	resolution: [2, 256],
	amplitude: [0, 200],
	defaultSize: 40,
	defaultResolution: 64,
	defaultAmplitude: 1,
	maximumHoles: 16
});
function n(e, t, [n, r], i) {
	let a = e ?? t;
	if (!Number.isFinite(a) || a < n || a > r) throw RangeError(`terrain ${i} must be a number within ${n} and ${r}.`);
	return a;
}
function r(e, t, [r, i], a) {
	let o = n(e, t, [r, i], a);
	if (!Number.isInteger(o)) throw RangeError(`terrain ${a} must be a whole number.`);
	return o;
}
function i(e) {
	let i = r(e.resolution, t.defaultResolution, t.resolution, "resolution");
	if (n(e.size, t.defaultSize, t.size, "size"), n(e.amplitude, t.defaultAmplitude, t.amplitude, "amplitude"), e.holes !== void 0 && (!Array.isArray(e.holes) || e.holes.length > t.maximumHoles)) throw RangeError(`terrain holes must be a list of at most ${t.maximumHoles} circles.`);
	return (i + 1) * (i + 1);
}
function a(n) {
	let r = n.size ?? t.defaultSize, i = Number.isInteger(n.seed) ? n.seed : 1;
	return e({
		size: r,
		chunks: 1,
		levels: 1,
		resolution: n.resolution ?? t.defaultResolution,
		seed: i,
		holes: n.holes,
		height: {
			amplitude: n.amplitude ?? t.defaultAmplitude,
			featureSize: r / 4,
			warp: 0,
			mountainMask: () => 0
		}
	});
}
function o(e, t) {
	let n = i(e);
	if (n > t) throw RangeError(`Terrain needs ${n} vertices, exceeding maxVertices ${t}. Lower resolution.`);
	return a(e).parts[0].geometry;
}
export { t as TERRAIN_LIMITS, a as createRecipeTerrain, o as generateTerrainGeometry, i as terrainVertexEstimate };
