/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/update-part-vertices.js
function e(e, t, n, r) {
	if (!(t instanceof Float32Array) || t.length !== n) throw TypeError(`updatePartVertices ${e} must be a Float32Array of ${n} numbers (3 per vertex, the vertex count of ${r}).`);
}
function t(e) {
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
	let r = t.map((e, t) => (e + n[t]) / 2), i = 0;
	for (let t = 0; t < e.length; t += 3) i = Math.max(i, (e[t] - r[0]) ** 2 + (e[t + 1] - r[1]) ** 2 + (e[t + 2] - r[2]) ** 2);
	return {
		center: r,
		radius: Math.sqrt(i)
	};
}
function n(n, r, i, a) {
	let o = n.partLocations.get(r);
	if (!o) throw Error(`Unknown part identity: ${r?.name}`);
	let s = o.geometry;
	if (r.geometry !== s) throw Error(`Geometry changes require replaceParts: ${r.name}`);
	if (o.skin || o.morph || o.morphTargets || o.batch.crowd || r.lods) throw Error(`updatePartVertices takes rigid parts without level-of-detail sets: ${r.name}`);
	e("positions", i, s.positions.length, r.name), a !== void 0 && e("normals", a, s.normals.length, r.name);
	let c = n.geometryBuffers.get(s), l = n.context;
	for (let [e, t] of [["positions", i], ["normals", a]]) t && (t !== s[e] && s[e].set(t), l.bindBuffer(l.ARRAY_BUFFER, c.get(e)), l.bufferSubData(l.ARRAY_BUFFER, 0, s[e]));
	return o.batch.bounds = t(s.positions), n.shadowsDirty = !0, r;
}
export { n as updatePartVertices };
