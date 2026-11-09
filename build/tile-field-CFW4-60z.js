/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
function e(e, t, n) {
	let r = Math.imul(t + 7919, 374761393) ^ Math.imul(n - 104729, 668265263) ^ Math.imul(e, 2246822519);
	return r = Math.imul(r ^ r >>> 13, 1274126177), (r ^ r >>> 16) >>> 0;
}
function t(e) {
	return new Float32Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		e.tileX,
		0,
		e.tileZ,
		1
	]);
}
function n({ area: e, tileSize: t, levels: n, cullDistance: r, terrainHeight: i, buildParts: a }) {
	let o = Math.ceil((e.maxX - e.minX) / t), s = Math.ceil((e.maxZ - e.minZ) / t), c = [];
	for (let n = 0; n < s; n++) for (let r = 0; r < o; r++) {
		let a = e.minX + r * t, o = e.minZ + n * t, s = a + t / 2, l = o + t / 2;
		c.push({
			column: r,
			row: n,
			tileX: a,
			tileZ: o,
			centerX: s,
			centerZ: l,
			centerY: i(s, l),
			level: -1,
			cache: {},
			parts: []
		});
	}
	function l(e, i) {
		let a = Math.max(0, Math.hypot(i[0] - e.centerX, i[1] - e.centerY, i[2] - e.centerZ) - t * .5);
		if (a > r) return -1;
		let o = n.findIndex((e) => a <= e.distance);
		return o === -1 && (o = n.length - 1), e.level >= 0 && o > e.level && a <= n[e.level].distance * 1.1 ? e.level : o;
	}
	let u = [];
	function d(e) {
		if (!e || e.length < 3 || ![
			e[0],
			e[1],
			e[2]
		].every(Number.isFinite)) throw TypeError("update needs an eye position [x, y, z].");
		let t = !1;
		for (let n of c) {
			let r = l(n, e);
			r !== n.level && (t = !0, n.level = r, n.parts = r === -1 ? [] : a(n, r));
		}
		return t && (u = c.flatMap((e) => e.parts)), t;
	}
	function f() {
		let e = n.map(() => 0), t = 0, r = 0, i = 0;
		for (let n of c) if (n.parts.length !== 0) {
			t += 1, e[n.level] += 1;
			for (let e of n.parts) r += e.geometry.indices.length / 3, i += e.geometry.positions.length / 3;
		}
		return {
			tiles: c.length,
			visibleTiles: t,
			levelCounts: e,
			triangles: r,
			vertices: i,
			geometryBytes: i * 11 * 4 + r * 12
		};
	}
	return {
		get parts() {
			return u;
		},
		update: d,
		stats: f
	};
}
export { e as n, t as r, n as t };
